import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(announcements)
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch announcements" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const { content } = await req.json()
        if (!content) return NextResponse.json({ message: "Content is required" }, { status: 400 })

        const announcement = await prisma.announcement.create({ data: { content } })

        return NextResponse.json(announcement, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
