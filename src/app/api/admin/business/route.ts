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
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { owner: { name: { contains: search, mode: 'insensitive' } } }
            ]
        }

        const [total, businesses] = await Promise.all([
            prisma.business.count({ where }),
            prisma.business.findMany({
                where,
                include: { owner: { select: { id: true, name: true, email: true, mobile: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: businesses,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })

    } catch (error) {
        console.error('Error fetching admin businesses:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
