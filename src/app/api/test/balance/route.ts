import { NextRequest, NextResponse } from 'next/server';
import { TxFlowType, TokenType } from '@prisma/client';
import { processBalanceUpdate } from '@/lib/balance';
import prisma from '@/lib/prisma';
import decimal from 'decimal.js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, type, tokenType, address } = body;

    // Validate required fields
    if (!amount || !type || !tokenType || !address) {
      return NextResponse.json(
        { error: 'Amount, type, tokenType, and address are required' },
        { status: 400 }
      );
    }

    // Validate type is a valid TxFlowType
    if (!Object.values(TxFlowType).includes(type)) {
      console.log('Invalid transaction type:', type);
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Validate tokenType is a valid TokenType
    if (!Object.values(TokenType).includes(tokenType)) {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 400 }
      );
    }

    // Process the balance update
    const transactions = await processBalanceUpdate({
      address,
      amount: new decimal(amount),
      type,
      tokenType,
    }, prisma);

    // Execute all transactions
    //await prisma.$transaction(transactions);

    // Get updated balance
    const balance = await prisma.user_balance.findUnique({
      where: { address }
    });

  return NextResponse.json({
    success: true,
      balance,
      transactions: transactions
    });

  } catch (error) {
    console.error('Error in balance test:', error);
    return NextResponse.json(
      { error: 'Failed to process balance update' },
      { status: 500 }
    );
  }
}

// Example request:
/*
POST /api/test/balance
Body:
{
  "address": "your_wallet_address",
  "amount": 1000,
  "type": "LOCK",
  "tokenType": ""
}

Response:
{
  "success": true,
  "balance": {
    "address": "your_wallet_address",
    "usdt_points": 0,
    "token_points": 0,
    "token_locked_points": 1000,
    "token_staked_points": 0
  },
  "transactions": 2
}
*/
