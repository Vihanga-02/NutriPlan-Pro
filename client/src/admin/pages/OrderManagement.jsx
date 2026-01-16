import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const OrderManagement = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await api.get('/orders', token);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    const matchesType = filterType === 'all' || order.order_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = await getToken();
      await api.put(`/orders/${orderId}/status`, { status: newStatus }, token);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Track and manage customer orders</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="food">Food Orders</option>
              <option value="diet_plan">Diet Plan Orders</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900">#{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.order_items?.length || 0} items</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {order.contact_number}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.order_type === 'diet_plan' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.order_type === 'diet_plan' ? 'Diet Plan' : 'Food'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-lg text-yellow-600">
                      Rs. {(Number(order.total_amount) || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.order_status)} border-0 cursor-pointer`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto zoom-in relative z-50">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold">Order Details #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-black hover:text-gray-700 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                  <p className="font-bold text-gray-900">{selectedOrder.contact_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-bold text-gray-900">{selectedOrder.delivery_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedOrder.order_type === 'diet_plan' ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">14-Day Diet Plan Details</h3>
                  {selectedOrder.meal_plan ? (
                    <>
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Goal Type</p>
                            <p className="font-bold capitalize">{selectedOrder.meal_plan.goal_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Target Weight Change</p>
                            <p className="font-bold">{selectedOrder.meal_plan.target_weight_change} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-bold">{new Date(selectedOrder.meal_plan.start_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-bold">{new Date(selectedOrder.meal_plan.end_date).toLocaleDateString()}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Daily Calorie Target</p>
                            <p className="font-bold">{selectedOrder.meal_plan.daily_calorie_target} calories</p>
                          </div>
                        </div>
                      </div>

                      {selectedOrder.meal_plan.meal_plan_days && selectedOrder.meal_plan.meal_plan_days.length > 0 ? (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                          {selectedOrder.meal_plan.meal_plan_days.map((day, dayIndex) => {
                            const dayMeals = day.meals || [];
                            const mealsByType = {
                              breakfast: dayMeals.filter(m => m.meal_type === 'breakfast'),
                              lunch: dayMeals.filter(m => m.meal_type === 'lunch'),
                              teatime: dayMeals.filter(m => m.meal_type === 'teatime'),
                              dinner: dayMeals.filter(m => m.meal_type === 'dinner')
                            };

                            const dayTotal = dayMeals.reduce((sum, meal) => ({
                              calories: sum.calories + (parseFloat(meal.calories) || 0),
                              price: sum.price + (parseFloat(meal.meal_price) || 0)
                            }), { calories: 0, price: 0 });

                            return (
                              <div key={day.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-bold text-lg">
                                    Day {dayIndex + 1} - {new Date(day.plan_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                  </h4>
                                  <div className="text-sm">
                                    <span className="text-gray-600">Total: </span>
                                    <span className="font-bold text-yellow-600">Rs. {dayTotal.price.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {['breakfast', 'lunch', 'teatime', 'dinner'].map(mealType => {
                                    const meals = mealsByType[mealType] || [];
                                    if (meals.length === 0) return null;

                                    const mealTypeLabels = {
                                      breakfast: 'Breakfast',
                                      lunch: 'Lunch',
                                      teatime: 'Tea Time',
                                      dinner: 'Dinner'
                                    };

                                    return (
                                      <div key={mealType} className="bg-gray-50 rounded-lg p-3">
                                        <h5 className="font-bold text-sm text-purple-600 mb-2">
                                          {mealTypeLabels[mealType]}
                                        </h5>
                                        <div className="space-y-2">
                                          {meals.map((meal, idx) => (
                                            <div key={meal.id || idx} className="flex items-start justify-between text-xs">
                                              <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{meal.food_name}</p>
                                                <p className="text-gray-600">
                                                  {parseFloat(meal.portion_size || 1).toFixed(2)}x portion
                                                </p>
                                              </div>
                                              <div className="text-right ml-2">
                                                <p className="font-bold text-yellow-600">
                                                  Rs. {parseFloat(meal.meal_price || 0).toFixed(2)}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                  (Rs. {parseFloat(meal.food_price || 0).toFixed(2)} × {parseFloat(meal.portion_size || 1).toFixed(2)})
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500">Meal plan days not available</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Meal plan details not available</p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name || item.food_name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">Rs. {(Number(item.price) * Number(item.quantity) || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Rs. {item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-yellow-600">
                    Rs. {(Number(selectedOrder.total_amount) || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    handleStatusChange(selectedOrder.id, 'confirmed');
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-bold"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Order</span>
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedOrder.id, 'delivered');
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-bold"
                >
                  <Package className="w-5 h-5" />
                  <span>Mark Delivered</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
