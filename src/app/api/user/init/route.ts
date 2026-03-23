import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomReferralCode } from '@/utils/auth';
import { updateUserPath } from '@/lib/user';
export async function POST(request: Request) {

    const body = await request.json();
    const { address, referralCode } = body;

    const exist = await prisma.user_info.findUnique({
        where: { address: address.toLowerCase() },
        select: { address: true, type: true, level: true }
    });

    if (exist) {
        return NextResponse.json({
            exist: true,
            data: exist
        })
    }

    let superior: { address: string, path: string | null } | null = null;
    if (referralCode) {
        superior = await prisma.user_info.findUnique({
            where: { referral_code: referralCode },
            select: { address: true, path: true }
        });
    }


    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user_info.create({
                data: {
                    address: address.toLowerCase(),
                    superior: superior?.address || null,
                    referral_code: randomReferralCode(address.toLowerCase()),
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

            await updateUserPath(user.id, superior?.path || null, tx);
        });
    } catch (e) {
        console.error('user init transaction failed:', e);
        return NextResponse.json(
            { error: 'USER_INIT_FAILED' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        exist: true,
        data: {
            address: address.toLowerCase(),
        }
    })
}