"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Briefcase, GraduationCap, UserCheck, MapPin, Clock, Plus, Search, Loader2, ExternalLink, BadgeCheck, Trash2 } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Job {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string | null
    description: string
    contactEmail: string | null
    deadline: string | null
    status: string
    poster: { name: string | null; email: string }
}

interface Scholarship {
    id: string
    title: string
    amount: string
    eligibility: string
    description: string
    deadline: string
    link: string | null
    status: string
    poster: { name: string | null; email: string }
}

interface Mentor {
    id: string
    expertise: string
    bio: string
    available: boolean
    status: string
    hasRequested?: boolean
    mentor: { name: string | null; email: string; location: string | null; profileImage: string | null }
}

function CareerSupportContent() {
    const [activeTab, setActiveTab] = useState<"jobs" | "scholarships" | "mentorship">("jobs")
    const [filter, setFilter] = useState<'all' | 'mine'>('all')
    const [searchTerm, setSearchTerm] = useState("")
    const [jobs, setJobs] = useState<Job[]>([])
    const [scholarships, setScholarships] = useState<Scholarship[]>([])
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [loading, setLoading] = useState(true)
    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [selectedLocation, setSelectedLocation] = useState("All")
    const [selectedType, setSelectedType] = useState("All")
    const [selectedExpertise, setSelectedExpertise] = useState("All")
    const [selectedScholarshipType, setSelectedScholarshipType] = useState("All")
    const [selectedEligibility, setSelectedEligibility] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { user, isAuthenticated, getToken } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Reset page when tab changes
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && (tab === "jobs" || tab === "scholarships" || tab === "mentorship")) {
            setActiveTab(tab)
            setCurrentPage(1)
        }
    }, [searchParams])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filter, selectedLocation, selectedType, selectedExpertise, selectedScholarshipType, selectedEligibility])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (searchTerm) params.append('search', searchTerm)
                if (filter === 'mine') params.append('filter', 'mine')
                params.append('page', currentPage.toString())
                params.append('limit', '15')

                const token = await getToken()
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`

                let data;
                let res;

                if (activeTab === "jobs") {
                    if (selectedType !== "All") params.append('type', selectedType)
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    res = await fetch(`/api/career/jobs?${params.toString()}`, { headers })
                    if (res.ok) {
                        data = await res.json()
                        setJobs(data.jobs || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                } else if (activeTab === "scholarships") {
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    if (selectedScholarshipType !== "All") params.append('type', selectedScholarshipType)
                    if (selectedEligibility) params.append('eligibility', selectedEligibility)
                    res = await fetch(`/api/career/scholarships?${params.toString()}`, { headers })
                    if (res.ok) {
                        data = await res.json()
                        setScholarships(data.scholarships || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                } else if (activeTab === "mentorship") {
                    if (selectedExpertise !== "All") params.append('expertise', selectedExpertise)
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    res = await fetch(`/api/career/mentorship?${params.toString()}`, { headers })
                    if (res.ok) {
                        data = await res.json()
                        setMentors(data.mentors || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch career data", error)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchData, 300)
        return () => clearTimeout(timeoutId)
    }, [activeTab, searchTerm, filter, selectedLocation, selectedType, selectedExpertise, selectedScholarshipType, selectedEligibility, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const handleDelete = async (type: string, id: string) => {
        if (!confirm("Are you sure you want to delete this?")) return
        try {
            const endpoints: Record<string, string> = {
                scholarships: `/api/career/scholarships/${id}`,
                mentorship: `/api/career/mentorship/${id}`,
            }
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(endpoints[type], { method: 'DELETE', headers })
            if (res.ok) window.location.reload()
        } catch (e) {
            console.error(e)
        }
    }

    const handleConnect = async (mentorshipId: string) => {
        if (!isAuthenticated) {
            toast.info("Login Required", { description: "Please login to connect." })
            router.push("/login")
            return
        }

        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }

        setConnectingId(mentorshipId)
        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch('/api/career/mentorship/request', {
                method: 'POST',
                headers,
                body: JSON.stringify({ mentorshipId })
            })
            if (res.ok) {
                setMentors(prev => prev.map(m =>
                    m.id === mentorshipId ? { ...m, hasRequested: true } : m
                ))
                alert("Request sent successfully! (Check server console for simulated email)")
            } else {
                const data = await res.json()
                alert(data.message || "Failed to send request")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setConnectingId(null)
        }
    }

    const tabs = [
        { id: "jobs", label: "Jobs & Internships", icon: Briefcase },
        { id: "scholarships", label: "Scholarships", icon: GraduationCap },
        { id: "mentorship", label: "Mentorship", icon: UserCheck },
    ]

    const jobTypes = ["All", "Full-time", "Part-time", "Internship", "Contract"]
    const expertiseOptions = ["All", "Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]
    const scholarshipTypes = ["All", "General", "Merit-based", "Need-based", "Sports", "Arts", "Others"]

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl -mt-64 -mr-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-slate-400/5 rounded-full blur-3xl -mb-64 -ml-64 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-7xl flex flex-col">

                    {/* Header Section */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-6 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 uppercase tracking-wider font-bold h-8 px-4 rounded-full">
                            <Briefcase className="mr-2 h-4 w-4" /> Professional Ecosystem
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-black text-slate-900 mb-6 tracking-tight">
                            Career <span className="text-secondary">& Growth</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed font-sans">
                            Empowering our community through verified opportunities, educational scholarships, and professional guidance.
                        </p>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as any); setSearchTerm(""); setFilter('all') }}
                                    suppressHydrationWarning
                                    className={cn(
                                        "px-8 py-3.5 text-sm font-black rounded-[1.5rem] transition-all flex items-center gap-2.5",
                                        activeTab === tab.id
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                                    )}
                                >
                                    <tab.icon className={cn("h-4.5 w-4.5", activeTab === tab.id ? "text-secondary" : "text-slate-400")} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Toggle (Authenticated Only) */}
                    {isAuthenticated && activeTab !== "scholarships" && (
                        <div className="flex justify-center mb-10">
                            <div className="bg-white/80 backdrop-blur-sm p-1.5 min-w-[300px] rounded-2xl border border-slate-200 flex gap-1.5 shadow-sm">
                                <button
                                    onClick={() => setFilter('all')}
                                    suppressHydrationWarning
                                    className={cn(
                                        "flex-1 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all",
                                        filter === 'all'
                                            ? "bg-secondary text-slate-900 shadow-lg shadow-secondary/20"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    Community Base
                                </button>
                                <button
                                    onClick={() => setFilter('mine')}
                                    suppressHydrationWarning
                                    className={cn(
                                        "flex-1 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all",
                                        filter === 'mine'
                                            ? "bg-secondary text-slate-900 shadow-lg shadow-secondary/20"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    My Publications
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Search + Action Bar */}
                    <div className="bg-white p-8 rounded-[2.5rem] border-transparent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] mb-12">
                        <div className="flex flex-col lg:row gap-8">
                            <div className="flex flex-col md:flex-row gap-6 flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                    <Input
                                        placeholder={`Search ${activeTab}...`}
                                        className="pl-12 h-14 bg-slate-50/50 border-transparent rounded-2xl focus-visible:ring-secondary/20 focus-visible:border-secondary font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        suppressHydrationWarning
                                    />
                                </div>

                                <div className="flex flex-wrap md:flex-nowrap gap-4">
                                    {/* Location Filter */}
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4.5 h-4.5 w-4.5 text-secondary" />
                                        <Input
                                            placeholder="City..."
                                            className="pl-11 h-14 w-full md:w-[200px] bg-slate-50/50 border-transparent rounded-2xl focus-visible:ring-secondary/20"
                                            value={selectedLocation === "All" ? "" : selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value || "All")}
                                            suppressHydrationWarning
                                        />
                                    </div>

                                    {/* Job Type / Expertise Filter */}
                                    {activeTab === "jobs" && (
                                        <Select value={selectedType} onValueChange={setSelectedType}>
                                            <SelectTrigger className="h-14 w-full md:w-[180px] bg-slate-50/50 border-transparent rounded-2xl font-bold text-slate-700" suppressHydrationWarning>
                                                <SelectValue placeholder="Job Type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100">
                                                {jobTypes.map(t => <SelectItem key={t} value={t} className="rounded-xl">{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {activeTab === "mentorship" && (
                                        <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                                            <SelectTrigger className="h-14 w-full md:w-[180px] bg-slate-50/50 border-transparent rounded-2xl font-bold text-slate-700" suppressHydrationWarning>
                                                <SelectValue placeholder="Expertise" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100">
                                                {expertiseOptions.map(o => <SelectItem key={o} value={o} className="rounded-xl">{o}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {activeTab === "scholarships" && (
                                        <div className="flex gap-4">
                                            <Select value={selectedScholarshipType} onValueChange={setSelectedScholarshipType}>
                                                <SelectTrigger className="h-14 w-[160px] bg-slate-50/50 border-transparent rounded-2xl font-bold text-slate-700">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100">
                                                    {scholarshipTypes.map(t => <SelectItem key={t} value={t} className="rounded-xl">{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Eligibility..."
                                                className="h-14 w-[160px] bg-slate-50/50 border-transparent rounded-2xl focus-visible:ring-secondary/20"
                                                value={selectedEligibility}
                                                onChange={(e) => setSelectedEligibility(e.target.value)}
                                                suppressHydrationWarning
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 lg:pt-0 lg:border-l lg:pl-10 border-slate-100">
                                {activeTab === "jobs" && (
                                    <Button
                                        className="h-14 px-8 bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 font-black rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1"
                                        onClick={() => {
                                            if (isAuthenticated && (user?.status === 'approved' || user?.role === 'admin')) {
                                                router.push("/career/jobs/add")
                                            } else if (!isAuthenticated) {
                                                toast.info("Identification Required", { description: "Please authenticate to post professional listings." })
                                                router.push("/login")
                                            } else {
                                                toast.error("Profile Under Review", {
                                                    description: "Your verification is being processed by the community council."
                                                })
                                            }
                                        }}
                                    >
                                        <Plus className="h-5 w-5 mr-2" /> Post Job
                                    </Button>
                                )}

                                {activeTab === "scholarships" && user?.role === "admin" && (
                                    <Link href="/career/scholarships/add">
                                        <Button className="h-14 px-8 bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 font-black rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1">
                                            <Plus className="h-5 w-5 mr-2" /> Scholarship
                                        </Button>
                                    </Link>
                                )}

                                {activeTab === "mentorship" && (
                                    <Button
                                        className="h-14 px-8 bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 font-black rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1"
                                        onClick={() => {
                                            if (isAuthenticated && (user?.status === 'approved' || user?.role === 'admin')) {
                                                router.push("/career/mentorship/register")
                                            } else if (!isAuthenticated) {
                                                toast.info("Identification Required", { description: "Please authenticate to offer professional guidance." })
                                                router.push("/login")
                                            } else {
                                                toast.error("Profile Under Review", {
                                                    description: "Your mentorship credentials are being verified."
                                                })
                                            }
                                        }}
                                    >
                                        <Plus className="h-5 w-5 mr-2" /> Register Mentor
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {loading ? (
                        <div className="flex justify-center py-32">
                            <Loader2 className="h-12 w-12 animate-spin text-secondary/30" />
                        </div>
                    ) : (
                        <div className="space-y-8">

                            {/* JOBS TAB */}
                            {activeTab === "jobs" && (
                                <div className="grid gap-8">
                                    {jobs.length === 0 ? (
                                        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm">
                                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Briefcase className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-sans font-black text-slate-900 mb-2">No Professional Opportunities</h3>
                                            <p className="text-slate-500 font-medium">We couldn't find any job listings matching your criteria.</p>
                                        </div>
                                    ) : (
                                        jobs.map(job => (
                                            <Card key={job.id} className="group border-transparent shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden rounded-[2rem] hover:shadow-[0_25px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-500 border border-slate-50">
                                                <CardContent className="p-0">
                                                    <div className="flex flex-col md:flex-row">
                                                        <div className="flex-1 p-8 md:p-10">
                                                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                                                <Badge className="bg-secondary/10 text-secondary border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm shadow-secondary/5">
                                                                    {job.type}
                                                                </Badge>
                                                                {job.status === 'pending' && (
                                                                    <Badge className="bg-amber-50 text-amber-600 border-none font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-sm">Reviewing Credentials</Badge>
                                                                )}
                                                                {job.status === 'deleted_by_admin' && (
                                                                    <Badge className="bg-rose-50 text-rose-600 border-none font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-sm">Archived</Badge>
                                                                )}
                                                            </div>

                                                            <Link href={`/career/jobs/${job.id}`}>
                                                                <h3 className="text-2xl font-sans font-black text-slate-900 group-hover:text-secondary transition-all cursor-pointer leading-tight mb-2">
                                                                    {job.title}
                                                                </h3>
                                                            </Link>
                                                            <p className="text-lg font-bold text-slate-600 mb-6 flex items-center">
                                                                <span className="h-1.5 w-1.5 bg-secondary rounded-full mr-3" />
                                                                {job.company}
                                                            </p>

                                                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-bold mb-8">
                                                                <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl"><MapPin className="h-4 w-4 text-secondary" /> {job.location}</span>
                                                                <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl"><Clock className="h-4 w-4 text-secondary" /> {job.deadline ? `Closes ${formatDate(job.deadline)}` : 'Rolling Intake'}</span>
                                                                {job.salary && <span className="text-emerald-600 border-2 border-emerald-50 bg-emerald-50/50 px-4 py-2 rounded-xl shadow-sm">{job.salary}</span>}
                                                            </div>

                                                            <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed mb-0 font-medium italic">
                                                                "{job.description.split('\n')[0]}..."
                                                            </p>
                                                        </div>

                                                        <div className="bg-slate-50/40 p-8 md:w-[260px] flex flex-col justify-center items-center gap-4 border-l border-slate-100">
                                                            {user?.email === job.poster?.email ? (
                                                                <div className="flex flex-col w-full gap-3">
                                                                    <Button variant="outline" className="w-full rounded-2xl h-12 text-sm font-black border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm" onClick={() => router.push(`/career/jobs/${job.id}/edit`)}>Modify Listing</Button>
                                                                    <Button variant="outline" className="w-full rounded-2xl h-12 text-sm font-black text-rose-500 border-rose-100 hover:bg-rose-50 transition-all" onClick={() => handleDelete('jobs', job.id)}>Archive</Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col w-full gap-3 text-center">
                                                                    <Link href={`/career/jobs/${job.id}`} className="w-full">
                                                                        <Button className="w-full rounded-2xl h-14 text-sm font-black bg-slate-900 text-white hover:shadow-xl hover:shadow-slate-900/10 transition-all">Review Details</Button>
                                                                    </Link>
                                                                    {isAuthenticated ? (
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="w-full text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-secondary/5 rounded-xl h-10 transition-all"
                                                                            onClick={() => {
                                                                                if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                                                    toast.error("Process Restricted", {
                                                                                        description: "Your professional profile is currently under review."
                                                                                    })
                                                                                    return
                                                                                }
                                                                                const to = job.poster?.email || job.contactEmail || '';
                                                                                const subject = encodeURIComponent(`Application for ${job.title}`);
                                                                                window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank')
                                                                            }}
                                                                        >
                                                                            Express Interest
                                                                        </Button>
                                                                    ) : (
                                                                        <Link href="/login" className="w-full">
                                                                            <Button variant="ghost" className="w-full text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-xl h-10">Authenticate to Apply</Button>
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex justify-center mt-2">
                                                                <ShareButton
                                                                    url={`/career?tab=jobs`}
                                                                    title={job.title}
                                                                    className="h-10 w-10 text-slate-600 hover:bg-white hover:text-secondary rounded-xl shadow-sm border-slate-100"
                                                                    description={`💼 *Job: ${job.title}*\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary || 'N/A'}\nDeadline: ${job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}\n\n${job.description}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* SCHOLARSHIPS TAB */}
                            {activeTab === "scholarships" && (
                                <div className="grid gap-10 md:grid-cols-2">
                                    {scholarships.length === 0 ? (
                                        <div className="col-span-2 text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm">
                                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <GraduationCap className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-sans font-black text-slate-900 mb-2">Ambitions Await</h3>
                                            <p className="text-slate-500 font-medium">No scholarships are currently listed. Check back soon!</p>
                                        </div>
                                    ) : (
                                        scholarships.map(item => (
                                            <Card key={item.id} className="group border-transparent shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden rounded-[2rem] hover:shadow-[0_25px_60px_-15px_rgba(249,115,22,0.15)] transition-all duration-500 border border-slate-50 flex flex-col">
                                                <CardHeader className="p-8 md:p-10 pb-0">
                                                    <div className="flex items-start justify-between gap-4 mb-8">
                                                        <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary text-secondary group-hover:text-slate-900 transition-all duration-500 shadow-sm shadow-secondary/10">
                                                            <GraduationCap className="h-8 w-8" />
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            {item.status === 'pending' && <Badge className="bg-amber-50 text-amber-600 border-none font-black uppercase tracking-widest text-[9px] px-3 py-1.5 mb-3 rounded-full">Validating</Badge>}
                                                            <ShareButton
                                                                url={`/career?tab=scholarships`}
                                                                title={item.title}
                                                                className="h-10 w-10 text-slate-600 hover:bg-slate-50 rounded-xl"
                                                                description={`🎓 *Scholarship: ${item.title}*\nAmount: ${item.amount}\nEligibility: ${item.eligibility}\nDeadline: ${formatDate(item.deadline)}\n\n${item.description}`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Link href={`/career/scholarships/${item.id}`}>
                                                        <CardTitle className="text-2xl font-sans font-black text-slate-900 group-hover:text-secondary transition-all cursor-pointer leading-tight mb-6">
                                                            {item.title}
                                                        </CardTitle>
                                                    </Link>
                                                    <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Awarded Funds</span>
                                                            <span className="text-xl font-sans font-black text-emerald-600">{item.amount}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Application Cycle</span>
                                                            <span className="text-sm font-black text-slate-900 ">End {formatDate(item.deadline)}</span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-8 md:p-10 pt-8 flex-1">
                                                    <Separator className="bg-slate-100 mb-8" />
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary mb-2">Qualifications</h5>
                                                            <p className="text-slate-600 font-bold text-sm leading-relaxed">{item.eligibility}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary mb-2">Legacy & Purpose</h5>
                                                            <p className="text-slate-500 line-clamp-3 leading-relaxed text-sm font-medium italic">"{item.description}"</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="p-8 md:p-10 pt-0 flex gap-4">
                                                    <Link href={`/career/scholarships/${item.id}`} className="flex-1">
                                                        <Button variant="outline" className="w-full rounded-2xl h-14 text-sm font-black border-slate-200 text-slate-900 hover:bg-slate-50 transition-all">
                                                            Review Path
                                                        </Button>
                                                    </Link>
                                                    {item.link && (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                            <Button className="w-full rounded-2xl h-14 text-sm font-black bg-slate-900 text-white hover:shadow-xl hover:shadow-slate-900/10 transition-all">
                                                                Apply Portal <ExternalLink className="h-4 w-4 ml-2" />
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {user?.email === item.poster?.email && (
                                                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => router.push(`/career/scholarships/${item.id}/edit`)}>
                                                            <Plus className="h-5 w-5 rotate-45" />
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* MENTORSHIP TAB */}
                            {activeTab === "mentorship" && (
                                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                                    {mentors.length === 0 ? (
                                        <div className="col-span-3 text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm">
                                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <UserCheck className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-sans font-black text-slate-900 mb-2">Knowledge Share</h3>
                                            <p className="text-slate-500 font-medium">No mentors found. Why not be the first to lead?</p>
                                        </div>
                                    ) : (
                                        mentors.map(m => (
                                            <Card key={m.id} className="group border-transparent shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden rounded-[2rem] hover:shadow-[0_25px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-500 flex flex-col border border-slate-50">
                                                <CardHeader className="p-8 pb-4 flex flex-col items-center text-center">
                                                    <div className="relative mb-6">
                                                        <div className="h-28 w-28 rounded-full bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                            {m.mentor.profileImage ? (
                                                                <Image
                                                                    src={m.mentor.profileImage}
                                                                    alt={m.mentor.name || "Mentor"}
                                                                    width={112}
                                                                    height={112}
                                                                    className="h-full w-full object-cover"
                                                                    suppressHydrationWarning
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                                                                    <span className="text-4xl font-sans font-black text-secondary">{m.mentor.name?.charAt(0).toUpperCase() || "M"}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {m.available && (
                                                            <div className="absolute bottom-1 right-1 h-6 w-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm shadow-emerald-500/20" />
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        <div className="flex flex-col items-center gap-1 mb-4">
                                                            <Link href={`/career/mentorship/${m.id}`}>
                                                                <CardTitle className="text-2xl font-sans font-black text-slate-900 group-hover:text-secondary transition-colors cursor-pointer mb-0">{m.mentor.name || "Professional Mentor"}</CardTitle>
                                                            </Link>
                                                            {m.status === 'pending' && (
                                                                <Badge className="bg-amber-50 text-amber-600 border-none font-black uppercase tracking-[0.2em] text-[8px] px-3 py-1 rounded-full">Reviewing</Badge>
                                                            )}
                                                        </div>
                                                        <Badge className="mb-4 bg-slate-900 text-white border-none font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-full shadow-lg shadow-slate-900/10">
                                                            {m.expertise}
                                                        </Badge>
                                                        {m.mentor.location && (
                                                            <p className="text-sm text-slate-400 flex items-center justify-center gap-2 font-bold bg-slate-50 py-2 rounded-xl">
                                                                <MapPin className="h-4 w-4 text-secondary" /> {m.mentor.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="px-8 py-6 flex-1 text-center">
                                                    <p className="text-slate-500 text-sm italic leading-relaxed font-bold line-clamp-3">
                                                        "{m.bio}"
                                                    </p>
                                                </CardContent>

                                                <CardFooter className="px-8 pb-8 pt-2 flex flex-col gap-4">
                                                    {user?.email !== m.mentor.email ? (
                                                        <div className="flex w-full gap-3">
                                                            <Link href={`/career/mentorship/${m.id}`} className="flex-1">
                                                                <Button variant="outline" className="w-full rounded-2xl h-14 text-sm font-black border-slate-200 text-slate-900 hover:bg-slate-50">Profile</Button>
                                                            </Link>
                                                            {m.hasRequested ? (
                                                                <Button className="flex-1 rounded-2xl h-14 text-sm font-black bg-emerald-50 text-emerald-600 border-none pointer-events-none" disabled>
                                                                    Connected
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    className="flex-[1.5] rounded-2xl h-14 text-sm font-black bg-slate-900 text-white hover:shadow-xl hover:shadow-slate-900/10"
                                                                    onClick={() => handleConnect(m.id)}
                                                                    disabled={connectingId === m.id}
                                                                >
                                                                    {connectingId === m.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "Request Session"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex w-full gap-3">
                                                            <Button variant="outline" className="flex-1 rounded-2xl h-14 text-sm font-black border-slate-200 text-slate-900" onClick={() => router.push(`/career/mentorship/${m.id}/edit`)}>Modify Profile</Button>
                                                            <Button variant="outline" className="h-14 w-14 p-0 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete('mentorship', m.id)}><Trash2 className="h-5 w-5" /></Button>
                                                        </div>
                                                    )}
                                                    <ShareButton
                                                        url={`/career?tab=mentorship`}
                                                        title={m.mentor.name || 'Mentor'}
                                                        className="w-full text-slate-400 hover:text-secondary hover:bg-secondary/5 rounded-xl py-2 font-bold text-xs"
                                                        description={`🤝 *Mentor: ${m.mentor.name || 'Anonymous'}*\nExpertise: ${m.expertise}\nLocation: ${m.mentor.location || 'Not Specified'}\n\n${m.bio}`}
                                                    />
                                                </CardFooter>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Pagination Control */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex justify-center pb-12">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        className="gap-2"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </div>
    )
}

export default function CareerSupportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </main>
                <Footer />
            </div>
        }>
            <CareerSupportContent />
        </Suspense>
    )
}
