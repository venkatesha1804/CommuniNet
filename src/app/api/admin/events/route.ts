import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where: any = {}

        if (status && status !== 'all') where.status = status
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { organizer: { name: { contains: search, mode: 'insensitive' } } }
            ]
        }

        const [total, events] = await Promise.all([
            prisma.event.count({ where }),
            prisma.event.findMany({
                where,
                include: { organizer: { select: { id: true, name: true, email: true, mobile: true } } },
                orderBy: { date: 'asc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: events,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })

    } catch (error) {
        console.error('Error fetching admin events:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
