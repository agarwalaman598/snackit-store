import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithCategory } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { playAddToCartSound } from "@/lib/sounds";

interface ProductCardProps {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    setIsAdding(true);
    addToCart(product);
    playAddToCartSound();
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div
      className="card-modern group overflow-hidden transform transition-all duration-300 hover:scale-105"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1561758033-48d1462c9908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={product.stock === 0 ? "destructive" : "secondary"} className="font-semibold">
            {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-black text-orange-600">₹{product.price}</span>
        </div>
        <Button
          className="w-full btn-primary"
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAdding}
        >
          {isAdding ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Added!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <i className="fas fa-plus"></i>
              <span>Add to Cart</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}