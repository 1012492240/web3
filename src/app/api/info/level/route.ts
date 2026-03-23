import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getMaxLevel } from '@/lib/config'

export async function POST() {
  try {
    // Get all existing user levels with their counts
    const userLevels = await prisma.user_info.groupBy({
      by: ['level'],
      _count: {
        id: true
      },
      orderBy: {
        level: 'asc'
      }
    })

    // Get max level from config
    const maxLevel = await getMaxLevel()

    // Create an array of all levels from 0 to max
    const allLevels = Array.from({ length: maxLevel + 1 }, (_, i) => ({
      level: i,
      count: 0
    }))

    // Merge the actual counts with the full range of levels
    const result = allLevels.map(level => {
      const existingLevel = userLevels.find(l => l.level === level.level)
      return {
        level: level.level,
        count: existingLevel ? existingLevel._count.id : 0
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching user levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user levels' },
      { status: 500 }
    )
  }
}