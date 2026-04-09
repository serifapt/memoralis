import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FlowerProductForm } from "@/components/flowers/FlowerProductForm";
import { FlowerProductCard } from "@/components/flowers/FlowerProductCard";
import {
  useFlowerService,
  useFlowerProducts,
  FlowerProduct,
  FLOWER_CATEGORIES,
} from "@/hooks/useFlowerService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Flower2,
  Loader2,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FlowerCatalog() {
  const queryClient = useQueryClient();
  const { funeraria, isLoadingFuneraria, isFlowerServiceActive, funerariaId } =
    useFlowerService();
  const { data: products, isLoading: isLoadingProducts } =
    useFlowerProducts(funerariaId);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FlowerProduct | null>(
    null
  );
  const [previewProduct, setPreviewProduct] = useState<FlowerProduct | null>(
    null
  );
  const [deleteProduct, setDeleteProduct] = useState<FlowerProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [limiteHoras, setLimiteHoras] = useState<number>(funeraria?.flores_limite_horas ?? 4);
  const [savingLimite, setSavingLimite] = useState(false);

  // Sync limiteHoras when funeraria data loads
  useState(() => {
    if (funeraria?.flores_limite_horas !== undefined) {
      setLimiteHoras(funeraria.flores_limite_horas);
    }
  });

  const handleSaveLimite = async () => {
    if (!funerariaId) return;
    setSavingLimite(true);
    try {
      const { error } = await supabase
        .from("funerarias")
        .update({ flores_limite_horas: limiteHoras })
        .eq("id", funerariaId);
      if (error) throw error;
      toast.success("Limite de horas atualizado");
      queryClient.invalidateQueries({ queryKey: ["funeraria-flower-service"] });
    } catch {
      toast.error("Erro ao guardar limite de horas");
    } finally {
      setSavingLimite(false);
    }
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.is_active) ||
      (statusFilter === "inactive" && !product.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (product: FlowerProduct) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("flower_products")
        .delete()
        .eq("id", deleteProduct.id);

      if (error) throw error;
      toast.success("Produto eliminado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["flower-products"] });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao eliminar produto");
    } finally {
      setIsDeleting(false);
      setDeleteProduct(null);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["flower-products"] });
    setEditingProduct(null);
  };

  if (isLoadingFuneraria) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isFlowerServiceActive) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Flower2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-archivo font-bold text-foreground mb-2">
              Serviço de Flores Desativado
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ative o serviço de flores nas configurações para criar o seu
              catálogo e receber pedidos dos utilizadores.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Ir para Configurações
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Catálogo de Flores
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerir produtos do catálogo de flores
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Limite de horas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-[300px]">
              <Label htmlFor="limite-horas" className="text-sm font-medium">
                Limite de pedidos antes do funeral (horas)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Os pedidos de flores ficam indisponíveis X horas antes do funeral.
              </p>
              <Input
                id="limite-horas"
                type="number"
                min={0}
                max={72}
                value={limiteHoras}
                onChange={(e) => setLimiteHoras(Number(e.target.value))}
                className="w-[120px]"
              />
            </div>
            <Button
              onClick={handleSaveLimite}
              disabled={savingLimite || limiteHoras === funeraria?.flores_limite_horas}
              size="sm"
            >
              {savingLimite ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {FLOWER_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Flower2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.short_description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="secondary">{product.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.price.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                      className={
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {product.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.display_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewProduct(product)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteProduct(product)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Flower2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ainda não tem produtos
            </h3>
            <p className="text-muted-foreground mb-6">
              Adicione o primeiro produto ao seu catálogo de flores.
            </p>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Form Dialog */}
      {funerariaId && (
        <FlowerProductForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingProduct(null);
          }}
          product={editingProduct}
          funerariaId={funerariaId}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Preview Dialog */}
      {previewProduct && (
        <AlertDialog
          open={!!previewProduct}
          onOpenChange={() => setPreviewProduct(null)}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Pré-visualização do Produto</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="py-4">
              <FlowerProductCard product={previewProduct} />
              {previewProduct.full_description && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {previewProduct.full_description}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o produto "{deleteProduct?.name}"?
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
