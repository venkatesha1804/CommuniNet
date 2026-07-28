"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, PlusCircle, User, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

// Types matching the schema
export type Collaboration = {
    id: string
    title: string
    description: string
    partnershipType: string
    skillsRequired: string[]
    createdAt: string
    author: {
        name: string | null
        profileImage: string | null
        location: string | null
    }
}

export default function BusinessCollaborationBoard() {
    const { isAuthenticated, user, getToken } = useAuth()
    const [collaborations, setCollaborations] = useState<Collaboration[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchCollaborations()
    }, [])

    const fetchCollaborations = async (search?: string) => {
        setIsLoading(true)
        try {
            const url = new URL("/api/business/collaboration", window.location.origin)
            if (search) url.searchParams.append("search", search)

            const token = await getToken()
            const response = await fetch(url.toString(), {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!response.ok) throw new Error("Failed to fetch collaborations")

            const data = await response.json()
            setCollaborations(data.collaborations)
        } catch (error) {
            console.error("Error loading collaborations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchCollaborations(searchQuery)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />

            <main className="flex-1 relative">
                {/* Background decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />

                <div className="container mx-auto py-16 md:py-24 px-6 max-w-7xl min-h-screen relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] flex items-center gap-3">
                                <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.25rem] bg-slate-900 flex items-center justify-center shrink-0 shadow-2xl shadow-slate-900/10 border border-slate-800">
                                    <Building2 className="h-7 w-7 md:h-8 md:w-8 text-secondary" />
                                </div>
                                <span className="font-sans font-black tracking-tight">Business Collaborations</span>
                            </h1>
                            <p className="text-lg text-slate-600 mt-4 leading-relaxed font-medium">
                                Discover partners, co-founders, and strategic allies within the community. Post an opportunity to grow through partnerships.
                            </p>
                        </div>
                        {isAuthenticated && (
                            <Link href="/business/collaboration/add" className="shrink-0 mt-4 md:mt-0">
                                <Button className="bg-slate-900 hover:bg-black text-white font-black py-6 px-10 rounded-2xl shadow-2xl shadow-slate-900/10 transition-all border-0 h-auto text-lg flex items-center gap-4 group">
                                    <PlusCircle className="h-6 w-6 text-secondary group-hover:rotate-90 transition-transform duration-500" />
                                    Post Opportunity
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] mb-12 border border-slate-100 relative z-10">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                                <Input
                                    placeholder="Search by title, description, or partnership type..."
                                    className="pl-14 bg-slate-50 border-slate-100 h-16 rounded-2xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-slate-900 text-lg shadow-inner font-bold"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-16 px-10 text-lg transition-colors shrink-0 shadow-md">
                                Search Opportunities
                            </Button>
                        </form>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[380px] rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] p-8 flex flex-col">
                                    <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse mb-6" />
                                    <div className="h-7 w-3/4 bg-slate-100 rounded-lg animate-pulse mb-4" />
                                    <div className="h-16 w-full bg-slate-100 rounded-lg animate-pulse mb-8" />
                                    <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-slate-100 rounded-full animate-pulse" />
                                            <div className="h-5 w-24 bg-slate-100 rounded-md animate-pulse" />
                                        </div>
                                        <div className="h-8 w-16 bg-slate-100 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : collaborations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {collaborations.map((collab) => (
                                <div key={collab.id} className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] border border-slate-100 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group">
                                    <div className="mb-5">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary bg-secondary/10 px-4 py-2 rounded-full inline-block">
                                            {collab.partnershipType}
                                        </span>
                                    </div>
                                    <h3 className="line-clamp-2 leading-[1.3] text-2xl font-black text-slate-900 mb-4 group-hover:text-secondary transition-colors font-sans">
                                        {collab.title}
                                    </h3>
                                    <p className="line-clamp-3 text-slate-600 mb-8 flex-1 text-[15px] leading-relaxed">
                                        {collab.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {collab.skillsRequired.slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                {skill}
                                            </span>
                                        ))}
                                        {collab.skillsRequired.length > 3 && (
                                            <span className="bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                +{collab.skillsRequired.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 mt-auto flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-200">
                                                {collab.author.profileImage ? (
                                                    <img src={collab.author.profileImage} alt={collab.author.name || "User"} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[15px] font-bold text-slate-900 truncate">{collab.author.name || "Anonymous Member"}</span>
                                                {collab.author.location && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                        <MapPin className="h-3 w-3 text-secondary" /> {collab.author.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={`/business/collaboration/${collab.id}`}>
                                            <Button variant="ghost" className="text-slate-900 font-bold hover:text-secondary hover:bg-slate-50 transition-colors flex items-center gap-1 text-sm h-10 px-6 rounded-xl">
                                                View Listing
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center shadow-sm">
                            <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                <Building2 className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Collaborations Found</h3>
                            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                                There are currently no partnership opportunities available matching your criteria.
                            </p>
                            {isAuthenticated && (
                                <Link href="/business/collaboration/add" className="mt-8">
                                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-14 px-8 text-base shadow-md">Be the first to post</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
