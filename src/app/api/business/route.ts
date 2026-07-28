import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const searchQuery = searchParams.get('search')
        const requestedStatus = searchParams.get('status')
        const filter = searchParams.get('filter')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        // Get current user if logged in (optional)
        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const queryConditions: any[] = []

        if (filter === 'mine' && activeUserId) {
            queryConditions.push({ ownerId: activeUserId })
        } else if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            if (activeUserId) {
                queryConditions.push({
                    OR: [
                        { status: 'approved' },
                        { ownerId: activeUserId, status: { notIn: ['deleted', 'rejected', 'deleted_by_admin'] } }
                    ]
                })
            } else {
                queryConditions.push({ status: 'approved' })
            }
        }

        if (category && category !== 'All') {
            queryConditions.push({ category })
        }

        if (searchQuery) {
            queryConditions.push({
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { description: { contains: searchQuery, mode: 'insensitive' } },
                    { city: { contains: searchQuery, mode: 'insensitive' } }
                ]
            })
        }

        const finalWhereClause = queryConditions.length > 0 ? { AND: queryConditions } : {}

        // Get total count for pagination
        const total = await prisma.business.count({
            where: finalWhereClause
        })

        const businesses = await prisma.business.findMany({
            where: finalWhereClause,
            include: {
                owner: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            businesses,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching businesses:', error)
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

        const creatorId = user.id
        const userRole = user.role
        const bodyContent = await req.json()

        const { name, description, category, contact, city, address, images } = bodyContent

        if (!name || !description || !category || !contact) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verification Lock: Only approved members or admins can post
        if (user.status !== 'approved' && user.role !== 'admin') {
            return NextResponse.json({
                message: 'Account verification required. Please contact admin to verify your account.'
            }, { status: 403 })
        }

        let initialStatus = userRole === 'admin' ? 'approved' : 'pending_payment'

        // Bypassing payment if the user already has a pending or approved business
        if (userRole !== 'admin') {
            const existingBusinessesCount = await prisma.business.count({
                where: {
                    ownerId: creatorId,
                    status: {
                        in: ['approved', 'pending']
                    }
                }
            })
            if (existingBusinessesCount > 0) {
                initialStatus = 'pending' // Bypasses payment but still requires admin approval
            }
        }

        const createdBusiness = await prisma.business.create({
            data: {
                ownerId: creatorId,
                name,
                description,
                category,
                contact,
                city,
                address,
                images: images || [],
                status: initialStatus
            }
        })

        return NextResponse.json(createdBusiness, { status: 201 })
    } catch (error) {
        console.error('Error creating business:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
