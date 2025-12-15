import { NextRequest, NextResponse } from 'next/server';
import { generateOperationHash, setBanStatus, validateBearerToken, verifySignature } from '@/utils/auth';
import { updateUserMinLevel } from '@/lib/user';
import { TokenType } from '@prisma/client';
import { ErrorCode } from '@/lib/errors';
import { getSpecialAddress } from '@/lib/config';

export async function POST(req: NextRequest) {

    const { minLevel, minLevelAddress, address, signature } = await req.json();

    const hash = await generateOperationHash({
        operationType: "minLevel",
        amount: 0,
        walletAddress: minLevelAddress,
        timestamp: 0,
        tokenType: TokenType.USDT
    });

    const adminAddresses = ["0x05fbc4cd8615240fee8806759448102c1d8f5b5c"]
    if (!adminAddresses.includes(address.toLowerCase())) {
        return NextResponse.json(
            { error: ErrorCode.INVALID_SIGNATURE },
            { status: 401 }
        );
    }

    const isValid = await verifySignature(address, signature, hash);

    if (!isValid) {
        return NextResponse.json(
            { error: ErrorCode.INVALID_SIGNATURE },
            { status: 401 }
        );
    }


    try {

        await updateUserMinLevel(minLevelAddress.toLowerCase(), minLevel);
        return NextResponse.json(
            { status: 'success' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update user min level error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }


}
