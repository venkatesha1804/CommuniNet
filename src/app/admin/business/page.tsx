"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, X, MapPin, Phone, Loader2, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Search, Trash2, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useAuth } from "@/lib/auth-context"

interface Business {
    id: string
    name: string
    owner: {
        name: string | null
        email: string | null
    }
    category: string
    city: string | null
    description: string
    contact: string | null
    status: 'pending' | 'approved' | 'rejected' | 'deleted'
}

export default function AdminBusinessPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'deleted' | null

    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'deleted'>(initialStatus || 'approved')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { toast } = useToast()
    const { getToken } = useAuth()

    // Modal State
    const [confirmProps, setConfirmProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        id: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        id: ""
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchQuery])

    const fetchBusinesses = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })

            const token = await getToken()
            const res = await fetch(`/api/admin/business?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error("Failed to fetch businesses")

            const data = await res.json()
            setBusinesses(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load businesses",
                variant: "destructive",
            })
            setBusinesses([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBusinesses()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleAction = async (userIds: string | string[], status: "approved" | "rejected") => {
        const ids = Array.isArray(userIds) ? userIds : [userIds]

        try {
            const token = await getToken()
            await Promise.all(ids.map(id =>
                fetch(`/api/admin/business/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ status })
                })
            ))

            toast({
                title: "Success",
                description: ids.length > 1
                    ? `Successfully updated ${ids.length} businesses`
                    : `Business ${status} successfully`,
            })

            setSelectedIds([])
            fetchBusinesses() // Refresh list
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: `Failed to update business status`,
                variant: "destructive",
            })
        }
    }

    const handleDeleteClick = (id: string) => {
        setConfirmProps({
            isOpen: true,
            title: "Delete Business",
            description: "Are you sure you want to delete this business? This action cannot be undone.",
            id
        })
    }

    const executeDelete = async () => {
        const id = confirmProps.id
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/business/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })

            if (!res.ok) throw new Error("Failed to delete business")

            toast({
                title: "Success",
                description: "Business deleted successfully",
            })

            fetchBusinesses()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete business",
                variant: "destructive",
            })
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === businesses.length && businesses.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(businesses.map(b => b.id))
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                        Business <span className="text-slate-400">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and manage community business listings.</p>
                </div>
            </div>

            {/* Filters and Navigation */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60">
                <div className="flex gap-1 overflow-x-auto custom-scrollbar w-full lg:w-auto p-1 whitespace-nowrap">
                    {[
                        { id: 'pending' as const, label: 'Pending Verification' },
                        { id: 'approved' as const, label: 'Active Listings' },
                        { id: 'rejected' as const, label: 'Rejected' },
                        { id: 'deleted' as const, label: 'Deleted' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setStatusFilter(tab.id)
                                setCurrentPage(1)
                            }}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                statusFilter === tab.id
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full lg:w-auto pr-2">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Search businesses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 z-50 border border-white/10 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">
                            {selectedIds.length}
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="font-bold text-sm">Businesses Selected</p>
                            <p className="text-white/50 text-xs">Bulk Management Active</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10 font-bold px-6 rounded-xl"
                            onClick={() => setSelectedIds([])}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-bold px-6 rounded-xl"
                            onClick={() => handleAction(selectedIds, 'rejected')}
                        >
                            Reject Selection
                        </Button>
                        <Button
                            className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 rounded-xl shadow-lg transition-transform active:scale-95"
                            onClick={() => handleAction(selectedIds, 'approved')}
                        >
                            Approve Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                            <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-900/20" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading businesses...</p>
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                            <Building2 className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">List Empty</h3>
                        <p className="text-slate-500 font-medium mt-2">No business listings found in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/80 backdrop-blur-sm">
                                    <th className="pl-8 pr-4 py-6 w-16">
                                        <Checkbox
                                            checked={selectedIds.length === businesses.length && businesses.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                        />
                                    </th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Identity & Contact</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Meta Information</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Ownership</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Status</th>
                                    <th className="pl-6 pr-8 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {businesses.map((business, index) => (
                                    <tr
                                        key={business.id}
                                        className={cn(
                                            "group transition-all duration-300",
                                            selectedIds.includes(business.id) ? "bg-slate-900/[0.02]" : "hover:bg-slate-50/50"
                                        )}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="pl-8 pr-4 py-6">
                                            <Checkbox
                                                checked={selectedIds.includes(business.id)}
                                                onCheckedChange={() => toggleSelect(business.id)}
                                                className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                            />
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-slate-900 text-base leading-tight group-hover:text-slate-600 transition-colors">
                                                    {business.name}
                                                </span>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                        <Phone className="h-2.5 w-2.5" />
                                                        {business.contact || 'No Contact'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className="bg-white border border-slate-200 text-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit shadow-sm">
                                                    {business.category}
                                                </span>
                                                {business.city && (
                                                    <span className="text-xs text-slate-500 flex items-center font-bold">
                                                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-300" />
                                                        {business.city}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm border-2 border-white shadow-sm uppercase">
                                                    {business.owner.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{business.owner.name || 'Anonymous User'}</span>
                                                    <span className="text-[11px] font-medium text-slate-400">{business.owner.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge
                                                className={cn(
                                                    "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border-0 shadow-sm",
                                                    business.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                        business.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-600'
                                                )}
                                            >
                                                {business.status === 'pending' ? 'Verification Required' : business.status}
                                            </Badge>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link
                                                    href={`/business/${business.id}`}
                                                    target="_blank"
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Audit Listing</span>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold"
                                                    onClick={() => handleDeleteClick(business.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Purge</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                    <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmProps.isOpen}
                onClose={() => setConfirmProps(prev => ({ ...prev, isOpen: false }))}
                onConfirm={executeDelete}
                title={confirmProps.title}
                description={confirmProps.description}
                variant="destructive"
                confirmText="Purge Record"
            />
        </div>
    )
}
