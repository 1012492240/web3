import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ErrorCode } from '@/lib/errors';

export async function POST(request: Request) {
  const body = await request.json();
  const { address, status, flowTypeArr } = body;


  if (!address.toLowerCase()) {
    return NextResponse.json({ error: ErrorCode.MISSING_WALLET_ADDRESS }, { status: 400 })
  }

  const [totalAmount] = await Promise.all([
    prisma.tx_flow.aggregate({
      where: {
        user_address: address.toLowerCase(),
        type: {
          in: flowTypeArr
        },
        status: status
      },
      _sum: {
        amount: true
      }
    })
  ])

  return NextResponse.json({
    totalAmount: totalAmount._sum.amount || 0
  })
}