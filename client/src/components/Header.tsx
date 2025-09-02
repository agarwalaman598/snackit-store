import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

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
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // Clear cart
      clearCart();
      
      // Call logout from auth hook
      await logout();
      
      // Redirect to home page
      setLocation("/");
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
            <img src="/logo.svg" alt="SnackIt" className="w-10 h-10 object-cover rounded-xl shadow-lg" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight gradient-text">SnackIt</h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Midnight Crunchy Delights</p>
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
            {/* Navigation Menu for Authenticated Users */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-4">
                <a 
                  href="/" 
                  className="text-charcoal hover:text-primary transition-colors duration-200 font-medium"
                  data-testid="nav-home"
                >
                  Home
                </a>
                <a 
                  href="/orders" 
                  className="text-charcoal hover:text-primary transition-colors duration-200 font-medium"
                  data-testid="nav-orders"
                >
                  My Orders
                </a>
                {user?.isAdmin && (
                  <a 
                    href="/admin" 
                    className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium"
                    data-testid="nav-admin"
                  >
                    Admin
                  </a>
                )}
              </nav>
            )}

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
                  <div className="relative group">
                    <button className="flex items-center space-x-2 hover:bg-gray-light rounded-lg p-2 transition-colors duration-200">
                      <img 
                        src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"}
                        alt="User" 
                        className="w-8 h-8 rounded-full"
                        data-testid="user-avatar"
                      />
                      <span className="text-sm font-medium text-charcoal hidden sm:block" data-testid="user-name">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <i className="fas fa-chevron-down text-xs text-gray-500"></i>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-charcoal">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <a 
                          href="/orders" 
                          className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-light transition-colors duration-200"
                        >
                          <i className="fas fa-list mr-2"></i>My Orders
                        </a>
                        {user?.isAdmin && (
                          <a 
                            href="/admin" 
                            className="block px-4 py-2 text-sm text-primary hover:bg-gray-light transition-colors duration-200"
                          >
                            <i className="fas fa-cog mr-2"></i>Admin Panel
                          </a>
                        )}
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-light transition-colors duration-200"
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Admin Access Button */}
                  {user?.isAdmin && (
                    <a 
                      href="/admin"
                      className="text-xs bg-primary text-white px-2 py-1 rounded-full hover:bg-primary-dark transition-colors duration-200"
                      data-testid="admin-link"
                    >
                      Admin
                    </a>
                  )}
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
        
        {/* Mobile Navigation Menu */}
        {isAuthenticated && (
          <nav className="flex items-center justify-center space-x-6 mt-3 pt-3 border-t border-gray-200">
            <a 
              href="/" 
              className="text-charcoal hover:text-primary transition-colors duration-200 text-sm font-medium"
              data-testid="mobile-nav-home"
            >
              <i className="fas fa-home mr-1"></i>Home
            </a>
            <a 
              href="/orders" 
              className="text-charcoal hover:text-primary transition-colors duration-200 text-sm font-medium"
              data-testid="mobile-nav-orders"
            >
              <i className="fas fa-list mr-1"></i>Orders
            </a>
            {user?.isAdmin && (
              <a 
                href="/admin" 
                className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
                data-testid="mobile-nav-admin"
              >
                <i className="fas fa-cog mr-1"></i>Admin
              </a>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
