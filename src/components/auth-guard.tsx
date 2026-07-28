"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ShieldAlert, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AuthGuardProps {
    children: React.ReactNode
    allowedRoles?: ("admin" | "member")[]
    requireVerified?: boolean
}

function VerificationRequired() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FDFBF7]">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 overflow-hidden text-center p-8 md:p-12">
                <div className="flex justify-center mb-8">
                    <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center relative">
                        <ShieldAlert className="h-12 w-12 text-secondary" />
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/20 animate-spin-slow" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Account Verification</h2>
                <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                    Access to this feature is restricted to verified community members. Your account is currently <span className="text-secondary font-black italic">awaiting review</span>.
                </p>

                <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-700">Admins are reviewing your registration</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-700">Verification usually takes 24-48 hours</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-700">You'll be notified once your account is active</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard">
                        <Button className="w-full h-12 bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-slate-900/10 transition-all">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="w-full h-12 text-slate-400 hover:text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export function AuthGuard({ children, allowedRoles, requireVerified = false }: AuthGuardProps) {
    const { user, isLoading, isAuthenticated, isNewSocialUser } = useAuth()
    const router = useRouter()
    const [isUnverified, setIsUnverified] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            if (isNewSocialUser) {
                router.push("/complete-profile")
            } else if (!isAuthenticated) {
                router.push("/login")
            } else if (allowedRoles && user && !allowedRoles.includes(user.role as "admin" | "member")) {
                router.push("/dashboard")
            } else if (requireVerified && user && user.status !== 'approved' && user.role !== 'admin') {
                setIsUnverified(true)
            } else {
                setIsUnverified(false)
            }
        }
    }, [user, isLoading, isAuthenticated, isNewSocialUser, router, allowedRoles, requireVerified])

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                    <div className="absolute inset-0 h-12 w-12 border-4 border-slate-900/5 rounded-full" />
                </div>
                <p className="mt-8 text-slate-900 font-black tracking-[0.4em] text-[9px] uppercase">Checking access...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role as "admin" | "member")) {
        return null // Will redirect
    }

    if (isUnverified) {
        return <VerificationRequired />
    }

    return <>{children}</>
}
