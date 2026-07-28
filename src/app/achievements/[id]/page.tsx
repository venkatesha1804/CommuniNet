"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, ArrowLeft, Loader2, User, Trash2, Edit, Share2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface AchievementDetail {
    id: string
    title: string
    category: string
    date: string
    description: string
    images?: string[]
    status: string
    userId: string
    user: {
        name: string | null
        profileImage: string | null
        email: string | null
    }
}

export default function AchievementDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()

    const id = params.id as string

    const [achievement, setAchievement] = useState<AchievementDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const res = await fetch(`/api/achievements/${id}`)
                if (!res.ok) {
                    throw new Error("Achievement not found")
                }
                const data = await res.json()
                setAchievement(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchAchievement()
        }
    }, [id])

    const handleDelete = async () => {

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE', headers })
            if (res.ok) {
                setIsDeleteDialogOpen(false)
                router.push('/achievements')
                router.refresh()
            } else {
                alert("Failed to delete achievement")
            }
        } catch (e) {
            console.error(e)
            alert("An error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !achievement) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <Trophy className="h-16 w-16 text-secondary/20 mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Achievement Not Found</h2>
                    <p className="text-slate-500 font-bold mt-2 mb-6">The achievement you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/achievements")} variant="outline" className="border-slate-200 text-slate-900 font-black h-12 rounded-xl px-8 hover:bg-slate-900 hover:text-white transition-all">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Achievements
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const canModify = user?.id === achievement.userId || user?.role === 'admin'

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Hero / Header Section */}
                <div className="relative h-[320px] w-full bg-slate-900 overflow-hidden">
                    {achievement.images && achievement.images.length > 0 ? (
                        <>
                            {/* Blurred Backdrop */}
                            <Image
                                src={achievement.images[0]}
                                alt="Backdrop Blur"
                                fill
                                className="object-cover blur-3xl scale-125 opacity-40 brightness-50"
                            />
                            <Image
                                src={achievement.images[0]}
                                alt={achievement.title}
                                fill
                                className="object-contain transition-transform duration-700 hover:scale-105 relative z-10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Trophy className="h-[400px] w-[400px] text-secondary" />
                        </div>
                    )}

                    <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-12">
                        <div className="max-w-4xl">
                            <Link
                                href="/achievements"
                                className="inline-flex items-center text-secondary hover:text-white mb-6 transition-colors text-xs font-black uppercase tracking-widest"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Wall of Fame
                            </Link>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    {achievement.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-white/80 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                                    <Calendar className="h-4 w-4 text-secondary" />
                                    {new Date(achievement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <ShareButton
                                    url={`/achievements/${achievement.id}`}
                                    title={achievement.title}
                                    variant="button"
                                    size="sm"
                                    className="bg-secondary text-white hover:bg-white hover:text-slate-900 border-none px-4 h-9 font-black uppercase tracking-widest text-[8px]"
                                    details={`🏆 *Achievement: ${achievement.title}*\nBy: ${achievement.user.name || "Anonymous"}\nCategory: ${achievement.category}\nDate: ${new Date(achievement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n${achievement.description}`}
                                />
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                                {achievement.title}
                            </h1>

                            <div>
                                <Link href={`/members/${achievement.userId}`}>
                                    <div className="flex items-center gap-4 hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/20 inline-flex">
                                        <div className="h-12 w-12 rounded-full border-2 border-secondary overflow-hidden relative bg-white/10 backdrop-blur-sm shrink-0">
                                            {achievement.user.profileImage ? (
                                                <Image src={achievement.user.profileImage} alt={achievement.user.name || "User"} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-secondary font-black">
                                                    {achievement.user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-black truncate">{achievement.user.name || "Anonymous Member"}</p>
                                            <p className="text-secondary text-[10px] font-black uppercase tracking-widest">Contributor</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                                <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                                    The Story of Achievement
                                    <div className="h-px flex-1 bg-slate-100" />
                                </h2>
                                <div className="absolute top-8 right-8 text-secondary/5 pointer-events-none">
                                    <Trophy className="h-40 w-40" />
                                </div>

                                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line prose prose-slate max-w-none break-all">
                                    {achievement.description}
                                </div>

                                {/* Photo Gallery */}
                                {achievement.images && achievement.images.length > 1 && (
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                                            Achievement Gallery
                                            <div className="h-px flex-1 bg-slate-100" />
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {achievement.images.slice(1).map((img, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-[2rem] overflow-hidden border border-slate-100 group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img}
                                                        alt={`Achievement gallery photo ${idx + 1}`}
                                                        className="w-full h-full object-contain bg-slate-100 transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {canModify && (
                                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                                        <Link href={`/achievements/${achievement.id}/edit`}>
                                            <Button className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-secondary text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-200">
                                                <Edit className="h-4 w-4 mr-2" /> Edit Achievement
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="h-12 px-8 rounded-xl border-red-100 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all"
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                            Delete Post
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 text-center">
                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">Inspired by this?</h4>
                                <p className="text-sm text-slate-500 font-bold mb-6">Share your own success story with the community.</p>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-slate-100 text-slate-900 font-black hover:bg-slate-900 hover:text-white uppercase text-[10px] tracking-[0.2em] transition-all"
                                    onClick={() => {
                                        if (user?.role !== 'admin' && user?.status !== 'approved') {
                                            toast.error("Action Restricted", {
                                                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                            })
                                            return
                                        }
                                        router.push("/achievements/add")
                                    }}
                                >
                                    Post Achievement
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] border-slate-100 shadow-2xl rounded-[2.5rem]">
                        <DialogHeader>
                            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-center text-slate-900 tracking-tight">Delete Achievement?</DialogTitle>
                            <DialogDescription className="text-center text-slate-500 font-bold mt-2">
                                This action cannot be undone. This success story will be permanently removed from the Wall of Fame.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 flex flex-col items-center gap-2">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 w-full text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">Deleting Forever</p>
                                <p className="text-slate-900 font-black text-xl truncate">{achievement.title}</p>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-center flex-row gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 h-14 rounded-2xl border-slate-100 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Confirm
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>

            <Footer />
        </div>
    )
}
