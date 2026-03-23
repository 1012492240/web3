import { NextRequest, NextResponse } from 'next/server';
import { isTransactionFinalized } from '@/utils/chain';

export async function POST(req: NextRequest) {
  try {
    const { signature } = await req.json();

    if (!signature || typeof signature !== 'string') {
      return NextResponse.json(
        { error: 'Valid signature is required' },
        { status: 400 }
      );
    }

    const result = await isTransactionFinalized(signature);
    return NextResponse.json({ 
      status: 'success',
      result
    });
  } catch (error) {
    console.error('Transaction finalized error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
