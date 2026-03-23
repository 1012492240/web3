import { getTokenPrice } from '@/lib/tokenPriceCandle'
import { NextResponse } from 'next/server'


// Symbol for TOKEN/USDT pair on LBank
const FEE_TOKEN_USDT_SYMBOL = 'BNBUSDT'
const TOKEN_USDT_SYMBOL = 'TXTUSDT'

/**
 * API route to get the current TOKEN/USDT price from LBank
 * @route GET /api/info/token-price
 * @returns {object} JSON response with price data or error message
 */
export async function GET() {
  try {
    const tokenPrice = await getTokenPrice()
    
    // Return the price data
    return NextResponse.json({
      success: true,
      data: {
        //feeTokenPrice: feeTokenPrice,
        tokenPrice: tokenPrice,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching token price:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}