import { NextRequest, NextResponse } from 'next/server';
import { validateBearerToken } from '@/utils/auth';
import { refreshCache } from '@/lib/config';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    await refreshCache();
    return NextResponse.json({
        status: 'success',
        message: 'Cache refreshed'
    });
}
