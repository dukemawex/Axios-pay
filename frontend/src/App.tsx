import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ShieldCheck, Globe, Loader2, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [token, setToken] = useState<string | null>(localStorage.getItem('axios_token'));

  useEffect(() => {
    if (token) setView('dashboard');
  }, [token]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] antialiased selection:bg-emerald-500/30">
      {/* Ultra-Thin Mercury Style Nav */}
      <nav className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
            <ArrowRightLeft className="text-black w-4 h-4" strokeWidth={3} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">Axios Pay</span>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 py-20">
        {view !== 'dashboard' ? (
          <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-medium tracking-tight mb-3">
                {view === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-zinc-500 text-sm">
                Professional cross-border liquidity for the African market.
              </p>
            </div>

            <AuthForm type={view} setToken={setToken} setView={setView} />
            
            <div className="mt-8 flex items-center justify-center gap-6 text-[11px] uppercase tracking-widest text-zinc-600 font-bold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> PCI-DSS Compliant</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3"/> 24/7 Liquidity</span>
            </div>
          </div>
        ) : (
          <Dashboard token={token!} />
        )}
      </main>
    </div>
  );
}

function AuthForm({ type, setToken, setView }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify(body)
      });
      
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('axios_token', data.token);
        setToken(data.token);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded mb-4 animate-shake">
          {error}
        </div>
      )}

      {type === 'register' && (
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#111] border border-white/5 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700" placeholder="Emmanuel Duke" />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#111] border border-white/5 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700" placeholder="name@company.com" />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#111] border border-white/5 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700" placeholder="••••••••" />
      </div>

      <button disabled={loading} className="w-full bg-[#F5F5F7] text-black text-sm font-bold py-3.5 rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2 mt-4">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (type === 'login' ? 'Sign In' : 'Create Account')}
        {!loading && <ChevronRight className="w-4 h-4" />}
      </button>

      <button type="button" onClick={() => setView(type === 'login' ? 'register' : 'login')} className="w-full text-zinc-500 text-[11px] font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors py-2">
        {type === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
      </button>
    </form>
  );
}

function Dashboard({ token: _token }: { token: string }) {
  return (
    <div className="max-w-4xl w-full text-center animate-in fade-in duration-1000">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
        <ShieldCheck className="text-emerald-400 w-10 h-10" />
      </div>
      <h2 className="text-2xl font-medium mb-2 text-white">Security Verified</h2>
      <p className="text-zinc-500 mb-8 max-w-sm mx-auto text-sm">
        Your production session is active. All cross-border liquidity routes are now encrypted.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={() => { localStorage.removeItem('axios_token'); window.location.reload(); }} 
          className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-white/5 px-6 py-3 rounded-lg hover:bg-white/5 hover:text-white transition-all"
        >
          Terminate Session
        </button>
      </div>
    </div>
  );
}

