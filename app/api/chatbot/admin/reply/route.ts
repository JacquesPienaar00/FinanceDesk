import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

interface ChatMessage {
  _id?: ObjectId;
  text: string;
  sender: string;
  timestamp: Date;
}

interface ChatLog {
  _id?: ObjectId;
  userId: string;
  messages: ChatMessage[];
}

export async function POST(request: NextRequest) {
  const client = new MongoClient(uri);

  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, text, sender } = await request.json();

    // Validate input
    if (!userId || !text || !sender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await client.connect();
    const database = client.db('chatbotDB');
    const chatlogs = database.collection<ChatLog>('chatlogs');

    const message: ChatMessage = {
      text,
      sender,
      timestamp: new Date(),
    };

    const result = await chatlogs.findOneAndUpdate(
      { userId: userId },
      { $push: { messages: message } },
      { returnDocument: 'after', upsert: true },
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to update chat log' }, { status: 500 });
    }

    // Send the updated chat log as the response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function GET(request: NextRequest) {
  const client = new MongoClient(uri);

  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    await client.connect();
    const database = client.db('chatbotDB');
    const chatlogs = database.collection<ChatLog>('chatlogs');

    const chatlog = await chatlogs.findOne({ userId: userId });

    if (!chatlog) {
      return NextResponse.json({ error: 'Chat log not found' }, { status: 404 });
    }

    return NextResponse.json(chatlog, { status: 200 });
  } catch (error) {
    console.error('Error fetching chat log:', error);
    return NextResponse.json({ error: 'Failed to fetch chat log' }, { status: 500 });
  } finally {
    await client.close();
  }
}
