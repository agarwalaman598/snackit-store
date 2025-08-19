import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const allCategories = [
    { id: "all", name: "All Items", icon: "fas fa-th-large", slug: "all" },
    ...categories
  ];

  return (
    <section className="bg-white py-6 sticky top-16 z-40 shadow-sm" data-testid="category-tabs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {allCategories.map((category) => (
            <button
              key={category.id}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.slug || selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-light text-charcoal hover:bg-gray-300"
              }`}
              onClick={() => onCategoryChange(category.slug || category.id)}
              data-testid={`category-tab-${category.slug || category.id}`}
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
