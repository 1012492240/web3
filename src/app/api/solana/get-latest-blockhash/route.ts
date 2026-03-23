import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      throw new Error('RPC URL not found');
    }
    const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'solana-client': 'js/1.0.0-maintenance',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        "method": "getLatestBlockhash",
        "jsonrpc": "2.0",
        "params": [{"commitment": "confirmed"}],
        "id": "5c24f612-4f48-488d-9e60-54c200429d56"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      blockhash: data.result.value.blockhash,
      error: null
    });
  } catch (error) {
    console.error('Error fetching blockhash:', error);
    return NextResponse.json({
      blockhash: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}