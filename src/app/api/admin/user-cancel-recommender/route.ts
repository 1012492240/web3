import { NextRequest, NextResponse } from 'next/server';
import { validateBearerToken } from '@/utils/auth';
import prisma from '@/lib/prisma';
import path from 'path';
import { getAllSubordinates } from '@/lib/user';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
        return validationResponse;
    }

    // Query user
    const { address } = await req.json();

    const user = await prisma.user_info.findUnique({
        where: { address },
        select: { id: true, superior: true, path: true }
    });


    // Query superior's path only if superior exists
    if (!user || !user.superior || !user.path) {
        return NextResponse.json(
            { error: 'User has no superior' },
            { status: 400 }
        );
    }

    const superior = await prisma.user_info.findUnique({
        where: { address: user.superior },
        select: { path: true }
    });

    if (!superior || !superior.path) {
        return NextResponse.json(
            { error: 'Superior not found' },
            { status: 404 }
        );
    }

    try {
        const subordinates = await getAllSubordinates(user.path);

        for (const subordinate of subordinates) {
            if (!subordinate.path) {
                throw new Error('Subordinate has no path');
            }
            // Remove the superior's path prefix (including the dot) from the subordinate's path
            const newPath = subordinate.path.replace(`${superior.path}.`, '');
            // Update depth

            const newDepth = newPath.split('.').length - 1;
            await prisma.user_info.update({
                where: { address: subordinate.address },
                data: {
                    path: newPath,
                    depth: newDepth,
                    superior: newDepth <= 0 ? null : undefined
                }
            });

        }
    } catch (error) {
        console.error('Cancel recommender error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        status: 'success',
        message: 'Recommender cancelled'
    });
}
