"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { NewsletterBuilder } from "@/components/admin/NewsletterBuilder"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function CreateNewsletterPage() {
    const { user, getToken } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard')
        }
    }, [user, router])

    const handleSubmit = async (data: { title: string; content: string; publish: boolean }) => {
        setIsSubmitting(true)
        try {
            const token = await getToken()
            // 1. Create the newsletter draft
            const res = await fetch('/api/admin/newsletters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: data.title, content: data.content })
            })

            if (!res.ok) throw new Error('Failed to create newsletter draft')

            const newsletter = await res.json()

            // 2. If publish requested, trigger the broadcast
            if (data.publish) {
                const sendRes = await fetch(`/api/admin/newsletters/${newsletter.id}/send`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!sendRes.ok) {
                    toast.error('Draft saved, but failed to broadcast email. Check Resend configuration.')
                } else {
                    toast.success('Newsletter published and broadcasted!')
                }
            } else {
                toast.success('Newsletter draft saved!')
            }

            router.push('/admin/newsletters')
        } catch (error) {
            console.error('Error creating newsletter:', error)
            toast.error('An error occurred while saving the newsletter')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Composing Broadcast</h1>
                        <p className="text-slate-500 font-medium italic">Draft your official community newsletter here.</p>
                    </div>

                    <NewsletterBuilder
                        title="Draft New Newsletter"
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </main>
            <Footer />
        </div>
    )
}
