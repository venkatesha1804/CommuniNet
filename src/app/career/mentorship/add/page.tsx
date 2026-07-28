"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function AddMentorshipPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        expertise: "Technology",
        bio: "",
        contact: "" // Adding contact as it's usually needed
    })

    const expertiseOptions = ["Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch("/api/career/mentorship", {
                method: "POST",
                headers,
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/career?tab=mentorship")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to create mentorship profile")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans selection:bg-secondary/20 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl -mb-32 -ml-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />

                    <main className="flex-1 pb-24 px-4 pt-16">
                        <div className="container mx-auto max-w-4xl mb-12">
                            <Link
                                href="/career"
                                className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Career Hub
                            </Link>
                            <div>
                                <h1 className="text-5xl md:text-6xl font-sans font-black text-slate-900 mb-4 leading-none tracking-tight">Become a Mentor</h1>
                                <p className="text-xl text-slate-500 font-medium italic">
                                    Share your expertise or look for guidance within the community.
                                </p>
                            </div>
                        </div>

                        <div className="container mx-auto max-w-3xl relative z-10">
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
                                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary whitespace-nowrap">Mentorship Details</h3>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Title / Headline *</label>
                                                <Input
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    required
                                                    placeholder="e.g. Senior Software Engineer offering guidance"
                                                    className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 focus:border-orange-500 transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Area of Expertise *</label>
                                                <Select
                                                    value={formData.expertise}
                                                    onValueChange={(val) => setFormData({ ...formData, expertise: val })}
                                                >
                                                    <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 text-left">
                                                        <SelectValue placeholder="Select Area" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden bg-white">
                                                        {expertiseOptions.map(opt => (
                                                            <SelectItem key={opt} value={opt} className="font-bold text-slate-600 py-3 focus:bg-slate-50 transition-colors">{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Bio / Mentorship Vision *</label>
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    required
                                                    rows={8}
                                                    placeholder="Tell us about your experience and what you can offer..."
                                                    className="w-full rounded-[2rem] border border-slate-100 bg-slate-50/50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all font-bold text-slate-600 leading-relaxed placeholder:text-slate-300"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Professional Link (Optional)</label>
                                                <Input
                                                    value={formData.contact}
                                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                    placeholder="e.g. LinkedIn URL or Portfolio"
                                                    className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 focus:border-orange-500 transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300"
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
                                                {loading ? "Saving..." : "Become a Mentor"}
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
