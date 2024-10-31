import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { MongoClient, ObjectId } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = session?.user?.email || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User identification not provided' },
        { status: 400 },
      );
    }

    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const tickets = db.collection('ServicesTickets');

    const result = await tickets.find({ userId: userId }).toArray();

    return NextResponse.json(
      {
        success: true,
        tickets: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error retrieving tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tickets' },
      { status: 500 },
    );
  } finally {
    await mongoClient.close();
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const formId = formData.get('formId') as string;
    const collectionName = formData.get('collectionName') as string;

    if (!formId || !collectionName) {
      return NextResponse.json(
        { message: 'Form ID and Collection Name are required' },
        { status: 400 },
      );
    }

    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(collectionName);

    const formDataObject: { [key: string]: any } = {};
    const fileUploads: { [key: string]: { blob: Blob; filename: string; s3Key: string } } = {};

    for (let [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        const filename = (value as any).name || `file-${Date.now()}`;
        const s3Key = `${collectionName}/${Date.now()}-${filename}`;
        fileUploads[key] = { blob: value, filename, s3Key };
      } else if (key.includes('[') && key.includes(']')) {
        const arrayKey = key.split('[')[0];
        if (!formDataObject[arrayKey]) {
          formDataObject[arrayKey] = [];
        }
        formDataObject[arrayKey].push(value);
      } else {
        try {
          formDataObject[key] = JSON.parse(value as string);
        } catch {
          formDataObject[key] = value;
        }
      }
    }

    // Upload files to S3 and get signed URLs
    const fileUrls: { [key: string]: string } = {};
    for (const [key, { blob, filename, s3Key }] of Object.entries(fileUploads)) {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        ContentType: blob.type,
      });

      const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600,
      });

      // Upload the file to S3
      const arrayBuffer = await blob.arrayBuffer();
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: Buffer.from(arrayBuffer),
        headers: {
          'Content-Type': blob.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file ${filename} to S3`);
      }

      fileUrls[key] = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    }

    const enrichedFormData = {
      ...formDataObject,
      userId: session.user.id,
      submittedAt: new Date(),
      fileUrls,
      status: 'open',
    };

    const result = await collection.insertOne(enrichedFormData);

    if (result.acknowledged) {
      await updateUserProfile(session.user.id, formId);

      return NextResponse.json({
        message: 'Form submitted successfully',
        formId,
        formSubmissionId: result.insertedId,
        fileUrls,
        collectionName,
      });
    } else {
      return NextResponse.json({ message: 'Failed to submit form' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await mongoClient.close();
  }
}

async function updateUserProfile(userId: string, formId: string) {
  const db = await mongoClient.db(process.env.MONGODB_DB_NAME);
  const usersCollection = db.collection('users');

  try {
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { completedForms: formId },
        $pull: { pfData: formId },
      },
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}
