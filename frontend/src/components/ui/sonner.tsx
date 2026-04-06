/**
 * sonner.tsx
 *
 * CORRIGIDO: usa nosso useTheme (ThemeContext) em vez de next-themes,
 * que não está no projeto. next-themes é específico do Next.js.
 */
import { useTheme } from "@/context/ThemeContext"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
