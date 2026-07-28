"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateMinLength, validateEmail, validatePhone, validatePassword, collectErrors } from "@/lib/validation"

export default function JoinPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { register, loginWithGoogle } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        gotra: "",
        password: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Full Name'), validateMinLength(formData.name, 2, 'Full Name')],
            mobile: [validateRequired(formData.mobile, 'Mobile Number'), validatePhone(formData.mobile)],
            email: [validateRequired(formData.email, 'Email'), validateEmail(formData.email)],
            password: [validatePassword(formData.password)],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsLoading(true)

        try {
            const success = await register(formData)

            if (!success) {
                throw new Error("Registration failed. Please try again.")
            }

            toast({
                title: "Registration Successful",
                description: "Your account has been created. Please login.",
            })

            router.push("/login")

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

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            const success = await loginWithGoogle()
            if (success) {
                router.push("/dashboard")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/10 rounded-full blur-3xl -mt-48 -mr-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-400/10 rounded-full blur-3xl -mb-48 -ml-48 pointer-events-none" />

            <div className="w-full max-w-lg relative z-10 py-10 md:py-16">

                <div className="transition-all duration-700 hover:scale-105 mb-6 md:mb-8">
                    <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-[1.25rem] bg-secondary flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-secondary/20 text-slate-900 font-sans text-2xl md:text-3xl font-black">
                        C
                    </div>
                    <h1 className="font-sans text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                        Be a <span className="text-secondary">Member</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 mt-2 font-medium">Connect, Grow, and Support</p>
                </div>

                <Card className="bg-white border-transparent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="text-center border-b border-slate-100 pb-6 pt-8 bg-slate-50/50">
                        <CardTitle className="text-xl md:text-2xl font-black text-slate-900">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-sm md:text-base text-slate-500 font-medium mt-1.5">
                            Enter your details to register as a member.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleRegister} className="space-y-5 md:space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                <Input
                                    name="name"
                                    placeholder="John Doe"
                                    className={`pl-5 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors ${errors.name ? 'border-red-500 bg-red-50/50' : ''}`}
                                    onChange={handleChange}
                                    value={formData.name}
                                />
                                {errors.name && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                                    <Input
                                        name="mobile"
                                        type="tel"
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setFormData({ ...formData, mobile: val })
                                            if (errors.mobile) setErrors(prev => { const n = { ...prev }; delete n.mobile; return n })
                                        }}
                                        maxLength={10}
                                        placeholder="91XXXXXXXX"
                                        className={`pl-5 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors ${errors.mobile ? 'border-red-500 bg-red-50/50' : ''}`}
                                        value={formData.mobile}
                                    />
                                    {errors.mobile && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.mobile}</p>}
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        onChange={handleChange}
                                        placeholder="ashish@example.com"
                                        className={`pl-5 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors ${errors.email ? 'border-red-500 bg-red-50/50' : ''}`}
                                        value={formData.email}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Gotra (Optional)</label>
                                <Input
                                    name="gotra"
                                    onChange={handleChange}
                                    placeholder="Enter your Gotra"
                                    className="pl-5 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors"
                                    value={formData.gotra}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                <Input
                                    name="password"
                                    type="password"
                                    onChange={handleChange}
                                    placeholder="Create a password (min 6 characters)"
                                    className={`pl-5 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors ${errors.password ? 'border-red-500 bg-red-50/50' : ''}`}
                                    value={formData.password}
                                />
                                {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password}</p>}
                            </div>

                            <Button type="submit" className="w-full text-lg h-14 bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 mt-2" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    <>
                                        Register <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                                    <span className="bg-white px-4 text-slate-400">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 h-14 rounded-2xl font-bold text-base transition-colors"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign up with Google
                            </Button>
                        </form>

                        <div className="mt-8 flex flex-col items-center gap-2 border-t border-slate-100 pt-6">
                            <div className="flex items-start gap-4 p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-secondary/20 hover:bg-white animate-in slide-in-from-right duration-500 [animation-delay:200ms]">
                                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-secondary shrink-0" />
                                <span>Your information is secure and used for verification only.</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="text-center mt-8">
                    <p className="text-center text-slate-500 font-medium pb-8">
                        Already a member? <Link href="/login" className="text-secondary font-black hover:underline">Sign in</Link>
                    </p>
                </div>

            </div>
        </main>
    )
}
