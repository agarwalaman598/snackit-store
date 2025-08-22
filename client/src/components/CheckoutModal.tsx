import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"], refetchInterval: 10000 });

  const [step, setStep] = useState<"details" | "upi">("details");
  const [formData, setFormData] = useState({
    hostelBlock: "KP 25A",
    roomNumber: "",
    phoneNumber: "",
    paymentMethod: "cash",
    paymentNote: "",
  });

  const paymentAvailability = (() => {
    const allowCash = items.every((i) => (i as any).allowCash !== false);
    const allowUpi = items.every((i) => (i as any).allowUpi !== false);
    return { allowCash, allowUpi };
  })();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order: any) => {
      clearCart();
      onSuccess();
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.id.slice(-6)} has been placed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (settings && (settings as any).acceptingOrders === false) {
      toast({ title: "Orders Paused", description: "We are not accepting new orders right now.", variant: "destructive" });
      return;
    }

    if (!formData.roomNumber || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.paymentMethod === "upi") {
      setStep("upi");
    } else {
      placeOrder();
    }
  };

  const placeOrder = () => {
    const orderData = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      deliveryAddress: {
        hostelBlock: formData.hostelBlock,
        roomNumber: formData.roomNumber,
      },
      paymentMethod: formData.paymentMethod,
      phoneNumber: formData.phoneNumber,
      paymentNote: formData.paymentNote || undefined,
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        {step === "details" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="font-semibold text-orange-600">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-orange-200 mt-3 pt-3 flex justify-between font-bold text-lg">
                <span className="text-gray-900">Total:</span>
                <span className="text-orange-600">₹{totalAmount}</span>
              </div>
              
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Delivery Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hostelBlock" className="text-gray-700 font-medium">Hostel Block</Label>
                  <Select
                    value={formData.hostelBlock}
                    onValueChange={(value) => setFormData({ ...formData, hostelBlock: value })}
                    required
                  >
                    <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KP 25A">KP 25A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roomNumber" className="text-gray-700 font-medium">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g., 201"
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Your mobile number"
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 ${!paymentAvailability.allowCash ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === "cash"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="text-orange-500 focus:ring-orange-500"
                    disabled={!paymentAvailability.allowCash}
                  />
                  <span className="text-gray-700">Cash on Pickup</span>
                </label>
                <label className={`flex items-center space-x-3 ${!paymentAvailability.allowUpi ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === "upi"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="text-orange-500 focus:ring-orange-500"
                    disabled={!paymentAvailability.allowUpi}
                  />
                  <span className="text-gray-700">UPI Payment</span>
                </label>
                
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Optional Payment Note</h3>
              <Input
                placeholder="UPI/Transaction ID or note (optional)"
                value={formData.paymentNote}
                onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createOrderMutation.isPending}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrderMutation.isPending} className="btn-primary">
                {formData.paymentMethod === "upi"
                  ? "Continue to Payment"
                  : "Place Order"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">UPI Payment</h3>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                <div className="w-40 h-40 bg-white mx-auto rounded-xl flex items-center justify-center mb-4 p-2 shadow-lg">
                  <img
                    src={(settings as any)?.upiQrUrl || "/my_qr.jpg"}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="font-black text-2xl text-orange-600">₹{totalAmount}</p>
                <p className="text-sm text-gray-600 mt-1">
                  UPI ID: {(settings as any)?.upiId || 'agarwalaman598@slc'}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setStep("details")}
                variant="outline"
                disabled={createOrderMutation.isPending}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                onClick={placeOrder}
                disabled={createOrderMutation.isPending}
                className="btn-primary"
              >
                {createOrderMutation.isPending ? "Processing..." : "Payment Done"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}