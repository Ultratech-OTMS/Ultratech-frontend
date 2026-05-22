import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCart';
import { Loader, Pagination, EmptyState } from '../components/common/UI';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const categories = ['All', 'Cement', 'Concrete', 'Aggregates', 'Dry Mix', 'White Cement', 'Ready Mix'];
const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings', label: 'Top Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;

    api.get('/products', { params })
      .then(({ data }) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== 'All' && v !== '-createdAt') params.set(k, v);
      else params.delete(k);
    });
    if (updates.category !== undefined || updates.search !== undefined || updates.sort !== undefined) params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {category !== 'All' ? category : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => updateParams({ search: e.target.value })}
                placeholder="Search products..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-green-400"
              />
              {search && (
                <button onClick={() => updateParams({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* Category filter - desktop */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParams({ category: cat })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-green-400 text-gray-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              <FiFilter size={15} /> Categories
            </button>
          </div>

          {/* Mobile category filters */}
          {showFilters && (
            <div className="md:hidden flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { updateParams({ category: cat }); setShowFilters(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-green-400 text-gray-900'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <Loader text="Loading products..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              onPageChange={(p) => updateParams({ page: p })}
            />
          </>
        )}
      </div>
    </div>
  );
}
