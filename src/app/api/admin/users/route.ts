import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateBearerToken } from '@/utils/auth';
import { UserType } from '@prisma/client';

export async function POST(req: NextRequest) {
  // Validate admin authentication
  const validationResponse = validateBearerToken(req);
  if (validationResponse) {
    return validationResponse;
  }

  try {
    const {
      address,
      level,
      type,
      superior,
      referral_code,
      cursor,
      take = 10,
    } = await req.json();

    // Build where clause based on provided filters
    const whereClause: any = {};

    // Add optional filters if they exist
    if (address) whereClause.address = { contains: address };
    if (level !== undefined) whereClause.level = Number(level);
    if (type) whereClause.type = type;
    if (superior) whereClause.superior = { contains: superior };
    if (referral_code) whereClause.referral_code = { contains: referral_code };

    // Get total count for pagination
    const totalCount = await prisma.user_info.count({
      where: whereClause,
    });

    // Get paginated data with balance information
    const users = await prisma.user_info.findMany({
      where: whereClause,
      include: {
        balance: true, // Include user balance data
      },
      orderBy: {
        created_at: 'desc',
      },
      take: Number(take),
      skip: cursor ? Number(cursor) : 0,
    });

    return NextResponse.json({
      data: users,
      nextCursor: users.length === Number(take) ? users[users.length - 1].id : null,
      total: totalCount,
    });
  } catch (error) {
    console.error('Error fetching user list:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
