import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { Keypair } from '@solana/web3.js';
import { processMiningTx } from '@/tasks/mining';
import { TokenType, TxFlowStatus, TxFlowType } from '@prisma/client';



// Add this to your route.ts file
export async function POST(req: NextRequest) {
  const { count } = await req.json();
  try {
    //await testBatchDepositUsers(count);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

async function testBatchDepositUsers(count: number) {
  try {

    // Process existing users
    // Fetch all users first
    const allUsers = await prisma.user_info.findMany({
      select: { address: true }
    });

    // Shuffle the array using Fisher-Yates algorithm
    const shuffledUsers = [...allUsers];
    for (let i = shuffledUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
    }

    // Take the first 'count' users from the shuffled array
    const existingUsers = shuffledUsers.slice(0, count);

    for (const user of existingUsers) {
      if (existingUsers.indexOf(user) % 100 === 0) {
        console.log(`Processing user ${existingUsers.indexOf(user) + 1} of ${existingUsers.length}`);
      }
      const txHash = crypto.randomBytes(32).toString('hex');
      const tx = await prisma.transaction.create({
        data: {
          tx_hash: txHash,
          from_address: user.address,
          to_address: user.address,
          amount: Math.floor(Math.random() * 1000000) + 2000,
          token_type: TokenType.TXT,
          type: TxFlowType.STAKE,
          status: TxFlowStatus.PENDING
        }
      });
      await processMiningTx(tx);
    }

  } catch (error) {
    console.error('Batch creation failed:', error);
    throw error;
  }
}
