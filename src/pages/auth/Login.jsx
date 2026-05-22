import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success(`Welcome back!`);
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'transport') navigate('/transport');
      else navigate(from);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left brand side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {/* Geometric pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}
              style={{ left: `${(i % 5) * 25}%`, top: `${Math.floor(i / 5) * 25}%` }}
              className="absolute w-48 h-48 border border-green-400 rotate-45 opacity-30"
            />
          ))}
        </div>
        <div className="relative text-center px-12">
          <div className="text-green-400 font-black text-6xl mb-3"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            CEMENT<span className="text-white">2STEEL</span>
          </div>
          <p className="text-gray-400 text-lg mb-8">Building India's Future</p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { label: '#1 Cement Brand', icon: '🏆' },
              { label: 'Pan-India Delivery', icon: '🚚' },
              { label: '100+ Products', icon: '📦' },
              { label: 'Trusted Quality', icon: '✅' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-white text-xs font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-green-400 font-black text-3xl mb-1 lg:hidden"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            CEMENT2STEEL
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-green-400 transition-colors placeholder-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-green-400 transition-colors placeholder-gray-600"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 hover:bg-green-300 text-gray-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-300">🛒 Customer: <span className="text-green-400">customer@cementandsteel.com</span> / customer123</p>
              <p className="text-gray-300">⚙️ Admin: <span className="text-green-400">admin@cementandsteel.com</span> / admin123</p>
              <p className="text-gray-300">🚚 Driver: <span className="text-green-400">driver@cementandsteel.com</span> / driver123</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-300 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}