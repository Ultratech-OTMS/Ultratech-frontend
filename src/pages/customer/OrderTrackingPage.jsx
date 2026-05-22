import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, Loader } from '../../components/common/UI';
import { FiCheck, FiChevronRight, FiPackage, FiTruck, FiMapPin, FiClock, FiX, FiRefreshCw } from 'react-icons/fi';

const statusFlow = [
  'Placed', 'Processing', 'Confirmed', 'Vehicle Assigned',
  'Loading Started', 'Out for Delivery', 'Reached Destination', 'Delivered',
];

const cancelledStatus = 'Cancelled';

const icons = {
  Placed: FiPackage, Processing: FiClock, Confirmed: FiCheck,
  'Vehicle Assigned': FiTruck, 'Loading Started': FiPackage,
  'Out for Delivery': FiTruck, 'Reached Destination': FiMapPin, Delivered: FiCheck,
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: orderData } = await api.get(`/orders/${id}`);
      setOrder(orderData.order);
      try {
        const { data: transportData } = await api.get(`/transport/order/${id}`);
        setTransport(transportData.transport);
      } catch { /* no transport yet */ }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader size="lg" /></div>;
  if (!order) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Order not found</div>;

  const isCancelled = order.orderStatus === cancelledStatus;
  const currentIndex = statusFlow.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/orders" className="hover:text-green-600">My Orders</Link>
          <FiChevronRight size={12} />
          <span className="text-gray-800 font-medium">Order #{order._id.slice(-8).toUpperCase()}</span>
          <button onClick={fetchData} className="ml-auto text-gray-400 hover:text-green-600 transition-colors" title="Refresh">
            <FiRefreshCw size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Order Timeline</h2>
                <StatusBadge status={order.orderStatus} />
              </div>

              {(isCancelled ? [...statusFlow, cancelledStatus] : statusFlow).map((status, idx) => {
                const isPast = !isCancelled && idx <= currentIndex;
                const isCurrent = idx === currentIndex && !isCancelled;
                const isCancelledStep = status === cancelledStatus;
                const Icon = icons[status] || FiClock;

                return (
                  <div key={status} className="relative flex gap-4 pb-6 last:pb-0">
                    {idx < (isCancelled ? statusFlow.length : statusFlow.length - 1) && (
                      <div className={`absolute left-[15px] top-8 w-0.5 h-full ${isPast && !isCancelled ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCancelledStep ? 'bg-red-100 text-red-600' :
                      isCurrent ? 'bg-green-400 text-gray-900 ring-4 ring-green-100' :
                      isPast ? 'bg-green-400 text-gray-900' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCancelledStep ? <FiX size={14} /> : <Icon size={14} />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-semibold text-sm ${isCurrent ? 'text-green-600' : isPast ? 'text-gray-800' : 'text-gray-400'}`}>
                        {status}
                      </p>
                      {(() => {
                        const historyEntry = order.statusHistory?.find(h => h.status === status);
                        if (!historyEntry) return null;
                        return (
                          <div className="mt-1">
                            <p className="text-xs text-gray-400">{new Date(historyEntry.timestamp).toLocaleString('en-IN')}</p>
                            {historyEntry.note && <p className="text-xs text-gray-500 mt-0.5">{historyEntry.note}</p>}
                          </div>
                        );
                      })()}
                      {/* Show transport location updates from Transport record */}
                      {transport && status === transport.status && transport.statusUpdates?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {transport.statusUpdates.filter(u => u.status === status && u.location).map((u, i) => (
                            <p key={i} className="text-xs text-blue-500">📍 {u.location}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span>Final</span>
                  <span>₹{order.finalAmount?.toLocaleString('en-IN')}</span>
                </div>
                {order.couponCode && <div className="text-xs text-gray-400 pt-1">Coupon: {order.couponCode}</div>}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Shipping Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-800">{order.shippingAddress?.customerName}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                {order.shippingAddress?.landmark && <p className="text-gray-400">Near: {order.shippingAddress.landmark}</p>}
              </div>
            </div>

            {/* Driver & Transport info */}
            {order.assignedDriver && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">🚚 Delivery Info</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <p className="text-gray-400 text-xs">Driver</p>
                    <p className="font-medium text-gray-800">{order.assignedDriver?.name || 'Assigned'}</p>
                  </div>
                  {transport?.vehicleNumber && (
                    <div>
                      <p className="text-gray-400 text-xs">Vehicle</p>
                      <p className="font-medium text-gray-800">{transport.vehicleNumber} {transport.vehicleType ? `(${transport.vehicleType})` : ''}</p>
                    </div>
                  )}
                  {transport?.statusUpdates?.filter(u => u.location).length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Live Location Updates</p>
                      {transport.statusUpdates.filter(u => u.location).slice(-3).reverse().map((u, i) => (
                        <p key={i} className="text-xs text-blue-600">📍 {u.location} <span className="text-gray-400">{new Date(u.timestamp).toLocaleTimeString('en-IN')}</span></p>
                      ))}
                    </div>
                  )}
                  {transport?.estimatedDelivery && (
                    <div>
                      <p className="text-gray-400 text-xs">Est. Delivery</p>
                      <p className="font-medium text-gray-800">{new Date(transport.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                  {transport?.deliveredAt && (
                    <div>
                      <p className="text-gray-400 text-xs">Delivered At</p>
                      <p className="font-medium text-green-600">{new Date(transport.deliveredAt).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Products</h3>
              <div className="space-y-2">
                {order.products?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <img src={p.image || 'https://via.placeholder.com/40'} alt={p.title}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                    <div>
                      <p className="text-gray-700">{p.title}</p>
                      <p className="text-gray-400 text-xs">Qty: {p.quantity} × ₹{p.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
