import { useState } from "react";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import CartSidebar from "@/components/CartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import SuccessModal from "@/components/SuccessModal";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Header 
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onLoginClick={() => setIsLoginOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-coral text-white py-12" data-testid="hero-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Instant Snacks to Your Hostel!</h2>
            <p className="text-lg md:text-xl opacity-90 mb-6">Fastest delivery on campus • Fresh snacks • 24/7 service</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock"></i>
                <span>10-15 min delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-shield-alt"></i>
                <span>Safe payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-star"></i>
                <span>Fresh guarantee</span>
              </div>
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
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          if (!isAuthenticated) {
            setIsLoginOpen(true);
            return;
          }
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setIsSuccessOpen(true);
        }}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Floating Cart Button (Mobile) */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-40 lg:hidden hover:bg-primary-dark transition-all duration-200 transform hover:scale-110"
        onClick={() => setIsCartOpen(true)}
        data-testid="floating-cart-button"
      >
        <i className="fas fa-shopping-cart text-xl"></i>
      </button>
    </div>
  );
}
