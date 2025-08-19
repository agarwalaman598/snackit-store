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
    <section className="bg-white py-3 sticky top-16 z-40 shadow-sm" data-testid="category-tabs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((category) => (
            <button
              key={category.id}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                selectedCategory === category.id
                  ? "bg-primary text-white shadow"
                  : "bg-gray-light text-charcoal hover:bg-gray-200"
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