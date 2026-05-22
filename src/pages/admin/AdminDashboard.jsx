import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader, StatCard } from '../../components/common/UI';
import { FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiPackage } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/orders/admin/stats');
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<FiShoppingBag size={22} />}
          color="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<FiClock size={22} />}
          color="yellow"
        />
        <StatCard
          title="Delivered"
          value={stats?.deliveredOrders || 0}
          icon={<FiCheckCircle size={22} />}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={<FiDollarSign size={22} />}
          color="purple"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiPackage size={18} /> Recent Orders
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-500">Order ID</th>
                  <th className="pb-3 font-semibold text-gray-500">Customer</th>
                  <th className="pb-3 font-semibold text-gray-500">Amount</th>
                  <th className="pb-3 font-semibold text-gray-500">Status</th>
                  <th className="pb-3 font-semibold text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 text-gray-700">{order.userId?.name || 'N/A'}</td>
                    <td className="py-3 font-medium">₹{order.finalAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        order.orderStatus === 'Placed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{order.orderStatus}</span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
