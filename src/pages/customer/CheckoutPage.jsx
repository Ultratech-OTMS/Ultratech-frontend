import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FiMapPin, FiPhone, FiUser, FiHome, FiNavigation, FiLoader } from 'react-icons/fi';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [form, setForm] = useState({
    customerName: '', phone: '', address: '', city: '', state: '', pincode: '', location: '', landmark: '',
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const fetchPincode = async (loc) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const display = data[0].display_name;
        const parts = display.split(', ');
        const pincodeMatch = display.match(/\b\d{6}\b/);
        setForm((prev) => ({
          ...prev,
          pincode: pincodeMatch ? pincodeMatch[0] : prev.pincode,
          city: parts[parts.length > 4 ? parts.length - 4 : 0] || prev.city,
          state: parts[parts.length > 2 ? parts.length - 2 : 0] || prev.state,
        }));
      }
    } catch { /* ignore */ }
  };

  const fetchCityState = async (pincode) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success') {
        const po = data[0].PostOffice?.[0];
        if (po) setForm((prev) => ({ ...prev, city: po.District || prev.city, state: po.State || prev.state }));
      }
    } catch { /* ignore */ }
  };

  const handleDetect = async (field) => {
    if (field === 'location' && form.location) {
      setDetecting(true);
      await fetchPincode(form.location);
      setDetecting(false);
    } else if (field === 'pincode' && form.pincode.length === 6) {
      setDetecting(true);
      await fetchCityState(form.pincode);
      setDetecting(false);
    }
  };

  const validate = () => {
    const required = ['customerName', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!form[field]?.trim()) return toast.error('Please fill all required fields'), false;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Invalid phone number'), false;
    if (!/^\d{6}$/.test(form.pincode)) return toast.error('Invalid pincode'), false;
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: form });
      toast.success('Order placed! Our team will contact you for payment.');
      clearCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiMapPin className="text-yellow-500" /> Shipping Address
              </h2>
              <div className="space-y-4">
                <FormField label="Full Name" icon={FiUser} name="customerName" placeholder="Rahul Verma" value={form.customerName} onChange={handleChange} />
                <FormField label="Phone Number" icon={FiPhone} name="phone" placeholder="9876543210" type="tel" value={form.phone} onChange={handleChange} />
                <FormField label="Location / Area" icon={FiNavigation} name="location" placeholder="e.g., Andheri East" hint="Enter location to auto-detect pincode" value={form.location} onChange={handleChange} onDetect={() => handleDetect('location')} detecting={detecting} />
                <FormField label="Pincode" icon={FiMapPin} name="pincode" placeholder="400001" type="text" hint="Enter pincode to auto-fill city & state" value={form.pincode} onChange={handleChange} onDetect={() => handleDetect('pincode')} detecting={detecting} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City" icon={FiHome} name="city" placeholder="Mumbai" value={form.city} onChange={handleChange} />
                  <FormField label="State" name="state" placeholder="Maharashtra" value={form.state} onChange={handleChange} />
                </div>
                <FormField label="Full Address" name="address" placeholder="House/Flat No., Street, Area" value={form.address} onChange={handleChange} />
                <FormField label="Landmark (optional)" name="landmark" placeholder="Near..." value={form.landmark} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId?._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[180px]">
                      {item.productId?.title} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-800">
                      ₹{((item.productId?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">* Payment will be collected offline after order confirmation</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-6 w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <FiLoader className="animate-spin" size={16} />}
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon: Icon, name, placeholder, type = 'text', hint, value, onChange, onDetect, detecting }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
        {name === 'location' ? (
          <div className="flex gap-2">
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-yellow-400 transition-colors" />
            <button type="button" onClick={onDetect} disabled={detecting || !value}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
              {detecting ? <FiLoader className="animate-spin" size={16} /> : 'Detect'}
            </button>
          </div>
        ) : name === 'pincode' ? (
          <div className="flex gap-2">
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={6}
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-yellow-400 transition-colors" />
            {value?.length === 6 && (
              <button type="button" onClick={onDetect} disabled={detecting}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                {detecting ? <FiLoader className="animate-spin" size={16} /> : 'Fetch'}
              </button>
            )}
          </div>
        ) : (
          <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-yellow-400 transition-colors" />
        )}
      </div>
      {hint && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    </div>
  );
}
