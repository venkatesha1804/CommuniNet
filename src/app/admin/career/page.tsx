"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, CheckCircle, XCircle, Briefcase, GraduationCap, UserCheck, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useAuth } from "@/lib/auth-context"

type CareerType = "jobs" | "scholarships" | "mentorship"
type StatusFilter = "pending" | "approved" | "rejected" | "deleted"

interface CareerItem {
    id: string
    title?: string
    company?: string
    expertise?: string
    amount?: string
    status: string
    createdAt: string
    poster?: { name: string | null; email: string }
    mentor?: { name: string | null; email: string; location: string | null }
}

export default function AdminCareerPage() {
    const searchParams = useSearchParams()
    const initialType = searchParams.get('type') as CareerType | null
    const initialStatus = searchParams.get('status') as StatusFilter | null

    const [activeType, setActiveType] = useState<CareerType>(initialType || "jobs")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus || "pending")
    const [searchTerm, setSearchTerm] = useState("")
    const [items, setItems] = useState<CareerItem[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { toast } = useToast()
    const { getToken } = useAuth()

    // Modal State
    const [confirmProps, setConfirmProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        id: string;
        action: 'delete' | 'status';
        status?: StatusFilter;
    }>({
        isOpen: false,
        title: "",
        description: "",
        id: "",
        action: 'delete'
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    const fetchItems = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                type: activeType,
                status: statusFilter,
                page: currentPage.toString(),
                limit: limit.toString(),
                ...(searchTerm && { search: searchTerm })
            })
            const token = await getToken()
            const res = await fetch(`/api/admin/career?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(`Failed to fetch career items: ${res.status} ${errorData.message || res.statusText}`)
            }
            const data = await res.json()
            setItems(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error("Failed to fetch career items", error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(fetchItems, 300)
        setSelectedIds([])
        return () => clearTimeout(timeoutId)
    }, [activeType, statusFilter, searchTerm, currentPage])

    const handleAction = async (ids: string | string[], status: "approved" | "rejected") => {
        const targetIds = Array.isArray(ids) ? ids : [ids]
        setActionLoading(targetIds.length === 1 ? targetIds[0] : 'bulk')

        try {
            const token = await getToken()
            await Promise.all(targetIds.map(id =>
                fetch("/api/admin/career", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ id, type: activeType, status })
                })
            ))

            toast({
                title: "Success",
                description: targetIds.length > 1
                    ? `Bulk ${status} completed for ${targetIds.length} items`
                    : `${activeType.slice(0, -1)} ${status} successfully`,
            })

            // Refresh list (fetchItems will be called or we manually trigger)
            fetchItems()
            setSelectedIds([])
        } catch (error) {
            console.error("Action failed", error)
            toast({
                title: "Error",
                description: "Failed to perform action",
                variant: "destructive"
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteClick = (id: string) => {
        setConfirmProps({
            isOpen: true,
            title: `Delete ${activeType.slice(0, -1)}`,
            description: `Are you sure you want to delete this ${activeType.slice(0, -1)}? This action cannot be undone.`,
            id,
            action: 'delete'
        })
    }

    const executeDelete = async () => {
        const id = confirmProps.id
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            setActionLoading(id)
            const token = await getToken()
            const res = await fetch(`/api/admin/career?id=${id}&type=${activeType}`, {
                method: "DELETE",
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })

            if (!res.ok) throw new Error("Failed to delete item")

            toast({
                title: "Success",
                description: "Item deleted successfully",
            })

            fetchItems()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete item",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length && items.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(items.map(i => i.id))
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getItemLabel = (item: CareerItem) => {
        if (activeType === "jobs") return item.title || "Job"
        if (activeType === "scholarships") return item.title || "Scholarship"
        return item.expertise || "Mentor"
    }

    const getItemDetails = (item: CareerItem) => {
        if (activeType === "jobs") return item.company || ""
        if (activeType === "scholarships") return item.amount || ""
        return item.mentor?.name || ""
    }

    const getPoster = (item: CareerItem) => {
        if (activeType === "mentorship") return item.mentor?.email || ""
        return item.poster?.email || ""
    }

    const typeTabs = [
        { id: "jobs" as CareerType, label: "Jobs", icon: Briefcase },
        { id: "scholarships" as CareerType, label: "Scholarships", icon: GraduationCap },
        { id: "mentorship" as CareerType, label: "Mentorship", icon: UserCheck },
    ]

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                        Career <span className="text-slate-400">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and manage career-related postings from the community.</p>
                </div>
            </div>

            {/* Two-Tier Filters and Navigation */}
            <div className="space-y-6">
                {/* Primary Tier: activeType */}
                <div className="flex gap-2 overflow-x-auto custom-scrollbar p-1 pb-2 whitespace-nowrap">
                    {typeTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveType(tab.id);
                                setSearchTerm("");
                                setCurrentPage(1);
                                if (tab.id === 'scholarships') setStatusFilter('approved');
                            }}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                                activeType === tab.id
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105"
                                    : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 shadow-sm"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeType === tab.id ? "text-slate-400" : "text-slate-300")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Secondary Tier: statusFilter and Search */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50 backdrop-blur-sm p-3 rounded-[2rem] border border-slate-200/60 shadow-sm">
                    <div className="flex gap-2 p-1 overflow-x-auto custom-scrollbar w-full lg:w-auto whitespace-nowrap">
                        {((activeType === 'scholarships' ? ["approved", "deleted"] : ["pending", "approved", "deleted"]) as StatusFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200",
                                    statusFilter === s
                                        ? "bg-slate-100 text-slate-900 shadow-inner"
                                        : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                {s} requests
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-80 group pr-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder={`Search ${activeType}...`}
                            className="pl-11 h-11 bg-white border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                            <p className="font-bold text-sm">{activeType.charAt(0).toUpperCase() + activeType.slice(1, -1)}s Selected</p>
                            <p className="text-white/50 text-xs">Bulk Operations Available</p>
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
                            disabled={actionLoading === 'bulk'}
                        >
                            Reject Selection
                        </Button>
                        <Button
                            className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 rounded-xl shadow-lg transition-transform active:scale-95"
                            onClick={() => handleAction(selectedIds, 'approved')}
                            disabled={actionLoading === 'bulk'}
                        >
                            {actionLoading === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Approve Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                            <Briefcase className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-900/20" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading list...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                            <Briefcase className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">List Empty</h3>
                        <p className="text-slate-500 font-medium mt-2">No items found in this section.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/80 backdrop-blur-sm">
                                    <th className="pl-8 pr-4 py-6 w-16">
                                        <Checkbox
                                            checked={selectedIds.length === items.length && items.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                        />
                                    </th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Core Details</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">
                                        {activeType === "jobs" ? "Organization" : activeType === "scholarships" ? "Grant/Criteria" : "Expertise"}
                                    </th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Contributor</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Timeline</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Status</th>
                                    <th className="pl-6 pr-8 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={cn(
                                            "group transition-all duration-300",
                                            selectedIds.includes(item.id) ? "bg-slate-900/[0.02]" : "hover:bg-slate-50/50"
                                        )}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="pl-8 pr-4 py-6">
                                            <Checkbox
                                                checked={selectedIds.includes(item.id)}
                                                onCheckedChange={() => toggleSelect(item.id)}
                                                className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                            />
                                        </td>
                                        <td className="px-6 py-6 font-bold text-slate-900">
                                            <div className="flex flex-col max-w-[250px]">
                                                <span className="truncate group-hover:text-slate-600 transition-colors uppercase tracking-tight text-sm font-black">
                                                    {getItemLabel(item)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide w-fit shadow-sm">
                                                {getItemDetails(item)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{item.poster?.name || item.mentor?.name || 'Anonymous User'}</span>
                                                <span className="text-[11px] font-medium text-slate-400">{getPoster(item)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-xs font-bold text-slate-500">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge
                                                className={cn(
                                                    "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border-0 shadow-sm",
                                                    item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                        item.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-600'
                                                )}
                                            >
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                {statusFilter === "pending" && activeType !== 'scholarships' && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleAction(item.id, "approved")}
                                                        >
                                                            {actionLoading === item.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Approve</span>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 rounded-xl text-amber-600 hover:bg-amber-50 transition-all"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleAction(item.id, "rejected")}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="sr-only">Reject</span>
                                                        </Button>
                                                    </>
                                                )}
                                                <Link
                                                    href={
                                                        activeType === 'jobs' ? `/career/jobs/${item.id}` :
                                                            activeType === 'scholarships' ? `/career/scholarships/${item.id}` :
                                                                `/career/mentorship/${item.id}`
                                                    }
                                                    target="_blank"
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Audit Record</span>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    disabled={!!actionLoading}
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
