"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Users, History, Target, Heart, Loader2 } from "lucide-react"

export default function AboutPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats")
                if (res.ok) {
                    setStats(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L+`
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k+`
        return `₹${val}`
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-slate-900 text-white py-20 md:py-32 px-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse" />

                    <div className="relative z-10 container mx-auto max-w-4xl">
                        <div className="inline-block px-6 py-2 mb-8 rounded-full bg-white/5 border border-white/10 text-secondary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">Our Heritage</div>
                        <h1 className="font-sans text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Our Legacy, Our Future</h1>
                        <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium max-w-2xl mx-auto">
                            Connecting the CommuNet community through shared values, culture, and progress.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-10 md:py-16 space-y-10 md:space-y-16">

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        <Card className="bg-white border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] rounded-[2.5rem] overflow-hidden group hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-8 md:p-12 text-center space-y-4 md:space-y-6 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-[1.25rem] flex items-center justify-center mb-6 relative z-10 shadow-inner border border-slate-100 group-hover:bg-white transition-colors">
                                    <Target className="h-8 w-8 md:h-10 md:w-10 text-secondary animate-float" />
                                </div>
                                <h2 className="font-sans text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Our Mission</h2>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                    To create a digital ecosystem that empowers every member of the CommuNet community
                                    by providing resources for business growth, career development, and social welfare,
                                    while preserving our rich cultural heritage.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] rounded-[2.5rem] overflow-hidden group hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-8 md:p-12 text-center space-y-4 md:space-y-6 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-[1.25rem] flex items-center justify-center mb-6 relative z-10 shadow-inner border border-slate-100 group-hover:bg-white transition-colors">
                                    <Heart className="h-8 w-8 md:h-10 md:w-10 text-secondary animate-pulse-slow" />
                                </div>
                                <h2 className="font-sans text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Our Vision</h2>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                    A globally connected, prosperous, and compassionate community where every individual
                                    contributes to the collective well-being and upholds the Dharma of Vasavi Matha.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History Section */}
                    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] border border-slate-100">
                        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10 pb-6 border-b border-slate-50">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                <History className="h-8 w-8 md:h-10 md:w-10 text-secondary shrink-0" />
                            </div>
                            <h2 className="font-sans text-3xl md:text-4xl font-black text-slate-900 tracking-tight">A Brief History</h2>
                        </div>
                        <div className="prose prose-lg md:prose-xl text-slate-600 max-w-none font-medium leading-relaxed">
                            <p className="mb-6">
                                The CommuNet community traces its lineage back to ancient times, known for its entrepreneurial spirit,
                                philanthropy, and devotion to Sri Kanyaka Parameswari (Vasavi Matha). Historically, our community has
                                played a pivotal role in trade, commerce, and social service across India.
                            </p>
                            <p className="mb-6">
                                Guided by the principles of &quot;Dharmam, Seelam, Ahimsa&quot; (Righteousness, Character, Non-Violence),
                                we have established countless educational institutions, hospitals, and charitable trusts.
                                Today, we continue this legacy by adapting to the modern world while keeping our roots firm.
                            </p>
                            <p className="text-xl md:text-2xl text-slate-900 font-black italic border-l-4 border-secondary pl-6 py-2 bg-slate-50 rounded-r-2xl">
                                This portal is a testament to our commitment to unity and progress in the digital age.
                            </p>
                        </div>
                    </div>

                    {/* Community Stats */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 md:p-20 text-white text-center shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700"></div>

                        <div className="relative z-10">
                            <h2 className="font-sans text-3xl md:text-5xl font-black mb-10 md:mb-16 tracking-tight">Growing Together</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                                <div className="space-y-2">
                                    <div className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-4 tracking-tighter">
                                        {loading ? <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto opacity-50" /> : `${stats?.members || 0}+`}
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded-full inline-block backdrop-blur-sm border border-white/10 group-hover:border-secondary/30 transition-colors">Active Members</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-4 tracking-tighter">
                                        {loading ? <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto opacity-50" /> : `${stats?.businesses || 0}+`}
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded-full inline-block backdrop-blur-sm border border-white/10 group-hover:border-secondary/30 transition-colors">Ventures</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-4 tracking-tighter">
                                        {loading ? <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto opacity-50" /> : formatCurrency(stats?.donations || 0)}
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded-full inline-block backdrop-blur-sm border border-white/10 group-hover:border-secondary/30 transition-colors">Philanthropy</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-4 tracking-tighter">
                                        {loading ? <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto opacity-50" /> : `${stats?.events || 0}+`}
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded-full inline-block backdrop-blur-sm border border-white/10 group-hover:border-secondary/30 transition-colors">Events Managed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    )
}
