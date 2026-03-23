import { NextRequest, NextResponse } from 'next/server';
import { setBanStatus, validateBearerToken } from '@/utils/auth';
import { setGalaxy } from '@/lib/user';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    const { addresses } = await req.json();
    try {
        const addressList = Array.isArray(addresses) ? addresses : [addresses];
        const results = [];
        console.log(`addresses: ${addressList}`)
        
        for (const address of addressList) {
            await setGalaxy(address.toLowerCase());
            results.push({
                address,
                success: true,
                message: 'Set galaxy status to true'
            });
        }

        const allSucceeded = results.every(r => r.success);
        return NextResponse.json({
            status: allSucceeded ? 'success' : 'partial',
            results,
            message: allSucceeded 
                ? `Updated galaxy status for all addresses`
                : `Updated galaxy status with some failures. Success: ${results.filter(r => r.success).length}/${results.length}`
        });
    } catch (error) {
        console.error('Transaction abort error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }


}
