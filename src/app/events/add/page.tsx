"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Calendar, MapPin, Clock, Save, Loader2, Megaphone, Target, Users, Globe, Type, ExternalLink, X, Plus } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function AddEventPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "Community Meetup",
        images: [] as string[],
        organizer: "",
        audience: "public",
        registrationLink: ""
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
            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to create event")
            }

            router.push("/events")
            router.refresh()
        } catch (err) {
            console.error("Error creating event:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                    <Link
                        href="/events"
                        className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-10 w-fit group"
                    >
                        <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to Events</span>
                    </Link>

                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-white p-10 md:p-14 text-slate-900 relative overflow-hidden border-b border-slate-100">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center rounded-full border border-secondary/10 bg-secondary/10 px-4 py-1.5 text-[10px] font-black text-secondary mb-6 uppercase tracking-[0.2em]">
                                    <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                                    Event Organizer
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    Post an <span className="text-secondary italic">Event</span>
                                </h1>
                                <p className="text-xl text-slate-500 font-medium italic animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                    Bring your community together. Fill in the details below to post your event.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 md:p-14">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[2rem] mb-10 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <X className="h-5 w-5" />
                                    </div>
                                    <p className="font-bold text-sm tracking-tight">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-12">
                                {/* Basic Info Section */}
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-sm">
                                            <Type className="h-5 w-5 text-secondary" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Basic Information</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Event Title *</Label>
                                            <Input
                                                name="title"
                                                placeholder="e.g. Annual Community Picnic 2026"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className={`h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-lg font-black px-8 placeholder:text-slate-300 ${errors.title ? 'border-red-300' : 'focus:border-secondary focus:ring-secondary/20'}`}
                                            />
                                            {errors.title && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Date *</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        type="date"
                                                        name="date"
                                                        value={formData.date}
                                                        onChange={handleChange}
                                                        className={`h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all pl-14 pr-8 text-lg font-black ${errors.date ? 'border-red-300' : 'focus:border-secondary focus:ring-secondary/20'}`}
                                                    />
                                                </div>
                                                {errors.date && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.date}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Time *</Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        type="time"
                                                        name="time"
                                                        value={formData.time}
                                                        onChange={handleChange}
                                                        className={`h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all pl-14 pr-8 text-lg font-black ${errors.time ? 'border-red-300' : 'focus:border-secondary focus:ring-secondary/20'}`}
                                                    />
                                                </div>
                                                {errors.time && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.time}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Venue / Location *</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    name="location"
                                                    placeholder="e.g. Community Hall Basement, 4th Block Jayanagar"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className={`h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all pl-14 pr-8 text-lg font-black placeholder:text-slate-300 ${errors.location ? 'border-red-300' : 'focus:border-secondary focus:ring-secondary/20'}`}
                                                />
                                            </div>
                                            {errors.location && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.location}</p>}
                                        </div>
                                    </div>
                                </section>

                                <Separator className="bg-slate-100" />

                                {/* Organization Details Section */}
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-sm">
                                            <Target className="h-5 w-5 text-secondary" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organizer Details</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Organizer Name *</Label>
                                            <Input
                                                name="organizer"
                                                placeholder="Your Name or Association"
                                                value={formData.organizer}
                                                onChange={handleChange}
                                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all px-8 text-lg font-black placeholder:text-slate-300 focus:border-secondary focus:ring-secondary/20"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Event Category</Label>
                                            <Select
                                                defaultValue={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all px-8 text-lg font-black focus:border-secondary focus:ring-secondary/20">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                                                    <SelectItem value="Community Meetup" className="rounded-xl font-bold py-3">Community Meetup</SelectItem>
                                                    <SelectItem value="Cultural Festival" className="rounded-xl font-bold py-3">Cultural Festival</SelectItem>
                                                    <SelectItem value="Workshop" className="rounded-xl font-bold py-3">Workshop</SelectItem>
                                                    <SelectItem value="Charity Drive" className="rounded-xl font-bold py-3">Charity Drive</SelectItem>
                                                    <SelectItem value="Sports" className="rounded-xl font-bold py-3">Sports</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Target Audience</Label>
                                            <Select
                                                defaultValue={formData.audience}
                                                onValueChange={(val) => setFormData({ ...formData, audience: val })}
                                            >
                                                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all px-8 text-lg font-black focus:border-secondary focus:ring-secondary/20">
                                                    <SelectValue placeholder="Who can join?" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                                                    <SelectItem value="public" className="rounded-xl font-bold py-3">🌍 Public (Open to All)</SelectItem>
                                                    <SelectItem value="members_only" className="rounded-xl font-bold py-3">💼 Members Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {formData.audience === 'members_only' && (
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Registration Link (Optional)</Label>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        name="registrationLink"
                                                        placeholder="https://forms.google.com/..."
                                                        value={formData.registrationLink}
                                                        onChange={handleChange}
                                                        className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all pl-14 pr-8 text-lg font-black placeholder:text-slate-300 focus:border-secondary focus:ring-secondary/20"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <Separator className="bg-slate-100" />

                                {/* Detailed Description Section */}
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-sm">
                                            <Users className="h-5 w-5 text-secondary" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Event Details</h2>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description *</Label>
                                        <Textarea
                                            name="description"
                                            rows={6}
                                            placeholder="What is this event about? Mention agenda, special guests, and what attendees should bring..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={`min-h-[220px] rounded-[2.5rem] bg-slate-50 border-slate-100 focus:bg-white transition-all p-8 text-lg font-medium leading-relaxed placeholder:text-slate-300 ${errors.description ? 'border-red-300' : 'focus:border-secondary focus:ring-secondary/20'}`}
                                        />
                                        {errors.description && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.description}</p>}
                                    </div>
                                </section>

                                <Separator className="bg-slate-100" />

                                {/* Visuals Section */}
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-sm">
                                            <Globe className="h-5 w-5 text-secondary" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Event Visuals</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                                            <span>Posters & Photos (Max 5)</span>
                                            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full">{formData.images.length} of 5 uploaded</span>
                                        </Label>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {formData.images.map((url, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-slate-100 group shadow-lg">
                                                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-4 right-4 h-9 w-9 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}

                                            {formData.images.length < 5 && (
                                                <div className="relative aspect-video flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] hover:bg-secondary/10 hover:border-secondary transition-all cursor-pointer group shadow-inner">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-all mb-3 group-hover:scale-110 shadow-sm">
                                                        <Plus className="h-7 w-7 text-slate-400 group-hover:text-secondary" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-secondary">Add Poster</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <p className="text-xs text-slate-500 leading-relaxed font-bold">
                                                ✨ <strong className="text-slate-900 uppercase tracking-tighter mr-1">Pro tip:</strong> High-quality poster images increase RSVP rates by up to 60%. The first image will be your main event banner.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-10">
                                    <Button
                                        type="submit"
                                        className="w-full h-20 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 font-black text-xl shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 disabled:scale-100 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-4 h-7 w-7 animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-4 h-7 w-7" /> Post Event
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
