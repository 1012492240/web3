import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import decimal from 'decimal.js';
import { ErrorCode } from '@/lib/errors';
import { getUserPartialPerformance, getUserTotalPerformance } from '@/lib/userCache';

/**
 * Get user points
 */
export async function POST(req: NextRequest) {
  try {
    // Get wallet address from query params
    const { walletAddress, isPartial } = await req.json();

    if (!walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: ErrorCode.MISSING_WALLET_ADDRESS },
        { status: 400 }
      );
    }
    
    const performance = isPartial ? await getUserPartialPerformance(walletAddress.toLowerCase()) : await getUserTotalPerformance(walletAddress.toLowerCase())
    
    return NextResponse.json({
      performance: performance
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: ErrorCode.SERVER_ERROR },
      { status: 500 }
    );
  }
}
