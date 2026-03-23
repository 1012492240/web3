import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenBurning } from '@/utils/chain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txHash } = body;

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Verify the transaction
    const result = await verifyTokenBurning(txHash);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}
