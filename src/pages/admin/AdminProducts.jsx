import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader, Modal, Pagination, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';

const categories = ['Cement', 'Concrete', 'Aggregates', 'Dry Mix', 'White Cement', 'Ready Mix'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Cement', price: '', stock: '', weight: '', isFeatured: false,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/admin/all', { params: { page, limit: 20, search } });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', category: 'Cement', price: '', stock: '', weight: '', isFeatured: false });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      weight: product.weight,
      isFeatured: product.isFeatured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (e.target.image?.files[0]) fd.append('image', e.target.image.files[0]);

      if (editing) {
        await api.put(`/products/${editing._id}`, fd);
        toast.success('Product updated');
      } else {
        await api.post('/products', fd);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Products</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="w-full max-w-md bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
      </div>

      {loading ? <Loader /> : products.length === 0 ? (
        <EmptyState icon="📦" title="No products" description="Add your first product to get started." />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-500">Product</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Category</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Price</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Stock</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Featured</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image && <img src={p.image} alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                            onError={(e) => { e.target.style.display = 'none'; }} />}
                          {!p.image && <div className="w-10 h-10 rounded-lg bg-gray-200" />}
                          <div>
                            <p className="font-medium text-gray-800 max-w-[200px] truncate">{p.title}</p>
                            <p className="text-gray-400 text-xs">{p.weight}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category}</td>
                      <td className="px-4 py-3 font-medium">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{p.stock > 0 ? p.stock : 'Out'}</span>
                      </td>
                      <td className="px-4 py-3">{p.isFeatured ? '⭐' : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                            <FiTrash2 size={15} />
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" rows={3} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input type="text" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" min={0} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" min={0} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input type="file" name="image" accept="image/*"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isFeatured" checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              <label htmlFor="isFeatured" className="text-sm text-gray-700">Featured Product</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
