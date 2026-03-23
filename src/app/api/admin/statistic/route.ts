import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET endpoint to retrieve user counts grouped by level
export async function GET() {
  try {
    // Execute the query to get user counts by level
    const userLevelStats = await prisma.$queryRaw`
      SELECT count(*), level FROM user_info GROUP BY level ORDER BY level
    `;

    // Convert BigInt values to numbers for JSON serialization
    const serializedStats = (userLevelStats as any[]).map(stat => ({
      count: Number(stat.count),
      level: stat.level
    }));

    return NextResponse.json({
      data: serializedStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user level statistics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
    // Validate admin authentication

  try {
    const { startDate, endDate } = await req.json();

    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Invalid or missing date parameters. At least one date must be provided in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Build the query dynamically based on provided date parameters
    let query = `
      SELECT 
        SUM(amount) as total_amount, 
        type, 
        token_type 
      FROM transaction 
      WHERE status = 'CONFIRMED'
    `;
    
    // Add date filters if provided
    const queryParams: any[] = [];
    if (startDate) {
      query += ` AND created_at >= $${queryParams.length + 1}::timestamp`;
      queryParams.push(startDate);
    }
    if (endDate) {
      query += ` AND created_at <= $${queryParams.length + 1}::timestamp`;
      queryParams.push(endDate);
    }
    
    // Complete the query
    query += ` GROUP BY type, token_type LIMIT 100`;
    
    // Execute the query
    const transactionStats = await prisma.$queryRawUnsafe(query, ...queryParams);

    return NextResponse.json({
      data: transactionStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// Helper function to validate date format
function isValidDate(dateString: string): boolean {
  // Check if the string matches YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Check if it's a valid date
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;
  
  return date.toISOString().startsWith(dateString);
}