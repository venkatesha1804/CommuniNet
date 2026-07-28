import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { name, mobile, location, gotra, bio, familyMembers } = body

        // Unified transaction to update user and sync family members
        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    name: name || undefined,
                    mobile: mobile || undefined,
                    location: location || undefined,
                    gotra: gotra || undefined,
                    bio: bio || undefined,
                },
                include: { familyMembers: true } as any
            })

            if (familyMembers && Array.isArray(familyMembers)) {
                // 1. Delete members not in the incoming list
                const incomingIds = familyMembers.filter(m => m.id).map(m => m.id)
                await (tx as any).familyMember.deleteMany({
                    where: {
                        userId: user.id,
                        id: { notIn: incomingIds }
                    }
                })

                // 2. Update existing or Create new
                for (const member of familyMembers) {
                    if (member.id) {
                        await (tx as any).familyMember.update({
                            where: { id: member.id },
                            data: {
                                name: member.name,
                                relationship: member.relationship,
                                dob: member.dob ? new Date(member.dob) : null,
                                occupation: member.occupation,
                            }
                        })
                    } else {
                        await (tx as any).familyMember.create({
                            data: {
                                name: member.name,
                                relationship: member.relationship,
                                dob: member.dob ? new Date(member.dob) : null,
                                occupation: member.occupation,
                                userId: user.id
                            }
                        })
                    }
                }
            }

            // Fetch final state with all relations
            return await tx.user.findUnique({
                where: { id: user.id },
                include: { familyMembers: true } as any
            })
        })

        if (!result) return NextResponse.json({ message: 'User not found' }, { status: 404 })

        const { password: _, ...userWithoutPassword } = result as any

        return NextResponse.json({ user: userWithoutPassword, message: 'Profile updated' })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
