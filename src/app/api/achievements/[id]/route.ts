import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const achievement = await prisma.achievement.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, profileImage: true, email: true } }
            }
        })

        if (!achievement) {
            return NextResponse.json({ message: 'Achievement not found' }, { status: 404 })
        }

        return NextResponse.json(achievement)
    } catch (error) {
        console.error('Error fetching achievement:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const achievement = await prisma.achievement.findUnique({ where: { id } })
        if (!achievement) return NextResponse.json({ message: 'Achievement not found' }, { status: 404 })

        // Only owner or admin can edit
        if (achievement.userId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, description, category, date, images } = body

        const updated = await prisma.achievement.update({
            where: { id },
            data: {
                title,
                description,
                category,
                date: date ? new Date(date) : achievement.date,
                images: images !== undefined ? images : achievement.images,
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating achievement:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const achievement = await prisma.achievement.findUnique({ where: { id } })
        if (!achievement) return NextResponse.json({ message: 'Achievement not found' }, { status: 404 })

        // Only owner or admin can delete
        if (achievement.userId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        if (user.role === 'admin') {
            await prisma.achievement.update({
                where: { id },
                data: { status: 'deleted_by_admin' }
            })
            return NextResponse.json({ message: 'Achievement marked as deleted by admin' })
        }

        await prisma.achievement.delete({ where: { id } })
        return NextResponse.json({ message: 'Achievement deleted' })
    } catch (error) {
        console.error('Error deleting achievement:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
