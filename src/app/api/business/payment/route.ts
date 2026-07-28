import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { businessId, paymentDetails } = await req.json()

        if (!businessId || !paymentDetails) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const business = await prisma.business.findUnique({ where: { id: businessId } })

        if (!business) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 })
        }

        if (business.ownerId !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500))

        const updatedBusiness = await prisma.business.update({
            where: { id: businessId },
            data: { status: 'approved' }
        })

        return NextResponse.json(updatedBusiness, { status: 200 })

    } catch (error) {
        console.error('Payment Error:', error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
