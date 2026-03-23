import { NextRequest, NextResponse } from 'next/server';
import { getMaxPathDepth } from '@/lib/user';

export async function POST(req: NextRequest) {
  try {

    const result = await getMaxPathDepth();
    return NextResponse.json({ 
      status: 'success',
      result
    });
  } catch (error) {
    console.error('Settlement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );  
  }
}
