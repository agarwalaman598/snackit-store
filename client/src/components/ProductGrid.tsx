import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithCategory } from "@shared/schema";
import ProductCard from "@/components/ProductCard"; // Assuming you have this component

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
}

export default function ProductGrid({ selectedCategory, searchQuery }: ProductGridProps) {
  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    // Corrected queryKey to be consistent
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.categoryId === selectedCategory;
    const searchMatch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <p className="text-gray-500">No products found for this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-grid">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}