import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import CartSidebar from "@/components/CartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import SuccessModal from "@/components/SuccessModal";
import LoginModal from "@/components/LoginModal";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToHistory } = useSearchHistory();
  const [location] = useLocation();
  const { toast } = useToast();
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });

  // Check for domain error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'domain_restricted') {
      toast({
        title: "Email Domain Restricted",
        description: "Please use a KIIT University email address (@kiit.ac.in)",
        variant: "destructive",
      });
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToHistory(query);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setCartOpen(false);
      setLoginModalOpen(true);
    } else {
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-light">
      <Header
        cartItemCount={totalItems}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Orders paused banner */}
          {((settings as any)?.acceptingOrders === false) && (
            <div className="mb-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md inline-flex items-center px-4 py-2 font-semibold">
              We are not accepting new orders right now{(settings as any)?.resumeAt ? ` • Resumes at ${new Date((settings as any).resumeAt).toLocaleString()}` : ''}
            </div>
          )}
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Midnight Cravings?
          </h2>
          <p className="text-xl md:text-2xl opacity-95 font-medium mb-8">
            Available exclusively for KP 25A hostel boarders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Removed delivery ETA; show a concise pickup hint */}
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm">
              <i className="fas fa-bell text-2xl"></i>
              <span className="font-semibold">Quick pickup available</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm">
              <i className="fas fa-map-marker-alt text-2xl"></i>
              <span className="font-semibold">Pickup at {(settings as any)?.pickupPoint || '6A-298'}</span>
            </div>
          </div>
        </div>
      </section>

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className={`mx-auto py-8 ${isMobile ? 'max-w-full px-3' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        <ProductGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false);
          setSuccessOpen(true);
        }}
      />

      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} />

      <footer className="text-center py-6 text-xs text-gray-500">
        <span className="tracking-wide">Made by </span>
        <span className="font-semibold text-gray-700">Aman Agarwal</span>
      </footer>
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}