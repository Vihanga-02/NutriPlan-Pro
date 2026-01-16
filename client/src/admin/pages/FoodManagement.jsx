import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import FoodForm from '../components/FoodForm';

const FoodManagement = () => {
  const { getToken } = useAuth();
  const [foods, setFoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await api.get('/foods', token);
      setFoods(data || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || food.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFood = () => {
    setEditingFood(null);
    setShowForm(true);
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setShowForm(true);
  };

  const handleDeleteFood = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        const token = await getToken();
        await api.delete(`/foods/${foodId}`, token);
        await fetchFoods();
      } catch (error) {
        console.error('Error deleting food:', error);
        alert('Failed to delete food item');
      }
    }
  };

  const handleSaveFood = async (foodData) => {
    try {
      const token = await getToken();
      if (editingFood) {
        await api.put(`/foods/${editingFood.id}`, foodData, token);
      } else {
        await api.post('/foods', foodData, token);
      }
      await fetchFoods();
      setShowForm(false);
      setEditingFood(null);
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food item');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant and bakery items</p>
        </div>
        <button
          onClick={handleAddFood}
          className="flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition font-bold shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Food Item</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="restaurant">Restaurant</option>
              <option value="bakery">Bakery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
          <div key={food.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="relative h-48">
              <img
                src={food.image_url}
                alt={food.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full capitalize">
                {food.category}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 truncate">{food.name}</h3>

              <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                <div className="text-center">
                  <div className="font-bold text-gray-900">{food.calories}</div>
                  <div className="text-gray-500">Cal</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{food.protein_g}g</div>
                  <div className="text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{food.carbs_g}g</div>
                  <div className="text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{food.fat_g}g</div>
                  <div className="text-gray-500">Fat</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-yellow-600">Rs. {food.price}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  food.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {food.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditFood(food)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteFood(food.id)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {!loading && filteredFoods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No food items found</p>
        </div>
      )}

      {/* Food Form Modal */}
      {showForm && (
        <FoodForm
          food={editingFood}
          onSave={handleSaveFood}
          onCancel={() => {
            setShowForm(false);
            setEditingFood(null);
          }}
        />
      )}
    </div>
  );
};

export default FoodManagement;
