import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        return (
            <input
                type="checkbox"
                className={cn(
                    "h-5 w-5 shrink-0 rounded-lg border-2 border-slate-200 text-secondary focus:ring-secondary accent-secondary cursor-pointer transition-all",
                    className
                )}
                ref={ref}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                {...props}
            />
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
