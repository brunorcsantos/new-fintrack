"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCardDisplay } from "./credit-card-display"
import { CardForm } from "./card-form"
import { InvoiceModal } from "./invoice-modal"

interface CreditCard {
  id: string
  name: string
  lastDigits: string
  brand: string
  limit: number
  used: number
  dueDate: number
  color: string
}

interface CardsListProps {
  cards?: CreditCard[]
  isLoading?: boolean
}

const mockCards: CreditCard[] = [
  {
    id: "1",
    name: "Nubank",
    lastDigits: "4521",
    brand: "Mastercard",
    limit: 8000,
    used: 3450.75,
    dueDate: 15,
    color: "#8A05BE",
  },
  {
    id: "2",
    name: "Itau Platinum",
    lastDigits: "7832",
    brand: "Visa",
    limit: 15000,
    used: 6200.0,
    dueDate: 10,
    color: "#003366",
  },
  {
    id: "3",
    name: "Inter Black",
    lastDigits: "9012",
    brand: "Mastercard",
    limit: 12000,
    used: 1890.5,
    dueDate: 20,
    color: "#FF7A00",
  },
]

export function CardsList({
  cards = mockCards,
  isLoading,
}: CardsListProps) {
  const [editCard, setEditCard] = useState<CreditCard | null>(null)
  const [viewInvoiceCard, setViewInvoiceCard] = useState<CreditCard | null>(null)

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-44 w-full rounded-b-none" />
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <CreditCardDisplay
            key={card.id}
            card={card}
            onEdit={() => setEditCard(card)}
            onViewInvoice={() => setViewInvoiceCard(card)}
          />
        ))}
      </div>

      <CardForm
        open={!!editCard}
        onOpenChange={(open) => !open && setEditCard(null)}
        card={
          editCard
            ? {
                id: editCard.id,
                name: editCard.name,
                lastDigits: editCard.lastDigits,
                brand: editCard.brand,
                limit: editCard.limit,
                dueDate: editCard.dueDate,
                color: editCard.color,
              }
            : undefined
        }
      />

      <InvoiceModal
        open={!!viewInvoiceCard}
        onOpenChange={(open) => !open && setViewInvoiceCard(null)}
        card={viewInvoiceCard}
      />
    </>
  )
}
