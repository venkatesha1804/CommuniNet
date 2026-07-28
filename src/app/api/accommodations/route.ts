import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const city = searchParams.get('city')
        const type = searchParams.get('type')
        const gender = searchParams.get('gender')
        const amenities = searchParams.get('amenities')?.split(',')

        const user = await getAuthUser(req)
        const isAuthenticated = !!user

        const ownerOnly = searchParams.get('ownerOnly') === 'true'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseWhere: any = {}
        if (city) baseWhere.city = { contains: city, mode: 'insensitive' }
        if (type) baseWhere.type = type
        if (gender) baseWhere.gender = gender
        if (amenities && amenities.length > 0) {
            baseWhere.amenities = { hasEvery: amenities }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let whereClause: any = { ...baseWhere }

        if (ownerOnly && user) {
            // Already handled by baseWhere.ownerId above
        } else if (isAuthenticated && user) {
            // User should see (Approved OR Own) AND (Base Filters like City/Type)
            whereClause = {
                AND: [
                    baseWhere,
                    {
                        OR: [
                            { status: 'approved' },
                            { ownerId: user.id }
                        ]
                    }
                ]
            }
        } else {
            // Unauthenticated: Approved AND (Base Filters)
            whereClause = {
                AND: [
                    baseWhere,
                    { status: 'approved' }
                ]
            }
        }

        const accommodations = await (prisma as any).accommodation.findMany({
            where: whereClause,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Filter out sensitive contact info for guests
        const processedAccommodations = accommodations.map((acc: any) => {
            if (!isAuthenticated) {
                return {
                    ...acc,
                    contactPhone: 'Log in to view',
                    contactEmail: 'Log in to view',
                    isGuestView: true,
                }
            }
            return {
                ...acc,
                isGuestView: false,
            }
        })

        return NextResponse.json(processedAccommodations)

    } catch (error) {
        console.error('Error fetching accommodations:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, type, gender, location, city, amenities, pricing, description, images, contactPhone, contactEmail } = body

        if (!name || !type || !gender || !location || !pricing || !description || !contactPhone) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Verification Lock: Only approved members or admins can post
        if (user.status !== 'approved' && user.role !== 'admin') {
            return NextResponse.json({
                message: 'Account verification required. Please contact admin to verify your account.'
            }, { status: 403 })
        }

        // If user is admin, auto-approve
        const status = user.role === 'admin' ? 'approved' : 'pending'

        const accommodation = await (prisma as any).accommodation.create({
            data: {
                ownerId: user.id,
                name,
                type,
                gender,
                location,
                city,
                amenities: amenities || [],
                pricing,
                description,
                images: images || [],
                contactPhone,
                contactEmail,
                status
            }
        })

        return NextResponse.json(accommodation, { status: 201 })
    } catch (error: any) {
        console.error('Error creating accommodation:', error)
        return NextResponse.json({ message: 'Internal server error', error: error?.message || String(error), stack: error?.stack }, { status: 500 })
    }
}
