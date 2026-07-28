"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { Calendar, MapPin, Clock, Plus, Loader2, Megaphone, Trash2, X, Share2, Info, ShieldCheck, Filter } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Event {
    id: string
    title: string
    date: string
    location: string
    description: string
    status: string
    images?: string[]
    organizer?: {
        name: string
        email: string
    }
    audience?: string
    registrationLink?: string | null
    _count?: {
        attendees: number
    }
}

interface Announcement {
    id: string
    content: string
    createdAt: string
}

interface PaginationState {
    currentPage: number
    totalPages: number
    limit: number
}

export default function EventsPage() {
    const [rsvps, setRsvps] = useState<string[]>([])
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const router = useRouter()


    // Separate state for sections
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
    const [pastEvents, setPastEvents] = useState<Event[]>([])
    const [announcements, setAnnouncements] = useState<Announcement[]>([])

    // Pagination state
    const [upcomingPagination, setUpcomingPagination] = useState<PaginationState>({ currentPage: 1, totalPages: 1, limit: 6 })
    const [pastPagination, setPastPagination] = useState<PaginationState>({ currentPage: 1, totalPages: 1, limit: 6 })
    const [viewMode, setViewMode] = useState<'all' | 'mine'>('all')

    const [loading, setLoading] = useState(true)
    const [newAnnouncement, setNewAnnouncement] = useState("")
    const [isAnnounceOpen, setIsAnnounceOpen] = useState(false)
    const [announceLoading, setAnnounceLoading] = useState(false)

    // Fetch Helper
    const fetchEvents = async (filter: 'upcoming' | 'past', page: number) => {
        try {
            const params = new URLSearchParams({
                filter,
                page: page.toString(),
                limit: (filter === 'upcoming' ? upcomingPagination.limit : pastPagination.limit).toString()
            })
            if (viewMode === 'mine') params.append('mode', 'mine')

            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/events?${params.toString()}`, { headers })
            if (res.ok) {
                const { data, pagination } = await res.json()
                if (filter === 'upcoming') {
                    setUpcomingEvents(data)
                    setUpcomingPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
                } else {
                    setPastEvents(data)
                    setPastPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${filter} events`, error)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: '1' })
            if (viewMode === 'mine') params.append('mode', 'mine')

            const upcomingParams = new URLSearchParams(params)
            upcomingParams.append('filter', 'upcoming')
            upcomingParams.append('limit', upcomingPagination.limit.toString())

            const pastParams = new URLSearchParams(params)
            pastParams.append('filter', 'past')
            pastParams.append('limit', pastPagination.limit.toString())

            // Get auth token for my-rsvps endpoint
            const token = await getToken()
            const authHeaders: Record<string, string> = {}
            if (token) authHeaders['Authorization'] = `Bearer ${token}`

            const [upcomingRes, pastRes, rsvpsRes, announceRes] = await Promise.all([
                fetch(`/api/events?${upcomingParams.toString()}`, { headers: authHeaders }),
                fetch(`/api/events?${pastParams.toString()}`, { headers: authHeaders }),
                isAuthenticated ? fetch("/api/events/my-rsvps", { headers: authHeaders }) : Promise.resolve(null),
                fetch("/api/announcements")
            ])

            if (upcomingRes.ok) {
                const { data, pagination } = await upcomingRes.json()
                setUpcomingEvents(data)
                setUpcomingPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
            }

            if (pastRes.ok) {
                const { data, pagination } = await pastRes.json()
                setPastEvents(data)
                setPastPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
            }

            if (announceRes.ok) {
                const data = await announceRes.json()
                setAnnouncements(data)
            }

            if (rsvpsRes && rsvpsRes.ok) {
                const rsvpData = await rsvpsRes.json()
                setRsvps(rsvpData)
            }
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Wait for auth to finish loading before fetching
        if (authLoading) return
        fetchData()
    }, [authLoading, viewMode])

    const handleUpcomingPageChange = (page: number) => {
        fetchEvents('upcoming', page)
    }

    const handlePastPageChange = (page: number) => {
        fetchEvents('past', page)
    }

    const handleRSVP = async (eventId: string) => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        try {
            const token = await getToken()
            const rsvpHeaders: Record<string, string> = {}
            if (token) rsvpHeaders['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST', headers: rsvpHeaders })
            if (res.ok) {
                const data = await res.json()

                // Use the real attendee count from the API
                const updateList = (list: Event[]) => list.map(e => {
                    if (e.id === eventId) {
                        return {
                            ...e,
                            _count: { attendees: data.attendeeCount }
                        }
                    }
                    return e
                })

                if (data.status === 'attending') {
                    setRsvps(prev => [...prev, eventId])
                } else {
                    setRsvps(prev => prev.filter(id => id !== eventId))
                }

                setUpcomingEvents(prev => updateList(prev))
                setPastEvents(prev => updateList(prev))
            }
        } catch (error) {
            console.error("RSVP failed", error)
        }
    }

    const handleAddAnnouncement = async () => {
        if (!newAnnouncement.trim()) return
        setAnnounceLoading(true)
        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newAnnouncement })
            })
            if (res.ok) {
                const added = await res.json()
                setAnnouncements(prev => [added, ...prev])
                setNewAnnouncement("")
                setIsAnnounceOpen(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setAnnounceLoading(false)
        }
    }

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm("Delete this announcement?")) return
        try {
            const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
            if (res.ok) {
                setAnnouncements(prev => prev.filter(a => a.id !== id))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('en-IN', options)
    }

    const formatTime = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
        return new Date(dateString).toLocaleTimeString('en-IN', options)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                {/* Banner Section */}
                <div className="relative rounded-[3rem] overflow-hidden mb-12 bg-white border border-slate-200 p-8 md:p-20 shadow-xl shadow-slate-200/50">
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
                        <Calendar className="w-full h-full -mr-20 -mt-20 transform rotate-12 text-slate-900" />
                    </div>

                    <div className="relative z-10 max-w-4xl text-left">
                        <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-[10px] font-bold text-secondary mb-6 uppercase tracking-[0.2em]">
                            <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                            Community Gatherings
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            Events & <span className="text-secondary">Celebrations</span>
                        </h1>
                        <p className="text-slate-600 text-lg md:text-2xl max-w-2xl leading-relaxed mb-10 font-medium">
                            Connect, celebrate, and grow together. Join our community gatherings across the globe.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {user?.role === "admin" && (
                                <Button
                                    className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-10 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95"
                                    onClick={() => router.push("/events/add")}
                                >
                                    <Plus className="mr-2 h-6 w-6" /> Organize Event
                                </Button>
                            )}
                            {user?.role === "admin" && (
                                <Dialog open={isAnnounceOpen} onOpenChange={setIsAnnounceOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 h-14 px-10 rounded-2xl font-bold shadow-sm transition-all hover:-translate-y-1 active:scale-95 bg-white">
                                            <Megaphone className="mr-2 h-6 w-6" /> Announcement
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-[2.5rem] border-slate-200 shadow-2xl bg-white p-8 md:p-12">
                                        <DialogHeader>
                                            <DialogTitle className="text-3xl font-black text-slate-900">New Community Bulletin</DialogTitle>
                                        </DialogHeader>
                                        <div className="pt-6">
                                            <Textarea
                                                placeholder="Type your announcement here..."
                                                value={newAnnouncement}
                                                onChange={(e) => setNewAnnouncement(e.target.value)}
                                                className="min-h-[160px] rounded-3xl bg-slate-50 border-slate-100 focus:border-secondary focus:ring-secondary/20 p-6 text-lg font-medium"
                                            />
                                        </div>
                                        <DialogFooter className="mt-10">
                                            <Button onClick={handleAddAnnouncement} disabled={announceLoading} className="w-full h-16 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 text-lg hover:bg-slate-800 transition-all active:scale-95">
                                                {announceLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Publish Announcement"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Toggle (Authenticated Only) */}
                {isAuthenticated && (
                    <div className="flex justify-center mb-16">
                        <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-8 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'all'
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105 z-10"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <Calendar className="h-4 w-4" />
                                All Events
                            </button>
                            <button
                                onClick={() => setViewMode('mine')}
                                className={`px-8 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'mine'
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105 z-10"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                My Events
                            </button>
                        </div>
                    </div>
                )}

                {/* Announcement Banner */}
                {announcements.length > 0 && (
                    <div className="mb-16 md:mb-20 animate-slide-up relative group/banner">
                        {/* Decorative Trim Ornaments */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent z-30" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent z-30" />

                        <div className="bg-white/60 backdrop-blur-xl border-y border-slate-200 relative overflow-hidden h-32 md:h-44 flex items-center shadow-2xl shadow-slate-200/50">
                            {/* Static Decorative Background Elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                            {/* Premium Fixed Label */}
                            <div className="flex flex-col justify-center items-center gap-2 md:gap-4 px-6 md:px-10 h-full z-20 bg-white/90 backdrop-blur-md border-r border-slate-100 shrink-0 shadow-[10px_0_20px_-5px_rgba(0,0,0,0.02)] text-center w-32 md:w-auto md:min-w-[180px]">
                                <div className="relative">
                                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                        <Megaphone className="h-6 w-6 md:h-8 md:w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-secondary rounded-full border-2 border-white animate-pulse shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 uppercase tracking-tighter text-[10px] md:text-xs">Community</span>
                                    <span className="font-bold text-secondary uppercase tracking-[0.2em] text-[8px] md:text-[10px] md:-mt-1">Bulletin</span>
                                </div>
                            </div>

                            {/* Vertical Scrolling Bulletin Container */}
                            <div className="flex-1 h-full overflow-hidden relative">
                                <div className="absolute w-full animate-vertical-scroll pause-on-hover flex flex-col pt-4">
                                    {/* Duplicate list for seamless loop */}
                                    {[...announcements, ...announcements].map((ann, index) => (
                                        <div key={`${ann.id}-${index}`} className="group/item min-h-[5rem] py-4 flex items-center justify-between px-10 w-full transition-all hover:bg-slate-50/80 relative">
                                            {/* Left accent border on hover */}
                                            <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-secondary scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 rounded-r-full" />

                                            <div className="flex flex-col gap-1.5 pr-8 flex-1">
                                                <p className="text-[16px] md:text-[18px] font-bold text-slate-900 leading-snug">
                                                    {ann.content}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full">
                                                        Update
                                                    </span>
                                                    <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {user?.role === "admin" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteAnnouncement(ann.id);
                                                    }}
                                                    className="opacity-0 group-hover/item:opacity-100 transition-all text-slate-400 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 shrink-0"
                                                    title="Remove Bulletin"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Top/Bottom Fades for Depth */}
                                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-10 opacity-60" />
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 opacity-60" />
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                    </div>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        <section className="mb-20 md:mb-32">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 md:mb-14 flex items-center gap-4">
                                <Calendar className="h-8 w-8 md:h-10 md:w-10 text-secondary" /> Upcoming Gatherings
                            </h2>
                            {upcomingEvents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-16">
                                        {upcomingEvents.map((event) => (
                                            <Card key={event.id} className="group rounded-[3rem] border-slate-200 shadow-xl shadow-slate-200/50 bg-white overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-slate-300/50 flex flex-col h-full border-b-8 border-b-slate-100 hover:border-b-secondary">
                                                {/* Event Image */}
                                                <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden">
                                                    {event.images && event.images.length > 0 ? (
                                                        <Image
                                                            src={event.images[0]}
                                                            alt={event.title}
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
                                                            <Calendar className="h-16 w-16 text-slate-200" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-6 left-6">
                                                        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 text-center min-w-[70px]">
                                                            <div className="text-slate-900 font-black text-2xl leading-none">{new Date(event.date).getDate()}</div>
                                                            <div className="text-secondary text-[10px] uppercase font-black tracking-widest mt-1">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                                        </div>
                                                    </div>
                                                    {event.status === 'pending' && (
                                                        <div className="absolute top-6 right-6">
                                                            <Badge className="bg-amber-500 text-white border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase shadow-lg">Pending</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <CardContent className="p-8 md:p-10 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-4 text-slate-400 mb-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
                                                            <Clock className="h-3.5 w-3.5" /> {formatTime(event.date)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                                            <MapPin className="h-3.5 w-3.5" /> {event.location.split(',')[0]}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                                                        <Link href={`/events/${event.id}`}>
                                                            {event.title}
                                                        </Link>
                                                    </h3>

                                                    <p className="text-slate-500 text-base leading-relaxed line-clamp-3 mb-8 font-medium">
                                                        {event.description}
                                                    </p>

                                                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex -space-x-2.5">
                                                                {[1, 2, 3].map(i => (
                                                                    <div key={i} className="h-9 w-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                                        <div className="h-full w-full bg-slate-900/5 text-slate-900 text-[9px] flex items-center justify-center font-black">{i}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">+{event._count?.attendees || 0} Going</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <ShareButton
                                                                url={`/events/${event.id}`}
                                                                title={event.title}
                                                                description={`${formatDate(event.date)} • ${event.location}`}
                                                                className="h-11 w-11 rounded-2xl border-slate-100 hover:bg-secondary/10 hover:text-secondary transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="p-8 md:p-10 pt-0 flex flex-col gap-4">
                                                    {user?.email === event.organizer?.email ? (
                                                        <div className="flex gap-3 w-full">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-slate-700 hover:bg-slate-50 shadow-sm"
                                                                onClick={() => router.push(`/events/${event.id}/edit`)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 h-14 rounded-2xl border-red-100 text-red-600 font-black hover:bg-red-50 hover:border-red-200 shadow-sm"
                                                                onClick={async () => {
                                                                    if (confirm("Are you sure you want to delete this event?")) {
                                                                        const token = await getToken()
                                                                        const delHeaders: Record<string, string> = {}
                                                                        if (token) delHeaders['Authorization'] = `Bearer ${token}`
                                                                        await fetch(`/api/events/${event.id}`, { method: 'DELETE', headers: delHeaders })
                                                                        window.location.reload()
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            className={`w-full h-16 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${rsvps.includes(event.id)
                                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                                                                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
                                                                }`}
                                                            onClick={() => handleRSVP(event.id)}
                                                        >
                                                            {rsvps.includes(event.id) ? "Cancel My RSVP" : "Confirm Attendance"}
                                                        </Button>
                                                    )}

                                                    {event.audience === 'members_only' && event.registrationLink && (
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-14 rounded-2xl border-secondary/20 text-secondary font-black hover:bg-secondary/10 shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                window.open(event.registrationLink!, '_blank')
                                                            }}
                                                        >
                                                            Register Separately
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                    {upcomingPagination.totalPages > 1 && (
                                        <div className="mb-12">
                                            <Pagination
                                                currentPage={upcomingPagination.currentPage}
                                                totalPages={upcomingPagination.totalPages}
                                                onPageChange={handleUpcomingPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                                    <p className="text-slate-400 font-bold text-lg">No upcoming events scheduled at the moment.</p>
                                </div>
                            )}
                        </section>

                        {/* Past Events */}
                        <section className="pt-20 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-4">
                                    <Clock className="h-8 w-8 text-slate-400" /> Memories from Past
                                </h2>
                            </div>

                            {pastEvents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                                        {pastEvents.map((event) => (
                                            <Card key={event.id} className="rounded-[2.5rem] border-slate-100 bg-white/50 hover:bg-white transition-all duration-500 overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200">
                                                <div className="flex items-center p-6 gap-6">
                                                    <div className="h-20 w-20 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0 shadow-inner group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                                                        <div className="text-slate-900 font-black text-xl leading-none group-hover:text-secondary transition-colors">{new Date(event.date).getDate()}</div>
                                                        <div className="text-slate-400 text-[9px] uppercase font-black tracking-widest mt-1 group-hover:text-secondary/70 transition-colors">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-slate-900 group-hover:text-secondary transition-all truncate text-lg">
                                                            <Link href={`/events/${event.id}`}>{event.title}</Link>
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-md">{event.location.split(',')[0]}</span>
                                                            <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{event._count?.attendees || 0} Attended</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    {pastPagination.totalPages > 1 && (
                                        <div className="mb-12">
                                            <Pagination
                                                currentPage={pastPagination.currentPage}
                                                totalPages={pastPagination.totalPages}
                                                onPageChange={handlePastPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic">No past events recorded in the digital archives.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}
