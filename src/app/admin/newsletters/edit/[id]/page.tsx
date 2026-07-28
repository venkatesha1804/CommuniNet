"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { NewsletterBuilder } from "@/components/admin/NewsletterBuilder"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function EditNewsletterPage() {
    const { user, getToken } = useAuth()
    const router = useRouter()
    const { id } = useParams()
    const [newsletter, setNewsletter] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard')
            return
        }

        const fetchNewsletter = async () => {
            try {
                const token = await getToken()
                const res = await fetch(`/api/admin/newsletters/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setNewsletter(data)
                } else {
                    toast.error('Newsletter not found')
                    router.push('/admin/newsletters')
                }
            } catch (error) {
                console.error('Error fetching newsletter:', error)
                toast.error('Failed to load newsletter')
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchNewsletter()
    }, [user, id])

    const handleSubmit = async (data: { title: string; content: string; publish: boolean }) => {
        setIsSubmitting(true)
        try {
            const token = await getToken()
            // 1. Update the newsletter
            const res = await fetch(`/api/admin/newsletters/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: data.title, content: data.content })
            })

            if (!res.ok) throw new Error('Failed to update newsletter')

            // 2. If publish requested, trigger the broadcast
            if (data.publish) {
                const sendRes = await fetch(`/api/admin/newsletters/${id}/send`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!sendRes.ok) {
                    toast.error('Progress saved, but failed to broadcast email. Check Resend configuration.')
                } else {
                    toast.success('Newsletter published and broadcasted!')
                }
            } else {
                toast.success('Newsletter updated!')
            }

            router.push('/admin/newsletters')
        } catch (error) {
            console.error('Error updating newsletter:', error)
            toast.error('An error occurred while saving the newsletter')
        } finally {
            setIsSubmitting(false)
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

    if (!newsletter) return null

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Edit Broadcast</h1>
                        <p className="text-slate-500 font-medium italic">Refine your community newsletter.</p>
                    </div>

                    <NewsletterBuilder
                        title="Edit Newsletter"
                        initialData={newsletter}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </main>
            <Footer />
        </div>
    )
}
