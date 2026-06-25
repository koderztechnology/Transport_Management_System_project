import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
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
      setError(
        JSON.stringify(err.response?.data) ||
        'Signup failed'
      );
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
    } else if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    } else {
      setRole(value);
    }

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-[1.01] duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-cyan/10 text-accent-cyan mb-4">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Transport Admin</h1>
          <p className="text-slate-500">Create a new admin account</p>
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
              value={username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.username ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="Choose a username"
              aria-invalid={validationErrors.username ? 'true' : 'false'}
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
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.email ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="Enter your email"
              aria-invalid={validationErrors.email ? 'true' : 'false'}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-colors duration-200 ${validationErrors.password ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="Create a password"
              aria-invalid={validationErrors.password ? 'true' : 'false'}
              required
            />
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
            className="w-full bg-accent-cyan hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md shadow-accent-cyan/20"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
