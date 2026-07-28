"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Network } from "lucide-react"

export function Footer() {
    const { user } = useAuth()

    return (
        <footer className="w-full border-t border-slate-200 bg-[#FAF9F6] py-16">
            <div className="container mx-auto px-6 grid gap-10 md:grid-cols-4">

                {/* Brand Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 group">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1.25rem] bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10 transition-transform group-hover:scale-105">
                            <Network className="h-5 w-5 md:h-6 md:w-6 text-secondary" strokeWidth={2.5} />
                        </div>
                        <span className="font-sans text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            CommuNet
                        </span>
                    </div>
                    <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium pr-4">
                        A Verified and Structured Community Support Platform dedicated to the growth, heritage, and prosperity of the CommuNet community.
                    </p>
                </div>

                {/* Community Links */}
                <div className="space-y-6">
                    <h4 className="font-sans text-lg md:text-xl font-bold text-slate-900">Community</h4>
                    <ul className="space-y-3.5 text-sm md:text-base text-slate-500 font-medium">
                        <li><Link href="/business" className="hover:text-secondary transition-colors">Business Directory</Link></li>
                        <li><Link href="/events" className="hover:text-secondary transition-colors">Community Events</Link></li>
                        <li><Link href="/career" className="hover:text-secondary transition-colors">Career Support</Link></li>
                        <li><Link href="/achievements" className="hover:text-secondary transition-colors">Achievements</Link></li>
                        <li><Link href="/members" className="hover:text-secondary transition-colors">Members</Link></li>
                    </ul>
                </div>

                {/* Support & Legal */}
                <div className="space-y-6">
                    <h4 className="font-sans text-lg md:text-xl font-bold text-slate-900">Support</h4>
                    <ul className="space-y-3.5 text-sm md:text-base text-slate-500 font-medium">
                        <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
                        <li><Link href="/help" className="hover:text-secondary transition-colors">Help Center</Link></li>
                        <li><Link href="/donations" className="hover:text-secondary transition-colors">Make a Donation</Link></li>
                        <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                        <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Account / Admin Manage */}
                <div className="space-y-6">
                    <h4 className="font-sans text-xl md:text-2xl font-bold text-slate-900">
                        {user ? (user.role === 'admin' ? 'Administration' : 'My Account') : 'Join Us'}
                    </h4>
                    <ul className="space-y-3.5 text-sm md:text-base text-slate-500 font-medium">
                        {!user ? (
                            <>
                                <li><Link href="/login" className="hover:text-secondary transition-colors">Member Login</Link></li>
                                <li><Link href="/join" className="hover:text-secondary transition-colors">Register / Join</Link></li>
                            </>
                        ) : user.role === 'admin' ? (
                            <>
                                <li><Link href="/admin" className="hover:text-secondary transition-colors">Admin Dashboard</Link></li>
                                <li><Link href="/admin/verification" className="hover:text-secondary transition-colors">Verification Hub</Link></li>
                                <li><Link href="/dashboard" className="hover:text-secondary transition-colors">User View</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link href="/dashboard" className="hover:text-secondary transition-colors">My Dashboard</Link></li>
                                <li><Link href="/profile" className="hover:text-secondary transition-colors">My Profile</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-[0.2em] rounded-md border border-secondary/20">Verified Platform</span>
                    </div>
                </div>

            </div>

            <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-200 text-center text-sm font-semibold text-slate-400">
                © {new Date().getFullYear()} CommuNet Community Platform. All rights reserved. Not for commercial use.
            </div>
        </footer>
    )
}
