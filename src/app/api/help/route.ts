import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { type, title, description, contact } = body

        if (!type || !title || !description) {
            return NextResponse.json({ message: 'Type, title, and description are required' }, { status: 400 })
        }

        const helpRequest = await prisma.helpRequest.create({
            data: {
                userId: user.id,
                type,
                title,
                description,
                contact,
                status: user.role === 'admin' ? 'approved' : 'pending'
            }
        })

        return NextResponse.json(helpRequest, { status: 201 })
    } catch (error) {
        console.error('Help request failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type')
        const requestedStatus = searchParams.get('status')

        const queryConditions: any[] = []

        if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            queryConditions.push({ status: { in: ['approved', 'pending'] } })
        }

        if (type && type !== 'All') {
            const types = type.split(',').map(t => t.trim())
            queryConditions.push({ type: { in: types } })
        }

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const [total, helpRequests] = await Promise.all([
            prisma.helpRequest.count({ where: queryConditions.length > 0 ? { AND: queryConditions } : {} }),
            prisma.helpRequest.findMany({
                where: queryConditions.length > 0 ? { AND: queryConditions } : {},
                include: { user: { select: { name: true, email: true, profileImage: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: helpRequests,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })
    } catch (error) {
        console.error('Fetch help requests failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
