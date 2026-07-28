"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, HandHelping, Calendar, ArrowLeft, Loader2, Mail, Phone, MapPin, CheckCircle2, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface HelpRequestDetail {
    id: string
    title: string
    description: string
    type: string
    urgency: string
    status: string
    contact: string
    userId: string
    createdAt: string
    user: {
        name: string | null
        profileImage: string | null
        email: string | null
    }
}

export default function HelpRequestDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, getToken } = useAuth()
    const id = params.id as string

    const [request, setRequest] = useState<HelpRequestDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/help/${id}`)
                if (!res.ok) throw new Error("Request not found")
                const data = await res.json()
                setRequest(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchRequest()
    }, [id])

    const handleMarkReceived = async () => {
        setIsUpdating(true)
        try {
            const token = await getToken()
            const res = await fetch(`/api/help/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ status: 'received' })
            })
            if (res.ok) {
                setRequest(prev => prev ? { ...prev, status: 'received' } : null)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !request) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="h-16 w-16 text-slate-200 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900">Request Not Found</h2>
                    <p className="text-slate-500 mt-2 mb-8">This post might have been removed or fulfilled.</p>
                    <Button onClick={() => router.push("/help")} variant="outline" className="rounded-xl px-8 h-12 border-slate-200">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Support Hub
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isOwner = user?.id === request.userId
    const isReceived = request.status === 'received'

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />

            <main className="flex-1 py-12 md:py-20 lg:py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link
                        href="/help"
                        className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-8 md:mb-12 transition-all font-bold text-xs uppercase tracking-[0.2em] group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Support Hub
                    </Link>

                    <div className="space-y-8 md:space-y-12">
                        {/* Header Section */}
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn(
                                    "text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border shadow-sm",
                                    request.type.toLowerCase().includes('emergency')
                                        ? "bg-red-50 text-red-600 border-red-100"
                                        : "bg-secondary/10 text-secondary border-secondary/20"
                                )}>
                                    {request.type}
                                </span>
                                {isReceived && (
                                    <span className="bg-green-50 text-green-600 border border-green-100 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                                        Fulfilled ✓
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                {request.title}
                            </h1>

                            <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-2">
                                    <HandHelping className="h-4 w-4" />
                                    Community Support
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
                            <CardContent className="p-8 md:p-12 space-y-8 md:space-y-12">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Request Details</h3>
                                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                                        {request.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-8 md:pt-12 border-t border-slate-50">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h3>
                                        <div className="space-y-4">
                                            <a href={`tel:${request.contact}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary/30 transition-all group">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-secondary border border-slate-100 group-hover:bg-secondary group-hover:text-white transition-all">
                                                    <Phone className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-slate-900">{request.contact}</span>
                                            </a>
                                            <a href={`mailto:${request.user.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary/30 transition-all group">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-secondary border border-slate-100 group-hover:bg-secondary group-hover:text-white transition-all">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-slate-900 truncate">{request.user.email}</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Posted By</h3>
                                        <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-secondary text-xl font-black shadow-sm overflow-hidden">
                                                {request.user.profileImage ? (
                                                    <img src={request.user.profileImage} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    request.user.name?.[0] || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg">{request.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community Member</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8">
                            {!isReceived ? (
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <a href={`tel:${request.contact}`}>
                                        <Button className="rounded-2xl h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-xl shadow-slate-900/10 tracking-tight">
                                            Provide Assistance
                                        </Button>
                                    </a>
                                    {isOwner && (
                                        <Button
                                            variant="outline"
                                            onClick={handleMarkReceived}
                                            disabled={isUpdating}
                                            className="rounded-2xl h-14 px-8 border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                        >
                                            {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                            I've Received Help
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full text-center p-8 rounded-[2rem] bg-green-50 border border-green-100">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-black text-green-900">Request Fulfilled</h3>
                                    <p className="text-green-700 font-medium mt-2">The community has successfully provided support for this request. Thank you!</p>
                                </div>
                            )}

                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                Always verify before helping
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
