"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Loader2, AlertTriangle, Briefcase, Calendar, HeartHandshake, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

type NotificationType = 'emergency' | 'job' | 'event' | 'social' | 'system'

interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    read: boolean
    link?: string
    createdAt: string
}

export function NotificationBell() {
    const { isAuthenticated, getToken } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const fetchNotifications = async () => {
        if (!isAuthenticated) return
        try {
            const token = await getToken()
            const res = await fetch("/api/notifications", {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter((n: Notification) => !n.read).length)
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleRead = async (id: string, link?: string) => {
        try {
            const token = await getToken()
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ id })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))

            if (link) {
                setIsOpen(false)
                router.push(link)
            }
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const handleReadAll = async () => {
        setLoading(true)
        try {
            const token = await getToken()
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ readAll: true })
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAll = async () => {
        setLoading(true)
        try {
            const token = await getToken()
            await fetch("/api/notifications?all=true", {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            })
            setNotifications([])
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to delete notifications", error)
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'job': return <Briefcase className="h-4 w-4 text-blue-500" />
            case 'event': return <Calendar className="h-4 w-4 text-green-500" />
            case 'social': return <HeartHandshake className="h-4 w-4 text-pink-500" />
            default: return <Info className="h-4 w-4 text-maroon" />
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-900 hover:bg-secondary/10 rounded-full h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-cream" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 bg-cream/95 backdrop-blur-md border-gold/20 shadow-xl overflow-hidden mt-2">
                <div className="flex items-center justify-between px-4 py-3 bg-white/50 border-b border-gold/10">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-maroon">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-slate-900 text-secondary text-xs px-2 py-0.5 rounded-full font-black">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex gap-1">
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-maroon hover:bg-maroon/10" onClick={handleReadAll} disabled={loading} title="Mark all as read">
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={handleDeleteAll} disabled={loading} title="Clear all">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-maroon" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 text-gold/50 mb-3" />
                            <p className="font-medium text-maroon/70">No notifications yet</p>
                            <p className="text-xs">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`relative flex items-start gap-3 p-4 transition-colors cursor-pointer border-b border-gold/5 last:border-0 ${n.read ? 'hover:bg-gold/5 opacity-80' : 'bg-white hover:bg-white/80'}`}
                                    onClick={() => handleRead(n.id, n.link)}
                                >
                                    {!n.read && (
                                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-maroon" />
                                    )}
                                    <div className="mt-0.5 bg-gold/10 p-2 rounded-full shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-hidden">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-semibold truncate ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {n.title}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] font-medium text-muted-foreground pt-1">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
