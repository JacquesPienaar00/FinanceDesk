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

export async function POST(request: NextRequest) {
  try {
    const { db } = await getMongoClient();
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has admin rights
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, ticketNumber, status } = body;

    if (!userId || !ticketNumber || !status) {
      return NextResponse.json(
        { success: false, error: 'User ID, ticket number, and new status are required' },
        { status: 400 },
      );
    }

    const chatlogs = db.collection('chatlogs');

    const result = await chatlogs.updateOne(
      { userId: userId, 'tickets.number': ticketNumber },
      { $set: { 'tickets.$.status': status } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    // Fetch the updated chatlog
    const updatedChatLog = await chatlogs.findOne({ userId: userId });

    if (!updatedChatLog) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated chat log' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: 'Ticket status updated successfully', chatLog: updatedChatLog },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket status' },
      { status: 500 },
    );
  }
}
