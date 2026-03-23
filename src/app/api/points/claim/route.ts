import { NextRequest, NextResponse } from 'next/server';
import { generateOperationHash, verifySignature, operationControl } from '@/utils/auth';
import { claim } from '@/lib/balance';
import { MAX_TIMESTAMP_GAP_MS } from '@/constants';
import decimal from 'decimal.js';
import { ErrorCode } from '@/lib/errors';

export async function POST(req: NextRequest) {
  
    const { walletAddress, timestamp, signature, operationType, tokenType } = await req.json();

    const hash = await generateOperationHash({
      operationType,
      amount: 0,
      walletAddress,
      timestamp,
      tokenType
    });

    // Make sure the hash won't be reused
    const operationKey = `${walletAddress.toLowerCase()}:${operationType}:${tokenType}`;
    if (operationControl.has(operationKey)) {
      return NextResponse.json(
        { error: ErrorCode.DUPLICATED_OPERATION },
        { status: 400 }
      );
    }
    operationControl.set(operationKey, true, MAX_TIMESTAMP_GAP_MS);

    const isValid = await verifySignature(walletAddress, signature, hash);

    if (!isValid) {
      return NextResponse.json(
        { error: ErrorCode.INVALID_SIGNATURE },
        { status: 401 }
      );
    }

    const currentTime = Date.now();
    const timeGap = currentTime - timestamp;

    if (timeGap > MAX_TIMESTAMP_GAP_MS) {
      return NextResponse.json(
        { error: ErrorCode.INVALID_TRANSACTION },
        { status: 400 }
      );
    }

    try {
      await claim({
          address: walletAddress.toLowerCase(),
          tokenType,
          amount: new decimal(0)
      });

      return NextResponse.json({
        message: 'Points redeemed successfully'
      });
    } catch (error) {
      console.error('Error redeeming points:', error);
      return NextResponse.json(
        { error: ErrorCode.SERVER_ERROR },
        { status: 500 }
      );
    }
}
