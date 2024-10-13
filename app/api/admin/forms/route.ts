// app/api/admin/forms/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { MongoClient } from 'mongodb';
import { authOptions } from '@/app/utils/authOptions';

const mongoUri = process.env.MONGODB_URI;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(mongoUri!);

  try {
    await client.connect();
    const db = client.db('conceptdesk');
    const forms = db.collection('coida-workmens-compensation-registration');

    const results = await forms.find({}).project({ _id: 1, name: 1 }).toArray();

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}