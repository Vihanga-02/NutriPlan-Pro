import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Home, Info, Calculator, Utensils, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black border-b-4 border-yellow-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Utensils className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">NutriPlan Pro</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                  isActive('/') ? 'bg-yellow-400 text-black' : 'text-white hover:bg-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/menu"
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                  isActive('/menu') ? 'bg-yellow-400 text-black' : 'text-white hover:bg-gray-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Menu</span>
              </Link>
              <Link
                to="/health-screening"
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                  isActive('/health-screening') ? 'bg-yellow-400 text-black' : 'text-white hover:bg-gray-800'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Health Check</span>
              </Link>
              <Link
                to="/about"
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                  isActive('/about') ? 'bg-yellow-400 text-black' : 'text-white hover:bg-gray-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.full_name}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white hover:text-yellow-400 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <Chatbot />

      <footer className="bg-black text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">NutriPlan Pro</h3>
              <p className="text-gray-400 text-sm">
                Your intelligent nutrition companion for a healthier lifestyle.
              </p>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-yellow-400 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="text-gray-400 hover:text-yellow-400 transition">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-yellow-400 transition">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">Campus Research Project</p>
              <p className="text-gray-400 text-sm">NutriPlan Pro Team</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2025 NutriPlan Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
