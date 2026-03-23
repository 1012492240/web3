import { NextRequest, NextResponse } from 'next/server';
import { TxFlowType, TokenType } from '@prisma/client';
import { processBalanceUpdate, processDynamicRewardCapBatch } from '@/lib/balance';
import prisma from '@/lib/prisma';
import decimal from 'decimal.js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, dynamicR, incubationR } = body;

        await processDynamicRewardCapBatch(address, new decimal(dynamicR), new decimal(incubationR), new decimal(1), 2025, 6, 7)

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error('Error in balance test:', error);
        return NextResponse.json(
            { error: 'Failed to process balance update' },
            { status: 500 }
        );
    }
}

