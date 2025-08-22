import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Settings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { playSuccessSound } from "@/lib/sounds";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const { data: settings } = useQuery<Settings>({ queryKey: ["/api/settings"] });
  useEffect(() => {
    if (isOpen) {
      playSuccessSound();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto text-center" data-testid="success-modal">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg">
            <i className="fas fa-check text-white text-4xl"></i>
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Please collect your order from room <strong>{settings?.pickupPoint?.split('-')[1] || '298'}</strong> (Block <strong>{settings?.pickupPoint?.split('-')[0] || '6A'}</strong>). Call <strong>{settings?.contactPhone || '7439853544'}</strong> before collecting.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
            <p className="text-sm text-gray-600">Pickup Point</p>
            <p className="font-black text-xl text-orange-600">{settings?.pickupPoint || '6A-298'}</p>
          </div>
          
          <Button 
            onClick={onClose} 
            className="w-full btn-primary text-lg py-4"
            data-testid="continue-shopping-button"
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}