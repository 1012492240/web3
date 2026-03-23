import { NextRequest, NextResponse } from 'next/server';
import { getUserLevel } from '@/lib/userCache';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const result = await getUserLevel(address);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Rerank error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
