"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { SocialPostCard } from "@/components/social/SocialPostCard"
import { Loader2, Users, Activity, MessageCircle, Link as LinkIcon, Briefcase, Calendar, ChevronRight } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"
import Link from "next/link"

interface FeedPost {
    id: string
    type: 'event' | 'business' | 'achievement'
    title: string
    description: string
    images: string[]
    createdAt: string
    author: {
        id: string
        name: string | null
        profileImage: string | null
    }
    metadata?: any
    stats: {
        likes: number
        comments: number
        shares: number
    }
    userInteractions: {
        isLiked: boolean
    }
}

export default function SocialFeedPage() {
    const { user, isAuthenticated } = useAuth()
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [platformStats, setPlatformStats] = useState({ events: 0, businesses: 0, members: 0 })
    const [filterType, setFilterType] = useState<'all' | 'event' | 'business' | 'achievement'>('all')

    // Fetch platform stats once
    useEffect(() => {
        fetch('/api/social/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setPlatformStats(data)
            })
            .catch(err => console.error("Error fetching stats:", err))
    }, [])

    // Load feed when filter changes
    useEffect(() => {
        setPage(1)
        setHasMore(true)
        fetchFeed(1, filterType)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType])

    const fetchFeed = async (pageNumber: number, type: string = filterType) => {
        try {
            if (pageNumber === 1) setLoading(true)
            else setLoadingMore(true)

            const res = await fetch(`/api/social/feed?page=${pageNumber}&limit=15&type=${type}`)
            const data = await res.json()

            if (res.ok) {
                if (data.data.length < 15) {
                    setHasMore(false)
                }

                if (pageNumber === 1) {
                    setPosts(data.data)
                } else {
                    // Prevent duplicate entries by simple ID filtering
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.id))
                        const newPosts = data.data.filter((p: FeedPost) => !existingIds.has(p.id))
                        return [...prev, ...newPosts]
                    })
                }
            } else {
                console.error("Failed to load feed", data.error)
            }
        } catch (error) {
            console.error("Error fetching feed:", error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchFeed(nextPage, filterType)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] selection:bg-secondary/20">
            <Navbar />

            <main className="flex-1 pb-24">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-100 pt-10 md:pt-16 pb-12 md:pb-20 mb-6 md:mb-8">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-6 md:mb-8">
                            <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary">Real-time pulses</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-4 md:mb-8">
                            Community <span className="text-secondary">Pulse</span>
                        </h1>
                        <p className="text-slate-500 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                            Stay connected with the latest events, business updates, and member achievements across our global network.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-12">
                    {/* Main Content Area - Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                        {/* Left Sidebar - Profile & Quick Links */}
                        <div className="hidden lg:block lg:sticky lg:top-24 space-y-8">
                            {isAuthenticated && user ? (
                                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                    <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 w-full relative">
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                    </div>
                                    <div className="px-6 pb-8 flex flex-col items-center -mt-12 relative z-10">
                                        <div className="h-24 w-24 bg-white rounded-3xl p-1 shadow-2xl shadow-slate-900/10 border border-slate-100">
                                            <div className="h-full w-full rounded-[1.25rem] bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                                {user.profileImage ? (
                                                    <Image src={user.profileImage} alt={user.name || "User"} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-slate-900 font-black text-3xl">{user.name?.[0]?.toUpperCase() || 'M'}</span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="mt-4 font-black text-xl text-slate-900 tracking-tight">{user.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{user.role}</p>

                                        <Link href="/dashboard" className="mt-8 group w-full">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-300">
                                                <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 group-hover:text-white">Dashboard</span>
                                                <LinkIcon className="h-4 w-4 text-slate-300 group-hover:text-secondary" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 text-center">
                                    <div className="h-16 w-16 rounded-3xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                                        <Users className="h-8 w-8 text-secondary" />
                                    </div>
                                    <h3 className="font-black text-xl text-slate-900 tracking-tight mb-2">Join Pulsing</h3>
                                    <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Log in to interact with posts, RSVP to events, and more.</p>
                                    <Link href="/login" className="block w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                                        Log In Now
                                    </Link>
                                </div>
                            )}

                            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 ml-1">Quick Discovery</h3>
                                <nav className="space-y-3">
                                    <Link href="/events" className="flex items-center justify-between p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-all">
                                                <Calendar className="h-5 w-5 text-secondary group-hover:text-white" />
                                            </div>
                                            <span className="text-sm font-bold">Events</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-200" />
                                    </Link>
                                    <Link href="/business" className="flex items-center justify-between p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 transition-all">
                                                <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <span className="text-sm font-bold">Business</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-200" />
                                    </Link>
                                    <Link href="/achievements" className="flex items-center justify-between p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 transition-all">
                                                <Activity className="h-5 w-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <span className="text-sm font-bold">Achievements</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-200" />
                                    </Link>
                                </nav>
                            </div>
                        </div>

                        {/* Main Feed Container (Center) */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Filter Bar */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-3 sticky top-24 z-20 flex overflow-x-auto hide-scrollbar gap-2">
                                {['all', 'event', 'business', 'achievement'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type as any)}
                                        className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${filterType === type
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                            }`}
                                    >
                                        {type === 'all' ? 'Everything' : type}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                    <div className="relative">
                                        <Loader2 className="h-16 w-16 animate-spin text-secondary/20" />
                                        <Loader2 className="h-16 w-16 animate-spin text-secondary absolute inset-0 [animation-delay:-0.5s]" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing Feed...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-20 text-center">
                                    <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-8">
                                        <Users className="h-12 w-12 text-slate-200" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Complete Silence</h3>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">There are no updates to display at the moment. Be the first to start the pulse!</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {posts.map((post, index) => (
                                        <SocialPostCard key={`${post.type}-${post.id}-${index}`} post={post} />
                                    ))}

                                    {/* Load More Trigger */}
                                    {hasMore && (
                                        <div className="pt-6 pb-20 text-center">
                                            <button
                                                onClick={loadMore}
                                                disabled={loadingMore}
                                                className="h-16 px-10 rounded-2xl bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all disabled:opacity-50 shadow-xl shadow-slate-200/50 active:scale-95"
                                            >
                                                {loadingMore ? (
                                                    <span className="flex items-center gap-3">
                                                        <Loader2 className="h-5 w-5 animate-spin" /> Fetching Deep...
                                                    </span>
                                                ) : (
                                                    "Discover More"
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {!hasMore && posts.length > 0 && (
                                        <div className="py-20 text-center flex flex-col items-center gap-6">
                                            <div className="h-1 w-12 rounded-full bg-slate-100" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">End of flow</p>
                                            <div className="h-1 w-12 rounded-full bg-slate-100" />
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Right Sidebar - Platform Data */}
                        <div className="hidden lg:block lg:sticky lg:top-24 space-y-8">
                            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 ml-1">Platform Impact</h3>
                                <div className="space-y-6">
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-1 translate-y--1 group-hover:scale-150 transition-transform">
                                            <Calendar className="h-12 w-12 text-slate-900" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-4xl font-black text-slate-900 tracking-tighter">{platformStats.events}+</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Active Events</div>
                                        </div>
                                    </div>
                                    <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-1 translate-y--1 group-hover:scale-150 transition-transform">
                                            <Briefcase className="h-12 w-12 text-secondary" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-4xl font-black text-secondary tracking-tighter">{platformStats.businesses}+</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-secondary/80 mt-2">Local Ventures</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-1 translate-y--1 group-hover:scale-150 transition-transform">
                                            <Users className="h-12 w-12 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-4xl font-black text-white tracking-tighter">{platformStats.members}+</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Connected Hearts</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center space-y-4 px-8">
                                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2">
                                    <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
                                    <Link href="/help" className="hover:text-slate-900 transition-colors">Help</Link>
                                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                                    <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
                                </div>
                                <p className="pt-4 border-t border-slate-100 opacity-50">© 2026 CommuNet Platform</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
