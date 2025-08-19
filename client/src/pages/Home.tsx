import { useState, useEffect } from "react";
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

export default function Home() {
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
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Midnight Cravings?
          </h2>
          <p className="text-xl md:text-2xl opacity-95 font-medium mb-8">
            Get your favorite snacks delivered in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm">
              <i className="fas fa-clock text-2xl"></i>
              <span className="font-semibold">10-15 min delivery</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm">
              <i className="fas fa-star text-2xl"></i>
              <span className="font-semibold">Fresh & Hot</span>
            </div>
          </div>
        </div>
      </section>

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}