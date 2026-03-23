import { NextRequest, NextResponse } from 'next/server';
import { setBanStatus, validateBearerToken } from '@/utils/auth';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    const { ban, addresses } = await req.json();
    try {
        const addressList = Array.isArray(addresses) ? addresses : [addresses];
        const results = [];
        console.log(`addresses: ${addressList}`)
        
        for (const address of addressList) {
            const success = await setBanStatus(address, ban);
            results.push({
                address,
                success,
                message: success ? `Set ban status to ${ban}` : 'Failed to update ban status'
            });
        }

        const allSucceeded = results.every(r => r.success);
        return NextResponse.json({
            status: allSucceeded ? 'success' : 'partial',
            results,
            message: allSucceeded 
                ? `Updated ban status for all addresses`
                : `Updated ban status with some failures. Success: ${results.filter(r => r.success).length}/${results.length}`
        });
    } catch (error) {
        console.error('Transaction abort error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }


}
