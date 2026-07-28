import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        console.log('[API/Admin/Analytics] Authenticated user:', user);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const range = searchParams.get('range') || '6m' // 7d, 30d, 90d, 6m, 1y

        // 1. User Counts
        const totalUsers = await prisma.user.count()
        const memberCount = await prisma.user.count({ where: { role: 'member' } })

        // 2. Total Counts
        const totalEvents = await prisma.event.count()
        const totalBusinesses = await prisma.business.count()
        const totalJobs = await prisma.job.count()
        const totalScholarships = await prisma.scholarship.count()
        const totalMentorships = await prisma.mentorship.count()
        const totalHelpRequests = await prisma.helpRequest.count()
        const totalDonations = await prisma.donation.count()
        const totalAccommodations = await prisma.accommodation.count()
        const totalNewsletters = await prisma.newsletter.count()

        // 3. Pending Counts
        const pendingEvents = await prisma.event.count({ where: { status: 'pending' } })
        const pendingBusinesses = await prisma.business.count({ where: { status: 'pending' } })
        const pendingJobs = await prisma.job.count({ where: { status: 'pending' } })
        const pendingScholarships = await prisma.scholarship.count({ where: { status: 'pending' } })
        const pendingMentorships = await prisma.mentorship.count({ where: { status: 'pending' } })
        const pendingHelpRequests = await prisma.helpRequest.count({ where: { status: 'pending' } })
        const pendingAccommodations = await prisma.accommodation.count({ where: { status: 'pending' } })
        const totalPending = pendingEvents + pendingBusinesses + pendingJobs + pendingScholarships + pendingMentorships + pendingHelpRequests + pendingAccommodations

        // 4. Time Range Setup
        const now = new Date()
        let startDate: Date
        let groupBy: 'day' | 'month' = 'month'

        switch (range) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                groupBy = 'day'
                break
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                groupBy = 'day'
                break
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                groupBy = 'month'
                break
            case '1y':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                groupBy = 'month'
                break
            case '6m':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
                groupBy = 'month'
                break
        }

        // Helper to get growth data for any model
        const getGrowthData = async (model: any) => {
            const items = await model.findMany({
                where: { createdAt: { gte: startDate } },
                select: { createdAt: true }
            })

            if (groupBy === 'day') {
                const days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
                const dayMap = new Map<string, number>()
                for (let i = days; i >= 0; i--) {
                    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                    const key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`
                    dayMap.set(key, 0)
                }
                items.forEach((u: any) => {
                    const d = new Date(u.createdAt)
                    const key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`
                    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1)
                })
                return Array.from(dayMap.entries()).map(([name, count]) => ({ name, count }))
            } else {
                const months = Math.ceil((now.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
                const monthMap = new Map<string, number>()
                for (let i = months; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
                    monthMap.set(key, 0)
                }
                items.forEach((u: any) => {
                    const d = new Date(u.createdAt)
                    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
                    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) || 0) + 1)
                })
                return Array.from(monthMap.entries()).map(([name, count]) => ({ name, count }))
            }
        }

        const userGrowth = await getGrowthData(prisma.user)
        const businessGrowth = await getGrowthData(prisma.business)
        const eventGrowth = await getGrowthData(prisma.event)
        const jobGrowth = await getGrowthData(prisma.job)
        const donationGrowth = await getGrowthData(prisma.donation)
        const scholarshipGrowth = await getGrowthData(prisma.scholarship)
        const mentorshipGrowth = await getGrowthData(prisma.mentorship)
        const helpGrowth = await getGrowthData(prisma.helpRequest)
        const accommodationGrowth = await getGrowthData(prisma.accommodation)

        // 5. Donation stats
        const donationAgg = await prisma.donation.aggregate({ _sum: { amount: true } })
        const totalDonationAmount = donationAgg._sum.amount || 0

        return NextResponse.json({
            stats: {
                totalUsers,
                memberCount,
                totalPending,
                totals: {
                    events: totalEvents,
                    businesses: totalBusinesses,
                    jobs: totalJobs,
                    scholarships: totalScholarships,
                    mentorships: totalMentorships,
                    helpRequests: totalHelpRequests,
                    donations: totalDonations,
                    donationAmount: totalDonationAmount,
                    accommodations: totalAccommodations,
                    newsletters: totalNewsletters,
                },
                breakdown: {
                    pendingEvents,
                    pendingBusinesses,
                    pendingJobs,
                    pendingScholarships,
                    pendingMentorships,
                    pendingHelpRequests,
                    pendingAccommodations,
                }
            },
            graphs: {
                userGrowth,
                businessGrowth,
                eventGrowth,
                jobGrowth,
                donationGrowth,
                scholarshipGrowth,
                mentorshipGrowth,
                helpGrowth,
                accommodationGrowth
            }
        })

    } catch (error) {
        console.error('Analytics Error:', error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
