import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-yellow-400 font-black text-2xl mb-2"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              ULTRA<span className="text-white">TECH</span>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              India's #1 construction materials brand. Building stronger homes and infrastructure since 1983.
            </p>
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              {['Cement', 'Concrete', 'Aggregates', 'Dry Mix', 'White Cement', 'Ready Mix'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`}
                    className="hover:text-yellow-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-yellow-400 transition-colors">All Products</Link></li>
              <li><Link to="/register" className="hover:text-yellow-400 transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-yellow-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin className="text-yellow-400 mt-0.5 flex-shrink-0" size={14} />
                <span>B/24, Trade World, Kamala Mills, Mumbai – 400013</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-yellow-400 flex-shrink-0" size={14} />
                <span>1800-200-1000</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="text-yellow-400 flex-shrink-0" size={14} />
                <span>support@ultratech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} UltraTech Cement Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}