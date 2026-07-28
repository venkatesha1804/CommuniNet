import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id

        const body = await req.json()
        const { title, description, category, date, images } = body

        if (!title || !description || !category || !date) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Verification Lock: Only approved members or admins can post
        if (user.status !== 'approved' && user.role !== 'admin') {
            return NextResponse.json({
                message: 'Account verification required. Please contact admin to verify your account.'
            }, { status: 403 })
        }

        const achievement = await prisma.achievement.create({
            data: {
                title,
                description,
                category,
                date: new Date(date),
                images: images || [],
                userId,
                status: 'approved'
            }
        })

        return NextResponse.json(achievement)
    } catch (error) {
        console.error("Failed to create achievement:", error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const requestedStatus = searchParams.get('status')
        const search = searchParams.get('search')

        // Pagination logic
        const page = parseInt(searchParams.get('page') || '1')
        const limitParam = parseInt(searchParams.get('limit') || '10')
        const limit = limitParam > 0 ? Math.min(limitParam, 50) : 10
        const skip = (page - 1) * limit

        // Get current user (optional, for personalized view)
        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const queryConditions: any[] = []

        // Search Logic
        if (search) {
            queryConditions.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ]
            })
        }

        const viewMode = searchParams.get('filter') // 'all' or 'mine'

        // Status Logic
        if (viewMode === 'mine' && activeUserId) {
            queryConditions.push({ userId: activeUserId })
        } else if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            // For public view, only show approved.
            queryConditions.push({ status: 'approved' })
        }

        // Get Total Count
        const total = await prisma.achievement.count({
            where: queryConditions.length > 0 ? { AND: queryConditions } : {}
        })

        const achievements = await prisma.achievement.findMany({
            where: queryConditions.length > 0 ? { AND: queryConditions } : {},
            include: {
                user: {
                    select: { name: true, profileImage: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            data: achievements,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error("Failed to fetch achievements:", error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
