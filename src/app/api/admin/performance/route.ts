import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateBearerToken } from '@/utils/auth';
import { TxFlowStatus, TxFlowType, TokenType, UserType } from '@prisma/client';
import { fetchSubordinatesIncrement } from '@/lib/user';
import { GROUP_TYPE } from '@/constants';
import { getCommunityPriceDisplay, getGroupPriceDisplay } from '@/lib/config';
import decimal from 'decimal.js';

export async function POST(req: NextRequest) {
  // Validate admin authentication
  const { address, startDate, endDate } = await req.json();
  const lowCaseAddress = address.toLowerCase()
  
  const userInfo = await prisma.user_info.findUnique({
    where: { address: lowCaseAddress },
    include: { balance: true }
  });

  if (!userInfo || !userInfo.path) {
    return NextResponse.json(
      { error: 'User not found with the provided address.' },
      { status: 404 }
    );
  }

  const groupUsers = await fetchSubordinatesIncrement(userInfo.path, startDate, endDate, UserType.GROUP);
  const groupCount = groupUsers.length;
  const groupAmount = new decimal(groupCount).mul(await getGroupPriceDisplay());
  
  const communityUsers = await fetchSubordinatesIncrement(userInfo.path, startDate, endDate, UserType.COMMUNITY);
  const communityCount = communityUsers.length;
  const communityAmount = new decimal(communityCount).mul(await getCommunityPriceDisplay());

  return NextResponse.json({
    groupCount,
    groupAmount,
    communityCount,
    communityAmount,
    groupUsers,
    communityUsers
  });
}


