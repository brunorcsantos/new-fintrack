"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import EmojiPicker from "emoji-picker-react";
import { HexColorPicker } from "react-colorful";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  category?: {
    id: string;
    name: string;
    emoji: string;
    color: string;
  };
}

export function CategoryForm({
  open,
  onOpenChange,
  onSave,
  category,
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name ?? "",
    emoji: category?.emoji ?? "📦",
    color: category?.color ?? "",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isEditing = !!category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave({
        name: formData.name,
        icon: formData.emoji,
        color: formData.color,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da categoria"
              : "Crie uma nova categoria para organizar suas transacoes"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Icone</Label>
              <button
                type="button"
                className="h-11 w-11 text-xl border rounded-md flex items-center justify-center hover:bg-accent transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {formData.emoji}
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Alimentacao"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="h-11"
              />
            </div>
          </div>

          {/* picker aparece/some dentro do fluxo normal */}
          {showEmojiPicker && (
            <EmojiPicker
              width="100%"
              height={350}
              onEmojiClick={(emojiData) => {
                setFormData({ ...formData, emoji: emojiData.emoji });
                setShowEmojiPicker(false);
              }}
            />
          )}

          {/* cor, preview, footer */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border-2 border-border"
                  style={{ backgroundColor: formData.color }}
                />
              </PopoverTrigger>
              <PopoverContent align="start">
                <HexColorPicker
                  color={formData.color}
                  onChange={(color) => setFormData({ ...formData, color })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-2">
            <Label className="text-muted-foreground text-xs">
              Pre-visualizacao
            </Label>
            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.emoji}
              </div>
              <span className="font-medium">
                {formData.name || "Nome da categoria"}
              </span>
              <div
                className="ml-auto h-3 w-3 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
