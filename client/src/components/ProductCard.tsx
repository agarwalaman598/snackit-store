import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithCategory } from "@shared/schema";
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

    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      data-testid={`product-card-${product.id}`}
    >
      <img
        src={
          product.imageUrl ||
          "https://images.unsplash.com/photo-1561758033-48d1462c9908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        }
        alt={product.name}
        className="w-full h-48 object-cover"
        data-testid={`product-image-${product.id}`}
      />
      <div className="p-4">
        <h3
          className="font-semibold text-charcoal mb-2"
          data-testid={`product-name-${product.id}`}
        >
          {product.name}
        </h3>
        <p
          className="text-sm text-gray-600 mb-3 line-clamp-2"
          data-testid={`product-description-${product.id}`}
        >
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xl font-bold text-primary"
            data-testid={`product-price-${product.id}`}
          >
            ₹{product.price}
          </span>
          <Badge
            variant={product.stock < 5 ? "destructive" : "default"}
            data-testid={`product-stock-${product.id}`}
          >
            {product.stock} left
          </Badge>
        </div>
        <Button
          className="w-full bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAdding}
          data-testid={`add-to-cart-${product.id}`}
        >
          {isAdding ? (
            <>
              <i className="fas fa-check mr-2"></i>
              Added!
            </>
          ) : product.stock === 0 ? (
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
  );
}