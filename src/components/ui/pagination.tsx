"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className
}: PaginationProps) {
    if (totalPages <= 1) return null

    const renderPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(renderPageButton(i))
            }
        } else {
            // Always show first page
            pages.push(renderPageButton(1))

            if (currentPage > 3) {
                pages.push(<span key="ellipsis-start" className="flex items-end px-2"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></span>)
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(renderPageButton(i))
            }

            if (currentPage < totalPages - 2) {
                pages.push(<span key="ellipsis-end" className="flex items-end px-2"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></span>)
            }

            // Always show last page
            pages.push(renderPageButton(totalPages))
        }

        return pages
    }

    const renderPageButton = (page: number) => (
        <Button
            key={page}
            variant={currentPage === page ? "primary" : "outline"}
            size="sm"
            className={cn(
                "h-9 min-w-9 px-2 rounded-lg font-black text-xs uppercase transition-all",
                currentPage === page
                    ? "bg-slate-900 text-secondary shadow-lg shadow-slate-200"
                    : "text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => onPageChange(page)}
        >
            {page}
        </Button>
    )
    return (
        <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
            <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-lg text-slate-900 border border-slate-100 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 transition-all"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                Prev
            </Button>

            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-lg text-slate-900 border border-slate-100 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 transition-all"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    )
}
