"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import Link from "next/link"

export default function EditScholarshipPage() {
    const router = useRouter()
    const { id } = useParams()
    const { user, getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "General",
        eligibility: "",
        description: "",
        deadline: "",
        link: "",
    })

    useEffect(() => {
        const fetchScholarship = async () => {
            try {
                const res = await fetch(`/api/career/scholarships/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check
                    if (user?.id !== data.posterId && user?.role !== 'admin') {
                        router.push('/career?tab=scholarships')
                        return
                    }

                    setFormData({
                        title: data.title || "",
                        amount: data.amount || "",
                        type: data.type || "General",
                        eligibility: data.eligibility || "",
                        description: data.description || "",
                        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "",
                        link: data.link || "",
                    })
                } else {
                    setError("Failed to fetch scholarship details")
                }
            } catch (err) {
                setError("An error occurred while fetching details")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchScholarship()
        }
    }, [id, user, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            title: [validateRequired(formData.title, 'Scholarship Title'), validateLength(formData.title, 3, 100, 'Scholarship Title')],
            amount: [validateRequired(formData.amount, 'Award Amount')],
            eligibility: [validateRequired(formData.eligibility, 'Eligibility')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 2000, 'Description')],
            deadline: [validateFutureDate(formData.deadline, 'Deadline')],
            ...(formData.link ? { link: [validateUrl(formData.link)] } : {}),
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
            const res = await fetch(`/api/career/scholarships/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push(`/career/scholarships/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update scholarship")
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
                        <p className="text-secondary font-sans italic text-lg opacity-60">Fetching scholarship details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />

                <main className="flex-1 pb-24">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <Link href={`/career/scholarships/${id}`} className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-6 transition-all text-sm font-bold uppercase tracking-widest group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Scholarship Details
                        </Link>
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Update Scholarship</h1>
                            <p className="text-gray-500 font-medium italic">
                                Ensure the scholarship information is accurate for students.
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
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-8 border-b border-slate-50 pb-4">Grant Modification</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Scholarship Title *</label>
                                            <Input
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="e.g. Merit Scholarship 2026"
                                                className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.title ? 'border-red-500' : ''}`}
                                            />
                                            {errors.title && <p className="text-red-500 text-xs font-bold pl-2">{errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Award Amount *</label>
                                                <Input
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleChange}
                                                    placeholder="e.g. ₹50,000"
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.amount ? 'border-red-500' : ''}`}
                                                />
                                                {errors.amount && <p className="text-red-500 text-xs font-bold pl-2">{errors.amount}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Deadline *</label>
                                                <Input
                                                    name="deadline"
                                                    type="date"
                                                    value={formData.deadline}
                                                    onChange={handleChange}
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.deadline ? 'border-red-500' : ''}`}
                                                />
                                                {errors.deadline && <p className="text-red-500 text-xs font-bold pl-2">{errors.deadline}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Scholarship Type *</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-6 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    {["General", "Merit-based", "Need-based", "Sports", "Arts", "Others"].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Eligibility *</label>
                                                <Input
                                                    name="eligibility"
                                                    value={formData.eligibility}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Students scoring 90%+"
                                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium ${errors.eligibility ? 'border-red-500' : ''}`}
                                                />
                                                {errors.eligibility && <p className="text-red-500 text-xs font-bold pl-2">{errors.eligibility}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Scholarship Description *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={6}
                                                className={`w-full rounded-[2rem] border ${errors.description ? 'border-red-500' : 'border-slate-100'} bg-slate-50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all font-medium leading-relaxed`}
                                                placeholder="Provide detailed information about the scholarship..."
                                            />
                                            {errors.description && <p className="text-red-500 text-xs font-bold pl-2">{errors.description}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Application Link (optional)</label>
                                            <Input
                                                name="link"
                                                value={formData.link}
                                                onChange={handleChange}
                                                placeholder="https://example.com/apply"
                                                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-6 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-20 rounded-[2rem] font-black text-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all active:scale-[0.98]"
                                        >
                                            {saving ? <Loader2 className="h-6 w-6 animate-spin mr-4" /> : null}
                                            {saving ? "Saving Changes..." : "Update Scholarship"}
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
