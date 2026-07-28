"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin, UserPlus, UserCheck, Users, Rss } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Pagination } from "@/components/ui/pagination"
import { AuthGuard } from "@/components/auth-guard"

interface Member {
    id: string
    name: string | null
    email: string
    location: string | null
    gotra: string | null
    bio: string | null
    profileImage: string | null
    followerCount: number
    followingCount: number
    isFollowing: boolean
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [followLoading, setFollowLoading] = useState<string | null>(null)
    const { isAuthenticated, getToken } = useAuth()

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams({ page: String(page) })
                if (search) params.append('search', search)

                const token = await getToken()
                const res = await fetch(`/api/members?${params.toString()}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })

                if (res.ok) {
                    const data = await res.json()
                    setMembers(data.members)
                    setTotalPages(data.totalPages)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        const timeout = setTimeout(fetchMembers, 300)
        return () => clearTimeout(timeout)
    }, [search, page, getToken])

    const toggleFollow = async (memberId: string, isFollowing: boolean) => {
        setFollowLoading(memberId)
        try {
            const token = await getToken()
            const res = await fetch(`/api/members/${memberId}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (res.ok) {
                setMembers(prev => prev.map(m =>
                    m.id === memberId
                        ? {
                            ...m,
                            isFollowing: !isFollowing,
                            followerCount: isFollowing ? m.followerCount - 1 : m.followerCount + 1,
                        }
                        : m
                ))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFollowLoading(null)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight uppercase">Community Registry</h1>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Connect with verified members of the CommuNet portal</p>
                        </div>
                        {isAuthenticated && (
                            <Link href="/members/feed">
                                <Button className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-12 px-8 rounded-full shadow-lg transition-all font-black uppercase tracking-widest text-[10px]">
                                    <Rss className="h-4 w-4 mr-2" /> Operations Feed
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="relative max-w-lg mx-auto mb-12 px-2 md:px-0">
                        <Search className="absolute left-6 md:left-6 top-5 h-5 w-5 text-slate-300" />
                        <Input
                            placeholder="SEARCH REGISTRY..."
                            className="pl-14 h-16 text-xs font-black uppercase tracking-[0.2em] border-slate-100 bg-white focus-visible:ring-secondary/20 shadow-2xl shadow-slate-200/50 rounded-2xl placeholder:text-slate-200"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>

                    {/* Members Grid */}
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No members found in registry</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {members.map(member => (
                                    <div key={member.id} className="bg-white border border-slate-50 rounded-[2.5rem] p-8 md:p-10 text-center shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-300/40 transition-all hover:-translate-y-2 group overflow-hidden">
                                        <div className="relative">
                                            {/* Avatar */}
                                            <div className="mx-auto h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center mb-6 text-3xl font-black text-slate-300 overflow-hidden relative shadow-inner group-hover:border-secondary transition-all group-hover:rotate-3">
                                                {member.profileImage ? (
                                                    <Image src={member.profileImage} alt={member.name || 'Member'} fill className="object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    member.name?.charAt(0).toUpperCase() || "?"
                                                )}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <Link href={`/members/${member.id}`}>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 hover:text-secondary transition-colors cursor-pointer tracking-tight uppercase mb-2">
                                                {member.name || "Anonymous"}
                                            </h3>
                                        </Link>

                                        {/* Location */}
                                        {member.location && (
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
                                                <MapPin className="h-3.5 w-3.5 text-secondary" /> {member.location}
                                            </p>
                                        )}

                                        {/* Gotra */}
                                        {member.gotra && (
                                            <span className="inline-block mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white border border-slate-900 shadow-xl shadow-slate-900/10 transition-all hover:bg-secondary hover:text-slate-900 hover:border-secondary">
                                                {member.gotra}
                                            </span>
                                        )}

                                        {/* Bio */}
                                        {member.bio && (
                                            <p className="text-xs text-slate-400 mt-4 line-clamp-2 break-all italic font-medium leading-relaxed px-4">{member.bio}</p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex justify-center gap-6 mt-6 pb-6 border-b border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-slate-900">{member.followerCount}</span>
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Followers</span>
                                            </div>
                                            <div className="flex flex-col border-l border-slate-50 pl-6">
                                                <span className="text-lg font-black text-slate-900">{member.followingCount}</span>
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Following</span>
                                            </div>
                                        </div>

                                        {/* Follow Button */}
                                        {isAuthenticated && (
                                            <Button
                                                size="sm"
                                                className={`mt-6 h-12 w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${member.isFollowing
                                                    ? 'bg-white text-slate-400 border border-slate-100 hover:text-red-500 hover:border-red-50 hover:bg-red-50'
                                                    : 'bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 shadow-xl shadow-slate-900/10'
                                                    }`}
                                                disabled={followLoading === member.id}
                                                onClick={() => toggleFollow(member.id, member.isFollowing)}
                                            >
                                                {followLoading === member.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : member.isFollowing ? (
                                                    <><UserCheck className="h-4 w-4 mr-2" /> Following</>
                                                ) : (
                                                    <><UserPlus className="h-4 w-4 mr-2" /> Follow</>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="py-12">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}
