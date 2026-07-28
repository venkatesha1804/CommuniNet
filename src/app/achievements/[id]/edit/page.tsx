"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateLength, collectErrors } from "@/lib/validation"

export default function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const { user, getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        date: "",
        description: "",
        images: [] as string[]
    })

    const categories = [
        "Education",
        "Sports",
        "Arts & Culture",
        "Professional",
        "Community Service",
        "Other"
    ]

    useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const res = await fetch(`/api/achievements/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check
                    if (user?.id !== data.userId && user?.role !== 'admin') {
                        router.push('/achievements')
                        return
                    }

                    setFormData({
                        title: data.title || "",
                        category: data.category || "",
                        date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
                        description: data.description || "",
                        images: data.images || []
                    })
                } else {
                    setError("Failed to fetch achievement details")
                }
            } catch (err) {
                setError("An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchAchievement()
        }
    }, [id, user, router])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setSaving(true)
        setError("")
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
            setSaving(false)
        }
    }

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }))
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            title: [validateRequired(formData.title, 'Achievement Title'), validateLength(formData.title, 3, 100, 'Achievement Title')],
            category: [validateRequired(formData.category, 'Category')],
            date: [validateRequired(formData.date, 'Date of Achievement')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 1000, 'Description')],
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
            const res = await fetch(`/api/achievements/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push(`/achievements/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update achievement")
            }
        } catch (error) {
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
                    <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-secondary">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-900 text-white p-10">
                        <CardTitle className="text-3xl font-black tracking-tight">Edit Achievement</CardTitle>
                        <CardDescription className="text-slate-400 font-bold">Update your success story.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                            <div className="space-y-2">
                                <Label htmlFor="title">Achievement Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Gold Medal in State Championship"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value })
                                        if (errors.title) setErrors(prev => { const n = { ...prev }; delete n.title; return n })
                                    }}
                                    className={errors.title ? 'border-red-500' : ''}
                                    suppressHydrationWarning
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger suppressHydrationWarning>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Date of Achievement</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the achievement and your journey (min 20 characters)..."
                                    className={`min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData({ ...formData, description: e.target.value })
                                        if (errors.description) setErrors(prev => { const n = { ...prev }; delete n.description; return n })
                                    }}
                                    suppressHydrationWarning
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                                    <span>Achievement Photos (Max 5)</span>
                                    <span className="text-xs text-muted-foreground">{formData.images.length} / 5</span>
                                </label>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {formData.images.map((url, idx) => (
                                        <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {formData.images.length < 5 && (
                                        <div className="relative aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={saving}
                                            />
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-secondary transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-1 text-xs text-gray-500 font-medium">Click to upload</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-slate-200 transition-all" disabled={saving} suppressHydrationWarning>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}
