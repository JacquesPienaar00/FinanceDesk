import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/libs/prismaDb';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { trigger, response } = await req.json();
    const { id } = params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const updatedBotResponse = await prisma.botResponse.update({
      where: { id },
      data: { trigger, response },
    });

    return NextResponse.json(updatedBotResponse);
  } catch (error) {
    console.error('Error updating bot response:', error);

    if ((error as any).code === 'P2023') {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await prisma.botResponse.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Bot response deleted successfully' });
  } catch (error) {
    console.error('Error deleting bot response:', error);

    if ((error as any).code === 'P2023') {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
