import { Server as NetServer } from 'http';
import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocket } from 'ws';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

declare global {
  var socket: {
    socket: WebSocket | null;
    io: SocketIOServer | null;
  };
}

global.socket = global.socket || {
  socket: null,
  io: null,
};

export async function GET(req: NextRequest) {
  if (global.socket.io) {
    return new Response('Socket is already running', {
      status: 200,
    });
  }

  try {
    const res = new Response('Socket initialized', {
      status: 200,
    });

    const httpServer = new NetServer();
    httpServer.listen(9000);

    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
      });

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
      });

      socket.on('send-message', (data: { roomId: string; message: any }) => {
        io.to(data.roomId).emit('receive-message', data.message);
      });

      socket.on('update-ticket', (data: { roomId: string; ticket: any }) => {
        io.to(data.roomId).emit('ticket-updated', data.ticket);
      });

      socket.on('disconnect', () => {});
    });

    global.socket.io = io;

    return res;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new Response('Failed to initialize socket', {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  if (!global.socket.io) {
    return new Response('Socket not initialized', {
      status: 500,
    });
  }

  return new Response('Socket is running', {
    status: 200,
  });
}
