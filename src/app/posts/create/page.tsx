"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy, Briefcase, Building2, Calendar, GraduationCap, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type Category = "achievement" | "job" | "business" | "event" | "scholarship" | "mentorship"

interface CategoryOption {
    id: Category
    label: string
    icon: any
    description: string
    color: string
    href: string // Added href for direct navigation/handling
}

const categories: CategoryOption[] = [
    { id: "achievement", label: "Achievement", icon: Trophy, description: "Share a personal or professional milestone", color: "text-gold", href: "/achievements/add" },
    { id: "job", label: "Job Listing", icon: Briefcase, description: "Post a new job opening or opportunity", color: "text-blue-500", href: "/career/jobs/add" },
    { id: "business", label: "Business", icon: Building2, description: "Add your business to our community directory", color: "text-green-500", href: "/business/add" },
    { id: "event", label: "Event", icon: Calendar, description: "Organize and promote a community gathering", color: "text-secondary", href: "/events/add" },
    { id: "scholarship", label: "Scholarship", icon: GraduationCap, description: "Offer educational support to students", color: "text-purple-500", href: "/career/scholarships/add" },
    { id: "mentorship", label: "Mentorship", icon: Users, description: "Register as a mentor or search for one", color: "text-maroon", href: "/career/mentorship/add" },
]

export default function CreatePostPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()

    const handleCategorySelect = (category: CategoryOption) => {
        if (!isAuthenticated) {
            toast.info("Login Required", { description: "Please login to create a post." })
            router.push("/login")
            return
        }

        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }

        router.push(category.href)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans selection:bg-secondary/20">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-24">
                <div className="max-w-5xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-12 hover:bg-slate-100 text-slate-400 hover:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] transition-all group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Button>

                    <div className="mb-20">
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                            Create a <span className="text-secondary italic">Contribution</span>.
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            Select a category below to share your story, opportunity, or business with the community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories
                            .filter(cat => {
                                if (['scholarship', 'event'].includes(cat.id)) {
                                    return user?.role === 'admin'
                                }
                                return true
                            })
                            .map((cat, index) => (
                                <div
                                    key={cat.id}
                                    className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Card
                                        className="group relative h-full cursor-pointer overflow-hidden border-slate-100 bg-white/50 backdrop-blur-sm transition-all duration-500 hover:border-secondary/20 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 rounded-[2.5rem]"
                                        onClick={() => handleCategorySelect(cat)}
                                    >
                                        <CardContent className="p-10 flex flex-col h-full">
                                            <div className="mb-8 h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 shadow-sm relative z-10 group-hover:scale-110">
                                                <cat.icon className={`h-8 w-8 transition-colors duration-500 ${cat.color} group-hover:text-white`} />
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-secondary transition-colors tracking-tight">
                                                    {cat.label}
                                                </h3>
                                                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                                    {cat.description}
                                                </p>
                                            </div>

                                            <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-900 transition-colors">
                                                Get Started <ArrowLeft className="h-3 w-3 ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
                                            </div>

                                            {/* Decorative background element on hover */}
                                            <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-secondary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
