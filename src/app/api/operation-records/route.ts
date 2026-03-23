import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateBearerToken } from '@/utils/auth';
import { getUserAddressById } from '@/lib/userCache';

export async function POST(req: NextRequest) {

  try {
    const { address, isSuperior, type, page = 1, pageSize = 10, startDate, endDate } = await req.json();
    const lowCaseAddress = address.toLowerCase()
    // Validate required parameters
    if (!isSuperior || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: isSuperior and type are required.' },
        { status: 400 }
      );
    }
    
    // Only look up user if address is provided
    let user = null;
    if (lowCaseAddress) {
      user = await prisma.user_info.findUnique({
        where: { address: lowCaseAddress },
        select: { id: true }
      });
      
      // If address is provided but user doesn't exist, return error
      if (!user) {
        return NextResponse.json(
          { error: 'User not found with the provided address.' },
          { status: 404 }
        );
      }
    }

    // Calculate offset for pagination
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    
    let totalCountResult: any;
    let userId: number | undefined;
    let transactions: any[] = [];
    
    // Different query based on table selection and whether we're looking for superior's transactions or direct transactions
    if (type === 'FLASH_SWAP') {
      // For FLASH_SWAP, use tx_flow table
      if (isSuperior === 'true' && user) {
        // Get user ID for path query
        userId = user.id;
        
        // Using parameterized query for subordinates - use 'FLASH_SWAP' directly as a string literal
        let countQuery = `SELECT COUNT(*) as count, sum(amount) as total_amount FROM tx_flow WHERE type::text = $1 AND user_address IN (SELECT address FROM user_info WHERE path LIKE $2)`;
        const countParams = ['FLASH_SWAP', '%.' + userId + '.%'];
        
        if (startDate) {
          countQuery += ` AND created_at >= $${countParams.length + 1}::timestamp`;
          countParams.push(startDate);
        }
        
        if (endDate) {
          countQuery += ` AND created_at <= $${countParams.length + 1}::timestamp`;
          countParams.push(endDate);
        }
        
        totalCountResult = await prisma.$queryRawUnsafe(countQuery, ...countParams);
      } else if (lowCaseAddress) {
        // Using parameterized query for direct transactions
        let countQuery = `SELECT COUNT(*) as count, sum(amount) as total_amount FROM tx_flow WHERE type::text = $1 AND user_address = $2`;
        const countParams = ['FLASH_SWAP', lowCaseAddress];
        
        if (startDate) {
          countQuery += ` AND created_at >= $${countParams.length + 1}::timestamp`;
          countParams.push(startDate);
        }
        
        if (endDate) {
          countQuery += ` AND created_at <= $${countParams.length + 1}::timestamp`;
          countParams.push(endDate);
        }
        
        totalCountResult = await prisma.$queryRawUnsafe(countQuery, ...countParams);
      } else {
        // Using parameterized query for all records
        let countQuery = `SELECT COUNT(*) as count, sum(amount) as total_amount FROM tx_flow WHERE type::text = $1`;
        const countParams = ['FLASH_SWAP'];
        
        if (startDate) {
          countQuery += ` AND created_at >= $${countParams.length + 1}::timestamp`;
          countParams.push(startDate);
        }
        
        if (endDate) {
          countQuery += ` AND created_at <= $${countParams.length + 1}::timestamp`;
          countParams.push(endDate);
        }
        
        totalCountResult = await prisma.$queryRawUnsafe(countQuery, ...countParams);
      }
    } else {
      // For other types, use transaction table
      if (isSuperior === 'true' && user) {
        // Using parameterized query for subordinates
        userId = user.id;
        let countQuery = `SELECT COUNT(*) as count, sum(amount) as total_amount FROM transaction WHERE type::text = $1 AND from_address IN (SELECT address FROM user_info WHERE path LIKE $2)`;
        const countParams = [type, '%' + userId + '.%'];
        
        if (startDate) {
          countQuery += ` AND created_at >= $${countParams.length + 1}::timestamp`;
          countParams.push(startDate);
        }
        
        if (endDate) {
          countQuery += ` AND created_at <= $${countParams.length + 1}::timestamp`;
          countParams.push(endDate);
        }
        
        totalCountResult = await prisma.$queryRawUnsafe(countQuery, ...countParams);
      } else if (lowCaseAddress) {
        // Using parameterized query for direct transactions
        let countQuery = `SELECT COUNT(*) as count, sum(amount) as total_amount FROM transaction WHERE type::text = $1 AND from_address = $2`;
        const countParams = [type, lowCaseAddress];
        
        if (startDate) {
          countQuery += ` AND created_at >= $${countParams.length + 1}::timestamp`;
          countParams.push(startDate);
        }
        
        if (endDate) {
          countQuery += ` AND created_at <= $${countParams.length + 1}::timestamp`;
          countParams.push(endDate);
        }
        
        totalCountResult = await prisma.$queryRawUnsafe(countQuery, ...countParams);
      } else {
        // Using parameterized query for all records
        let countQuery = `SELECT COUNT(*) as count, sum(amount) as total_amount FROM transaction WHERE type::text = $1`;
        const countParams = [type];
        
        if (startDate) {
          countQuery += ` AND created_at >= $${countParams.length + 1}::timestamp`;
          countParams.push(startDate);
        }
        
        if (endDate) {
          countQuery += ` AND created_at <= $${countParams.length + 1}::timestamp`;
          countParams.push(endDate);
        }
        
        totalCountResult = await prisma.$queryRawUnsafe(countQuery, ...countParams);
      }
    }
    
    const totalCount = Number((totalCountResult as any)[0]?.count || 0);
    const totalAmount = Number((totalCountResult as any)[0]?.total_amount || 0);
    
    // Get paginated data
    
    if (type === 'FLASH_SWAP') {
      // For FLASH_SWAP, use tx_flow table
      if (isSuperior === 'true' && user) {
        // Using parameterized query for subordinates
        let dataQuery = `SELECT * FROM tx_flow WHERE type::text = $1 AND user_address IN (SELECT address FROM user_info WHERE path LIKE $2)`;
        const dataParams = ['FLASH_SWAP', '%' + userId + '.%'];
        
        if (startDate) {
          dataQuery += ` AND created_at >= $${dataParams.length + 1}::timestamp`;
          dataParams.push(startDate);
        }
        
        if (endDate) {
          dataQuery += ` AND created_at <= $${dataParams.length + 1}::timestamp`;
          dataParams.push(endDate);
        }
        
        dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1}::integer OFFSET $${dataParams.length + 2}::integer`;
        dataParams.push(String(limit), String(offset));
        
        transactions = await prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      } else if (lowCaseAddress) {
        // Using parameterized query for direct transactions
        let dataQuery = `SELECT * FROM tx_flow WHERE type::text = $1 AND user_address = $2`;
        const dataParams = ['FLASH_SWAP', lowCaseAddress];
        
        if (startDate) {
          dataQuery += ` AND created_at >= $${dataParams.length + 1}::timestamp`;
          dataParams.push(startDate);
        }
        
        if (endDate) {
          dataQuery += ` AND created_at <= $${dataParams.length + 1}::timestamp`;
          dataParams.push(endDate);
        }
        
        dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1}::integer OFFSET $${dataParams.length + 2}::integer`;
        dataParams.push(String(limit), String(offset));
        
        transactions = await prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      } else {
        // Using parameterized query for all records
        let dataQuery = `SELECT * FROM tx_flow WHERE type::text = $1`;
        const dataParams = ['FLASH_SWAP'];
        
        if (startDate) {
          dataQuery += ` AND created_at >= $${dataParams.length + 1}::timestamp`;
          dataParams.push(startDate);
        }
        
        if (endDate) {
          dataQuery += ` AND created_at <= $${dataParams.length + 1}::timestamp`;
          dataParams.push(endDate);
        }
        
        dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1}::integer OFFSET $${dataParams.length + 2}::integer`;
        dataParams.push(String(limit), String(offset));
        
        transactions = await prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      }
    } else {
      // For other types, use transaction table
      if (isSuperior === 'true' && user) {
        // Using parameterized query for subordinates
        let dataQuery = `SELECT * FROM transaction WHERE type::text = $1 AND from_address IN (SELECT address FROM user_info WHERE path LIKE $2)`;
        const dataParams = [type, '%' + userId + '.%'];
        
        if (startDate) {
          dataQuery += ` AND created_at >= $${dataParams.length + 1}::timestamp`;
          dataParams.push(startDate);
        }
        
        if (endDate) {
          dataQuery += ` AND created_at <= $${dataParams.length + 1}::timestamp`;
          dataParams.push(endDate);
        }
        
        dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1}::integer OFFSET $${dataParams.length + 2}::integer`;
        dataParams.push(String(limit), String(offset));
        
        transactions = await prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      } else if (lowCaseAddress) {
        // Using parameterized query for direct transactions
        let dataQuery = `SELECT * FROM transaction WHERE type::text = $1 AND from_address = $2`;
        const dataParams = [type, lowCaseAddress];
        
        if (startDate) {
          dataQuery += ` AND created_at >= $${dataParams.length + 1}::timestamp`;
          dataParams.push(startDate);
        }
        
        if (endDate) {
          dataQuery += ` AND created_at <= $${dataParams.length + 1}::timestamp`;
          dataParams.push(endDate);
        }
        
        dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1}::integer OFFSET $${dataParams.length + 2}::integer`;
        dataParams.push(String(limit), String(offset));
        
        transactions = await prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      } else {
        // Using parameterized query for all records
        let dataQuery = `SELECT * FROM transaction WHERE type::text = $1`;
        const dataParams = [type];
        
        if (startDate) {
          dataQuery += ` AND created_at >= $${dataParams.length + 1}::timestamp`;
          dataParams.push(startDate);
        }
        
        if (endDate) {
          dataQuery += ` AND created_at <= $${dataParams.length + 1}::timestamp`;
          dataParams.push(endDate);
        }
        
        dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1}::integer OFFSET $${dataParams.length + 2}::integer`;
        dataParams.push(String(limit), String(offset));
        
        transactions = await prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      }
    }

    // Total count was already extracted above
    
    return NextResponse.json({
      data: transactions,
      count: transactions.length,
      total: totalCount,
      totalAmount: totalAmount,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalCount / Number(pageSize)),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching operation records:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
