import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Utensils
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Food Items', path: '/admin/foods' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-black text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-yellow-400 hover:text-yellow-500"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-2">
                <Utensils className="w-8 h-8 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">NutriPlan Pro</span>
              </div>
              <span className="hidden md:inline-block px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                ADMIN PANEL
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.full_name}</p>
                <p className="text-xs text-yellow-400">Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r-4 border-yellow-400 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } mt-[72px] lg:mt-0`}
        >
          <nav className="h-full overflow-y-auto py-6">
            <ul className="space-y-2 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-yellow-400 text-black font-bold shadow-lg'
                          : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-black' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 px-6">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-4 text-black">
                <h3 className="font-bold text-sm mb-2">Need Help?</h3>
                <p className="text-xs opacity-80 mb-3">
                  Check the documentation or contact support.
                </p>
                <Link
                  to="/"
                  className="block text-center bg-black text-yellow-400 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-900 transition"
                >
                  View Main Site
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
