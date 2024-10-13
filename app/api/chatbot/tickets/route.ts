import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

async function getMongoClient(): Promise<{ client: MongoClient; db: Db }> {
  const client = await clientPromise;
  const db = client.db('chatbotDB');
  return { client, db };
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await getMongoClient();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = session?.user?.email || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User identification not provided' },
        { status: 400 }
      );
    }

    const chatlogs = db.collection('chatlogs');

    const result = await chatlogs.findOne({ userId: userId });

    if (!result || !result.tickets || result.tickets.length === 0) {
      return NextResponse.json({ success: true, tickets: [] }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: true,
        tickets: result.tickets,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tickets' },
      { status: 500 }
    );
  }
}