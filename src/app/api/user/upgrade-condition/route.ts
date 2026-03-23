import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import decimal from 'decimal.js'
import { getLevelConditionThreshold, getMaxLevel } from '@/lib/config'
import { getUserLevel, getUserPartialPerformance } from '@/lib/userCache'


interface UpgradeCondition {
  address: string,
  process: decimal,
  presentLevel: number,
  targetLevel: number,
  conditions: {
    stakeAmount: {
      present: decimal,
      target: decimal,
      achieved: boolean
    }
  }
}

export async function POST(request: Request) {

  const body = await request.json();
  const { address } = body;
  const lowerCaseAddress = address.toLowerCase()

  if (!lowerCaseAddress) {
    return NextResponse.json({ error: 'Missing walletAddress parameter' }, { status: 400 })
  }

  const userInfo = await prisma.user_info.findUnique({
    where: {
      address: lowerCaseAddress
    }
  })

  const userLevel = await getUserLevel(lowerCaseAddress)

  if (!userInfo) {
    console.error(`User not found with address: ${lowerCaseAddress}`)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const subordinateStakeAmount = await getUserPartialPerformance(lowerCaseAddress);
  const threshold = await getLevelConditionThreshold();
  const maxLevel = await getMaxLevel();
  const targetLevel = userLevel === maxLevel ? userLevel : userLevel + 1;

  const targetLevelIndex = targetLevel - 1;
  
  const stakeProcess = subordinateStakeAmount.partialAmount.lt(threshold[targetLevelIndex]) ? subordinateStakeAmount.partialAmount.div(threshold[targetLevelIndex]) : new decimal(1);

  const upgradeCondition: UpgradeCondition = {
    address: lowerCaseAddress,
    process: stakeProcess,
    presentLevel: userLevel,
    targetLevel: targetLevel,
    conditions: {
      stakeAmount: {
        present: subordinateStakeAmount.partialAmount,
        target: threshold[targetLevelIndex],
        achieved: subordinateStakeAmount.partialAmount.gte(threshold[targetLevelIndex])
      },
    }
  }


  return NextResponse.json({
    data: upgradeCondition
  })
}