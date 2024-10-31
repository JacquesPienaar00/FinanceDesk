// app/api/getUser/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/utils/authOptions'; // Adjust the path to your NextAuth options
import { Products } from '@/app/services/data/products'; // Ensure Products is imported correctly

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pfData: true, // Fetch only the pfData field
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Validate and handle pfData
    let pfData;
    if (typeof user.pfData === 'string') {
      try {
        pfData = JSON.parse(user.pfData);
      } catch (parseError) {
        console.error('Error parsing pfData as JSON:', parseError);
        return NextResponse.json({ message: 'Invalid pfData format' }, { status: 400 });
      }
    } else {
      pfData = user.pfData;
    }

    // Log pfData for debugging
    //console.log('pfData:', pfData);

    // Ensure pfData is an object with the expected structure
    if (!pfData || !Array.isArray(pfData.item_name)) {
      return NextResponse.json({ message: 'Invalid pfData structure' }, { status: 400 });
    }

    // Check for multiple entries in pfData
    const numberOfEntries = pfData.item_name.length;

    // Adjust the filter logic if necessary
    const matchingProducts = Products.filter(
      (product) =>
        pfData.item_name.some((item: { name: string }) => item.name === product.id.toString()), // Convert product.id to string
    );

    // Log matching product IDs for debugging
    //console.log(
    // 'Matching product IDs:',
    // matchingProducts.map((product) => product.id),
    //);

    if (matchingProducts.length > 0) {
      //console.log('Matching products:', matchingProducts);
      return NextResponse.json({
        message: 'Products found',
        numberOfEntries: numberOfEntries,
        products: matchingProducts.map((product) => ({
          id: product.id.toString(), // Ensure the id is returned as a string
          name: product.name,
          // Include any additional properties needed
        })),
      });
    } else {
      return NextResponse.json({
        message: 'No products found',
        numberOfEntries: numberOfEntries,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
