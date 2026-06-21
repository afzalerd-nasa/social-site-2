import React, { useState } from 'react';
import { 
  Key, Mail, User as UserIcon, Lock, Shield, Compass, Sparkles, Check, 
  ArrowRight, ShieldAlert, Laptop, Radio, EyeOff, Eye, Loader2
} from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Registration Inputs
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2FA Flow Simulation
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUserHolder, setTempUserHolder] = useState<User | null>(null);

  // General states
  const [loading, setLoading] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorString(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { username, password } 
      : { username, displayName, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const user = await res.json();
        
        // If 2FA simulation is enabled on this user, trigger the secondary auth modal
        if (user.is2faEnabled) {
          setRequires2FA(true);
          setTempUserHolder(user);
        } else {
          onLoginSuccess(user);
        }
      } else {
        const errObj = await res.json();
        setErrorString(errObj.error || 'Server rejected authentication request.');
      }
    } catch (err) {
      console.error(err);
      setErrorString('Network connection timeout. Ensure server host has loaded correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.trim() === '123456' || twoFactorCode.trim().length === 6) {
      if (tempUserHolder) {
        onLoginSuccess(tempUserHolder);
      }
    } else {
      setErrorString('Incorrect 2-Factor authentication token. Try "123456".');
    }
  };

  const simulateSocialLogin = (platform: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: 'user_oauth_' + platform.toLowerCase(),
        username: platform.toLowerCase() + '_user',
        displayName: `${platform} Explorer`,
        email: `oauth@${platform.toLowerCase()}.com`,
        profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
        bio: 'Secured login using decentralized OAuth protocols.',
        followersCount: 1,
        followingCount: 3,
        isVerified: true,
        joinedAt: new Date().toISOString(),
        is2faEnabled: false,
        role: 'user',
        isBanned: false,
        warningCount: 0
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      
      {/* COLOURED HERO BRAND SIDEBAR (Desktop) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-8 bg-gradient-to-br from-indigo-900 via-slate-950 to-blue-950 relative h-screen shrink-0 overflow-hidden">
        
        {/* Animated background stars */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-12 left-12 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-12 right-12 w-64 h-64 bg-fuchsia-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-white font-extrabold text-xl shadow-lg shadow-cyan-500/10">
            C
          </div>
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ConnectSphere</span>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <span className="text-[10px] uppercase tracking-widest font-bold font-mono text-cyan-400 px-3 py-1 rounded bg-cyan-400/10 inline-block">Secure Node Auth</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none text-slate-100">
            The decentralized future of real-time connection.
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            One-to-one secure calls, HD video live streams, end-to-end encrypted chat logs, custom community poll systems, and advanced AI-assisted feed suggestions.
          </p>
        </div>

        <div className="relative z-10 text-[10px] text-slate-500 font-mono flex items-center gap-1.5 border-t border-slate-900 pt-4">
          <Radio size={12} className="text-emerald-500 animate-ping" />
          <span>Active ingress cluster secure &bull; Singapore Node</span>
        </div>

      </div>

      {/* LOGIN / SIGNUP PANEL */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 relative min-h-screen">
        
        {/* Small header logo for mobile mobile */}
        <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-bold tracking-tight text-white text-lg">ConnectSphere</span>
        </div>

        <div className="max-w-sm w-full mx-auto space-y-6">
          
          {requires2FA ? (
            /* 2FA MODAL ENFORCEMENT */
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
                <Shield size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">2-Factor Authentication Required</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter the 6-digit validation code generated by your system credentials. Use <span className="font-mono text-cyan-400 font-bold">"123456"</span> to bypass securely.
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Key size={14} />
                  </span>
                  <input
                    id="twofactor-code-input"
                    type="password"
                    placeholder="Enter code (123456)"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 outline-none text-center font-mono letter-spacing text-slate-100 focus:border-cyan-500"
                    required
                  />
                </div>

                {errorString && (
                  <p className="text-[10px] text-rose-500 italic mt-1 font-semibold">{errorString}</p>
                )}

                <button
                  id="submit-2fa-token-btn"
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-1.5"
                >
                  Confirm Validation Code
                </button>
              </form>
            </div>

          ) : (
            /* GENERAL CARD DECK FOR REGISTRATION OR SIGNUP */
            <div className="space-y-5">
              
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-100">
                  {mode === 'login' ? 'Establish handshakes' : 'Register New Node Sphere'}
                </h2>
                <p className="text-xs text-slate-500 leading-none">
                  {mode === 'login' ? 'Enter nickname or credentials to continue' : 'Instantly join and access the social matrix'}
                </p>
              </div>

              {errorString && (
                <div className="p-3 bg-red-950/20 rounded-xl border border-rose-950 text-xs text-rose-400 flex items-center gap-2 font-semibold">
                  <ShieldAlert size={14} className="shrink-0" />
                  <p>{errorString}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Username handle */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Handle Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <UserIcon size={14} />
                    </span>
                    <input
                      id="auth-username-field"
                      type="text"
                      placeholder="e.g. sophia_code (or admin)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 outline-none text-slate-200 focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Additional registration details */}
                {mode === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Display Nickname</label>
                      <input
                        id="auth-displayname-field"
                        type="text"
                        placeholder="e.g. Sophia Chen"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 outline-none text-slate-200 focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Mail size={14} />
                        </span>
                        <input
                          id="auth-email-field"
                          type="email"
                          placeholder="e.g. sophia@connectsphere.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 outline-none text-slate-200 focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Passphrase field */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Node Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      id="auth-password-field"
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 outline-none text-slate-200 focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute inset-y-0 right-3 text-slate-400 flex items-center"
                    >
                      {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-1.5 hover:opacity-95 transition-all mt-3"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  <span>{mode === 'login' ? 'Establish Access Link' : 'Register New Interface'}</span>
                </button>

              </form>

              {/* SWITCH MODE BTN */}
              <div className="text-center text-xs text-slate-500 pt-2">
                <span>{mode === 'login' ? "Don't have a secure node?" : "Already registered your node?"}</span>{' '}
                <button
                  id="switch-auth-mode-btn"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrorString(null);
                  }}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  {mode === 'login' ? 'Register' : 'Login'}
                </button>
              </div>

              {/* SOCIAL HANDSHAKES SELECTORS */}
              <div className="space-y-3 pt-4 border-t border-slate-900">
                <p className="text-[9px] uppercase tracking-wider text-slate-500 text-center font-bold">Secure Social handshake redirects</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => simulateSocialLogin('Google')}
                    className="p-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-200 border border-slate-800 transition-all text-center"
                  >
                    Google Redirect
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateSocialLogin('Facebook')}
                    className="p-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-200 border border-slate-800 transition-all text-center"
                  >
                    Apple Redirect
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
