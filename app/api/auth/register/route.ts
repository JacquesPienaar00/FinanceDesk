import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismaDb';
import sendEmail from '@/app/utils/sendEmail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json('Missing info', { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json('User already exists with this email', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date(new Date().getTime() + 30 * 24 * 60 * 60000); // 60000 milliseconds in a minute

    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        resetToken: token,
        resetTokenExpiry: tokenExpiration,
      },
    });

    // Construct the confirmation link
    const link = `${process.env.APP_URL}/auth?token=${token}`;

    // HTML Email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #333;">Email Confirmation</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering! Please click the button below to confirm your email address and complete your registration.</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: white; background-color: #007bff; text-decoration: none; border-radius: 20px;">Confirm Email</a>
        <p style="margin-top: 20px;">Best regards,<br/>The Finance Desk Team</p>
      </div>
    `;

    // Send email
    await sendEmail(
      email,
      'Email confirmation',
      `Confirm your email by visiting this link: ${link}`,
      htmlContent,
    );

    return NextResponse.json(`Confirmation link is sent to ${email}. Please check your email!`, {
      status: 200,
    });
  } catch (error) {
    console.log(error, 'REGISTRATION ERROR');
    return NextResponse.json('Internal Error', { status: 500 });
  }
}
