import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/libs/prismaDb';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticketId, status } = await req.json();

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
      select: {
        id: true,
        number: true,
        subject: true,
        status: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    // Parse and sort messages
    let parsedMessages;
    try {
      parsedMessages =
        typeof updatedTicket.messages === 'string'
          ? JSON.parse(updatedTicket.messages)
          : updatedTicket.messages;
    } catch (error) {
      console.error(`Error parsing messages for ticket ${ticketId}:`, error);
      parsedMessages = [];
    }

    const sortedMessages = Array.isArray(parsedMessages)
      ? parsedMessages
          .map((message: any) => ({
            id: message.id || String(Date.now()),
            text: message.text || message.content || '',
            sender: message.sender || message.role || 'unknown',
            createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
          }))
          .sort(
            (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
      : [];

    const formattedTicket = {
      ...updatedTicket,
      messages: sortedMessages,
    };

    return NextResponse.json(formattedTicket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
