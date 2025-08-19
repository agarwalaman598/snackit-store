import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { playSuccessSound } from "@/lib/sounds";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      playSuccessSound();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center" data-testid="success-modal">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto animate-bounce-in">
            <i className="fas fa-check text-white text-3xl"></i>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your delicious snacks will be delivered to your hostel in 10-15 minutes.
            </p>
          </div>
          
          <div className="bg-gray-light p-4 rounded-lg">
            <p className="text-sm text-gray-600">Estimated Delivery Time:</p>
            <p className="font-bold text-charcoal">10-15 minutes</p>
          </div>
          
          <Button 
            onClick={onClose} 
            className="w-full bg-primary text-white hover:bg-primary-dark"
            data-testid="continue-shopping-button"
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
