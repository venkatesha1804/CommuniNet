"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimationProps {
    children: ReactNode
    className?: string
    animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-up"
    delay?: number
    duration?: number
    once?: boolean
}

export function ScrollAnimation({
    children,
    className,
    animation = "fade-up",
    delay = 0,
    duration = 0.5,
    once = true
}: ScrollAnimationProps) {
    const variants = {
        "fade-up": {
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 }
        },
        "fade-in": {
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
        },
        "fade-left": {
            hidden: { opacity: 0, x: 40 },
            visible: { opacity: 1, x: 0 }
        },
        "fade-right": {
            hidden: { opacity: 0, x: -40 },
            visible: { opacity: 1, x: 0 }
        },
        "scale-up": {
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1 }
        }
    }

    return (
        <motion.div
            className={cn(className)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: "-100px" }}
            transition={{
                duration: duration,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            variants={variants[animation]}
        >
            {children}
        </motion.div>
    )
}
