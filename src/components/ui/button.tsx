import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]/50 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Standard variants with rounded-md
        default: "rounded-md bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "rounded-md bg-destructive text-white hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        // ============================================
        // ANTIGRAVITY VARIANTS - Exact Google Antigravity replica
        // ============================================

        // Primary: Deep black (#131314), white text, pill shape
        // Hover: scale(1.03) + subtle brightness boost
        // Active: scale(0.96) tactile shrink
        "antigravity-primary":
          "rounded-full bg-[#131314] text-white font-medium hover:bg-[#2a2a2c] hover:scale-[1.03] hover:shadow-lg active:scale-[0.96] active:bg-[#131314]",

        // Secondary: Light grey (#F0F4F9), dark text, pill shape
        "antigravity-secondary":
          "rounded-full bg-[#F0F4F9] text-[#131314] font-medium hover:bg-[#e4e8ed] hover:scale-[1.03] hover:shadow-md active:scale-[0.96] dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",

        // Ghost pill: Transparent with subtle hover
        "antigravity-ghost":
          "rounded-full hover:bg-[#F0F4F9] hover:scale-[1.02] active:scale-[0.98] text-[#131314] dark:text-white dark:hover:bg-slate-800",

        // Outline pill: Border with transparent bg
        "antigravity-outline":
          "rounded-full border border-[#d1d5db] bg-transparent text-[#131314] hover:bg-[#F0F4F9] hover:scale-[1.02] active:scale-[0.96] dark:border-slate-700 dark:text-white dark:hover:bg-slate-800",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-12 px-8 text-base has-[>svg]:px-6",
        icon: "size-9 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
        // Pill icon sizes
        "icon-pill": "size-9 rounded-full",
        "icon-pill-sm": "size-8 rounded-full",
        "icon-pill-lg": "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
