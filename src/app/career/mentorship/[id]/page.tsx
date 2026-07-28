"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserCheck, MapPin, Mail, Globe, ArrowLeft, Loader2, MessageSquare, Award, BookOpen, CheckCircle, Edit, Trash2, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface MentorshipDetail {
    id: string
    expertise: string
    bio: string
    available: boolean
    status: string
    mentorId: string
    mentor: {
        name: string | null
        email: string | null
        location: string | null
        bio: string | null
        profileImage: string | null
    }
}

export default function MentorDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const id = params.id as string

    const [mentorship, setMentorship] = useState<MentorshipDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                const res = await fetch(`/api/career/mentorship/${id}`)
                if (!res.ok) {
                    throw new Error("Mentor profile not found")
                }
                const data = await res.json()
                setMentorship(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchMentor()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your mentorship profile?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/mentorship/${id}`, { method: 'DELETE', headers })
            if (res.ok) {
                router.push('/career?tab=mentorship')
                router.refresh()
            } else {
                alert("Failed to delete mentorship profile")
            }
        } catch (e) {
            console.error(e)
            alert("An error occurred")
        } finally {
            setIsDeleting(false)
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

    if (error || !mentorship) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <UserCheck className="h-10 w-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Mentor Not Found</h2>
                    <p className="text-slate-500 mt-2 mb-8 max-w-md font-medium">The mentorship profile you are looking for might have been deactivated or removed.</p>
                    <Button onClick={() => router.push("/career?tab=mentorship")} variant="outline" className="border-slate-200 text-slate-900 rounded-xl h-12 px-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Mentorship
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isOwner = user?.id === mentorship.mentorId || user?.email === mentorship.mentor?.email

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl -mb-32 -ml-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 pb-24">
                    {/* Hero Header Section */}
                    <div className="pt-16 pb-40 relative">
                        <div className="container mx-auto px-4 relative max-w-7xl">
                            <Link
                                href="/career?tab=mentorship"
                                className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Circle
                            </Link>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                                <div className="max-w-4xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Badge className="bg-secondary/10 text-secondary border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm shadow-secondary/5">
                                            Chartered Steward
                                        </Badge>
                                        {mentorship.available ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm animate-pulse">
                                                Active Guidance
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-400 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                                Capacity Reached
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-6xl md:text-8xl font-sans font-black text-slate-900 mb-8 leading-none tracking-tighter">
                                        {mentorship.mentor.name || "Steward"}
                                    </h1>
                                    <p className="text-2xl md:text-4xl text-slate-500 font-sans font-black flex items-center gap-4">
                                        <Award className="h-10 w-10 text-secondary" />
                                        {mentorship.expertise}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <ShareButton
                                        url={`/career/mentorship/${mentorship.id}`}
                                        title={mentorship.mentor.name || "Mentor"}
                                        variant="button"
                                        className="bg-white hover:bg-slate-50 text-slate-900 border-slate-200 shadow-xl shadow-slate-200/30 rounded-2xl h-16 px-10 font-black transition-all"
                                        description={`👨‍🏫 *Mentor: ${mentorship.mentor.name || "Community Member"}*\nExpertise: ${mentorship.expertise}\n\n${mentorship.bio}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 -mt-24 relative z-10 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Profile Info & Bio */}
                            <div className="lg:col-span-2 space-y-12">
                                <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] bg-white rounded-[3rem] overflow-hidden border border-slate-50">
                                    <CardContent className="p-10 md:p-16">
                                        <div className="flex flex-col md:flex-row gap-16 items-start mb-16">
                                            <div className="h-56 w-56 rounded-[3rem] bg-slate-50 border border-white flex-shrink-0 flex items-center justify-center text-7xl font-sans font-black text-slate-900 shadow-2xl shadow-slate-200 overflow-hidden relative group">
                                                {mentorship.mentor.profileImage ? (
                                                    <Image
                                                        src={mentorship.mentor.profileImage}
                                                        alt={mentorship.mentor.name || "Mentor"}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                        suppressHydrationWarning
                                                    />
                                                ) : (
                                                    <div className="bg-gradient-to-br from-slate-50 to-white h-full w-full flex items-center justify-center">
                                                        {mentorship.mentor.name?.charAt(0).toUpperCase() || "M"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-8">
                                                <div className="flex flex-wrap gap-5">
                                                    {mentorship.mentor.location && (
                                                        <span className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-white text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm"><MapPin className="h-4 w-4 text-secondary" /> {mentorship.mentor.location}</span>
                                                    )}
                                                    <span className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-white text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm"><Mail className="h-4 w-4 text-secondary" /> {mentorship.mentor.email}</span>
                                                </div>

                                                <div className="h-1.5 w-24 bg-secondary rounded-full" />

                                                <p className="text-2xl text-slate-600 leading-relaxed font-black italic tracking-tight">
                                                    "Guiding the next generation of community leaders through consistent mentorship and professional insight."
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-12 border-t border-slate-50">
                                            <h2 className="text-2xl font-sans font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-5">
                                                <BookOpen className="h-7 w-7 text-secondary" />
                                                Vision & Methodology
                                            </h2>
                                            <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium italic">
                                                {mentorship.bio}
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <div className="mt-16 pt-12 border-t border-slate-50 flex flex-wrap gap-6">
                                                <Button
                                                    onClick={() => router.push(`/career/mentorship/${mentorship.id}/edit`)}
                                                    className="bg-slate-900 text-white hover:bg-black rounded-2xl h-14 px-10 font-black shadow-xl shadow-slate-900/10 transition-all"
                                                >
                                                    <Edit className="h-5 w-5 mr-3" /> Update Protocol
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-rose-100 text-rose-500 hover:bg-rose-50 rounded-2xl h-14 px-10 font-black transition-all"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Trash2 className="h-5 w-5 mr-3" />}
                                                    Deactivate Access
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Connection Card */}
                            <div className="space-y-10">
                                <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3rem] sticky top-24 overflow-hidden border border-slate-50">
                                    <div className="bg-slate-50/50 border-b border-slate-100 p-12 text-center">
                                        <Badge className="bg-slate-900 text-white border-none px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[9px] shadow-xl shadow-slate-900/20 mb-6">
                                            Connection Center
                                        </Badge>
                                        <h3 className="text-2xl font-sans font-black text-slate-900 tracking-tight">Request Stewardship</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Elite Member Guidance Program</p>
                                    </div>
                                    <CardContent className="p-12">
                                        {!isAuthenticated ? (
                                            <div className="text-center py-6">
                                                <p className="text-slate-500 mb-10 font-bold italic text-sm">Join the community circle to initiate a formal connection request.</p>
                                                <Link href="/login" className="block">
                                                    <Button className="w-full bg-slate-900 text-white hover:bg-black font-black h-16 rounded-2xl shadow-xl shadow-slate-900/10 transition-all">Identity Protocol</Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-10">
                                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-white text-slate-600 italic font-medium leading-relaxed text-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                                        <MessageSquare className="h-16 w-16" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        "I'm dedicated to supporting community growth. Looking forward to discussing career switches, technical roadmaps, or industry insights."
                                                    </div>
                                                </div>

                                                <Button
                                                    className="w-full bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 shadow-xl shadow-slate-900/10 font-black h-20 rounded-[2.5rem] group transition-all text-lg"
                                                    onClick={() => {
                                                        if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                            toast.error("Action Restricted", {
                                                                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                            })
                                                            return
                                                        }
                                                        const to = mentorship.mentor.email || '';
                                                        const subject = encodeURIComponent(`Mentorship Request - Community Portal`);
                                                        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                    }}
                                                >
                                                    <MessageSquare className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                                                    Initiate Connection
                                                </Button>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-3xl border border-emerald-100/50 shadow-sm">
                                                        <Shield className="h-6 w-6 text-emerald-500 mb-2" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Vetted</span>
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-3xl border border-secondary/20 shadow-sm">
                                                        <Award className="h-6 w-6 text-secondary mb-2" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-700">Expert</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-transparent shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] border border-slate-50">
                                    <CardContent className="p-8">
                                        <Link href="/career/mentorship/register">
                                            <Button variant="ghost" className="w-full hover:bg-slate-50 text-slate-900 font-black rounded-2xl border border-dashed border-slate-200 h-16 transition-all group">
                                                Become a Steward
                                                <ArrowLeft className="ml-3 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    )
}
