"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export default function CreateCollaborationPage() {
    const { user, isAuthenticated, isLoading, getToken } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [skillsText, setSkillsText] = useState("")

    const [formData, setFormData] = useState({
        title: "",
        partnershipType: "",
        description: "",
    })

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    if (!isAuthenticated || (user?.status !== 'approved' && user?.role !== 'admin')) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 inline-block mb-6">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Verification Required</h2>
                    <p>Only verified community members can post business collaboration opportunities.</p>
                </div>
                <div>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Parse comma-separated skills
        const skillsRequired = skillsText
            .split(",")
            .map(s => s.trim())
            .filter(s => s.length > 0)

        try {
            const token = await getToken()
            const response = await fetch("/api/business/collaboration", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    ...formData,
                    skillsRequired
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "Failed to create collaboration post")
            }

            toast.success(
                user.role === 'admin'
                    ? "Collaboration posted successfully."
                    : "Post submitted for admin review."
            )
            router.push("/business/collaboration")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />
            <main className="flex-1 relative">
                {/* Background decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none" />

                <div className="container mx-auto py-12 md:py-16 px-6 max-w-4xl min-h-screen relative z-10">
                    <Link href="/business/collaboration" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600 mb-8 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Collaborations
                    </Link>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 p-8 md:p-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-[#FDF2F0] flex items-center justify-center shrink-0 border border-orange-100 shadow-sm">
                                    <Building2 className="h-8 w-8 text-orange-500" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Post Collaboration Opportunity</h1>
                                    <p className="text-slate-500 text-lg font-medium">
                                        Find partners, co-founders, or strategic allies in the community.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-sm font-bold text-slate-900 uppercase tracking-wider">Opportunity Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g., Seeking Local Distributor for Wholesale Expansion"
                                        className="h-14 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 text-[15px]"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="partnershipType" className="text-sm font-bold text-slate-900 uppercase tracking-wider">Partnership Type <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="partnershipType"
                                        name="partnershipType"
                                        placeholder="e.g., Co-founder, Joint Venture, Strategic Alliance, Investor"
                                        className="h-14 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 text-[15px]"
                                        value={formData.partnershipType}
                                        onChange={handleChange}
                                        required
                                    />
                                    <p className="text-sm font-medium text-slate-500">Note: No public solicitation of investments or guaranteed returns is allowed.</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailed Description <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe the nature of the opportunity, project goals, and what you are looking for in a partner..."
                                        className="min-h-[180px] rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 text-[15px] p-4 p-4 resize-y"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="skillsText" className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Skills / Resources</Label>
                                    <Input
                                        id="skillsText"
                                        placeholder="e.g., Marketing, Logistics Network, Warehouse Space (Comma-separated)"
                                        className="h-14 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 text-[15px]"
                                        value={skillsText}
                                        onChange={(e) => setSkillsText(e.target.value)}
                                    />
                                    <p className="text-sm font-medium text-slate-500">Separate multiple requirements with commas.</p>
                                </div>

                                <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="h-14 px-8 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="h-14 px-8 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:opacity-90 transition-all border-0 min-w-[200px]">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Post"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
