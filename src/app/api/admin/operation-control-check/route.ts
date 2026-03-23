import { NextRequest, NextResponse } from 'next/server';
import { operationControl, validateBearerToken } from '@/utils/auth';

export async function POST(req: NextRequest) {

    const validationResponse = validateBearerToken(req);
    if (validationResponse) {
      return validationResponse;
    }
    
    const keys = operationControl.keys();
    return NextResponse.json({
        keys: keys
    });
}
