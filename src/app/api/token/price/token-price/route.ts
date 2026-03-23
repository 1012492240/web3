import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenPrice } from '@/lib/tokenPriceCandle';
import { NextRequest } from 'next/server';

/**
 * API route to get token price for a specific date
 * @route GET /api/token/price/token-price?datetime=YYYY-MM-DD:HH:MM:SS
 * @returns {object} JSON response with token price for the specified date
 */
export async function GET(request: NextRequest) {
    try {
        // Get datetime from query parameters
        const searchParams = request.nextUrl.searchParams;
        const datetimeParam = searchParams.get('datetime');
        
        let targetDate: Date;
        
        if (datetimeParam) {
            // Simple format validation: YYYY-MM-DD:HH:MM:SS
            const datetimeRegex = /^\d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}$/;
            if (!datetimeRegex.test(datetimeParam)) {
                return NextResponse.json(
                    { error: 'Invalid datetime format. Use format YYYY-MM-DD:HH:MM:SS (e.g., 2025-05-12:00:00:00).' },
                    { status: 400 }
                );
            }
            
            try {
                // Parse the datetime string (format: YYYY-MM-DD:HH:MM:SS)
                const parts = datetimeParam.split(/[-:]/);
                if (parts.length !== 6) {
                    throw new Error('Invalid format');
                }
                
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                const day = parseInt(parts[2]);
                const hour = parseInt(parts[3]);
                const minute = parseInt(parts[4]);
                const second = parseInt(parts[5]);
                
                // Create UTC date
                targetDate = new Date(Date.UTC(year, month, day, hour, minute, second));
                
                // Validate date is valid
                if (isNaN(targetDate.getTime())) {
                    throw new Error('Invalid date');
                }
            } catch (error) {
                return NextResponse.json(
                    { error: 'Invalid datetime. The datetime you provided does not exist or is in wrong format.' },
                    { status: 400 }
                );
            }
        } else {
            // Use current date in UTC if no date parameter provided
            targetDate = new Date();
        }
        
        // Get token price for the specified date
        const price = await getTokenPrice(undefined, targetDate);
        
        return NextResponse.json({
            timestamp: targetDate.toISOString(),
            price: price.toString(),
        });
    } catch (error) {
        console.error('Error getting token price:', error);
        return NextResponse.json(
            { error: 'Failed to get token price' },
            { status: 500 }
        );
    }
}
