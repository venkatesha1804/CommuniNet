import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where: any = {}
        if (status && status !== 'all') where.status = status

        const [total, tickets] = await Promise.all([
            prisma.supportTicket.count({ where }),
            prisma.supportTicket.findMany({
                where,
                include: { user: { select: { name: true, email: true, role: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: tickets,
            pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
        })
    } catch (error) {
        console.error('Failed to fetch support tickets:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
        }

        const { id, status } = await req.json()

        if (!id || !status) {
            return NextResponse.json({ message: 'ID and status are required' }, { status: 400 })
        }

        const updated = await prisma.supportTicket.update({ where: { id }, data: { status } })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Failed to update support ticket:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
