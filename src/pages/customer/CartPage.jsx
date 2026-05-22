import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { EmptyState, Loader } from '../../components/common/UI';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);
  const discount = coupon?.discount || 0;
  const finalTotal = Math.max(subtotal - discount, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, cartTotal: subtotal });
      setCoupon(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            description="Browse our products and add items to your cart."
            action={
              <Link to="/products"
                className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-colors">
                Browse Products <FiShoppingBag size={16} />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const prod = item.productId;
                if (!prod) return null;
                return (
                  <div key={prod._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
                    <img
                      src={prod.image || 'https://via.placeholder.com/100'}
                      alt={prod.title}
                      className="w-20 h-20 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${prod._id}`} className="font-semibold text-gray-800 text-sm hover:text-green-600 transition-colors line-clamp-1">
                        {prod.title}
                      </Link>
                      <p className="text-gray-500 text-xs mt-0.5">{prod.weight}</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">₹{prod.price.toLocaleString('en-IN')}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                            className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
                            <FiMinus size={12} />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-semibold min-w-[30px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                            className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(prod._id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

                {/* Coupon */}
                <div className="mb-4">
                  {coupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-700">{coupon.coupon?.code} Applied</p>
                        <p className="text-xs text-green-600">You save ₹{discount.toLocaleString('en-IN')}</p>
                      </div>
                      <button onClick={removeCoupon} className="text-green-500 hover:text-green-700 text-xs font-semibold">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                        <FiTag size={12} className="inline mr-1" /> Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="SAVE500"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 uppercase"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Min. order ₹10,000 to apply coupon</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery</span>
                    <span>{subtotal >= 50000 ? 'Free' : 'Will be calculated'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link to="/checkout"
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-bold py-3 rounded-xl transition-colors">
                  Proceed to Checkout <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
