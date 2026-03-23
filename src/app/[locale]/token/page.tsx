"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// Import chart component dynamically to avoid SSR issues
const Chart = dynamic(() => import("@/components/token/PriceChart"), {
  ssr: false,
});

// Define time interval options
const timeIntervals = [
  { value: "FIVE_MIN", label: "5m" },
  { value: "FIFTEEN_MIN", label: "15m" },
  { value: "THIRTY_MIN", label: "30m" },
  { value: "ONE_HOUR", label: "1h" },
  { value: "ONE_DAY", label: "1d" },
  { value: "ONE_WEEK", label: "1w" },
];

export default function TokenPage() {
  const t = useTranslations();
  const [selectedInterval, setSelectedInterval] = useState("ONE_HOUR");
  const [candleData, setCandleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marketInfo, setMarketInfo] = useState({
    high24h: "0.12",
    low24h: "0.09",
    volume24h: "1.384M",
    marketCap: "$10,000,000",
    priceChangePercent: "0"
  });

  // Fetch market info on component mount
  useEffect(() => {
    const fetchMarketInfo = async () => {
      try {
        const response = await fetch(`/api/token/price/info`);
        
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          return;
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setMarketInfo({
            high24h: data.data.high24h,
            low24h: data.data.low24h,
            volume24h: data.data.volume24h,
            marketCap: data.data.marketCap,
            priceChangePercent: data.data.priceChangePercent
          });
        }
      } catch (err) {
        console.error("Error fetching market info:", err);
      }
    };
    
    fetchMarketInfo();
  }, []);

  // Fetch candle data when interval changes
  useEffect(() => {
    const fetchCandleData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Calculate default date range (7 days for most intervals, 30 days for 1d, 6 months for 1w)
        let daysToFetch = 7;
        if (selectedInterval === "ONE_DAY") daysToFetch = 30;
        if (selectedInterval === "ONE_WEEK") daysToFetch = 180;
        
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - daysToFetch * 24 * 60 * 60 * 1000);
        
        // Fetch data from API
        const apiUrl = `/api/token/price/candles?interval=${selectedInterval}&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCandleData(data.candles || []);
      } catch (err) {
        console.error("Error fetching candle data:", err);
        setError("Failed to load chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandleData();
  }, [selectedInterval]);

  return (
    <div className="flex flex-col h-full">
      {/* Main content area with bottom padding for nav and top padding for header */}
      <div className="flex-1 pb-16 pt-24">
        <div className="p-4 bg-black text-white">  
          {/* Header with TXT/USDT and market stats */}
          <div className="flex flex-row justify-between items-start mb-4">
            {/* Left side: TXT/USDT with current price and interval selector */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <div className="text-xs font-medium mr-1">TXT/USDT</div>
              </div>
              <div className="mt-0.5">
                <div className="text-base font-bold text-red-500">
                  {candleData.length > 0 ? candleData[candleData.length - 1].close : "0.038"}
                </div>
                <div className="text-xs text-gray-400 flex items-center justify-between">
                  <span>≈ $ {candleData.length > 0 ? candleData[candleData.length - 1].close : "0.038"}</span> 
                  <span className={parseFloat(marketInfo.priceChangePercent) >= 0 ? "text-green-500" : "text-red-500"}>
                    {parseFloat(marketInfo.priceChangePercent) >= 0 ? "+" : ""}{marketInfo.priceChangePercent}%
                  </span>
                </div>
              </div>
              
              {/* Interval selector - below price */}
              <div className="mt-1.5">
                <div className="inline-flex rounded overflow-hidden border border-gray-600 text-[10px]">
                  {/* <button 
                    onClick={() => {
                      setSelectedInterval("FIVE_MIN");
                      setCandleData([]);
                      setLoading(true);
                    }}
                    className={`px-1 py-0.5 text-white border-r border-gray-600 ${selectedInterval === "FIVE_MIN" ? "bg-gray-700" : ""}`}
                  >
                    5分
                  </button> */}
                  <button 
                    onClick={() => {
                      setSelectedInterval("FIFTEEN_MIN");
                      setCandleData([]);
                      setLoading(true);
                    }}
                    className={`px-1 py-0.5 text-white border-r border-gray-600 ${selectedInterval === "FIFTEEN_MIN" ? "bg-gray-700" : ""}`}
                  >
                    15分
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedInterval("ONE_HOUR");
                      setCandleData([]);
                      setLoading(true);
                    }}
                    className={`px-1 py-0.5 text-white border-r border-gray-600 ${selectedInterval === "ONE_HOUR" ? "bg-gray-700" : ""}`}
                  >
                    1时
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedInterval("ONE_DAY");
                      setCandleData([]);
                      setLoading(true);
                    }}
                    className={`px-1 py-0.5 text-white border-r border-gray-600 ${selectedInterval === "ONE_DAY" ? "bg-gray-700" : ""}`}
                  >
                    1日
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedInterval("ONE_WEEK");
                      setCandleData([]);
                      setLoading(true);
                    }}
                    className={`px-1 py-0.5 text-white ${selectedInterval === "ONE_WEEK" ? "bg-gray-700" : ""}`}
                  >
                    1周
                  </button>
                </div>
              </div>
            </div>

            {/* Market stats */}
            <div className="self-start text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 mr-2">24h最高</span>
                <span className="text-white">{marketInfo.high24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 mr-2">24h最低</span>
                <span className="text-white">{marketInfo.low24h}</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-400 mr-2">24h量 (TXT)</span>
                <span className="text-white">{marketInfo.volume24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 mr-2">市值</span>
                <span className="text-white">${marketInfo.marketCap}</span>
              </div> */}
            </div>
          </div>
          
          
          {/* Chart container */}
          <div className="bg-gray-900 rounded-lg p-4 h-[320px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                {error}
              </div>
            ) : (
              <Chart data={candleData} interval={selectedInterval} />
            )}
          </div>
          
          {/* Volume chart */}
          {/* <div className="mt-4 bg-gray-900 rounded-lg p-4 h-[150px] relative">
            <div className="absolute top-2 left-2 text-xs text-gray-400">VOL:618,960.11</div>
            <div className="absolute top-2 right-2 text-xs text-gray-400">4,122,320.82</div>
            <div className="flex items-center justify-center h-full">
              <div className="w-full h-[80px] flex items-end justify-between px-4">
                {Array(20).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 ${i % 2 === 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ height: `${20 + Math.random() * 60}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
