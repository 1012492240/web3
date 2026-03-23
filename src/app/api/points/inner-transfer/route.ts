import { NextRequest, NextResponse } from 'next/server';
import { generateOperationHash, verifySignature, operationControl } from '@/utils/auth';
import { TokenType } from '@prisma/client';
import { innerTransfer } from '@/lib/balance';
import { MAX_TIMESTAMP_GAP_MS } from '@/constants';
import prisma from '@/lib/prisma';
import { ErrorCode } from '@/lib/errors';

export async function POST(req: NextRequest) {
  
    const { amount, walletAddress, timestamp, signature, operationType, tokenType, description } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const lowerCaseAddress = walletAddress.toLowerCase();

    const hash = await generateOperationHash({
      operationType,
      amount,
      walletAddress,
      tokenType,
      description: description,
      timestamp
    });
    console.log(`info: ${JSON.stringify({
      operationType,
      amount,
      lowerCaseAddress,
      tokenType,
      description: description,
      timestamp
    })}`)



    // Make sure the hash won't be reused
    const operationKey = `${lowerCaseAddress}:${operationType}`;
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
        { error: ErrorCode.OPERATION_FAILED },
        { status: 400 }
      );
    }

    const userBalance = await prisma.user_balance.findUnique({
      where: {
        address: description
      }
    });

    if (!userBalance || lowerCaseAddress === description) {
      return NextResponse.json(
        { error: ErrorCode.NOT_FOUND },
        { status: 404 }
      );
    }

    try {
      const response = await innerTransfer({
        address: lowerCaseAddress,
        amount,
        tokenType: tokenType,
        toAddress: description
      })

      return NextResponse.json({
        message: 'Points transferred successfully'
      });
    } catch (error) {
      console.error('Error transferring points:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : ErrorCode.SERVER_ERROR },
        { status: 500 }
      );
    }
}
