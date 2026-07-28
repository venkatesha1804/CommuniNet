"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateLength, validateEmail, validatePhone, validateFutureDate, collectErrors } from "@/lib/validation"
import Link from "next/link"

export default function EditJobPage() {
    const router = useRouter()
    const { id } = useParams()
    const { user, getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        deadline: "",
    })

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/career/jobs/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check: only owner or admin can edit
                    if (user?.id !== data.posterId && user?.role !== 'admin') {
                        router.push('/career')
                        return
                    }

                    setFormData({
                        title: data.title || "",
                        company: data.company || "",
                        location: data.location || "",
                        type: data.type || "Full-time",
                        salary: data.salary || "",
                        description: data.description || "",
                        contactEmail: data.contactEmail || "",
                        contactPhone: data.contactPhone || "",
                        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "",
                    })
                } else {
                    setError("Failed to fetch job details")
                }
            } catch (err) {
                setError("An error occurred while fetching job details")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchJob()
        }
    }, [id, user, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            title: [validateRequired(formData.title, 'Job Title'), validateLength(formData.title, 3, 100, 'Job Title')],
            company: [validateRequired(formData.company, 'Company')],
            location: [validateRequired(formData.location, 'Location')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 2000, 'Description')],
            ...(formData.contactEmail ? { contactEmail: [validateEmail(formData.contactEmail)] } : {}),
            ...(formData.contactPhone ? { contactPhone: [validatePhone(formData.contactPhone)] } : {}),
            ...(formData.deadline ? { deadline: [validateFutureDate(formData.deadline, 'Deadline')] } : {}),
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSaving(true)
        setError("")

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/jobs/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push(`/career/jobs/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update job")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto" />
                        <p className="text-secondary font-sans italic text-lg opacity-60">Preparing your listing...</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />

                <main className="flex-1 pb-24">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <Link href={`/career/jobs/${id}`} className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-6 transition-all text-sm font-bold uppercase tracking-widest group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Job Details
                        </Link>
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Refine Your Posting</h1>
                            <p className="text-gray-500 font-medium italic">
                                Update the listing information for the community.
                            </p>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 max-w-3xl relative z-10">
                        <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3rem] overflow-hidden border border-slate-50">
                            <CardContent className="p-8 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {error && (
                                        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                <Info className="h-5 w-5" />
                                            </div>
                                            <p className="font-bold">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-8 border-b border-slate-50 pb-4">Job Particulars</h3>

                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Job Title *</label>
                                                <Input
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Senior React Developer"
                                                    className={`h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.title ? 'border-red-500' : ''}`}
                                                />
                                                {errors.title && <p className="text-red-500 text-xs font-bold pl-2">{errors.title}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Company *</label>
                                                <Input
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Acme Tech Solutions"
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.company ? 'border-red-500' : ''}`}
                                                />
                                                {errors.company && <p className="text-red-500 text-xs font-bold pl-2">{errors.company}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Location *</label>
                                                <Input
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Bangalore"
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.location ? 'border-red-500' : ''}`}
                                                />
                                                {errors.location && <p className="text-red-500 text-xs font-bold pl-2">{errors.location}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Job Type *</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-6 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option>Full-time</option>
                                                    <option>Part-time</option>
                                                    <option>Internship</option>
                                                    <option>Contract</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Salary Expectation</label>
                                                <Input
                                                    name="salary"
                                                    value={formData.salary}
                                                    onChange={handleChange}
                                                    placeholder="e.g. ₹5L-8L per annum"
                                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Application Deadline</label>
                                                <Input
                                                    name="deadline"
                                                    type="date"
                                                    value={formData.deadline}
                                                    onChange={handleChange}
                                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Detailed Description *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={8}
                                                className={`w-full rounded-xl border ${errors.description ? 'border-red-500' : 'border-slate-100'} bg-slate-50 px-6 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all font-medium leading-relaxed`}
                                                placeholder="Specify roles, responsibilities, and benefits..."
                                            />
                                            {errors.description && <p className="text-red-500 text-xs font-bold pl-2">{errors.description}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-8 border-b border-slate-50 pb-4">Point of Contact</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Email Address</label>
                                                <Input
                                                    name="contactEmail"
                                                    type="email"
                                                    value={formData.contactEmail}
                                                    onChange={handleChange}
                                                    placeholder="hr@company.com"
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.contactEmail ? 'border-red-500' : ''}`}
                                                />
                                                {errors.contactEmail && <p className="text-red-500 text-xs font-bold pl-2">{errors.contactEmail}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Phone Number</label>
                                                <Input
                                                    name="contactPhone"
                                                    value={formData.contactPhone}
                                                    onChange={handleChange}
                                                    placeholder="+91 98765 43210"
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.contactPhone ? 'border-red-500' : ''}`}
                                                />
                                                {errors.contactPhone && <p className="text-red-500 text-xs font-bold pl-2">{errors.contactPhone}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/10 transition-all active:scale-[0.98]"
                                        >
                                            {saving ? <Loader2 className="h-6 w-6 animate-spin mr-4" /> : null}
                                            {saving ? "Saving Changes..." : "Commit Updates"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}
