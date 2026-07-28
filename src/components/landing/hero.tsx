"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function HeroSection() {
    const { isAuthenticated, isLoading } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState<{ members: number, businesses: number, events: number, donations: number } | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0)
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats", err))
        return () => clearTimeout(t)
    }, [])

    const formatStat = (num: number) => {
        if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
        if (num >= 1e7) return `${(num / 1e7).toFixed(1)}Cr`
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
        if (num >= 1e5) return `${(num / 1e5).toFixed(1)}L`
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
        return num.toString()
    }

    return (
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-32 md:pb-40 bg-[#FAF9F6]">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
                <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-secondary/20 blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-slate-200/20 blur-[120px]"></div>
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <ScrollAnimation animation="fade-up" delay={0.1}>
                    <div className="inline-flex items-center rounded-full border border-secondary/20 bg-white px-5 py-2 text-xs md:text-sm font-bold text-secondary mb-6 md:mb-8 animate-slide-up shadow-sm">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-secondary mr-2.5 animate-pulse"></span>
                        Welcome to CommuNet
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.2}>
                    <h1 className="mx-auto max-w-5xl font-sans text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight text-slate-900 animate-slide-up [animation-delay:200ms] leading-[1.1]">
                        A Trusted Digital Platform for community  <span className="text-secondary">CommuNet</span>
                    </h1>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.4}>
                    <p className="mx-auto mt-6 md:mt-8 max-w-3xl text-base md:text-2xl text-slate-600 leading-relaxed font-medium animate-slide-up [animation-delay:400ms]">
                        Uniting members through business enablement, career development, and dedicated support.
                        A secure space to connect, grow, and uphold our shared heritage.
                    </p>
                </ScrollAnimation>

                {mounted && !isLoading && !isAuthenticated && (
                    <ScrollAnimation animation="fade-up" delay={0.6}>
                        <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-slide-up [animation-delay:600ms]">
                            <Link href="/join" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto min-w-[220px] text-base md:text-xl h-14 md:h-16 rounded-2xl font-bold bg-secondary text-slate-900 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:scale-105 transition-all border-0">
                                    Join Community
                                </Button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[220px] text-base md:text-xl h-14 md:h-16 rounded-2xl font-bold bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:scale-105 transition-all">
                                    Member Login
                                </Button>
                            </Link>
                        </div>
                    </ScrollAnimation>
                )}

                {mounted && !isLoading && isAuthenticated && (
                    <ScrollAnimation animation="fade-up" delay={0.6}>
                        <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-slide-up [animation-delay:600ms]">
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto min-w-[220px] text-base md:text-xl h-14 md:h-16 rounded-2xl font-bold bg-secondary text-slate-900 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:scale-105 transition-all border-0">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </ScrollAnimation>
                )}

                {/* Trust Indicators */}
                <ScrollAnimation animation="fade-up" delay={0.8}>
                    <div className="mt-16 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 border-t border-slate-200 pt-12 md:pt-16 max-w-6xl mx-auto animate-slide-up [animation-delay:800ms] text-slate-800">
                        <div className="flex flex-col items-center group p-4 md:p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                            <span className="font-sans text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 group-hover:scale-110 transition-transform group-hover:text-secondary">{stats ? `${formatStat(stats.members)}+` : "..."}</span>
                            <span className="text-xs md:text-sm text-slate-500 mt-3 font-semibold uppercase tracking-wider">Verified Members</span>
                        </div>
                        <div className="flex flex-col items-center group p-4 md:p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                            <span className="font-sans text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 group-hover:scale-110 transition-transform group-hover:text-secondary">{stats ? `${formatStat(stats.businesses)}+` : "..."}</span>
                            <span className="text-xs md:text-sm text-slate-500 mt-3 font-semibold uppercase tracking-wider">Businesses</span>
                        </div>
                        <div className="flex flex-col items-center group p-4 md:p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                            <span className="font-sans text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 group-hover:scale-110 transition-transform group-hover:text-secondary">{stats ? `₹${formatStat(stats.donations)}+` : "..."}</span>
                            <span className="text-xs md:text-sm text-slate-500 mt-3 font-semibold uppercase tracking-wider">Donations Raised</span>
                        </div>
                        <div className="flex flex-col items-center group p-4 md:p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                            <span className="font-sans text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 group-hover:scale-110 transition-transform group-hover:text-secondary">{stats ? `${formatStat(stats.events)}+` : "..."}</span>
                            <span className="text-xs md:text-sm text-slate-500 mt-3 font-semibold uppercase tracking-wider">Community Events</span>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    )
}
