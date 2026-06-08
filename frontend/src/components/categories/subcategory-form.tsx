import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";

interface SubcategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    icon: string;
  }) => Promise<void>;
  subcategory?: {
    id: string;
    name: string;
    emoji: string;
  }
  }

export function SubcategoryForm({open, onOpenChange, onSave, subcategory}: SubcategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: subcategory?.name ?? "",
    emoji: subcategory?.emoji ?? "📦",
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isEditing = !!subcategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave({
        name: formData.name,
        icon: formData.emoji,
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
            {isEditing ? "Editar Subcategoria" : "Nova Subcategoria"}
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