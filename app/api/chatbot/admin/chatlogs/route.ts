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
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and is an admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await getMongoClient();
    const chatlogs = db.collection('chatlogs');

    const chatLogs = await chatlogs.find({}).toArray();

    return NextResponse.json({ chatLogs }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving chat logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve chat logs' }, { status: 500 });
  }
}
