import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Shield,
  CreditCard,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  User,
  Lock,
  Sparkles,
  Brain,
  BarChart3,
  Zap,
  Clock,
  RefreshCw,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SignUpPage = ({ onSignUp, onBackToLogin }) => {
  const { signUp, resendVerification, verifyEmail, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState("signup"); // 'signup', 'verify', 'success'
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    return strength;
  };

  // Resend timer effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    console.log("SignUpPage: Starting signup process with:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      passwordLength: formData.password.length,
    });

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      console.log("SignUpPage: Calling signUp from context...");
      const result = await signUp(formData);
      console.log("SignUpPage: SignUp result:", result);

      if (result.success) {
        console.log(
          "SignUpPage: Signup successful, checking verification need..."
        );
        if (result.needsVerification) {
          console.log(
            "SignUpPage: Email verification required, moving to verify step"
          );
          setStep("verify");
        } else {
          console.log(
            "SignUpPage: No verification needed, moving to success step"
          );
          setStep("success");
        }
      } else {
        console.log("SignUpPage: Signup failed:", result);
        setError(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("SignUpPage: Signup error:", error);
      setError(error.message || "An unexpected error occurred");
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      const result = await verifyEmail(formData.email, verificationCode);

      if (result.success) {
        setStep("success");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResendCode = async () => {
    try {
      const result = await resendVerification(formData.email);
      if (result.success) {
        setResendTimer(60); // 60 second cooldown
        setError("");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const features = [
    {
      icon: <Mail className="w-7 h-7" />,
      title: "Secure Verification",
      description:
        "Multi-factor authentication and email verification for maximum security",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Privacy First",
      description:
        "End-to-end encryption with local processing and zero data sharing",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "Smart Categorization",
      description:
        "AI learns your spending patterns for intelligent auto-categorization",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Financial Insights",
      description:
        "Real-time analytics with personalized recommendations and forecasting",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-error-500";
    if (passwordStrength < 50) return "bg-warning-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-success-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-6">
      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            First Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="input-field pl-11 h-12"
              placeholder="First name"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="input-field pl-11 h-12"
              placeholder="Last name"
              required
            />
          </div>
        </div>
      </div>

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
            className="input-field pl-11 h-12"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      {/* Password field with strength indicator */}
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
            className="input-field pl-11 pr-12 h-12"
            placeholder="Create a strong password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("password")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Password strength indicator */}
        {formData.password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Password strength</span>
              <span
                className={`text-xs font-medium ${
                  passwordStrength < 50
                    ? "text-error-600"
                    : passwordStrength < 75
                    ? "text-warning-600"
                    : "text-success-600"
                }`}
              >
                {getPasswordStrengthText()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                style={{ width: `${passwordStrength}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-2">
                {formData.password.length >= 8 ? (
                  <Check className="w-3 h-3 text-success-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                {formData.password.match(/[A-Z]/) ? (
                  <Check className="w-3 h-3 text-success-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
                <span>One uppercase letter</span>
              </div>
              <div className="flex items-center space-x-2">
                {formData.password.match(/[0-9]/) ? (
                  <Check className="w-3 h-3 text-success-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
                <span>One number</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm password field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`input-field pl-11 pr-12 h-12 ${
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword
                ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                : formData.confirmPassword &&
                  formData.password === formData.confirmPassword
                ? "border-success-300 focus:border-success-500 focus:ring-success-500"
                : ""
            }`}
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirmPassword")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <p className="text-xs text-error-600 flex items-center space-x-1">
              <X className="w-3 h-3" />
              <span>Passwords do not match</span>
            </p>
          )}
        {formData.confirmPassword &&
          formData.password === formData.confirmPassword && (
            <p className="text-xs text-success-600 flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Passwords match</span>
            </p>
          )}
      </div>

      {/* Terms and conditions */}
      <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <input
          type="checkbox"
          id="terms"
          required
          className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label
          htmlFor="terms"
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          I agree to the{" "}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Privacy Policy
          </button>
        </label>
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
        disabled={
          loading ||
          formData.password !== formData.confirmPassword ||
          passwordStrength < 50
        }
        className="btn-primary w-full h-12 text-base font-semibold relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        )}
      </button>
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerifyEmail} className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
          <Mail className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Check Your Email
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-primary-600 dark:text-primary-400 text-lg">
          {formData.email}
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Code expires in 10 minutes</span>
        </div>
      </div>

      <div className="space-y-4">
        <label
          htmlFor="verificationCode"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center"
        >
          Enter Verification Code
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) =>
            setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-center text-3xl font-mono tracking-[0.5em] text-gray-900 dark:text-white"
          placeholder="000000"
          maxLength={6}
          required
          autoComplete="one-time-code"
        />
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i < verificationCode.length
                    ? "bg-primary-500 scale-110"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4 animate-slide-down">
          <p className="text-sm text-error-700 dark:text-error-400 flex items-center justify-center">
            <span className="w-2 h-2 bg-error-500 rounded-full mr-2"></span>
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || verificationCode.length !== 6}
        className="btn-primary w-full h-12 text-base font-semibold relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify Email</span>
              <Zap className="w-5 h-5" />
            </>
          )}
        </span>
      </button>

      <div className="text-center space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Didn't receive the code?
        </p>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading || resendTimer > 0}
          className="inline-flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
          </span>
        </button>
      </div>
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center space-y-8">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900 dark:to-success-800 rounded-3xl flex items-center justify-center mx-auto animate-bounce-gentle">
          <CheckCircle className="w-12 h-12 text-success-600 dark:text-success-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to FinSay! 🎉
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Your account has been created and verified successfully. You're ready
          to start managing your finances with AI.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Voice Ready
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Secure
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              AI Powered
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onSignUp}
        className="btn-success w-full h-12 text-base font-semibold relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-success-700 to-success-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  );

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
            <p className="text-xl text-blue-100 font-medium mb-4">
              Your AI-powered voice-assisted financial manager
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-blue-100">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-300" />
                <span>Bank-grade security</span>
              </div>
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

          {/* Social proof */}
          <div className="mt-12 glass rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <p className="text-blue-100 italic text-lg mb-4">
                "Join thousands of users managing their finances with voice and
                AI"
              </p>
              <div className="flex justify-center items-center space-x-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"
                    ></div>
                  ))}
                </div>
                <span className="text-sm text-blue-200">and many more...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced Sign Up Form */}
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

          {/* Enhanced form card */}
          <div className="card shadow-large p-8 animate-slide-up border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step === "signup"
                      ? "bg-primary-600 text-white"
                      : step === "verify" || step === "success"
                      ? "bg-success-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step === "signup" ? "1" : <Check className="w-4 h-4" />}
                </div>
                <div
                  className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    step === "verify" || step === "success"
                      ? "bg-success-600"
                      : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step === "verify"
                      ? "bg-primary-600 text-white"
                      : step === "success"
                      ? "bg-success-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step === "verify" ? (
                    "2"
                  ) : step === "success" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <div
                  className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    step === "success" ? "bg-success-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step === "success"
                      ? "bg-success-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step === "success" ? <Check className="w-4 h-4" /> : "3"}
                </div>
              </div>
            </div>

            {/* Back button for verification step */}
            {step === "verify" && (
              <button
                onClick={() => setStep("signup")}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to sign up
              </button>
            )}

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {step === "signup" && "Create Your Account"}
                {step === "verify" && "Verify Your Email"}
                {step === "success" && "Welcome to FinSay!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {step === "signup" &&
                  "Join FinSay to start managing your finances with AI"}
                {step === "verify" &&
                  "We've sent a verification code to your email"}
                {step === "success" && "Your account is ready to use"}
              </p>
            </div>

            {step === "signup" && renderSignUpForm()}
            {step === "verify" && renderVerificationForm()}
            {step === "success" && renderSuccessMessage()}

            {step === "signup" && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Already have an account?{" "}
                  <button
                    onClick={onBackToLogin}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors duration-200 hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
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
                  Enterprise-Grade Security
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  Your financial data is encrypted end-to-end, processed
                  locally, and never shared. We're SOC 2 compliant and follow
                  the same security standards as major financial institutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
