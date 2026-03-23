import { NextRequest, NextResponse } from 'next/server';
import { reRankUsersAtDepth } from '@/tasks/user';

export async function POST(req: NextRequest) {
  try {
    const { depth, batchSize = 500 } = await req.json();

    if (typeof depth !== 'number') {
      return NextResponse.json(
        { error: 'Depth must be a number' },
        { status: 400 }
      );
    }

    if (depth < 0) {
      return NextResponse.json(
        { error: 'Depth must be greater than 0' },
        { status: 400 }
      );
    }

    if (batchSize && (typeof batchSize !== 'number' || batchSize < 1 || batchSize > 1000)) {
      return NextResponse.json(
        { error: 'Batch size must be between 1 and 1000' },
        { status: 400 }
      );
    }
    const today = new Date()
    const result = await reRankUsersAtDepth(today.getUTCFullYear(), today.getUTCMonth() + 1, today.getUTCDate(), depth, batchSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Rerank error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
