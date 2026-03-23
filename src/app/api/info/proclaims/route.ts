import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {

  const { locale } = await req.json()
  try {
    // Count users by node type
    const proclamation = await prisma.proclaim.findMany({
      where: {
        display: true,
        locale: locale
      },
      select: {
        index: true,
        title: true,
        content: true,
        picture: true,
        updated_at: true
      },
      orderBy: {
        index: 'desc'
      }
    })
    return NextResponse.json({
      proclamation
    })
  } catch (error) {
    console.error('Error fetching proclamation info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proclamation info' },
      { status: 500 }
    )
  }
}