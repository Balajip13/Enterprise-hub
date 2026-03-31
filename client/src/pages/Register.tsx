import React, { useState } from 'react';
import { 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Globe, 
  Zap,
  CheckCircle2,
  X,
  User,
  Loader2,
  Lock,
  Phone,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

interface RegisterProps {}

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/auth`;

const getPasswordStrength = (pw: string) => {
  if (!pw) return 0;
  let strength = 0;
  if (pw.length >= 8) strength++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) strength++;
  if (/[0-9]/.test(pw) && /[!@#$%^&*(),.?":{}|<>]/.test(pw)) strength++;
  return strength;
};

const isStrongPassword = (pw: string) => {
  return pw.length >= 8 && 
         /[A-Z]/.test(pw) && 
         /[a-z]/.test(pw) && 
         /[0-9]/.test(pw) && 
         /[!@#$%^&*(),.?":{}|<>]/.test(pw);
};

const Register: React.FC<RegisterProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const refCode = queryParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError('Password must meet all security requirements listed below.');
      return;
    }

    const mobileDigits = formData.mobile.replace(/\D/g, '');
    if (mobileDigits.length < 10) {
      setError('Mobile number must be at least 10 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          referredBy: refCode || undefined
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         throw new Error('System temporarily unavailable (HTML response received)');
      }

      const data = await response.json();

      if (!response.ok) {
        // Surface specific Zod validation error if available
        const errorMessage = data.errors?.[0]?.message || data.message || 'Registration failed';
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

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
        
        {!success ? (
          <div className="p-6 sm:p-10 relative">
            <button 
              onClick={() => navigate('/')} 
              className="absolute top-6 right-6 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Back to Home"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20 text-2xl font-black italic">
              X
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1 text-center">Create Account</h2>
            <p className="text-sm text-slate-500 font-medium mb-8 text-center">Join the global network of enterprise professionals.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in zoom-in-95">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name"
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[14px]"
                  style={{ height: '44px' }}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="tel" 
                  name="mobile"
                  placeholder="Mobile Number"
                  autoComplete="tel"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[14px]"
                  style={{ height: '44px' }}
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[14px]"
                  style={{ height: '44px' }}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <PasswordInput 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                Icon={Lock}
              />

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="px-1 space-y-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3].map((level) => {
                      const strength = getPasswordStrength(formData.password);
                      const active = strength >= level;
                      let color = 'bg-slate-200';
                      if (active) {
                        if (strength === 1) color = 'bg-rose-500';
                        else if (strength === 2) color = 'bg-amber-500';
                        else color = 'bg-emerald-500';
                      }
                      return <div key={level} className={`flex-1 rounded-full transition-all duration-500 ${color}`} />;
                    })}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Strength: <span className={
                        getPasswordStrength(formData.password) === 1 ? 'text-rose-500' : 
                        getPasswordStrength(formData.password) === 2 ? 'text-amber-500' : 'text-emerald-500'
                      }>
                        {getPasswordStrength(formData.password) === 1 ? 'Weak' : 
                         getPasswordStrength(formData.password) === 2 ? 'Medium' : 'Strong'}
                      </span>
                    </span>
                  </div>
                  
                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                    {[
                      { label: '8+ Characters', met: formData.password.length >= 8 },
                      { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
                      { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
                      { label: 'Number', met: /[0-9]/.test(formData.password) },
                      { label: 'Special Char', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                          <CheckCircle2 className="w-2 h-2" />
                        </div>
                        <span className={`text-[9px] font-bold ${req.met ? 'text-slate-600' : 'text-slate-400'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PasswordInput 
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                Icon={ShieldCheck}
              />
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 text-white h-[46px] rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <CheckCircle2 className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-400 font-bold mb-2">Already a member?</p>
              <Link to="/login" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline">Login Here</Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Instant</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Account Created</h2>
            <p className="text-emerald-600 font-bold mb-10">Account created successfully. Please log in to continue.</p>
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

export default Register;
