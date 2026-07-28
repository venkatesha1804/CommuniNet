import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        console.log('[API/Admin/Users] Authenticated user:', user);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'pending'
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const query: any = { role: 'member', status }

        if (search) {
            query.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search, mode: 'insensitive' } },
                { gotra: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [total, users] = await Promise.all([
            prisma.user.count({ where: query }),
            prisma.user.findMany({
                where: query,
                select: { id: true, name: true, email: true, mobile: true, gotra: true, status: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: users,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })

    } catch (error) {
        console.error('[API/Admin/Users] Error fetching users:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
