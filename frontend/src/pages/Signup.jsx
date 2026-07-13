import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Transport signup";
  }, []);

  const validateUsername = (val) => {
    if (!val) return 'Username is required.';
    if (val.length < 5) return 'Username must be at least 5 characters.';
    if (val.length > 30) return 'Username cannot exceed 30 characters.';
    if (!/^[a-zA-Z0-9_ ]+$/.test(val)) return 'Username can only contain letters, numbers, underscores, and spaces.';
    return '';
  };

  const validateEmail = (val) => {
    if (!val) return 'Email is required.';
    if (val.length > 50) return 'Email cannot exceed 50 characters.';
    if (val.includes(' ')) return 'Email address cannot contain spaces.';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    const uErr = validateUsername(username);
    const eErr = validateEmail(email);

    if (uErr) errors.username = uErr;
    if (eErr) errors.email = eErr;

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (password.length > 128) {
      errors.password = 'Password cannot exceed 128 characters.';
    }

    if (!role) {
      errors.role = 'Please select a role.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post('/signup/', {
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      if (response.status === 200) {
        navigate('/login');
      }
    } catch (err) {
      // Decode backend error message if available
      let backendError = 'Signup failed';
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          backendError = err.response.data.error || JSON.stringify(err.response.data);
        } else {
          backendError = err.response.data;
        }
      }
      setError(backendError);
    }
  };

  const handleFieldChange = (field, value) => {
    let cleanValue = value;
    if (field === 'username') {
      setUsername(value);
    } else if (field === 'email') {
      cleanValue = value.replace(/\s/g, '');
      setEmail(cleanValue);
    } else if (field === 'password') {
      setPassword(value);
    } else {
      setRole(value);
    }

    if (validationErrors[field]) {
      let errorMsg = '';
      if (field === 'username') {
        errorMsg = validateUsername(cleanValue);
      } else if (field === 'email') {
        errorMsg = validateEmail(cleanValue);
      }
      setValidationErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (field) => {
    let errorMsg = '';
    if (field === 'username') {
      errorMsg = validateUsername(username);
    } else if (field === 'email') {
      errorMsg = validateEmail(email);
    }
    setValidationErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-all hover:scale-[1.01] duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-cyan/10 text-accent-cyan mb-4">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">Transport signup</h1>
          <p className="text-slate-500">Create a new account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.username ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="Enter your username"
              aria-invalid={validationErrors.username ? 'true' : 'false'}
              maxLength={30}
              required
            />
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.email ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="Enter your email"
              aria-invalid={validationErrors.email ? 'true' : 'false'}
              maxLength={50}
              required
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.password ? 'border-red-500' : 'border-slate-200'}`}
                placeholder="Create a password"
                aria-invalid={validationErrors.password ? 'true' : 'false'}
                maxLength={128}
                required
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              )}
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.role ? 'border-red-500' : 'border-slate-200'}`}
              aria-invalid={validationErrors.role ? 'true' : 'false'}
            >
              <option value="Admin">Admin / Owner</option>
              <option value="Manager">Manager / Accountant</option>
              <option value="Driver">Driver</option>
              <option value="Vendor">Vendor</option>
            </select>
            {validationErrors.role && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.role}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-accent-cyan hover:bg-cyan-600 active:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md shadow-accent-cyan/20 cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:text-cyan-600 active:text-cyan-700 hover:underline font-medium transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
