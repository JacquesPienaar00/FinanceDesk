import { NextResponse } from 'next/server';
import sendEmail from '@/app/utils/sendEmail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Send welcome email to subscriber
    await sendEmail(
      email,
      'Welcome to The Finance Desk Newsletter!',
      'Thank you for subscribing to our newsletter. You will now receive the latest financial news, tips, and insights directly to your inbox.',
      `
      <h1>Welcome to The Finance Desk Newsletter!</h1>
      <p>Thank you for subscribing to our newsletter.</p>
      <p>You will now receive the latest financial news, tips, and insights directly to your inbox.</p>
      <br>
      <p>Best regards,</p>
      <p>The Finance Desk Team</p>
      `,
    );

    // Here you would typically also save the email to your database
    // await db.insert({ email, subscribedAt: new Date() }).into('subscribers')

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to newsletter' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 });
  }
}
