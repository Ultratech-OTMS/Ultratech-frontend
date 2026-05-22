import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader, Modal, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'flat', discountValue: '', minCartValue: 10000, maxUses: 100, expiresAt: '',
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', form);
      toast.success('Coupon created');
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Coupons</h2>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <FiPlus size={16} /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon="🏷️" title="No coupons" description="Create your first coupon to start promotions." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FiTag className="text-yellow-500" size={18} />
                    <span className="font-bold text-gray-800 text-lg">{c.code}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.discountType === 'flat' ? `₹${c.discountValue.toLocaleString('en-IN')} OFF` : `${c.discountValue}% OFF`}
                  </p>
                </div>
                <button onClick={() => handleDelete(c._id)}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                  <FiTrash2 size={15} />
                </button>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Min. Cart: ₹{c.minCartValue?.toLocaleString('en-IN')}</p>
                <p>Uses: {c.usedCount || 0}/{c.maxUses}</p>
                <p className={`${c.isActive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </p>
                {c.expiresAt && <p>Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              <option value="flat">Flat (₹)</option>
              <option value="percent">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
            <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" min={1} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Cart Value (₹)</label>
              <input type="number" value={form.minCartValue} onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" min={1} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit"
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm rounded-lg">
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
