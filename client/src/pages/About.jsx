import { Target, Users, Lightbulb, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-yellow-400">NutriPlan Pro</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A campus-level research project merging food commerce with precision nutrition science.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                NutriPlan Pro is designed to combat obesity and underweight conditions through intelligent meal planning and nutrition transparency. We combine a traditional bakery & restaurant e-commerce platform with advanced health tracking and AI-powered meal optimization.
              </p>
              <p className="text-gray-600 text-lg mb-4">
                Our three-tier system serves everyone from casual diners to dedicated health enthusiasts, making nutrition science accessible and actionable.
              </p>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Healthy Lifestyle"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Target className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Goal-Based Planning</h3>
              <p className="text-gray-600">
                14-day meal plans calibrated to your weight gain or loss goals (0.5-2kg).
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Users className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Three-Tier System</h3>
              <p className="text-gray-600">
                Guest browsing, anonymous health screening, and registered user tracking.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Lightbulb className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Optimization</h3>
              <p className="text-gray-600">
                Gemini AI ensures meal variety and appetite adherence within caloric targets.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Award className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Body Composition</h3>
              <p className="text-gray-600">
                U.S. Navy Method for accurate body fat percentage beyond simple BMI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">The Science Behind NutriPlan Pro</h2>
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Health Calculations</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span><strong>BMI:</strong> Body Mass Index using kg/m² formula</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span><strong>BMR:</strong> Mifflin-St Jeor equation for basal metabolic rate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span><strong>TDEE:</strong> Total Daily Energy Expenditure based on activity level</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span><strong>Body Fat %:</strong> U.S. Navy Method using circumference measurements</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Meal Planning Logic</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>4 meals per day: breakfast, lunch, teatime, dinner</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Daily calories within ±100 of target</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Maximized variety across 14 days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Balanced macronutrients (protein, carbs, fats)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">A Research Initiative</h2>
          <p className="text-xl text-gray-300 mb-8">
            NutriPlan Pro is a campus-level research project designed to study the effectiveness of technology-driven nutrition interventions. Our goal is to collect data on meal adherence, weight change patterns, and user engagement with personalized health systems.
          </p>
          <p className="text-gray-400">
            All user data is handled according to research ethics guidelines and contributes to understanding how digital platforms can support healthier eating habits.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
