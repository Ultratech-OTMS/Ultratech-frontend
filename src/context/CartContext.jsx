import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart || { items: [] });
    } catch {}
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist || { products: [] });
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchCart();
      fetchWishlist();
    } else {
      setCart({ items: [] });
      setWishlist({ products: [] });
    }
  }, [user, fetchCart, fetchWishlist]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put('/cart/update', { productId, quantity });
      setCart(data.cart);
    } catch {}
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      setCart(data.cart);
    } catch {}
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } catch {}
  };

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      setWishlist(data.wishlist);
      return { success: true, action: data.action };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.products?.some(
      (p) => (p._id || p) === productId || (p._id || p)?.toString() === productId
    );
  };

  const cartCount = cart.items?.length || 0;
  const wishlistCount = wishlist.products?.length || 0;
  const cartTotal = cart.items?.reduce((sum, item) => {
    const price = item.productId?.price || 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, wishlist, loading,
      addToCart, updateQuantity, removeFromCart, clearCart,
      toggleWishlist, isInWishlist,
      cartCount, wishlistCount, cartTotal,
      fetchCart, fetchWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};