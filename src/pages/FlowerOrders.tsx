import { useState, useMemo } from "react";
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
import { FlowerOrderDetail } from "@/components/flowers/FlowerOrderDetail";
import {
  useFlowerService,
  useFlowerOrders,
  FlowerOrder,
  ORDER_STATUSES,
} from "@/hooks/useFlowerService";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Search,
  Eye,
  Flower2,
  Loader2,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FlowerOrders() {
  const queryClient = useQueryClient();
  const { isLoadingFuneraria, isFlowerServiceActive, funerariaId } =
    useFlowerService();
  const { data: orders, isLoading: isLoadingOrders } =
    useFlowerOrders(funerariaId);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<FlowerOrder | null>(null);

  // Fetch obituary names for orders
  const obituaryIds = useMemo(
    () => [...new Set(orders?.map((o) => o.obituary_id) || [])],
    [orders]
  );

  const { data: obituaries } = useQuery({
    queryKey: ["obituaries-for-orders", obituaryIds],
    queryFn: async () => {
      if (obituaryIds.length === 0) return {};
      const { data, error } = await supabase
        .from("obituaries")
        .select("id, display_name")
        .in("id", obituaryIds);

      if (error) throw error;
      return Object.fromEntries(data.map((o) => [o.id, o.display_name]));
    },
    enabled: obituaryIds.length > 0,
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOrderStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ["flower-orders"] });
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
              Ative o serviço de flores nas configurações para receber pedidos
              dos utilizadores.
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
      <div>
        <h1 className="text-3xl font-archivo font-bold text-foreground">
          Pedidos de Flores
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir pedidos de flores recebidos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(ORDER_STATUSES).slice(0, 4).map(([key, { label, color }]) => {
          const count = orders?.filter((o) => o.status === key).length || 0;
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                  </div>
                  <Badge className={color}>{count}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou nº pedido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {isLoadingOrders ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Obituário</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo = ORDER_STATUSES[
                  order.status as keyof typeof ORDER_STATUSES
                ] || {
                  label: order.status,
                  color: "bg-gray-100 text-gray-800",
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                        locale: pt,
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.sender_name}</p>
                        {order.sender_email && (
                          <p className="text-sm text-muted-foreground">
                            {order.sender_email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {obituaries?.[order.obituary_id] || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {order.total.toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ainda não tem pedidos
            </h3>
            <p className="text-muted-foreground">
              Os pedidos de flores aparecerão aqui quando os utilizadores
              enviarem flores para os seus obituários.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Dialog */}
      <FlowerOrderDetail
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
        order={selectedOrder}
        obituaryName={
          selectedOrder ? obituaries?.[selectedOrder.obituary_id] : undefined
        }
        onStatusChange={handleOrderStatusChange}
      />
    </div>
  );
}
