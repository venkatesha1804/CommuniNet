"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "primary" | "destructive"
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] overflow-hidden border-slate-100 shadow-2xl p-0">
                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${variant === "destructive" ? "bg-red-50 text-red-600" : "bg-slate-50 text-secondary"
                            }`}>
                            {variant === "destructive" ? (
                                <AlertTriangle className="h-6 w-6" />
                            ) : (
                                <Info className="h-6 w-6" />
                            )}
                        </div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="p-8 pt-6 flex gap-3 bg-slate-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 h-11 rounded-xl border-slate-200 text-slate-900 hover:bg-white font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "primary"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${variant === "primary" ? "bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 shadow-lg shadow-slate-200" : ""
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
