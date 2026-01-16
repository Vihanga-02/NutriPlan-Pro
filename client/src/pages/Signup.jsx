import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Calendar, Ruler, Weight, Activity, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact_number: '',
    delivery_address: '',
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    neck_cm: '',
    waist_cm: '',
    hip_cm: '',
    activity_level: 'moderate',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.age || !formData.height_cm || !formData.weight_kg) {
      setError('Please fill in all required health information');
      return;
    }

    setLoading(true);

    try {
      const healthData = {
        age: parseInt(formData.age),
        gender: formData.gender,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        neck_cm: parseFloat(formData.neck_cm) || null,
        waist_cm: parseFloat(formData.waist_cm) || null,
        hip_cm: parseFloat(formData.hip_cm) || null,
        activity_level: formData.activity_level,
      };

      await signUp(
        formData.email,
        formData.password,
        formData.full_name,
        healthData,
        formData.contact_number,
        formData.delivery_address
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-black rounded-full p-3">
                  <UserPlus className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Create Account</h2>
                  <p className="text-black opacity-80">Join NutriPlan Pro Today</p>
                </div>
              </div>
              <div className="text-black font-bold text-lg">
                Step {step} of 2
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-black' : 'bg-black bg-opacity-20'}`}></div>
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-black' : 'bg-black bg-opacity-20'}`}></div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form className="space-y-6">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-xl shadow-md text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 transition-all hover:scale-105 mb-6"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or create account with email</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="full_name"
                          required
                          value={formData.full_name}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        placeholder="e.g., +1 555 555 5555"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <textarea
                        name="delivery_address"
                        value={formData.delivery_address}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        placeholder="Your delivery address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            placeholder="Min. 6 characters"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            placeholder="Repeat password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex justify-center items-center py-4 px-4 border-2 border-transparent rounded-xl shadow-lg text-base font-bold text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all hover:scale-105"
                >
                  Continue to Health Profile
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Health Profile</h3>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Age *
                        </label>
                        <input
                          type="number"
                          name="age"
                          required
                          value={formData.age}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                          placeholder="25"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Activity className="inline w-4 h-4 mr-1" />
                          Activity Level *
                        </label>
                        <select
                          name="activity_level"
                          value={formData.activity_level}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        >
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Light</option>
                          <option value="moderate">Moderate</option>
                          <option value="active">Active</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-3">Basic Measurements *</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Ruler className="inline w-4 h-4 mr-1" />
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="height_cm"
                            required
                            value={formData.height_cm}
                            onChange={handleChange}
                            className="block w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            placeholder="170"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Weight className="inline w-4 h-4 mr-1" />
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="weight_kg"
                            required
                            value={formData.weight_kg}
                            onChange={handleChange}
                            className="block w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            placeholder="70"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2">Advanced Measurements (Optional)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        For accurate body fat calculation using U.S. Navy Method
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Neck (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="neck_cm"
                            value={formData.neck_cm}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            placeholder="35"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Waist (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="waist_cm"
                            value={formData.waist_cm}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            placeholder="80"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hip (cm) {formData.gender === 'female' && '(Required)'}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="hip_cm"
                            value={formData.hip_cm}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            placeholder="95"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex justify-center items-center py-4 px-4 border-2 border-gray-300 rounded-xl shadow-sm text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
                  >
                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center items-center py-4 px-4 border-2 border-transparent rounded-xl shadow-lg text-base font-bold text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 transition-all hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-yellow-400 hover:text-yellow-500 transition">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
