"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2, Handshake } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth-context"
import type { Collaboration } from "@/app/business/collaboration/page"

export default function AdminCollaborationPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const [collaborations, setCollaborations] = useState<Collaboration[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>(initialStatus || 'pending')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Auth context handles standard fetch wrapping, 
    // but the API also uses Next cookies/headers under the hood
    const { toast } = useToast()
    const { getToken } = useAuth()

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

    const fetchCollaborations = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })

            const token = await getToken()
            const res = await fetch(`/api/business/collaboration?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error("Failed to fetch collaborations")

            const data = await res.json()
            setCollaborations(data.collaborations)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load collaborations",
                variant: "destructive",
            })
            setCollaborations([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCollaborations()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleAction = async (userIds: string | string[], status: "approved" | "rejected") => {
        const ids = Array.isArray(userIds) ? userIds : [userIds]

        try {
            const token = await getToken()
            await Promise.all(ids.map(id =>
                fetch(`/api/business/collaboration/${id}`, {
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
                    ? `Successfully updated ${ids.length} collaborations`
                    : `Collaboration ${status} successfully`,
            })

            setSelectedIds([])
            fetchCollaborations() // Refresh list
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: `Failed to update status`,
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
        if (selectedIds.length === collaborations.length && collaborations.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(collaborations.map(c => c.id))
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase flex items-center gap-3">
                        <Handshake className="h-10 w-10 md:h-12 md:w-12 text-slate-900" strokeWidth={2.5} />
                        Collaboration <span className="text-slate-400">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and verify partnership requests from the community.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex gap-1 overflow-x-auto custom-scrollbar w-full lg:w-auto p-1 whitespace-nowrap">
                    {[
                        { id: 'pending' as const, label: 'Pending Review' },
                        { id: 'approved' as const, label: 'Approved' },
                        { id: 'rejected' as const, label: 'Rejected' },
                    ].map((tab) => (
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
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
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
                            placeholder="Search collaborations..."
                            className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-slate-900 text-white px-8 py-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between sticky top-6 z-50 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-top-8 duration-500">
                    <div className="flex items-center gap-6 mb-4 sm:mb-0">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl border border-white/10">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="font-black text-xl uppercase tracking-tighter leading-none">Selection Active</p>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Execute systemic batch operations</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            className="flex-1 sm:flex-none text-white hover:bg-white/10 font-bold uppercase tracking-widest px-6 h-12 rounded-xl"
                            onClick={() => setSelectedIds([])}
                        >
                            Dismiss
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-rose-500/20"
                            onClick={() => handleAction(selectedIds, 'rejected')}
                        >
                            Batch Reject
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/20"
                            onClick={() => handleAction(selectedIds, 'approved')}
                        >
                            Bulk Approve
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
                            <Handshake className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-900/20" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading list...</p>
                    </div>
                ) : collaborations.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                            <Handshake className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">List Empty</h3>
                        <p className="text-slate-500 font-medium mt-2">No items found in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/80 backdrop-blur-sm">
                                    <th className="pl-8 pr-4 py-6 w-12">
                                        <Checkbox
                                            checked={selectedIds.length === collaborations.length && collaborations.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                        />
                                    </th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Collaboration Details</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Type</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Posted By</th>
                                    <th className="pl-6 pr-8 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {collaborations.map((collab: any, index: number) => (
                                    <tr
                                        key={collab.id}
                                        className={cn(
                                            "group transition-all duration-300",
                                            selectedIds.includes(collab.id) ? "bg-slate-50" : "hover:bg-slate-50/50"
                                        )}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="pl-8 pr-4 py-6">
                                            <Checkbox
                                                checked={selectedIds.includes(collab.id)}
                                                onCheckedChange={() => toggleSelect(collab.id)}
                                                className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                            />
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight group-hover:text-slate-600 transition-colors">
                                                    {collab.title}
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-400 line-clamp-1 max-w-xs">{collab.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest px-3 py-1 border-0 shadow-sm">
                                                {collab.partnershipType}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{collab.author?.name || "Independent"}</span>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">{collab.author?.location || "Remote"}</span>
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link
                                                    href={`/business/collaboration/${collab.id}`}
                                                    target="_blank"
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
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
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
