// pages/api/remove-pf-item.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId, itemName, removeOnlyOne } = await request.json();

    if (!userId || !itemName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pfData: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pfData = user.pfData as { item_name: Array<{ name: string; timestamp: string }> } | null;

    if (!pfData || !pfData.item_name) {
      return NextResponse.json({ error: 'pfData or item_name not found' }, { status: 404 });
    }

    // Find all items with the specified name
    const itemsWithName = pfData.item_name.filter((item) => item.name === itemName);
    if (itemsWithName.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Sort items by timestamp (oldest first)
    itemsWithName.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Select the item to remove (the oldest one)
    const itemToRemove = itemsWithName[0];

    // Remove the selected item
    const updatedItemName = pfData.item_name.filter((item, index) => {
      if (removeOnlyOne) {
        // If removeOnlyOne is true, remove only the first occurrence
        return !(
          item.name === itemName &&
          item.timestamp === itemToRemove.timestamp &&
          index ===
            pfData.item_name.findIndex(
              (i) => i.name === itemName && i.timestamp === itemToRemove.timestamp,
            )
        );
      } else {
        // Otherwise, remove all items with matching name and timestamp
        return !(item.name === itemName && item.timestamp === itemToRemove.timestamp);
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pfData: {
          ...pfData,
          item_name: updatedItemName,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed successfully',
      user: updatedUser,
      removedItem: itemToRemove,
    });
  } catch (error) {
    console.error('Error removing item from pfData:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
