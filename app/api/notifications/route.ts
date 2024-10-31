import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifications = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['Open', 'InProgress'],
        },
      },
      select: {
        id: true,
        number: true,
        status: true,
        createdAt: true,
        subject: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticketId } = await req.json();

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
        userId: session.user.id,
      },
      data: {
        status: 'Closed',
      },
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error closing notification:', error);
    return NextResponse.json({ error: 'Failed to close notification' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.ticket.updateMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['Open', 'InProgress'],
        },
      },
      data: {
        status: 'Closed',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing all notifications:', error);
    return NextResponse.json({ error: 'Failed to close all notifications' }, { status: 500 });
  }
}
