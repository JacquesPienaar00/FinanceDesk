import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/libs/prismaDb';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const botResponses = await prisma.botResponse.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(botResponses);
  } catch (error) {
    console.error('Error fetching bot responses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { trigger, response } = await req.json();
    const newBotResponse = await prisma.botResponse.create({
      data: { trigger, response },
    });
    return NextResponse.json(newBotResponse);
  } catch (error) {
    console.error('Error creating bot response:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
