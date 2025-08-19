import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { items, totalAmount, updateQuantity, removeItem } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          data-testid="cart-overlay"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-charcoal" data-testid="cart-title">Your Cart</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-light rounded-lg transition-colors duration-200"
              data-testid="close-cart"
            >
              <i className="fas fa-times text-xl text-gray-500"></i>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-cart">
                <div className="w-16 h-16 bg-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shopping-cart text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button 
                  onClick={onClose} 
                  variant="outline"
                  data-testid="continue-shopping"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b" data-testid={`cart-item-${item.id}`}>
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1561758033-48d1462c9908?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                      data-testid={`cart-item-image-${item.id}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal" data-testid={`cart-item-name-${item.id}`}>
                        {item.name}
                      </h4>
                      <p className="text-primary font-bold" data-testid={`cart-item-price-${item.id}`}>
                        ₹{item.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="w-8 h-8 bg-gray-light rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`decrease-quantity-${item.id}`}
                      >
                        <i className="fas fa-minus text-xs"></i>
                      </button>
                      <span className="w-8 text-center font-medium" data-testid={`cart-item-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <button 
                        className="w-8 h-8 bg-gray-light rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`increase-quantity-${item.id}`}
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                    <button 
                      className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                      onClick={() => removeItem(item.id)}
                      data-testid={`remove-item-${item.id}`}
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t p-6" data-testid="cart-footer">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary" data-testid="cart-total">₹{totalAmount}</span>
                </div>
                <Button 
                  onClick={onCheckout} 
                  className="w-full bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
                  data-testid="checkout-button"
                >
                  <i className="fas fa-credit-card mr-2"></i>Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
