import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        // Optionally authenticate to personalize feed
        const activeUser = await getAuthUser(req)
        const activeUserId = activeUser?.id || null

        const url = new URL(req.url)
        const page = parseInt(url.searchParams.get("page") || "1", 10)
        const limit = parseInt(url.searchParams.get("limit") || "20", 10)
        const typeFilter = url.searchParams.get("type") || "all"
        const skip = (page - 1) * limit

        // Fetch target entities (assuming we only want active/approved ones)
        const fetchEvents = typeFilter === 'all' || typeFilter === 'event'
        const fetchBusinesses = typeFilter === 'all' || typeFilter === 'business'
        const fetchAchievements = typeFilter === 'all' || typeFilter === 'achievement'

        const [events, businesses, achievements] = await Promise.all([
            fetchEvents ? prisma.event.findMany({
                where: { status: { in: ["approved", "deleted_by_admin"] } },
                include: { organizer: { select: { id: true, name: true, profileImage: true } } },
                take: limit,
                skip,
                orderBy: { createdAt: "desc" }
            }) : Promise.resolve([]),
            fetchBusinesses ? prisma.business.findMany({
                where: { status: { in: ["approved", "deleted_by_admin"] } },
                include: { owner: { select: { id: true, name: true, profileImage: true } } },
                take: limit,
                skip,
                orderBy: { createdAt: "desc" }
            }) : Promise.resolve([]),
            fetchAchievements ? prisma.achievement.findMany({
                where: { status: { in: ["approved", "deleted_by_admin"] } },
                include: { user: { select: { id: true, name: true, profileImage: true } } },
                take: limit,
                skip,
                orderBy: { createdAt: "desc" }
            }) : Promise.resolve([])
        ])

        // Normalize data into a standard "post" format
        const normalizedEvents = (events as any[]).map(e => ({
            id: e.id,
            type: 'event',
            title: e.title,
            description: e.description,
            images: e.images || [],
            createdAt: e.createdAt,
            status: e.status,
            author: e.organizer,
            metadata: { date: e.date, location: e.location }
        }))

        const normalizedBusinesses = (businesses as any[]).map(b => ({
            id: b.id,
            type: 'business',
            title: b.name,
            description: b.description,
            images: b.images || [],
            createdAt: b.createdAt,
            status: b.status,
            author: b.owner,
            metadata: { category: b.category, location: b.city || b.address }
        }))

        const normalizedAchievements = (achievements as any[]).map(a => ({
            id: a.id,
            type: 'achievement',
            title: a.title,
            description: a.description,
            images: a.images || [],
            createdAt: a.createdAt,
            status: a.status,
            author: a.user,
            metadata: { category: a.category, date: a.date }
        }))

        // Combine and sort by date descending
        const allPosts = [...normalizedEvents, ...normalizedBusinesses, ...normalizedAchievements]
        allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Pagination logic: Take the slice for current page
        // Note: Taking `limit` from each entity gives us max 3 * limit items.
        // For true pagination across multiple tables, we'd need a more complex query or union.
        // For simplicity and immediate effect, we'll slice the combined array. 
        // This is a naive pagination approach.
        const paginatedPosts = allPosts.slice(0, limit)

        // Fetch interactions for the sliced posts
        const postsWithInteractions = await Promise.all(paginatedPosts.map(async (post) => {
            // @ts-ignore - Prisma client types might not be fully updated in this environment
            const [likes, comments, shares, hasLiked] = await Promise.all([
                (prisma as any).like.count({ where: { contentType: post.type, contentId: post.id } }),
                (prisma as any).comment.count({ where: { contentType: post.type, contentId: post.id } }),
                (prisma as any).share.count({ where: { contentType: post.type, contentId: post.id } }),
                activeUserId ? (prisma as any).like.findUnique({
                    where: {
                        userId_contentType_contentId: {
                            userId: activeUserId,
                            contentType: post.type,
                            contentId: post.id
                        }
                    }
                }) : null
            ])

            return {
                ...post,
                stats: {
                    likes,
                    comments,
                    shares
                },
                userInteractions: {
                    isLiked: !!hasLiked
                }
            }
        }))

        return NextResponse.json({
            data: postsWithInteractions,
            pagination: {
                page,
                limit,
                // total is hard to calculate accurately without complex unions, returning null for infinite scroll
                total: null
            }
        })

    } catch (error) {
        console.error("Error fetching social feed:", error)
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 })
    }
}
