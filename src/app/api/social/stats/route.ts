import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const [eventsCount, businessesCount, membersCount] = await Promise.all([
            prisma.event.count({ where: { status: 'approved' } }),
            prisma.business.count({ where: { status: 'approved' } }),
            prisma.user.count({ where: { status: 'approved' } })
        ])

        return NextResponse.json({
            events: eventsCount,
            businesses: businessesCount,
            members: membersCount
        })
    } catch (error) {
        console.error("Error fetching social stats:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
