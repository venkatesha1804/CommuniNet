import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// PATCH — Admin updates report status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { status } = body

        if (!status || !['open', 'reviewed', 'dismissed'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
        }

        const report = await prisma.report.update({ where: { id }, data: { status } })

        return NextResponse.json(report)
    } catch (error) {
        console.error('Update report failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE — Admin deletes report
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        await prisma.report.delete({ where: { id } })

        return NextResponse.json({ message: 'Report deleted' })
    } catch (error) {
        console.error('Delete report failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
