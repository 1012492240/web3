import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TxFlowStatus, TxFlowType } from '@prisma/client';
import decimal from 'decimal.js';
import { ErrorCode } from '@/lib/errors';

export async function POST(request: Request) {

  const body = await request.json();
  const { address } = body;

  if (!address.toLowerCase()) {
    return NextResponse.json({ error: ErrorCode.MISSING_WALLET_ADDRESS }, { status: 400 })
  }

  const txFlows = await prisma.tx_flow.groupBy({
    by: ['status', 'type'],
    where: {
      user_address: address.toLowerCase(),
      status: {
        in: [TxFlowStatus.PENDING, TxFlowStatus.CONFIRMED]
      },
      type: {
        in: [TxFlowType.NODE_REWARD, 
          TxFlowType.NODE_DIFF_REWARD,
          TxFlowType.STAKE_STATIC_REWARD, 
          TxFlowType.STAKE_STATIC_DIRECT_REWARD, 
          TxFlowType.STAKE_DYNAMIC_REWARD, 
          TxFlowType.STAKE_DYNAMIC_INCUBATION_REWARD, 
          TxFlowType.STAKE_DYNAMIC_NODE_INCUBATION_REWARD, 
          TxFlowType.STAKE_DYNAMIC_NODE_REWARD,
          TxFlowType.MARKET_EXPENSE,
          TxFlowType.SECURITY_FUND,
          TxFlowType.FEE_DIVIDEND,
          TxFlowType.FEE_DIVIDEND_TOKEN
        ]
      }
    },
    _sum: {
      amount: true
    },
  });

  // Transform the array into nested object format and combine types
  const result = txFlows.reduce((acc, flow) => {
    const { type, status, _sum } = flow;
    const amount = new decimal(_sum.amount || 0);
    
    // If this is one of the types to combine, use SPAWN_REWARD as the key
    const keyType = /* type === TxFlowType.STAKE_DYNAMIC_REWARD || 
                    type === TxFlowType.HONOR_REWARD ? 
                    TxFlowType.SPAWN_REWARD :  */
                    type;
    
    // Initialize type object if it doesn't exist
    if (!acc[keyType]) {
      acc[keyType] = {
        [TxFlowStatus.PENDING]: 0,
        [TxFlowStatus.CONFIRMED]: 0,
        [TxFlowStatus.FAILED]: 0,
        [TxFlowStatus.ABORT]: 0,
        [TxFlowStatus.AUDITING]: 0,
        [TxFlowStatus.REFUSED]: 0,
      };
    }
    
    // Add the amount to the correct status
    acc[keyType][status] = new decimal(acc[keyType][status] || 0).add(amount).toNumber();
    
    return acc;
  }, {} as Record<string, Record<TxFlowStatus, number>>);

  return NextResponse.json({
    data: result,
  })
}