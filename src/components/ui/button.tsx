import * as React from "react"
// import { Slot } from "@radix-ui/react-slot" - Removed unused import
// Actually, I can just use a simple button without Slot for now unless I need polymorphism.
// Let's stick to simple props.

import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            primary: "bg-slate-900 text-white hover:bg-secondary hover:text-slate-900 transition-all",
            secondary: "bg-secondary text-slate-900 hover:bg-slate-900 hover:text-white transition-all",
            outline: "border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white transition-all",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            destructive: "bg-red-600 text-white hover:bg-red-700",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-9 w-9",
        }

        const Comp = "button"

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
