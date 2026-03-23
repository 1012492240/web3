import { NextRequest, NextResponse } from 'next/server';
import { COMMUNITY_TYPE, GROUP_TYPE } from '@/constants';
import prisma from '@/lib/prisma';
import * as crypto from 'crypto';
import { getMaxPathDepth, updateUserPath, updateUserType } from '@/lib/user';
import { Keypair } from '@solana/web3.js';
import { randomReferralCode } from '@/utils/auth';
import { processMiningTx } from '@/tasks/mining';
import { processLockTx } from '@/tasks/lock';
import { getCommunityNum, getGroupNum } from '@/lib/config';

// Add this to your route.ts file
export async function POST(req: NextRequest) {
  const { count } = await req.json();
  try {
    //await testBatchCreateUsers(count);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

async function testBatchCreateUsers(count: number) {

  let communityCount = await prisma.user_info.count({
    where: { type:COMMUNITY_TYPE }
  });

  let groupCount = await prisma.user_info.count({
    where: { type:GROUP_TYPE }
  });

  const communityMax = await getCommunityNum()
  const groupMax = await getGroupNum()

  try {
    for (let i = 0; i < count; i++) {
      if (i % 100 === 0) {
        console.log(`Processing user ${i + 1} of ${count}`);
      }

      const random = Math.random()
      let type = null
      if (random > 0.8) {
        if (communityCount < communityMax) {
          type = COMMUNITY_TYPE
          communityCount += 1
        }
      } else if (random > 0.4) {
        if (communityCount < communityMax) {
          type = GROUP_TYPE
          groupCount += 1
        }
      }

      const maxDepth = await getMaxPathDepth();
      const depth = Math.floor(Math.random() * (maxDepth + 1));

      const existingUsers = await prisma.user_info.findMany({
        where: { depth: depth },
        select: { address: true, depth: true, path: true }
      });

      // Use a random existing referral code if available
      const superior = existingUsers.length > 0 && existingUsers.length % 10 !== 0
        ? existingUsers[Math.floor(Math.random() * existingUsers.length)]
        : null;

      // Generate a real Solana keypair and derive the wallet address
      const keypair = Keypair.generate();
      const walletAddress = keypair.publicKey.toString();
      const txHash = crypto.randomBytes(32).toString('hex');

      const user = await prisma.user_info.create({
        data: {
          address: walletAddress,
          superior: superior?.address,
          referral_code: randomReferralCode(walletAddress),
          last_activity: new Date(),
          balance: {
            create: {
              usdt_points: 0,
              token_points: 0,
              token_locked_points: 0,
              token_staked_points: 0
            }
          }
        }
      });

      await updateUserPath(user.id, superior?.path || null, prisma);

      if (type) {
        const id = await updateUserType({
          walletAddress,
          type,
          txHash,
          tx: prisma
        })
  
        const tx = await prisma.transaction.findUnique({
          where: {
            id: id.txId
          }
        });
  
        if (tx) {
          await processLockTx(tx);
        } else {
          console.error('Transaction not found for id:', id.txId);
        }
      }
    }
  } catch (error) {
    console.error('Batch creation failed:', error);
    throw error;
  }

}