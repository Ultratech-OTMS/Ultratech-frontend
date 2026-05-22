import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { EmptyState } from '../../components/common/UI';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const products = wishlist?.products || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          My Wishlist
        </h1>

        {products.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Save your favorite products for later."
            action={
              <Link to="/products"
                className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-colors">
                Browse Products <FiShoppingBag size={16} />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              if (!product?._id) return null;
              return (
                <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Link to={`/products/${product._id}`}>
                    <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={product.image || 'https://via.placeholder.com/200'}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product._id}`} className="font-semibold text-gray-800 text-sm hover:text-green-600 transition-colors line-clamp-2">
                      {product.title}
                    </Link>
                    <p className="text-gray-500 text-xs mt-1">{product.weight}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">₹{product.price?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
