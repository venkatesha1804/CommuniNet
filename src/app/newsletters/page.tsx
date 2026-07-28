"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar, ArrowRight, Mail, Search, Newspaper } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

interface Newsletter {
    id: string
    title: string
    content: string
    sentAt: string
}

export default function NewsletterArchivePage() {
    const { user } = useAuth()
    const [newsletters, setNewsletters] = useState<Newsletter[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchNewsletters = async () => {
            try {
                const res = await fetch('/api/newsletters')
                if (res.ok) {
                    const data = await res.json()
                    setNewsletters(data)
                }
            } catch (error) {
                console.error('Error fetching newsletters:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchNewsletters()
    }, [])

    const filteredNewsletters = newsletters.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20 rounded-full px-4 py-1 mb-6 text-xs font-black uppercase tracking-widest">Archive</Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase mb-6">Community Newsletters</h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium italic mb-8">Stay informed with the latest updates, achievements, and milestones from our community.</p>

                        {user?.role === 'admin' && (
                            <Link href="/admin/newsletters/create">
                                <Button className="bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 h-14 px-8 rounded-2xl font-black shadow-xl shadow-slate-200 uppercase tracking-widest text-xs">
                                    <Newspaper className="h-5 w-5 mr-2" /> Draft New Broadcast
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="relative max-w-xl mx-auto mb-16">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search past newsletters..."
                            className="h-14 pl-12 pr-4 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-secondary focus:border-secondary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {filteredNewsletters.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                            <Newspaper className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-900 mb-2">No newsletters found</h3>
                            <p className="text-slate-400">Try adjusting your search or check back later.</p>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {filteredNewsletters.map((newsletter) => (
                                <Card key={newsletter.id} className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem] group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700">
                                    <CardContent className="p-8 md:p-12">
                                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                            <div className="h-20 w-20 bg-slate-50 rounded-[1.5rem] flex flex-col items-center justify-center border border-slate-100 group-hover:bg-secondary group-hover:border-secondary transition-colors duration-500">
                                                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 tracking-tighter line-clamp-1">{format(new Date(newsletter.sentAt), 'MMM')}</span>
                                                <span className="text-2xl font-black text-slate-900 group-hover:text-slate-900 leading-none">{format(new Date(newsletter.sentAt), 'dd')}</span>
                                                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 tracking-tighter">{format(new Date(newsletter.sentAt), 'yyyy')}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-2 py-0.5 rounded-md border border-secondary/10">Official Broadcast</span>
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-500">{newsletter.title}</h2>
                                                <div
                                                    className="text-slate-500 line-clamp-2 text-sm leading-relaxed mb-6 italic"
                                                    dangerouslySetInnerHTML={{ __html: newsletter.content.replace(/<[^>]*>?/gm, '') }}
                                                />
                                                <Link href={`/newsletters/${newsletter.id}`}>
                                                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-100 text-slate-900 font-bold hover:bg-slate-900 hover:text-white group-hover:border-slate-900 transition-all">
                                                        Read Full Letter <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
