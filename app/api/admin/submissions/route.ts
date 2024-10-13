// app/api/admin/submissions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { MongoClient } from 'mongodb';
import { authOptions } from '@/app/utils/authOptions';

const mongoUri = process.env.MONGODB_URI;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formType = searchParams.get('formType');

  if (!formType) {
    return NextResponse.json({ error: 'Form type is required' }, { status: 400 });
  }

  const client = new MongoClient(mongoUri!);

  try {
    await client.connect();
    const db = client.db('conceptdesk');
    const submissions = db.collection(formType);

    const results = await submissions.find({}).toArray();

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}