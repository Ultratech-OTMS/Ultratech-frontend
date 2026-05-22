import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { StatusBadge, Loader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { FiMapPin, FiTruck, FiRefreshCw } from 'react-icons/fi';

const statusOptions = [
  'Vehicle Assigned', 'Loading Started', 'Out for Delivery',
  'Reached Destination', 'Delivered', 'Delivery Failed',
];

export default function TransportDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '', location: '' });

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

  const openUpdate = (delivery) => {
    setUpdating(delivery);
    setStatusForm({ status: delivery.status, remarks: '', location: '' });
  };

  const handleUpdate = async () => {
    try {
      const { data } = await api.put(`/transport/${updating._id}/status`, statusForm);
      toast.success(data.message || 'Status updated!');
      setDeliveries(prev => prev.map(d => d._id === updating._id ? data.transport : d));
      setUpdating(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">My Deliveries</h2>
        <button onClick={fetchDeliveries}
          className="flex items-center gap-1 text-gray-500 hover:text-green-600 text-sm transition-colors">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {deliveries.length === 0 ? (
        <EmptyState icon="🚚" title="No deliveries assigned" description="You'll see deliveries here once admin assigns them." />
      ) : (
        <div className="space-y-4">
          {deliveries.map((d) => {
            const customerName = d.orderId?.shippingAddress?.customerName;
            const customerPhone = d.orderId?.shippingAddress?.phone;
            const address = d.orderId?.shippingAddress;
            return (
              <div key={d._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order #{d.orderId?._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {customerName || 'N/A'} — {customerPhone || 'N/A'}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                {address && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="flex items-start gap-2 text-sm">
                      <FiMapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                      <div>
                        <p className="text-gray-700">{address.address}</p>
                        <p className="text-gray-500 text-xs">{address.city}, {address.state} - {address.pincode}</p>
                        {address.landmark && <p className="text-gray-400 text-xs mt-0.5">Near: {address.landmark}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <FiTruck size={14} className="text-gray-400" />
                  <span>{d.vehicleNumber || 'Vehicle not assigned'} {d.vehicleType ? `(${d.vehicleType})` : ''}</span>
                </div>

                {d.statusUpdates?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Updates</p>
                    <div className="space-y-1">
                      {d.statusUpdates.map((u, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                          <span className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-gray-700">{u.status}</span>
                            {u.remarks && <span> — {u.remarks}</span>}
                            {u.location && <span> 📍{u.location}</span>}
                            <p className="text-gray-400">{new Date(u.timestamp).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {d.status !== 'Delivered' && d.status !== 'Delivery Failed' && (
                  <button onClick={() => openUpdate(d)}
                    className="w-full bg-green-400 hover:bg-green-300 text-gray-900 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Update Status
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {updating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setUpdating(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Update Delivery Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={statusForm.remarks}
                  onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  rows={2} placeholder="Any remarks..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={statusForm.location}
                  onChange={(e) => setStatusForm({ ...statusForm, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  placeholder="Current location..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setUpdating(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleUpdate}
                  className="px-6 py-2 bg-green-400 hover:bg-green-300 text-gray-900 font-semibold text-sm rounded-lg">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
