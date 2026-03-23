"use client";

import React, { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface CandleData {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

interface PriceChartProps {
  data: CandleData[];
  interval: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, interval }) => {
  console.log(`PriceChart rendering with interval: ${interval}, data length: ${data.length}`);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300, // Reduced from 500px to 300px
      layout: {
        background: { color: "#1e1e1e" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2a2a2a" },
        horzLines: { color: "#2a2a2a" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: interval === "FIVE_MIN" || interval === "FIFTEEN_MIN",
        borderColor: "#2a2a2a",
      },
      // Optimized price scale settings
      rightPriceScale: {
        borderColor: "#2a2a2a",
        scaleMargins: {
          top: 0.05, // Reduced top margin
          bottom: 0.05, // Reduced bottom margin
        },
      },
    });

    // Add window resize listener
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Save references
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, [interval]); // Re-initialize chart when interval changes

  // Update data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) return;

    // Format data for the chart
    const candleData = data.map((item) => ({
      time: new Date(item.timestamp).getTime() / 1000,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    }));

    // Set data
    candlestickSeriesRef.current.setData(candleData);

    // Fit content
    if (chartRef.current && candleData.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />;
};

export default PriceChart;
