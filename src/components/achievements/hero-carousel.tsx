"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Achievement {
    id: string
    title: string
    category: string
    date: string
    description: string
    image?: string
    user: {
        name: string | null
        profileImage: string | null
    }
}

interface HeroCarouselProps {
    achievements: Achievement[]
}

export function HeroCarousel({ achievements }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % achievements.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [achievements.length])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % achievements.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + achievements.length) % achievements.length)
    }

    if (achievements.length === 0) return null

    const current = achievements[currentIndex]

    return (
        <div className="relative w-full h-[450px] md:h-[650px] overflow-hidden rounded-[3rem] shadow-2xl shadow-slate-200/50 mb-12 md:mb-16 group border border-slate-100">
            {/* Premium Entrance Animation (Framer Motion) */}
            <div className="absolute inset-0 z-50 pointer-events-none">
                <AnimatePresence>
                    <motion.div
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: 0 }}
                        transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1], delay: 0.5 }}
                        className="absolute inset-0 bg-slate-900 origin-top z-[60]"
                    />
                </AnimatePresence>

                {/* Floating Decor Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="absolute top-12 left-12 h-20 w-20 rounded-[2rem] border border-white/10 flex items-center justify-center backdrop-blur-md z-10"
                >
                    <Trophy className="h-8 w-8 text-secondary" />
                </motion.div>
            </div>

            {/* Background Image / Placeholder */}
            <div className="absolute inset-0 bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        {current.image ? (
                            <div className="relative h-full w-full">
                                <Image
                                    src={current.image}
                                    alt={current.title}
                                    fill
                                    className="object-cover transition-transform duration-[10000ms] group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                <Trophy className="h-[120%] w-auto text-white/5" />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden md:block" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20">
                <div className="max-w-4xl w-full">
                    <motion.div
                        key={`meta-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <span className="px-5 py-2 rounded-full bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-secondary/20">
                            {current.category}
                        </span>
                        <div className="h-px w-12 bg-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                            Featured Milestone
                        </span>
                    </motion.div>

                    <motion.h2
                        key={`title-${currentIndex}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]"
                    >
                        {current.title}
                    </motion.h2>

                    <motion.div
                        key={`author-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex items-center gap-5 mb-10"
                    >
                        <div className="h-16 w-16 rounded-[1.5rem] border border-white/10 p-1 backdrop-blur-md">
                            <div className="h-full w-full rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden relative">
                                {current.user.profileImage ? (
                                    <Image src={current.user.profileImage} alt={current.user.name || "User"} fill className="object-cover" />
                                ) : (
                                    <span className="text-white font-black text-xl">
                                        {current.user.name?.charAt(0) || "U"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white tracking-tight">{current.user.name || "Anonymous"}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                                {new Date(current.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        key={`cta-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Button
                            onClick={() => document.getElementById('full-list')?.scrollIntoView({ behavior: 'smooth' })}
                            className="h-16 px-10 rounded-2xl bg-white text-slate-900 hover:bg-secondary hover:text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 group/btn"
                        >
                            Explore Discovery
                            <ChevronRight className="h-4 w-4 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full px-6 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    onClick={prevSlide}
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-slate-900 pointer-events-auto transition-all shadow-2xl"
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                    onClick={nextSlide}
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-slate-900 pointer-events-auto transition-all shadow-2xl"
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-10 left-10 md:left-auto md:right-20 flex gap-3">
                {achievements.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-700 h-1.5 rounded-full ${idx === currentIndex ? "w-12 bg-secondary" : "w-4 bg-white/20 hover:bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
