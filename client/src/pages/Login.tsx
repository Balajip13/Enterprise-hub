import React, { useState } from 'react';
import { 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Globe, 
  Zap,
  CheckCircle2,
  ChevronRight,
  X,
  User,
  Loader2,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

type LoginStep = 'WELCOME' | 'SUCCESS';

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/auth`;

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('WELCOME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    user_email: '',
    user_password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.user_email, 
          password: formData.user_password 
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         throw new Error('System temporarily unavailable (HTML response received)');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      // Persist token so all subsequent API calls include the Authorization header
      localStorage.setItem('token', data.token);
      // We don't set 'user' here to avoid race conditions in App.tsx redirection logic

      setStep('SUCCESS');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1500);

    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Server connection failed' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Global CSS for Autofill Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
          -webkit-text-fill-color: #0f172a !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}} />

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Step: Welcome & Login Form */}
        {step === 'WELCOME' && (
          <div className="p-6 sm:p-10 text-center relative">
            <button 
              onClick={() => navigate('/')} 
              className="absolute top-6 right-6 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Back to Home"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30 text-3xl font-black italic">
              X
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Welcome to XOON</h1>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              The professional protocol for high-impact referral networking.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in zoom-in-95">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 mb-6" autoComplete="off">
              <div className="relative text-left">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email" 
                  name="user_email"
                  placeholder="Email Address"
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[14px]"
                  style={{ height: '44px' }}
                  value={formData.user_email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <PasswordInput 
                name="user_password"
                placeholder="Password"
                value={formData.user_password}
                onChange={handleInputChange}
                required
                Icon={Lock}
              />
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 text-white h-[46px] rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Login</>}
              </button>
            </form>

            <div className="text-center mb-8">
              <p className="text-sm text-slate-400 font-bold">
                Not registered? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
              </p>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <div className="space-y-4">
              <button 
                type="button"
                onClick={() => setError('Google login will be available soon.')}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl font-black text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant</span>
              </div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'SUCCESS' && (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Access Granted</h2>
            <p className="text-slate-500 font-medium mb-10">Initializing secure session...</p>
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="mt-12 flex items-center gap-3 text-slate-400 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Enterprise Grade Security</span>
      </div>
    </div>
  );
};

export default Login;
