// Authentication Service for VoiceFinance
// This service handles user registration, email verification, and login

class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.storageKey = 'voicefinance_auth';
  }

  // Generate a random verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store verification code in localStorage (for demo purposes)
  storeVerificationCode(email, code) {
    const verificationData = {
      email,
      code,
      timestamp: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
    localStorage.setItem('voicefinance_verification', JSON.stringify(verificationData));
  }

  // Get stored verification code
  getStoredVerificationCode(email) {
    try {
      const data = localStorage.getItem('voicefinance_verification');
      if (!data) return null;

      const verificationData = JSON.parse(data);
      
      // Check if code has expired
      if (Date.now() > verificationData.expiresAt) {
        localStorage.removeItem('voicefinance_verification');
        return null;
      }

      // Check if email matches
      if (verificationData.email !== email) {
        return null;
      }

      return verificationData.code;
    } catch (error) {
      console.error('Error getting verification code:', error);
      return null;
    }
  }

  // Clear verification code
  clearVerificationCode() {
    localStorage.removeItem('voicefinance_verification');
  }

  // Store user data in localStorage
  storeUserData(userData) {
    localStorage.setItem(this.storageKey, JSON.stringify({
      ...userData,
      timestamp: Date.now()
    }));
  }

  // Get stored user data
  getUserData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Clear user data
  clearUserData() {
    localStorage.removeItem(this.storageKey);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const userData = this.getUserData();
    return userData && userData.email && userData.isVerified;
  }

  // Register new user
  async register(userData) {
    try {
      // Validate input
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('All fields are required');
      }

      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Call backend API
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      return data;

    } catch (error) {
      // Fallback to local storage if backend is not available
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.warn('Backend not available, using local storage fallback');
        
        // Check if user already exists (simulate database check)
        const existingUsers = this.getExistingUsers();
        if (existingUsers.find(user => user.email === userData.email)) {
          throw new Error('User with this email already exists');
        }

        // Generate verification code
        const verificationCode = this.generateVerificationCode();
        
        // Store verification code
        this.storeVerificationCode(userData.email, verificationCode);

        // In a real app, you would send this code via email
        console.log(`Verification code for ${userData.email}: ${verificationCode}`);

        return {
          success: true,
          message: 'Verification code sent to your email',
          email: userData.email
        };
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Verify email with code
  async verifyEmail(email, code) {
    try {
      // Call backend API
      const response = await fetch(`${this.baseURL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Email verification failed');
      }

      // Store user data locally
      this.storeUserData(data.user);

      return data;

    } catch (error) {
      // Fallback to local storage if backend is not available
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.warn('Backend not available, using local storage fallback');
        
        // Get stored verification code
        const storedCode = this.getStoredVerificationCode(email);
        
        if (!storedCode) {
          throw new Error('Verification code expired or not found');
        }

        if (storedCode !== code) {
          throw new Error('Invalid verification code');
        }

        // Create user account
        const userData = {
          email,
          isVerified: true,
          createdAt: new Date().toISOString(),
          // In a real app, you would get this from the registration form
          firstName: 'User',
          lastName: 'Name'
        };

        // Store user data
        this.storeUserData(userData);

        // Clear verification code
        this.clearVerificationCode();

        return {
          success: true,
          message: 'Email verified successfully',
          user: userData
        };
      }
      
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Call backend API
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('voicefinance_token', data.access_token);
      
      // Get user info
      const userResponse = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        this.storeUserData(userData);
      }

      return {
        success: true,
        message: 'Login successful',
        user: data
      };

    } catch (error) {
      // Fallback to local storage if backend is not available
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.warn('Backend not available, using local storage fallback');
        
        // Check if user exists and is verified
        const existingUsers = this.getExistingUsers();
        const user = existingUsers.find(u => u.email === email);

        if (!user) {
          throw new Error('User not found. Please sign up first.');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in.');
        }

        // In a real app, you would verify the password hash
        // For demo purposes, we'll accept any password for existing users
        if (user.email === 'demo@voicefinance.com' && password === 'demo123') {
          this.storeUserData(user);
          return {
            success: true,
            message: 'Login successful',
            user
          };
        }

        // For other users, simulate password verification
        if (user.password === password) {
          this.storeUserData(user);
          return {
            success: true,
            message: 'Login successful',
            user
          };
        }

        throw new Error('Invalid email or password');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  logout() {
    this.clearUserData();
    localStorage.removeItem('voicefinance_token');
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Resend verification code
  async resendVerificationCode(email) {
    try {
      // Call backend API
      const response = await fetch(`${this.baseURL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend verification code');
      }

      return data;

    } catch (error) {
      // Fallback to local storage if backend is not available
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.warn('Backend not available, using local storage fallback');
        
        // Generate new verification code
        const verificationCode = this.generateVerificationCode();
        
        // Store new verification code
        this.storeVerificationCode(email, verificationCode);

        // In a real app, you would send this code via email
        console.log(`New verification code for ${email}: ${verificationCode}`);

        return {
          success: true,
          message: 'Verification code resent to your email'
        };
      }
      
      throw new Error(error.message || 'Failed to resend verification code');
    }
  }

  // Get existing users (for demo purposes)
  getExistingUsers() {
    try {
      const users = localStorage.getItem('voicefinance_users');
      return users ? JSON.parse(users) : [
        {
          email: 'demo@voicefinance.com',
          password: 'demo123',
          firstName: 'Demo',
          lastName: 'User',
          isVerified: true,
          createdAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      return [];
    }
  }

  // Store new user in demo database
  storeNewUser(userData) {
    try {
      const existingUsers = this.getExistingUsers();
      const newUser = {
        ...userData,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('voicefinance_users', JSON.stringify(existingUsers));
    } catch (error) {
      console.error('Error storing new user:', error);
    }
  }

  // Forgot password (placeholder for future implementation)
  async forgotPassword(email) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists
      const existingUsers = this.getExistingUsers();
      const user = existingUsers.find(u => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      // In a real app, you would send a password reset email
      console.log(`Password reset requested for ${email}`);

      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };

    } catch (error) {
      throw new Error(error.message || 'Failed to process password reset');
    }
  }

  // Reset password (placeholder for future implementation)
  async resetPassword(email, token, newPassword) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would verify the reset token and update the password
      console.log(`Password reset for ${email} with token ${token}`);

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
