import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateOperationHash, randomReferralCode, verifySignature } from '@/utils/auth';
import { MAX_TIMESTAMP_GAP_MS, UPDATE_REFERRAL } from '@/constants';
import { operationControl } from '@/utils/auth';
import { cleanUserMiningLevelPerformanceCache, getAllSubordinates, updateSuperiorNodeReward, updateUserPath } from '@/lib/user';
import { ErrorCode } from '@/lib/errors';
import { get } from 'http';
import { TxFlowStatus, TxFlowType, UserType } from '@prisma/client';

export async function POST(request: Request) {

    const body = await request.json();
    const { walletAddress, referralCode, operationType, timestamp, signature } = body;
    const lowerCaseAddress = walletAddress.toLowerCase()
    const hash = await generateOperationHash({
        operationType: UPDATE_REFERRAL,
        amount: 0,
        walletAddress,
        description: referralCode,
        timestamp
    });

    // Make sure the hash won't be reused
    const operationKey = `${lowerCaseAddress}:${operationType}`;
    if (operationControl.has(operationKey)) {
        return NextResponse.json(
            { error: ErrorCode.DUPLICATED_OPERATION },
            { status: 400 }
        );
    }
    operationControl.set(operationKey, true, MAX_TIMESTAMP_GAP_MS);

    const isValid = await verifySignature(walletAddress, signature, hash);
    if (!isValid) {
        return NextResponse.json(
            { error: ErrorCode.INVALID_SIGNATURE },
            { status: 401 }
        );
    }

    console.log(`update referral for ${lowerCaseAddress} with code ${referralCode}`)

    const superior = await prisma.user_info.findUnique({
        where: { referral_code: referralCode },
        select: { address: true, path: true }
    });

    const user = await prisma.user_info.findUnique({
        where: { address: lowerCaseAddress },
        select: { superior: true, id: true, type: true, path: true }
    });

    if (!user || !user.path || user?.superior || lowerCaseAddress === superior?.address) {
        return NextResponse.json(
            { error: ErrorCode.NOT_FOUND },
            { status: 400 }
        );
    }

    if (!superior || !superior.path) {
        return NextResponse.json(
            { error: ErrorCode.NOT_FOUND },
            { status: 400 }
        );
    }

    const subordinates = await getAllSubordinates(user.path)
    const superiors = superior.path.split('.')

    // Check if any subordinate's ID is already in superior's path
    if (superior.path && subordinates.some(sub => superiors.includes(`${sub.id}`))) {
        console.error(`One of the subordinate's IDs is already in superior's path, ${superiors}`);
        return NextResponse.json(
            { error: ErrorCode.OPERATION_FAILED },
            { status: 400 }
        );
    }


    await prisma.user_info.update({
        where: { address: lowerCaseAddress },
        data: {
            superior: superior.address,
            last_activity: new Date()
        }
    });

    for (const user of subordinates) {
        if (!user.path) {
            console.error(`User ${user.id} has no path`);
            continue;
        }
        await updateUserPath(user.id, superior.path, prisma, user.path);
    }


    const tx = await prisma.transaction.findFirst({
        where: {
            from_address: lowerCaseAddress,
            type: TxFlowType.LOCK,
            status: TxFlowStatus.CONFIRMED
        },
        select: { id: true, description: true }
    })

    if (tx && (tx.description === "" || !tx.description)) {
        console.log(`Rereward for ${lowerCaseAddress}, tx id: ${tx.id}`)
        await prisma.transaction.update({
            where: { id: tx.id },
            data: {
                status: TxFlowStatus.PENDING
            }
        })
    }

    return NextResponse.json({
        data: true
    })
}
