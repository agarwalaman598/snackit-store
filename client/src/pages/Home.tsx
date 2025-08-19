import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import SuccessModal from "@/components/SuccessModal";
import { Product } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: selectedCategory === "all" ? ["/api/products"] : ["/api/products", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" ? "/api/products" : `/api/products?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("kiit_snack_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("kiit_snack_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + change;
            return { ...item, quantity: Math.max(0, newQuantity) };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
      />
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-coral text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="hero-title">
              Instant Snacks to Your Hostel!
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-6" data-testid="hero-subtitle">
              Fastest delivery on campus • Fresh snacks • 24/7 service
            </p>
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

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
            {(products as Product[]).map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {!isLoading && (products as Product[]).length === 0 && (
          <div className="text-center py-12" data-testid="no-products">
            <div className="w-16 h-16 bg-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-cookie text-gray-400 text-2xl"></i>
            </div>
            <p className="text-charcoal font-medium">No products found</p>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </main>

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false);
          setSuccessOpen(true);
        }}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
      />

      {/* Floating Cart Button (Mobile) */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-40 lg:hidden hover:bg-primary-dark transition-all duration-200 transform hover:scale-110"
        data-testid="floating-cart-button"
      >
        <i className="fas fa-shopping-cart text-xl"></i>
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-coral text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
            {cartItemCount}
          </span>
        )}
      </button>
    </div>
  );
}
