import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch Top 5 Donors (Leaderboard)
        // Note: For a real app, we'd use groupBy. For now, we'll fetch completed ones with donors.
        const donations = await prisma.donation.findMany({
            where: {
                donorId: { not: null },
                status: 'completed'
            },
            include: {
                donor: {
                    select: {
                        name: true,
                        profileImage: true
                    }
                }
            }
        })

        // Aggregate by donor
        const aggregated = donations.reduce((acc: any, curr: any) => {
            const donorId = curr.donorId
            if (donorId) {
                if (!acc[donorId]) {
                    acc[donorId] = {
                        id: donorId,
                        name: curr.donor?.name || 'Member',
                        image: curr.donor?.profileImage,
                        total: 0
                    }
                }
                acc[donorId].total += curr.amount
            }
            return acc
        }, {})

        const leaderboard = Object.values(aggregated)
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 5)

        // Fetch Recent 10 Donations
        const recent = await prisma.donation.findMany({
            where: { status: 'completed' },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                donor: {
                    select: {
                        name: true
                    }
                }
            }
        }) as any[]

        return NextResponse.json({
            leaderboard,
            topDonor: leaderboard[0] || null,
            recent: recent.map((d: any) => ({
                id: d.id,
                amount: d.amount,
                cause: d.cause,
                donorName: d.donor?.name || 'Anonymous',
                createdAt: d.createdAt
            }))
        })
    } catch (error) {
        console.error('Fetch public donations failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
