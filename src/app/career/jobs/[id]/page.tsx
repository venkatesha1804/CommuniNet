"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, Clock, DollarSign, Calendar, ArrowLeft, Loader2, Mail, Phone, Globe, Edit, Trash2, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface JobDetail {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string | null
    description: string
    contactEmail: string | null
    contactPhone: string | null
    deadline: string | null
    status: string
    posterId: string
    poster: {
        name: string | null
        email: string | null
    }
}

export default function JobDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const id = params.id as string

    const [job, setJob] = useState<JobDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/career/jobs/${id}`)
                if (!res.ok) {
                    throw new Error("Job not found")
                }
                const data = await res.json()
                setJob(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchJob()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job posting?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/jobs/${id}`, { method: 'DELETE', headers })
            if (res.ok) {
                router.push('/career?tab=jobs')
                router.refresh()
            } else {
                alert("Failed to delete job")
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

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Briefcase className="h-10 w-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Job Not Found</h2>
                    <p className="text-slate-500 mt-2 mb-8 max-w-md font-medium">The job listing you are looking for might have been expired, removed, or the link is incorrect.</p>
                    <Button onClick={() => router.push("/career?tab=jobs")} variant="outline" className="border-slate-200 text-slate-900 rounded-xl h-12 px-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Career Center
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.id === job.posterId || user?.email === job.poster?.email
    const isDeletedByAdmin = job.status === 'deleted_by_admin'

    if (isDeletedByAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-rose-50 p-6 rounded-full mb-6 border border-rose-100 shadow-sm">
                        <Shield className="h-16 w-16 text-rose-600/40" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Post Unavailable</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mb-8 leading-relaxed font-medium italic">
                        This job posting has been deleted by an administrator for violating community guidelines.
                    </p>
                    <Link href="/career?tab=jobs">
                        <Button className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 px-8 h-12 font-black rounded-xl shadow-lg shadow-slate-900/10">
                            Back to Career Center
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    const handleApply = () => {
        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }
        const to = job.contactEmail || job.poster?.email || '';
        const subject = encodeURIComponent(`Application for ${job.title} at ${job.company}`);
        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
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
                                href="/career?tab=jobs"
                                className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Board
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
                                                Professional Listing
                                            </Badge>
                                            <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm">
                                                {job.type}
                                            </Badge>
                                        </div>
                                        <h1 className="text-5xl md:text-7xl font-sans font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                                            {job.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-50"><Briefcase className="h-6 w-6 text-secondary" /></div>
                                                <span className="text-2xl font-sans font-black text-slate-900 tracking-tight">{job.company}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-50"><MapPin className="h-6 w-6 text-secondary" /></div>
                                                <span className="text-lg font-bold text-slate-500">{job.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <ShareButton
                                            url={`/career/jobs/${job.id}`}
                                            title={job.title}
                                            variant="button"
                                            className="bg-white hover:bg-slate-50 text-slate-900 border-slate-200 shadow-xl shadow-slate-200/30 rounded-2xl h-16 px-8 font-black transition-all"
                                            description={`💼 *Job: ${job.title}*\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary || 'N/A'}\n\n${job.description}`}
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
                                            <h2 className="text-2xl font-sans font-black text-slate-900 uppercase tracking-widest">Job Specifications</h2>
                                            <div className="h-1 flex-1 bg-slate-50 rounded-full" />
                                        </div>

                                        <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-lg font-medium italic mb-16">
                                            {job.description}
                                        </div>

                                        {isOwner && (
                                            <div className="pt-12 border-t border-slate-50 flex flex-wrap gap-4">
                                                <Button
                                                    onClick={() => router.push(`/career/jobs/${job.id}/edit`)}
                                                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 px-10 font-black shadow-xl shadow-slate-900/10 transition-all"
                                                >
                                                    <Edit className="h-5 w-5 mr-3" /> Update Profile
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-rose-100 text-rose-500 hover:bg-rose-50 rounded-2xl h-14 px-10 font-black transition-all"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Trash2 className="h-5 w-5 mr-3" />}
                                                    Archive Listing
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-transparent shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] border border-slate-50">
                                    <CardContent className="p-10 md:p-12">
                                        <div className="flex items-center gap-6 mb-10">
                                            <h3 className="text-xl font-sans font-black text-slate-900 uppercase tracking-widest">Contact Gateway</h3>
                                            <div className="h-1 flex-1 bg-slate-50 rounded-full" />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-10">
                                            {job.contactEmail && (
                                                <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-white">
                                                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200/50 border border-slate-50"><Mail className="h-7 w-7" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Official Email</p>
                                                        <p className="text-xl font-black text-slate-900 leading-tight">{job.contactEmail}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {job.contactPhone && (
                                                <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-white">
                                                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200/50 border border-slate-50"><Phone className="h-7 w-7" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Support Line</p>
                                                        <p className="text-xl font-black text-slate-900 leading-tight">{job.contactPhone}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-10">
                                <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] bg-white rounded-[2.5rem] sticky top-24 border border-slate-50">
                                    <CardContent className="p-10">
                                        <div className="text-center mb-12">
                                            <Badge className="bg-slate-900 text-white border-none px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[9px] shadow-xl shadow-slate-900/20 mb-4">
                                                Overview
                                            </Badge>
                                        </div>

                                        <div className="space-y-10">
                                            {job.salary && (
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm shadow-emerald-500/5">
                                                        <DollarSign className="h-8 w-8 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Compensation</p>
                                                        <p className="text-2xl font-sans font-black text-emerald-600 leading-none tracking-tight">{job.salary}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20 shadow-sm shadow-secondary/5">
                                                    <Calendar className="h-8 w-8 text-secondary" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Window Closes</p>
                                                    <p className="text-xl font-sans font-black text-slate-900 leading-none">
                                                        {job.deadline ? formatDate(job.deadline) : "Continuous Intake"}
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="bg-slate-50 mt-10" />

                                            <div className="pt-6">
                                                {!isAuthenticated ? (
                                                    <div className="text-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                                        <p className="text-slate-500 mb-8 font-bold italic leading-relaxed text-sm">Create an account or login to access application protocols.</p>
                                                        <Link href="/login" className="block">
                                                            <Button className="w-full bg-slate-900 text-white hover:bg-black font-black h-16 rounded-2xl shadow-xl shadow-slate-900/10 transition-all">
                                                                Secure Authentication
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <Button
                                                            onClick={handleApply}
                                                            className="w-full bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 shadow-xl shadow-slate-900/10 font-black h-20 rounded-[2rem] text-lg group transition-all"
                                                        >
                                                            Initiate Application
                                                            <Briefcase className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                                                        </Button>

                                                        <div className="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl justify-center text-center border border-emerald-100/50">
                                                            <Shield className="h-5 w-5 text-emerald-500" />
                                                            <p className="text-[10px] text-emerald-700 font-black uppercase tracking-[0.2em]">
                                                                Verified Opportunity
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-transparent shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] border border-slate-50">
                                    <CardContent className="p-10">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">Opportunity Curator</p>
                                        <Link href={`/members/${job.posterId}`}>
                                            <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-500 group border border-white">
                                                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-slate-900 font-sans font-black text-2xl shrink-0 group-hover:bg-white/10 group-hover:text-white transition-all duration-500 shadow-xl shadow-slate-200/50">
                                                    {job.poster?.name?.charAt(0) || "P"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-lg font-black truncate leading-tight group-hover:text-white mb-1">{job.poster?.name || "Member"}</p>
                                                    <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] group-hover:text-secondary/80">Community Beacon</p>
                                                </div>
                                            </div>
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
