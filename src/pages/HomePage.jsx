import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCart';
import { Loader } from '../components/common/UI';
import { FiSearch, FiArrowRight, FiShield, FiTruck, FiAward, FiHeadphones } from 'react-icons/fi';

const categories = [
  { name: 'Cement', image: '🧱', desc: 'PPC, OPC, Specialty' },
  { name: 'Concrete', image: '🏗️', desc: 'Ready Mix, Precast' },
  { name: 'Aggregates', image: '⛰️', desc: 'Sand, Gravel, Crushed Stone' },
  { name: 'Dry Mix', image: '🧰', desc: 'Plaster, Putty, Adhesive' },
  { name: 'White Cement', image: '⚪', desc: 'Decorative & Finishing' },
  { name: 'Ready Mix', image: '🚛', desc: 'Factory Produced Concrete' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setFeatured(data?.products || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 border border-yellow-400 rotate-45" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-yellow-400 rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-yellow-400/30 rotate-[30deg]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">India's #1 Construction Brand</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Building India's<br />
              <span className="text-yellow-400">Stronger Future</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-xl">
              Premium construction materials delivered to your doorstep. 
              From cement to concrete — everything you need for your project.
            </p>

            {/* Search */}
            <div className="flex gap-3 flex-col sm:flex-row max-w-xl">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-xl px-4 py-3.5 pl-12 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>
              <Link to={`/products?search=${encodeURIComponent(search)}`}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                Search <FiArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[
                { number: '40+', label: 'Years Legacy' },
                { number: '100+', label: 'Products' },
                { number: '10K+', label: 'Happy Clients' },
                { number: '500+', label: 'Cities Covered' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-white font-black text-2xl">{s.number}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Product Categories
            </h2>
            <p className="text-gray-500 mt-2">Browse our wide range of construction materials</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="group bg-gray-50 hover:bg-yellow-50 border border-gray-100 hover:border-yellow-200 rounded-2xl p-6 text-center transition-all duration-300"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.image}</div>
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-yellow-600 transition-colors">{cat.name}</h3>
                <p className="text-gray-400 text-xs mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Featured Products
              </h2>
              <p className="text-gray-500 mt-1">Most popular construction materials</p>
            </div>
            <Link to="/products"
              className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-yellow-600 font-medium text-sm transition-colors">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-8 sm:hidden">
            <Link to="/products"
              className="inline-flex items-center gap-1 text-yellow-600 font-medium text-sm">
              View All Products <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FiShield, title: 'Premium Quality', desc: 'BIS certified materials' },
              { icon: FiTruck, title: 'Pan-India Delivery', desc: 'Reaching 500+ cities' },
              { icon: FiAward, title: 'Trusted Brand', desc: '40+ years of excellence' },
              { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer care' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-yellow-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Ready to Start Your Project?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Browse our catalog and order the finest construction materials at competitive prices.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link to="/products"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl transition-colors">
              Browse Products
            </Link>
            <Link to="/register"
              className="border border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 font-semibold px-8 py-3 rounded-xl transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
