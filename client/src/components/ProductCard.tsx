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
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      data-testid={`product-card-${product.id}`}
    >
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1561758033-48d1462c9908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-charcoal">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 mb-3 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          <Badge variant={product.stock === 0 ? "destructive" : "outline"}>
            {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
          </Badge>
        </div>
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAdding}
        >
          {isAdding ? "Added!" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}