import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzliYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    const res = await addToCart(product._id);
    if (res.success) toast.success('Added to cart!');
    else toast.error(res.message || 'Failed to add');
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const res = await toggleWishlist(product._id);
    if (res.success) toast.success(res.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
    else toast.error('Failed to update wishlist');
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-gray-50">
        <img
          src={product.image ? product.image : PLACEHOLDER}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
          {product.category}
        </span>

        {/* Wishlist button */}
        {user?.role === 'customer' && (
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md
              ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-red-500 hover:text-white'}`}
          >
            <FiHeart size={14} className={inWishlist ? 'fill-current' : ''} />
          </button>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-gray-500 text-xs mb-2">{product.weight}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <FiStar className="text-yellow-400 fill-current" size={12} />
          <span className="text-xs text-gray-600 font-medium">{product.ratings}</span>
          <span className="text-xs text-gray-400">({product.numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400">per {product.weight}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/products/${product._id}`}
              className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-colors">
              <FiEye size={15} />
            </Link>
            {user?.role === 'customer' && (
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-yellow-400 text-white hover:text-gray-900 text-xs font-semibold px-3 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={13} />
                {adding ? '...' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}