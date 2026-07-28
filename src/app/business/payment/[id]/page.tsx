"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CreditCard, Lock, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface PaymentPageProps {
    params: Promise<{
        id: string
    }>
}

export default function PaymentPage({ params }: PaymentPageProps) {
    const { id } = use(params)
    const router = useRouter()
    const { user, isLoading, getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [businessName, setBusinessName] = useState("")

    useEffect(() => {
        // ideally fetch business details here to show name
        // for now we trust the ID
    }, [id])

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch("/api/business/payment", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    businessId: id,
                    paymentDetails: {
                        card: "4242", // Mock
                    }
                })
            })

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/business")
                }, 2000)
            } else {
                const data = await res.json()
                alert(data.message || "Payment Failed. Please try again.")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    // Getting token from local storage is a common pattern if not httponly cookie. 
    // In this app, valid token should be in localStorage 'token' based on login flow usually? 
    // Let's ensure we send the token.

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30 font-sans">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-md border-gold/20 shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit">
                            <CreditCard className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-serif text-maroon">Complete Your Listing</CardTitle>
                        <CardDescription>
                            Pay the one-time listing fee to publish your business.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                            <span className="text-gray-600 font-medium">Listing Fee</span>
                            <span className="text-2xl font-bold text-maroon">₹999</span>
                        </div>

                        {success ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in">
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                                <p className="text-lg font-medium text-green-700">Payment Successful!</p>
                                <p className="text-sm text-gray-500">Redirecting to directory...</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Card Number</Label>
                                    <div className="relative">
                                        <Input placeholder="0000 0000 0000 0000" required />
                                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Expiry Date</Label>
                                        <Input placeholder="MM/YY" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CVV</Label>
                                        <Input type="password" placeholder="123" required maxLength={3} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cardholder Name</Label>
                                    <Input placeholder="Name on card" required />
                                </div>

                                <Button type="submit" className="w-full bg-maroon text-gold hover:bg-maroon/90 mt-4" disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Pay ₹999 & Publish"}
                                </Button>

                                <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                                    <Lock className="h-3 w-3" /> Secure Payment Simulation
                                </p>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}
