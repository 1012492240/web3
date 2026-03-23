import { NextRequest, NextResponse } from 'next/server';
import { operationControl } from '@/utils/auth';
import { TokenType, TxFlowStatus, TxFlowType } from '@prisma/client';
import { DEV_ENV, MAX_TIMESTAMP_GAP_MS } from '@/constants';
import { getEnvironment } from '@/lib/config';
import { ErrorCode } from '@/lib/errors';
import { mockVerifyTokenMining, verifyTokenBurning, verifyTokenMining } from '@/utils/chain';
import prisma from '@/lib/prisma';
import decimal from 'decimal.js';

export async function POST(req: NextRequest) {

  const body = await req.json();
  const { txHash, dev_address, dev_amount, tokenType } = body;

  if (!txHash) {
    console.error('txHash is missing');
    return NextResponse.json(
      { error: ErrorCode.INVALID_TRANSACTION },
      { status: 400 }
    );
  }

  // Make sure the hash won't be reused
  
  const tx = await prisma.transaction.findFirst({
    where: {
      tx_hash: txHash
    }
  })

  if (tx) {
    return NextResponse.json(
      { error: ErrorCode.DUPLICATED_OPERATION },
      { status: 400 }
    );
  }

  // Skip transaction verification in development mode
  const isDev = getEnvironment() === DEV_ENV;

  try {
    let result;
    if (isDev) {
      result = await mockVerifyTokenMining(dev_address.toLowerCase(), new decimal(dev_amount), tokenType)
    } else {
      result = await verifyTokenMining(txHash, tokenType);
    }
    if (!result.isValid || !result.tokenAmount || !result.fromAddress || !result.amount) {
      console.error(`Verify burning failed, error:${result.error}`)
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
    await prisma.transaction.create({
      data: {
        tx_hash: txHash,
        from_address: result.fromAddress,
        to_address: result.fromAddress,
        amount: result.amount,
        token_type: tokenType,
        type: TxFlowType.STAKE,
        status: TxFlowStatus.PENDING,
        description: JSON.stringify({usdtAmount: result.usdtAmount, tokenAmount: result.tokenAmount, tokenPrice: result.tokenPrice})
      }
    });
    return NextResponse.json({
      message: 'Mining successfully'
    });
  } catch (error) {
    console.error('Error staking points:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
