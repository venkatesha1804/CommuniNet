"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateMinLength, collectErrors } from "@/lib/validation"
import Link from "next/link"

export default function EditMentorshipPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const { user, getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        expertise: "",
        bio: "",
        available: true
    })

    useEffect(() => {
        const fetchMentorship = async () => {
            try {
                const res = await fetch(`/api/career/mentorship/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check: only mentor or admin can edit
                    if (user && user.id !== data.mentorId && user.role !== 'admin') {
                        router.push('/career?tab=mentorship')
                        return
                    }

                    setFormData({
                        expertise: data.expertise || "Technology",
                        bio: data.bio || "",
                        available: data.available ?? true
                    })
                } else {
                    setError("Failed to load mentorship details")
                }
            } catch (err) {
                setError("An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchMentorship()
        }
    }, [id, user, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
        if (errors[name]) {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            bio: [validateRequired(formData.bio, 'About You'), validateMinLength(formData.bio, 20, 'About You')],
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
            const res = await fetch(`/api/career/mentorship/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push(`/career/mentorship/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const expertiseOptions = ["Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto" />
                        <p className="text-secondary font-sans italic text-lg opacity-60">Preparing your profile details...</p>
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
                        <Link href={`/career/mentorship/${id}`} className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-6 transition-all text-sm font-bold uppercase tracking-widest group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                        </Link>
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Refine Your Profile</h1>
                            <p className="text-gray-500 font-medium italic">
                                Keep your information updated for potential mentees.
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
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-8 border-b border-slate-50 pb-4">Mentorship Details</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Core Expertise</label>
                                            <select
                                                name="expertise"
                                                value={formData.expertise}
                                                onChange={handleChange}
                                                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-6 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {expertiseOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">About Your Mentoring Journey</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                rows={10}
                                                className={`w-full rounded-[2rem] border ${errors.bio ? 'border-red-500' : 'border-slate-100'} bg-slate-50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all font-medium leading-relaxed`}
                                                placeholder="Provide updates to your experience or mentoring style..."
                                            />
                                            {errors.bio && <p className="text-red-500 text-xs font-bold pl-2">{errors.bio}</p>}
                                        </div>

                                        <div className="pt-4">
                                            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 flex items-center justify-between group hover:bg-white transition-all">
                                                <div className="space-y-1">
                                                    <label htmlFor="available" className="font-bold text-gray-900 cursor-pointer block">Availability Status</label>
                                                    <p className="text-xs text-gray-400 font-medium">Toggle your current availability for new mentees</p>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        id="available"
                                                        name="available"
                                                        checked={formData.available}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary shadow-inner transition-colors"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-20 rounded-[2rem] font-black text-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all active:scale-[0.98]"
                                        >
                                            {saving ? <Loader2 className="h-6 w-6 animate-spin mr-4" /> : null}
                                            {saving ? "Saving Updates..." : "Publish Changes"}
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
