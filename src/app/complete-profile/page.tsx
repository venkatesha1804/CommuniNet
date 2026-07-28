"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, Loader2, Phone, MapPin, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { validateRequired, validatePhone, collectErrors } from "@/lib/validation"

export default function CompleteProfilePage() {
    const router = useRouter()
    const { toast } = useToast()
    const { firebaseUser, isNewSocialUser, register, isLoading: authLoading, getToken } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        gotra: "",
        location: ""
    })

    useEffect(() => {
        if (!authLoading) {
            if (!firebaseUser) {
                router.push("/login")
            } else if (!isNewSocialUser) {
                router.push("/dashboard")
            } else {
                setFormData(prev => ({
                    ...prev,
                    name: firebaseUser.displayName || "",
                    email: firebaseUser.email || ""
                }))
            }
        }
    }, [firebaseUser, isNewSocialUser, authLoading, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Full Name')],
            mobile: [validateRequired(formData.mobile, 'Mobile Number'), validatePhone(formData.mobile)],
            location: [validateRequired(formData.location, 'Location')],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsLoading(true)

        try {
            // We use the same register function from AuthContext which hits /api/auth/register
            const success = await register({
                ...formData,
                password: "FIREBASE_SOCIAL_LOGIN" // Placeholder for schema requirement
            })

            if (!success) {
                throw new Error("Failed to complete profile. Please try again.")
            }

            toast({
                title: "Profile Completed",
                description: "Welcome to the community! Your account is now being verified.",
            })

            router.push("/dashboard")

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (authLoading || (firebaseUser && !isNewSocialUser)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 sm:p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -mt-48 -mr-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/5 rounded-full blur-3xl -mb-48 -ml-48 pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-6 md:mb-8">
                    <div className="mx-auto h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-secondary/20 text-slate-900 font-black text-xl md:text-2xl">
                        C
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
                        Complete <span className="text-secondary">Profile</span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[9px] md:text-xs px-4">One last step to join the community</p>
                </div>

                <Card className="bg-white border-transparent shadow-2xl shadow-slate-200/50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="text-center border-b border-slate-50 pb-4 md:pb-6 pt-6 md:pt-8 bg-slate-50/30">
                        <CardDescription className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
                            We need a few more details for verification
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 md:p-8">
                        <form onSubmit={handleCompleteProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <Input
                                    name="name"
                                    placeholder="Enter your full name"
                                    className={`h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-secondary focus:ring-0 transition-all font-bold ${errors.name ? 'border-red-500' : ''}`}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        name="mobile"
                                        placeholder="10-digit mobile number"
                                        className={`pl-11 h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-secondary focus:ring-0 transition-all font-bold ${errors.mobile ? 'border-red-500' : ''}`}
                                        value={formData.mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setFormData({ ...formData, mobile: val })
                                            if (errors.mobile) setErrors(prev => { const n = { ...prev }; delete n.mobile; return n })
                                        }}
                                    />
                                </div>
                                {errors.mobile && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.mobile}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gotra</label>
                                    <Input
                                        name="gotra"
                                        placeholder="Optional"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-secondary focus:ring-0 transition-all font-bold"
                                        value={formData.gotra}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            name="location"
                                            placeholder="City/Region"
                                            className={`pl-11 h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-secondary focus:ring-0 transition-all font-bold ${errors.location ? 'border-red-500' : ''}`}
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.location && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.location}</p>}
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-1" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>Complete Registration <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>

                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
                                <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-wider">
                                    Full access is provided after community admin verification.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
