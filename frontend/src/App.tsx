import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ShieldCheck, Globe, Loader2, ChevronRight, Eye, EyeOff, LogOut, Info } from 'lucide-react';

const API_BASE = '/api';

type View = 'login' | 'register' | 'dashboard' | 'about';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('axios_token');
    const storedUser = localStorage.getItem('axios_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setView('dashboard');
      } catch {
        localStorage.removeItem('axios_token');
        localStorage.removeItem('axios_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('axios_token');
    localStorage.removeItem('axios_user');
    setToken(null);
    setUser(null);
    setView('login');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 antialiased">
      <nav className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => token ? setView('dashboard') : setView('login')}>
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
            <ArrowRightLeft className="text-white w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-gray-900">Axios Pay</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('about')}
            className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" /> About
          </button>
          {token && (
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-3.5rem)]">
        {view === 'about' ? (
          <AboutView onBack={() => setView(token ? 'dashboard' : 'login')} />
        ) : view === 'dashboard' && token && user ? (
          <Dashboard token={token} user={user} onLogout={handleLogout} />
        ) : view === 'login' || view === 'register' ? (
          <div className="w-full max-w-[400px]">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                {view === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-gray-500 text-sm">
                Professional cross-border liquidity for the African market.
              </p>
            </div>

            <AuthForm type={view} setToken={setToken} setUser={setUser} setView={setView} />

            <div className="mt-8 flex items-center justify-center gap-6 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> PCI-DSS Compliant</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-emerald-500" /> 24/7 Liquidity</span>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function AuthForm({ type, setToken, setUser, setView }: {
  type: 'login' | 'register';
  setToken: (t: string) => void;
  setUser: (u: { id: string; name: string; email: string }) => void;
  setView: (v: View) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
    const body = type === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('axios_token', data.token);
        localStorage.setItem('axios_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setView('dashboard');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection refused. Verify API routing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        {type === 'register' && (
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              placeholder="Emmanuel Duke"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
            placeholder="name@company.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          ) : (
            <>{type === 'login' ? 'Sign In' : 'Create Account'}<ChevronRight className="w-4 h-4" /></>
          )}
        </button>

        <button
          type="button"
          onClick={() => setView(type === 'login' ? 'register' : 'login')}
          className="w-full text-gray-500 text-[11px] font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors py-2"
        >
          {type === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ token, user, onLogout }: { token: string; user: { id: string; name: string; email: string }; onLogout: () => void }) {
  return (
    <div className="max-w-lg w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
          <ShieldCheck className="text-emerald-500 w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Session Active</h2>
        <p className="text-gray-500 text-sm mb-1">Welcome, {user.name}</p>
        <p className="text-gray-400 text-xs mb-6">{user.email}</p>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6 text-left">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Session Token</p>
          <p className="text-xs font-mono text-gray-600 break-all">{token.slice(0, 40)}…</p>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          All cross-border liquidity routes are encrypted and active.
        </p>

        <button
          onClick={onLogout}
          className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
        >
          Terminate Session
        </button>
      </div>
    </div>
  );
}

function AboutView({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <ArrowRightLeft className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">About Axios Pay</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">NGN/UGX Liquidity Engine</p>
          </div>
        </div>

        <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">Axios Pay</strong> is a cross-border fintech platform built to solve
            the liquidity gap between Nigerian Naira (NGN) and Ugandan Shilling (UGX) markets—
            two of Sub-Saharan Africa's most active trade corridors.
          </p>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">The Problem</h3>
            <p>
              Businesses and individuals moving value between Nigeria and Uganda face high FX spreads,
              slow settlement times, and opaque pricing from legacy providers. Axios Pay eliminates
              intermediaries and offers near-instant settlement at transparent rates.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">The Engine</h3>
            <p>
              Powered by a dual-wallet ledger system, Axios Pay maintains both NGN and UGX balances
              per user. Swaps execute atomically via our internal FX engine, with rates anchored to
              live market data. The platform integrates Interswitch for fiat on/off ramps.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">UNN-Tech Roots</h3>
            <p>
              Axios Pay was conceived at the University of Nigeria, Nsukka (UNN) as part of a broader
              initiative to build world-class financial infrastructure for African markets. The project
              reflects UNN's tradition of producing engineers who solve real continental problems.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2 text-[11px] uppercase tracking-widest font-bold text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> PCI-DSS Compliant</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-emerald-500" /> 24/7 Liquidity</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 text-[11px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

