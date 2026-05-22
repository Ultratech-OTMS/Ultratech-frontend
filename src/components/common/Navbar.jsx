import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingCart, FiHeart, FiUser, FiLogOut, FiPackage,
  FiMenu, FiX, FiSearch, FiChevronDown
} from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 sticky top-0 z-50 shadow-lg">
      {/* Top stripe */}
      <div className="bg-yellow-400 py-1 px-4 text-center text-xs font-medium text-gray-900">
        🚚 Free delivery on orders above ₹50,000 | Call us: 1800-ULTRATECH
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-yellow-400 font-black text-2xl leading-none tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              ULTRA<span className="text-white">TECH</span>
            </div>
            <div className="text-gray-400 text-[9px] uppercase tracking-[0.2em] -mt-0.5">
              Building India
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cement, concrete, aggregates..."
              className="w-full bg-gray-800 text-white placeholder-gray-400 text-sm px-4 py-2.5 pl-10 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none transition-colors"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-yellow-300 transition-colors">
              Search
            </button>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Nav links */}
            <Link to="/products"
              className="hidden lg:block text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors px-2">
              Products
            </Link>

            {user?.role === 'customer' && (
              <>
                {/* Wishlist */}
                <Link to="/wishlist"
                  className="hidden sm:flex text-gray-300 hover:text-yellow-400 transition-colors p-2 relative">
                  <FiHeart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link to="/cart"
                  className="relative flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm px-3 py-2 rounded-lg transition-colors">
                  <FiShoppingCart size={18} />
                  <span className="hidden sm:block">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <FiChevronDown size={14} className={`hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                    </div>
                    {user.role === 'customer' && (
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <FiPackage size={15} /> My Orders
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <FiUser size={15} /> Admin Panel
                      </Link>
                    )}
                    {user.role === 'transport' && (
                      <Link to="/transport" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <FiUser size={15} /> Transport Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-gray-300 hover:text-white text-sm font-medium px-3 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/register"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-300 hover:text-white ml-1"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700 mt-2 pt-3">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-gray-800 text-white placeholder-gray-400 text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
              />
              <button type="submit" className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
                Go
              </button>
            </form>
            <div className="flex flex-col gap-1">
              <Link to="/products" onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-yellow-400 py-2 text-sm">Products</Link>
              {user?.role === 'customer' && (
                <>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                    className="text-gray-300 hover:text-yellow-400 py-2 text-sm">Wishlist</Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)}
                    className="text-gray-300 hover:text-yellow-400 py-2 text-sm">My Orders</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}