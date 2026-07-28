"use client"

import { useState, useEffect } from "react"
import { IndianRupee, Download, Loader2, Users, Heart, Calendar } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<any[]>([])
    const [stats, setStats] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const { getToken } = useAuth()

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    const fetchDonations = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString()
            })
            const token = await getToken()
            const res = await fetch(`/api/admin/donations?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (res.ok) {
                const data = await res.json()
                setDonations(data.donations || [])
                setStats(data.stats || {})
                setTotalPages(data.pagination?.pages || 1)
            }
        } catch (error) {
            console.error("Failed to fetch donations", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDonations()
    }, [currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    if (loading && donations.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                        Donations <span className="text-slate-400">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review contributions and fund allocations.</p>
                </div>
                <Button
                    className="bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest px-8 py-6 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 group"
                >
                    <Download className="h-5 w-5 mr-3 group-hover:translate-y-0.5 transition-transform" />
                    Export Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Collections", value: stats.totalAmount, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { label: "Monthly Velocity", value: stats.thisMonthAmount, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                    { label: "Unique Philanthropists", value: stats.uniqueDonors, icon: Users, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
                    { label: "Altruistic Acts", value: stats.anonymousCount, icon: Heart, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" }
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "p-6 rounded-[2.5rem] border bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500",
                            stat.border
                        )}
                    >
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <h4 className={cn("text-2xl font-black tracking-tight", stat.color)}>
                            {typeof stat.value === 'number' && i < 2 ? "₹" : ""}{stat.value?.toLocaleString('en-IN') || 0}
                        </h4>
                    </div>
                ))}
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Donation Records</h3>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/80 backdrop-blur-sm">
                                <th className="pl-8 pr-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Name</th>
                                <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Contribution</th>
                                <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Cause</th>
                                <th className="px-6 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400">Date</th>
                                <th className="pl-6 pr-8 py-6 font-black uppercase tracking-wider text-[11px] text-slate-400 text-right">ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : donations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center bg-slate-50/50">
                                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                                            <IndianRupee className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">List Empty</h3>
                                        <p className="text-slate-500 font-medium mt-2">No donation records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                donations.map((d: any, index: number) => (
                                    <tr
                                        key={d.id}
                                        className="group transition-all duration-300 hover:bg-slate-50/50"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="pl-8 pr-6 py-6 font-bold text-slate-900">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black uppercase tracking-tight group-hover:text-slate-600 transition-colors">
                                                    {d.donor?.name || "Anonymous Benefactor"}
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-400">{d.donor?.email || "confidential@vault"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-1.5 font-black text-emerald-600 text-lg tracking-tighter">
                                                <span className="text-sm">₹</span>
                                                {d.amount.toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest px-3 py-1 border-0 shadow-sm">
                                                {d.cause}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-lg w-fit shadow-sm">
                                                <Calendar className="h-3 w-3 mr-1.5 text-slate-300" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                                                    {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <span className="font-mono text-[10px] font-bold text-slate-300 group-hover:text-slate-500 transition-colors uppercase">
                                                ID_{d.transactionId.slice(-8)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                    <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
