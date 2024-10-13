import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/libs/prismaDb';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword || '');
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }
    }

    // Update user data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.hashedPassword = hashedPassword;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the profile' },
      { status: 500 },
    );
  }
}
