import { createClient } from 'redis';

// Read Redis URL from environment variables
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a singleton Redis client with connection pooling
let redisClient: ReturnType<typeof createClient> | undefined;

// Track active operations to manage connections properly
let activeOperations = 0;
let connectionCloseTimer: NodeJS.Timeout | null = null;

// Get Redis client (connects if needed)
export const getRedisClient = async () => {
  // Create the client only once
  if (!redisClient) {
    redisClient = createClient({
      url: redisUrl,
      // Add connection pool configuration
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
      }
    });
    
    // Handle connection errors
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      // Reset client on error to force recreation
      if (redisClient) {
        try {
          redisClient.quit().catch(console.error);
        } catch (e) {
          console.error('Error closing Redis connection:', e);
        }
        redisClient = undefined;
      }
    });
  }
  
  // Connect if not already connected
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis client connected');
  }
  
  // Track active operations
  activeOperations++;
  if (connectionCloseTimer) {
    clearTimeout(connectionCloseTimer);
    connectionCloseTimer = null;
  }
  
  return redisClient;
};

// Release Redis client when operation is complete
export const releaseRedisClient = async () => {
  activeOperations--;
  
  // If no active operations, schedule connection close
  if (activeOperations <= 0) {
    activeOperations = 0; // Ensure we don't go negative
    
    // Schedule connection close after idle period
    if (!connectionCloseTimer) {
      connectionCloseTimer = setTimeout(async () => {
        if (redisClient && redisClient.isOpen && activeOperations === 0) {
          try {
            await redisClient.quit();
            console.log('Redis connection closed due to inactivity');
            redisClient = undefined;
          } catch (e) {
            console.error('Error closing Redis connection:', e);
          }
        }
        connectionCloseTimer = null;
      }, 10000); // Close after 10 seconds of inactivity
    }
  }
};

// Wrapper function to automatically manage Redis connections
export const withRedis = async <T>(operation: (client: ReturnType<typeof createClient>) => Promise<T>): Promise<T> => {
  const client = await getRedisClient();
  try {
    return await operation(client);
  } finally {
    await releaseRedisClient();
  }
};

// No longer needed as it's integrated into getRedisClient
// export const connectRedis = async () => { ... };

// Set a key with expiration
export const setWithExpiry = async (key: string, value: string, expiryInMs: number) => {
  try {
    const client = await getRedisClient();
    await client.set(key, value, {
      PX: expiryInMs // PX sets expiry in milliseconds
    });
  } catch (e) {
    console.warn('[redis] setWithExpiry failed (cache disabled for this op):', key, e);
  }
};

// Get a value by key（Redis 不可用时视为未命中，避免整站接口 500）
export const getValue = async (key: string): Promise<string | null> => {
  try {
    const client = await getRedisClient();
    return await client.get(key);
  } catch (e) {
    console.warn('[redis] getValue failed (treating as miss):', key, e);
    return null;
  }
};

// Delete a key（finally 中调用时不能抛错，否则会把业务逻辑拖成 500）
export const deleteKey = async (key: string) => {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (e) {
    console.warn('[redis] deleteKey failed:', key, e);
  }
};

// Delete keys by pattern
export const deleteKeysByPattern = async (pattern: string) => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (e) {
    console.warn('[redis] deleteKeysByPattern failed:', pattern, e);
  }
};
