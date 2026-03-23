import { NextRequest, NextResponse } from 'next/server';
import { calculateAllStaticRewards } from '@/tasks/reward';

export async function POST(req: NextRequest) {
  try {
    const { batchSize = 500 } = await req.json();

    if (batchSize && (typeof batchSize !== 'number' || batchSize < 1 || batchSize > 1000)) {
      return NextResponse.json(
        { error: 'Batch size must be between 1 and 1000' },
        { status: 400 }
      );
    }
    const today = new Date()

    const result = await calculateAllStaticRewards(today.getUTCFullYear(), today.getUTCMonth() + 1, today.getUTCDate(), batchSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Static reward calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
