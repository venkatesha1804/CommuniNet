"use client"

import { useState, useEffect } from "react"
import { Building2, CheckCircle, XCircle, Trash2, MapPin, Eye, Search, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"

type Accommodation = {
    id: string
    name: string
    type: string
    gender: string
    location: string
    city: string
    pricing: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    owner: {
        id: string
        name: string
        email: string
    }
}

export default function AdminAccommodationsPage() {
    const { getToken } = useAuth()
    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchAccommodations()
    }, [statusFilter])

    const fetchAccommodations = async () => {
        setIsLoading(true)
        try {
            const url = statusFilter === 'all'
                ? '/api/admin/accommodations'
                : `/api/admin/accommodations?status=${statusFilter}`

            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(url, { headers })
            if (res.ok) {
                const data = await res.json()
                setAccommodations(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load listings")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/admin/accommodations?id=${id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success(`Listing ${newStatus} successfully`)
                fetchAccommodations() // refresh
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error updating status")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this listing?")) return

        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/admin/accommodations?id=${id}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                toast.success("Listing deleted")
                fetchAccommodations()
            } else {
                toast.error("Failed to delete listing")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting listing")
        }
    }

    const filteredAccommodations = accommodations.filter(acc =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.city.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                        Accommodation <span className="text-slate-400">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and manage community housing listings.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex gap-1 overflow-x-auto custom-scrollbar w-full lg:w-auto p-1 whitespace-nowrap">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 capitalize",
                                statusFilter === status
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full lg:w-auto pr-2">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Search listings..."
                            className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                            <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-900/20" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Directory...</p>
                    </div>
                ) : filteredAccommodations.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                            <Building2 className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Results</h3>
                        <p className="text-slate-500 font-medium mt-2">No accommodation listings matches your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/80 backdrop-blur-sm">
                                    <th className="pl-8 pr-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Property Details</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Ownership</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Geography</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Status</th>
                                    <th className="pl-6 pr-8 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAccommodations.map((acc, index) => (
                                    <tr
                                        key={acc.id}
                                        className="group transition-all duration-300 hover:bg-slate-50/50"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="pl-8 pr-6 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight group-hover:text-slate-600 transition-colors">
                                                    {acc.name}
                                                </span>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="bg-slate-100 font-black text-[9px] uppercase tracking-widest px-2 py-0 h-4 border-0">
                                                        {acc.type}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-slate-100 font-black text-[9px] uppercase tracking-widest px-2 py-0 h-4 border-0">
                                                        {acc.gender === 'boys' ? 'Male Only' : acc.gender === 'girls' ? 'Female Only' : 'Unisex'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{acc.owner?.name || "Anonymous User"}</span>
                                                <span className="text-[11px] font-medium text-slate-400">{acc.owner?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-lg w-fit shadow-sm">
                                                <MapPin className="h-3 w-3 mr-1.5 text-slate-300" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{acc.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge
                                                className={cn(
                                                    "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border-0 shadow-sm",
                                                    acc.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                        acc.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-600'
                                                )}
                                            >
                                                {acc.status}
                                            </Badge>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                {acc.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleStatusChange(acc.id, 'approved')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="sr-only">Approve</span>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 rounded-xl text-amber-600 hover:bg-amber-50"
                                                            onClick={() => handleStatusChange(acc.id, 'rejected')}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="sr-only">Reject</span>
                                                        </Button>
                                                    </>
                                                )}
                                                {acc.status !== 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                                                        onClick={() => handleStatusChange(acc.id, 'pending')}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Revert</span>
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    onClick={() => handleDelete(acc.id)}
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
        </div>
    )
}
