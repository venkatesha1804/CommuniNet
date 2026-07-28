"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Loader2, UserPlus, UserCheck, Users, Briefcase, Calendar, Store } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

interface MemberProfile {
    id: string
    name: string | null
    email: string
    location: string | null
    gotra: string | null
    bio: string | null
    profileImage: string | null
    createdAt: string
    followerCount: number
    followingCount: number
    isFollowing: boolean
    jobs: any[]
    businesses: any[]
    events: any[]
    followers: { id: string; name: string | null; location: string | null; profileImage: string | null }[]
    followingList: { id: string; name: string | null; location: string | null; profileImage: string | null }[]
}

export default function MemberProfilePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [member, setMember] = useState<MemberProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("posts")
    const { isAuthenticated, user, getToken } = useAuth()

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/members/${id}`)
                if (res.ok) setMember(await res.json())
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchProfile()
    }, [id])

    const toggleFollow = async () => {
        if (!member) return
        setFollowLoading(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/members/${member.id}/follow`, {
                method: member.isFollowing ? 'DELETE' : 'POST',
                headers,
            })
            if (res.ok) {
                setMember(prev => prev ? {
                    ...prev,
                    isFollowing: !prev.isFollowing,
                    followerCount: prev.isFollowing ? prev.followerCount - 1 : prev.followerCount + 1,
                } : null)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFollowLoading(false)
        }
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    const tabs = [
        { id: "posts", label: "Posts" },
        { id: "followers", label: `Followers (${member?.followerCount || 0})` },
        { id: "following", label: `Following (${member?.followingCount || 0})` },
    ]

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-transparent text-slate-400 hover:text-slate-900 pl-0 font-black uppercase tracking-[0.2em] text-[10px]">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Protocol Return
                    </Button>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                        </div>
                    ) : !member ? (
                        <p className="text-center text-muted-foreground py-16">Member not found.</p>
                    ) : (
                        <div className="space-y-12">
                            {/* Profile Header */}
                            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-14 text-center shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                                <div className="absolute -right-24 -top-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all duration-700" />
                                <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-slate-900/5 rounded-full blur-3xl group-hover:bg-slate-900/10 transition-all duration-700" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] bg-slate-50 border-4 border-white flex items-center justify-center mb-8 text-5xl font-black text-slate-200 overflow-hidden relative shadow-2xl group-hover:rotate-3 transition-transform duration-500">
                                        {member.profileImage ? (
                                            <Image src={member.profileImage} alt={member.name || 'Member'} fill className="object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            member.name?.charAt(0).toUpperCase() || "?"
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Classified Member</p>
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">{member.name || "Anonymous"}</h1>
                                    <p className="text-sm font-bold text-slate-400 mt-4 tracking-wide">{member.email}</p>

                                    <div className="flex items-center justify-center gap-6 mt-8">
                                        {member.location && (
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><MapPin className="h-3 w-3 text-secondary" /> {member.location}</span>
                                        )}
                                        {member.gotra && (
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-full shadow-lg shadow-slate-900/10 border border-slate-900">{member.gotra}</span>
                                        )}
                                    </div>

                                    {member.bio && (
                                        <p className="text-slate-500 font-medium mt-10 max-w-lg mx-auto leading-relaxed text-sm italic">"{member.bio}"</p>
                                    )}

                                    <div className="flex justify-center gap-12 mt-12 pt-10 border-t border-slate-50 w-full mb-8">
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-black text-slate-900">{member.followerCount}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Founders List</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-black text-slate-900">{member.followingCount}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Following Hub</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Commissioned {formatDate(member.createdAt)}</p>

                                        {isAuthenticated && user?.email !== member.email && (
                                            <Button
                                                className={`h-14 px-10 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all ${member.isFollowing
                                                    ? 'bg-white text-slate-400 border border-slate-100 hover:text-red-500 hover:border-red-50 hover:bg-red-50'
                                                    : 'bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 shadow-slate-900/10'
                                                    }`}
                                                disabled={followLoading}
                                                onClick={toggleFollow}
                                            >
                                                {followLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : member.isFollowing ? (
                                                    <><UserCheck className="h-4 w-4 mr-2" /> Deactivate Link</>
                                                ) : (
                                                    <><UserPlus className="h-4 w-4 mr-2" /> Establish Protocol</>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex justify-center border-b border-slate-100">
                                <div className="flex space-x-12">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2",
                                                activeTab === tab.id
                                                    ? "border-secondary text-slate-900"
                                                    : "border-transparent text-slate-300 hover:text-slate-900"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="pb-12">
                                {activeTab === "posts" && (
                                    <div className="grid gap-6">
                                        {member.jobs.length === 0 && member.businesses.length === 0 && member.events.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-inner">
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No approved operations logged</p>
                                            </div>
                                        ) : (
                                            <>
                                                {member.jobs.map((job: any) => (
                                                    <div key={job.id} className="bg-white border border-slate-50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden border-l-4 border-l-secondary">
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-secondary mb-4 uppercase tracking-widest">
                                                            <Briefcase className="h-3 w-3" /> Career Assignment
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-secondary transition-colors">{job.title}</h3>
                                                        <p className="text-slate-400 font-bold mt-2">{job.company} • {job.location}</p>
                                                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-6">{formatDate(job.createdAt)}</p>
                                                    </div>
                                                ))}
                                                {member.businesses.map((biz: any) => (
                                                    <div key={biz.id} className="bg-white border border-slate-50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden border-l-4 border-l-slate-900">
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 mb-4 uppercase tracking-widest">
                                                            <Store className="h-3 w-3" /> Business Protocol
                                                        </div>
                                                        <Link href={`/business/${biz.id}`}>
                                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-secondary transition-colors cursor-pointer">{biz.name}</h3>
                                                        </Link>
                                                        <p className="text-slate-400 font-bold mt-2">{biz.category}</p>
                                                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-6">{formatDate(biz.createdAt)}</p>
                                                    </div>
                                                ))}
                                                {member.events.map((evt: any) => (
                                                    <div key={evt.id} className="bg-white border border-slate-50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden border-l-4 border-l-slate-300">
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3 text-secondary" /> Operation Log
                                                        </div>
                                                        <Link href={`/events/${evt.id}`}>
                                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-secondary transition-colors cursor-pointer">{evt.title}</h3>
                                                        </Link>
                                                        <p className="text-slate-400 font-bold mt-2">{evt.location} • Scheduled {formatDate(evt.date)}</p>
                                                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-6">{formatDate(evt.createdAt)}</p>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === "followers" && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {member.followers.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-inner col-span-full">
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No linked founders detected</p>
                                            </div>
                                        ) : (
                                            member.followers.map(f => (
                                                <Link key={f.id} href={`/members/${f.id}`}>
                                                    <div className="bg-white border border-slate-50 rounded-2xl p-5 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-300 shrink-0 overflow-hidden relative group-hover:border-secondary transition-colors">
                                                            {f.profileImage ? (
                                                                <Image src={f.profileImage} alt={f.name || 'Member'} fill className="object-cover" />
                                                            ) : (
                                                                f.name?.charAt(0).toUpperCase() || "?"
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm group-hover:text-secondary transition-colors">{f.name || "Anonymous"}</p>
                                                            {f.location && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-secondary" /> {f.location}</p>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTab === "following" && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {member.followingList.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-inner col-span-full">
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No outgoing link protocols active</p>
                                            </div>
                                        ) : (
                                            member.followingList.map(f => (
                                                <Link key={f.id} href={`/members/${f.id}`}>
                                                    <div className="bg-white border border-slate-50 rounded-2xl p-5 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-300 shrink-0 overflow-hidden relative group-hover:border-secondary transition-colors">
                                                            {f.profileImage ? (
                                                                <Image src={f.profileImage} alt={f.name || 'Member'} fill className="object-cover" />
                                                            ) : (
                                                                f.name?.charAt(0).toUpperCase() || "?"
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm group-hover:text-secondary transition-colors">{f.name || "Anonymous"}</p>
                                                            {f.location && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-secondary" /> {f.location}</p>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}
