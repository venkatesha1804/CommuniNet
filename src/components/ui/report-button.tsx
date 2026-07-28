"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Flag, Loader2, CheckCircle, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ReportButtonProps {
    contentType: string
    contentId: string
    contentTitle: string
    posterName?: string
    posterEmail?: string
    className?: string
}

const REASONS = [
    { value: "spam", label: "Spam or Scam", icon: "🚫" },
    { value: "inappropriate", label: "Inappropriate Content", icon: "⚠️" },
    { value: "misleading", label: "Misleading Information", icon: "❌" },
    { value: "harassment", label: "Harassment or Abuse", icon: "🛑" },
    { value: "other", label: "Other", icon: "📝" },
]

export function ReportButton({ contentType, contentId, contentTitle, posterName, posterEmail, className = "" }: ReportButtonProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [details, setDetails] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const btnRef = useRef<HTMLButtonElement>(null)

    // Don't show to guests or to the poster themselves
    if (!user) return null
    if (posterEmail && user.email === posterEmail) return null

    const handleSubmit = async () => {
        if (!reason) return
        setSubmitting(true)
        setError("")

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contentType,
                    contentId,
                    contentTitle,
                    posterName,
                    posterEmail,
                    reason,
                    details: details.trim() || undefined,
                })
            })

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    setOpen(false)
                    setSuccess(false)
                    setReason("")
                    setDetails("")
                }, 1500)
            } else {
                const data = await res.json()
                setError(data.message || "Failed to submit report")
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const modal = open && typeof document !== "undefined" ? createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                e.stopPropagation(); // Stop React event bubbling to parent links
                if (e.target === e.currentTarget) setOpen(false);
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()} // Stop bubbling from inside modal
            >
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-red-500" />
                        <h3 className="font-bold text-lg text-red-800">Report Content</h3>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {success ? (
                    <div className="px-6 py-12 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="font-semibold text-lg text-green-700">Report Submitted</p>
                        <p className="text-sm text-muted-foreground mt-1">Thank you. An admin will review this.</p>
                    </div>
                ) : (
                    <div className="px-6 py-5 space-y-4">
                        {/* Content Info */}
                        <div className="bg-gray-50 rounded-lg px-4 py-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Reporting</p>
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{contentTitle}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{contentType} {posterName ? `by ${posterName}` : ''}</p>
                        </div>

                        {/* Reason Selection */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Why are you reporting this?</p>
                            <div className="space-y-2">
                                {REASONS.map(r => (
                                    <label
                                        key={r.value}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${reason === r.value
                                            ? 'border-red-400 bg-red-50/50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="report-reason"
                                            value={r.value}
                                            checked={reason === r.value}
                                            onChange={() => setReason(r.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-base">{r.icon}</span>
                                        <span className="text-sm font-medium text-gray-700">{r.label}</span>
                                        {reason === r.value && (
                                            <CheckCircle className="h-4 w-4 text-red-500 ml-auto" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Additional Details (optional)</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Provide any additional context..."
                                className="w-full mt-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                                onClick={handleSubmit}
                                disabled={!reason || submitting}
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flag className="h-4 w-4 mr-2" />}
                                Submit Report
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    ) : null

    return (
        <>
            <Button
                ref={btnRef}
                variant="ghost"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
                className={`h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 ${className}`}
                title="Report"
            >
                <Flag className="h-3.5 w-3.5" />
            </Button>
            {modal}
        </>
    )
}
