"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Search, Users, ShieldCheck, Mail, Phone, Wifi, Coffee, Wind, Info, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
    owner: {
        id: string
        name: string
        profileImage: string
    }
    status: 'approved' | 'pending' | 'rejected'
}

const AMENITY_ICONS: Record<string, any> = {
    'AC': <Wind className="h-4 w-4" />,
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Food': <Coffee className="h-4 w-4" />,
}

export default function AccommodationsPage() {
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const router = useRouter()

    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showMyOnly, setShowMyOnly] = useState(false)

    // Filters
    const [searchCity, setSearchCity] = useState("")
    const [selectedType, setSelectedType] = useState<string>("all")
    const [selectedGender, setSelectedGender] = useState<string>("all")

    useEffect(() => {
        fetchAccommodations()
    }, [selectedType, selectedGender, showMyOnly])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => fetchAccommodations(), 500)
        return () => clearTimeout(timer)
    }, [searchCity])

    const fetchAccommodations = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchCity) params.append('city', searchCity)
            if (selectedType !== 'all') params.append('type', selectedType)
            if (selectedGender !== 'all') params.append('gender', selectedGender)
            if (showMyOnly) params.append('ownerOnly', 'true')

            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/accommodations?${params.toString()}`, { headers })
            if (res.ok) {
                const data = await res.json()
                setAccommodations(data)
            }
        } catch (error) {
            console.error("Failed to fetch accommodations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] selection:bg-secondary/20">
            <Navbar />
            <main className="flex-1 pb-24">
                {/* Header Hero */}
                <div className="bg-white border-b border-slate-100 pt-16 pb-20 mb-12">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
                            <Building2 className="h-4 w-4 text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Verified Housing</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                            Trusted <span className="text-secondary">Hostels</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10">
                            Find safe, comfortable, and community-trusted accommodations. Listed directly by CommuNet verified members.
                        </p>

                        {isAuthenticated && (
                            <Button
                                className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                onClick={() => {
                                    if (user?.status === 'approved' || user?.role === 'admin') {
                                        router.push("/accommodations/add")
                                    } else {
                                        toast.error("Action Restricted", {
                                            description: "Verification Pending. Your account is currently under review by our community administrators."
                                        })
                                    }
                                }}
                            >
                                List Your Property
                            </Button>
                        )}
                    </div>
                </div>

                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Desktop Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 ml-1">
                                Preferences
                            </h3>

                            <div className="space-y-8">
                                {/* City Search */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block ml-1">City Location</label>
                                    <div className="relative group">
                                        <Input
                                            placeholder="Mumbai, Pune..."
                                            value={searchCity}
                                            onChange={(e) => setSearchCity(e.target.value)}
                                            className="h-12 pl-11 bg-slate-50 border-slate-100 rounded-2xl focus-visible:ring-secondary focus-visible:bg-white transition-all font-bold text-sm"
                                        />
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-secondary transition-colors" />
                                    </div>
                                </div>

                                {/* Gender Filter */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block ml-1">Tenant Rules</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['all', 'Boys', 'Girls', 'Co-ed'].map((gender) => (
                                            <button
                                                key={gender}
                                                onClick={() => setSelectedGender(gender)}
                                                className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGender === gender
                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                    }`}
                                            >
                                                {gender}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* My Listings Toggle */}
                                {isAuthenticated && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => setShowMyOnly(!showMyOnly)}
                                            className={`w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${showMyOnly
                                                ? 'bg-secondary border-secondary text-slate-900 shadow-xl shadow-secondary/20'
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
                                                }`}
                                        >
                                            <Building2 className="h-4 w-4" />
                                            {showMyOnly ? "My Assets" : "Own Assets Only"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-secondary/5 rounded-[2rem] border border-secondary/10 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="h-5 w-5 text-secondary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Safety First</span>
                            </div>
                            <p className="text-[10px] font-bold text-secondary/70 leading-relaxed uppercase tracking-wider">
                                All properties are verified by community moderators for safety and quality standards.
                            </p>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <div className="relative">
                                    <Loader2 className="h-16 w-16 animate-spin text-secondary/20" />
                                    <Loader2 className="h-16 w-16 animate-spin text-secondary absolute inset-0 [animation-delay:-0.5s]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Scanning Housing...</p>
                            </div>
                        ) : accommodations.length === 0 ? (
                            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-20 text-center">
                                <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-8">
                                    <Building2 className="h-12 w-12 text-slate-200" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">No Shelters Found</h3>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                                    Try adjusting your filters or search criteria. More listings are being verified every day.
                                </p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-8">
                                {accommodations.map((acc) => (
                                    <Link href={`/accommodations/${acc.id}`} key={acc.id} className="group">
                                        <Card className="h-full overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/30 hover:shadow-secondary/10 transition-all duration-500 bg-white flex flex-col rounded-[2.5rem] group-hover:-translate-y-2">
                                            {/* Image Box */}
                                            <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                                                {acc.images && acc.images.length > 0 ? (
                                                    <Image
                                                        src={acc.images[0]}
                                                        alt={acc.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                                                        <Building2 className="h-12 w-12 text-slate-800" />
                                                    </div>
                                                )}

                                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                                    <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                                                        {acc.type}
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${acc.gender === 'Girls' ? 'bg-pink-500/80' :
                                                        acc.gender === 'Boys' ? 'bg-blue-500/80' :
                                                            'bg-purple-500/80'
                                                        }`}>
                                                        {acc.gender}
                                                    </div>

                                                    {acc.status !== 'approved' && (
                                                        <div className="px-3 py-1 rounded-full bg-secondary text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                            {acc.status}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price Tag */}
                                                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl font-black shadow-2xl border border-white/10">
                                                    <span className="text-[10px] uppercase tracking-widest text-slate-400">INR</span>
                                                    <span className="text-lg tracking-tighter">{acc.pricing}</span>
                                                </div>
                                            </div>

                                            <CardContent className="p-8 flex-1 flex flex-col">
                                                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-secondary transition-colors tracking-tight line-clamp-1">
                                                    {acc.name}
                                                </h3>

                                                <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
                                                    <MapPin className="h-3.5 w-3.5 mr-2 text-secondary" />
                                                    <span className="line-clamp-1">{acc.city || acc.location}</span>
                                                </div>

                                                {/* Amenities Mini-list */}
                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    {acc.amenities.slice(0, 3).map(amenity => (
                                                        <span key={amenity} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100/50 text-slate-500 px-3 py-1.5 rounded-xl">
                                                            {AMENITY_ICONS[amenity] || <Info className="h-3 w-3" />} {amenity}
                                                        </span>
                                                    ))}
                                                    {acc.amenities.length > 3 && (
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-1.5 ">
                                                            +{acc.amenities.length - 3}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-slate-50">
                                                    {/* Contact Preview logic */}
                                                    {!authLoading && !isAuthenticated ? (
                                                        <div className="flex items-center justify-between bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                                    <ShieldCheck className="h-4 w-4 text-secondary" />
                                                                </div>
                                                                <span className="text-[10px] text-secondary font-black uppercase tracking-widest">
                                                                    Data Locked
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Login</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                                {acc.owner.profileImage ? (
                                                                    <Image src={acc.owner.profileImage} alt={acc.owner.name} width={40} height={40} className="object-cover h-full w-full" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm font-black bg-slate-50">
                                                                        {acc.owner.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Host</p>
                                                                <p className="text-sm font-black truncate text-slate-900 tracking-tight">{acc.owner.name}</p>
                                                            </div>
                                                            <div className="h-10 px-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl group-hover:bg-secondary group-hover:text-slate-900 transition-all shadow-lg shadow-slate-900/10">
                                                                View
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
