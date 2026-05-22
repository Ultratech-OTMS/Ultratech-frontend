import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader, Pagination } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, limit: 20, search, role: roleFilter } });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const toggleStatus = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/toggle`);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Failed to toggle'); }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-6">Users</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        >
          <option value="All">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="transport">Transport</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-500">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Phone</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Role</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Joined</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'transport' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(u._id)}
                        className={`p-1.5 transition-colors ${u.isActive ? 'text-green-500 hover:text-red-500' : 'text-red-400 hover:text-green-500'}`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
    </div>
  );
}
