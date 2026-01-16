import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const [statsData, ordersData, foodsData] = await Promise.all([
        api.get('/orders/stats', token),
        api.get('/orders', token),
        api.get('/foods', token),
      ]);

      setStats(statsData);
      setOrders(ordersData.slice(0, 5));
      setFoods(foodsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = orders;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900">Rs. {(Number(stats.totalRevenue) || 0).toFixed(2)}</h3>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Food Items</p>
              <h3 className="text-3xl font-bold text-gray-900">{foods.length}</h3>
              <p className="text-sm text-gray-500 flex items-center mt-2">
                {foods.filter(f => f.is_active).length} active
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-full">
              <Package className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</h3>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold">
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium">#{order.id}</td>
                    <td className="py-4 px-4 text-sm">{order.customer_name}</td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-bold">Rs. {(Number(order.total_amount) || 0).toFixed(2)}</div>
                        {order.order_type === 'diet_plan' && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                            Diet Plan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.order_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.order_status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.order_status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
