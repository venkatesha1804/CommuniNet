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
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const [totalCount, donations, totalAmountAgg, thisMonthAgg, uniqueDonorsAgg, anonymousCount] = await Promise.all([
            prisma.donation.count(),
            prisma.donation.findMany({
                include: { donor: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.donation.aggregate({ _sum: { amount: true } }),
            prisma.donation.aggregate({ where: { createdAt: { gte: firstDayOfMonth } }, _sum: { amount: true } }),
            prisma.donation.groupBy({ by: ['donorId'], where: { donorId: { not: null } } }),
            prisma.donation.count({ where: { donorId: null } })
        ])

        const stats = {
            totalAmount: totalAmountAgg._sum.amount || 0,
            thisMonthAmount: thisMonthAgg._sum.amount || 0,
            uniqueDonors: uniqueDonorsAgg.length,
            anonymousCount
        }

        return NextResponse.json({
            donations,
            stats,
            pagination: { total: totalCount, pages: Math.ceil(totalCount / limit), currentPage: page, limit }
        })
    } catch (error) {
        console.error('Admin fetch donations failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
