import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithCategory } from "@shared/schema";

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
}

export default function ProductGrid({ selectedCategory, searchQuery }: ProductGridProps) {
  const { addToCart } = useCart();
  
  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", selectedCategory !== "all" ? selectedCategory : undefined],
    queryFn: async () => {
      const url = selectedCategory === "all" 
        ? "/api/products"
        : `/api/products?category=${selectedCategory}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Filter products by search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-products">
        <div className="w-16 h-16 bg-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-search text-gray-400 text-2xl"></i>
        </div>
        <p className="text-gray-500 mb-2">No products found</p>
        <p className="text-sm text-gray-400">Try adjusting your search or category filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-grid">
      {filteredProducts.map((product) => (
        <div 
          key={product.id} 
          className="product-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          data-testid={`product-${product.id}`}
        >
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1561758033-48d1462c9908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className="w-full h-48 object-cover"
            data-testid={`product-image-${product.id}`}
          />
          <div className="p-4">
            <h3 className="font-semibold text-charcoal mb-2" data-testid={`product-name-${product.id}`}>
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3" data-testid={`product-description-${product.id}`}>
              {product.description}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-primary" data-testid={`product-price-${product.id}`}>
                ₹{product.price}
              </span>
              <div className="flex items-center space-x-1">
                <i className={`fas fa-box ${product.stock < 5 ? "text-warning" : "text-success"} text-xs`}></i>
                <Badge variant={product.stock < 5 ? "destructive" : "default"} data-testid={`product-stock-${product.id}`}>
                  {product.stock} left
                </Badge>
              </div>
            </div>
            <Button
              className="w-full bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              data-testid={`add-to-cart-${product.id}`}
            >
              <i className="fas fa-plus mr-2"></i>
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
