import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FlowerOrder,
  FlowerOrderItem,
  ORDER_STATUSES,
  useFlowerOrderItems,
} from "@/hooks/useFlowerService";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Loader2, User, Phone, Mail, MessageSquare, FileText } from "lucide-react";

interface FlowerOrderDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: FlowerOrder | null;
  obituaryName?: string;
  onStatusChange: () => void;
}

export function FlowerOrderDetail({
  open,
  onOpenChange,
  order,
  obituaryName,
  onStatusChange,
}: FlowerOrderDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");
  const { data: items, isLoading: isLoadingItems } = useFlowerOrderItems(order?.id);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleStatusChange = async () => {
    if (!order || selectedStatus === order.status) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("flower_orders")
        .update({ status: selectedStatus })
        .eq("id", order.id);

      if (error) throw error;
      toast.success("Estado do pedido atualizado");
      onStatusChange();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erro ao atualizar estado");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nº Pedido</p>
              <p className="font-mono font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium">
                {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                  locale: pt,
                })}
              </p>
            </div>
            {obituaryName && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Obituário</p>
                <p className="font-medium">{obituaryName}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Sender Info */}
          <div>
            <h3 className="font-semibold mb-3">Dados do Remetente</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{order.sender_name}</span>
              </div>
              {order.sender_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{order.sender_email}</span>
                </div>
              )}
              {order.sender_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.sender_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {order.message && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Mensagem de Condolências</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg italic">
                "{order.message}"
              </p>
            </div>
          )}

          {/* Observations */}
          {order.observations && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Observações</h3>
              </div>
              <p className="text-sm text-muted-foreground">{order.observations}</p>
            </div>
          )}

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">Itens do Pedido</h3>
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.product_name_snapshot}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.product_price_snapshot.toFixed(2)} € x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{item.line_total.toFixed(2)} €</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{order.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Taxa de serviço ({order.commission_percent}%)
              </span>
              <span>{order.commission_value.toFixed(2)} €</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{order.total.toFixed(2)} €</span>
            </div>
          </div>

          <Separator />

          {/* Status Change */}
          <div>
            <h3 className="font-semibold mb-3">Alterar Estado</h3>
            <div className="flex gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating || selectedStatus === order.status}
                className="bg-primary hover:bg-primary/90"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Atualizar"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
