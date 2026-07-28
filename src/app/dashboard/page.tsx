"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Building2,
    Briefcase,
    HandHeart,
    Trophy,
    Calendar,
    HeartHandshake,
    User,
    BadgeCheck,
    Loader2,
    Newspaper
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

const modules = [
    {
        title: "Business Support",
        description: "Find partners, list your venture, and grow together.",
        icon: Building2,
        href: "/business",
        color: "text-slate-900",
    },
    {
        title: "Career Hub",
        description: "Job listings, mentorship, and educational guidance.",
        icon: Briefcase,
        href: "/career",
        color: "text-secondary",
    },
    {
        title: "Help & Support",
        description: "Request assistance for medical or financial needs.",
        icon: HandHeart,
        color: "text-slate-900",
        href: "/help",
    },
    {
        title: "Achievements",
        description: "Celebrate community success stories and milestones.",
        icon: Trophy,
        href: "/achievements",
        color: "text-secondary",
    },
    {
        title: "Events",
        description: "Upcoming cultural gatherings and community meetups.",
        icon: Calendar,
        href: "/events",
        color: "text-slate-900",
    },
    {
        title: "Donations",
        description: "Contribute to community welfare and verified causes.",
        icon: HeartHandshake,
        href: "/donations",
        color: "text-secondary",
    },
    {
        title: "Hostel Directory",
        description: "Find or list verified, safe community-trusted accommodations.",
        icon: Building2,
        href: "/accommodations",
        color: "text-slate-900",
    },
    {
        title: "Newsletters",
        description: "Official community broadcasts and archived updates.",
        icon: Newspaper,
        href: "/newsletters",
        color: "text-secondary",
    },
]

export default function DashboardPage() {
    const { user, getToken } = useAuth()
    const [members, setMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(true)

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = await getToken()
                const res = await fetch('/api/members?limit=6', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.members && Array.isArray(data.members)) {
                        setMembers(data.members.slice(0, 6))
                    } else if (Array.isArray(data)) {
                        setMembers(data.slice(0, 6))
                    }
                }
            } catch (error) {
                console.error("Failed to fetch members", error)
            } finally {
                setLoadingMembers(false)
            }
        }
        fetchMembers()
    }, [getToken])

    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-8">

                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 mb-8 md:mb-12 bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                        {/* Decorative Background Elements */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all duration-700" />
                        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-slate-900/5 rounded-full blur-3xl group-hover:bg-slate-900/10 transition-all duration-700" />

                        <div className="flex items-center gap-6 md:gap-10 relative z-10 text-center md:text-left flex-col md:flex-row w-full md:w-auto">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center shadow-inner overflow-hidden relative group-hover:border-secondary/20 transition-all duration-500 shrink-0">
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                                <User className="h-10 w-10 md:h-12 md:w-12 text-slate-900 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Member Portal</p>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight md:leading-none">
                                    Namaskaram, <br className="block md:hidden" /> <span className="text-secondary">{user?.name ? user.name.split(" ")[0] : "Member"}</span>
                                </h1>
                                <p className="text-slate-500 text-sm md:text-base font-bold mt-4 max-w-md mx-auto md:mx-0">Access your personal dashboard and community services.</p>
                            </div>
                        </div>

                        {/* Verification Status Badge - Hide for Admins */}
                        {user?.role !== 'admin' && (
                            <div className="flex flex-col items-center md:items-end gap-3 relative z-10 mt-6 md:mt-0">
                                {user?.status === 'approved' ? (
                                    <div className="flex items-center gap-3 px-6 py-3 bg-green-50 rounded-2xl border border-green-100 shadow-sm group-hover:shadow-green-900/5 transition-all">
                                        <BadgeCheck className="h-5 w-5 text-green-600" />
                                        <span className="font-black text-green-700 text-[10px] uppercase tracking-widest">Verified Member</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm group-hover:shadow-amber-900/5 transition-all">
                                        <BadgeCheck className="h-5 w-5 text-amber-600" />
                                        <span className="font-black text-amber-700 text-[10px] uppercase tracking-widest">Awaiting Verification</span>
                                    </div>
                                )}
                                {user?.status !== 'approved' && (
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        Limited Account Access
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
                        {modules.map((module, index) => (
                            <Link href={module.href} key={index} className="block h-full animate-slide-up group" style={{ animationDelay: `${index * 100}ms` }}>
                                <Card className="border-slate-100 bg-white rounded-[2.5rem] transition-all duration-500 h-full cursor-pointer shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/40 hover:-translate-y-2 overflow-hidden border">
                                    <CardContent className="p-10 flex flex-col items-center md:items-start text-center md:text-left relative">
                                        <div className={`
                                        mb-8 h-16 w-16 rounded-[1.5rem] flex items-center justify-center
                                        bg-slate-50 border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-500 shadow-inner
                                        ${module.color} group-hover:text-secondary
                                    `}>
                                            <module.icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                                            {module.title}
                                        </h3>
                                        <p className="text-slate-500 font-bold leading-relaxed">
                                            {module.description}
                                        </p>
                                        <div className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-secondary transition-colors flex items-center gap-2">
                                            Open Module <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Members List Section */}
                    <div className="mb-16">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Community Registry</h2>
                                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Connecting with fellow verified members</p>
                            </div>
                            <Link href="/members">
                                <Button variant="outline" className="h-14 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-white border-slate-100 rounded-full shadow-lg transition-all active:scale-[0.98]">Explore Directory</Button>
                            </Link>
                        </div>

                        {loadingMembers ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <Card key={i} className="animate-pulse h-24 bg-gold/5 border-gold/10" />
                                ))}
                            </div>
                        ) : members.length > 0 ? (
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-4 pb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {members.map((member: any) => (
                                        <div key={member.id} className="bg-white border border-slate-50 rounded-[2rem] p-6 flex items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative">
                                                {member.profileImage ? (
                                                    <img src={member.profileImage} alt={member.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400 font-black text-xl uppercase">
                                                        {member.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-slate-900 truncate tracking-tight uppercase text-sm leading-tight group-hover:text-secondary transition-colors">{member.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{member.role === 'admin' ? 'Elite Council' : 'Verified Member'}</p>
                                                {member.location && (
                                                    <p className="text-[10px] text-slate-300 mt-2 truncate font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Building2 className="h-3 w-3" /> {member.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-cream/20 rounded-lg border border-dashed border-gold/30">
                                <p className="text-muted-foreground font-serif">No members found yet.</p>
                            </div>
                        )}
                    </div>

                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}

