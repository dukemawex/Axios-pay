// this is frontend/src/App.tsx file

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Wallet, Building2, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Dynamically loads the API base URL injected by DigitalOcean App Platform at build time.
// Falls back to localhost for local development.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'; 

export default function App() {
  const [balances, setBalances] = useState({ NGN: 0, UGX: 0 });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Forms State
  const [fundAmount, setFundAmount] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchBalances = async () => {
    try {
      const res = await fetch(`${API_BASE}/wallet/balances`);
      const data = await res.json();
      if (data.success) {
        const newBalances = { NGN: 0, UGX: 0 };
        data.wallets.forEach((w: any) => {
          if (w.currency === 'NGN') newBalances.NGN = parseFloat(w.balance);
          if (w.currency === 'UGX') newBalances.UGX = parseFloat(w.balance);
        });
        setBalances(newBalances);
      }
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wallet/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(fundAmount), currency: 'NGN' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setFundAmount('');
        fetchBalances();
      } else throw new Error(data.message);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wallet/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(swapAmount), fromCurrency: 'NGN', toCurrency: 'UGX' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setSwapAmount('');
        fetchBalances();
      } else throw new Error(data.message);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), currency: 'UGX', bankCode: '044', accountNumber: '0000000000' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setWithdrawAmount('');
        fetchBalances();
      } else throw new Error(data.message);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ArrowRightLeft className="text-black w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Axios Pay</span>
          </div>
          <div className="text-zinc-400 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Powered by Interswitch API
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {notification && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Balances */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-emerald-400" />
                <h2 className="text-lg font-medium text-zinc-300">Local Wallet (NGN)</h2>
              </div>
              <div className="text-4xl font-bold tracking-tight">₦{balances.NGN.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-cyan-400" />
                <h2 className="text-lg font-medium text-zinc-300">Destination (UGX)</h2>
              </div>
              <div className="text-4xl font-bold tracking-tight">USh {balances.UGX.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-zinc-500 w-5 h-5" />
                <span className="text-zinc-400 text-sm">Current Rate</span>
              </div>
              <span className="text-emerald-400 font-mono text-sm">1 NGN = 2.45 UGX</span>
            </div>
          </div>

          {/* Right Col: Actions */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Action: Fund Wallet */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-2">1. Fund Wallet</h3>
              <p className="text-zinc-400 text-sm mb-6">Deposit NGN via Interswitch Webpay.</p>
              
              <form onSubmit={handleFund} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₦</span>
                  <input 
                    type="number" 
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="100,000"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-lg"
                  />
                </div>
                <button disabled={loading} className="w-full bg-white text-black font-semibold rounded-xl py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Deposit via Interswitch'}
                </button>
              </form>
            </div>

            {/* Action: Swap */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <h3 className="text-xl font-semibold mb-2">2. Instant FX Swap</h3>
              <p className="text-zinc-400 text-sm mb-6">Convert NGN to UGX instantly.</p>
              
              <form onSubmit={handleSwap} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₦</span>
                  <input 
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="Amount to swap"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-lg"
                  />
                </div>
                <button disabled={loading} className="w-full bg-emerald-500 text-white font-semibold rounded-xl py-4 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><ArrowRightLeft className="w-5 h-5" /> Execute Swap</>}
                </button>
              </form>
            </div>

            {/* Action: Payout */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">3. Disburse to Local Bank</h3>
                  <p className="text-zinc-400 text-sm">Send UGX directly to a Ugandan bank account via Interswitch Payouts.</p>
                </div>
                <Building2 className="text-zinc-500 w-8 h-8" />
              </div>
              
              <form onSubmit={handleWithdraw} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">USh</span>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to send"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
                <button disabled={loading} className="w-full md:w-auto bg-zinc-800 text-white font-medium rounded-xl px-8 py-4 hover:bg-zinc-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Process Payout'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}