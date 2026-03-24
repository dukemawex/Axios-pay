import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ShieldCheck, Globe, Loader2, ChevronRight, Eye, EyeOff, LogOut } from 'lucide-react';

const API_BASE = '/api';

type View = 'login' | 'register' | 'dashboard';

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
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] antialiased">
      <nav className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => token ? setView('dashboard') : setView('login')}>
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
            <ArrowRightLeft className="text-white w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-gray-900">Axios Pay</span>
        </div>
        <div className="flex items-center gap-4">
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
        {view === 'dashboard' && token && user ? (
          <Dashboard token={token} user={user} onLogout={handleLogout} />
        ) : view === 'login' || view === 'register' ? (
          <div className="w-full max-w-[400px]">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                {view === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-gray-500 text-sm">
                Multi-currency liquidity across African markets.
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

      <footer className="border-t border-gray-200 py-4 px-6 text-center text-[10px] uppercase tracking-widest text-gray-400 font-bold">
        Emmanuel Duke &amp; Fortitude Odunlami | Enyata × Interswitch Buildathon
      </footer>
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
    } catch {
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

const CURRENCY_FLAGS: Record<string, string> = {
  NGN: '🇳🇬',
  UGX: '🇺🇬',
  GHS: '🇬🇭',
  KES: '🇰🇪',
  ZAR: '🇿🇦',
};

const SUPPORTED_CURRENCIES = ['NGN', 'UGX', 'GHS', 'KES', 'ZAR'];

function Dashboard({ token, user, onLogout }: { token: string; user: { id: string; name: string; email: string }; onLogout: () => void }) {
  const [wallets, setWallets] = useState<{ currency: string; balance: number }[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [walletError, setWalletError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/wallet/balances`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const fetched: Record<string, number> = {};
          for (const w of data.wallets) fetched[w.currency] = Number(w.balance);
          setWallets(SUPPORTED_CURRENCIES.map(c => ({ currency: c, balance: fetched[c] ?? 0 })));
        }
      })
      .catch((err) => {
        console.error('Failed to load wallet balances:', err);
        setWallets(SUPPORTED_CURRENCIES.map(c => ({ currency: c, balance: 0 })));
        setWalletError(true);
      })
      .finally(() => setLoadingWallets(false));
  }, [token]);

  return (
    <div className="max-w-lg w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
            <ShieldCheck className="text-emerald-500 w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-400 text-xs">{user.email}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Multi-Currency Liquidity</p>
          {walletError && (
            <p className="text-xs text-red-500 mb-2">Could not load balances. Showing cached data.</p>
          )}
          {loadingWallets ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {wallets.map(w => (
                <div key={w.currency} className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 px-4 py-2.5">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>{CURRENCY_FLAGS[w.currency]}</span>
                    {w.currency}
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {w.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="w-full text-[11px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all mt-2"
        >
          Terminate Session
        </button>
      </div>
    </div>
  );
}
