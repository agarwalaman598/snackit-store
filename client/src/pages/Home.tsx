import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import CartSidebar from "@/components/CartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import SuccessModal from "@/components/SuccessModal";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
    } else {
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={totalItems}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <section className="bg-gradient-to-r from-primary to-coral text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            data-testid="hero-title"
          >
            Instant Snacks to Your Hostel!
          </h2>
          <p
            className="text-lg md:text-xl opacity-90 mb-6"
            data-testid="hero-subtitle"
          >
            Fastest delivery on campus • Fresh snacks • 24/7 service
          </p>
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

      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-40 lg:hidden hover:bg-primary-dark transition-all duration-200 transform hover:scale-110"
        data-testid="floating-cart-button"
      >
        <i className="fas fa-shopping-cart text-xl"></i>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-coral text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}