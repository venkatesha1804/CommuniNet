"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function AddScholarshipPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
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
        setLoading(true)
        setError("")

        try {
            const token = await getToken()
            const res = await fetch("/api/career/scholarships", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/career")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to add scholarship")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans selection:bg-secondary/20 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl -mb-32 -ml-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />

                    <main className="flex-1 pb-24">
                        <div className="container mx-auto px-4 pt-16 pb-8 max-w-4xl">
                            <Link
                                href="/career"
                                className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Career Hub
                            </Link>
                            <div className="mb-12">
                                <h1 className="text-5xl md:text-6xl font-sans font-black text-slate-900 mb-4 leading-none tracking-tight">Post a Scholarship</h1>
                                <p className="text-xl text-slate-500 font-medium italic">
                                    Support the community by sharing educational opportunities.
                                </p>
                            </div>
                        </div>

                        <div className="container mx-auto px-4 max-w-3xl relative z-10">
                            <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3rem] overflow-hidden border border-slate-50">
                                <CardContent className="p-10 md:p-16">
                                    <form onSubmit={handleSubmit} className="space-y-12">
                                        {error && (
                                            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-8 rounded-[2.5rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4 shadow-sm">
                                                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                                                    <Info className="h-6 w-6" />
                                                </div>
                                                <p className="font-black text-lg">{error}</p>
                                            </div>
                                        )}

                                        <div className="space-y-10">
                                            <div className="flex items-center gap-6 mb-10">
                                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary whitespace-nowrap">About the Scholarship</h3>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Scholarship Title *</label>
                                                <Input
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Merit Scholarship 2026"
                                                    className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300 ${errors.title ? 'border-rose-300 ring-rose-300' : ''}`}
                                                />
                                                {errors.title && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.title}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Award Amount *</label>
                                                    <Input
                                                        name="amount"
                                                        value={formData.amount}
                                                        onChange={handleChange}
                                                        placeholder="e.g. ₹50,000"
                                                        className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300 ${errors.amount ? 'border-rose-300 ring-rose-300' : ''}`}
                                                    />
                                                    {errors.amount && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.amount}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Application Deadline *</label>
                                                    <Input
                                                        name="deadline"
                                                        type="date"
                                                        value={formData.deadline}
                                                        onChange={handleChange}
                                                        className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 ${errors.deadline ? 'border-rose-300 ring-rose-300' : ''}`}
                                                    />
                                                    {errors.deadline && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.deadline}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3 relative">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Scholarship Category *</label>
                                                    <select
                                                        name="type"
                                                        value={formData.type}
                                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                        className="w-full h-16 rounded-2xl border border-slate-100 bg-slate-50/50 px-8 font-bold text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        {["General", "Merit-based", "Need-based", "Sports", "Arts", "Others"].map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-6 bottom-5 pointer-events-none opacity-20">
                                                        ▼
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Eligibility Criteria *</label>
                                                    <Input
                                                        name="eligibility"
                                                        value={formData.eligibility}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Students scoring 90%+"
                                                        className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300 ${errors.eligibility ? 'border-rose-300 ring-rose-300' : ''}`}
                                                    />
                                                    {errors.eligibility && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.eligibility}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Full Description *</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    rows={8}
                                                    className={`w-full rounded-[2rem] border ${errors.description ? 'border-rose-300 ring-rose-300' : 'border-slate-100'} bg-slate-50/50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all font-bold text-slate-600 leading-relaxed placeholder:text-slate-300`}
                                                    placeholder="Provide all relevant details about requirements and the selection process..."
                                                />
                                                {errors.description && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.description}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Application Link (optional)</label>
                                                <Input
                                                    name="link"
                                                    value={formData.link}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/apply"
                                                    className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-12">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-slate-900 text-white hover:bg-black h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/10 transition-all active:scale-[0.98] group"
                                            >
                                                {loading ? <Loader2 className="h-6 w-6 animate-spin mr-4" /> : null}
                                                {loading ? "Posting..." : "Post Scholarship"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </AuthGuard>
    )
}
