import { NextRequest, NextResponse } from 'next/server';
import { calculateDynamicReward } from '@/lib/balance';
import decimal from 'decimal.js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const today = new Date();
    const result = await calculateDynamicReward(userId, new decimal(1), today.getUTCFullYear(), today.getUTCMonth() + 1, today.getUTCDate());
    return NextResponse.json({ 
      status: 'success',
      result
    });
  } catch (error) {
    console.error('Dynamic reward error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
