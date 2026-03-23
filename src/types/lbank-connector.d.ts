/**
 * Type declarations for @lbankcom/lbank-connector
 */

declare module '@lbankcom/lbank-connector' {
  interface SpotOptions {
    baseURL?: string;
    apiKey?: string;
    secretKey?: string;
    signMethod?: 'RSA' | 'HMACSHA256';
    logger?: any;
  }

  interface MarketEndpoint {
    price(arg0: { symbol: string; }): Promise<{
      data: Array<{
        symbol: string;
        price: string;
      }>;
    }>;
    tickerPrice(params: { symbol: string }): Promise<{
      data: Array<{
        symbol: string;
        price: string;
      }>;
    }>;
  }

  export class Spot {
    constructor(options: SpotOptions);
    createMarket(): MarketEndpoint;
  }
}
