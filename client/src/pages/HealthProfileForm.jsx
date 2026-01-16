import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, TrendingUp, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const HealthProfileForm = () => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    neck_cm: '',
    waist_cm: '',
    hip_cm: '',
    activity_level: 'moderate',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch existing profile to support editing
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken();
        const profile = await api.get('/health/profile', token);
        if (profile) {
          setFormData({
            age: profile.age || '',
            gender: profile.gender || 'male',
            height_cm: profile.height_cm || '',
            weight_kg: profile.weight_kg || '',
            neck_cm: profile.neck_cm || '',
            waist_cm: profile.waist_cm || '',
            hip_cm: profile.hip_cm || '',
            activity_level: profile.activity_level || 'moderate',
          });
          setIsEditing(true);
          if (profile.neck_cm || profile.waist_cm || profile.hip_cm) {
            setShowAdvanced(true);
          }
        }
      } catch (err) {
        // No existing profile (404) is expected for new users; ignore other errors
        if (!err.message || (!err.message.includes('404') && !err.message.toLowerCase().includes('not found'))) {
          console.error('Error fetching existing profile:', err);
        }
      }
    };

    loadProfile();
  }, [getToken]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.age || !formData.height_cm || !formData.weight_kg) {
      setError('Please fill in all required fields (Age, Height, Weight)');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const profileData = {
        age: parseInt(formData.age),
        gender: formData.gender,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        neck_cm: formData.neck_cm ? parseFloat(formData.neck_cm) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
        activity_level: formData.activity_level,
      };

      if (isEditing) {
        await api.put('/health/profile', profileData, token);
      } else {
        await api.post('/health/profile', profileData, token);
      }

      // Redirect to dashboard after successful save
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving health profile:', err);
      setError(err.message || 'Failed to save health profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Complete Your Health Profile</h1>
          <p className="text-gray-600 mt-2">
            Set up your health profile to unlock personalized meal plans and tracking.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  name="height_cm"
                  required
                  step="0.1"
                  min="50"
                  max="300"
                  value={formData.height_cm}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight_kg"
                  required
                  step="0.1"
                  min="20"
                  max="300"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  placeholder="70"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Activity className="inline w-4 h-4 mr-1" />
                  Activity Level *
                </label>
                <select
                  name="activity_level"
                  required
                  value={formData.activity_level}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                >
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-yellow-600 font-semibold hover:text-yellow-700 hover:underline flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Measurements (Optional)
                <span className="text-xs text-gray-500">(For Body Fat % calculation)</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-yellow-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Neck Circumference (cm)
                    </label>
                    <input
                      type="number"
                      name="neck_cm"
                      step="0.1"
                      min="20"
                      max="60"
                      value={formData.neck_cm}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                      placeholder="35"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Waist Circumference (cm)
                    </label>
                    <input
                      type="number"
                      name="waist_cm"
                      step="0.1"
                      min="50"
                      max="200"
                      value={formData.waist_cm}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                      placeholder="80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hip Circumference (cm)
                      {formData.gender === 'female' && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="hip_cm"
                      step="0.1"
                      min="60"
                      max="200"
                      value={formData.hip_cm}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                      placeholder="95"
                    />
                    {formData.gender === 'female' && (
                      <p className="text-xs text-gray-500 mt-1">Required for body fat calculation</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-yellow-400 text-black px-6 py-3 rounded-xl hover:bg-yellow-500 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Health Profile'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-blue-900">Why Complete Your Profile?</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Get personalized meal plans based on your TDEE (Total Daily Energy Expenditure)</li>
            <li>Track your progress with accurate BMI and body fat calculations</li>
            <li>Receive meal recommendations tailored to your activity level</li>
            <li>Monitor your health metrics over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HealthProfileForm;

