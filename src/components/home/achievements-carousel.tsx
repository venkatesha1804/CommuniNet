"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trophy, Star, Loader2, Heart } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

interface Achievement {
    id: string
    title: string
    category: string
    description: string
    image?: string
    user: {
        name: string | null
        profileImage: string | null
    }
}

export function AchievementsCarousel() {
    const [achievements, setAchievements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(0)
    const [autoPlay, setAutoPlay] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both achievements and top donor
                const [achRes, donRes] = await Promise.all([
                    fetch("/api/achievements?limit=5"),
                    fetch("/api/donations/public")
                ])

                let combined: any[] = []

                if (achRes.ok) {
                    const achData = await achRes.json()
                    const items = Array.isArray(achData) ? achData : (achData.data || [])
                    combined = [...items]
                }

                if (donRes.ok) {
                    const donData = await donRes.json()
                    if (donData.topDonor) {
                        const topDonor = donData.topDonor
                        combined.unshift({
                            id: "top-donor",
                            title: "Highest Paid Contributor",
                            category: "COMMUNITY HERO",
                            description: `In appreciation of ${topDonor.name}'s outstanding generosity and commitment to the welfare of the CommuNet community.`,
                            user: {
                                name: topDonor.name,
                                profileImage: topDonor.image
                            },
                            isTopDonor: true,
                            amount: topDonor.total
                        })
                    }
                }

                setAchievements(combined)
            } catch (error) {
                console.error("Failed to fetch carousel data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const next = useCallback(() => {
        if (achievements.length === 0) return
        setCurrent((prev) => (prev + 1) % achievements.length)
    }, [achievements.length])

    const prev = useCallback(() => {
        if (achievements.length === 0) return
        setCurrent((prev) => (prev - 1 + achievements.length) % achievements.length)
    }, [achievements.length])

    useEffect(() => {
        if (!autoPlay || achievements.length <= 1) return
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [autoPlay, next, achievements.length])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <p className="mt-4 text-slate-500 font-bold">Loading community heroes...</p>
            </div>
        )
    }

    if (achievements.length === 0) return null

    const currentItem = achievements[current]

    return (
        <section className="py-16 md:py-24 bg-white relative overflow-hidden border-y border-slate-100">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full -mr-48 -mt-48 blur-[100px] animate-pulse-slow object-cover" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50 rounded-full -ml-48 -mb-48 blur-[100px] animate-pulse-slow object-cover" />

            <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                <ScrollAnimation animation="fade-up">
                    <div className="text-center mb-12 md:mb-16 animate-slide-up">
                        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="relative mb-4">
                                <Trophy className="h-10 w-10 md:h-12 md:w-12 text-secondary animate-float" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Community <span className="text-secondary">Champions</span></h2>
                            <div className="h-1.5 w-24 md:w-32 bg-secondary mx-auto mb-6 md:mb-8 rounded-full shadow-sm"></div>
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-2xl leading-relaxed font-medium">
                                Celebrating the extraordinary success stories and generous contributions that inspire us all.
                            </p>
                        </div>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="scale-up" delay={0.2}>
                    <div className="max-w-6xl mx-auto">
                        <Card animative={false} className={`bg-slate-50 border border-slate-100 text-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] transition-all duration-700 ${currentItem.isTopDonor ? 'border-secondary/50 bg-secondary/5' : ''}`}>
                            <CardContent className="p-8 md:p-14">
                                {currentItem.isTopDonor && (
                                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10">
                                        <span className="bg-secondary text-slate-900 text-xs md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-secondary/30 animate-pulse-slow mb-4 md:mb-0">
                                            <Trophy className="h-4 w-4" /> Top Contribution
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                                    {/* Achievement Image or Icon */}
                                    <div className="shrink-0 pt-4 md:pt-0">
                                        <div className={`h-40 w-40 md:h-48 md:w-48 lg:h-64 lg:w-64 rounded-[2rem] border-4 border-white bg-slate-100 flex items-center justify-center shadow-2xl overflow-hidden relative group ${currentItem.isTopDonor ? 'scale-105 ring-4 ring-secondary/50' : ''}`}>
                                            {currentItem.image ? (
                                                <Image
                                                    src={currentItem.image}
                                                    alt={currentItem.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : currentItem.isTopDonor ? (
                                                <div className="flex flex-col items-center justify-center p-4 lg:p-6 text-center bg-secondary/10 w-full h-full">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full" />
                                                        <Trophy className="h-16 w-16 lg:h-20 lg:w-20 text-secondary mb-3 md:mb-4 animate-float relative z-10" />
                                                    </div>
                                                    <span className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-widest">Community Legend</span>
                                                </div>
                                            ) : (
                                                <Star className="h-16 w-16 lg:h-20 lg:w-20 text-slate-300 fill-slate-200 animate-pulse-slow" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-center lg:text-left w-full pl-0 lg:pl-6">
                                        <div className={`inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-1.5 md:py-2 border rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-6 md:mb-8 ${currentItem.isTopDonor ? 'bg-secondary/10 text-secondary border-secondary/50' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                            {currentItem.isTopDonor ? <Heart className="h-4 w-4 md:h-4 md:w-4 fill-secondary text-secondary" /> : <Star className="h-4 w-4 md:h-4 md:w-4" />}
                                            <div className="flex space-x-1.5">
                                                <span className="text-slate-400 text-xs md:text-sm font-bold">Top Rated Member</span>
                                            </div>
                                        </div>
                                        <h3 className={`font-sans text-3xl md:text-4xl lg:text-6xl font-black mb-6 text-slate-900 leading-[1.1] tracking-tight mx-auto lg:mx-0 max-w-2xl lg:max-w-none ${currentItem.isTopDonor ? 'text-slate-900' : ''}`}>
                                            {currentItem.title}
                                        </h3>
                                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 md:mb-8">
                                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-[1.25rem] border-2 border-slate-200 overflow-hidden relative shadow-sm shrink-0">
                                                {currentItem.user.profileImage ? (
                                                    <Image
                                                        src={currentItem.user.profileImage}
                                                        alt={currentItem.user.name || "User"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl md:text-2xl font-black">
                                                        {currentItem.user.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className="text-xl md:text-2xl font-sans font-black text-slate-900 truncate">{currentItem.user.name || "Proud Community Member"}</p>
                                                {currentItem.isTopDonor && (
                                                    <p className="text-xs md:text-sm text-secondary font-bold uppercase tracking-[0.2em] mt-1 truncate">Total Donated: ₹{currentItem.amount.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-lg md:text-2xl leading-relaxed italic border-l-4 border-secondary/50 pl-4 md:pl-6 py-2 mx-auto lg:mx-0 max-w-lg lg:max-w-none font-medium">
                                            "{currentItem.description}"
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-10 md:mt-14 px-4 md:px-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { prev(); setAutoPlay(false) }}
                                className="text-slate-600 hover:text-secondary hover:border-secondary/50 hover:bg-secondary/10 h-12 w-12 md:h-14 md:w-14 rounded-xl border-slate-200 transition-all p-0 shadow-sm"
                            >
                                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>

                            <div className="flex gap-2.5 md:gap-3 flex-wrap justify-center px-4">
                                {achievements.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setCurrent(idx); setAutoPlay(false) }}
                                        className={`h-2.5 md:h-3 transition-all rounded-full ${current === idx ? "w-10 md:w-12 bg-secondary" : "w-2.5 md:w-3 bg-slate-200 hover:bg-slate-300"
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { next(); setAutoPlay(false) }}
                                className="text-slate-600 hover:text-slate-900 hover:border-secondary hover:bg-secondary/10 h-12 w-12 md:h-14 md:w-14 rounded-xl border-slate-200 transition-all p-0 shadow-sm"
                            >
                                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    )
}
