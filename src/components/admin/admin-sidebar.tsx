"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Building2, Briefcase, Calendar, HandHeart, Flag, ShieldCheck, LogOut, CheckCircle, Handshake, X, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()

    const menuItems = [
        { name: "Dashboard", icon: CheckCircle, href: "/admin" },
        { name: "Moderation Hub", icon: ShieldCheck, href: "/admin/verification" },
        { name: "User Directory", icon: Users, href: "/admin/users" },
        { name: "Business Moderation", icon: Building2, href: "/admin/business" },
        { name: "Collaboration Requests", icon: Handshake, href: "/admin/collaboration" },
        { name: "Career Moderation", icon: Briefcase, href: "/admin/career" },
        { name: "Events Management", icon: Calendar, href: "/admin/events" },
        { name: "Accommodations", icon: Building2, href: "/admin/accommodations" },
        { name: "Newsletters", icon: Newspaper, href: "/admin/newsletters" },
        { name: "Donations", icon: HandHeart, href: "/admin/donations" },
        // { name: "Reports & Flags", icon: Flag, href: "/admin/reports" },
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="px-8 py-10 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-xl shadow-secondary/10 group hover:rotate-6 transition-transform">
                            <ShieldCheck className="h-6 w-6 md:h-7 md:w-7 text-slate-900" />
                        </div>
                        <div>
                            <h1 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white">Panel</h1>
                            <p className="text-[9px] font-black uppercase tracking-widest text-secondary mt-1">Unified Control</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => { if (window.innerWidth < 768) onClose() }}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 w-full transition-all duration-300 group relative rounded-xl",
                                    isActive
                                        ? "bg-secondary text-slate-900 font-black shadow-lg shadow-secondary/10"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white font-bold"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-secondary")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] uppercase tracking-[0.2em]">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-4 px-8 py-4 w-full rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all duration-300 group border border-transparent hover:border-slate-700"
                    >
                        <Building2 className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Portal Home</span>
                    </Link>
                    <button
                        onClick={() => { window.location.href = '/' }}
                        className="flex items-center gap-4 px-8 py-4 w-full rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
