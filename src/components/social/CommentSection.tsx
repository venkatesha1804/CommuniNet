"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface CommentUser {
    name: string | null
    profileImage: string | null
}

interface Comment {
    id: string
    content: string
    createdAt: string
    parentId: string | null
    user: CommentUser
    stats: {
        likes: number
    }
    userInteractions: {
        isLiked: boolean
    }
}

interface CommentSectionProps {
    postId: string
    postType: 'event' | 'business' | 'achievement'
    onCommentAdded: () => void
}

export function CommentSection({ postId, postType, onCommentAdded }: CommentSectionProps) {
    const { user, getToken } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null)

    useEffect(() => {
        fetchComments()
    }, [postId, postType])

    const fetchComments = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/social/interactions?action=comments&contentType=${postType}&contentId=${postId}`)
            const data = await res.json()
            if (res.ok) {
                setComments(data.data)
            } else {
                console.error("Failed to fetch comments", data.error)
            }
        } catch (error) {
            console.error("Error fetching comments:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !user) return

        try {
            setSubmitting(true)
            setError(null)

            const token = await getToken()
            const res = await fetch('/api/social/interactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    action: 'comment',
                    contentType: postType,
                    contentId: postId,
                    content: newComment.trim(),
                    parentId: replyingTo?.id || null
                })
            })

            const data = await res.json()
            if (res.ok) {
                // Ensure new comment has stats attached (since it's not from GET)
                const newlyAdded = {
                    ...data.comment,
                    stats: { likes: 0 },
                    userInteractions: { isLiked: false }
                }
                setComments(prev => [...prev, newlyAdded])
                setNewComment("")
                setReplyingTo(null)
                onCommentAdded()
            } else {
                setError(data.error || "Failed to add comment")
            }
        } catch (error) {
            setError("Something went wrong")
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleLikeComment = async (commentId: string, currentlyLiked: boolean) => {
        if (!user) return

        // Optimistic update
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    stats: { likes: currentlyLiked ? c.stats.likes - 1 : c.stats.likes + 1 },
                    userInteractions: { isLiked: !currentlyLiked }
                }
            }
            return c
        }))

        try {
            const token = await getToken()
            await fetch('/api/social/interactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    action: 'like',
                    contentType: 'comment',
                    contentId: commentId
                })
            })
        } catch (error) {
            // Revert optimisitic update on error (simplified)
            console.error("Failed to like comment")
        }
    }

    // Organize comments into a tree
    const topLevelComments = comments.filter(c => !c.parentId)
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId)

    if (loading) {
        return (
            <div className="py-4 flex justify-center items-center">
                <Loader2 className="h-5 w-5 text-secondary animate-spin" />
            </div>
        )
    }

    return (
        <div className="border-t border-slate-100 bg-slate-50/30 p-4 space-y-4">
            {/* Comment List */}
            <div className="space-y-5 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                {topLevelComments.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-2">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                ) : (
                    topLevelComments.map(comment => (
                        <div key={comment.id} className="space-y-4">
                            {/* Parent Comment */}
                            <div className="flex space-x-3">
                                <div className="h-8 w-8 rounded-full border border-slate-100 overflow-hidden relative flex-shrink-0 bg-slate-900/5 flex items-center justify-center shadow-sm">
                                    {comment.user?.profileImage ? (
                                        <Image src={comment.user.profileImage} alt={comment.user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <span className="text-slate-900 font-black text-xs">{comment.user?.name?.[0]?.toUpperCase() || 'M'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-gray-900">{comment.user?.name || "Member"}</span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 break-words leading-relaxed">{comment.content}</p>

                                    <div className="flex items-center gap-4 mt-1.5 text-xs font-medium text-gray-500">
                                        <button
                                            onClick={() => handleLikeComment(comment.id, comment.userInteractions.isLiked)}
                                            className={cn("flex items-center gap-1.5 hover:text-secondary transition-colors", comment.userInteractions.isLiked && "text-red-500")}
                                        >
                                            <span className="font-semibold">{comment.stats.likes > 0 ? comment.stats.likes : ''}</span>
                                            {comment.userInteractions.isLiked ? 'Liked' : 'Like'}
                                        </button>
                                        <button
                                            onClick={() => setReplyingTo({ id: comment.id, name: comment.user?.name || 'Member' })}
                                            className="hover:text-secondary transition-colors"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {getReplies(comment.id).length > 0 && (
                                <div className="pl-11 space-y-4">
                                    {getReplies(comment.id).map(reply => (
                                        <div key={reply.id} className="flex space-x-3">
                                            <div className="h-6 w-6 rounded-full border border-slate-100 overflow-hidden relative flex-shrink-0 bg-slate-900/5 flex items-center justify-center">
                                                {reply.user?.profileImage ? (
                                                    <Image src={reply.user.profileImage} alt={reply.user.name || 'User'} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-slate-900 font-black text-[10px]">{reply.user?.name?.[0]?.toUpperCase() || 'M'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-semibold text-gray-900">{reply.user?.name || "Member"}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 break-words leading-relaxed">{reply.content}</p>

                                                <div className="flex items-center gap-4 mt-1.5 text-[11px] font-medium text-gray-500">
                                                    <button
                                                        onClick={() => handleLikeComment(reply.id, reply.userInteractions.isLiked)}
                                                        className={cn("flex items-center gap-1.5 hover:text-secondary transition-colors", reply.userInteractions.isLiked && "text-red-500")}
                                                    >
                                                        <span className="font-semibold">{reply.stats.likes > 0 ? reply.stats.likes : ''}</span>
                                                        {reply.userInteractions.isLiked ? 'Liked' : 'Like'}
                                                    </button>
                                                    <button
                                                        onClick={() => setReplyingTo({ id: comment.id, name: reply.user?.name || 'Member' })}
                                                        className="hover:text-secondary transition-colors"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            {user ? (
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                    {replyingTo && (
                        <div className="flex items-center justify-between bg-secondary/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-secondary/20 shadow-sm">
                            <span>Replying to {replyingTo.name}</span>
                            <button onClick={() => setReplyingTo(null)} className="hover:text-red-500 font-black ml-4 transition-colors">✕</button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <div className="h-9 w-9 rounded-full border border-slate-100 overflow-hidden relative flex-shrink-0 bg-slate-900/5 flex items-center justify-center mb-0.5 shadow-sm">
                            {user.profileImage ? (
                                <Image src={user.profileImage} alt={user.name || 'User'} fill className="object-cover" />
                            ) : (
                                <span className="text-slate-900 font-black text-sm">{user.name?.[0]?.toUpperCase() || 'M'}</span>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <Input
                                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submitting}
                                className="pr-10 rounded-xl bg-white border-slate-100 focus-visible:ring-secondary/20 text-sm h-10 font-medium placeholder:text-slate-300"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="absolute right-1 top-1 h-8 w-8 p-0 flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-full"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="text-center py-2 border-t border-gray-100">
                    <p className="text-sm text-muted-foreground">Please sign in to leave a comment.</p>
                </div>
            )}
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
    )
}
