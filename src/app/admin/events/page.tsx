"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Trash2, Edit, CheckCircle, XCircle, Search, Loader2, MapPin, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useAuth } from "@/lib/auth-context"

import { Badge } from "@/components/ui/badge"

interface AdminEvent {
    id: string
    title: string
    date: string
    location: string
    status: 'pending' | 'approved' | 'rejected' | 'deleted'
    organizer: {
        name: string
        email: string
    }
}

export default function AdminEventsPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'deleted' | null

    const [events, setEvents] = useState<AdminEvent[]>([])
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

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })
            const token = await getToken()
            const res = await fetch(`/api/admin/events?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error("Failed to fetch events")
            const data = await res.json()
            setEvents(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load events",
                variant: "destructive",
            })
            setEvents([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleAction = async (ids: string | string[], status: "approved" | "rejected") => {
        const targetIds = Array.isArray(ids) ? ids : [ids]

        try {
            const token = await getToken()
            await Promise.all(targetIds.map(id =>
                fetch(`/api/admin/events/${id}`, {
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
                description: targetIds.length > 1
                    ? `Successfully updated ${targetIds.length} events`
                    : `Event ${status} successfully`,
            })

            setSelectedIds([])
            fetchEvents() // Refresh list
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: `Failed to update event status`,
                variant: "destructive",
            })
        }
    }

    const handleDeleteClick = (id: string) => {
        setConfirmProps({
            isOpen: true,
            title: "Delete Event",
            description: "Are you sure you want to delete this event? This action cannot be undone.",
            id
        })
    }

    const executeDelete = async () => {
        const id = confirmProps.id
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })

            if (!res.ok) throw new Error("Failed to delete event")

            toast({
                title: "Success",
                description: "Event deleted successfully",
            })

            fetchEvents()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete event",
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
        if (selectedIds.length === events.length && events.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(events.map(e => e.id))
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('en-IN', options)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                        Event <span className="text-slate-400">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and manage community events.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex gap-1 overflow-x-auto custom-scrollbar w-full lg:w-auto p-1 whitespace-nowrap">
                    {['pending', 'approved', 'rejected', 'deleted'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status as any)
                                setCurrentPage(1)
                            }}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                statusFilter === status
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            {status === 'approved' ? 'Active Listings' : status}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full lg:w-auto pr-2">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <Input
                            placeholder="Search events..."
                            className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            <p className="font-bold text-sm">Events Selected</p>
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
                            <Calendar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-900/20" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                            <Calendar className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">List Empty</h3>
                        <p className="text-slate-500 font-medium mt-2">No events found in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/80 backdrop-blur-sm">
                                    <th className="pl-8 pr-4 py-6 w-16">
                                        <Checkbox
                                            checked={selectedIds.length === events.length && events.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                        />
                                    </th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Event Details</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Timeline & Location</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Organizer</th>
                                    <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Status</th>
                                    <th className="pl-6 pr-8 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {events.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        className={cn(
                                            "group transition-all duration-300",
                                            selectedIds.includes(event.id) ? "bg-slate-900/[0.02]" : "hover:bg-slate-50/50"
                                        )}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="pl-8 pr-4 py-6">
                                            <Checkbox
                                                checked={selectedIds.includes(event.id)}
                                                onCheckedChange={() => toggleSelect(event.id)}
                                                className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                            />
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight group-hover:text-slate-600 transition-colors">
                                                    {event.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg w-fit">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                                                        {formatDate(event.date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-slate-400">
                                                    <MapPin className="h-3 w-3 mr-1.5 text-slate-300" />
                                                    <span className="text-xs font-bold">{event.location}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{event.organizer?.name || "Anonymous User"}</span>
                                                <span className="text-[11px] font-medium text-slate-400">{event.organizer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge
                                                className={cn(
                                                    "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border-0 shadow-sm",
                                                    event.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                        event.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-600'
                                                )}
                                            >
                                                {event.status}
                                            </Badge>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    target="_blank"
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Audit Event</span>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                    onClick={() => handleDeleteClick(event.id)}
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
