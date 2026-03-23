import { NextRequest, NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';

export async function GET(req: NextRequest) {
  try {
    // Generate a new random keypair
    const keypair = Keypair.generate();
    
    // Get the public key as base-58 string
    const address = keypair.publicKey.toBase58();
    
    return NextResponse.json({
      status: 'success',
      address
    });
  } catch (error) {
    console.error('Error generating address:', error);
    return NextResponse.json(
      { error: 'Failed to generate address' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { count = 1 } = await req.json();
    
    // Generate multiple addresses if requested
    const addresses = Array.from({ length: Math.min(count, 100) }, () => {
      const keypair = Keypair.generate();
      return keypair.publicKey.toBase58();
    });
    
    return NextResponse.json({
      status: 'success',
      addresses
    });
  } catch (error) {
    console.error('Error generating addresses:', error);
    return NextResponse.json(
      { error: 'Failed to generate addresses' },
      { status: 500 }
    );
  }
}
