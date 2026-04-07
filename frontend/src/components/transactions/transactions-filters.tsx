"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TransactionsFiltersProps {
  month: string
  type: string
  onMonthChange: (month: string) => void
  onTypeChange: (type: string) => void
  onClearFilters: () => void
}

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Marco" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

export function TransactionsFilters({
  month,
  type,
  onMonthChange,
  onTypeChange,
  onClearFilters,
}: TransactionsFiltersProps) {
  const hasFilters = month !== "all" || type !== "all"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os meses</SelectItem>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="income">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              Receitas
            </span>
          </SelectItem>
          <SelectItem value="expense">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Despesas
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9"
        >
          <X className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
