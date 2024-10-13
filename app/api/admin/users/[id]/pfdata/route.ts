import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { pfData } = await request.json();

    const adminName = session.user?.name || 'Unknown Admin';
    const changeMessage = `PF Data updated by admin: ${adminName} at ${new Date().toISOString()}`;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        pfData: {
          ...pfData,
          adminChanges: [...(pfData.adminChanges || []), changeMessage],
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update PF data:', error);
    return NextResponse.json({ error: 'Failed to update PF data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
