import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ArrowRight, ShieldCheck, Zap, Globe, Mail, Lock, User as UserIcon } from 'lucide-react';

export function Auth() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const features = [
    { icon: ShieldCheck, title: "Role-Based Access", desc: "Manage detailed permissions for Admins and Members." },
    { icon: Zap, title: "Real-time Collaboration", desc: "Updates happen instantly across all devices." },
    { icon: Globe, title: "Cross-functional", desc: "Built for teams of all sizes and disciplines." }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row font-sans overflow-hidden text-text-primary">
      {/* Brand Side */}
      <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-between bg-sidebar-bg border-r border-border-dark relative">
        <div className="relative z-10">
           <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl mb-12 shadow-xl shadow-indigo-500/20">C</div>
           <motion.h1 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-6xl font-black tracking-tight leading-none mb-8 text-white"
           >
            Organize work, <br />
            <span className="text-indigo-500">better together.</span>
           </motion.h1>
           <p className="text-xl text-text-muted max-w-md leading-relaxed">
             CollabTask helps teams manage projects, track tasks, and achieve more in a streamlined, high-performance environment.
           </p>
        </div>

        <div className="hidden md:block relative z-10">
           <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-text-muted group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all border border-transparent group-hover:border-indigo-500/20">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{f.title}</h4>
                    <p className="text-xs text-text-muted">{f.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Action Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-brand-bg relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)] pointer-events-none"></div>
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-card-bg w-full max-w-md p-10 rounded-[32px] shadow-2xl border border-border-dark relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/20">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </div>
            <h2 className="text-3xl font-black text-white">{isLogin ? 'Sign In' : 'Join CollabTask'}</h2>
            <p className="text-text-muted mt-2">Enter your details to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-sidebar-bg border border-border-dark rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-sidebar-bg border border-border-dark rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-sidebar-bg border border-border-dark rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-600 text-white py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!authLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-dark"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card-bg px-2 text-text-muted">Or continue with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full bg-white text-black py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-text-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
