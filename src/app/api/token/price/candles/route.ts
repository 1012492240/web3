import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/tokenPriceCandle";
import { TimeInterval } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const intervalParam = searchParams.get("interval") || "ONE_HOUR";
    const startTimeParam = searchParams.get("startTime");
    const endTimeParam = searchParams.get("endTime");
    
    // Validate interval
    let interval: TimeInterval;
    try {
      interval = intervalParam as TimeInterval;
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid interval: ${intervalParam}` },
        { status: 400 }
      );
    }
    
    // Parse start and end times
    const now = new Date();
    let startTime = startTimeParam ? new Date(startTimeParam) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
    let endTime = endTimeParam ? new Date(endTimeParam) : now;
    
    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }
    
    // Get candles
    const candles = await getCandles(interval, startTime, endTime);
    
    // Format response
    const formattedCandles = candles.map((candle: any) => ({
      timestamp: candle.timestamp,
      open: candle.open_price.toString(),
      close: candle.close_price.toString(),
      high: candle.high_price.toString(),
      low: candle.low_price.toString(),
      volume: candle.volume.toString()
    }));
    
    return NextResponse.json({ candles: formattedCandles });
  } catch (error) {
    console.error("Error fetching candles:", error);
    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    );
  }
}
