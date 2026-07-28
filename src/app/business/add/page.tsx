"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Save, Loader2, Building2, UploadCloud, Info, Briefcase, Plus, X } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, collectErrors } from "@/lib/validation"
import { getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function AddBusinessPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        category: "Retail",
        city: "",
        description: "",
        contact: "",
        address: "",
        images: [] as string[]
    })
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Business Name'), validateLength(formData.name, 3, 100, 'Business Name')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 1000, 'Description')],
            city: [validateRequired(formData.city, 'City')],
            contact: [validateRequired(formData.contact, 'Contact')],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setIsSubmitting(true)
        setError(null)
        try {
            const uploadedUrls: string[] = []

            for (let i = 0; i < files.length; i++) {
                if (formData.images.length + uploadedUrls.length >= 5) {
                    setError("Maximum 5 images allowed")
                    break
                }

                const formDataUpload = new FormData()
                formDataUpload.append("file", files[i])

                const token = await getToken()
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formDataUpload
                })

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload image")
                }

                const result = await uploadRes.json()
                uploadedUrls.push(result.url)
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }))
        } catch (err: any) {
            setError(err.message || "Failed to upload images")
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsSubmitting(true)
        setError(null)

        try {
            const payload = {
                ...formData
            }
            const token = await getToken()
            const res = await fetch("/api/business", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to create business")
            }

            const data = await res.json()

            if (data.status === 'pending_payment') {
                router.push(`/business/payment/${data.id}`)
            } else {
                router.push("/business")
            }
            router.refresh()
        } catch (err) {
            console.error("Error submitting business:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    const categories = ["Retail", "Jewellery", "Technology", "Food", "Textiles", "Logistics", "Services", "Other"]

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6] relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl -mb-32 -ml-32 pointer-events-none" />

                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl relative z-10">
                    {/* Header */}
                    <div className="mb-14 px-4">
                        <Link href="/business" className="inline-flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-all text-[11px] font-black uppercase tracking-[0.2em] group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Directory
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">Add Your <span className="text-secondary italic">Business</span></h1>
                        <p className="text-xl text-slate-500 font-medium italic animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            Share your business with the community. Verified listings help build trust.
                        </p>
                    </div>

                    <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3rem] overflow-hidden border border-slate-50">
                        <CardContent className="p-10 md:p-16">
                            <form onSubmit={handleSubmit} className="space-y-12">
                                {/* Basic Info Section */}
                                <div className="space-y-10">
                                    <div className="flex items-center gap-6 mb-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary whitespace-nowrap">Business Details</h3>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Business Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g. Sri Lakshmi Silks"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300 ${errors.name ? 'border-rose-300 ring-rose-300' : ''}`}
                                            />
                                            {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="category" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                            >
                                                <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat} value={cat} className="rounded-xl font-bold py-3">{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Description *</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Describe your products or services (min 20 characters)..."
                                            required
                                            rows={5}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={`w-full rounded-[2rem] border ${errors.description ? 'border-rose-300 ring-rose-300' : 'border-slate-100'} bg-slate-50/50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all font-bold text-slate-600 leading-relaxed placeholder:text-slate-300`}
                                        />
                                        {errors.description && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.description}</p>}
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                {/* Contact Info Section */}
                                <div className="space-y-10">
                                    <div className="flex items-center gap-6 mb-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary whitespace-nowrap">Contact & Location</h3>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="city" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">City *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder="e.g. Bangalore"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300 ${errors.city ? 'border-rose-300 ring-rose-300' : ''}`}
                                            />
                                            {errors.city && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.city}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="contact" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Contact Number / Email *</Label>
                                            <Input
                                                id="contact"
                                                name="contact"
                                                placeholder="e.g. 9988776655"
                                                required
                                                value={formData.contact}
                                                onChange={handleChange}
                                                className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300 ${errors.contact ? 'border-rose-300 ring-rose-300' : ''}`}
                                            />
                                            {errors.contact && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest pl-4">{errors.contact}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="address" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Detailed Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            placeholder="Full address of your shop/office"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary transition-all px-8 font-bold text-slate-700 placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                {/* Images Section */}
                                <div className="space-y-10">
                                    <div className="flex items-center gap-6 mb-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary whitespace-nowrap">Business Images</h3>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                            {formData.images.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-100 group bg-slate-50 shadow-sm transition-all hover:shadow-xl">
                                                    <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-3 right-3 h-8 w-8 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 flex items-center justify-center backdrop-blur-sm"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {formData.images.length < 5 && (
                                                <label className="relative aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-secondary transition-all bg-white group shadow-inner">
                                                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                                        <Plus className="h-6 w-6 text-slate-400 group-hover:text-secondary" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-secondary">Add Photo</span>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        disabled={isSubmitting}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-3">
                                                <Info className="h-4 w-4 text-secondary" />
                                                Recommended: Shop front, interior, or products.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                                            <Info className="h-6 w-6" />
                                        </div>
                                        <p className="font-black text-lg">{error}</p>
                                    </div>
                                )}

                                <div className="pt-12">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-slate-900 text-white hover:bg-black h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/10 transition-all active:scale-[0.98] group"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin mr-4" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-6 w-6 mr-4" /> Add Business
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-10 px-10 opacity-60">
                                        By posting, you agree to our community standards and verify that the information is accurate.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
