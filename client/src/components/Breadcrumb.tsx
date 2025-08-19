import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb() {
  const [location] = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location;
    
    if (path === "/") {
      return [{ label: "Home" }];
    }
    
    if (path === "/orders") {
      return [
        { label: "Home", href: "/" },
        { label: "My Orders" }
      ];
    }
    
    if (path === "/admin") {
      return [
        { label: "Home", href: "/" },
        { label: "Admin Panel" }
      ];
    }
    
    return [{ label: "Home", href: "/" }];
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index === 0 ? (
            <Home className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          
          {item.href ? (
            <a 
              href={item.href}
              className="hover:text-primary transition-colors duration-200"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-charcoal font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
