import { useState } from 'react';
import { Save, Shield, UserPlus, Bell, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const { getToken } = useAuth();
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: 'NutriPlan Pro',
    email: 'contact@nutriplan.com',
    phone: '+1234567890',
    address: '123 Health Street, Wellness City',
    delivery_radius: '10',
    min_order_amount: '15.00',
  });

  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_customers: true,
    sms_orders: false,
  });

  const [adminForm, setAdminForm] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setRestaurantSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (adminError) setAdminError('');
    if (adminSuccess) setAdminSuccess('');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    setCreatingAdmin(true);

    try {
      // Validate form
      if (!adminForm.full_name || !adminForm.email || !adminForm.password) {
        setAdminError('All fields are required');
        setCreatingAdmin(false);
        return;
      }

      if (adminForm.password.length < 6) {
        setAdminError('Password must be at least 6 characters long');
        setCreatingAdmin(false);
        return;
      }

      // Call API to create admin (admin-only endpoint)
      const token = await getToken();
      if (!token) {
        setAdminError('You must be logged in as an admin to create new admins');
        setCreatingAdmin(false);
        return;
      }

      const response = await api.post('/auth/create-admin-secure', {
        email: adminForm.email,
        password: adminForm.password,
        full_name: adminForm.full_name
      }, token);

      setAdminSuccess(`Admin account created successfully! Email: ${response.user.email}`);
      setAdminForm({
        full_name: '',
        email: '',
        password: ''
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      setAdminError(error.message || 'Failed to create admin account');
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Restaurant Information</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={restaurantSettings.name}
                  onChange={handleRestaurantChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={restaurantSettings.email}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={restaurantSettings.phone}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={restaurantSettings.address}
                  onChange={handleRestaurantChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    name="delivery_radius"
                    value={restaurantSettings.delivery_radius}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Order Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    step="0.01"
                    value={restaurantSettings.min_order_amount}
                    onChange={handleRestaurantChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition font-bold shadow-lg"
              >
                <Save className="w-5 h-5" />
                <span>Save Restaurant Settings</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Email on New Orders</p>
                  <p className="text-sm text-gray-600">Receive email when new orders arrive</p>
                </div>
                <input
                  type="checkbox"
                  name="email_orders"
                  checked={notifications.email_orders}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Email on New Customers</p>
                  <p className="text-sm text-gray-600">Get notified when users register</p>
                </div>
                <input
                  type="checkbox"
                  name="email_customers"
                  checked={notifications.email_customers}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive SMS for urgent orders</p>
                </div>
                <input
                  type="checkbox"
                  name="sms_orders"
                  checked={notifications.sms_orders}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                />
              </div>
            </div>

            <button
              onClick={() => alert('Notification settings saved!')}
              className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-bold"
            >
              <Save className="w-5 h-5" />
              <span>Save Notification Settings</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <UserPlus className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
            </div>

            {adminError && (
              <div className="mb-4 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{adminError}</span>
              </div>
            )}

            {adminSuccess && (
              <div className="mb-4 bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{adminSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={adminForm.full_name}
                  onChange={handleAdminFormChange}
                  placeholder="Admin Name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminFormChange}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminFormChange}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={creatingAdmin}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingAdmin ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Add Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg p-6 text-black">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8" />
              <h3 className="text-xl font-bold">Security Tips</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Use strong passwords with special characters</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Change passwords regularly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Never share admin credentials</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Log out when leaving the system</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
