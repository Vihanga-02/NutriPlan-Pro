import { useState, useEffect } from 'react';
import { X, Upload, DollarSign } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const FoodForm = ({ food, onSave, onCancel }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    price: '',
    image_url: '',
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (food) {
      setFormData(food);
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `foods/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          alert('Failed to upload image. Please try again.');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, image_url: downloadURL }));
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      calories: parseInt(formData.calories),
      protein_g: parseFloat(formData.protein_g),
      carbs_g: parseFloat(formData.carbs_g),
      fat_g: parseFloat(formData.fat_g),
      price: parseFloat(formData.price),
    };
    onSave(processedData);
  };

  return (
    <div className="modal-backdrop flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto zoom-in relative z-50">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {food ? 'Edit Food Item' : 'Add New Food Item'}
          </h2>
          <button
            onClick={onCancel}
            className="text-black hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Food Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="e.g., Grilled Chicken Salad"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="restaurant">Restaurant</option>
                <option value="bakery">Bakery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (Rs.) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="1299.00"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Nutritional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Calories *
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  placeholder="350"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Protein (g) *
                </label>
                <input
                  type="number"
                  name="protein_g"
                  value={formData.protein_g}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  placeholder="25.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Carbs (g) *
                </label>
                <input
                  type="number"
                  name="carbs_g"
                  value={formData.carbs_g}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  placeholder="30.0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Fat (g) *
                </label>
                <input
                  type="number"
                  name="fat_g"
                  value={formData.fat_g}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  placeholder="12.0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Food Image *
            </label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 transition ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">
                    {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Image'}
                  </span>
                </label>
              </div>
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <div className="relative">
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="Or enter image URL directly"
                />
              </div>
              <p className="text-xs text-gray-500">
                Upload an image file or paste an image URL
              </p>
            </div>
          </div>

          {formData.image_url && (
            <div className="relative h-48 rounded-xl overflow-hidden border-4 border-gray-200">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
            />
            <div>
              <label className="text-sm font-semibold text-gray-900">
                Active Status
              </label>
              <p className="text-xs text-gray-500">
                Make this item available for ordering
              </p>
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition font-bold shadow-lg"
            >
              {food ? 'Update Food Item' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodForm;
