import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// const testingMode = true;
// const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za"; // Commented out as it's not used

export async function POST(request: NextRequest) {
  try {
    // Determine content type
    const contentType = request.headers.get('content-type') || '';

    let pfData: Record<string, any>;

    if (contentType.includes('application/json')) {
      // Parse JSON data from the request
      pfData = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse URL-encoded data from the request
      const formData = await request.text(); // Get raw form data
      const params = new URLSearchParams(formData);
      pfData = Object.fromEntries(params.entries()); // Convert to object
    } else {
      // Invalid content-type
      console.error('Invalid content-type:', contentType);
      return NextResponse.json({ message: 'Invalid content-type' }, { status: 400 });
    }

    // Debugging: Log the parsed data
    console.log('Parsed data:', pfData);

    // Fetch the user by email
    const emailAddress = pfData.email_address; // Assuming pfData contains an email_address field
    if (!emailAddress) {
      console.error('Email address not provided in pfData');
      return NextResponse.json({ message: 'Email address not provided' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: emailAddress },
    });

    if (!user) {
      console.error('User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Handle multiple entries for item_name
    const itemNames = pfData.item_name?.split(',').map((name: string) => name.trim()) || [];
    const newItemNames = itemNames.map((name: string) => ({
      name,
      timestamp: new Date().toISOString(),
    }));

    let updatedItemNames;
    if (Array.isArray((user.pfData as any)?.item_name)) {
      // If user.pfData.item_name is already an array, append new items
      updatedItemNames = [...(user.pfData as any).item_name, ...newItemNames];
    } else {
      // Otherwise, start a new array with existing items and new items
      updatedItemNames = [
        ...(Array.isArray((user.pfData as any)?.item_name) ? (user.pfData as any).item_name : []),
        ...newItemNames,
      ];
    }

    // Update the user data with the new item_name list
    const updatedUser = await prisma.user.update({
      where: { email: emailAddress },
      data: {
        pfData: {
          ...(user.pfData && typeof user.pfData === 'object' ? user.pfData : {}),
          item_name: updatedItemNames,
        },
      },
    });

    console.log('User updated:', updatedUser);

    // Construct the parameter string excluding the 'signature' key
    let pfParamString = Object.entries(pfData)
      .filter(([key]) => key !== 'signature' && pfData[key] !== undefined && pfData[key] !== null)
      .map(([key, value]) => {
        // Ensure value is a string for encoding
        const stringValue = typeof value === 'string' ? value.trim() : value.toString();
        return `${key}=${encodeURIComponent(stringValue).replace(/%20/g, '+')}`;
      })
      .join('&');

    // For demonstration purposes, return the parameter string
    return NextResponse.json({ pfParamString });
  } catch (error) {
    // More detailed error logging
    console.error('Error processing request:', error);

    // Return a more detailed error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
