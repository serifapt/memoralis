import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlowerProduct, FLOWER_CATEGORIES } from "@/hooks/useFlowerService";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  price: z.number().positive("Preço deve ser maior que 0"),
  category: z.string().optional(),
  display_order: z.number().int().min(0),
  is_active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface FlowerProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: FlowerProduct | null;
  funerariaId: string;
  onSuccess: () => void;
}

export function FlowerProductForm({
  open,
  onOpenChange,
  product,
  funerariaId,
  onSuccess,
}: FlowerProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name || "",
      short_description: product?.short_description || "",
      full_description: product?.full_description || "",
      price: product?.price || 0,
      category: product?.category || "",
      display_order: product?.display_order || 0,
      is_active: product?.is_active ?? true,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return product?.image_url || null;

    setIsUploadingImage(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${funerariaId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("flower-products")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("flower-products")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao carregar imagem");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage();

      const productData = {
        ...values,
        funeraria_id: funerariaId,
        image_url: imageUrl,
        short_description: values.short_description || null,
        full_description: values.full_description || null,
        category: values.category || null,
      };

      if (product) {
        const { error } = await supabase
          .from("flower_products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Produto atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from("flower_products")
          .insert(productData);

        if (error) throw error;
        toast.success("Produto criado com sucesso");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao guardar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            {imagePreview ? (
              <div className="relative w-40 h-40">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique ou arraste uma imagem
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" size="sm">
                  Selecionar Imagem
                </Button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Nome do produto"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Descrição Curta</Label>
            <Input
              id="short_description"
              {...form.register("short_description")}
              placeholder="Breve descrição para listagem"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <Label htmlFor="full_description">Descrição Completa</Label>
            <Textarea
              id="full_description"
              {...form.register("full_description")}
              placeholder="Detalhes do produto, tamanho, cores, etc."
              rows={4}
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                {...form.register("price")}
                placeholder="0.00"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={form.watch("category") || ""}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {FLOWER_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Display Order and Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_order">Ordem de Apresentação</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                {...form.register("display_order")}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Disponível</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked)
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {form.watch("is_active") ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting || isUploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : product ? (
                "Atualizar Produto"
              ) : (
                "Criar Produto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
