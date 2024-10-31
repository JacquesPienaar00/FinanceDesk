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
    const { ticketId, text, sender } = await req.json();

    // Fetch the current ticket to get the existing messages
    const currentTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        messages: true,
        number: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Parse the existing messages and add the new message
    const existingMessages = Array.isArray(currentTicket.messages) ? currentTicket.messages : [];
    const newMessage = {
      id: Date.now().toString(), // Generate a unique ID
      text,
      sender,
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...existingMessages, newMessage];

    // Update the ticket with the new messages array and status
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        messages: updatedMessages,
        status: 'InProgress',
      },
    });

    // Format the response to include all necessary ticket information
    const formattedTicket = {
      ...updatedTicket,
      messages: updatedMessages,
    };

    return NextResponse.json(formattedTicket);
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
