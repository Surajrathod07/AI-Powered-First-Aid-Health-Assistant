
import React, { useState } from 'react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';

interface SignupViewProps {
  onNavigate: (view: ViewState) => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onNavigate }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      // Note: Supabase might require email confirmation depending on settings
      // For now we assume auto-login or redirect
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
              loading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
            }`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <button 
            onClick={() => onNavigate('auth-login')}
            className="text-cyan-400 hover:underline font-medium"
          >
            Log In
          </button>
        </p>

        <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <button 
                onClick={() => onNavigate('landing')}
                className="text-slate-500 hover:text-white text-xs"
            >
                ← Back to Home
            </button>
        </div>
      </div>
    </div>
  );
};

export default SignupView;
