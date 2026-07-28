"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartPulse, Droplet, MapPin, Phone, AlertCircle, ChevronLeft, ChevronRight, Clock, CheckCircle2, Loader2, Quote } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { motion, AnimatePresence } from "framer-motion"

interface EmergencyRequest {
    id: string
    userId: string
    type: string
    title: string
    description: string
    contact: string
    createdAt: string
    user: {
        name: string
        location: string | null
    }
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function RequestCard({ req, variant = "full", currentUserId, onMarkReceived }: { req: EmergencyRequest; variant?: "full" | "simple"; currentUserId?: string; onMarkReceived?: (id: string) => void }) {
    const [marking, setMarking] = useState(false)
    const isOwner = currentUserId === req.userId

    if (variant === "simple") {
        return (
            <Card className="overflow-hidden border border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] rounded-[2.5rem] h-full bg-white group hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:border-secondary/30 transition-all duration-300">
                <CardContent className="p-5 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 rounded-[1.25rem] bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20 shadow-sm animate-pulse-slow">
                                <AlertCircle className="h-8 w-8 text-red-500 animate-float" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1 tracking-tight">
                                        {req.title}
                                    </h3>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-[0.2em]">Active Bulletin</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-3 font-semibold">
                                    <Clock className="h-4 w-4" />
                                    Posted {timeAgo(req.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <Quote className="h-32 w-32 text-slate-900" />
                            </div>
                            <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-sans italic relative z-10 font-medium">
                                &quot;{req.description}&quot;
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{req.user.location}</span>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[10px] font-black uppercase">
                                {req.user.name[0]}
                            </div>
                            <span className="text-slate-600 font-bold text-xs">{req.user.name}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border border-slate-100 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.08)] rounded-[2rem] bg-white max-w-2xl mx-auto">
            <CardContent className="p-0">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 animate-pulse shrink-0" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] truncate">Emergency Bulletin</span>
                    </div>
                    <span className="text-[9px] font-bold opacity-90 shrink-0 ml-2 tracking-wider">{timeAgo(req.createdAt)}</span>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-5">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl md:text-2xl font-sans font-black text-slate-900 mb-3 leading-tight tracking-tight">{req.title}</h3>
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shadow-sm transition-colors group">
                                        <MapPin className="h-4 w-4 text-secondary" />
                                        <span className="font-sans font-bold text-xs text-slate-900">{req.user.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shadow-sm transition-colors group">
                                        <Phone className="h-4 w-4 text-red-500" />
                                        <span className="font-sans font-bold text-xs text-slate-900">{req.contact}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 font-medium text-sm md:text-base border-l-2 border-red-200 pl-4 py-1 leading-relaxed line-clamp-2 italic">
                                "{req.description}"
                            </p>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 text-[10px] font-black uppercase border border-red-100">
                                        {req.user.name[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 font-bold text-[11px] leading-none">{req.user.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Community Member</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <a href={`tel:${req.contact}`}>
                                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 px-4 rounded-lg shadow-md shadow-red-500/20 text-[11px] uppercase tracking-wider">
                                            Contact
                                        </Button>
                                    </a>
                                    {isOwner && onMarkReceived && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={marking}
                                            onClick={async () => {
                                                setMarking(true)
                                                try {
                                                    const res = await fetch(`/api/help/${req.id}`, { method: 'PATCH' })
                                                    if (res.ok) {
                                                        onMarkReceived(req.id)
                                                    }
                                                } catch (e) {
                                                    console.error(e)
                                                } finally {
                                                    setMarking(false)
                                                }
                                            }}
                                            className="border-green-600 text-green-700 hover:bg-green-50 h-9 text-[11px]"
                                        >
                                            {marking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resolved"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function EmergencyAlerts() {
    const { user } = useAuth()
    const [requests, setRequests] = useState<EmergencyRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchEmergency = async () => {
            try {
                const res = await fetch("/api/help/emergency")
                if (res.ok) {
                    const data = await res.json()
                    setRequests(data)
                }
            } catch (error) {
                console.error("Failed to fetch emergency alerts", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEmergency()
    }, [])

    const next = useCallback(() => setCurrent((prev) => (prev + 1) % requests.length), [requests.length])
    const prev = () => setCurrent((prev) => (prev - 1 + requests.length) % requests.length)

    useEffect(() => {
        if (requests.length <= 1 || isPaused) return
        const timer = setInterval(next, 2000) // Much faster sliding as requested
        return () => clearInterval(timer)
    }, [requests.length, isPaused, next])

    const handleMarkReceived = useCallback((id: string) => {
        setRequests(prev => {
            const updated = prev.filter(r => r.id !== id)
            if (current >= updated.length && updated.length > 0) {
                setCurrent(updated.length - 1)
            }
            return updated
        })
    }, [current])

    if (loading || requests.length === 0) return null

    const prevIdx = (current - 1 + requests.length) % requests.length
    const nextIdx = (current + 1) % requests.length

    const hasMultiple = requests.length > 1

    return (
        <section
            className="bg-[#FAF9F6] py-12 md:py-16 scroll-mt-20 border-y border-slate-100 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <ScrollAnimation animation="fade-right">
                    <div className="flex flex-col items-center text-center gap-4 mb-10">
                        <div className="inline-flex items-center gap-2.5 text-red-600 font-bold text-[10px] uppercase tracking-[0.2em] bg-red-50 border border-red-100 px-4 py-1.5 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            Emergency Bulletins
                        </div>
                        <h2 className="font-sans text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Active Help Requests</h2>
                    </div>
                </ScrollAnimation>

                <div className="relative flex items-center justify-center group/carousel">
                    {/* Navigation Buttons */}
                    {hasMultiple && (
                        <>
                            <Button
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); prev(); }}
                                className="absolute left-4 z-20 rounded-full w-12 h-12 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-red-600 hover:border-red-200 shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center p-0"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); next(); }}
                                className="absolute right-4 z-20 rounded-full w-12 h-12 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-red-600 hover:border-red-200 shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center p-0"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </>
                    )}

                    <div className="flex items-center justify-center gap-4 md:gap-12 w-full max-w-6xl">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {/* Previous Card Preview */}
                            {hasMultiple && (
                                <motion.div
                                    key={`prev-${requests[prevIdx].id}`}
                                    initial={{ opacity: 0, x: -100, scale: 0.8 }}
                                    animate={{ opacity: 0.3, x: 0, scale: 0.85 }}
                                    exit={{ opacity: 0, x: -200, scale: 0.7 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="hidden lg:block w-1/4 shrink-0 filter blur-[1px] pointer-events-none"
                                >
                                    <RequestCard req={requests[prevIdx]} variant="full" />
                                </motion.div>
                            )}

                            {/* Current Focused Card */}
                            <motion.div
                                key={`curr-${requests[current].id}`}
                                initial={{ opacity: 0, scale: 0.9, x: 0 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                className="w-full md:max-w-2xl shrink-0 z-10"
                            >
                                <RequestCard req={requests[current]} variant="full" currentUserId={user?.id} onMarkReceived={handleMarkReceived} />
                            </motion.div>

                            {/* Next Card Preview */}
                            {hasMultiple && (
                                <motion.div
                                    key={`next-${requests[nextIdx].id}`}
                                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                    animate={{ opacity: 0.3, x: 0, scale: 0.85 }}
                                    exit={{ opacity: 0, x: 200, scale: 0.7 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="hidden lg:block w-1/4 shrink-0 filter blur-[1px] pointer-events-none"
                                >
                                    <RequestCard req={requests[nextIdx]} variant="full" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {hasMultiple && (
                    <div className="mt-10 flex justify-center gap-2.5">
                        {requests.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    current === idx ? "w-10 bg-red-600 shadow-sm" : "w-1.5 bg-slate-200 hover:bg-slate-300"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
