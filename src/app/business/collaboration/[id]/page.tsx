"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, ArrowLeft, User, MapPin, Mail, Phone, Loader2, Calendar } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function CollaborationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const [collab, setCollab] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (params.id) fetchCollaboration()
    }, [params.id])

    const fetchCollaboration = async () => {
        try {
            const token = await getToken()
            // Next 15 specific, unwrapping params logic shouldn't be required on client side if used directly but we await safely
            const resolvedParams = await params
            const response = await fetch(`/api/business/collaboration/${resolvedParams.id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("You do not have permission to view this opportunity.")
                }
                throw new Error("Collaboration opportunity not found.")
            }

            const data = await response.json()
            setCollab(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    if (error || !collab) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 inline-block mb-6">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error || "Opportunity not found"}</p>
                </div>
                <div>
                    <Button onClick={() => router.push('/business/collaboration')}>Back to Board</Button>
                </div>
            </div>
        )
    }

    const { author } = collab
    const canViewContact = isAuthenticated && user && (user.status === 'approved' || user.role === 'admin' || user.id === collab.authorId)

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />
            <main className="flex-1 relative">
                {/* Background decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none" />

                <div className="container mx-auto py-12 md:py-16 px-6 max-w-5xl min-h-screen relative z-10">
                    <Link href="/business/collaboration" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600 mb-8 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Collaborations
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] border border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#E53E3E] bg-red-50 px-4 py-1.5 rounded-full inline-block">
                                        {collab.partnershipType}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(collab.createdAt)}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
                                    {collab.title}
                                </h1>

                                <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Opportunity Description</h3>
                                    <p className="whitespace-pre-wrap">{collab.description}</p>
                                </div>
                            </div>

                            {collab.skillsRequired && collab.skillsRequired.length > 0 && (
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Required Skills & Resources</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {collab.skillsRequired.map((skill: string, idx: number) => (
                                            <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] border border-slate-100 sticky top-24 p-8">
                                <h3 className="font-bold text-xl mb-6 text-slate-900 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[#FDF2F0] flex items-center justify-center shrink-0 border border-orange-100">
                                        <Building2 className="h-5 w-5 text-orange-500" />
                                    </div>
                                    Opportunity Owner
                                </h3>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border-2 border-slate-100">
                                        {author.profileImage ? (
                                            <img src={author.profileImage} alt={author.name || "User"} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900">{author.name || "Anonymous Member"}</h4>
                                        {author.location && (
                                            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                                <MapPin className="h-4 w-4 text-orange-400" /> {author.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    {canViewContact ? (
                                        <>
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Contact Details</h4>
                                            {author.email && (
                                                <a href={`mailto:${author.email}`} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 transition-colors group border border-slate-100">
                                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center mr-4 group-hover:text-orange-600 border border-slate-200 text-slate-400 shadow-sm">
                                                        <Mail className="h-5 w-5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">Email</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate">{author.email}</p>
                                                    </div>
                                                </a>
                                            )}
                                            {author.mobile && (
                                                <a href={`tel:${author.mobile}`} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 transition-colors group border border-slate-100">
                                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center mr-4 group-hover:text-orange-600 border border-slate-200 text-slate-400 shadow-sm">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">Phone</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate">{author.mobile}</p>
                                                    </div>
                                                </a>
                                            )}
                                            {!author.email && !author.mobile && (
                                                <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">No contact information provided.</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-sm font-medium text-slate-600 mb-4 leading-relaxed">
                                                Contact details are hidden. You must be a logged-in member to view contact information.
                                            </p>
                                            {!isAuthenticated && (
                                                <Link href="/login">
                                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-12">Login to View</Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
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
