import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Invalid Indian phone number';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const res = await register(form.name, form.email, form.password, form.phone);
    if (res.success) {
      toast.success('Account created! Welcome to UltraTech!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-yellow-400 font-black text-3xl block mb-8"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          ULTRA<span className="text-white">TECH</span>
        </Link>

        <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
        <p className="text-gray-400 text-sm mb-8">Join thousands of builders on UltraTech</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field icon={FiUser} label="Full Name" name="name" placeholder="Rahul Verma" value={form.name} onChange={handleChange} error={errors.name} />
          <Field icon={FiMail} label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
          <Field icon={FiPhone} label="Phone Number" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} error={errors.phone} />
          <Field icon={FiLock} label="Password" name="password"
            type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
            value={form.password} onChange={handleChange} error={errors.password}
            right={
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            }
          />
          <Field icon={FiLock} label="Confirm Password" name="confirm"
            type={showPass ? 'text' : 'password'} placeholder="Repeat password"
            value={form.confirm} onChange={handleChange} error={errors.confirm} />

          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50 text-sm">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, name, type = 'text', placeholder, right, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full bg-gray-800 text-white border rounded-xl px-4 py-3 pl-10 ${right ? 'pr-10' : ''} text-sm focus:outline-none focus:border-yellow-400 transition-colors placeholder-gray-600 ${error ? 'border-red-500' : 'border-gray-700'}`}
        />
        {right}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
