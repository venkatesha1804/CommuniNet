import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const { status } = await req.json()

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status },
            select: { id: true, name: true, email: true, status: true }
        })

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
