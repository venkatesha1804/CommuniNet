import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const business = await prisma.business.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { name: true, email: true, mobile: true }
                }
            }
        })

        if (!business) {
            return NextResponse.json(
                { message: 'Business not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(business)
    } catch (error) {
        console.error('Error fetching business details:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const business = await prisma.business.findUnique({
            where: { id }
        })

        if (!business) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 })
        }

        // Check ownership or admin role
        if (business.ownerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        if (user.role === 'admin') {
            await prisma.business.update({
                where: { id },
                data: { status: 'deleted_by_admin' }
            })
            return NextResponse.json({ message: 'Business marked as deleted by admin' })
        }

        await prisma.business.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Business deleted successfully' })
    } catch (error) {
        console.error('Error deleting business:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()

        const business = await prisma.business.findUnique({
            where: { id }
        })

        if (!business) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 })
        }

        // Check ownership
        if (business.ownerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { name, description, category, contact, city, address, images } = body

        const updatedBusiness = await prisma.business.update({
            where: { id },
            data: {
                name,
                description,
                category,
                contact,
                city,
                address,
                images,
                status: user.role === 'admin' || business.status === 'approved' ? business.status : 'pending'
            }
        })

        return NextResponse.json(updatedBusiness)
    } catch (error) {
        console.error('Error updating business:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
