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
        <div className="flex flex-col min-h-0 h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
            <h2 className="text-2xl font-black text-gray-900" data-testid="cart-title">Your Cart</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              data-testid="close-cart"
            >
              <i className="fas fa-times text-xl text-gray-500"></i>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {items.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-cart">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shopping-cart text-orange-500 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Time to add some delicious snacks!</p>
                <Button 
                  onClick={onClose} 
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  data-testid="continue-shopping"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100" data-testid={`cart-item-${item.id}`}>
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1561758033-48d1462c9908?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-xl"
                      data-testid={`cart-item-image-${item.id}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900" data-testid={`cart-item-name-${item.id}`}>
                        {item.name}
                      </h4>
                      <p className="text-orange-600 font-bold text-lg" data-testid={`cart-item-price-${item.id}`}>
                        ₹{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`decrease-quantity-${item.id}`}
                      >
                        <i className="fas fa-minus text-xs text-gray-600"></i>
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900" data-testid={`cart-item-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <button 
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`increase-quantity-${item.id}`}
                      >
                        <i className="fas fa-plus text-xs text-gray-600"></i>
                      </button>
                    </div>
                    <button 
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
            <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-orange-50 to-red-50" data-testid="cart-footer">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xl font-black">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-orange-600">₹{totalAmount}</span>
                </div>
                
                <Button 
                  onClick={onCheckout} 
                  className="w-full btn-primary text-lg py-4"
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
