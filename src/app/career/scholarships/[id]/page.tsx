"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, Calendar, ArrowLeft, Loader2, ExternalLink, Edit, Trash2, Info, CheckCircle, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface ScholarshipDetail {
    id: string
    title: string
    amount: string
    eligibility: string
    description: string
    deadline: string
    link: string | null
    status: string
    posterId: string
    poster: {
        name: string | null
        email: string | null
    }
}

export default function ScholarshipDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const id = params.id as string

    const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchScholarship = async () => {
            try {
                const res = await fetch(`/api/career/scholarships/${id}`)
                if (!res.ok) {
                    throw new Error("Scholarship not found")
                }
                const data = await res.json()
                setScholarship(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchScholarship()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this scholarship?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/scholarships/${id}`, { method: 'DELETE', headers })
            if (res.ok) {
                router.push('/career?tab=scholarships')
                router.refresh()
            } else {
                alert("Failed to delete scholarship")
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
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !scholarship) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-gold/5 rounded-full flex items-center justify-center mb-6 border border-gold/10">
                        <GraduationCap className="h-10 w-10 text-gold/30" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 font-sans">Scholarship Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-8 max-w-md">The scholarship opportunity you are looking for might have expired or been removed.</p>
                    <Button onClick={() => router.push("/career?tab=scholarships")} variant="outline" className="border-secondary text-secondary hover:bg-secondary/5">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Scholarships
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.id === scholarship.posterId || user?.email === scholarship.poster?.email
    const isDeletedByAdmin = scholarship.status === 'deleted_by_admin'

    if (isDeletedByAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 p-6 rounded-full mb-6 border border-red-100 shadow-sm">
                        <Shield className="h-16 w-16 text-red-600/40" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-red-900/80 mb-4">Post Unavailable</h1>
                    <p className="text-xl text-red-700/60 max-w-2xl mb-8 leading-relaxed">
                        This scholarship opportunity has been deleted by an administrator for violating community guidelines.
                    </p>
                    <Link href="/career?tab=scholarships">
                        <Button className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 px-8 h-12 text-lg">
                            Back to Hub
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl -mb-32 -ml-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 pb-24">
                    {/* Hero Header Section */}
                    <div className="pt-16 pb-32 relative">
                        <div className="container mx-auto px-4 relative max-w-7xl">
                            <Link
                                href="/career?tab=scholarships"
                                className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Scholarships
                            </Link>

                            <div className="max-w-4xl">
                                {isDeletedByAdmin && isAdmin && (
                                    <div className="mb-12 bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm">
                                        <div className="h-14 w-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-sans font-black text-rose-900 text-lg leading-none mb-1">Administrative Archives</p>
                                            <p className="text-sm font-medium text-rose-600/80">This listing is currently hidden from public visibility due to compliance review.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-8">
                                            <Badge className="bg-secondary/10 text-secondary border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm shadow-secondary/5">
                                                Educational Grant
                                            </Badge>
                                            <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm">
                                                {scholarship.amount}
                                            </Badge>
                                        </div>
                                        <h1 className="text-5xl md:text-7xl font-sans font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                                            {scholarship.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-50"><Calendar className="h-6 w-6 text-secondary" /></div>
                                                <span className="text-lg font-bold text-slate-500">Deadline: {formatDate(scholarship.deadline)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <ShareButton
                                            url={`/career/scholarships/${scholarship.id}`}
                                            title={scholarship.title}
                                            variant="button"
                                            className="border-slate-200 text-slate-900 h-16 rounded-2xl w-full"
                                            description={`🎓 *Scholarship: ${scholarship.title}*\nAmount: ${scholarship.amount}\nEligibility: ${scholarship.eligibility}\nDeadline: ${formatDate(scholarship.deadline)}\n\n${scholarship.description}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 -mt-16 relative z-10 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-12">
                                <Card className="border-transparent shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] overflow-hidden border border-slate-50">
                                    <CardContent className="p-10 md:p-16">
                                        <div className="flex items-center gap-6 mb-12">
                                            <h2 className="text-2xl font-sans font-black text-slate-900 uppercase tracking-widest">Candidate Profile</h2>
                                            <div className="h-1 flex-1 bg-slate-50 rounded-full" />
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100/50 rounded-[2.5rem] p-10 text-slate-700 leading-relaxed font-black italic text-2xl shadow-sm mb-16 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                <Info className="h-20 w-20" />
                                            </div>
                                            <div className="relative z-10">
                                                {scholarship.eligibility}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-12 mt-16">
                                            <h2 className="text-2xl font-sans font-black text-slate-900 uppercase tracking-widest">Program Details</h2>
                                            <div className="h-1 flex-1 bg-slate-50 rounded-full" />
                                        </div>

                                        <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-lg font-medium italic mb-16">
                                            {scholarship.description}
                                        </div>

                                        {isOwner && (
                                            <div className="pt-12 border-t border-slate-50 flex flex-wrap gap-4">
                                                <Button
                                                    onClick={() => router.push(`/career/scholarships/${scholarship.id}/edit`)}
                                                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 px-10 font-black shadow-xl shadow-slate-900/10 transition-all"
                                                >
                                                    <Edit className="h-5 w-5 mr-3" /> Update Program
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-rose-100 text-rose-500 hover:bg-rose-50 rounded-2xl h-14 px-10 font-black transition-all"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Trash2 className="h-5 w-5 mr-3" />}
                                                    Archive Grant
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-10">
                                <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] bg-white rounded-[2.5rem] sticky top-24 border border-slate-50">
                                    <CardContent className="p-10">
                                        <div className="text-center mb-12">
                                            <Badge className="bg-slate-900 text-white border-none px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-slate-900/20 mb-4">
                                                Grant Access
                                            </Badge>
                                        </div>

                                        <div className="space-y-10">
                                            <div className="text-center p-10 bg-slate-50 rounded-[2.5rem] border border-white">
                                                <p className="text-slate-500 mb-10 leading-relaxed italic font-bold text-sm px-4">
                                                    "Empowering the youth through education is the greatest service to the community."
                                                </p>

                                                {scholarship.link ? (
                                                    <div className="space-y-6">
                                                        <Button
                                                            className="w-full bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 font-black h-16 rounded-2xl transition-all shadow-xl shadow-slate-900/10"
                                                            onClick={() => {
                                                                if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                                    toast.error("Action Restricted", {
                                                                        description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                                    })
                                                                    return
                                                                }
                                                                window.open(scholarship.link!, '_blank')
                                                            }}
                                                        >
                                                            Access Application <ExternalLink className="h-4 w-4 ml-3" />
                                                        </Button>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                                                            External Gateway Secured
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <Button
                                                            className="w-full bg-slate-900 text-white hover:bg-black font-black h-16 rounded-2xl shadow-xl shadow-slate-900/10 transition-all"
                                                            onClick={() => {
                                                                if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                                    toast.error("Action Restricted", {
                                                                        description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                                    })
                                                                    return
                                                                }
                                                                const to = scholarship.poster?.email || '';
                                                                const subject = encodeURIComponent(`Inquiry about ${scholarship.title}`);
                                                                window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                            }}
                                                        >
                                                            Contact Administrator
                                                        </Button>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                                                            Direct Internal Inquiry
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator className="bg-slate-50 mt-10" />

                                            <div className="pt-6">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">Benefit Steward</p>
                                                <Link href={`/members/${scholarship.posterId}`}>
                                                    <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-500 group border border-white">
                                                        <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-slate-900 font-sans font-black text-2xl shrink-0 group-hover:bg-white/10 group-hover:text-white transition-all duration-500 shadow-xl shadow-slate-200/50">
                                                            {scholarship.poster?.name?.charAt(0) || "S"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-lg font-black truncate leading-tight group-hover:text-white mb-1">{scholarship.poster?.name || "Member"}</p>
                                                            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] group-hover:text-white/80">Grant Coordinator</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-transparent shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] border border-slate-50">
                                    <CardContent className="p-10 text-center">
                                        <div className="flex items-center justify-center gap-4 mb-3">
                                            <Shield className="h-6 w-6 text-emerald-500" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Authentic Program</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed">Community moderated and verified educational opportunity.</p>
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
