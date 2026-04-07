"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Wallet,
  Check,
} from "lucide-react"

interface Notification {
  id: string
  type: "alert" | "success" | "info" | "warning"
  title: string
  description: string
  time: string
  read: boolean
  icon: React.ReactNode
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Orcamento de Lazer excedido",
    description:
      "Voce ultrapassou o limite de R$ 500 para a categoria Lazer este mes.",
    time: "Agora",
    read: false,
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    id: "2",
    type: "info",
    title: "Fatura do Nubank vence em 3 dias",
    description:
      "Sua fatura de R$ 3.450,75 vence no dia 15. Nao esqueca de pagar!",
    time: "2 horas atras",
    read: false,
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "3",
    type: "success",
    title: "Meta de economia atingida!",
    description:
      "Parabens! Voce economizou 47.6% da sua renda este mes, acima da meta de 40%.",
    time: "1 dia atras",
    read: false,
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "4",
    type: "info",
    title: "Nova transacao registrada",
    description: "Salario de R$ 8.500,00 foi creditado na sua conta.",
    time: "2 dias atras",
    read: true,
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: "5",
    type: "alert",
    title: "Despesa alta detectada",
    description:
      "Uma despesa de R$ 2.500,00 (Aluguel) foi registrada. Verifique se esta correta.",
    time: "3 dias atras",
    read: true,
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "6",
    type: "success",
    title: "Categoria criada",
    description: 'A categoria "Investimentos" foi criada com sucesso.',
    time: "5 dias atras",
    read: true,
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
]

const typeColors = {
  alert: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
  info: "bg-primary/10 text-primary",
  warning: "bg-chart-4/10 text-chart-4",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Notificacoes"
        description={
          unreadCount > 0
            ? `Voce tem ${unreadCount} notificacoes nao lidas`
            : "Todas as notificacoes lidas"
        }
      />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          </div>
        )}

        <Card>
          <CardContent className="p-0 divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-4 p-4 transition-colors ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    typeColors[notification.type]
                  }`}
                >
                  {notification.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`font-medium ${
                          !notification.read ? "" : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.description}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.time}
                  </p>
                </div>

                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 self-center"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Marcar como lida</span>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium">Nenhuma notificacao</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Voce nao tem nenhuma notificacao no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
