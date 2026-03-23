import { NextRequest, NextResponse } from 'next/server';
import { validateBearerToken } from '@/utils/auth';
import { manualTxConfirm } from '@/tasks/transactions';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    const { txHash } = await req.json();
    try {
        await manualTxConfirm(txHash);
    } catch (error) {
        console.error('Transaction confirmation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        status: 'success',
        message: 'Transaction confirmed'
    });
}
