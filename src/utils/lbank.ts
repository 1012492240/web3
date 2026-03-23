/**
 * LBank API utilities for interacting with the LBank cryptocurrency exchange
 */
import { getValue, setWithExpiry } from '@/lib/redis';

// LBank API base URL
const LBANK_API_BASE_URL = 'https://www.lbkex.net/v2';

// Cache expiration time in milliseconds (10 seconds)
const CACHE_EXPIRY_MS = 10000;


/**
 * Get the current price for a given symbol using direct API call with Redis caching.
 *
 * @param symbol - Trading pair symbol (e.g., 'token_usdt')
 * @returns The current price of the trading pair as a float
 * @throws Exception if the API request fails
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    // Create a unique cache key for this symbol
    const cacheKey = `lbank_price:${symbol}`;
    
    // Try to get price from Redis cache first
    const cachedPrice = await getValue(cacheKey);
    
    if (cachedPrice) {
      // Return cached price if available
      return parseFloat(cachedPrice);
    }
    
    // If not in cache, fetch from API
    const url = `${LBANK_API_BASE_URL}/supplement/ticker/price.do?symbol=${symbol}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the API response is valid
    if (data.result && data.data && data.data.length > 0) {
      const currentPrice = data.data[0].price;

      if (parseFloat(currentPrice) > 2 || parseFloat(currentPrice) < 0.5) {
        console.log(`token price is too high or too low: ${currentPrice}`);
        return 1;
      }
      
      // Store in Redis cache with 10s expiration
      await setWithExpiry(cacheKey, currentPrice, CACHE_EXPIRY_MS);
      
      return parseFloat(currentPrice);
    } else {
      throw new Error(`Failed to get current price: ${data.error_code || 'No price data returned'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`LBank API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while fetching price');
    }
  }
}