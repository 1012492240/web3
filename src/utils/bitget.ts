/**
 * Bitget API utilities for interacting with the Bitget cryptocurrency exchange
 */
import { getValue, setWithExpiry } from '@/lib/redis';
import axios from 'axios';

// Bitget API base URL
const BITGET_API_BASE_URL = 'https://api.bitget.com/api/v2';

// Cache expiration time in milliseconds (10 seconds)
const CACHE_EXPIRY_MS = 10000;

/**
 * Get the current price for token from Bitget exchange using direct API call with Redis caching.
 *
 * @param symbol - Trading pair symbol (e.g., 'tokenUSDT')
 * @returns The current price of the trading pair as a float
 * @throws Exception if the API request fails
 */
export async function getPrice(symbol: string = 'BNBUSDT'): Promise<number> {
  try {
    // Create a unique cache key for this symbol
    const cacheKey = `bitget_price:${symbol}`;
    
    // Try to get price from Redis cache first
    const cachedPrice = await getValue(cacheKey);
    
    if (cachedPrice) {
      // Return cached price if available
      return parseFloat(cachedPrice);
    }
    
    // If not in cache, fetch from API using axios instead of fetch
    const url = `https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`;
    
    const response = await axios.get(url, {
      timeout: 15000, // 15 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)',
        'Accept': 'application/json'
      }
    });
    
    const data = response.data;
    
    // Check if the API response is valid
    if (data.code === '00000' && data.data && data.data.length > 0) {
      const currentPrice = data.data[0].lastPr;
      
      // Store in Redis cache with expiration
      await setWithExpiry(cacheKey, currentPrice, CACHE_EXPIRY_MS);
      
      return parseFloat(currentPrice);
    } else {
      throw new Error(`Failed to get price: ${data.msg || 'No price data returned'}`);
    }
  } catch (error) {
    console.error('Error fetching token price from Bitget:', error);
    
    // Return a fallback price in case of error
    return 0;
  }
}
