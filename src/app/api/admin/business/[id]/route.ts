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

        const updatedBusiness = await prisma.business.update({
            where: { id },
            data: { status },
            include: { owner: { select: { name: true, email: true } } }
        })

        return NextResponse.json(updatedBusiness)

    } catch (error) {
        console.error('Error updating business:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        await prisma.business.update({ where: { id }, data: { status: 'deleted_by_admin' } })

        return NextResponse.json({ message: 'Business deleted successfully' })

    } catch (error) {
        console.error('Error deleting business:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
