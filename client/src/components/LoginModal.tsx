import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center" data-testid="login-modal">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-user text-white text-2xl"></i>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Welcome to KIIT Snack Store</h2>
            <p className="text-gray-600 mb-6">Sign in with your KIIT email to continue</p>
          </div>
          
          <Button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-200 text-charcoal hover:border-primary transition-colors duration-200"
            data-testid="google-signin-button"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </Button>
          
          <p className="text-xs text-gray-500">Only @kiit.ac.in emails are allowed</p>
          
          <Button 
            onClick={onClose} 
            variant="ghost"
            className="mt-4 text-gray-500 hover:text-gray-700"
            data-testid="close-login-modal"
          >
            <i className="fas fa-times mr-2"></i>Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
