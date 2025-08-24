import React, { useState } from "react";
import { Eye, EyeOff, Mic, Shield, CreditCard, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = ({ onLogin, onGoToSignUp }) => {
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
    // This will be connected to Whisper later
    console.log("Voice mode toggled:", !isVoiceMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Login attempt with:", formData.email);

    try {
      const result = await signIn(formData.email, formData.password);
      console.log("Login result:", result);

      if (result.success) {
        console.log("Login successful, calling onLogin");
        if (onLogin) {
          onLogin();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    }
  };

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Commands",
      description: "Record transactions using natural speech",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "All data processed locally on your device",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Smart Categorization",
      description: "AI-powered expense categorization",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Financial Insights",
      description: "Comprehensive spending analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors duration-300">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 p-12 text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">VoiceFinance</h1>
            <p className="text-xl text-primary-100">
              Your AI-powered voice-assisted financial manager
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary-500 p-3 rounded-lg flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-sm text-primary-100 italic">
              "Transform the way you manage finances with the power of voice and
              AI"
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">
              VoiceFinance
            </h1>
            <p className="text-gray-600">AI-powered financial management</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-slide-up transition-colors duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 transition-colors duration-300">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {/* Voice Mode Toggle */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Or
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isVoiceMode
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white focus:ring-red-500"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white focus:ring-green-500"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Mic
                    className={`w-5 h-5 ${isVoiceMode ? "animate-pulse" : ""}`}
                  />
                  <span>
                    {isVoiceMode ? "Voice Mode Active" : "Enable Voice Login"}
                  </span>
                </div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Don't have an account?{" "}
                <button
                  onClick={onGoToSignUp}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Privacy & Security
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Your financial data is processed locally and never shared with
                  third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
