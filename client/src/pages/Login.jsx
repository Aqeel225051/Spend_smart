import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Mail, Lock, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo fill helper for project evaluators and quick testing
  const fillDemoCredentials = () => {
    setEmail('student@ictak.edu');
    setPassword('student123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 mb-4 shadow-lg shadow-indigo-600/20">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SpendSmart</h1>
          <p className="text-sm text-slate-400 mt-1">
            Student Expense Tracker & Budget Management
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-indigo-300">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ICTAK MERN Internship Project</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your student credentials to access your financial dashboard.
          </p>

          {error && <Alert type="error" message={error} className="mb-5" onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Button */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-xs font-medium text-slate-300 border border-slate-700 hover:border-indigo-500/50 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fill Evaluation Demo Credentials</span>
            </button>
          </div>

          {/* Footer Register Link */}
          <p className="text-center text-xs text-slate-400 mt-6">
            New to SpendSmart?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
