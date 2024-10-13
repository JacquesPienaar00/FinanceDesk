import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import crypto from 'crypto';

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

async function generateUniqueTicketNumber(db: Db) {
  const tickets = db.collection('tickets');

  while (true) {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(4).toString('hex');
    const ticketNumber = `TK-${timestamp}-${randomPart}`.toUpperCase();

    const existingTicket = await tickets.findOne({ number: ticketNumber });
    if (!existingTicket) {
      await tickets.insertOne({ number: ticketNumber, createdAt: new Date() });
      return ticketNumber;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getMongoClient();
    const session = await getServerSession(authOptions);
    const { text, sender, userInfo } = await request.json();

    const chatlogs = db.collection('chatlogs');

    const message = {
      text,
      sender,
      timestamp: new Date(),
    };

    let userId = session?.user?.email || userInfo?.email;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User identification not provided' },
        { status: 400 },
      );
    }

    let chatlog = await chatlogs.findOne({ userId: userId });
    let updateOperation: any = {};

    if (
      !chatlog ||
      !chatlog.tickets ||
      chatlog.tickets.every((ticket: { status: string }) => ticket.status === 'Closed')
    ) {
      const newTicketNumber = await generateUniqueTicketNumber(db);
      const newTicket = {
        number: newTicketNumber,
        status: 'Open',
        createdAt: new Date(),
        messages: [message],
      };

      updateOperation = {
        $push: { tickets: newTicket },
        $setOnInsert: {
          userId: userId,
          userName: session?.user?.name || userInfo?.name,
          createdAt: new Date(),
        },
      };
    } else {
      const openTicket = chatlog.tickets.find(
        (ticket: { status: string }) => ticket.status !== 'Closed',
      );
      if (openTicket) {
        updateOperation = {
          $push: { [`tickets.${chatlog.tickets.indexOf(openTicket)}.messages`]: message },
        };
      } else {
        // This case should not occur based on the previous check, but we'll handle it just in case
        const newTicketNumber = await generateUniqueTicketNumber(db);
        const newTicket = {
          number: newTicketNumber,
          status: 'Open',
          createdAt: new Date(),
          messages: [message],
        };
        updateOperation = {
          $push: { tickets: newTicket },
        };
      }
    }

    const result = await chatlogs.updateOne({ userId: userId }, updateOperation, { upsert: true });

    const updatedChatlog = await chatlogs.findOne({ userId: userId });

    return NextResponse.json(
      {
        success: true,
        id: result.upsertedId || userId,
        tickets: updatedChatlog?.tickets || [],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
  }
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
        { status: 400 },
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
      { status: 200 },
    );
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve messages' },
      { status: 500 },
    );
  }
}
