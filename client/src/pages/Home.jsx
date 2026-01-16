import { Link } from 'react-router-dom';
import { ShoppingBag, Calculator, TrendingUp, Award, Clock, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to <span className="text-yellow-400">NutriPlan Pro</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Your intelligent nutrition companion combining delicious bakery & restaurant offerings with precision health tracking and personalized meal planning.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/menu"
                  className="px-8 py-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-bold text-lg"
                >
                  Explore Menu
                </Link>
                <Link
                  to="/health-screening"
                  className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition font-bold text-lg"
                >
                  Health Check
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Healthy Food"
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Three Ways to <span className="text-yellow-400">Experience</span> NutriPlan Pro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-yellow-400 transition">
              <ShoppingBag className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tier 1: Browse & Order</h3>
              <p className="text-gray-600 mb-4">
                Explore our bakery and restaurant items with complete nutritional transparency. Order with Cash on Delivery.
              </p>
              <Link to="/menu" className="text-yellow-400 font-semibold hover:underline">
                View Menu →
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-yellow-400 transition">
              <Calculator className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tier 2: Health Screener</h3>
              <p className="text-gray-600 mb-4">
                Get instant BMI, TDEE, and body fat percentage calculations. Receive personalized safe meal recommendations.
              </p>
              <Link to="/health-screening" className="text-yellow-400 font-semibold hover:underline">
                Calculate Now →
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-yellow-400 transition">
              <TrendingUp className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tier 3: Goal-Oriented</h3>
              <p className="text-gray-600 mb-4">
                Create account to get AI-powered 14-day meal plans, track progress, and achieve your weight goals safely.
              </p>
              <Link to="/signup" className="text-yellow-400 font-semibold hover:underline">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-yellow-400">NutriPlan Pro</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Science-Based</h3>
              <p className="text-gray-400">
                U.S. Navy Method body fat calculation and Mifflin-St Jeor BMR formula for accurate health metrics.
              </p>
            </div>

            <div className="text-center">
              <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">14-Day Plans</h3>
              <p className="text-gray-400">
                AI-optimized meal plans tailored to your goals, with variety and nutritional balance guaranteed.
              </p>
            </div>

            <div className="text-center">
              <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Safe & Effective</h3>
              <p className="text-gray-400">
                Controlled weight change of 0.5-2kg over 14 days, designed for sustainable results.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to Transform Your Nutrition Journey?
          </h2>
          <p className="text-xl text-black mb-8">
            Join NutriPlan Pro today and experience intelligent meal planning with delicious food.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition font-bold text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
