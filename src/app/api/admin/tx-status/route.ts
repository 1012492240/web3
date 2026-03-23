import { NextRequest, NextResponse } from 'next/server';
import { validateBearerToken } from '@/utils/auth';
import { isTransactionFinalized } from '@/utils/chain';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    const { txHash, timestamp } = await req.json();
    try {
        const { status, fee, error } = await isTransactionFinalized(txHash, timestamp);
        return NextResponse.json({
            status,
            fee,
            error
        });
    } catch (error) {
        console.error('Transaction confirmation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
}
