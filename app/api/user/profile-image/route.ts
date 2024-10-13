import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const userImage = session.user.image;

    // If the user has a Google or Facebook image, redirect to it
    if (
      userImage &&
      (userImage.startsWith('https://lh3.googleusercontent.com/') ||
        userImage.startsWith('https://graph.facebook.com/'))
    ) {
      return NextResponse.redirect(userImage);
    }

    // Otherwise, fetch from S3
    const s3Key = `user/user-profile/${userId}/profile-image`;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error fetching profile image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const s3Key = `user/user-profile/${userId}/${uuidv4()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putCommand);

    // Generate a signed URL for the uploaded image
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    // Update the user's profile in the database with the new image URL
    // This part depends on your database setup. Here's a placeholder:
    // await updateUserProfile(userId, { image: s3Key })

    return NextResponse.json({ imageUrl: signedUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
