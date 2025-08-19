import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"details" | "upi">("details");
  const [formData, setFormData] = useState({
    hostelBlock: "",
    roomNumber: "",
    phoneNumber: "",
    paymentMethod: "cash"
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      clearCart();
      onSuccess();
      setStep("details");
      setFormData({
        hostelBlock: "",
        roomNumber: "",
        phoneNumber: "",
        paymentMethod: "cash"
      });
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
    
    if (!formData.hostelBlock || !formData.roomNumber || !formData.phoneNumber) {
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
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      deliveryAddress: {
        hostelBlock: formData.hostelBlock,
        roomNumber: formData.roomNumber
      },
      paymentMethod: formData.paymentMethod,
      phoneNumber: formData.phoneNumber
    };

    createOrderMutation.mutate(orderData);
  };

  const handleClose = () => {
    if (!createOrderMutation.isPending) {
      onClose();
      setStep("details");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto" data-testid="checkout-modal">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        {step === "details" ? (
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hostelBlock">Hostel Block *</Label>
                  <Select 
                    value={formData.hostelBlock} 
                    onValueChange={(value) => setFormData({ ...formData, hostelBlock: value })}
                  >
                    <SelectTrigger data-testid="hostel-block-select">
                      <SelectValue placeholder="Select your hostel block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Block A">Block A</SelectItem>
                      <SelectItem value="Block B">Block B</SelectItem>
                      <SelectItem value="Block C">Block C</SelectItem>
                      <SelectItem value="Block D">Block D</SelectItem>
                      <SelectItem value="Block E">Block E</SelectItem>
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
                    data-testid="room-number-input"
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
                    data-testid="phone-number-input"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  formData.paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cash" 
                    checked={formData.paymentMethod === "cash"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="text-primary"
                    data-testid="payment-cash"
                  />
                  <i className="fas fa-money-bill-wave text-success"></i>
                  <span className="font-medium">Cash on Delivery</span>
                </label>
                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  formData.paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi" 
                    checked={formData.paymentMethod === "upi"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="text-primary"
                    data-testid="payment-upi"
                  />
                  <i className="fas fa-mobile-alt text-primary"></i>
                  <span className="font-medium">UPI Payment</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createOrderMutation.isPending}
                className="flex-1"
                data-testid="cancel-checkout"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createOrderMutation.isPending}
                className="flex-1 bg-primary text-white hover:bg-primary-dark"
                data-testid="place-order-button"
              >
                {formData.paymentMethod === "upi" ? "Continue to Payment" : "Place Order"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6" data-testid="upi-payment">
            <div>
              <h3 className="text-xl font-semibold mb-4">UPI Payment</h3>
              <div className="bg-gray-light p-8 rounded-xl">
                <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center mb-4">
                  <div className="text-6xl text-gray-400">
                    <i className="fas fa-qrcode"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Scan QR code to pay</p>
                <p className="font-bold text-lg">₹{totalAmount}</p>
                <p className="text-sm text-gray-600 mt-2">UPI ID: snackhub@paytm</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setStep("details")}
                variant="outline"
                disabled={createOrderMutation.isPending}
                className="flex-1"
                data-testid="back-to-details"
              >
                Back
              </Button>
              <Button 
                onClick={placeOrder}
                disabled={createOrderMutation.isPending}
                className="flex-1 bg-success text-white hover:bg-success-dark"
                data-testid="confirm-payment"
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
