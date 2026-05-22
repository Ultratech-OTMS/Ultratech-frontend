import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader, StatCard, StatusBadge } from '../../components/common/UI';
import { FiTruck, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

export default function TransportDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    try {
      const { data } = await api.get('/transport/my-deliveries');
      setDeliveries(data.deliveries);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 15000);
    return () => clearInterval(interval);
  }, [fetchDeliveries]);

  const active = deliveries.filter(d => d.status !== 'Delivered' && d.status !== 'Delivery Failed');
  const completed = deliveries.filter(d => d.status === 'Delivered');
  const failed = deliveries.filter(d => d.status === 'Delivery Failed');

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
        <button onClick={fetchDeliveries}
          className="flex items-center gap-1 text-gray-500 hover:text-green-600 text-sm transition-colors">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Active Deliveries" value={active.length} icon={<FiTruck size={22} />} color="green" />
        <StatCard title="Completed" value={completed.length} icon={<FiCheckCircle size={22} />} color="green" />
        <StatCard title="Failed" value={failed.length} icon={<FiXCircle size={22} />} color="red" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiTruck size={18} /> Active Deliveries
        </h2>
        {active.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No active deliveries assigned.</p>
        ) : (
          <div className="space-y-3">
            {active.map((d) => (
              <div key={d._id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Order #{d.orderId?._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {d.orderId?.shippingAddress?.customerName || 'N/A'} — {d.orderId?.shippingAddress?.city || 'N/A'}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🚛 {d.vehicleNumber || 'N/A'}</span>
                  <span>📍 {d.orderId?.shippingAddress?.address || ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to="/transport/deliveries" className="text-green-600 hover:text-green-700 text-sm font-medium">
            View All Deliveries →
          </Link>
        </div>
      </div>
    </div>
  );
}
