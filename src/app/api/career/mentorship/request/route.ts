import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const requester = await prisma.user.findUnique({
            where: { id: user.id },
            select: { name: true, email: true, mobile: true }
        })

        const { mentorshipId, message } = await req.json()

        if (!mentorshipId) {
            return NextResponse.json({ message: "Mentorship ID required" }, { status: 400 })
        }

        const existing = await prisma.mentorshipRequest.findUnique({
            where: { mentorshipId_requesterId: { mentorshipId, requesterId: user.id } }
        })

        if (existing) {
            return NextResponse.json({ message: "Already requested" }, { status: 200 })
        }

        const mentorship = await prisma.mentorship.findUnique({
            where: { id: mentorshipId },
            include: { mentor: true }
        })

        if (!mentorship) {
            return NextResponse.json({ message: "Mentorship not found" }, { status: 404 })
        }

        const request = await prisma.mentorshipRequest.create({
            data: {
                mentorshipId,
                requesterId: user.id,
                message: message || "I would like to connect using the portal.",
                status: "pending"
            }
        })

        console.log(`[Mentorship Request] ${requester?.name} → ${mentorship.mentor.name} (${mentorship.mentor.email})`)

        return NextResponse.json(request, { status: 201 })
    } catch (error) {
        console.error("Mentorship request failed", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
