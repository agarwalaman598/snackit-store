import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onLoginClick?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ 
  cartItemCount = 0, 
  onCartClick = () => {}, 
  onLoginClick = () => {}, 
  onSearch = () => {}, 
  searchQuery = "" 
}: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3" data-testid="logo">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <i className="fas fa-cookie-bite text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-charcoal">KIIT Snack Store</h1>
              <p className="text-xs text-gray-500">Quick delivery to your hostel</p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search for snacks, drinks, instant food..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                data-testid="search-input"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button 
              className="relative p-2 hover:bg-gray-light rounded-lg transition-colors duration-200" 
              onClick={onCartClick}
              data-testid="cart-button"
            >
              <i className="fas fa-shopping-cart text-xl text-charcoal"></i>
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  data-testid="cart-count"
                >
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3" data-testid="user-profile">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"}
                    alt="User" 
                    className="w-8 h-8 rounded-full"
                    data-testid="user-avatar"
                  />
                  <span className="text-sm font-medium text-charcoal" data-testid="user-name">
                    {user?.firstName} {user?.lastName}
                  </span>
                  {user?.isAdmin && (
                    <a 
                      href="/admin"
                      className="text-xs bg-primary text-white px-2 py-1 rounded-full"
                      data-testid="admin-link"
                    >
                      Admin
                    </a>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    data-testid="logout-button"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              ) : (
                <button 
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
                  onClick={onLoginClick}
                  data-testid="login-button"
                >
                  <i className="fas fa-user mr-2"></i>Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search snacks..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            data-testid="mobile-search-input"
          />
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
      </div>
    </header>
  );
}
