"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Globe, Clock, ArrowLeft, Star, Loader2, Share2, Shield, Calendar, Edit, Trash2, Info, Building2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface BusinessDetail {
    id: string
    name: string
    category: string
    city: string | null
    address: string | null
    description: string
    images: string[]
    contact: string | null
    website: string | null
    status: string
    owner: {
        name: string | null
        email: string | null
    }
}

export default function BusinessDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const id = params.id as string

    const [business, setBusiness] = useState<BusinessDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch(`/api/business/${id}`)
                if (!res.ok) {
                    throw new Error("Business not found")
                }
                const data = await res.json()
                setBusiness(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBusiness()
        }
    }, [id])

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.email === business?.owner?.email
    const isDeletedByAdmin = business?.status === 'deleted_by_admin'

    const [activeImage, setActiveImage] = useState(0)

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !business) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-slate-900">Business Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-4">The business you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/business")} variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">
                        Return to Directory
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    if (isDeletedByAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-100 p-6 rounded-[2.5rem] mb-6 border border-slate-200/50 shadow-sm">
                        <Shield className="h-16 w-16 text-slate-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-sans font-black text-slate-900 mb-4 tracking-tight">Listing Unavailable</h1>
                    <p className="text-xl text-slate-500 italic max-w-2xl mb-12 leading-relaxed">
                        This business listing has been deleted by an administrator for violating community guidelines.
                    </p>
                    <Link href="/business">
                        <Button className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 px-10 h-16 text-lg rounded-[1.5rem] font-bold shadow-xl transition-all">
                            Back to Directory
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Back Button */}
                    <Link href="/business" className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors mb-6 font-black uppercase tracking-[0.2em] text-[10px] group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Directory
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content (Left) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Image Gallery Header */}
                            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-50 group">
                                <Image
                                    src={business.images && business.images.length > 0 ? business.images[activeImage] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200'}
                                    alt={business.name}
                                    fill
                                    className="object-contain transition-transform duration-700"
                                    priority
                                />

                                {/* Image Count Overlay */}
                                {business.images && business.images.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                                        {activeImage + 1} / {business.images.length}
                                    </div>
                                )}

                                {/* Tags overlay */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-md shadow-lg text-xs font-bold px-4 py-1.5 rounded-full">
                                        {business.category}
                                    </Badge>
                                    {business.status === 'approved' && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 text-sm flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" /> Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Bar */}
                            {business.images && business.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {business.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative h-20 w-28 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImage === idx ? 'border-secondary' : 'border-transparent hover:border-slate-200'
                                                }`}
                                        >
                                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-contain bg-slate-50" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Title & Basics */}
                            <div>
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-slate-900 leading-none tracking-tight">
                                        {business.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        {(user?.email === business.owner.email || isAdmin) && (
                                            <>
                                                <Link href={`/business/${business.id}/edit`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0 h-10 border-slate-200 text-slate-600 hover:bg-slate-50 px-4 rounded-xl font-bold"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="shrink-0 h-10 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none px-4 rounded-xl"
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to delete this listing?")) {
                                                            try {
                                                                const token = await getToken()
                                                                const delHeaders: Record<string, string> = {}
                                                                if (token) delHeaders['Authorization'] = `Bearer ${token}`
                                                                const res = await fetch(`/api/business/${business.id}`, { method: 'DELETE', headers: delHeaders })
                                                                if (res.ok) {
                                                                    router.push('/business')
                                                                } else {
                                                                    alert("Failed to delete business")
                                                                }
                                                            } catch (e) {
                                                                console.error(e)
                                                                alert("An error occurred")
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </>
                                        )}
                                        <ShareButton
                                            url={`/business/${business.id}`}
                                            title={business.name}
                                            variant="button"
                                            size="sm"
                                            className="rounded-xl shrink-0 h-10 px-4 bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 border-none font-bold"
                                            description={`🏢 *${business.name}*\nCategory: ${business.category}\nLocation: ${business.city || 'India'}\n\n${business.description}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-600 font-medium">
                                    <div className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-3 text-secondary" />
                                        {business.address ? `${business.address}, ` : ''}{business.city || "India"}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Description */}
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-wider">About the Enterprise</h2>
                                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                    {business.description}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">

                                {/* Contact Card */}
                                <Card className="border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white overflow-hidden rounded-[3rem] border border-slate-50">
                                    <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="h-24 w-24" /></div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 relative z-10">Business Category</p>
                                        <h3 className="text-2xl font-sans font-black relative z-10">{business.category}</h3>
                                    </div>

                                    <CardContent className="p-6">
                                        <h4 className="font-bold text-gray-900 mb-4">Contact Person</h4>

                                        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xl shrink-0 border border-slate-200/50">
                                                {business.owner?.name?.[0] || 'B'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{business.owner?.name || "Business Owner"}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Community Member</p>
                                            </div>
                                        </div>

                                        {!isAuthenticated ? (
                                            <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-[2rem]">
                                                <ShieldCheck className="h-12 w-12 text-secondary mx-auto mb-4" />
                                                <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tight">Access Restricted</h4>
                                                <p className="text-sm text-slate-500 mb-8 text-center italic font-medium leading-relaxed">
                                                    For the safety of our members, contact information is only visible to logged-in community members.
                                                </p>
                                                <Link href="/login" className="w-full">
                                                    <Button className="w-full bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white rounded-2xl h-14 font-black shadow-lg">
                                                        Login to View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {business.contact && (
                                                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white hover:border-gold/30 transition-colors">
                                                        <div className="h-10 w-10 flex items-center justify-center bg-green-50 text-green-600 rounded-full shrink-0">
                                                            <Phone className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                                                            <p className="font-bold text-gray-900">{business.contact}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {business.owner?.email && (
                                                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all cursor-default">
                                                        <div className="h-11 w-11 flex items-center justify-center bg-white text-slate-400 rounded-xl shrink-0 shadow-sm border border-slate-100">
                                                            <Mail className="h-5 w-5" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email Address</p>
                                                            <p className="font-bold text-slate-700 truncate">{business.owner.email}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                                                    By contacting the owner, you agree to CommuNet's Guidelines.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
