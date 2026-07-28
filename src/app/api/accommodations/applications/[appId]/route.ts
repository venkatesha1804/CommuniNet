import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Update the status of an application
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ appId: string }> }
) {
    try {
        const { appId } = await params;
        const user = await getAuthUser(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applicationId = appId;
        const { status } = await request.json();

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        // Find the application and its related accommodation
        const application = await prisma.accommodationApplication.findUnique({
            where: { id: applicationId },
            include: {
                accommodation: true
            }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Verify ownership
        if (application.accommodation.ownerId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
        }

        const updatedApplication = await (prisma.accommodationApplication as any).update({
            where: { id: applicationId },
            data: { status }
        });

        // Create notification for the applicant
        try {
            await (prisma.notification as any).create({
                data: {
                    userId: application.userId,
                    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: `Your application for ${application.accommodation.name} has been ${status}.`,
                    type: 'system',
                    link: `/accommodations/${application.accommodationId}`
                }
            });
        } catch (notifError) {
            console.error("Failed to create notification:", notifError);
            // Don't fail the whole request if notification fails
        }

        return NextResponse.json(updatedApplication);
    } catch (error) {
        console.error("Error updating accommodation application:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
