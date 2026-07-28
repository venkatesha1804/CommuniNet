import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { amount, cause, isAnonymous } = body

        if (!amount || !cause) {
            return NextResponse.json({ message: 'Amount and cause are required' }, { status: 400 })
        }

        let donorId = null

        if (!isAnonymous) {
            const user = await getAuthUser(req)
            if (user) donorId = user.id
        }

        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                cause,
                donorId,
                status: 'completed',
                transactionId: `TXN_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
            }
        })

        return NextResponse.json(donation, { status: 201 })
    } catch (error) {
        console.error('Donation failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const donations = await prisma.donation.findMany({
            where: { donorId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(donations)
    } catch (error) {
        console.error('Fetch donations failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
