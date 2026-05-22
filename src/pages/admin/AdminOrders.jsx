import { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge, Loader, Modal, Pagination, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { FiSearch, FiEye } from 'react-icons/fi';

const orderStatuses = ['All', 'Placed', 'Processing', 'Confirmed', 'Vehicle Assigned', 'Loading Started', 'Out for Delivery', 'Reached Destination', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [transportStaff, setTransportStaff] = useState([]);
  const [statusModal, setStatusModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ orderStatus: '', note: '', assignedDriver: '' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin/all', { params: { page, limit: 20, search, status: statusFilter } });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  const openStatusModal = async (order) => {
    setSelectedOrder(order);
    setStatusForm({ orderStatus: order.orderStatus, note: '', assignedDriver: order.assignedDriver?._id || '' });
    try {
      const { data } = await api.get('/users/transport-staff');
      setTransportStaff(data.staff);
    } catch { /* ignore */ }
    setStatusModal(true);
  };

  const updateStatus = async () => {
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, statusForm);
      toast.success('Order status updated');
      setStatusModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-6">Orders</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by customer name or phone..."
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        >
          {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description="No orders match your criteria." />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-500">Order ID</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Customer</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Items</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Amount</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{o.shippingAddress?.customerName}</p>
                        <p className="text-gray-400 text-xs">{o.shippingAddress?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.products?.length}</td>
                      <td className="px-4 py-3 font-medium">₹{o.finalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.orderStatus} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedOrder(o); setDetailModal(true); }}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors" title="View">
                            <FiEye size={15} />
                          </button>
                          <button onClick={() => openStatusModal(o)}
                            className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xs font-semibold rounded-lg transition-colors">
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.shippingAddress?.customerName}</p>
                <p className="text-gray-400">{selectedOrder.shippingAddress?.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusBadge status={selectedOrder.orderStatus} />
              </div>
            </div>
            <div>
              <p className="text-gray-500">Shipping Address</p>
              <p>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Products</p>
              <div className="space-y-2">
                {selectedOrder.products?.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{p.title} × {p.quantity}</span>
                    <span className="font-medium">₹{(p.price * p.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{selectedOrder.finalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {selectedOrder.statusHistory?.length > 0 && (
              <div>
                <p className="text-gray-500 mb-2">Status History</p>
                <div className="space-y-1">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-500">
                      <span>{h.status}</span>
                      <span>{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Order Status" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusForm.orderStatus}
              onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            >
              {orderStatuses.filter(s => s !== 'All').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea
              value={statusForm.note}
              onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver (optional)</label>
            <select
              value={statusForm.assignedDriver}
              onChange={(e) => setStatusForm({ ...statusForm, assignedDriver: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            >
              <option value="">Select driver...</option>
              {transportStaff.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setStatusModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={updateStatus}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm rounded-lg">
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
