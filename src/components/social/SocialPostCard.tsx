"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar, MapPin, Briefcase, ChevronLeft, ChevronRight, Shield, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { CommentSection } from "@/components/social/CommentSection"

interface SocialPostProps {
    post: {
        id: string
        type: 'event' | 'business' | 'achievement'
        status?: string
        title: string
        description: string
        images: string[]
        createdAt: string
        author: {
            id: string
            name: string | null
            profileImage: string | null
        }
        metadata?: any
        stats: {
            likes: number
            comments: number
            shares: number
        }
        userInteractions: {
            isLiked: boolean
        }
    }
}

export function SocialPostCard({ post }: SocialPostProps) {
    const { user, getToken } = useAuth()
    const [isLiked, setIsLiked] = useState(post.userInteractions.isLiked)
    const [likeCount, setLikeCount] = useState(post.stats.likes)
    const [shareCount, setShareCount] = useState(post.stats.shares)
    const [commentCount, setCommentCount] = useState(post.stats.comments)
    const [showComments, setShowComments] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % post.images.length)
    }

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length)
    }

    const handleLike = async () => {
        if (!user) return // Should ideally show login prompt

        // Optimistic update
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const token = await getToken()
            const res = await fetch('/api/social/interactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    action: 'like',
                    contentType: post.type,
                    contentId: post.id
                })
            })

            if (!res.ok) throw new Error("Failed to interact")
        } catch (error) {
            // Revert on failure
            setIsLiked(isLiked)
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
            console.error(error)
        }
    }

    const handleShare = async () => {
        // Optimistic update for share count
        setShareCount(prev => prev + 1)

        try {
            const token = await getToken()
            await fetch('/api/social/interactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    action: 'share',
                    contentType: post.type,
                    contentId: post.id,
                    platform: 'copy'
                })
            })

            // Generate link based on type
            let link = ""
            switch (post.type) {
                case 'event': link = `/events/${post.id}`; break;
                case 'business': link = `/business/${post.id}`; break;
                case 'achievement': link = `/achievements/${post.id}`; break;
            }

            await navigator.clipboard.writeText(`${window.location.origin}${link}`)
            alert("Link copied to clipboard!")
        } catch (error) {
            setShareCount(prev => prev - 1)
            console.error("Failed to share", error)
        }
    }

    // Badge styling based on post type
    const getTypeBadge = () => {
        switch (post.type) {
            case 'event': return <span className="text-[10px] uppercase tracking-[0.2em] font-black bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">Event</span>
            case 'business': return <span className="text-[10px] uppercase tracking-[0.2em] font-black bg-slate-900 text-white px-3 py-1 rounded-full">Business</span>
            case 'achievement': return <span className="text-[10px] uppercase tracking-[0.2em] font-black bg-slate-50 text-slate-500 px-3 py-1 rounded-full border border-slate-100">Achievement</span>
        }
    }

    const renderMetadata = () => {
        if (!post.metadata) return null;

        return (
            <div className="flex flex-wrap gap-4 mt-6">
                {post.metadata.date && (
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-secondary" />
                        {new Date(post.metadata.date).toLocaleDateString()}
                    </div>
                )}
                {post.metadata.location && (
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-secondary" />
                        {post.metadata.location}
                    </div>
                )}
                {post.metadata.category && (
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Briefcase className="h-3.5 w-3.5 mr-2 text-slate-900" />
                        {post.metadata.category}
                    </div>
                )}
            </div>
        )
    }

    // Determine the deep link based on post type
    const postLink = post.type === 'event' ? `/events/${post.id}` :
        post.type === 'business' ? `/business/${post.id}` :
            `/achievements/${post.id}`

    const isDeletedByAdmin = post.status === 'deleted_by_admin'

    if (isDeletedByAdmin) {
        return (
            <Card className="overflow-hidden border-red-50 shadow-2xl shadow-red-500/5 bg-red-50/20 rounded-[3rem] group">
                <CardHeader className="p-8 flex flex-row items-center space-y-0 space-x-4 pb-4 opacity-40">
                    <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center">
                        <Shield className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Content Restricted</span>
                            {getTypeBadge()}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="px-10 py-12 flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-[2rem] bg-red-100 flex items-center justify-center mb-6">
                        <Shield className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-black text-red-900 tracking-tight">Post Unavailable</h3>
                    <p className="text-red-700/60 font-medium mt-3 max-w-sm leading-relaxed">
                        This post has been removed by community administrators for policy violations.
                    </p>
                </CardContent>
                <CardFooter className="p-4 bg-red-100/30 border-t border-red-100 flex justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-700/40">Moderated Feed</span>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-secondary/5 transition-all duration-500 bg-white group rounded-[3rem]">
            <CardHeader className="p-8 flex flex-row items-center space-y-0 space-x-5 pb-6">
                {/* Author Avatar */}
                <Link href="#" className="flex-shrink-0 group/avatar">
                    <div className="h-14 w-14 rounded-2xl border border-slate-100 overflow-hidden relative bg-slate-50 flex items-center justify-center shadow-sm group-hover/avatar:shadow-xl transition-all">
                        {post.author.profileImage ? (
                            <Image src={post.author.profileImage} alt={post.author.name || 'User'} fill className="object-cover" />
                        ) : (
                            <span className="text-slate-900 font-black text-xl">{post.author.name?.[0]?.toUpperCase() || 'M'}</span>
                        )}
                    </div>
                </Link>

                {/* Author Info & Date */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <Link href="#" className="font-black text-slate-900 tracking-tight hover:text-secondary transition-colors text-lg">
                            {post.author.name || 'Community Member'}
                        </Link>
                        {getTypeBadge()}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </CardHeader>

            {/* Post Content */}
            <CardContent className="p-0">
                <div className="px-8 pb-8">
                    <Link href={postLink} className="block group/link">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight group-hover/link:text-secondary transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                    </Link>
                    <p className="text-slate-600 font-medium text-lg mt-4 line-clamp-3 leading-relaxed">
                        {post.description}
                    </p>

                    {renderMetadata()}
                </div>

                {/* Media */}
                {post.images && post.images.length > 0 && (
                    <div className="relative w-full aspect-video bg-slate-100 overflow-hidden border-y border-slate-100 group/slider mx-auto mb-2">
                        {/* Blurred Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <Image
                                src={post.images[currentImageIndex]}
                                alt="Background Blur"
                                fill
                                className="object-cover blur-2xl scale-110 opacity-30 brightness-90"
                            />
                        </div>

                        <Link href={postLink} className="block h-full w-full relative z-10">
                            <Image
                                src={post.images[currentImageIndex]}
                                alt={post.title}
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                priority={currentImageIndex === 0}
                            />
                        </Link>

                        {/* Slider Controls */}
                        {post.images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-slate-900 hover:text-white text-slate-900 rounded-2xl h-12 w-12 opacity-0 group-hover/slider:opacity-100 transition-all border border-slate-200 shadow-xl"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-slate-900 hover:text-white text-slate-900 rounded-2xl h-12 w-12 opacity-0 group-hover/slider:opacity-100 transition-all border border-slate-200 shadow-xl"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>

                                {/* Dots indicator */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {post.images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-500",
                                                idx === currentImageIndex ? "bg-white w-8 shadow-sm" : "bg-white/40 w-1.5"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Interaction Footer */}
            <CardFooter className="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-between gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                        "flex-1 h-14 rounded-2xl gap-3 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white hover:text-slate-900 hover:shadow-xl hover:shadow-slate-200/50",
                        isLiked && "text-secondary bg-white shadow-xl shadow-secondary/10 hover:text-secondary"
                    )}
                >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                    <span>{likeCount > 0 ? likeCount : ''} Likes</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                    className={cn(
                        "flex-1 h-14 rounded-2xl gap-3 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white hover:text-slate-900 hover:shadow-xl hover:shadow-slate-200/50",
                        showComments && "bg-white text-slate-900 shadow-xl shadow-slate-200/50"
                    )}
                >
                    <MessageCircle className="h-5 w-5" />
                    <span>{commentCount > 0 ? commentCount : ''} Comments</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 h-14 rounded-2xl gap-3 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white hover:text-slate-900 hover:shadow-xl hover:shadow-slate-200/50"
                >
                    <Share2 className="h-5 w-5" />
                    <span>{shareCount > 0 ? shareCount : ''} Shares</span>
                </Button>
            </CardFooter>

            {/* Expandable Comment Section */}
            {showComments && (
                <div className="border-t border-slate-50 bg-slate-50/20">
                    <CommentSection
                        postId={post.id}
                        postType={post.type}
                        onCommentAdded={() => setCommentCount(prev => prev + 1)}
                    />
                </div>
            )}
        </Card>
    )
}
