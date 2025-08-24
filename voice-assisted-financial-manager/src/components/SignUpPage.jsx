import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Shield,
  CreditCard,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SignUpPage = ({ onSignUp, onBackToLogin }) => {
  const { signUp, resendVerification, verifyEmail, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState("signup"); // 'signup', 'verify', 'success'
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      const result = await signUp(formData);

      if (result.success) {
        if (result.needsVerification) {
          setStep("verify");
        } else {
          setStep("success");
        }
      }
    } catch (error) {
      setError(error.message);
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
        alert("Verification code resent to your email");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const features = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Secure Verification",
      description: "Email verification ensures account security",
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

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white pr-12"
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("password")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 8 characters long
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white pr-12"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirmPassword")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerifyEmail} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Verify Your Email
        </h3>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to <br />
          <span className="font-medium text-gray-900">{formData.email}</span>
        </p>
      </div>

      <div>
        <label
          htmlFor="verificationCode"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Verification Code
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) =>
            setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white text-center text-2xl font-mono tracking-widest"
          placeholder="000000"
          maxLength={6}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || verificationCode.length !== 6}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify Email"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading}
          className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200 disabled:opacity-50"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-success-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Account Created Successfully!
        </h3>
        <p className="text-gray-600">
          Your email has been verified and your account is ready to use.
        </p>
      </div>
      <button
        onClick={onSignUp}
        className="w-full bg-gradient-to-r from-success-600 to-success-700 text-white py-3 px-4 rounded-lg font-medium hover:from-success-700 hover:to-success-800 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
      >
        Continue to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white relative overflow-hidden">
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
              "Join thousands of users managing their finances with voice and
              AI"
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">
              VoiceFinance
            </h1>
            <p className="text-gray-600">AI-powered financial management</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
            {/* Back button for verification step */}
            {step === "verify" && (
              <button
                onClick={() => setStep("signup")}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign up
              </button>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === "signup" && "Create Your Account"}
                {step === "verify" && "Verify Your Email"}
                {step === "success" && "Welcome!"}
              </h2>
              <p className="text-gray-600">
                {step === "signup" &&
                  "Join VoiceFinance to start managing your finances with voice"}
                {step === "verify" && "Enter the code sent to your email"}
                {step === "success" && "Your account is ready to use"}
              </p>
            </div>

            {step === "signup" && renderSignUpForm()}
            {step === "verify" && renderVerificationForm()}
            {step === "success" && renderSuccessMessage()}

            {step === "signup" && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={onBackToLogin}
                    className="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Privacy & Security
                </h4>
                <p className="text-xs text-blue-700 mt-1">
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

export default SignUpPage;
