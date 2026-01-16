import { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const CustomerManagement = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const [usersData, ordersData] = await Promise.all([
        api.get('/auth/users', token),
        api.get('/orders', token),
      ]);

      setCustomers(usersData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setCustomers([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerStats = (userId) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const lastOrder = userOrders.length > 0 
      ? new Date(Math.max(...userOrders.map(o => new Date(o.created_at).getTime()))).toISOString().split('T')[0]
      : null;
    
    return { totalOrders, totalSpent, lastOrder };
  };

  const filteredCustomers = customers
    .filter(customer =>
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(customer => ({
      ...customer,
      ...getCustomerStats(customer.id),
      status: 'active',
      phone: '+1234567890' // Placeholder - add phone field to users table if needed
    }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-1">View and manage customer information</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <h3 className="text-3xl font-bold text-gray-900">{customers.length}</h3>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {filteredCustomers.filter(c => c.status === 'active').length}
                  </h3>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {orders.length}
                  </h3>
                </div>
                <div className="bg-yellow-100 p-4 rounded-full">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Rs. {orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)}
                  </h3>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="text-black">
                    <h3 className="font-bold text-lg">{customer.full_name}</h3>
                    <p className="text-sm opacity-80">Customer ID: #{customer.id}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{customer.email}</span>
                </div>

                {customer.phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{customer.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Joined: {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>

                <div className="border-t-2 border-gray-100 pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{customer.totalOrders || 0}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Orders</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <p className="text-xl font-bold text-green-600">Rs. {(customer.totalSpent || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Spent</p>
                    </div>
                  </div>
                </div>

                {customer.lastOrder && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      Last order: {new Date(customer.lastOrder).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full capitalize">
                    {customer.status}
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full capitalize">
                    {customer.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No customers found</p>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
