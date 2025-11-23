"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  modifications?: string[];
  specialInstructions?: string;
}

interface OrderSummaryProps {
  orderId: string;
  tableId: string;
  items: OrderItem[];
  status: string;
  eta?: number;
  total?: number;
  chefStatus?: string;
}

const statusConfig = {
  pending: { icon: Loader2, color: "text-yellow-500", label: "Pending", bgColor: "bg-yellow-50" },
  sent_to_chef: { icon: CheckCircle2, color: "text-blue-500", label: "Sent to Chef", bgColor: "bg-blue-50" },
  preparing: { icon: Loader2, color: "text-orange-500", label: "Preparing", bgColor: "bg-orange-50" },
  ready: { icon: CheckCircle2, color: "text-green-500", label: "Ready", bgColor: "bg-green-50" },
  served: { icon: CheckCircle2, color: "text-gray-500", label: "Served", bgColor: "bg-gray-50" },
  paid: { icon: CheckCircle2, color: "text-purple-500", label: "Paid", bgColor: "bg-purple-50" },
};

export function OrderSummary({
  orderId,
  tableId,
  items,
  status,
  eta,
  total,
  chefStatus,
}: OrderSummaryProps) {
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className={`${statusInfo.bgColor} border-b`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Summary</CardTitle>
          <Badge variant="outline" className={`${statusInfo.color} border-current`}>
            <StatusIcon className="w-3 h-3 mr-1 inline" />
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
          <span>Order: {orderId}</span>
          <span>Table: {tableId}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">
                  {item.quantity}x {item.itemName}
                </div>
                {item.modifications && item.modifications.length > 0 && (
                  <div className="text-sm text-muted-foreground italic">
                    {item.modifications.join(", ")}
                  </div>
                )}
                {item.specialInstructions && (
                  <div className="text-sm text-muted-foreground">
                    Note: {item.specialInstructions}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {eta && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Estimated Time:</span>
              <span className="text-muted-foreground">{eta} minutes</span>
            </div>
          </>
        )}

        {chefStatus && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Chef Status: {chefStatus}
          </div>
        )}

        {total !== undefined && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
