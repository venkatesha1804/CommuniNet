"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Menu, ShieldCheck } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <AuthGuard allowedRoles={["admin"]}>
            <div className="flex min-h-screen bg-[#FAF9F6]">
                {/* Sidebar */}
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Top Header */}
                    <header className="h-16 md:h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shadow-sm sticky top-0 z-40">
                        <div className="flex items-center gap-4">
                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-slate-900 text-secondary shadow-lg shadow-slate-900/10"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col">
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Command <span className="text-secondary">Center</span></h1>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-0.5 hidden xs:block">Authorized Intelligence Only</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Administrator</span>
                                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Global Access Tier 1</span>
                            </div>
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-900 text-secondary border border-secondary shadow-lg shadow-slate-900/10 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                                <span className="font-sans text-lg font-black uppercase">A</span>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto p-4 md:p-10">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}
