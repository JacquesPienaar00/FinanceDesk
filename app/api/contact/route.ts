import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { contactFormSchema } from './schema';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = contactFormSchema.parse(json);

    const contactSubmission = await prisma.contactSubmission.create({
      data: body,
    });

    return NextResponse.json({ success: true, data: contactSubmission }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, errors: (error as any).errors }, { status: 400 });
    }
    console.error('Contact form submission error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
