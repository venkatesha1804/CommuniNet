"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Save, Send, ArrowLeft, Eye, Edit3 } from "lucide-react"
import Link from "next/link"

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
})

interface NewsletterBuilderProps {
    initialData?: {
        title: string
        content: string
    }
    onSubmit: (data: { title: string; content: string; publish: boolean }) => Promise<void>
    isSubmitting: boolean
    title: string
}

export function NewsletterBuilder({ initialData, onSubmit, isSubmitting, title }: NewsletterBuilderProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        content: initialData?.content || ""
    })
    const [previewMode, setPreviewMode] = useState(false)

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"]
        ]
    }), [])

    const handleSave = () => onSubmit({ ...formData, publish: false })
    const handlePublish = () => {
        if (confirm("Are you sure you want to publish and broadcast this newsletter to all members?")) {
            onSubmit({ ...formData, publish: true })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <Link href="/admin/newsletters" className="text-slate-400 hover:text-slate-900 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-colors">
                    <ArrowLeft className="h-3 w-3" /> Back to Hub
                </Link>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="rounded-xl font-bold text-xs"
                    >
                        {previewMode ? <><Edit3 className="h-4 w-4 mr-2" /> Editor</> : <><Eye className="h-4 w-4 mr-2" /> Preview</>}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary ml-1">Newsletter Subject</label>
                    <Input
                        placeholder="e.g., Monthly Community Update - March 2026"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="h-16 text-xl font-black rounded-2xl border-slate-200 focus:ring-secondary focus:border-secondary shadow-sm"
                    />
                </div>

                {previewMode ? (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary ml-1">Live Preview</label>
                        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white min-h-[500px]">
                            <CardContent className="p-8 md:p-12">
                                <h1 className="text-4xl font-black text-slate-900 mb-8 border-b pb-8">{formData.title || "Untitled Newsletter"}</h1>
                                <div
                                    className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed text-lg"
                                    dangerouslySetInnerHTML={{ __html: formData.content }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary ml-1">Content Editor</label>
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                modules={modules}
                                className="quill-editor h-[500px]"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                <Button
                    onClick={handleSave}
                    disabled={isSubmitting || !formData.title}
                    className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-xs transition-all shadow-sm"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Draft
                </Button>
                <Button
                    onClick={handlePublish}
                    disabled={isSubmitting || !formData.title || !formData.content}
                    className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-200"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Publish & Send to All
                </Button>
            </div>

            <style jsx global>{`
                .quill-editor .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid #f1f5f9;
                    padding: 1.5rem;
                    background: #f8fafc;
                }
                .quill-editor .ql-container {
                    border: none;
                    font-family: inherit;
                    font-size: 1.125rem;
                }
                .quill-editor .ql-editor {
                    padding: 2rem;
                    min-height: 400px;
                }
                .quill-editor .ql-editor.ql-blank::before {
                    left: 2rem;
                    font-style: italic;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    )
}
