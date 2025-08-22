import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleGoogleLogin = () => {
    // Clear any previous errors
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = "/api/auth/google";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto text-center" data-testid="login-modal">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-user text-white text-2xl"></i>
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to SnackIT</h2>
            <p className="text-gray-600 mb-6">Your midnight snack companion</p>
          </div>
          
          <Button 
            onClick={handleGoogleLogin}
            className="w-full btn-primary"
            data-testid="google-signin-button"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </Button>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
            <p className="text-sm text-gray-700 font-medium mb-2">
              <i className="fas fa-info-circle text-orange-500 mr-2"></i>
              Important Notice
            </p>
            <p className="text-xs text-gray-600">
              Only <strong>@kiit.ac.in</strong> email addresses are allowed.
            </p>
          </div>
          
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
