import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold", iconSize)}>
        <span className="text-xs">FT</span>
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight", textSize)}>FinTrack</span>
      )}
    </div>
  )
}
