import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenPrice } from '@/lib/tokenPriceCandle';

/**
 * API route to get token price information including 24h high, low, volume, and market cap
 * @route GET /api/token/price/info
 * @returns {object} JSON response with token price information
 */
export async function GET() {
  try {
    // Get current token price
    const currentPrice = await getTokenPrice();
    
    // Get 24h high and low from candles
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const candles = await prisma.token_price_candle.findMany({
      where: {
        interval: "ONE_HOUR",
        timestamp: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Calculate high, low, and volume
    let highPrice = parseFloat(currentPrice.toString());
    let lowPrice = parseFloat(currentPrice.toString());
    let volume = 0;
    
    if (candles.length > 0) {
      // Find highest and lowest prices in the last 24 hours
      highPrice = candles.reduce((max, candle) => {
        const high = parseFloat(candle.high_price.toString());
        return high > max ? high : max;
      }, parseFloat(candles[0].high_price.toString()));
      
      lowPrice = candles.reduce((min, candle) => {
        const low = parseFloat(candle.low_price.toString());
        return low < min ? low : min;
      }, parseFloat(candles[0].low_price.toString()));
      
      // Sum up volume
      volume = candles.reduce((sum, candle) => {
        return sum + parseFloat(candle.volume.toString());
      }, 0);
    }
    
    // Calculate market cap (example calculation - replace with actual formula if different)
    // Assuming total supply is 100,000,000 TXT
    const totalSupply = 100000000;
    const marketCap = parseFloat(currentPrice.toString()) * totalSupply;
    
    // Format numbers for display
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(3) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      } else {
        return num.toFixed(2);
      }
    };
    
    // Calculate 24h price change percentage
    let priceChangePercent = 0;
    if (candles.length > 0) {
      const oldestPrice = parseFloat(candles[0].open_price.toString());
      const latestPrice = parseFloat(currentPrice.toString());
      priceChangePercent = ((latestPrice - oldestPrice) / oldestPrice) * 100;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        currentPrice: currentPrice.toString(),
        high24h: highPrice.toString(),
        low24h: lowPrice.toString(),
        volume24h: formatNumber(volume),
        marketCap: formatNumber(marketCap),
        priceChangePercent: priceChangePercent.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching token price info:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
