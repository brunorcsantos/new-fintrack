"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TxTypeFilter } from "@/types";

interface TransactionsFiltersProps {
  month: string;
  type: string;
  onMonthChange: (month: string) => void;
  onTypeChange: (type: TxTypeFilter) => void;
  onClearFilters: () => void;
}

const months = obterMeses();

export function TransactionsFilters({
  month = "all",
  type,
  onMonthChange,
  onTypeChange,
  onClearFilters,
}: TransactionsFiltersProps) {
  const hasFilters = month !== "all" || type !== "all";

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
  );
}

function obterMeses(idioma = "pt-BR") {
  const formato = new Intl.DateTimeFormat(idioma, {
    month: "long",
  });

  const currentYear = new Date().getFullYear();

  return Array.from({ length: 12 }, (_, i) => ({
    value: `${currentYear}-${String(i + 1).padStart(2, "0")}`,
    label: formato.format(new Date(currentYear, i, 1)),
  }));
}
