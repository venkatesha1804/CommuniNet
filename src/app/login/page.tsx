"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, Info, Lock, Mail, Loader2, Phone } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { user, login, loginWithGoogle, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, isLoading, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email.includes("@")) {
            setError("Please enter a valid email address")
            return
        }

        if (!password) {
            setError("Please enter your password")
            return
        }

        const success = await login(email, password)
        if (success) {
            router.push("/dashboard")
        } else {
            setError("Invalid email or password. Please try again.")
        }
    }

    const handleGoogleLogin = async () => {
        const success = await loginWithGoogle()
        if (success) {
            router.push("/dashboard")
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/10 rounded-full blur-3xl -mt-48 -mr-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-400/10 rounded-full blur-3xl -mb-48 -ml-48 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* Logo / Branding */}
                <div className="transition-all duration-700 hover:scale-105">
                    <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-[1.25rem] bg-secondary flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-secondary/20 text-slate-900 font-sans text-2xl md:text-3xl font-black">
                        C
                    </div>
                    <h1 className="font-sans text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                        Welcome <span className="text-secondary">Back</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 mt-2 font-medium">Secure access for verified members</p>
                </div>

                <Card className="bg-white border-transparent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="text-center border-b border-slate-100 pb-6 pt-8 bg-slate-50/50">
                        <CardTitle className="text-xl md:text-2xl font-black text-slate-900">
                            Member Sign In
                        </CardTitle>
                        <CardDescription className="text-sm md:text-base text-slate-500 font-medium mt-1.5">
                            Enter your credentials to access the portal
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            required
                                            className="pl-12 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 md:top-4 h-5 w-5 text-slate-400" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 text-base h-12 md:h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

                            <Button type="submit" className="w-full text-lg h-14 bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="ml-2 h-5 w-5" />
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
                                Sign in with Google
                            </Button>
                        </form>

                        <div className="mt-8 flex flex-col items-center gap-2 border-t border-slate-100 pt-6">
                            <div className="flex items-center gap-2.5 text-xs md:text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-full border border-amber-200/60 font-medium">
                                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                                <span>Only Verified CommuNet Members Get Full Access</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="text-center mt-8">
                    <p className="text-center text-slate-500 font-medium">
                        Don't have an account? <Link href="/join" className="text-secondary font-black hover:underline">Join community</Link>
                    </p>
                </div>

            </div>
        </main>
    )
}
