"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, Users, HandHeart, Briefcase, Calendar, GraduationCap, ShieldCheck, HeartPulse } from "lucide-react"

export default function FeaturesPage() {
    const features = [
        {
            icon: Building2,
            title: "Business Directory",
            description: "Promote your business to the entire community. Find trusted vendors and partners within the network.",
            link: "/business"
        },
        {
            icon: Calendar,
            title: "Community Events",
            description: "Stay updated with cultural gatherings, networking meets, and spiritual events. RSVP easily.",
            link: "/events"
        },
        {
            icon: Briefcase,
            title: "Career & Jobs",
            description: "Find job opportunities posted by community members or hire talent from within our verified pool.",
            link: "/career"
        },
        {
            icon: HandHeart,
            title: "Donations & Seva",
            description: "Contribute to meaningful causes like education funds, medical relief, and temple renovations.",
            link: "/donate"
        },
        {
            icon: GraduationCap,
            title: "Scholarships",
            description: "Financial aid and guidance for deserving students to pursue higher education.",
            link: "/career"
        },
        {
            icon: HeartPulse,
            title: "Health & Support",
            description: "Access a directory of doctors, blood donors, and emergency support within the community.",
            link: "/help"
        },
        {
            icon: Users,
            title: "Matrimony (Coming Soon)",
            description: "A trusted platform to find life partners within the community with verified profiles.",
            link: "#"
        },
        {
            icon: ShieldCheck,
            title: "Verified Members",
            description: "A safe digital space with verified user profiles to ensure trust and authenticity.",
            link: "/join"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-cream/50 py-10 md:py-16 px-4 text-center border-b border-gold/20 backdrop-blur-sm">
                    <div className="container mx-auto max-w-3xl">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold text-maroon mb-4 md:mb-6">Platform Features</h1>
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                            Everything you need to connect, grow, and contribute. A comprehensive suite of tools designed for our community.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-10 md:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="hover:shadow-lg transition-all hover:border-gold/40 border-gold/10 group">
                                <CardHeader>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-maroon/5 rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:bg-maroon group-hover:text-white transition-colors">
                                        <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-maroon group-hover:text-gold" />
                                    </div>
                                    <CardTitle className="text-lg md:text-xl font-bold text-gray-800">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm md:text-base mb-4 md:mb-6">
                                        {feature.description}
                                    </CardDescription>
                                    <Link href={feature.link}>
                                        <Button variant="link" className="p-0 text-maroon hover:text-gold font-semibold">
                                            Explore &rarr;
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 md:mt-20 text-center bg-gold/10 rounded-2xl p-8 md:p-12">
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-maroon mb-3 md:mb-4">Ready to Join?</h2>
                        <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-xl mx-auto">
                            Become a part of this vibrant digital community today. It&apos;s free and takes only a few minutes.
                        </p>
                        <Link href="/join">
                            <Button size="lg" className="bg-maroon text-gold hover:bg-maroon/90">
                                Register Now
                            </Button>
                        </Link>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    )
}
