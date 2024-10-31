import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/libs/prismaDb';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chatLogs = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        tickets: {
          select: {
            id: true,
            number: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            messages: true, // This will fetch the entire Json field
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Process and sort messages within each ticket
    const processedChatLogs = chatLogs.map((user) => ({
      ...user,
      tickets: user.tickets.map((ticket) => {
        let parsedMessages;
        try {
          parsedMessages =
            typeof ticket.messages === 'string' ? JSON.parse(ticket.messages) : ticket.messages;
        } catch (error) {
          console.error(`Error parsing messages for ticket ${ticket.id}:`, error);
          parsedMessages = [];
        }

        return {
          ...ticket,
          messages: Array.isArray(parsedMessages)
            ? parsedMessages
                .map((message: any) => ({
                  id: message.id || String(Date.now()),
                  text: message.text || message.content || '',
                  sender: message.sender || message.role || 'unknown',
                  createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
                }))
                .sort(
                  (a: any, b: any) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                )
            : [],
        };
      }),
    }));

    return NextResponse.json({ chatLogs: processedChatLogs });
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
