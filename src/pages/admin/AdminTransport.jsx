import { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge, Loader, Modal, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { FiTruck, FiUsers } from 'react-icons/fi';

export default function AdminTransport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    orderId: '', driverId: '', vehicleNumber: '', vehicleType: '', estimatedDelivery: '',
  });

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/transport/admin/all');
      setRecords(data.records);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const openAssign = async () => {
    try {
      const [ordersRes, staffRes] = await Promise.all([
        api.get('/orders/admin/all', { params: { limit: 100 } }),
        api.get('/users/transport-staff'),
      ]);
      const terminalStates = ['Delivered', 'Cancelled', 'Delivery Failed'];
      const assignedOrderIds = new Set(records.map(r => r.orderId?._id?.toString()));
      setOrders(ordersRes.data.orders.filter(o =>
        !terminalStates.includes(o.orderStatus) && !assignedOrderIds.has(o._id)
      ));
      setStaff(staffRes.data.staff);
    } catch { /* ignore */ }
    setForm({ orderId: '', driverId: '', vehicleNumber: '', vehicleType: '', estimatedDelivery: '' });
    setAssignModal(true);
  };

  const handleAssign = async () => {
    try {
      await api.post('/transport/assign', form);
      toast.success('Transport assigned');
      setAssignModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Transport Management</h2>
        <button onClick={openAssign}
          className="flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <FiTruck size={16} /> Assign Transport
        </button>
      </div>

      {records.length === 0 ? (
        <EmptyState icon="🚚" title="No transport records" description="Assign a driver to an order to get started." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-500">Order</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Driver</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Vehicle</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Updates</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{r.orderId?._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.driverId?.name || 'N/A'}</p>
                      <p className="text-gray-400 text-xs">{r.driverId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{r.vehicleNumber || '—'}</p>
                      <p className="text-gray-400 text-xs">{r.vehicleType || ''}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{r.orderId?.userId?.name || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {r.statusUpdates?.length || 0} updates
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Transport" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            >
              <option value="">Select order...</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  #{o._id.slice(-8).toUpperCase()} - {o.shippingAddress?.customerName} (₹{o.finalAmount?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            >
              <option value="">Select driver...</option>
              {staff.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input type="text" value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <input type="text" value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
            <input type="date" value={form.estimatedDelivery}
              onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAssignModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleAssign}
              className="px-6 py-2 bg-green-400 hover:bg-green-300 text-gray-900 font-semibold text-sm rounded-lg">
              Assign
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
