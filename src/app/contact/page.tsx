"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { validateRequired, validateMinLength, validateEmail, validatePhone, collectErrors } from "@/lib/validation"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Name'), validateMinLength(formData.name, 2, 'Name')],
            phone: [validateRequired(formData.phone, 'Phone Number'), validatePhone(formData.phone)],
            email: [validateRequired(formData.email, 'Email'), validateEmail(formData.email)],
            message: [validateRequired(formData.message, 'Message'), validateMinLength(formData.message, 10, 'Message')],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        alert("Message sent successfully!")
        setIsSubmitting(false)
        setFormData({ name: '', phone: '', email: '', message: '' })
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
            <Navbar />

            <main className="flex-1">
                <div className="bg-slate-900 text-white pt-20 pb-28 px-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mt-48 -mr-48"></div>
                    <div className="relative z-10 container mx-auto">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold uppercase tracking-widest backdrop-blur-md">Contact Us</div>
                        <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 tracking-tight">Get in Touch</h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
                            Have questions about the community, events, or membership? We&apos;re here to help.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 md:py-16 -mt-16 md:-mt-20 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        {/* Contact Info Cards */}
                        <div className="space-y-6 md:space-y-8">
                            <Card className="bg-white shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] border-transparent hover:border-secondary/30 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 rounded-[2.5rem] group hover:-translate-y-1">
                                <CardContent className="p-8 flex items-start gap-5">
                                    <div className="bg-secondary/10 p-4 rounded-2xl text-secondary border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                                        <Phone className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-sans text-xl font-bold text-slate-900 mb-2 tracking-tight">Call Us</h3>
                                        <p className="text-base text-slate-600 font-medium">+91 99887 76655</p>
                                        <p className="text-sm text-slate-400 mt-1 font-medium">Mon-Sat, 9am - 6pm</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] border-transparent hover:border-secondary/30 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 rounded-[2.5rem] group hover:-translate-y-1">
                                <CardContent className="p-8 flex items-start gap-5">
                                    <div className="bg-secondary/10 p-4 rounded-2xl text-secondary border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                                        <Mail className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-sans text-xl font-bold text-slate-900 mb-2 tracking-tight">Email Us</h3>
                                        <p className="text-base text-slate-600 font-medium">contact@communet.com</p>
                                        <p className="text-base text-slate-600 font-medium mt-1">support@communet.com</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] border-transparent hover:border-secondary/30 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 rounded-[2.5rem] group hover:-translate-y-1">
                                <CardContent className="p-8 flex items-start gap-5">
                                    <div className="bg-secondary/10 p-4 rounded-2xl text-secondary border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                                        <MapPin className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-sans text-xl font-bold text-slate-900 mb-2 tracking-tight">Visit Us</h3>
                                        <p className="text-base text-slate-600 font-medium leading-relaxed">
                                            CommuNet Samaj Bhavan,<br />
                                            Jayanagar 4th Block,<br />
                                            Bangalore - 560011
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <Card className="bg-white shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] border-transparent rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8 md:p-12">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-10 w-2.5 bg-secondary rounded-full"></div>
                                        <h2 className="text-2xl md:text-3xl font-sans font-black text-slate-900 tracking-tight">Send us a Message</h2>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Your Name *</label>
                                                <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className={`h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary px-5 text-base ${errors.name ? 'border-red-500 bg-red-50/50' : ''}`} />
                                                {errors.name && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.name}</p>}
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phone Number *</label>
                                                <Input name="phone" placeholder="9876543210" value={formData.phone} onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                    setFormData({ ...formData, phone: val })
                                                    if (errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n })
                                                }} maxLength={10} className={`h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary px-5 text-base ${errors.phone ? 'border-red-500 bg-red-50/50' : ''}`} />
                                                {errors.phone && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                                            <Input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className={`h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary px-5 text-base ${errors.email ? 'border-red-500 bg-red-50/50' : ''}`} />
                                            {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Message *</label>
                                            <textarea
                                                name="message"
                                                className={`w-full min-h-[180px] rounded-2xl border bg-slate-50 px-5 py-4 text-base ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-secondary focus-visible:ring-offset-0 transition-all ${errors.message ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`}
                                                placeholder="How can we help you? (min 10 characters)"
                                                value={formData.message}
                                                onChange={handleChange}
                                            />
                                            {errors.message && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.message}</p>}
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-14 bg-slate-900 hover:bg-secondary text-white hover:text-slate-900 border-none text-lg font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send className="mr-2 h-5 w-5" /> Send Message</>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
