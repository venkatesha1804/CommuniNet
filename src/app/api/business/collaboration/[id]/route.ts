import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)

        const collaboration = await prisma.businessCollaboration.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        name: true,
                        profileImage: true,
                        location: true,
                        email: true, // Needed for contact
                        mobile: true, // Needed for contact
                    }
                }
            }
        })

        if (!collaboration) {
            return NextResponse.json(
                { message: 'Collaboration opportunity not found' },
                { status: 404 }
            )
        }

        // Only allow viewing if approved, OR if admin, OR if owner
        const isApproved = collaboration.status === 'approved'
        const isAdmin = user?.role === 'admin'
        const isOwner = user?.id === collaboration.authorId

        if (!isApproved && !isAdmin && !isOwner) {
            return NextResponse.json(
                { message: 'Unauthorized or not approved' },
                { status: 403 }
            )
        }

        // If not authenticated, strip private contact info
        if (!user) {
            return NextResponse.json({
                ...collaboration,
                author: {
                    ...collaboration.author,
                    email: null,
                    mobile: null
                }
            })
        }

        return NextResponse.json(collaboration)
    } catch (error) {
        console.error('Error fetching collaboration details:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getAuthUser(req)

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const bodyContent = await req.json()
        const { status } = bodyContent

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { message: 'Invalid status' },
                { status: 400 }
            )
        }

        const updatedCollaboration = await prisma.businessCollaboration.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(updatedCollaboration)
    } catch (error) {
        console.error('Error updating collaboration status:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
