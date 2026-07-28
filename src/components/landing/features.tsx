import {
    Building2,
    Briefcase,
    HandHeart,
    Trophy,
    Users,
    Zap
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

const features = [
    {
        title: "Social Feed",
        description: "Engage with real-time community updates, news, and professional networking in our unified social ecosystem.",
        icon: Users,
        color: "text-secondary group-hover:text-slate-900",
        bgHover: "group-hover:bg-secondary group-hover:border-secondary",
        href: "/social"
    },
    {
        title: "Career Growth",
        description: "Scale your professional journey with exclusive job listings, scholarships, and expert mentorship programs.",
        icon: Briefcase,
        color: "text-red-500 group-hover:text-white",
        bgHover: "group-hover:bg-red-500 group-hover:border-red-500",
        href: "/career"
    },
    {
        title: "Business Hub",
        description: "Access our verified directory for B2B collaborations and promote your services within the community.",
        icon: Building2,
        color: "text-secondary group-hover:text-slate-900",
        bgHover: "group-hover:bg-secondary group-hover:border-secondary",
        href: "/business"
    },
    {
        title: "Emergency Support",
        description: "Rapid response system for medical emergencies, blood requirements, and community-driven financial aid.",
        icon: HandHeart,
        color: "text-red-500 group-hover:text-white",
        bgHover: "group-hover:bg-red-500 group-hover:border-red-500",
        href: "/help"
    },
    {
        title: "Verified Hostels",
        description: "Locate trusted, safe, and community-verified accommodations for students and professionals across cities.",
        icon: Building2,
        color: "text-secondary group-hover:text-slate-900",
        bgHover: "group-hover:bg-secondary group-hover:border-secondary",
        href: "/accommodations"
    },
    {
        title: "Success Stories",
        description: "Celebrating the milestones and global achievements of our members to inspire the next generation.",
        icon: Trophy,
        color: "text-red-500 group-hover:text-white",
        bgHover: "group-hover:bg-red-500 group-hover:border-red-500",
        href: "/achievements"
    }
]

export function FeaturesSection() {
    return (
        <section className="py-16 md:py-32 bg-white relative overflow-hidden border-y border-slate-100">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Section Header */}
                <ScrollAnimation animation="fade-up">
                    <div className="text-center max-w-4xl mx-auto mb-12 md:mb-24 animate-slide-up">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 uppercase tracking-tight">Integrated <span className="text-secondary">Ecosystem</span></h2>
                        <div className="w-20 md:w-32 h-1.5 bg-secondary mx-auto mb-6 md:mb-8 rounded-full shadow-sm"></div>
                        <p className="text-slate-500 text-base md:text-2xl leading-relaxed font-medium">
                            Our platform is designed to provide comprehensive support for personal and professional growth while preserving our rich cultural values.
                        </p>
                    </div>
                </ScrollAnimation>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {features.map((feature, index) => (
                        <ScrollAnimation key={index} animation="fade-up" delay={index * 0.1}>
                            <Link href={feature.href} className="block h-full animate-slide-up">
                                <Card className="border-slate-100 transition-all duration-500 group h-full cursor-pointer shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] hover:-translate-y-2 hover:border-secondary/30 bg-white rounded-[2.5rem] overflow-hidden">
                                    <CardContent className="p-8 md:p-10">
                                        <div className={`
                    mb-6 md:mb-8 h-16 w-16 md:h-20 md:w-20 rounded-[1.25rem] flex items-center justify-center
                    bg-slate-50 border border-slate-100 transition-all duration-500 shadow-sm
                    ${feature.color} ${feature.bgHover}
                    `}>
                                            <feature.icon className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="font-sans text-2xl md:text-3xl font-black text-slate-900 group-hover:text-secondary transition-colors mb-4 tracking-tight uppercase">
                                            {feature.title}
                                        </h3>
                                        <p className="text-lg text-slate-500 leading-relaxed font-medium">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </ScrollAnimation>
                    ))}
                </div>

            </div>
        </section>
    )
}
