import { NextRequest, NextResponse } from 'next/server';
import { TimeInterval } from '@prisma/client';
import { getTokenPrice, updateCandleWithCurrentPrice } from '@/lib/tokenPriceCandle';
import decimal from 'decimal.js';
import { validateBearerToken } from '@/utils/auth';

/**
 * API route to compensate missing token price data for a specific time period
 * This will generate price data for each minute in the specified range
 * @route POST /api/token/price/compensate
 * @body { startDate: string, endDate: string }
 * Format: YYYY-MM-DD (date only) or YYYY-MM-DDThh:mm:ssZ (with time)
 * @returns {object} JSON response with compensation results
 */
export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const { startDate, endDate } = await req.json();

        const validationResponse = validateBearerToken(req);
        if (validationResponse) {
            return validationResponse;
        }

        // Validate dates and handle date-only format
        let start: Date, end: Date;

        // Check if dates are in YYYY-MM-DD format (without time)
        if (startDate.length === 10 && startDate.includes('-')) {
            // If date-only format, set time to start of day (00:00:00)
            start = new Date(`${startDate}T00:00:00Z`);
        } else {
            start = new Date(startDate);
        }

        if (endDate.length === 10 && endDate.includes('-')) {
            // If date-only format, set time to end of day (23:59:59)
            end = new Date(`${endDate}T23:59:59Z`);
        } else {
            end = new Date(endDate);
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid date format' },
                { status: 400 }
            );
        }

        if (start > end) {
            return NextResponse.json(
                { success: false, error: 'Start date must be before end date' },
                { status: 400 }
            );
        }

        // Limit the range to prevent excessive processing
        const maxDays = 7; // Maximum 7 days at a time
        const maxMilliseconds = maxDays * 24 * 60 * 60 * 1000;

        if (end.getTime() - start.getTime() > maxMilliseconds) {
            return NextResponse.json(
                { success: false, error: `Time range too large. Maximum ${maxDays} days allowed` },
                { status: 400 }
            );
        }

        // Process each minute in the range
        const results = {
            processedMinutes: 0,
            updatedCandles: {
                FIVE_MIN: 0,
                FIFTEEN_MIN: 0,
                THIRTY_MIN: 0,
                ONE_HOUR: 0,
                ONE_DAY: 0,
                ONE_WEEK: 0
            }
        };

        // Define intervals to update
        const intervals = [
            "FIVE_MIN",
            "FIFTEEN_MIN",
            "THIRTY_MIN",
            "ONE_HOUR",
            "ONE_DAY",
            "ONE_WEEK"
        ] as TimeInterval[];

        // Process each minute
        const currentTime = new Date(start.getTime());
        while (currentTime <= end) {
            // Get token price for this specific time
            const price = await getTokenPrice(new Date(2025, 11, 4), currentTime);
            console.log(`price:${price}, currentTime:${currentTime}`)

            //Update candles for each interval
            for (const interval of intervals) {
                await updateCandleWithCurrentPrice(interval, currentTime, price);
                results.updatedCandles[interval]++;
            }

            // Move to next minute
            currentTime.setMinutes(currentTime.getMinutes() + 1);
            results.processedMinutes++;
        }

        return NextResponse.json({
            success: true,
            message: 'Price data compensation completed successfully',
            results
        });
    } catch (error) {
        console.error('Error compensating price data:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
