import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const searchQuery = searchParams.get('search')
        const requestedStatus = searchParams.get('status')
        const filter = searchParams.get('filter')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const queryConditions: any[] = []

        if (filter === 'mine' && activeUserId) {
            queryConditions.push({ authorId: activeUserId })
        } else if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            if (activeUser?.role === 'admin') {
                // Admins see everything unless a specific status is requested
            } else if (activeUserId) {
                queryConditions.push({
                    OR: [
                        { status: 'approved' },
                        { authorId: activeUserId }
                    ]
                })
            } else {
                queryConditions.push({ status: 'approved' })
            }
        }

        if (searchQuery) {
            queryConditions.push({
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { description: { contains: searchQuery, mode: 'insensitive' } },
                    { partnershipType: { contains: searchQuery, mode: 'insensitive' } }
                ]
            })
        }

        const finalWhereClause = queryConditions.length > 0 ? { AND: queryConditions } : {}

        const total = await prisma.businessCollaboration.count({
            where: finalWhereClause
        })

        const collaborations = await prisma.businessCollaboration.findMany({
            where: finalWhereClause,
            include: {
                author: {
                    select: { name: true, profileImage: true, location: true } // Don't expose email/phone unless needed on detail page
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            collaborations,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching collaborations:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const authorId = user.id
        const userRole = user.role
        const bodyContent = await req.json()

        const { title, description, partnershipType, skillsRequired } = bodyContent

        if (!title || !description || !partnershipType) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (user.status !== 'approved' && user.role !== 'admin') {
            return NextResponse.json({
                message: 'Account verification required. Please contact admin to verify your account.'
            }, { status: 403 })
        }

        const initialStatus = userRole === 'admin' ? 'approved' : 'pending'

        const collaboration = await prisma.businessCollaboration.create({
            data: {
                authorId,
                title,
                description,
                partnershipType,
                skillsRequired: skillsRequired || [],
                status: initialStatus
            }
        })

        return NextResponse.json(collaboration, { status: 201 })
    } catch (error) {
        console.error('Error creating collaboration:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
