"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Share2, MapPin, Building2, Phone, Mail, ArrowLeft, Loader2, Info, ShieldCheck, User, Wind, Wifi, Coffee, Calendar, Edit, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

type Accommodation = {
    id: string
    name: string
    type: 'Hostel'
    gender: 'Boys' | 'Girls' | 'Co-ed'
    location: string
    city: string
    amenities: string[]
    pricing: string
    description: string
    images: string[]
    contactPhone: string
    contactEmail?: string
    isGuestView: boolean
    createdAt: string
    owner: {
        id: string
        name: string
        profileImage: string
    }
}

type AccommodationApp = {
    id: string
    name: string
    age: string
    occupation: string
    message: string | null
    status: string
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        mobile: string
        profileImage: string | null
    }
    familyMember?: {
        id: string
        name: string
        relationship: string
    } | null
}

const AMENITY_ICONS: Record<string, any> = {
    'AC': <Wind className="h-4 w-4" />,
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Food': <Coffee className="h-4 w-4" />,
}

export default function AccommodationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const [acc, setAcc] = useState<Accommodation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [activeImage, setActiveImage] = useState(0)

    // Application state
    const [applications, setApplications] = useState<AccommodationApp[]>([])
    const [isApplyOpen, setIsApplyOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [applyForm, setApplyForm] = useState({ name: '', age: '', occupation: '', message: '', familyMemberId: '' })


    useEffect(() => {
        const fetchAcc = async () => {
            try {
                const token = await getToken()
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`

                const res = await fetch(`/api/accommodations/${params.id}`, { headers })
                if (res.ok) {
                    const data = await res.json()
                    setAcc(data)
                    fetchApplications(data.owner.id)
                } else {
                    router.push('/accommodations')
                }
            } catch (error) {
                console.error("Failed to fetch accommodation:", error)
                router.push('/accommodations')
            } finally {
                setIsLoading(false)
            }
        }

        const fetchApplications = async (ownerId: string) => {
            if (!user) return
            // Fetch apps only if owner or admin
            if (user.id === ownerId || user.role === 'admin') {
                try {
                    const token = await getToken()
                    const res = await fetch(`/api/accommodations/${params.id}/applications`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (res.ok) {
                        const data = await res.json()
                        setApplications(data)
                    }
                } catch (error) {
                    console.error("Failed to fetch applications:", error)
                }
            }
        }

        if (params.id) {
            fetchAcc()
        }
    }, [params.id, router, user, getToken])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this listing?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/accommodations/${params.id}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                toast.success("Listing deleted successfully")
                router.push('/accommodations')
            } else {
                toast.error("Failed to delete listing")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting listing")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return toast.error("Please login to apply")
        setIsSubmitting(true)

        try {
            const token = await getToken()
            const res = await fetch(`/api/accommodations/${params.id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(applyForm)
            })

            const data = await res.json()
            if (res.ok) {
                toast.success("Application submitted successfully!")
                setIsApplyOpen(false)
                setApplications(prev => [{ ...data, user }, ...prev])
                setApplyForm({ name: '', age: '', occupation: '', message: '', familyMemberId: '' })
            } else {
                toast.error(data.error || "Failed to submit application")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStatusUpdate = async (appId: string, newStatus: string) => {
        try {
            const token = await getToken()
            const res = await fetch(`/api/accommodations/applications/${appId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success("Status updated")
                setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app))
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <Skeleton className="h-8 w-32 mb-8" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div><Skeleton className="h-[400px] w-full rounded-2xl" /></div>
                </div>
            </div>
        )
    }

    if (!acc) return null

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Back Button */}
                    <Link href="/accommodations" className="inline-flex items-center text-slate-500 hover:text-secondary transition-all mb-8 font-semibold group bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Directory
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content (Left) */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Image Gallery Header */}
                            <div className="relative h-[350px] sm:h-[450px] md:h-[550px] rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/50 border border-white group">
                                {acc.images && acc.images.length > 0 ? (
                                    <Image
                                        src={acc.images[activeImage]}
                                        alt={acc.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <Building2 className="h-20 w-20 text-slate-200" />
                                    </div>
                                )}

                                {/* Image Count Overlay */}
                                {acc.images && acc.images.length > 1 && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xl text-white px-6 py-2 rounded-full text-xs font-bold tracking-wider">
                                        {activeImage + 1} / {acc.images.length}
                                    </div>
                                )}

                                {/* Tags overlay */}
                                <div className="absolute top-6 right-6 flex flex-col gap-3">
                                    <Badge className="bg-secondary text-slate-900 hover:bg-secondary/90 border-none shadow-xl text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
                                        {acc.type}
                                    </Badge>
                                    <Badge className={
                                        acc.gender === 'Girls' ? 'bg-pink-500 text-white px-4 py-2 text-xs font-black rounded-full uppercase tracking-widest' :
                                            acc.gender === 'Boys' ? 'bg-blue-500 text-white px-4 py-2 text-xs font-black rounded-full uppercase tracking-widest' :
                                                'bg-slate-900 text-white px-4 py-2 text-xs font-black rounded-full uppercase tracking-widest'
                                    }>
                                        {acc.gender}
                                    </Badge>
                                </div>
                            </div>

                            {/* Thumbnail Bar */}
                            {acc.images && acc.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {acc.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative h-24 w-32 rounded-[1.5rem] overflow-hidden flex-shrink-0 border-4 transition-all duration-300 ${activeImage === idx ? 'border-secondary scale-105 shadow-lg shadow-secondary/20' : 'border-white hover:border-slate-200'
                                                }`}
                                        >
                                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Title & Basics */}
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                            {acc.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-500 font-bold">
                                            <div className="flex items-center px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                                                <MapPin className="h-4 w-4 mr-2 text-secondary" />
                                                {acc.location}, {acc.city}
                                            </div>
                                            <div className="flex items-center text-sm px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                                                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                                {new Date(acc.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {(user?.id === acc.owner.id || user?.role === 'admin') && (
                                            <>
                                                <Link href={`/accommodations/${acc.id}/edit`} className="flex-1 md:flex-none">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full h-12 border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white px-6 rounded-2xl font-bold transition-all"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1 md:flex-none h-12 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none px-6 rounded-2xl font-bold transition-all"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </>
                                        )}
                                        <Button variant="outline" size="icon" className="rounded-full shrink-0 h-12 w-12 text-slate-400 hover:text-secondary hover:border-secondary transition-all border-slate-200">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-wider">About this Property</h2>
                                        <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                            {acc.description}
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider">Amenities</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {acc.amenities.map(amenity => (
                                                <div key={amenity} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-secondary/20 hover:bg-white transition-all">
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm border border-slate-100 group-hover:text-secondary transition-colors">
                                                        {AMENITY_ICONS[amenity] || <Info className="h-5 w-5" />}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Applications Mini Dashboard for Owner */}
                            {(user?.id === acc.owner.id || user?.role === 'admin') && (
                                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Applications</h2>
                                        <Badge className="bg-secondary/20 text-secondary border-none px-4 py-1 rounded-full font-black">{applications.length}</Badge>
                                    </div>
                                    {applications.length === 0 ? (
                                        <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold">No applications received yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {applications.map(app => (
                                                <div key={app.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white group transition-all duration-300">
                                                    <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
                                                        <div className="flex gap-4">
                                                            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm">
                                                                {app.user.profileImage ? (
                                                                    <Image src={app.user.profileImage} alt={app.user.name || app.name} width={56} height={56} className="object-cover h-full w-full" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center font-black bg-slate-900 text-white text-xl">
                                                                        {(app.user?.name || app.name || 'U')[0].toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <p className="font-black text-slate-900 text-lg">
                                                                        {app.familyMember ? app.familyMember.name : (app.name || app.user?.name || 'Applicant')}
                                                                    </p>
                                                                    {app.familyMember && (
                                                                        <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                                                                            Family ({app.familyMember.relationship})
                                                                        </Badge>
                                                                    )}
                                                                    <Badge className={
                                                                        app.status === 'approved' ? 'bg-green-500 text-white border-none font-bold' :
                                                                            app.status === 'rejected' ? 'bg-red-500 text-white border-none font-bold' :
                                                                                'bg-secondary text-slate-900 border-none font-bold'
                                                                    }>
                                                                        {app.status}
                                                                    </Badge>
                                                                </div>
                                                                {app.familyMember && (
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                                        Applied by: <span className="text-slate-600">{app.user?.name || 'User'}</span>
                                                                    </p>
                                                                )}
                                                                <p className="text-sm text-slate-500 font-bold">Age: <span className="text-slate-900">{app.age}</span> • Occupation: <span className="text-slate-900">{app.occupation}</span></p>
                                                                <div className="flex gap-4 pt-2">
                                                                    <span className="flex items-center text-xs font-bold text-slate-400"><Mail className="h-3 w-3 mr-1" /> {app.user.email}</span>
                                                                    <span className="flex items-center text-xs font-bold text-slate-400"><Phone className="h-3 w-3 mr-1" /> {app.user.mobile}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <Button size="sm" onClick={() => handleStatusUpdate(app.id, 'approved')} className="bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white rounded-xl font-bold px-6 h-10 transition-colors flex-1 sm:flex-none">Approve</Button>
                                                                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(app.id, 'rejected')} className="text-red-600 hover:bg-red-50 border-red-100 rounded-xl font-bold px-6 h-10 flex-1 sm:flex-none">Reject</Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {app.message && <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-100 italic text-slate-600 font-medium">"{app.message}"</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar (Right) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-8">

                                {/* Pricing Card */}
                                <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem]">
                                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden group">
                                        <div className="absolute -right-8 -bottom-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
                                            <Building2 className="h-40 w-40" />
                                        </div>
                                        <p className="text-secondary text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10">Monthly Pricing</p>
                                        <h3 className="text-4xl font-black relative z-10 tracking-tight">{acc.pricing}</h3>
                                        <p className="text-slate-400 text-xs mt-3 font-bold relative z-10">*Contact for current availability</p>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="space-y-6">
                                            <h4 className="font-black text-slate-900 uppercase tracking-wider text-sm">Listed By</h4>
                                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm">
                                                    {acc.owner.profileImage ? (
                                                        <Image src={acc.owner.profileImage} alt={acc.owner.name} width={64} height={64} className="object-cover h-full w-full" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-white font-black bg-slate-900 text-2xl">
                                                            {acc.owner.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900">{acc.owner.name}</p>
                                                    <p className="text-xs text-secondary font-black uppercase tracking-widest mt-0.5">Verified Host</p>
                                                </div>
                                            </div>
                                        </div>

                                        {!authLoading && !isAuthenticated ? (
                                            <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-6">
                                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                                                    <ShieldCheck className="h-8 w-8 text-secondary" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-black text-slate-900">Protected View</h4>
                                                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                                                        Log in to view complete contact details and application instructions.
                                                    </p>
                                                </div>
                                                <Link href="/login" className="block">
                                                    <Button className="w-full h-14 bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all">
                                                        Login Now
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-secondary/20 hover:shadow-lg hover:shadow-secondary/5 transition-all group">
                                                        <div className="h-12 w-12 flex items-center justify-center bg-white text-secondary rounded-xl shrink-0 shadow-sm group-hover:bg-secondary group-hover:text-slate-900 transition-all">
                                                            <Phone className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phone Number</p>
                                                            <p className="font-black text-slate-900 text-lg">{acc.contactPhone}</p>
                                                        </div>
                                                    </div>

                                                    {acc.contactEmail && (
                                                        <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-secondary/20 hover:shadow-lg hover:shadow-secondary/5 transition-all group">
                                                            <div className="h-12 w-12 flex items-center justify-center bg-white text-slate-900 rounded-xl shrink-0 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                                <Mail className="h-5 w-5" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email Address</p>
                                                                <p className="font-black text-slate-900 truncate">{acc.contactEmail}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-[10px] text-center text-slate-400 font-bold mt-6 px-4">
                                                    COMMUNET VERIFIED • AS A SAFETY PRECAUTION, ALWAYS VISIT THE PROPERTY BEFORE MAKING ANY PAYMENTS.
                                                </p>

                                                {/* Apply Now Button */}
                                                {user?.id !== acc.owner.id && user?.role !== 'admin' && (
                                                    <div className="mt-6">
                                                        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button className="w-full h-16 bg-secondary hover:bg-slate-900 text-slate-900 hover:text-white rounded-2xl text-xl font-black shadow-xl shadow-secondary/20 transition-all uppercase tracking-widest">
                                                                    Apply Now
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 border-none bg-white shadow-2xl">
                                                                <DialogHeader className="mb-8">
                                                                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Hostel Application</DialogTitle>
                                                                    <p className="text-slate-500 font-bold pt-2">Send your application to <span className="text-secondary">{acc.name}</span></p>
                                                                </DialogHeader>
                                                                <form onSubmit={handleApply} className="space-y-6">
                                                                    {/* Application Type Selector */}
                                                                    <div className="space-y-2">
                                                                        <Label className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Apply For</Label>
                                                                        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setApplyForm({
                                                                                        ...applyForm,
                                                                                        familyMemberId: '',
                                                                                        name: user?.name || '',
                                                                                        age: '',
                                                                                        occupation: ''
                                                                                    })
                                                                                }}
                                                                                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!applyForm.familyMemberId ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                                                            >
                                                                                Myself
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (user?.familyMembers && user.familyMembers.length > 0) {
                                                                                        const first = user.familyMembers[0]
                                                                                        setApplyForm({
                                                                                            ...applyForm,
                                                                                            familyMemberId: first.id,
                                                                                            name: first.name,
                                                                                            age: first.dob ? (new Date().getFullYear() - new Date(first.dob).getFullYear()).toString() : '',
                                                                                            occupation: first.occupation || ''
                                                                                        })
                                                                                    } else {
                                                                                        toast.error("No family members found", {
                                                                                            description: "Please add family members in your profile settings first."
                                                                                        })
                                                                                    }
                                                                                }}
                                                                                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${applyForm.familyMemberId ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                                            >
                                                                                Family Member
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {applyForm.familyMemberId && user?.familyMembers && (
                                                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                            <Label htmlFor="familyMember" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Choose Family Member</Label>
                                                                            <select
                                                                                id="familyMember"
                                                                                value={applyForm.familyMemberId}
                                                                                onChange={(e) => {
                                                                                    const member = user.familyMembers?.find(m => m.id === e.target.value)
                                                                                    if (member) {
                                                                                        setApplyForm({
                                                                                            ...applyForm,
                                                                                            familyMemberId: member.id,
                                                                                            name: member.name,
                                                                                            age: member.dob ? (new Date().getFullYear() - new Date(member.dob).getFullYear()).toString() : '',
                                                                                            occupation: member.occupation || ''
                                                                                        })
                                                                                    }
                                                                                }}
                                                                                className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold appearance-none cursor-pointer"
                                                                            >
                                                                                {user.familyMembers.map(m => (
                                                                                    <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    )}

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="name" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                                                        <Input id="name" required value={applyForm.name} onChange={e => setApplyForm({ ...applyForm, name: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold" placeholder="Rahul Kumar" />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="age" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Age</Label>
                                                                            <Input id="age" type="number" required value={applyForm.age} onChange={e => setApplyForm({ ...applyForm, age: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold" placeholder="21" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="occupation" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Occupation</Label>
                                                                            <Input id="occupation" required value={applyForm.occupation} onChange={e => setApplyForm({ ...applyForm, occupation: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 font-bold" placeholder="Student" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="message" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Message (Optional)</Label>
                                                                        <Textarea id="message" value={applyForm.message} onChange={e => setApplyForm({ ...applyForm, message: e.target.value })} className="min-h-[120px] rounded-3xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-secondary/20 px-6 py-4 font-bold resize-none" placeholder="Tell the owner a bit about yourself..." />
                                                                    </div>
                                                                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white rounded-2xl font-black text-lg mt-4 transition-all uppercase tracking-widest">
                                                                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Submit Application"}
                                                                    </Button>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
