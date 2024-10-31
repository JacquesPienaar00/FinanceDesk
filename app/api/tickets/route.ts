import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/libs/prismaDb';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ensure messages are parsed as JSON
    const formattedTickets = tickets.map((ticket) => ({
      ...ticket,
      messages: typeof ticket.messages === 'string' ? JSON.parse(ticket.messages) : ticket.messages,
    }));

    return NextResponse.json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Function to generate a random ticket number
    const generateTicketNumber = () => {
      const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      return `${randomPart}`;
    };

    const ticketNumber = generateTicketNumber();

    const newTicket = await prisma.ticket.create({
      data: {
        number: ticketNumber,
        subject,
        status: 'Open',
        userId: session.user.id,
        messages: JSON.stringify([
          {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            createdAt: new Date().toISOString(),
          },
        ]),
      },
    });

    // Parse messages back to an object
    const formattedTicket = {
      ...newTicket,
      messages: JSON.parse(newTicket.messages as string),
    };

    return NextResponse.json({ ticket: formattedTicket }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
