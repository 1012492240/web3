import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getStakeRewardRate } from '@/lib/config'

export async function POST() {
  try {
    const totalStaked = await prisma.user_balance.aggregate({
      _sum: {
        token_staked_points: true
      }
    })

    return NextResponse.json({
      total: totalStaked._sum.token_staked_points || 0,
      ratio: await getStakeRewardRate()
    })
  } catch (error) {
    console.error('Error fetching total staked points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch total staked points' },
      { status: 500 }
    )
  }
}