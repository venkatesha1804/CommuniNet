"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, Briefcase, Calendar, Store, GraduationCap, UserCheck, Rss } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

interface FeedItem {
    type: 'job' | 'business' | 'event' | 'scholarship' | 'mentorship'
    id: string
    title: string
    subtitle: string
    user: { id: string; name: string | null; email: string }
    createdAt: string
}

const typeConfig = {
    job: { icon: Briefcase, color: 'blue', label: 'Job Posting', linkPrefix: '/career' },
    business: { icon: Store, color: 'green', label: 'Business', linkPrefix: '/business' },
    event: { icon: Calendar, color: 'amber', label: 'Event', linkPrefix: '/events' },
    scholarship: { icon: GraduationCap, color: 'purple', label: 'Scholarship', linkPrefix: '/career' },
    mentorship: { icon: UserCheck, color: 'teal', label: 'Mentorship', linkPrefix: '/career' },
}

export default function FeedPage() {
    const router = useRouter()
    const [feed, setFeed] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [emptyMessage, setEmptyMessage] = useState("")

    useEffect(() => {
        const fetchFeed = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/members/feed')
                if (res.ok) {
                    const data = await res.json()
                    setFeed(data.feed || [])
                    if (data.message) setEmptyMessage(data.message)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchFeed()
    }, [])

    const formatDate = (d: string) => {
        const date = new Date(d)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getLink = (item: FeedItem) => {
        switch (item.type) {
            case 'business': return `/business/${item.id}`
            case 'event': return `/events/${item.id}`
            case 'job': return `/career`
            case 'scholarship': return `/career`
            case 'mentorship': return `/career`
            default: return null
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.push('/members')} className="mb-6 hover:bg-transparent hover:text-secondary pl-0 font-black uppercase tracking-widest text-xs">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Member Directory
                    </Button>

                    <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                            <Rss className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                            <h1 className="font-black text-3xl text-slate-900 tracking-tight uppercase">My Feed</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Latest activity from people you follow</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                        </div>
                    ) : feed.length === 0 ? (
                        <Card className="bg-white rounded-[2.5rem] border-slate-100 shadow-xl">
                            <CardContent className="py-20 text-center">
                                <Rss className="h-16 w-16 mx-auto text-slate-100 mb-6" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-8">{emptyMessage || "No activity yet."}</p>
                                <Link href="/members">
                                    <Button className="h-14 px-10 bg-slate-900 hover:bg-secondary text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200">
                                        Discover Members
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {feed.map((item, idx) => {
                                const config = typeConfig[item.type]
                                const Icon = config.icon
                                const link = getLink(item)

                                return (
                                    <Card key={`${item.type}-${item.id}-${idx}`} className={`border-l-4 border-l-${config.color}-400 hover:shadow-md transition-shadow`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className={`flex items-center gap-2 text-xs text-${config.color}-600 mb-1`}>
                                                        <Icon className="h-3 w-3" /> {config.label}
                                                    </div>
                                                    {link ? (
                                                        <Link href={link}>
                                                            <h3 className="font-black text-slate-900 hover:text-secondary transition-colors text-lg tracking-tight">{item.title}</h3>
                                                        </Link>
                                                    ) : (
                                                        <h3 className="font-black text-slate-900 text-lg tracking-tight">{item.title}</h3>
                                                    )}
                                                    <p className="text-slate-500 font-bold mt-1">{item.subtitle}</p>
                                                    <div className="flex items-center gap-3 mt-4 text-[10px] font-black uppercase tracking-widest">
                                                        <Link href={`/members/${item.user.id}`} className="text-secondary hover:text-slate-900 transition-colors">
                                                            {item.user.name || item.user.email}
                                                        </Link>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="text-slate-400">{formatDate(item.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}
