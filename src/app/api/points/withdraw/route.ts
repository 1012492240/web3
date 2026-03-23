import { NextRequest, NextResponse } from 'next/server';
import { generateOperationHash, isInBlacklist, operationControl, verifySignature } from '@/utils/auth';
import { auditionOutPassed, outPoints } from '@/lib/balance';
import { MAX_TIMESTAMP_GAP_MS } from '@/constants';
import { ErrorCode } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {

    const { amount, walletAddress, timestamp, signature, description, operationType, tokenType } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const lowerCaseAddress = walletAddress.toLowerCase()


    const hash = await generateOperationHash({
      operationType,
      amount,
      tokenType,
      walletAddress,
      description,
      timestamp
    });

    const isValid = await verifySignature(walletAddress, signature, hash);

    if (!isValid) {
      return NextResponse.json(
        { error: ErrorCode.INVALID_SIGNATURE },
        { status: 401 }
      );
    }
    
    // Make sure the hash won't be reused
    const operationKey = `${lowerCaseAddress}:${operationType}`;
    if (operationControl.has(operationKey)) {
      return NextResponse.json(
        { error: ErrorCode.DUPLICATED_OPERATION },
        { status: 400 }
      );
    }
    operationControl.set(operationKey, true, MAX_TIMESTAMP_GAP_MS);

    if (await isInBlacklist(lowerCaseAddress)) {
      console.warn(`Withdraw failed, ${lowerCaseAddress} in blacklist`)
      return NextResponse.json(
        { error: ErrorCode.OPERATION_FAILED },
        { status: 400 }
      );
    }

    try {
      await outPoints({
        address: lowerCaseAddress,
        toAddress: description,
        amount,
        tokenType: tokenType
      })
      //await auditionOutPassed(txId)
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : ErrorCode.SERVER_ERROR },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error withdrawing points:', error);
    return NextResponse.json(
      { error: ErrorCode.SERVER_ERROR },
      { status: 500 }
    );
  }
}
