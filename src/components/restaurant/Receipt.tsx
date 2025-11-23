"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptItem {
  itemId: string;
  itemName: string;
  quantity: number;
  modifications?: string[];
}

interface ReceiptProps {
  restaurantName: string;
  paymentId: string;
  orderId: string;
  tableId: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  method: string;
  timestamp: Date | string;
  currency?: string;
}

export function Receipt({
  restaurantName,
  paymentId,
  orderId,
  tableId,
  items,
  subtotal,
  tax,
  taxRate,
  total,
  method,
  timestamp,
  currency = "INR",
}: ReceiptProps) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownload = () => {
    // Create a simple text receipt for download
    const receiptText = `
${restaurantName}
${"=".repeat(40)}

Receipt #: ${paymentId}
Order #: ${orderId}
Table: ${tableId}
Date: ${formattedDate}
Time: ${formattedTime}

${"=".repeat(40)}
ITEMS
${"-".repeat(40)}
${items.map((item) => `${item.quantity}x ${item.itemName}${item.modifications ? `\n   (${item.modifications.join(", ")})` : ""}`).join("\n")}

${"=".repeat(40)}
Subtotal: ₹${subtotal.toFixed(2)}
GST (${(taxRate * 100).toFixed(0)}%): ₹${tax.toFixed(2)}
${"-".repeat(40)}
TOTAL: ₹${total.toFixed(2)}
${"-".repeat(40)}

Payment Method: ${method.toUpperCase()}
Status: PAID ✓

Thank you for dining with us!
Visit us again soon!
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800">{restaurantName}</h2>
          <Badge variant="outline" className="text-green-700 border-green-700">
            Payment Successful
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Receipt #:</div>
          <div className="font-mono text-right">{paymentId}</div>
          
          <div className="text-muted-foreground">Order #:</div>
          <div className="font-mono text-right">{orderId}</div>
          
          <div className="text-muted-foreground">Table:</div>
          <div className="font-semibold text-right">{tableId}</div>
          
          <div className="text-muted-foreground">Date:</div>
          <div className="text-right">{formattedDate}</div>
          
          <div className="text-muted-foreground">Time:</div>
          <div className="text-right">{formattedTime}</div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">Items</h3>
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">
                  {item.quantity}x {item.itemName}
                </div>
                {item.modifications && item.modifications.length > 0 && (
                  <div className="text-sm text-muted-foreground italic">
                    ({item.modifications.join(", ")})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST ({(taxRate * 100).toFixed(0)}%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-700">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Payment Method:</span>
          <Badge variant="secondary" className="uppercase">
            {method}
          </Badge>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>

        {/* Thank You Message */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Thank you for dining with us! 🙏
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            We hope to see you again soon!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
