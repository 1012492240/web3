import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TxFlowType, TokenType, TxFlowStatus } from '@prisma/client';
import { getUTCTodayStart, getUTCTomorrowStart, getUTCYesterdayStart } from '@/utils/dateUtils';

/**
 * @deprecated
 * @param request 
 * @returns 
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmpAddress = searchParams.get('address');

    if (!tmpAddress) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    const address = tmpAddress.toLowerCase();

    const user = await prisma.user_info.findUnique({
      where: {
        address,
      },
    });

    if (!user) {
      return NextResponse.json({
        usdt_rewards: 0,
        token_rewards: 0,
        referral_count: 0,
        team_count: 0,
        growth_rate: {
          usdt: 0,
          token: 0,
          referrals: 0,
          team_count: 0
        }
      });
    }

    const [{ _sum: { amount: usdtRewards } }, { _sum: { amount: tokenRewards } }, { _sum: { amount: usdtRewardsToday } }, { _sum: { amount: tokenRewardsToday } }] = await Promise.all([
      prisma.tx_flow.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          user_address: address,
          type: TxFlowType.NODE_REWARD,
          status: TxFlowStatus.CONFIRMED,
          token_type: TokenType.USDT,
        },
      }),
      prisma.tx_flow.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          user_address: address,
          type: {
            in: [TxFlowType.STAKE_STATIC_REWARD, TxFlowType.STAKE_DYNAMIC_REWARD],
          },
          status: TxFlowStatus.CONFIRMED,
          token_type: TokenType.TXT,
        },
      }),
      prisma.tx_flow.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          user_address: address,
          type: TxFlowType.NODE_REWARD,
          status: TxFlowStatus.CONFIRMED,
          token_type: TokenType.USDT,   
          executed_at: {
            gte: getUTCTodayStart(),
            lt: getUTCTomorrowStart(),
          },
        },
      }),
      prisma.tx_flow.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          user_address: address,
          type: {
            in: [TxFlowType.STAKE_STATIC_REWARD, TxFlowType.STAKE_DYNAMIC_REWARD],
          },
          status: TxFlowStatus.CONFIRMED,
          token_type: TokenType.TXT,
          executed_at: {
            gte: getUTCTodayStart(),
            lt: getUTCTomorrowStart(),
          },
        },
      }),
    ]);

    const referrals = await prisma.user_info.count({
      where: {
        superior: user.address
      }
    });

    const teamCount = await prisma.user_info.count({
      where: {
        path: {
          startsWith: `${user.path}`
        }
      }
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [yesterdayReferrals, yesterdayTeamCount] = await Promise.all([
      prisma.user_info.count({
        where: {
          superior: user.address,
          created_at: {
            gte: getUTCYesterdayStart(),
            lt: getUTCTodayStart(),
          }
        }
      }),
      prisma.user_info.count({
        where: {
          path: {
            startsWith: `${user.path}`
          },
          created_at: {
            gte: getUTCYesterdayStart(),
            lt: getUTCTodayStart(),
          }
        }
      })
    ]);

    const rewards = {
      usdt_rewards: usdtRewards || 0,
      token_rewards: tokenRewards || 0,
      referral_count: referrals,
      team_count: teamCount,
      growth_rate: {
        usdt: 0,
        token: 0,
        referrals: referrals / (yesterdayReferrals || 1),
        team_count: teamCount / (yesterdayTeamCount || 1),
      },
    };

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}
