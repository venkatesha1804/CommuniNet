import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { name, age, occupation, message, familyMemberId } = await request.json();

        if (!name || !age || !occupation) {
            return NextResponse.json(
                { error: "Name, age, and occupation are required" },
                { status: 400 }
            );
        }

        const accommodationId = id;

        // Check if already applied (for self or specific family member)
        const existingApp = await prisma.accommodationApplication.findUnique({
            where: {
                accommodationId_userId_familyMemberId: {
                    accommodationId,
                    userId: user.id,
                    familyMemberId: familyMemberId || null
                }
            } as any
        });

        if (existingApp) {
            return NextResponse.json(
                { error: familyMemberId ? "This family member has already applied for this accommodation" : "You have already applied for this accommodation" },
                { status: 400 }
            );
        }

        const application = await (prisma.accommodationApplication as any).create({
            data: {
                accommodationId,
                userId: user.id,
                familyMemberId: familyMemberId || null,
                name,
                age: age.toString(),
                occupation,
                message,
            },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error("Error creating accommodation application:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
