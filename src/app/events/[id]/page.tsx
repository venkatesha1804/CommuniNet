"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Clock, Star, User, Users, Loader2, Share2, Shield, Info, Heart, MessageSquare, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { toast } from "sonner"

interface EventDetail {
    id: string
    title: string
    date: string
    location: string
    description: string
    status: string
    images?: string[]
    audience?: string
    registrationLink?: string | null
    organizer: {
        name: string
        email: string
    }
}

export default function EventDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()


    const [event, setEvent] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRsvped, setIsRsvped] = useState(false)
    const [rsvpLoading, setRsvpLoading] = useState(false)
    const [attendeeCount, setAttendeeCount] = useState(0)

    useEffect(() => {
        // Wait for auth to finish loading before fetching
        if (authLoading) return

        const fetchEvent = async () => {
            try {
                const token = await getToken()
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch(`/api/events/${id}`, { headers })
                if (res.ok) {
                    const data = await res.json()
                    setEvent(data)
                    setIsRsvped(data.isRsvped || false)
                    setAttendeeCount(data._count?.attendees || 0)
                }
            } catch (err) {
                console.error("Failed to fetch event:", err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchEvent()
    }, [id, authLoading])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleRsvp = async () => {
        if (!isAuthenticated) {
            toast.info("Login Required", { description: "Please login to RSVP." })
            router.push('/login')
            return
        }

        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }

        setRsvpLoading(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/events/${id}/rsvp`, {
                method: 'POST',
                headers,
            })

            if (res.ok) {
                const data = await res.json()
                setIsRsvped(data.status === 'attending')
                setAttendeeCount(data.attendeeCount)
                toast.success(data.status === 'attending' ? 'RSVP Confirmed!' : 'RSVP Cancelled')
            } else {
                const errorData = await res.json()
                toast.error("RSVP Failed", { description: errorData.message || 'An error occurred' })
            }
        } catch (error) {
            console.error("RSVP error:", error)
            toast.error("An unexpected error occurred during RSVP.")
        } finally {
            setRsvpLoading(false)
        }
    }

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.email === event?.organizer?.email
    const isDeletedByAdmin = event?.status === 'deleted_by_admin'

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center gap-6">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-secondary/20" />
                        <Loader2 className="h-16 w-16 animate-spin text-secondary absolute inset-0 [animation-delay:-0.5s]" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Gathering Details</p>
                </div>
                <Footer />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center gap-8 text-center px-4">
                    <div className="h-24 w-24 rounded-[2rem] bg-secondary/10 flex items-center justify-center border border-secondary/20 mb-2">
                        <Info className="h-12 w-12 text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">Event <span className="text-secondary">Not Found</span></h1>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">This event might have been removed or the link is incorrect.</p>
                    </div>
                    <Link href="/events">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                            Back to community
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    if (isDeletedByAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 p-8 rounded-[3rem] mb-8 border border-red-100 shadow-sm">
                        <Shield className="h-20 w-20 text-red-500/30" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">Post <span className="text-red-500">Unavailable</span></h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed font-medium">
                        This event has been removed by an administrator for violating community guidelines.
                    </p>
                    <Link href="/events">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 px-10 h-16 rounded-[2rem] text-lg font-black shadow-2xl shadow-slate-200">
                            Back to Events
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />

            <main className="flex-1 pb-24">
                {/* Hero Section */}
                <div className="relative h-[65vh] md:h-[75vh] min-h-[550px] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        {event.images && event.images.length > 0 ? (
                            <>
                                {/* Blurred Background Backdrop */}
                                <Image
                                    src={event.images[0]}
                                    alt="Backdrop Blur"
                                    fill
                                    className="object-cover blur-3xl scale-125 opacity-40 brightness-50"
                                    priority
                                />
                                <Image
                                    src={event.images[0]}
                                    alt={event.title}
                                    fill
                                    className="object-contain transition-transform duration-[2s] hover:scale-105 relative z-10"
                                    priority
                                />
                            </>
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <Calendar className="w-32 h-32 text-white/5" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                    </div>

                    <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-16">
                        <Link
                            href="/events"
                            className="flex items-center gap-3 text-white/60 hover:text-white transition-all mb-10 w-fit group"
                        >
                            <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md group-hover:bg-white group-hover:text-slate-900 transition-all">
                                <ArrowLeft className="h-5 w-5" />
                            </div>
                            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to community events</span>
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-4 mb-8">
                                    <div className="bg-secondary text-slate-900 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-secondary/20">
                                        {event.status === 'approved' ? 'Verified Gathering' : 'Member Shared'}
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.15em] text-[10px]">
                                        {formatDate(event.date).split(',')[0]}
                                    </div>
                                    {event.audience === 'members_only' && (
                                        <div className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-blue-500/20">
                                            Members Exclusive
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
                                    {event.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-8 text-white/70">
                                    <div className="flex items-center gap-3 group/item">
                                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover/item:bg-secondary group-hover/item:border-secondary transition-all">
                                            <Calendar className="h-5 w-5 text-secondary" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-wider">{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group/item">
                                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover/item:bg-secondary group-hover/item:border-secondary transition-all">
                                            <Clock className="h-5 w-5 text-secondary" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-wider">{formatTime(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group/item">
                                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover/item:bg-secondary group-hover/item:border-secondary transition-all">
                                            <MapPin className="h-5 w-5 text-secondary" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-wider">{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <ShareButton
                                        url={`/events/${event.id}`}
                                        title={event.title}
                                        className="h-16 w-16 rounded-[2rem] bg-white translate-y-0 hover:-translate-y-1 text-slate-900 border-none shadow-2xl transition-all flex items-center justify-center"
                                    />
                                    {(isOwner || isAdmin) && (
                                        <Button
                                            onClick={() => router.push(`/events/${event.id}/edit`)}
                                            className="h-16 px-10 rounded-[2rem] bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:-translate-y-1"
                                        >
                                            Modify Event
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 mt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Info */}
                        <div className="lg:col-span-8 space-y-16">
                            {/* Description Card */}
                            <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="h-14 w-14 rounded-3xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-sm">
                                            <Info className="h-7 w-7 text-secondary" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Event Overview</h2>
                                    </div>
                                    <div className="text-slate-600 text-lg md:text-xl leading-[1.8] font-medium whitespace-pre-wrap selection:bg-secondary/20">
                                        {event.description}
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Section */}
                            {event.images && event.images.length > 1 && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-3xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-sm">
                                            <Star className="h-7 w-7 text-secondary" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Captured Moments</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {event.images.slice(1, 5).map((img, idx) => (
                                            <div key={idx} className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl group ${idx % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                                                <Image
                                                    src={img}
                                                    alt={`Event Moment ${idx + 2}`}
                                                    fill
                                                    className="object-contain bg-slate-100 transition-transform duration-[1.5s] group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-700 flex items-center justify-center">
                                                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                        <Heart className="h-6 w-6" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Organizer Spotlight */}
                            <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">
                                        <div className="h-24 w-24 rounded-[2rem] bg-secondary flex items-center justify-center text-4xl font-black text-slate-900 shadow-2xl shadow-secondary/20 border-4 border-white/10">
                                            {event.organizer.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-black text-secondary mb-3 uppercase tracking-widest">
                                                Event Host
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">{event.organizer.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-10 pt-10 border-t border-white/5">
                                        <div className="flex items-center gap-3 text-white/60">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5 text-secondary" />
                                            </div>
                                            <span className="font-bold tracking-tight">{event.organizer.email}</span>
                                        </div>
                                        <Button className="bg-white text-slate-900 hover:bg-slate-50 rounded-[1.5rem] px-8 py-6 font-black uppercase tracking-widest text-xs h-auto">
                                            Contact Organizer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-10">
                            {/* Actions Card */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-12">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Join the Celebration</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed">Secure your spot in this community gathering today.</p>
                                </div>

                                <div className="h-px bg-slate-100 w-full mb-10" />

                                <div className="space-y-8 mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                            <Calendar className="h-6 w-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                                            <p className="font-black text-slate-900 text-sm">{formatDate(event.date).split(',')[1]}</p>
                                            <p className="text-xs font-bold text-slate-500">{formatTime(event.date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                            <MapPin className="h-6 w-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                            <p className="font-black text-slate-900 text-sm leading-tight">{event.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                            <Users className="h-6 w-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmed</p>
                                            <p className="font-black text-slate-900 text-sm">{attendeeCount} {attendeeCount === 1 ? 'Guest' : 'Guests'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {event.audience === 'members_only' && event.registrationLink ? (
                                        <Button
                                            size="lg"
                                            className="w-full h-16 rounded-[1.5rem] bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                                            onClick={() => window.open(event.registrationLink!, '_blank')}
                                        >
                                            External Registration
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className={`w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl ${isRsvped
                                                ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                                                : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                                                }`}
                                            onClick={handleRsvp}
                                            disabled={rsvpLoading}
                                        >
                                            {rsvpLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : isRsvped ? (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5" /> Attending
                                                </span>
                                            ) : (
                                                "Confirm RSVP"
                                            )}
                                        </Button>
                                    )}

                                    {user && (isOwner || isAdmin) && (
                                        <Button
                                            variant="ghost"
                                            className="w-full h-14 rounded-[1.5rem] text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600 mt-2 transition-all"
                                            onClick={async () => {
                                                if (confirm("Permanently delete this event? This action cannot be undone.")) {
                                                    try {
                                                        const token = await getToken()
                                                        const delHeaders: Record<string, string> = {}
                                                        if (token) delHeaders['Authorization'] = `Bearer ${token}`
                                                        const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE', headers: delHeaders })
                                                        if (res.ok) {
                                                            toast.success("Event deleted successfully")
                                                            router.push('/events')
                                                        } else {
                                                            toast.error("Failed to delete event")
                                                        }
                                                    } catch (e) {
                                                        console.error(e)
                                                        toast.error("An error occurred")
                                                    }
                                                }
                                            }}
                                        >
                                            Discard Posting
                                        </Button>
                                    )}
                                </div>

                                <p className="text-center text-[10px] text-slate-400 mt-8 font-black uppercase tracking-[0.2em] animate-pulse">
                                    {isRsvped ? "Change your mind anytime" : "Free access for verified members"}
                                </p>
                            </div>

                            {/* Community Guidelines */}
                            <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                                <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Essential Notes</h4>
                                <ul className="space-y-5">
                                    {[
                                        "Please arrive 15 minutes prior",
                                        "Respect community guidelines",
                                        "Open to families and invited guests"
                                    ].map((note, i) => (
                                        <li key={i} className="flex gap-4 text-sm text-slate-500 font-medium items-start">
                                            <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0 shadow-sm shadow-secondary/50" />
                                            <span className="leading-tight">{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
