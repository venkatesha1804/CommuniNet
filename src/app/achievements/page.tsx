"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Plus, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { HeroCarousel } from "@/components/achievements/hero-carousel"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Achievement {
    id: string
    title: string
    category: string
    date: string
    description: string
    images: string[]
    status: string
    user: {
        name: string | null
        profileImage: string | null
    }
}

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [topAchievements, setTopAchievements] = useState<Achievement[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'mine'>('all')
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const { user, isAuthenticated } = useAuth()

    const router = useRouter()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(9) // 3x3 grid

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1) // Reset to page 1 on search
        }, 500)
        return () => clearTimeout(handler)
    }, [search, filter])

    const fetchAchievements = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                search: debouncedSearch
            })
            if (filter === 'mine') params.append('filter', 'mine')

            const [listRes, topRes] = await Promise.all([
                fetch(`/api/achievements?${params.toString()}`),
                fetch('/api/achievements?limit=5')
            ])

            if (listRes.ok) {
                const { data, pagination } = await listRes.json()
                setAchievements(data)
                setTotalPages(pagination.pages)
            }

            if (topRes.ok) {
                const { data } = await topRes.json()
                setTopAchievements(data)
            }

        } catch (error) {
            console.error("Failed to fetch achievements", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAchievements()
    }, [currentPage, debouncedSearch])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] selection:bg-secondary/20">
            <Navbar />
            <main className="flex-1 pb-24">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-100 pt-16 pb-20 mb-12">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
                            <Trophy className="h-4 w-4 text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Celebrating Excellence</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                            Community <span className="text-secondary">Gold</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                            Celebrating success, excellence, and the inspiring milestones of our community members.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                        {/* Filter Toggle (Authenticated Only) */}
                        {isAuthenticated && (
                            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] border border-slate-100 flex gap-2 shadow-2xl shadow-slate-200/50">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${filter === 'all'
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    Global Pulse
                                </button>
                                <button
                                    onClick={() => setFilter('mine')}
                                    className={`h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${filter === 'mine'
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    My Milestones
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hero Carousel */}
                    {topAchievements.length > 0 && !search && (
                        <div className="mb-20">
                            <HeroCarousel achievements={topAchievements} />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mb-12" id="full-list">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-secondary transition-colors" />
                            <Input
                                placeholder="Search achievements..."
                                className="h-16 pl-14 pr-6 rounded-[2rem] bg-white border-slate-100 shadow-xl shadow-slate-200/50 focus:ring-secondary focus:border-secondary text-lg font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                suppressHydrationWarning
                            />
                        </div>
                        {isAuthenticated && (
                            <Button
                                className="h-16 px-10 rounded-[2rem] bg-slate-900 text-white hover:bg-secondary font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 transition-all active:scale-95 group"
                                suppressHydrationWarning
                                onClick={() => {
                                    if (user?.status === 'approved' || user?.role === 'admin') {
                                        router.push("/achievements/add")
                                    } else {
                                        toast.error("Action Restricted", {
                                            description: "Verification Pending. Your account is currently under review by our community administrators."
                                        })
                                    }
                                }}
                            >
                                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" /> Share Achievement
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <div className="relative">
                                <Loader2 className="h-16 w-16 animate-spin text-secondary/20" />
                                <Loader2 className="h-16 w-16 animate-spin text-secondary absolute inset-0 [animation-delay:-0.5s]" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Scanning Highlights...</p>
                        </div>
                    ) : achievements.length === 0 ? (
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-20 text-center">
                            <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-8">
                                <Trophy className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Quiet Reflection</h3>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">No achievements match your search criteria. Be the one to set a new standard!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {achievements.map((item) => (
                                    <Link href={`/achievements/${item.id}`} key={item.id} className="block group">
                                        <Card className="rounded-[3rem] border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-secondary/20 transition-all duration-500 overflow-hidden h-full flex flex-col group-hover:scale-[1.02]">
                                            <div className="relative h-72 bg-slate-100 overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <Image src={item.images[0]} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-slate-50">
                                                        <Trophy className="h-20 w-20 text-slate-200" />
                                                    </div>
                                                )}
                                                <div className="absolute top-6 right-6 flex flex-col items-end gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                    <div className="bg-white/90 backdrop-blur-xl px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-2xl border border-white/50">
                                                        {item.category}
                                                    </div>
                                                    {item.status === 'deleted_by_admin' && (
                                                        <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg border border-red-400">
                                                            Restricted
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-8 pb-4 flex-1 flex flex-col">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="h-12 w-12 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-sm">
                                                        {item.user.profileImage ? (
                                                            <Image src={item.user.profileImage} alt={item.user.name || "User"} fill className="object-cover" />
                                                        ) : (
                                                            <span className="text-slate-900 font-black text-sm">{item.user.name?.charAt(0).toUpperCase() || "U"}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{item.user.name || "Anonymous Member"}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-0.5">Contributor</p>
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-4 group-hover:text-secondary transition-colors line-clamp-2">{item.title}</h3>
                                                <p className="text-slate-500 font-medium text-sm line-clamp-2 leading-relaxed mb-8 flex-1">{item.description}</p>

                                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                        <Calendar className="h-4 w-4 mr-2 text-secondary" />
                                                        <span>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <ShareButton
                                                        url={`/achievements/${item.id}`}
                                                        title={item.title}
                                                        description={`Achievement by ${item.user.name || "Anonymous"}`}
                                                        details={`🏆 *Achievement: ${item.title}*\nBy: ${item.user.name || "Anonymous"}\nCategory: ${item.category}\nDate: ${new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n${item.description}`}
                                                        className="h-10 w-10 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-50"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="py-20 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
