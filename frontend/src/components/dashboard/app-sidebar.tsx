"use client"

import {Link} from "react-router-dom"
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  CreditCard,
  Bell,
  User,
  LogOut,
  Settings,
} from "lucide-react"
import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transacoes",
    url: "/dashboard/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Categorias",
    url: "/dashboard/categories",
    icon: Tags,
  },
  {
    title: "Orcamentos",
    url: "/dashboard/budgets",
    icon: Wallet,
  },
  {
    title: "Cartoes",
    url: "/dashboard/cards",
    icon: CreditCard,
  },
]

const secondaryNavItems = [
  {
    title: "Notificacoes",
    url: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Perfil",
    url: "/dashboard/profile",
    icon: User,
  },
]

export function AppSidebar() {
  const location = useLocation()
  

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Configuracoes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left text-sm">
                <p className="font-medium leading-none">Joao Silva</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  joao@email.com
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configuracoes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login" className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
