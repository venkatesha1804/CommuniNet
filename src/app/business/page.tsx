"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Filter, Plus, Loader2, Briefcase, ShieldCheck, Mail, Phone, Info } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

interface Business {
    id: string
    name: string
    category: string
    city: string | null
    description: string
    images: string[]
    status: string
    contact?: string | null
    owner?: {
        name: string
        email: string
    }
}

export default function BusinessDirectoryPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const [filter, setFilter] = useState<'all' | 'mine'>('all')
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (selectedCategory !== "All") params.append("category", selectedCategory)
                if (searchTerm) params.append("search", searchTerm)
                if (filter === 'mine') params.append('filter', 'mine')
                params.append("page", currentPage.toString())
                params.append("limit", "15")

                const res = await fetch(`/api/business?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    // Handle both new structure and potential legacy structure fallback
                    if (data.pagination) {
                        setBusinesses(data.businesses)
                        setTotalPages(data.pagination.pages)
                    } else {
                        // Fallback if API hasn't updated or returns array
                        setBusinesses(Array.isArray(data) ? data : [])
                        setTotalPages(1)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch businesses", error)
            } finally {
                setLoading(false)
            }
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchBusinesses()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchTerm, selectedCategory, currentPage, filter])

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedCategory, filter])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const categories = ["All", "Retail", "Jewellery", "Technology", "Food", "Textiles", "Logistics", "Other"]

    const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl -mt-64 -mr-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-slate-400/5 rounded-full blur-3xl -mb-64 -ml-64 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-8 md:py-16">

                    {/* Header Section */}
                    <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-6 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 uppercase tracking-wider font-bold h-8 px-4 rounded-full">
                            <Briefcase className="mr-2 h-4 w-4" /> Verified Enterprises
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-black text-slate-900 mb-4 tracking-tight">
                            Business <span className="text-secondary">Directory</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
                            Discover trusted community businesses. Grow your network and support verified enterprises.
                        </p>

                        {isAuthenticated && (
                            <Button
                                className="h-14 px-8 bg-slate-900 hover:bg-secondary text-white font-bold rounded-2xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 text-base"
                                onClick={() => {
                                    if (user?.status === 'approved' || user?.role === 'admin') {
                                        router.push("/business/add")
                                    } else {
                                        toast.error("Action Restricted", {
                                            description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                        })
                                    }
                                }}
                            >
                                <Plus className="mr-2 h-5 w-5" /> Add Your Business
                            </Button>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-[2.5rem] border-transparent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] sticky top-24">
                                <h2 className="font-sans text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-secondary" /> Filter Search
                                </h2>

                                <div className="space-y-6">
                                    {/* Search */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 mb-2 block">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Business or city..."
                                                className="pl-9 border-slate-200 focus-visible:ring-secondary h-11 rounded-xl shadow-sm"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 mb-2 block">Category</label>
                                        <select
                                            className="w-full h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm bg-white shadow-sm px-3"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* My Listings Toggle */}
                                    {user && (
                                        <div className="pt-2">
                                            <button
                                                onClick={() => setFilter(filter === 'mine' ? 'all' : 'mine')}
                                                className={cn(
                                                    "w-full py-3 h-12 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2",
                                                    filter === 'mine'
                                                        ? "bg-slate-900 text-white border-transparent shadow-md"
                                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"
                                                )}
                                            >
                                                <Briefcase className="h-4 w-4" />
                                                {filter === 'mine' ? "Showing My Posts" : "Show My Posts Only"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <div className="grid sm:grid-cols-2 gap-8">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] h-[450px]">
                                            <div className="h-56 bg-slate-100 animate-pulse" />
                                            <div className="p-8 space-y-4">
                                                <div className="h-8 w-3/4 bg-slate-100 animate-pulse rounded-lg" />
                                                <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-lg" />
                                                <div className="h-20 w-full bg-slate-100 animate-pulse rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="grid sm:grid-cols-2 gap-8 pb-4">
                                        {businesses.map((business) => (
                                            <Link href={`/business/${business.id}`} key={business.id} className="group">
                                                <Card className="h-full overflow-hidden border-transparent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-500 bg-white flex flex-col group-hover:-translate-y-2 rounded-[2.5rem] px-0">
                                                    {/* Image Box */}
                                                    <div className="relative h-56 w-full bg-slate-50 overflow-hidden">
                                                        <Image
                                                            src={business.images && business.images.length > 0 ? business.images[0] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800'}
                                                            alt={business.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />

                                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                                            <Badge className="bg-white/90 text-slate-900 border-none hover:bg-white font-bold shadow-xl backdrop-blur-md rounded-full px-4 h-8">
                                                                {business.category}
                                                            </Badge>
                                                            {business.status === 'approved' && (
                                                                <Badge className="bg-emerald-500 text-white border-none flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 rounded-full px-4 h-8">
                                                                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                                                                </Badge>
                                                            )}
                                                            {business.status === 'pending' && (
                                                                <Badge className="bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20 rounded-full px-4 h-8">
                                                                    Pending Review
                                                                </Badge>
                                                            )}
                                                            {business.status === 'deleted_by_admin' && (
                                                                <Badge variant="destructive" className="bg-red-500 text-white border-none shadow-lg shadow-red-500/20 rounded-full px-4 h-8">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-8 flex-1 flex flex-col">
                                                        <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                                                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-secondary" />
                                                            <span className="line-clamp-1">{business.city || "Global Community"}</span>
                                                        </div>

                                                        <h3 className="text-2xl font-sans font-black text-slate-900 mb-3 group-hover:text-secondary transition-colors line-clamp-1 tracking-tight">
                                                            {business.name}
                                                        </h3>

                                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8 flex-1 font-medium">
                                                            {business.description}
                                                        </p>

                                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {business.owner ? (
                                                                    <>
                                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-bold border border-slate-200">
                                                                            {business.owner.name[0]}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Enterprise Head</p>
                                                                            <p className="text-sm font-bold truncate text-slate-900">{business.owner.name}</p>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-[10px] text-secondary font-black tracking-widest bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 uppercase">
                                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                                        Global Trusted
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <ShareButton
                                                                    url={`/business/${business.id}`}
                                                                    title={business.name}
                                                                    description={`${business.category} • ${business.city || 'India'}`}
                                                                    details={`🏢 *${business.name}*\nCategory: ${business.category}\nLocation: ${business.city || 'India'}\n\n${business.description.substring(0, 300)}...`}
                                                                    className="h-10 w-10 p-0 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center justify-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>

                                    {businesses.length === 0 && (
                                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                                            <Briefcase className="h-20 w-20 text-slate-100 mx-auto mb-6" />
                                            <h3 className="text-2xl font-sans font-black text-slate-900 mb-2">No enterprises found</h3>
                                            <p className="text-slate-500 max-w-sm mx-auto font-medium">
                                                Try adjusting your filters or search criteria.
                                            </p>
                                        </div>
                                    )}

                                    {totalPages > 1 && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                            className="mt-12"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    )
}
