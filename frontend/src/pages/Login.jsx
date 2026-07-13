import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Transport login";
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!username) {
      errors.username = 'Username is required.';
    } else if (username.length < 5) {
      errors.username = 'Username must be at least 5 characters.';
    } else if (username.length > 30) {
      errors.username = 'Username cannot exceed 30 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post('/login/', {
        username: username.trim(),
        password,
      });
      if (response.data.message === 'Login successful') {
        localStorage.setItem('admin_username', response.data.username);
        localStorage.setItem('user_role', response.data.role);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-all hover:scale-[1.01] duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">Transport login</h1>
          <p className="text-slate-500">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors duration-200 ${validationErrors.username ? 'border-red-500' : 'border-slate-200'}`}
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
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors duration-200 ${validationErrors.password ? 'border-red-500' : 'border-slate-200'}`}
                placeholder="Enter your password"
                aria-invalid={validationErrors.password ? 'true' : 'false'}
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

          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md shadow-primary/20 cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-indigo-700 active:text-indigo-800 hover:underline font-medium transition-colors duration-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
