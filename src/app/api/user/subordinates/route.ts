import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import decimal from 'decimal.js';
import { ErrorCode } from '@/lib/errors';
import { getAllSubordinates, getDirectSubordinatesWithBalance } from '@/lib/user';

/**
 * Get user points
 */
export async function POST(req: NextRequest) {
  try {
    // Get wallet address from query params
    const { walletAddress, isDirect, nodeType } = await req.json();

    if (!walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: ErrorCode.MISSING_WALLET_ADDRESS },
        { status: 400 }
      );
    }


    let subordinates = []
    
    // Find all subordinates
    if (isDirect) {
      subordinates = await getDirectSubordinatesWithBalance(walletAddress.toLowerCase())
    } else {
      const user = await prisma.user_info.findUnique({
        where: {
          address: walletAddress.toLowerCase()
        },
        select: {
          path: true
        }
      })
      if (!user || !user.path) {
        return NextResponse.json(
          { error: ErrorCode.SERVER_ERROR },
          { status: 500 }
        );
      }
      subordinates = await getAllSubordinates(user.path)
      // Filter out the current user from the subordinates list
      subordinates = subordinates.filter(sub => sub.address !== walletAddress.toLowerCase());
    }

    // Filter node type if nodeType exists
    if (nodeType) {
      subordinates = subordinates.filter(sub => sub.type === nodeType);
    }

    
    return NextResponse.json({
      data: subordinates,
      total: subordinates.length
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: ErrorCode.SERVER_ERROR },
      { status: 500 }
    );
  }
}
