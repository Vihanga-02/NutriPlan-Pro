import { useState } from 'react';
import { Calculator, TrendingUp, Activity } from 'lucide-react';

const HealthScreening = () => {
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
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateMetrics = () => {
    setLoading(true);

    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);
    const age = parseInt(formData.age);

    const bmi = weight / Math.pow(height / 100, 2);

    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (formData.gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    const tdee = bmr * multipliers[formData.activity_level];

    let bodyFatPct = null;
    if (showAdvanced && formData.neck_cm && formData.waist_cm) {
      const h_in = height / 2.54;
      const w_in = parseFloat(formData.waist_cm) / 2.54;
      const n_in = parseFloat(formData.neck_cm) / 2.54;

      if (formData.gender === 'male') {
        const x = w_in - n_in;
        if (x > 0 && h_in > 0) {
          bodyFatPct = 86.010 * Math.log10(x) - 70.041 * Math.log10(h_in) + 36.76;
        }
      } else if (formData.gender === 'female' && formData.hip_cm) {
        const hip_in = parseFloat(formData.hip_cm) / 2.54;
        const x = w_in + hip_in - n_in;
        if (x > 0 && h_in > 0) {
          bodyFatPct = 163.205 * Math.log10(x) - 97.684 * Math.log10(h_in) - 78.387;
        }
      }
    }

    setTimeout(() => {
      setResults({
        bmi: bmi.toFixed(2),
        bmr: bmr.toFixed(2),
        tdee: tdee.toFixed(2),
        bodyFatPct: bodyFatPct ? bodyFatPct.toFixed(2) : null,
      });
      setLoading(false);
    }, 500);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Calculator className="mx-auto h-16 w-16 text-yellow-400" />
          <h1 className="text-4xl font-bold mt-4">Health Screening</h1>
          <p className="text-gray-600 mt-2">
            Calculate your BMI, BMR, TDEE, and Body Fat Percentage
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="170"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-yellow-400 font-semibold hover:underline mb-4"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Mode (Body Fat Calculation)
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-yellow-50 rounded-lg">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="95"
                />
              </div>
            </div>
          )}

          <button
            onClick={calculateMetrics}
            disabled={loading || !formData.age || !formData.height_cm || !formData.weight_kg}
            className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 font-bold transition disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Health Metrics'}
          </button>
        </div>

        {results && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Your Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-yellow-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">BMI</div>
                <div className="text-3xl font-bold">{results.bmi}</div>
                <div className={`text-sm font-semibold mt-1 ${getBMICategory(parseFloat(results.bmi)).color}`}>
                  {getBMICategory(parseFloat(results.bmi)).text}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6">
                <Activity className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">BMR</div>
                <div className="text-3xl font-bold">{results.bmr}</div>
                <div className="text-sm text-gray-600">cal/day</div>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6">
                <Activity className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">TDEE</div>
                <div className="text-3xl font-bold">{results.tdee}</div>
                <div className="text-sm text-gray-600">cal/day</div>
              </div>

              {results.bodyFatPct && (
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6">
                  <Activity className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Body Fat</div>
                  <div className="text-3xl font-bold">{results.bodyFatPct}%</div>
                  <div className="text-sm text-gray-600">U.S. Navy Method</div>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-xl">
              <h3 className="font-bold text-lg mb-2">What's Next?</h3>
              <p className="text-gray-700 mb-4">
                Based on your TDEE of {results.tdee} calories/day, you can maintain your weight by consuming this amount. To lose weight, reduce by 300-500 calories. To gain weight, increase by 300-500 calories.
              </p>
              <p className="text-gray-700">
                For personalized 14-day meal plans and progress tracking, create a free account!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthScreening;
