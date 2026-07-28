"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    UserCheck,
    Loader2,
    Trash2,
    Eye
} from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth-context"

interface User {
    id: string
    name: string
    email: string
    mobile: string
    gotra: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
}

export default function AdminUsersPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>(initialStatus || 'pending')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
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

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })

            const token = await getToken()
            const res = await fetch(`/api/admin/users?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error("Failed to fetch users")

            const data = await res.json()
            // Backend now returns { data: [], pagination: {} }
            // But we need to handle if it was legacy array during migration (unlikely if dev updated)
            // The type is implicit, assume new structure.
            setUsers(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            })
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleVerification = async (userIds: string | string[], status: 'approved' | 'rejected') => {
        const ids = Array.isArray(userIds) ? userIds : [userIds]

        try {
            const token = await getToken()
            await Promise.all(ids.map(id =>
                fetch(`/api/admin/users/${id}`, {
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
                    ? `Successfully updated ${ids.length} users`
                    : `User ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            })

            setSelectedIds([])
            fetchUsers()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to update user status",
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
        if (selectedIds.length === users.length && users.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(users.map(u => u.id))
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        User <span className="text-secondary">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg md:text-xl uppercase tracking-widest text-[10px] md:text-xs">Manage community members and access levels</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100 pb-2 w-full">
                <div className="flex gap-4 md:gap-8 overflow-x-auto custom-scrollbar w-full lg:w-auto pb-2 whitespace-nowrap">
                    {[
                        { id: 'pending' as const, label: 'Pending Review' },
                        { id: 'approved' as const, label: 'Approved Users' },
                        { id: 'rejected' as const, label: 'Rejected Users' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setStatusFilter(tab.id)
                                setCurrentPage(1)
                            }}
                            className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 shrink-0 ${statusFilter === tab.id
                                ? "text-slate-900 border-secondary"
                                : "text-slate-400 border-transparent hover:text-slate-900"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-96 mb-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                        placeholder="Search by name, email or mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-secondary/40 text-[11px] font-bold uppercase tracking-widest"
                    />
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-slate-900 text-white px-8 py-6 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] flex flex-col md:flex-row items-center justify-between sticky top-24 z-50 border border-slate-800 mt-10 animate-in fade-in slide-in-from-top-6 duration-500 lg:mx-4">
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                        <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-slate-900 text-2xl font-black shadow-xl shadow-secondary/10">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="font-black text-xl uppercase tracking-tight leading-none">Bulk <span className="text-secondary">Actions</span></p>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">Updating multiple users at once</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl"
                            onClick={() => setSelectedIds([])}
                        >
                            Abort
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl transition-all duration-300"
                            onClick={() => handleVerification(selectedIds, 'rejected')}
                        >
                            Reject Selected
                        </Button>
                        <Button
                            className="bg-secondary text-slate-900 hover:bg-white font-black uppercase tracking-widest text-[10px] px-10 py-6 rounded-2xl shadow-xl shadow-secondary/20 transition-all duration-300"
                            onClick={() => handleVerification(selectedIds, 'approved')}
                        >
                            Approve Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Users List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
                </div>
            ) : users.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No users found</h3>
                        <p className="text-muted-foreground">There are no users in this category.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.05)] overflow-hidden">
                    <div className="max-h-[700px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50/50 backdrop-blur-md text-slate-400 border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 md:px-8 py-6 w-10 shrink-0">
                                        <Checkbox
                                            checked={selectedIds.length === users.length && users.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="rounded-md"
                                        />
                                    </th>
                                    <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">User Name</th>
                                    <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Contact Info</th>
                                    <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Gotra</th>
                                    <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Joined Date</th>
                                    <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Status</th>
                                    <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((user) => (
                                    <tr key={user.id} className={cn(
                                        "transition-all duration-300 group",
                                        selectedIds.includes(user.id) ? "bg-secondary/5" : "hover:bg-slate-50/50"
                                    )}>
                                        <td className="px-6 md:px-8 py-6">
                                            <Checkbox
                                                checked={selectedIds.includes(user.id)}
                                                onCheckedChange={() => toggleSelect(user.id)}
                                                className="rounded-md"
                                            />
                                        </td>
                                        <td className="px-6 md:px-8 py-6 font-black text-slate-900 uppercase tracking-tight text-sm md:text-base group-hover:text-secondary transition-colors">
                                            {user.name || 'Anonymous User'}
                                        </td>
                                        <td className="px-6 md:px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 uppercase tracking-widest text-[10px] md:text-xs">{user.email}</span>
                                                <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{user.mobile || 'No signal'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                {user.gotra || 'Unspecified'}
                                            </span>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-slate-400 font-bold text-xs">
                                            {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                                        </td>
                                        <td className="px-6 md:px-8 py-6">
                                            <Badge
                                                className={cn(
                                                    "rounded-xl px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm border",
                                                    user.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        user.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                )}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-right">
                                            {statusFilter === 'pending' && (
                                                <div className="flex justify-end gap-2 translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                                        onClick={() => handleVerification(user.id, 'approved')}
                                                    >
                                                        <CheckCircle className="mr-2 h-3.5 w-3.5" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl"
                                                        onClick={() => handleVerification(user.id, 'rejected')}
                                                    >
                                                        <XCircle className="mr-2 h-3.5 w-3.5" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {statusFilter !== 'pending' && (
                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/members/${user.id}`}
                                                        target="_blank"
                                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[9px] font-black uppercase tracking-widest transition-all h-8 px-4 text-slate-400 hover:text-secondary hover:bg-slate-900 gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Profile
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    )
}
