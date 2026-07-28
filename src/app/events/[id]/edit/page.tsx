"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Save, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const { getToken } = useAuth()
    const id = params.id as string

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "Community",
        images: [] as string[],
        audience: "public",
        registrationLink: ""
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${id}`)
                if (!res.ok) throw new Error("Event not found")
                const data = await res.json()

                const dateObj = new Date(data.date)
                const dateStr = dateObj.toISOString().split('T')[0]
                const timeStr = dateObj.toTimeString().slice(0, 5)

                setFormData({
                    title: data.title,
                    date: dateStr,
                    time: timeStr,
                    location: data.location,
                    description: data.description,
                    category: "Community",
                    images: data.images || [],
                    audience: data.audience || "public",
                    registrationLink: data.registrationLink || ""
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load event")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchEvent()
    }, [id])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            title: [validateRequired(formData.title, 'Event Title'), validateLength(formData.title, 3, 100, 'Event Title')],
            date: [validateFutureDate(formData.date, 'Event Date')],
            time: [validateRequired(formData.time, 'Event Time')],
            location: [validateRequired(formData.location, 'Location')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 2000, 'Description')],
            ...(formData.audience === 'members_only' && formData.registrationLink
                ? { registrationLink: [validateUrl(formData.registrationLink)] }
                : {}),
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
            const token = await getToken()
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to update event")
            }

            router.push("/events")
            router.refresh()
        } catch (err) {
            console.error("Error updating event:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center gap-6">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-secondary/20" />
                        <Loader2 className="h-16 w-16 animate-spin text-secondary absolute inset-0 [animation-delay:-0.5s]" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Loading Event</p>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6] selection:bg-secondary/20">
                <Navbar />

                <main className="flex-1 pb-24">
                    {/* Header Banner */}
                    <div className="bg-white border-b border-slate-100 pt-12 pb-16">
                        <div className="container mx-auto px-4">
                            <Link
                                href="/events"
                                className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all mb-10 w-fit group"
                            >
                                <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                                    <ArrowLeft className="h-5 w-5" />
                                </div>
                                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to events</span>
                            </Link>

                            <div className="max-w-4xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
                                    <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Event Editor</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                                    Refining <span className="text-secondary">Event</span>
                                </h1>
                                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                    Update your gathering details. Please note that significant changes will trigger a community review process.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 -mt-8">
                        <div className="max-w-4xl mx-auto">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-[1.5rem] mb-8 animate-shake shadow-xl shadow-red-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <Info className="h-5 w-5 text-red-600" />
                                        </div>
                                        <p className="text-red-700 font-bold tracking-tight">{error}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Basic Info Section */}
                                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="h-12 w-12 rounded-[1.25rem] bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                                            <Save className="h-6 w-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Basic Information</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Celebration Title</label>
                                            <Input
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className={`h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 ${errors.title ? 'border-red-300 ring-red-100' : ''}`}
                                            />
                                            {errors.title && <p className="text-red-500 text-xs font-bold ml-1">{errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Event Date</label>
                                                <Input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                    className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Start Time</label>
                                                <Input
                                                    type="time"
                                                    name="time"
                                                    value={formData.time}
                                                    onChange={handleChange}
                                                    className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Venue Location</label>
                                            <Input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="e.g. Community Center, Main Hall"
                                                className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Event Narrative</label>
                                            <textarea
                                                name="description"
                                                rows={6}
                                                className="w-full rounded-[2rem] border border-slate-100 bg-slate-50/50 px-6 py-5 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 focus:outline-none placeholder:text-slate-300"
                                                placeholder="Describe the magic of your event..."
                                                value={formData.description}
                                                onChange={handleChange}
                                            />
                                            {errors.description && <p className="text-red-500 text-xs font-bold ml-1">{errors.description}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Intended Audience</label>
                                                <select
                                                    name="audience"
                                                    className="w-full h-16 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 focus:outline-none appearance-none"
                                                    value={formData.audience}
                                                    onChange={handleChange}
                                                >
                                                    <option value="public">Open to All community</option>
                                                    <option value="members_only">Exclusive to Members</option>
                                                </select>
                                            </div>

                                            {formData.audience === 'members_only' && (
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Link for registration</label>
                                                    <Input
                                                        name="registrationLink"
                                                        placeholder="https://..."
                                                        value={formData.registrationLink}
                                                        onChange={handleChange}
                                                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-900 transition-all focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Visuals Section */}
                                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between ml-1 mb-8">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Captured Visuals</label>
                                            <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-500">{formData.images.length} / 5</span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {formData.images.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 group shadow-lg">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={url} alt={`Event Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="h-10 w-10 bg-white text-red-500 rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-all scale-75 group-hover:scale-100"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {formData.images.length < 5 && (
                                                <div className="relative aspect-square flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2rem] hover:bg-secondary/10 hover:border-secondary transition-all cursor-pointer group bg-slate-50/30">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-white transition-all">
                                                        <Save className="h-6 w-6 text-slate-300 group-hover:text-secondary" />
                                                    </div>
                                                    <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-secondary transition-colors">Add Visual</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10">
                                    <Button
                                        type="submit"
                                        className="w-full h-20 rounded-[2.5rem] bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/20 font-black uppercase tracking-[0.2em] text-sm transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-4 h-7 w-7 animate-spin" /> Finalizing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-4 h-7 w-7" /> Save Refinements
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
