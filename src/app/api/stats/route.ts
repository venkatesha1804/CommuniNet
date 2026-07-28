import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [memberCount, businessCount, eventCount, donationStats] = await Promise.all([
            prisma.user.count({ where: { status: 'approved' } }),
            prisma.business.count({ where: { status: 'approved' } }),
            prisma.event.count({ where: { status: 'approved' } }),
            prisma.donation.aggregate({
                _sum: {
                    amount: true
                }
            })
        ])

        return NextResponse.json({
            members: memberCount,
            businesses: businessCount,
            events: eventCount,
            donations: donationStats._sum.amount || 0
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json({
            members: 0,
            businesses: 0,
            events: 0,
            donations: 0
        }, { status: 500 })
    }
}
