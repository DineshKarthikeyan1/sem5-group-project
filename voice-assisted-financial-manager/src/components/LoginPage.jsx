import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mic,
  Shield,
  CreditCard,
  TrendingUp,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
  Zap,
  BarChart3,
  Brain,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = ({ onLogin, onGoToSignUp }) => {
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Validate form
  useEffect(() => {
    const isValid =
      formData.email.includes("@") && formData.password.length >= 6;
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
    console.log("Voice mode toggled:", !isVoiceMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please enter a valid email and password (min 6 characters)");
      return;
    }

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        if (onLogin) {
          onLogin();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const features = [
    {
      icon: <Mic className="w-7 h-7" />,
      title: "Voice Commands",
      description:
        "Record transactions using natural speech with AI-powered recognition",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Privacy First",
      description:
        "Bank-grade security with local processing and zero data sharing",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "Smart Categorization",
      description:
        "AI automatically categorizes and learns from your spending patterns",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Financial Insights",
      description:
        "Real-time analytics and personalized financial recommendations",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const testimonials = [
    "Transformed my financial tracking completely!",
    "Voice commands make budgeting effortless",
    "Finally, a finance app that understands me",
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-all duration-500">
      {/* Left Panel - Enhanced Features Showcase */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div
            className="absolute bottom-32 right-16 w-24 h-24 bg-white/5 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 right-32 w-16 h-16 bg-white/15 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center max-w-lg mx-auto">
          {/* Logo and tagline */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gradient-primary bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              FinSay
            </h1>
            <p className="text-xl text-blue-100 font-medium">
              Your AI-powered voice-assisted financial manager
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-sm text-blue-100">
                Trusted by 10,000+ users
              </span>
            </div>
          </div>

          {/* Enhanced features */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div
                  className={`bg-gradient-to-r ${feature.gradient} p-4 rounded-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-white group-hover:text-blue-100 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="mt-12 glass rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <p className="text-blue-100 italic text-lg mb-4 min-h-[2rem] transition-all duration-500">
                "{testimonials[currentTestimonial]}"
              </p>
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl">
                <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">
              FinSay
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered financial management
            </p>
          </div>

          {/* Enhanced login card */}
          <div className="card shadow-large p-8 animate-slide-up border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Sign in to continue your financial journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field pl-11 h-12 text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field pl-11 pr-12 h-12 text-base"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4 animate-slide-down">
                  <p className="text-sm text-error-700 dark:text-error-400 flex items-center">
                    <span className="w-2 h-2 bg-error-500 rounded-full mr-2"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`btn-primary w-full h-12 text-base font-semibold relative overflow-hidden group ${
                  !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                {!loading && isFormValid && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Voice mode toggle */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] focus-ring relative overflow-hidden group ${
                  isVoiceMode
                    ? "bg-gradient-to-r from-error-500 to-error-600 text-white shadow-glow"
                    : "bg-gradient-to-r from-success-500 to-success-600 text-white"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Mic
                    className={`w-5 h-5 ${isVoiceMode ? "animate-pulse" : ""}`}
                  />
                  <span>
                    {isVoiceMode ? "Voice Mode Active" : "Enable Voice Login"}
                  </span>
                  <Zap className="w-4 h-4" />
                </div>
                {isVoiceMode && (
                  <div className="absolute inset-0 bg-gradient-to-r from-error-600 to-error-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
            </form>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <button
                  onClick={onGoToSignUp}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors hover:underline"
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>

          {/* Enhanced security notice */}
          <div
            className="mt-8 glass rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Bank-Grade Security
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  Your financial data is encrypted end-to-end, processed
                  locally, and never shared with third parties. We're SOC 2
                  compliant and use the same security standards as major banks.
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
