"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Mail, MessageSquare, ArrowRight, Calendar, Trash2, Edit3, Send, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { format } from "date-fns"

interface Newsletter {
    id: string
    title: string
    status: string
    sentAt: string | null
    createdAt: string
    author: {
        name: string | null
    }
}

export default function AdminNewslettersPage() {
    const { user, getToken } = useAuth()
    const router = useRouter()
    const [newsletters, setNewsletters] = useState<Newsletter[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNewsletters = async () => {
        try {
            const token = await getToken()
            const res = await fetch('/api/admin/newsletters', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNewsletters(data)
            }
        } catch (error) {
            console.error('Error fetching newsletters:', error)
            toast.error('Failed to load newsletters')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard')
            return
        }
        fetchNewsletters()
    }, [user])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this newsletter draft?')) return

        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/newsletters/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success('Newsletter deleted')
                setNewsletters(prev => prev.filter(n => n.id !== id))
            }
        } catch (error) {
            toast.error('Failed to delete newsletter')
        }
    }

    const handleSend = async (id: string) => {
        if (!confirm('Are you sure you want to publish and broadcast this newsletter to ALL verified members? This action cannot be undone.')) return

        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/newsletters/${id}/send`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success('Newsletter broadcast started!')
                fetchNewsletters()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Failed to send newsletter')
            }
        } catch (error) {
            toast.error('Failed to send newsletter')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Newsletter Hub</h1>
                            <p className="text-slate-500 font-medium italic">Broadcast official community updates and manage archives.</p>
                        </div>
                        <Link href="/admin/newsletters/create">
                            <Button className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-14 px-8 rounded-2xl font-black shadow-xl shadow-slate-200 uppercase tracking-widest text-xs">
                                <Plus className="h-5 w-5 mr-2" /> Draft New Broadcast
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6">
                        {newsletters.length === 0 ? (
                            <Card className="border-dashed border-2 bg-white/50 py-20 rounded-[2.5rem]">
                                <CardContent className="flex flex-col items-center text-center">
                                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                        <Mail className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">No newsletters yet</h3>
                                    <p className="text-slate-400 max-w-md mb-8">Start by drafting your first official community broadcast today.</p>
                                    <Link href="/admin/newsletters/create">
                                        <Button variant="outline" className="rounded-xl border-slate-200">Create Draft</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            newsletters.map((newsletter) => (
                                <Card key={newsletter.id} className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem] group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row items-center">
                                            <div className={`w-full md:w-2 bg-slate-900 md:h-24 ${newsletter.status === 'sent' ? 'bg-green-500' : 'bg-secondary'}`} />
                                            <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {newsletter.status === 'sent' ? (
                                                            <Badge className="bg-green-50 text-green-600 border-green-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">Broadcasted</Badge>
                                                        ) : (
                                                            <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">Draft</Badge>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(newsletter.createdAt), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 truncate mb-1">{newsletter.title}</h3>
                                                    <p className="text-xs text-slate-400 font-medium">By {newsletter.author.name || 'Admin'}</p>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {newsletter.status !== 'sent' ? (
                                                        <>
                                                            <Link href={`/admin/newsletters/edit/${newsletter.id}`}>
                                                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
                                                                    <Edit3 className="h-4 w-4 text-slate-600" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-12 w-12 rounded-xl border-red-50 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                                                                onClick={() => handleDelete(newsletter.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                            <Button
                                                                className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all"
                                                                onClick={() => handleSend(newsletter.id)}
                                                            >
                                                                <Send className="h-3 w-3 mr-2" /> Publish & Send
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <Link href={`/newsletters/${newsletter.id}`}>
                                                                <Button variant="outline" className="rounded-xl border-slate-100 font-bold text-xs h-12 px-6">View Archive</Button>
                                                            </Link>
                                                            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
