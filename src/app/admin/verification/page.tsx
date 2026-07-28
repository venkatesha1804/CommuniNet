"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Check, X, Building2, Home, Calendar, Briefcase, HandHeart, CheckCircle2, CheckCircle, XCircle, Mail, Eye, Flag, Trash2, ShieldAlert, PlusCircle, Users } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useAuth } from "@/lib/auth-context"

type VerificationTab = 'users' | 'jobs' | 'accommodations' | 'help' | 'support' | 'reports'

export default function ModerationCenter() {
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') as VerificationTab | null

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<VerificationTab>(initialTab || "users")

    // Data State
    const [items, setItems] = useState<any[]>([])
    const [counts, setCounts] = useState<Record<VerificationTab, number>>({
        users: 0,
        jobs: 0,
        accommodations: 0,
        help: 0,
        support: 0,
        reports: 0
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { getToken } = useAuth()

    // Modal State
    const [confirmProps, setConfirmProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: 'approved' | 'rejected' | 'deleted' | 'resolved';
        ids: string[];
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: 'approved',
        ids: []
    })

    const fetchCounts = async () => {
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const [userRes, jobRes, accRes, helpRes, supRes, repRes] = await Promise.all([
                fetch('/api/admin/users?status=pending&limit=1', { headers }),
                fetch('/api/admin/career?type=jobs&status=pending&limit=1', { headers }),
                fetch('/api/admin/accommodations?status=pending', { headers }),
                fetch('/api/admin/content?type=help&status=pending&limit=1', { headers }),
                fetch('/api/admin/support?status=open&limit=1', { headers }),
                fetch('/api/reports?status=open&limit=1', { headers })
            ])

            const [userData, jobData, accData, helpData, supData, repData] = await Promise.all([
                userRes.ok ? userRes.json() : { pagination: { total: 0 } },
                jobRes.ok ? jobRes.json() : { pagination: { total: 0 } },
                accRes.ok ? accRes.json() : [],
                helpRes.ok ? helpRes.json() : { pagination: { total: 0 } },
                supRes.ok ? supRes.json() : { pagination: { total: 0 } },
                repRes.ok ? repRes.json() : { pagination: { total: 0 } }
            ])

            setCounts({
                users: userData.pagination?.total || 0,
                jobs: jobData.pagination?.total || 0,
                accommodations: Array.isArray(accData) ? accData.length : 0,
                help: helpData.pagination?.total || 0,
                support: supData.pagination?.total || 0,
                reports: repData.pagination?.total || 0
            })
        } catch (error) {
            console.error("Failed to fetch counts", error)
        }
    }

    const fetchItems = async () => {
        setLoading(true)
        try {
            let endpoint = ""
            if (activeTab === 'users') endpoint = `/api/admin/users?status=pending`
            else if (activeTab === 'jobs') endpoint = `/api/admin/career?type=jobs&status=pending`
            else if (activeTab === 'accommodations') endpoint = `/api/admin/accommodations?status=pending`
            else if (activeTab === 'help') endpoint = `/api/admin/content?type=help&status=pending`
            else if (activeTab === 'support') endpoint = `/api/admin/support?status=open`
            else if (activeTab === 'reports') endpoint = `/api/reports?status=open`

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString()
            })

            const url = `${endpoint}&${params.toString()}`

            const token = await getToken()
            const fetchHeaders: Record<string, string> = {}
            if (token) fetchHeaders['Authorization'] = `Bearer ${token}`
            const res = await fetch(url, { headers: fetchHeaders })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(`Failed to fetch items: ${res.status} ${errorData.message || res.statusText}`)
            }

            const data = await res.json()

            // Accommodations API returns a flat array, not paginated
            if (activeTab === 'accommodations') {
                const accList = Array.isArray(data) ? data : (data.data || [])
                setItems(accList)
                setTotalPages(1)
                setCounts(prev => ({ ...prev, accommodations: accList.length }))
            } else {
                setItems(data.data || [])
                setTotalPages(data.pagination?.pages || 1)
                setCounts(prev => ({
                    ...prev,
                    [activeTab]: data.pagination?.total || 0
                }))
            }

        } catch (error) {
            console.error("Failed to fetch items", error)
            toast.error("Failed to load items")
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCounts()
    }, [])

    useEffect(() => {
        fetchItems()
        setSelectedIds([])
    }, [activeTab, currentPage])

    const handleAction = (ids: string | string[], action: 'approved' | 'rejected' | 'deleted' | 'resolved') => {
        const targetIds = Array.isArray(ids) ? ids : [ids]

        setConfirmProps({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Items`,
            description: `Are you sure you want to ${action} ${targetIds.length} item(s)? This action cannot be undone.`,
            action,
            ids: targetIds
        })
    }

    const executeAction = async () => {
        const { ids: targetIds, action } = confirmProps
        const type = activeTab
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            await Promise.all(targetIds.map(async (id) => {
                let endpoint = ""
                let body: any = {}
                let method = "PATCH"

                if (type === 'users') {
                    endpoint = `/api/admin/users/${id}`
                    body = { status: action === 'deleted' ? 'rejected' : action }
                } else if (type === 'jobs') {
                    if (action === 'deleted') {
                        method = "DELETE"
                        endpoint = `/api/admin/career?id=${id}&type=jobs`
                    } else {
                        endpoint = `/api/admin/career`
                        body = { id, type: 'jobs', status: action }
                    }
                } else if (type === 'accommodations') {
                    if (action === 'deleted') {
                        method = "DELETE"
                        endpoint = `/api/admin/accommodations?id=${id}`
                    } else {
                        method = "PATCH"
                        endpoint = `/api/admin/accommodations?id=${id}`
                        body = { status: action }
                    }
                } else if (type === 'help') {
                    if (action === 'deleted') {
                        method = "DELETE"
                        endpoint = `/api/admin/content?id=${id}&type=help`
                    } else {
                        endpoint = `/api/admin/content`
                        body = { id, type: 'help', status: action }
                    }
                } else if (type === 'support') {
                    endpoint = `/api/admin/support`
                    const statusMap = action === 'approved' ? 'resolved' : 'closed'
                    body = { id, status: statusMap }
                } else if (type === 'reports') {
                    if (action === 'deleted') {
                        // Special logic for reports: Delete the CONTENT, then resolve report
                        // We need to know content type from the item.
                        // But bulk action assumes same type? No, Reports list has mixed types.
                        // We can't easily bulk delete mixed content types unless we loop carefully.
                        // For now, let's assume 'deleted' action in Reports is ONLY for single item click, not bulk.
                        // Or if bulk, we fetch item first? No, we have items in state.
                        const item = items.find(i => i.id === id)
                        if (item) {
                            await deleteReportedContent(item)
                        }
                        // Then resolve report
                        endpoint = `/api/reports/${id}`
                        body = { status: 'resolved' }
                    } else {
                        // Dismiss/Resolve
                        endpoint = `/api/reports/${id}`
                        body = { status: 'dismissed' } // or resolved
                    }
                }

                if (method === 'DELETE') {
                    const token = await getToken()
                    const delHeaders: Record<string, string> = {}
                    if (token) delHeaders['Authorization'] = `Bearer ${token}`
                    return fetch(endpoint, { method, headers: delHeaders })
                }

                const token2 = await getToken()
                const patchHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
                if (token2) patchHeaders['Authorization'] = `Bearer ${token2}`
                return fetch(endpoint, {
                    method,
                    headers: patchHeaders,
                    body: JSON.stringify(body)
                })
            }))

            toast.success("Action completed successfully")
            setSelectedIds([])
            fetchItems()
            fetchCounts()
        } catch (error) {
            console.error("Action failed", error)
            toast.error("An error occurred")
        }
    }

    const deleteReportedContent = async (report: any) => {
        const { contentType, contentId } = report
        let endpoint = ""

        switch (contentType) {
            case 'business': endpoint = `/api/admin/business/${contentId}`; break;
            case 'event': endpoint = `/api/admin/events/${contentId}`; break;
            case 'job': endpoint = `/api/admin/career?id=${contentId}&type=jobs`; break;
            case 'scholarship': endpoint = `/api/admin/career?id=${contentId}&type=scholarships`; break;
            case 'mentorship': endpoint = `/api/admin/career?id=${contentId}&type=mentorship`; break;
            case 'accommodation': endpoint = `/api/admin/accommodations?id=${contentId}`; break;
            case 'achievement': endpoint = `/api/admin/content?id=${contentId}&type=achievements`; break;
            case 'help': endpoint = `/api/admin/content?id=${contentId}&type=help`; break;
        }

        if (endpoint) {
            const token = await getToken()
            const delHeaders: Record<string, string> = {}
            if (token) delHeaders['Authorization'] = `Bearer ${token}`
            await fetch(endpoint, { method: 'DELETE', headers: delHeaders })
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }
    const toggleSelectAll = () => {
        selectedIds.length === items.length ? setSelectedIds([]) : setSelectedIds(items.map(i => i.id))
    }
    const handlePageChange = (page: number) => setCurrentPage(page)

    const getItemDisplay = (item: any) => {
        if (activeTab === 'reports') {
            return {
                title: item.contentTitle || "Unknown Content",
                owner: item.reporter?.name || "Anonymous",
                ownerEmail: item.reporter?.email,
                description: `Reason: ${item.reason} ${item.details ? `(${item.details})` : ''} - [${item.contentType}]`
            }
        }
        if (activeTab === 'users') {
            return {
                title: item.name || "Unknown User",
                owner: "N/A",
                ownerEmail: item.email,
                description: `Mobile: ${item.mobile || 'N/A'}${item.gotra ? ` | Gotra: ${item.gotra}` : ''}`
            }
        }
        const title = item.name || item.title || item.expertise || item.subject || "Untitled"
        const owner = item.owner?.name || item.organizer?.name || item.poster?.name || item.user?.name || "Member"
        const ownerEmail = item.owner?.email || item.organizer?.email || item.poster?.email || item.user?.email
        const description = item.description || item.bio || item.body || item.message || ""
        return { title, owner, ownerEmail, description }
    }

    return (
        <div className="space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Moderation <span className="text-secondary">Hub</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-lg md:text-xl uppercase tracking-widest text-[10px] md:text-xs">Review and verify pending community content</p>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <Link href="/posts/create" className="flex-1 lg:flex-none">
                        <Button className="w-full bg-slate-900 text-secondary hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] py-6 px-8 rounded-2xl shadow-lg shadow-slate-900/20">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Post
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => { fetchItems(); fetchCounts(); }} className="border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] py-6 px-8 rounded-2xl hover:bg-slate-50">
                        Refresh Data
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as VerificationTab); setCurrentPage(1); }} className="w-full">
                <TabsList className="bg-white/50 backdrop-blur-xl border border-slate-100 w-full justify-start h-auto p-1.5 rounded-[2rem] gap-2 overflow-x-auto shadow-xl shadow-slate-200/40">
                    {[
                        { id: 'users', label: 'Members', icon: Users },
                        { id: 'jobs', label: 'Careers', icon: Briefcase },
                        { id: 'accommodations', label: 'Housing', icon: Home },
                        { id: 'help', label: 'Crisis aid', icon: HandHeart },
                        { id: 'support', label: 'Tickets', icon: Mail },
                        { id: 'reports', label: 'Shield', icon: ShieldAlert }
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="data-[state=active]:bg-slate-900 data-[state=active]:text-secondary data-[state=active]:shadow-lg rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all duration-500 hover:bg-slate-50 shadow-none whitespace-nowrap"
                        >
                            <tab.icon className="h-4 w-4 mr-2" strokeWidth={2.5} />
                            {tab.label}
                            <span className={cn("ml-2.5 text-[9px] px-2 py-0.5 rounded-full font-black", activeTab === tab.id ? "bg-secondary text-slate-900" : "bg-slate-100 text-slate-500")}>
                                {counts[tab.id as VerificationTab]}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="bg-slate-900 text-white px-8 py-6 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] flex flex-col md:flex-row items-center justify-between sticky top-24 z-50 border border-slate-800 mt-10 animate-in fade-in slide-in-from-top-6 duration-500 lg:mx-4">
                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-slate-900 text-2xl font-black shadow-xl shadow-secondary/10">{selectedIds.length}</div>
                            <div>
                                <p className="font-black text-xl uppercase tracking-tight leading-none">Bulk <span className="text-secondary">Actions</span></p>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">Updating multiple items at once</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl" onClick={() => setSelectedIds([])}>Abort</Button>

                            {activeTab !== 'reports' && (
                                <Button variant="destructive" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl transition-all duration-300" onClick={() => handleAction(selectedIds, 'rejected')}>Reject Selected</Button>
                            )}

                            {activeTab === 'reports' ? (
                                <Button className="bg-secondary text-slate-900 hover:bg-white font-black uppercase tracking-widest text-[10px] px-10 py-6 rounded-2xl shadow-xl shadow-secondary/20 transition-all duration-300" onClick={() => handleAction(selectedIds, 'resolved')}>Dismiss Selection</Button>
                            ) : (
                                <Button className="bg-secondary text-slate-900 hover:bg-white font-black uppercase tracking-widest text-[10px] px-10 py-6 rounded-2xl shadow-xl shadow-secondary/20 transition-all duration-300" onClick={() => handleAction(selectedIds, 'approved')}>Authorize All</Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.05)] overflow-hidden">
                        <div className="max-h-[700px] overflow-auto custom-scrollbar">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50/50 backdrop-blur-md text-slate-400 border-b border-slate-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 md:px-8 py-6 w-10 shrink-0"><Checkbox checked={selectedIds.length === items.length && items.length > 0} onCheckedChange={toggleSelectAll} className="rounded-md" /></th>
                                        <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Item Details</th>
                                        <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">{activeTab === 'reports' ? 'Reporter' : 'Posted By'}</th>
                                        <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Subject / Reason</th>
                                        <th className="px-6 md:px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-24 text-center"><div className="flex flex-col items-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-secondary/40" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading list...</p></div></td></tr>
                                    ) : items.length > 0 ? (
                                        items.map((item: any) => {
                                            const { title, owner, ownerEmail, description } = getItemDisplay(item)
                                            return (
                                                <tr key={item.id} className={cn("transition-all duration-300 group", selectedIds.includes(item.id) ? "bg-secondary/5" : "hover:bg-slate-50/50")}>
                                                    <td className="px-6 md:px-8 py-6"><Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} className="rounded-md" /></td>
                                                    <td className="px-6 md:px-8 py-6">
                                                        <span className="font-black text-slate-900 uppercase tracking-tight text-sm md:text-base group-hover:text-secondary transition-colors">{title}</span>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-900 uppercase tracking-widest text-[10px] md:text-xs">{owner}</span>
                                                            {ownerEmail && <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{ownerEmail}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-6 text-slate-600 min-w-[250px] md:min-w-[300px] max-w-[400px]">
                                                        <p className="line-clamp-2 text-xs md:text-sm font-medium italic leading-relaxed break-words opacity-70 group-hover:opacity-100 transition-opacity">"{description}"</p>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                                                            {activeTab === 'reports' ? (
                                                                <>
                                                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl" onClick={() => handleAction(item.id, 'resolved')}><CheckCircle className="h-3.5 w-3.5 mr-2" /> Dismiss</Button>
                                                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleAction(item.id, 'deleted')}><Trash2 className="h-3.5 w-3.5 mr-2" /> Purge</Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl" onClick={() => handleAction(item.id, 'approved')}><CheckCircle className="h-3.5 w-3.5 mr-2" /> Approve</Button>
                                                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleAction(item.id, 'rejected')}><XCircle className="h-3.5 w-3.5 mr-2" /> Reject</Button>
                                                                </>
                                                            )}
                                                        </div>
                                                        {activeTab !== 'support' && activeTab !== 'reports' && activeTab !== 'users' && (
                                                            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Link href={
                                                                    activeTab === 'jobs' ? `/career/jobs/${item.id}` :
                                                                        activeTab === 'accommodations' ? `/accommodations/${item.id}` :
                                                                            activeTab === 'help' ? `/help/${item.id}` : '#'
                                                                } target="_blank" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[9px] font-black uppercase tracking-widest transition-all h-7 px-3 text-slate-400 hover:text-secondary hover:bg-slate-900 gap-2"><Eye className="h-3 w-3" /> View Details</Link>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr><td colSpan={5} className="p-0"><NoPending /></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Tabs>
            {totalPages > 1 && <div className="py-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmProps.isOpen}
                onClose={() => setConfirmProps(prev => ({ ...prev, isOpen: false }))}
                onConfirm={executeAction}
                title={confirmProps.title}
                description={confirmProps.description}
                variant={confirmProps.action === 'deleted' || confirmProps.action === 'rejected' ? 'destructive' : 'primary'}
                confirmText={confirmProps.action.charAt(0).toUpperCase() + confirmProps.action.slice(1)}
            />
        </div>
    )
}

function NoPending() {
    return (
        <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 backdrop-blur-sm">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 opacity-40" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Everything Is Clear</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">No pending items in this category</p>
        </div>
    )
}
