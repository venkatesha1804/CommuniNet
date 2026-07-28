import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const emergencyRequests = await prisma.helpRequest.findMany({
            where: {
                type: { in: ['Medical Emergency', 'Blood Requirement', 'Medical & Blood Help'] },
                status: 'approved',
                createdAt: { gte: twentyFourHoursAgo }
            },
            select: {
                id: true,
                userId: true,
                type: true,
                title: true,
                description: true,
                contact: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        location: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        return NextResponse.json(emergencyRequests)
    } catch (error) {
        console.error('Fetch emergency requests failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
