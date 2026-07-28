"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Calendar, Share2, Printer, Mail } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Newsletter {
    id: string
    title: string
    content: string
    sentAt: string
}

export default function NewsletterDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNewsletter = async () => {
            try {
                const res = await fetch(`/api/newsletters/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setNewsletter(data)
                } else {
                    router.push('/newsletters')
                }
            } catch (error) {
                console.error('Error fetching newsletter:', error)
                router.push('/newsletters')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchNewsletter()
    }, [id])

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

    if (!newsletter) return null

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-12">
                        <Link href="/newsletters" className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors mb-8 font-black uppercase tracking-[0.2em] text-[10px] group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Archives
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <Badge className="bg-secondary text-slate-900 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">Broadcasted</Badge>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2 uppercase tracking-[0.2em]">
                                <Calendar className="h-4 w-4 text-secondary" />
                                {format(new Date(newsletter.sentAt), 'MMMM dd, yyyy')}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">{newsletter.title}</h1>

                        <div className="flex items-center justify-between py-6 border-y border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">C</div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">CommuNet Official</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Platform Administration</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-100 hover:bg-slate-50 transition-all shadow-sm" onClick={() => window.print()}>
                                    <Printer className="h-4 w-4 text-slate-600" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <article className="bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-slate-900 to-secondary opacity-50" />
                        <div
                            className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:text-lg prose-p:leading-relaxed prose-li:text-slate-600 prose-img:rounded-[2rem] prose-img:shadow-2xl"
                            dangerouslySetInnerHTML={{ __html: newsletter.content }}
                        />

                        <div className="mt-20 pt-12 border-t border-slate-50 text-center">
                            <Mail className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 text-sm font-medium italic italic">Thank you for being a part of our community.</p>
                        </div>
                    </article>

                    <div className="mt-12 flex justify-center">
                        <Link href="/newsletters">
                            <Button variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-900 h-12 px-8">
                                Read More Newsletters
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
            <style jsx global>{`
                @media print {
                    .navbar, .footer, .back-link, .print-btn { display: none !important; }
                    main { padding: 0 !important; background: white !important; }
                    article { border: none !important; box-shadow: none !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    )
}
