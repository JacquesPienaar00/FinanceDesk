import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prismaDb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pfData: true },
    });

    if (!user || !user.pfData) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    let count = 0;
    if (typeof user.pfData === 'object' && user.pfData !== null) {
      const pfDataArray = (user.pfData as { item_name: any[] }).item_name || [];
      if (Array.isArray(pfDataArray)) {
        count = pfDataArray.filter((item) => item.name === serviceId).length;
      }
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pfData count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
