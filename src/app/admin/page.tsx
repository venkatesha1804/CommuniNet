"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users, AlertTriangle, TrendingUp, Briefcase, Calendar,
    GraduationCap, Building2, HeartHandshake, Heart, IndianRupee,
    Loader2, ToggleLeft, ToggleRight, ShieldCheck, Newspaper
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

type StatsView = 'total' | 'pending'
type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [statsView, setStatsView] = useState<StatsView>('total')
    const [timeRange, setTimeRange] = useState<TimeRange>('6m')
    const [chartLoading, setChartLoading] = useState(false)
    const [activeGrowthMetric, setActiveGrowthMetric] = useState<string>('userGrowth')
    const { getToken } = useAuth()

    const fetchStats = useCallback(async (range: TimeRange) => {
        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/analytics?range=${range}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            const data = await res.json()
            setStats(data)
        } catch (err) {
            console.error(err)
        }
    }, [getToken])

    useEffect(() => {
        setLoading(true)
        fetchStats(timeRange).finally(() => setLoading(false))
    }, [])

    const handleRangeChange = async (range: TimeRange) => {
        setTimeRange(range)
        setChartLoading(true)
        await fetchStats(range)
        setChartLoading(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
    )

    const totals = stats?.stats?.totals || {}
    const breakdown = stats?.stats?.breakdown || {}

    const totalCards = [
        { label: "Total Members", value: stats?.stats?.totalUsers || 0, icon: Users, color: "text-slate-900", bg: "bg-slate-100", accent: "border-l-slate-900", link: "/admin/users?status=approved" },
        { label: "Events", value: totals.events || 0, icon: Calendar, color: "text-green-600", bg: "bg-green-50", accent: "border-l-green-500", link: "/admin/events?status=approved" },
        { label: "Businesses", value: totals.businesses || 0, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", accent: "border-l-emerald-500", link: "/admin/business?status=approved" },
        { label: "Job Posts", value: totals.jobs || 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", accent: "border-l-blue-500", link: "/admin/career?type=jobs&status=approved" },
        { label: "Scholarships", value: totals.scholarships || 0, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", accent: "border-l-purple-500", link: "/admin/career?type=scholarships&status=approved" },
        { label: "Mentorships", value: totals.mentorships || 0, icon: HeartHandshake, color: "text-pink-600", bg: "bg-pink-50", accent: "border-l-pink-500", link: "/admin/career?type=mentorship&status=approved" },
        { label: "Help Requests", value: totals.helpRequests || 0, icon: Heart, color: "text-red-600", bg: "bg-red-50", accent: "border-l-red-500", link: "/admin/verification?tab=help" },
        { label: "Donations", value: totals.donations || 0, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50", accent: "border-l-amber-500", link: "/admin/donations", subtitle: `₹${(totals.donationAmount || 0).toLocaleString('en-IN')} total` },
        { label: "Hostels", value: totals.accommodations || 0, icon: Building2, color: "text-secondary", bg: "bg-secondary/10", accent: "border-l-secondary", link: "/admin/accommodations" },
        { label: "Newsletters", value: totals.newsletters || 0, icon: Newspaper, color: "text-slate-900", bg: "bg-slate-100", accent: "border-l-slate-900", link: "/admin/newsletters" },
    ]

    const pendingCards = [
        { label: "Total Pending", value: stats?.stats?.totalPending || 0, icon: AlertTriangle, color: "text-secondary", bg: "bg-secondary/10", accent: "border-l-secondary", link: "/admin/verification" },
        { label: "Job Posts", value: breakdown.pendingJobs || 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", accent: "border-l-blue-500", link: "/admin/verification?tab=jobs" },
        { label: "Mentorships", value: breakdown.pendingMentorships || 0, icon: HeartHandshake, color: "text-pink-600", bg: "bg-pink-50", accent: "border-l-pink-500", link: "/admin/career?type=mentorship&status=pending" },
        { label: "Help Requests", value: breakdown.pendingHelpRequests || 0, icon: Heart, color: "text-red-600", bg: "bg-red-50", accent: "border-l-red-500", link: "/admin/verification?tab=help" },
        { label: "Hostels", value: breakdown.pendingAccommodations || 0, icon: Building2, color: "text-secondary", bg: "bg-secondary/10", accent: "border-l-secondary", link: "/admin/accommodations" },
        { label: "Members", value: stats?.stats?.totalUsers || 0, icon: Users, color: "text-slate-900", bg: "bg-slate-100", accent: "border-l-slate-900", link: "/admin/users?status=pending", subtitle: "Registered users" },
    ]

    const activeCards = statsView === 'total' ? totalCards : pendingCards

    const timeRanges: { value: TimeRange; label: string }[] = [
        { value: '7d', label: '7D' },
        { value: '30d', label: '30D' },
        { value: '90d', label: '90D' },
        { value: '6m', label: '6M' },
        { value: '1y', label: '1Y' },
    ]

    const barChartData = statsView === 'pending'
        ? [
            { name: 'Jobs', value: breakdown.pendingJobs || 0, fill: '#3b82f6' },
            { name: 'Mentors', value: breakdown.pendingMentorships || 0, fill: '#ec4899' },
            { name: 'Help', value: breakdown.pendingHelpRequests || 0, fill: '#ef4444' },
            { name: 'Hostels', value: breakdown.pendingAccommodations || 0, fill: '#c2410c' },
        ]
        : [
            { name: 'Events', value: totals.events || 0, fill: '#22c55e' },
            { name: 'Business', value: totals.businesses || 0, fill: '#10b981' },
            { name: 'Jobs', value: totals.jobs || 0, fill: '#3b82f6' },
            { name: 'Scholar.', value: totals.scholarships || 0, fill: '#a855f7' },
            { name: 'Mentors', value: totals.mentorships || 0, fill: '#ec4899' },
            { name: 'Help', value: totals.helpRequests || 0, fill: '#ef4444' },
            { name: 'Hostels', value: totals.accommodations || 0, fill: '#c2410c' },
        ]

    const growthMetrics = [
        { id: 'userGrowth', label: 'Users', icon: Users, color: '#0F172A' },
        { id: 'businessGrowth', label: 'Business', icon: Building2, color: '#10b981' },
        { id: 'eventGrowth', label: 'Events', icon: Calendar, color: '#22c55e' },
        { id: 'jobGrowth', label: 'Jobs', icon: Briefcase, color: '#3b82f6' },
        { id: 'donationGrowth', label: 'Donations', icon: IndianRupee, color: '#f59e0b' },
        { id: 'scholarshipGrowth', label: 'Scholarships', icon: GraduationCap, color: '#a855f7' },
        { id: 'mentorshipGrowth', label: 'Mentorships', icon: HeartHandshake, color: '#ec4899' },
        { id: 'helpGrowth', label: 'Help Needs', icon: Heart, color: '#ef4444' },
        { id: 'accommodationGrowth', label: 'Hostels', icon: Building2, color: '#D4AF37' },
    ]

    const selectedMetric = growthMetrics.find(m => m.id === activeGrowthMetric) || growthMetrics[0]

    return (
        <div className="space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Admin <span className="text-secondary">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg md:text-xl">Overview of community activity and pending reviews.</p>
                </div>

                {/* Total / Pending Toggle */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 backdrop-blur-xl self-stretch lg:self-auto">
                    <button
                        onClick={() => setStatsView('total')}
                        className={`flex-1 lg:flex-none flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${statsView === 'total'
                            ? 'bg-slate-900 text-secondary shadow-lg shadow-slate-900/20'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <TrendingUp className="h-4 w-4" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setStatsView('pending')}
                        className={`flex-1 lg:flex-none flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${statsView === 'pending'
                            ? 'bg-secondary text-slate-900 shadow-lg shadow-secondary/20'
                            : 'text-slate-400 hover:text-secondary hover:bg-secondary/5'
                            }`}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Pending
                        {(stats?.stats?.totalPending || 0) > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 ${statsView === 'pending'
                                ? 'bg-slate-900/10 text-slate-900'
                                : 'bg-secondary/20 text-secondary'
                                }`}>
                                {stats?.stats?.totalPending}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {activeCards.map((card, i) => (
                    <Link key={`${statsView}-${i}`} href={card.link} className="group">
                        <Card className={`border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.12)] transition-all duration-500 cursor-pointer h-full border-l-[6px] ${card.accent} bg-white rounded-[2.5rem] overflow-hidden group-hover:-translate-y-2`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    {card.label}
                                </CardTitle>
                                <div className={`h-12 w-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${card.bg} border border-slate-100/50 shadow-sm`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} strokeWidth={2.5} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className={`text-4xl font-black tracking-tight ${card.color}`}>{card.value}</div>
                                {card.subtitle && (
                                    <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest opacity-70">{card.subtitle}</p>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                {/* User Growth Chart */}
                <Card className="border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] col-span-1 lg:col-span-3 bg-white rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-8 md:p-10 pb-4">
                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm`}>
                                        <selectedMetric.icon className="h-6 w-6" strokeWidth={2.5} />
                                    </div>
                                    <span>{selectedMetric.label} <span className="text-secondary">Growth Analysis</span></span>
                                </CardTitle>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-16">Tracking community growth and engagement</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto ml-auto">
                                {/* Metric Selector */}
                                <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                                    {growthMetrics.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setActiveGrowthMetric(m.id)}
                                            className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeGrowthMetric === m.id
                                                ? 'bg-white text-slate-900 shadow-md border border-slate-100'
                                                : 'text-slate-400 hover:text-slate-900'
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Range Selector */}
                                <div className="flex items-center gap-1.5 bg-slate-900/5 rounded-2xl p-1.5 border border-slate-100">
                                    {timeRanges.map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => handleRangeChange(r.value)}
                                            disabled={chartLoading}
                                            className={`px-3 py-2 text-[9px] font-black rounded-xl transition-all duration-300 ${timeRange === r.value
                                                ? 'bg-slate-900 text-secondary shadow-lg shadow-slate-900/20'
                                                : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 md:px-10 pb-10 h-[300px] md:h-[450px]">
                        {chartLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Loader2 className="h-12 w-12 animate-spin text-secondary/30" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading Data...</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.graphs?.[activeGrowthMetric] || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94A3B8"
                                        fontSize={10}
                                        fontWeight={700}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={15}
                                        interval={timeRange === '30d' ? 4 : timeRange === '7d' ? 0 : 'preserveStartEnd'}
                                    />
                                    <YAxis stroke="#94A3B8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '15px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                                        labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#64748B', marginBottom: '5px' }}
                                        itemStyle={{ fontWeight: 900, color: selectedMetric.color, fontSize: '14px' }}
                                        cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke={selectedMetric.color}
                                        strokeWidth={4}
                                        fill="url(#growthGrad)"
                                        dot={{ r: 4, fill: '#fff', stroke: selectedMetric.color, strokeWidth: 3 }}
                                        activeDot={{ r: 8, fill: selectedMetric.color, stroke: '#fff', strokeWidth: 4 }}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Breakdown Bar Chart */}
                <Card className="border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] col-span-1 lg:col-span-3 bg-white rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-8 md:p-10 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    Resource <span className="text-secondary">Breakdown</span>
                                </CardTitle>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource breakdown across platform sectors</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 ${statsView === 'pending' ? 'bg-secondary/10 text-secondary' : 'bg-slate-900/5 text-slate-900'
                                }`}>
                                {statsView === 'pending' ? 'Verification List' : 'Platform Content'}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 md:px-10 pb-10 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dy={15} />
                                <YAxis stroke="#94A3B8" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '20px', border: '1px solid #E2E8F0', padding: '15px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                                    labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#64748B', marginBottom: '5px' }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40} animationDuration={1500}>
                                    {barChartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Link */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-slate-950 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mt-32 -mr-32" />
                <div className="relative z-10 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                        <ShieldCheck className="h-4 w-4 text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Verified Community Access</span>
                    </div>
                    <h3 className="font-black text-3xl md:text-4xl text-white tracking-tight uppercase">Verification <span className="text-secondary/50">Center</span></h3>
                    <p className="text-slate-400 font-medium text-lg max-w-xl">Review and approve pending members, business listings, and professional profiles.</p>
                </div>
                <Link href="/admin/verification" className="relative z-10 bg-secondary text-slate-900 px-10 py-5 rounded-2xl hover:bg-white transition-all duration-300 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 active:scale-95 whitespace-nowrap">
                    Go to Verification Center
                </Link>
            </div>

        </div>
    )
}
