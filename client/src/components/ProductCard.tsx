import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    
    setIsAdding(true);
    onAddToCart(product);
    
    // Visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const getStockBadge = () => {
    if (product.stock <= 0) {
      return (
        <span className="text-xs text-white bg-red-500 px-2 py-1 rounded-full">
          Out of stock
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="text-xs text-white bg-warning px-2 py-1 rounded-full">
          {product.stock} left
        </span>
      );
    }
    return (
      <span className="text-xs text-white bg-success px-2 py-1 rounded-full">
        {product.stock} left
      </span>
    );
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      data-testid={`product-card-${product.id}`}
    >
      {product.imageUrl ? (
        <img 
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          data-testid={`product-image-${product.id}`}
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <i className="fas fa-image text-gray-400 text-4xl"></i>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-semibold text-charcoal line-clamp-1"
            data-testid={`product-name-${product.id}`}
          >
            {product.name}
          </h3>
          {getStockBadge()}
        </div>
        
        {product.description && (
          <p 
            className="text-sm text-gray-600 mb-3 line-clamp-2"
            data-testid={`product-description-${product.id}`}
          >
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span 
            className="text-xl font-bold text-primary"
            data-testid={`product-price-${product.id}`}
          >
            ₹{product.price}
          </span>
          
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
            className={`transition-all duration-200 ${
              isAdding 
                ? "bg-success hover:bg-success" 
                : "bg-primary hover:bg-primary-dark"
            } ${product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            data-testid={`add-to-cart-${product.id}`}
          >
            {isAdding ? (
              <>
                <i className="fas fa-check mr-2"></i>
                Added!
              </>
            ) : product.stock <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
