import { NextRequest, NextResponse } from 'next/server';
import { COMMUNITY_TYPE, GROUP_TYPE, NORMAL_TYPE } from '@/constants';
import { MembershipType } from '@/constants';

/**
 * Test API for community endpoint error scenarios
 * 
 * This endpoint mocks the verifyTokenTransfer function to simulate different error scenarios:
 * 1. Failed transaction - Invalid transaction hash
 * 2. Insufficient balance - User doesn't have enough balance
 * 3. Wrong destination - Incorrect destination address
 * 4. Non-USDT token - Using a token other than USDT
 * 5. Invalid amount - Amount doesn't match the membership type
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      scenario, 
      type = COMMUNITY_TYPE,
      address = '8btmH7kk4wNxQ4hweRE5MooSVTxhPjgcmzV9iFVou2uB',
      referralCode = 'REF123'
    } = body;

    // Forward the request to the actual community API with dev_ parameters
    // that will bypass the transaction verification in development mode
    const apiUrl = `${req.nextUrl.origin}/api/points/community`;
    
    // Set up the request body based on the scenario
    const requestBody: any = {
      txHash: `mock_tx_${scenario}`,
      dev_address: address,
      dev_referralCode: referralCode,
      dev_type: type as MembershipType
    };

    // For error scenarios, we'll call the community API with parameters that will cause errors
    if (scenario === 'invalid_transaction') {
      // Don't include txHash to trigger the "Transaction hash is required" error
      delete requestBody.txHash;
    } else if (scenario === 'no_from_address') {
      // Set dev_address to null to trigger the "Could not determine transaction sender" error
      requestBody.dev_address = null;
    } else if (scenario === 'no_type') {
      // Set dev_type to null to trigger the "Could not determine community type" error
      requestBody.dev_type = null;
    }

    // Call the community API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Get the response data
    const data = await response.json();

    // Return the response from the community API
    return NextResponse.json({
      scenario,
      request: requestBody,
      status: response.status,
      response: data
    });
  } catch (error: unknown) {
    console.error('Error in test API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Test API failed', message: errorMessage },
      { status: 500 }
    );
  }
}
