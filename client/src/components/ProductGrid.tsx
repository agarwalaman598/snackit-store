import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import type { ProductWithCategory } from "@shared/schema";

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
}

export default function ProductGrid({ selectedCategory, searchQuery }: ProductGridProps) {
  // Always fetch all products using a single, consistent query key.
  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  // Perform all filtering on the client side.
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.categoryId === selectedCategory;
    const searchMatch = searchQuery.trim() === '' ||
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
        <div className="w-16 h-16 bg-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-search text-gray-400 text-2xl"></i>
        </div>
        <p className="text-gray-500">No products found.</p>
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