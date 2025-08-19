import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

  const [step, setStep] = useState<"details" | "upi">("details");
  const [formData, setFormData] = useState({
    hostelBlock: "KP 25A", // Default to the only option
    roomNumber: "",
    phoneNumber: "",
    paymentMethod: "cash",
  });

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
            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hostelBlock">Hostel Block</Label>
                  <Select
                    value={formData.hostelBlock}
                    onValueChange={(value) => setFormData({ ...formData, hostelBlock: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KP 25A">KP 25A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g., 201"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Your mobile number"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment Method</h3>
              {/* Payment method selection... */}
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrderMutation.isPending}>
                {formData.paymentMethod === "upi"
                  ? "Continue to Payment"
                  : "Place Order"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">UPI Payment</h3>
              <div className="bg-gray-light p-4 rounded-lg">
                <div className="w-40 h-40 bg-white mx-auto rounded-lg flex items-center justify-center mb-4 p-2">
                  <img
                    src="/my-qr-code.png" // Make sure you've added your QR code here
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="font-bold text-lg">₹{totalAmount}</p>
                <p className="text-sm text-gray-600 mt-1">
                  UPI ID: your-upi-id@oksbi
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setStep("details")}
                variant="outline"
                disabled={createOrderMutation.isPending}
              >
                Back
              </Button>
              <Button
                onClick={placeOrder}
                disabled={createOrderMutation.isPending}
                className="bg-success text-white hover:bg-success-dark"
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