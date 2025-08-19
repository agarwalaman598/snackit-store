import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // The "All" category is a special case
  const allCategory = { id: "all", name: "All Items", icon: "fas fa-th-large" };
  const allCategories = [allCategory, ...categories];

  return (
    <section className="bg-white py-6 sticky top-16 z-40 shadow-sm border-b border-gray-100" data-testid="category-tabs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((category) => (
            <button
              key={category.id}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-sm ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
              onClick={() => onCategoryChange(category.id)}
              data-testid={`category-tab-${category.id}`}
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