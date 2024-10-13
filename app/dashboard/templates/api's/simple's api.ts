import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const contact = formData.get('contact') as string;
    const priorAnnualReturn = formData.get('priorAnnualReturn') as string;
    const annualTurnover = formData.get('annualTurnover') as string;
    const fileMoreReturns = formData.get('fileMoreReturns') as string;
    const collectionName = (formData.get('collectionName') as string) || 'SimpleRegistrations';

    if (
      !email ||
      !username ||
      !contact ||
      !priorAnnualReturn ||
      !annualTurnover ||
      !fileMoreReturns
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Connect to MongoDB
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(collectionName);

    // Store form data in the database
    const submission = await collection.insertOne({
      userId: session.user.id,
      email,
      username,
      contact,
      priorAnnualReturn,
      annualTurnover,
      fileMoreReturns,
      createdAt: new Date(),
    });

    await mongoClient.close();

    return NextResponse.json({
      success: true,
      data: {
        formSubmissionId: submission.insertedId,
      },
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ error: 'Failed to process form submission' }, { status: 500 });
  }
}
