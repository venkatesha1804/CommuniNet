"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IndianRupee, Heart, ShieldCheck, CreditCard, Loader2, Trophy, Calendar } from "lucide-react"

import { useAuth } from "@/lib/auth-context"

export default function DonationPage() {
    const { isAuthenticated, getToken } = useAuth()
    const [amount, setAmount] = useState("")
    const [cause, setCause] = useState("")
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // New state for leaderboard and recent donations
    const [stats, setStats] = useState<{ leaderboard: any[], recent: any[] }>({ leaderboard: [], recent: [] })
    const [loadingStats, setLoadingStats] = useState(true)

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/donations/public")
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error)
        } finally {
            setLoadingStats(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = await getToken()
            const res = await fetch("/api/donations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    cause,
                    isAnonymous
                })
            })

            if (res.ok) {
                setSuccess(true)
                setAmount("")
                setCause("")
                fetchStats() // Refresh leaderboard and history
            }
        } catch (error) {
            console.error("Donation failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const causes = [
        { id: "Education", label: "Education Fund" },
        { id: "Medical", label: "Medical Relief" },
        { id: "Temple", label: "Temple Renovation" },
        { id: "Annadanam", label: "Annadanam (Food Service)" },
        { id: "General", label: "General Community Fund" }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start mb-10 md:mb-20">
                        {/* Left: Content */}
                        <div className="lg:sticky lg:top-24">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-maroon/10 rounded-full text-maroon text-xs md:text-sm font-bold mb-3 md:mb-4">
                                <Heart className="h-3 w-3 md:h-4 md:w-4 fill-maroon" />
                                Community Support
                            </div>
                            <h1 className="font-serif text-3xl md:text-5xl font-bold text-maroon mb-4 md:mb-6 leading-tight">
                                Your Contribution <br />
                                <span className="text-gold">Empowers Our Community</span>
                            </h1>
                            <p className="text-gray-700 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                                CommuNet Community Portal is dedicated to the progress and welfare of our members.
                                Your generous donations support education scholarships, medical emergencies, and cultural preservation.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-cream/40 rounded-xl border border-gold/15 shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-cream border border-gold/30 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-maroon">Secure Payments</h3>
                                        <p className="text-sm text-gray-600">All transactions are encrypted and processed securely through our verified gateway.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-cream/40 rounded-xl border border-gold/10 shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-cream border border-gold/30 flex items-center justify-center shrink-0">
                                        <CreditCard className="h-5 w-5 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-maroon">Easy Tracking</h3>
                                        <p className="text-sm text-gray-600">Logged-in members can track their donation history and download tax receipts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Donation Card */}
                        <Card className="border-gold/20 shadow-xl overflow-hidden mt-6 lg:mt-0">
                            <CardHeader className="bg-maroon text-white p-5 md:p-6">
                                <CardTitle className="text-xl md:text-2xl font-serif">Make a Donation</CardTitle>
                                <CardDescription className="text-white/70 text-sm">Fill in the details to contribute</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 md:p-6">
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-maroon mb-2">Thank You!</h3>
                                        <p className="text-gray-600 mb-6 font-serif italic">"Those who give liberally shall be enriched, and those who water shall themselves be watered."</p>
                                        <Button
                                            onClick={() => setSuccess(false)}
                                            className="bg-gold text-maroon hover:bg-gold/90 border-none px-8 font-bold"
                                        >
                                            Make Another Donation
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-maroon font-bold uppercase text-xs tracking-wider">Amount (INR)</Label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    placeholder="Enter amount (e.g. 1000)"
                                                    className="pl-10 text-lg border-gold/20 focus:border-gold h-12"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    required
                                                    min="1"
                                                    suppressHydrationWarning
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cause" className="text-maroon font-bold uppercase text-xs tracking-wider">Purpose of Donation</Label>
                                            <Select value={cause} onValueChange={setCause} required>
                                                <SelectTrigger className="border-gold/20 focus:ring-gold bg-cream/30 h-12">
                                                    <SelectValue placeholder="Select a cause" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {causes.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center space-x-2 py-2">
                                            <Checkbox
                                                id="anonymous"
                                                checked={isAnonymous}
                                                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                                            />
                                            <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Donate Anonymously (Hide name from public list)
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-14 bg-maroon text-gold hover:bg-maroon/90 text-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
                                            suppressHydrationWarning
                                        >
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            ) : (
                                                <Heart className="h-5 w-5 mr-2 fill-gold" />
                                            )}
                                            Proceed to Secure Payment
                                        </Button>

                                        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                                            Demonstration Only • Secure Gateway Simulated
                                        </p>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12 pb-8 md:pb-12">
                        {/* Leaderboard */}
                        <Card className="border-gold/20 shadow-md flex flex-col h-[400px] md:h-[450px]">
                            <CardHeader className="border-b border-gold/10 pb-3 md:pb-4 shrink-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                    <CardTitle className="text-lg md:text-xl font-serif text-maroon flex items-center gap-2">
                                        <Trophy className="h-4 w-4 md:h-5 md:w-5 text-gold fill-gold" />
                                        Donation Leaderboard
                                    </CardTitle>
                                    <span className="text-[10px] items-center px-2 py-0.5 bg-gold/10 text-maroon rounded-full font-bold uppercase shrink-0">Top Contributors</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                                {loadingStats ? (
                                    <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" /></div>
                                ) : stats.leaderboard.length > 0 ? (
                                    <div className="divide-y divide-gold/5">
                                        {stats.leaderboard.map((donor, idx) => (
                                            <div key={donor.id} className="flex items-center justify-between p-4 hover:bg-gold/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="h-10 w-10 rounded-full bg-cream border border-gold/30 overflow-hidden flex items-center justify-center font-bold text-maroon text-sm">
                                                            {donor.image ? <img src={donor.image} alt={donor.name} className="h-full w-full object-cover" /> : donor.name.charAt(0)}
                                                        </div>
                                                        <div className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${idx === 0 ? 'bg-gold text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-maroon text-sm">{donor.name}</h4>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Community Member</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-maroon font-bold flex items-center justify-end text-sm">
                                                        <IndianRupee className="h-3 w-3" />
                                                        {donor.total.toLocaleString()}
                                                    </div>
                                                    <p className="text-[10px] text-gold font-bold">Total Contribution</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm">No contributions yet. Be the first!</div>
                                )}
                            </CardContent>
                            <div className="p-3 bg-gold/5 border-t border-gold/10 text-center shrink-0">
                                <p className="text-[10px] text-maroon/60 font-bold tracking-widest uppercase">Honoring our Generous Supporters</p>
                            </div>
                        </Card>

                        {/* Recent History */}
                        <Card className="border-gold/20 shadow-md flex flex-col h-[400px] md:h-[450px]">
                            <CardHeader className="border-b border-gold/10 pb-3 md:pb-4 shrink-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                    <CardTitle className="text-lg md:text-xl font-serif text-maroon flex items-center gap-2">
                                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gold" />
                                        Recent Contributions
                                    </CardTitle>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Live Updates</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                                {loadingStats ? (
                                    <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" /></div>
                                ) : stats.recent.length > 0 ? (
                                    <div className="divide-y divide-gold/5">
                                        {stats.recent.map((d) => (
                                            <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gold/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-maroon/5 border border-maroon/10 flex items-center justify-center shrink-0">
                                                        <Heart className="h-4 w-4 text-maroon opacity-40 shrink-0" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-maroon text-xs truncate">{d.donorName}</h4>
                                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                                                            <span className="bg-gray-100 px-1 rounded uppercase tracking-tighter">{d.cause}</span>
                                                            <span>•</span>
                                                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-maroon font-bold flex items-center gap-0.5 text-sm shrink-0">
                                                    <IndianRupee className="h-3 w-3" />
                                                    {d.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm">Starting our collection drive...</div>
                                )}
                            </CardContent>
                            <div className="p-3 bg-cream/50 border-t border-gold/10 text-center shrink-0">
                                <p className="text-[10px] text-gray-400 italic">"Gifts from the heart never go to waste."</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
