"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, UploadCloud, ArrowLeft, Loader2, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { toast } from "sonner"
import { AuthGuard } from "@/components/auth-guard"

const AMENITIES_LIST = ['AC', 'Non-AC', 'Wi-Fi', 'Food', 'Laundry', 'Parking', '24/7 Security', 'Gym', 'Library/Study Room']

export default function AddAccommodationPage() {
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: "Hostel",
        gender: "",
        location: "",
        city: "",
        pricing: "",
        description: "",
        contactPhone: "",
        contactEmail: "",
    })
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [images, setImages] = useState<File[]>([])
    const [imageUrls, setImageUrls] = useState<string[]>([])

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader2 className="h-10 w-10 animate-spin text-secondary" /></div>
    if (!isAuthenticated) {
        router.push("/login")
        return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        )
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)

            setImages(prev => {
                const combined = [...prev, ...newFiles]
                if (combined.length > 5) {
                    toast.warning(`Maximum 5 images allowed. Extra images were trimmed.`)
                    return combined.slice(0, 5)
                }
                return combined
            })

            // Generate preview URLs
            setImageUrls(prev => {
                const newUrls = newFiles.map(file => URL.createObjectURL(file))
                const combined = [...prev, ...newUrls]
                return combined.slice(0, 5)
            })
        }
    }

    const clearImages = () => {
        setImages([])
        setImageUrls([])
    }

    const uploadImages = async () => {
        const uploadedUrls: string[] = []
        const token = await getToken()
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        for (const file of images) {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                uploadedUrls.push(data.url)
            }
        }
        return uploadedUrls
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.type || !formData.gender || !formData.location || !formData.pricing || !formData.contactPhone) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsLoading(true)

        try {
            // 1. Upload images if any
            let finalImageUrls: string[] = []
            if (images.length > 0) {
                finalImageUrls = await uploadImages()
            }

            // 2. Submit data
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const res = await fetch('/api/accommodations', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...formData,
                    amenities: selectedAmenities,
                    images: finalImageUrls
                })
            })

            if (res.ok) {
                const isAutoApproved = user?.role === 'admin'
                toast.success(isAutoApproved ? "Listing published!" : "Listing submitted for approval")
                router.push("/accommodations")
            } else {
                const data = await res.json()
                toast.error(data.error || data.message || "Failed to submit listing")
            }
        } catch (error) {
            console.error("DEBUG FETCH ERROR:", error)
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <main className="flex-1 py-12">
                    <div className="container mx-auto px-4 max-w-3xl">

                        <Link href="/accommodations" className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-all mb-8 font-black uppercase tracking-[0.2em] text-[10px] group bg-white px-6 py-3 rounded-full shadow-lg border border-slate-50">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Directory
                        </Link>

                        <div className="mb-10 text-center">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                                List Your Property
                            </h1>
                        </div>

                        {user?.role !== 'admin' && (
                            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] mb-10 flex items-start gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-slate-100">
                                    <Info className="h-6 w-6 text-secondary" />
                                </div>
                                <div className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                    <strong className="text-slate-900 block mb-1 not-italic font-black uppercase tracking-widest text-[10px]">Verification Protocol</strong>
                                    For community security, all new accommodation listings are manually reviewed by an Admin before they appear publicly.
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
                            <div className="bg-slate-900 p-10 text-white relative overflow-hidden group">
                                <div className="absolute -right-8 -bottom-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
                                    <Building2 className="h-40 w-40" />
                                </div>
                                <h3 className="text-2xl font-black relative z-10 tracking-tight text-white uppercase">Property Details</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10 mt-2">Please provide accurate information about your listing</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">

                                {/* Basic Info */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                        <div className="h-2 w-10 bg-secondary rounded-full" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Basic Information</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 space-y-3">
                                            <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Property Name *</Label>
                                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Sunrise Girls Hostel" className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700 placeholder:text-slate-300" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Tenant Rule *</Label>
                                            <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)} required>
                                                <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700">
                                                    <SelectValue placeholder="Select Rule" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                                    <SelectItem value="Boys" className="font-bold py-3">Boys Only</SelectItem>
                                                    <SelectItem value="Girls" className="font-bold py-3">Girls Only</SelectItem>
                                                    <SelectItem value="Co-ed" className="font-bold py-3">Co-ed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Location & Pricing */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                        <div className="h-2 w-10 bg-secondary rounded-full" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Location & Pricing</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">City *</Label>
                                            <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Mumbai" className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700 placeholder:text-slate-300" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Local Area / Landmark *</Label>
                                            <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Andheri West" className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700 placeholder:text-slate-300" required />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Pricing Estimate (per month) *</Label>
                                        <Input name="pricing" value={formData.pricing} onChange={handleChange} placeholder="e.g., ₹8,000 - ₹12,000" className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700 placeholder:text-slate-300" required />
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                        <div className="h-2 w-10 bg-secondary rounded-full" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Amenities</h3>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select all available facilities</p>

                                    <div className="flex flex-wrap gap-3">
                                        {AMENITIES_LIST.map(amenity => (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`px-8 py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all border-2 ${selectedAmenities.includes(amenity)
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.05]'
                                                    : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description & Contact */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                        <div className="h-2 w-10 bg-slate-900 rounded-full" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Description & Contact</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Property Description *</Label>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the rooms, rules, nearby facilities..."
                                            className="min-h-[160px] rounded-[2.5rem] border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 py-8 font-bold text-slate-600 leading-relaxed resize-none placeholder:text-slate-300"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Owner Contact Number *</Label>
                                            <Input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} placeholder="+91" className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700 placeholder:text-slate-300" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-slate-900 font-black text-xs uppercase tracking-widest ml-1">Owner Email Address</Label>
                                            <Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="owner@example.com" className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-secondary/20 focus:border-secondary px-8 font-bold text-slate-700 placeholder:text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                        <div className="h-2 w-10 bg-secondary rounded-full" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Photos</h3>
                                    </div>

                                    <div className="mt-1 flex justify-center px-6 pt-16 pb-16 border-4 border-slate-100 border-dashed rounded-[3rem] bg-slate-50/50 hover:bg-white hover:border-secondary transition-all cursor-pointer group">
                                        <div className="space-y-6 text-center">
                                            <div className="h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-900/5 border border-slate-50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <UploadCloud className="h-10 w-10 text-secondary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-black text-slate-900">Upload Property Images</p>
                                                <div className="flex text-sm text-slate-400 font-bold justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer text-slate-900 hover:text-secondary underline underline-offset-4 transition-colors">
                                                        <span>Upload new images</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-[10px] text-slate-300 font-black mt-2 uppercase tracking-widest">PNG, JPG up to 10MB (Max 5 photos)</p>
                                            </div>
                                        </div>

                                        {imageUrls.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
                                                {imageUrls.map((url, i) => (
                                                    <div key={i} className="relative h-32 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md">
                                                        <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-24 bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white rounded-[2.5rem] text-2xl font-black shadow-2xl shadow-slate-900/10 transition-all uppercase tracking-[0.2em] active:scale-[0.98]" disabled={isLoading}>
                                    {isLoading ? (
                                        <><Loader2 className="mr-3 h-8 w-8 animate-spin" /> Saving Protocol... </>
                                    ) : (
                                        <><Building2 className="mr-4 h-8 w-8" /> Commit Changes</>
                                    )}
                                </Button>

                            </form>
                        </div>

                    </div>
                </main>
                <Footer />
            </div >
        </AuthGuard>
    )
}
