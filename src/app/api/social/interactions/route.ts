import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"

// Helper to find the owner of the content
async function getContentOwner(contentType: string, contentId: string) {
    if (contentType === 'event') {
        const event = await prisma.event.findUnique({ where: { id: contentId }, select: { organizerId: true } })
        return event?.organizerId
    } else if (contentType === 'business') {
        const business = await prisma.business.findUnique({ where: { id: contentId }, select: { ownerId: true } })
        return business?.ownerId
    } else if (contentType === 'achievement') {
        const achievement = await prisma.achievement.findUnique({ where: { id: contentId }, select: { userId: true } })
        return achievement?.userId
    } else if (contentType === 'comment') {
        const comment = await prisma.comment.findUnique({ where: { id: contentId }, select: { userId: true } })
        return comment?.userId
    }
    return null
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { action, contentType, contentId, content, platform, parentId } = body

        if (!action || !contentType || !contentId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        switch (action) {
            case 'like': {
                const existingLike = await prisma.like.findUnique({
                    where: { userId_contentType_contentId: { userId: user.id, contentType, contentId } }
                })

                if (existingLike) {
                    await prisma.like.delete({ where: { id: existingLike.id } })
                    return NextResponse.json({ message: "Unliked successfully", liked: false })
                } else {
                    await prisma.like.create({ data: { userId: user.id, contentType, contentId } })

                    // Notify content owner
                    const ownerId = await getContentOwner(contentType, contentId)
                    if (ownerId && ownerId !== user.id) {
                        await createNotification(
                            ownerId,
                            "New Like",
                            `${user.name || 'Someone'} liked your ${contentType}.`,
                            'social',
                            `/${contentType}s`
                        )
                    }

                    return NextResponse.json({ message: "Liked successfully", liked: true })
                }
            }

            case 'comment': {
                if (!content) {
                    return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
                }
                const newComment = await prisma.comment.create({
                    data: { userId: user.id, contentType, contentId, content, parentId: parentId || null },
                    include: { user: { select: { name: true, profileImage: true } } }
                })

                // Notify content owner
                const ownerId = await getContentOwner(contentType, contentId)
                if (ownerId && ownerId !== user.id) {
                    await createNotification(
                        ownerId,
                        "New Comment",
                        `${user.name || 'Someone'} commented: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
                        'social',
                        `/${contentType}s`
                    )
                }

                return NextResponse.json({ message: "Comment added successfully", comment: newComment })
            }

            case 'share': {
                await (prisma as any).share.create({
                    data: { userId: user.id, contentType, contentId, platform: platform || 'copy' }
                })
                return NextResponse.json({ message: "Share tracked successfully" })
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

    } catch (error) {
        console.error("Social interaction error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const contentType = url.searchParams.get("contentType")
        const contentId = url.searchParams.get("contentId")
        const action = url.searchParams.get("action")

        if (!contentType || !contentId || action !== 'comments') {
            return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
        }

        // Optionally authenticate to show liked state
        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const comments = await (prisma as any).comment.findMany({
            where: { contentType, contentId },
            include: { user: { select: { name: true, profileImage: true } } },
            orderBy: { createdAt: "asc" }
        })

        const commentIds = comments.map((c: any) => c.id)
        const likes = await (prisma as any).like.findMany({
            where: { contentType: "comment", contentId: { in: commentIds } }
        })

        const enrichedComments = comments.map((c: any) => {
            const commentLikes = likes.filter((l: any) => l.contentId === c.id)
            const hasLiked = activeUserId ? commentLikes.some((l: any) => l.userId === activeUserId) : false
            return { ...c, stats: { likes: commentLikes.length }, userInteractions: { isLiked: hasLiked } }
        })

        return NextResponse.json({ data: enrichedComments })

    } catch (error) {
        console.error("Error fetching comments:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
