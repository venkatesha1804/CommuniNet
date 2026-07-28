import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Get all applications for a specific accommodation
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getAuthUser(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const accommodationId = id;

        // Verify ownership
        const accommodation = await prisma.accommodation.findUnique({
            where: { id: accommodationId }
        });

        if (!accommodation) {
            return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
        }

        if (accommodation.ownerId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
        }

        const applications = await (prisma.accommodationApplication as any).findMany({
            where: { accommodationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        mobile: true,
                        profileImage: true
                    }
                },
                familyMember: true
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error("Error fetching accommodation applications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
