import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, Pagination, Loader, EmptyState } from '../../components/common/UI';
import { FiPackage, FiEye, FiCalendar } from 'react-icons/fi';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/my', { params: { page, limit: 10 } });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          My Orders
        </h1>

        {loading ? (
          <Loader />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="Place your first order to get started."
            action={
              <Link to="/products"
                className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-colors">
                Browse Products <FiPackage size={16} />
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FiCalendar size={12} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Order #{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>

                <div className="space-y-2 mb-3">
                  {order.products?.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <img src={p.image || 'https://via.placeholder.com/40'} alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 truncate">{p.title}</p>
                        <p className="text-gray-400 text-xs">Qty: {p.quantity} × ₹{p.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                  {(order.products?.length || 0) > 3 && (
                    <p className="text-xs text-gray-400">+{order.products.length - 3} more items</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="font-bold text-gray-800">₹{order.finalAmount?.toLocaleString('en-IN')}</p>
                  <Link to={`/orders/${order._id}`}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                    <FiEye size={14} /> Track Order
                  </Link>
                </div>
              </div>
            ))}
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              onPageChange={fetchOrders}
            />
          </div>
        )}
      </div>
    </div>
  );
}
