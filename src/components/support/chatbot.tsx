"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User, Bot, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

type Message = {
    id: string
    sender: 'bot' | 'user'
    text: string
    isHtml?: boolean
}

type ChatbotState = 'menu' | 'escalating_subject' | 'escalating_body'

const QUICK_REPLIES = [
    { label: "Registration Help", query: "How do I register or login?" },
    { label: "Blood Donation", query: "How do I find blood donors?" },
    { label: "Career & Jobs", query: "How do I post a job?" },
    { label: "Admin Support", query: "I need to speak to an Admin." },
]

export function Chatbot() {
    const { user, isAuthenticated } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [chatState, setChatState] = useState<ChatbotState>('menu')
    const [ticketData, setTicketData] = useState({ subject: "", body: "" })
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return;
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    sender: 'bot',
                    text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm the CommuNet Assistant. How can I help you today?`
                }
            ])
        }
    }, [user, messages.length, mounted])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (text: string) => {
        if (!text.trim()) return
        const userMsgId = crypto.randomUUID()
        setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }])
        setInputValue("")

        if (chatState === 'menu') {
            await processMenuQuery(text)
        } else if (chatState === 'escalating_subject') {
            setTicketData(prev => ({ ...prev, subject: text }))
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                sender: 'bot',
                text: "Please describe your issue in detail so our admins can assist you better:"
            }])
            setChatState('escalating_body')
        } else if (chatState === 'escalating_body') {
            await handleTicketSubmission(ticketData.subject, text)
        }
    }

    const processMenuQuery = async (text: string) => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 600))
        setIsLoading(false)

        const lowerText = text.toLowerCase()
        let botResponse = ""
        let isHtml = false

        if (lowerText.includes("register") || lowerText.includes("login") || lowerText.includes("sign up")) {
            botResponse = "To register or log in, please visit our <a href='/login' class='text-secondary underline font-black uppercase tracking-widest text-[9px]'>Login/Register page</a>. If you are registering, your account will be pending Admin approval."
            isHtml = true
        } else if (lowerText.includes("blood") || lowerText.includes("emergency")) {
            botResponse = "For medical emergencies or blood requirements, please visit the <a href='/help' class='text-secondary underline font-black uppercase tracking-widest text-[9px]'>Emergency Help Center</a>."
            isHtml = true
        } else if (lowerText.includes("job") || lowerText.includes("career")) {
            botResponse = "Looking to post or find a job? Head over to the <a href='/career?tab=jobs' class='text-secondary underline font-black uppercase tracking-widest text-[9px]'>Career Hub</a>."
            isHtml = true
        } else if (lowerText.includes("admin") || lowerText.includes("human") || lowerText.includes("ticket") || lowerText.includes("speak to")) {
            botResponse = !isAuthenticated
                ? "It looks like you are not logged in. While you can submit a ticket, logging in helps us serve you better. What is the **Subject** of your issue?"
                : "I can help you create a support ticket. What is the **Subject** of your issue?"
            setChatState('escalating_subject')
        } else {
            botResponse = "I'm still learning and might not have the answer to that. Would you like me to connect you with an Admin? (Try asking to 'Speak to Admin')"
        }

        setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'bot', text: botResponse, isHtml }])
    }

    const handleTicketSubmission = async (subject: string, body: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: 'General Support', subject, body })
            })
            if (res.ok) {
                setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'bot', text: "Your support ticket has been submitted! An Admin will review it shortly." }])
            } else {
                setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'bot', text: "I'm sorry, there was a problem. Please try again later." }])
            }
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'bot', text: "An error occurred while reaching the server." }])
        } finally {
            setIsLoading(false)
            setChatState('menu')
            setTicketData({ subject: "", body: "" })
        }
    }

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-16 w-16 rounded-full shadow-2xl bg-slate-900 hover:bg-secondary text-white hover:text-slate-900 transition-all duration-500 overflow-hidden flex items-center justify-center p-0",
                    isOpen ? "rotate-[360deg] scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )}
            >
                <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-slate-900 to-slate-800">
                    <MessageCircle className="h-7 w-7" />
                </div>
            </Button>

            <div
                className={cn(
                    "absolute bottom-0 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-[#FAF9F6] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col transition-all duration-500 origin-bottom-right overflow-hidden",
                    isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10"
                )}
            >
                <div className="bg-slate-900 p-6 text-white flex items-center justify-between shadow-xl z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2.5 rounded-2xl border border-white/5">
                            <Bot className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                            <h3 className="font-black text-xs uppercase tracking-widest text-white">CommuNet Assistant</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Support</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10 h-10 w-10 rounded-2xl transition-all">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-slate-50 to-[#FAF9F6]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn("flex max-w-[85%] gap-3", msg.sender === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center shadow-sm border", msg.sender === 'user' ? "bg-secondary text-slate-900 border-secondary" : "bg-white text-slate-900 border-slate-100")}>
                                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={cn(
                                    "px-5 py-3.5 rounded-3xl text-sm shadow-sm leading-relaxed",
                                    msg.sender === 'user'
                                        ? "bg-slate-900 text-white rounded-tr-lg"
                                        : "bg-white border border-slate-100 text-slate-900 rounded-tl-lg"
                                )}>
                                    {msg.isHtml ? (
                                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="flex max-w-[85%] gap-3 flex-row">
                                <div className="shrink-0 h-9 w-9 rounded-2xl bg-white border border-slate-100 text-slate-900 flex items-center justify-center shadow-sm">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="px-5 py-4 rounded-3xl bg-white border border-slate-100 rounded-tl-lg shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                    {chatState === 'menu' && !isLoading && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {QUICK_REPLIES.map((reply, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(reply.query)}
                                    className="text-[10px] px-4 py-2 border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all bg-white font-black uppercase tracking-widest shadow-sm"
                                >
                                    {reply.label}
                                </button>
                            ))}
                        </div>
                    )}
                    {chatState !== 'menu' && (
                        <div className="flex items-center gap-2 mb-3 px-1 text-[10px] text-secondary font-black uppercase tracking-widest">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Escalating to Admin Issue Ticket...
                        </div>
                    )}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={chatState === 'menu' ? "How can we help?" : "Please provide details..."}
                            className="flex-1 rounded-2xl border-slate-200 focus-visible:ring-secondary bg-slate-50 h-12 px-6 text-sm"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim() || isLoading}
                            className="h-12 w-12 shrink-0 rounded-2xl bg-slate-900 hover:bg-secondary hover:text-slate-900 text-white shadow-lg transition-all"
                        >
                            <Send className="h-5 w-5 ml-0.5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
