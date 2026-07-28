import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const helpRequest = await prisma.helpRequest.findUnique({
            where: { id },
            include: { user: { select: { name: true, profileImage: true, email: true } } }
        })

        if (!helpRequest) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 })
        }

        return NextResponse.json(helpRequest)
    } catch (error) {
        console.error('Fetch help request failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const helpRequest = await prisma.helpRequest.findUnique({ where: { id } })

        if (!helpRequest) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 })
        }

        if (helpRequest.userId !== user.id) {
            return NextResponse.json({ message: 'Only the request owner can mark it as received' }, { status: 403 })
        }

        const updated = await prisma.helpRequest.update({ where: { id }, data: { status: 'received' } })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Update help request failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
