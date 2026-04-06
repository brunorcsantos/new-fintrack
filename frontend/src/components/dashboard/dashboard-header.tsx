"use client"

import { SidebarTrigger } from "../ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Bell, Plus } from "lucide-react"
import {Link} from "react-router-dom"

interface DashboardHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground hidden md:block">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Button asChild={!!action.href} onClick={action.onClick} size="sm">
            {action.href ? (
              <Link to={action.href}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{action.label}</span>
              </Link>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{action.label}</span>
              </>
            )}
          </Button>
        )}

        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/notifications">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificacoes</span>
          </Link>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  )
}
