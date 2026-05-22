import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Loader } from '../components/common/UI';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiHeart, FiStar, FiPackage, FiTag, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjMwMCIgeT0iMzAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzliYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const inWishlist = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return;
    setAdding(true);
    const res = await addToCart(product._id, quantity);
    if (res.success) toast.success(`Added ${quantity} item(s) to cart!`);
    else toast.error(res.message || 'Failed to add');
    setAdding(false);
  };

  const handleWishlist = async () => {
    if (!user) return;
    const res = await toggleWishlist(product._id);
    if (res.success) toast.success(res.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader size="lg" /></div>;
  if (!product) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-yellow-600">Home</Link>
            <FiChevronRight size={12} />
            <Link to="/products" className="hover:text-yellow-600">Products</Link>
            <FiChevronRight size={12} />
            <Link to={`/products?category=${product.category}`} className="hover:text-yellow-600">{product.category}</Link>
            <FiChevronRight size={12} />
            <span className="text-gray-800 font-medium truncate">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="bg-gray-50 p-8 md:p-12 flex items-center justify-center">
              <img
                src={product.image ? product.image : PLACEHOLDER}
                alt={product.title}
                className="max-w-full max-h-[400px] object-contain"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </div>

            {/* Details */}
            <div className="p-8 md:p-12 flex flex-col">
              <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                <FiTag size={12} /> {product.category}
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-gray-500 text-sm mb-1">{product.weight}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} size={14}
                      className={`${star <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.ratings}</span>
                <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                <p className="text-gray-500 text-sm mt-1">per {product.weight}</p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <FiPackage size={16} className="text-gray-400" />
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-8">{product.description}</p>

              {/* Add to Cart Section */}
              {user?.role === 'customer' && product.stock > 0 && (
                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold text-gray-800 min-w-[40px] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                      <FiShoppingCart size={18} />
                      {adding ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={handleWishlist}
                      className={`p-3 rounded-xl border transition-all ${
                        inWishlist
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                      }`}
                    >
                      <FiHeart size={18} className={inWishlist ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>
              )}

              {!user && (
                <div className="mt-auto">
                  <Link to="/login"
                    className="block text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors">
                    Login to Purchase
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
