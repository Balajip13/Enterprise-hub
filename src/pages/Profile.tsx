import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Award, 
  Edit3, 
  Share2, 
  MapPin, 
  Briefcase, 
  Coins, 
  ArrowUpRight,
  BarChart3,
  FileText,
  Copy,
  Check,
  Building2,
  UserCheck,
  Camera,
  Video,
  PlayCircle,
  Plus,
  Zap,
  Tag,
  CreditCard,
  Fingerprint,
  RefreshCcw,
  AlertCircle,
  X,
  Bell,
  Lock,
  Globe,
  Trash2,
  ChevronRight,
  Save,
  LogOut,
  Twitter,
  Linkedin,
  Mail,
  ExternalLink,
  KeyRound,
  Eye,
  Sparkles,
  EyeOff,
  Target,
  Users,
  CheckCircle2,
  Clock,
  Slash,
  Palmtree,
  Package,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { apiService, apiFetch } from '../services/apiService';
import PaymentModal from '../components/PaymentModal';

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

interface ProfileData {
  user: any;
  stats: {
    trustScore: number;
    referralPoints: number;
    rank: string;
    revenueImpact: number;
    dealsClosed: number;
    referralsGiven: number;
    referralsReceived: number;
    attendanceRate: number;
    reputationTier: string;
    analytics: any[];
  };
}

interface ProfileProps {
  onSignOut?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onSignOut }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    ownerName: '',
    location: '',
    category: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    website: '',
    description: '',
    keywords: [] as string[],
    newKeyword: '',
    services: [] as { name: string, description: string, icon?: string }[],
    idealReferrals: [] as { target: string, description: string, industry?: string }[],
    availability: { status: 'Open for Referrals', note: '' } as { status: string, note: string },
    newService: { name: '', description: '' },
    newIdealReferral: { target: '', description: '', industry: '' }
  });

  const [settingsView, setSettingsView] = useState<'MAIN' | 'ACCOUNT' | 'PASSWORD' | 'NOTIF'>('MAIN');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userFromStorage.id;

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    } else {
      setError('User context missing. Please re-login.');
      setLoading(false);
    }
  }, [userId]);

  const fetchProfile = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUserProfileFull(uid);
      setProfileData(data);
      if (data.user) {
        setAutoRenew(data.user.isAutoRenewalEnabled || false);
        setEditForm({
          name: data.user.name || '',
          ownerName: data.user.ownerName || '',
          location: data.user.location || '',
          category: data.user.category || '',
          businessType: data.user.businessType || 'ORGANIZATION',
          gstNumber: data.user.gstNumber || '',
          panNumber: data.user.panNumber || '',
          website: data.user.website || '',
          description: data.user.description || '',
          keywords: data.user.keywords || [],
          newKeyword: '',
          services: data.user.services || [],
          idealReferrals: data.user.idealReferrals || [],
          availability: data.user.availability || { status: 'Open for Referrals', note: '' },
          newService: { name: '', description: '' },
          newIdealReferral: { target: '', description: '', industry: '' }
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to sync with network hub.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validation
    if (!editForm.name.trim()) {
      setFormError('Brand Identity (Name) is required.');
      return;
    }
    if (!editForm.location.trim()) {
      setFormError('Operational Node (Location) is required.');
      return;
    }
    if (editForm.description.length > 500) {
      setFormError('Mission Statement cannot exceed 500 characters.');
      return;
    }

    try {
      const { newKeyword, newService, newIdealReferral, ...dataToUpdate } = editForm;
      await apiService.updateUserProfile(userId, dataToUpdate);
      
      // 2. Fetch fresh data from DB to guarantee absolute reactivity
      await fetchProfile(userId);
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setFormError(err.message || 'Failed to securely save profile updates.');
    }
  };

  const handlePaymentSuccess = (isAutoRenew: boolean) => {
    setAutoRenew(isAutoRenew);
    setIsPaymentOpen(false);
    if (userId) fetchProfile(userId);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = (platform: 'whatsapp' | 'linkedin' | 'email') => {
    const shareUrl = window.location.origin + '/profile/' + userId;
    const shareText = `Explore my business portfolio on XOON Hub: ${shareUrl}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Professional%20Network%20Profile&body=${encodeURIComponent(shareText)}`;
        break;
    }
  };

  const addKeyword = () => {
    if (editForm.newKeyword.trim()) {
      setEditForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, prev.newKeyword.trim()],
        newKeyword: ''
      }));
    }
  };

  const removeKeyword = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (editForm.newService.name.trim()) {
      setEditForm(prev => ({
        ...prev,
        services: [...prev.services, { ...prev.newService }],
        newService: { name: '', description: '' }
      }));
    }
  };

  const removeService = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addIdealReferral = () => {
    if (editForm.newIdealReferral.target.trim()) {
      setEditForm(prev => ({
        ...prev,
        idealReferrals: [...prev.idealReferrals, { ...prev.newIdealReferral }],
        newIdealReferral: { target: '', description: '', industry: '' }
      }));
    }
  };

  const removeIdealReferral = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      idealReferrals: prev.idealReferrals.filter((_, i) => i !== index)
    }));
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (!isStrongPassword(passwordForm.newPassword)) {
      setPasswordError('New password must meet all security requirements.');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await apiFetch(`${import.meta.env.VITE_API_URL}/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid server response');
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update password');

      setPasswordSuccess(true);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err.message || 'Secure synchronization failed.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    try {
      setLoading(true);
      const updatedUser = await apiService.uploadProfileImage(userId, file);
      setProfileData(prev => prev ? { ...prev, user: updatedUser } : null);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    try {
      setLoading(true);
      const updatedUser = await apiService.uploadSpotlightVideo(userId, file);
      setProfileData(prev => prev ? { ...prev, user: updatedUser } : null);
    } catch (err) {
      console.error('Error uploading video:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
             <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Vault Synchronizing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight italic">{error.includes('Session expired') ? 'Session Expired' : 'Sync Interrupt'}</h2>
          <p className="text-sm text-slate-400 font-medium mb-10 leading-relaxed italic">{error || 'Please login again to continue.'}</p>
          <div className="space-y-3">
            <button 
              onClick={() => userId && fetchProfile(userId)}
              className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
            >
              Retry Handshake
            </button>
            <button 
              onClick={onSignOut}
              className="w-full py-4 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-rose-500 transition-all"
            >
              Forced Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) return null;

  const { user, stats } = profileData;
  const BusinessIcon = user?.businessType === 'FREELANCER' ? UserCheck : Building2;
  const baseMembershipFee = 999;
  const currentDiscount = user?.membershipDiscount || 0;
  const finalBill = Math.max(0, baseMembershipFee - currentDiscount);

  return (
    <div className="space-y-6 pb-24 sm:pb-12 max-w-[100vw] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2 sm:px-0 pt-4 sm:pt-6">
        <div className="relative text-center sm:text-left">
          <div className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tighter italic leading-none mb-2">Identity Management</h1>
          <p className="text-slate-400 text-[10px] sm:text-xs font-bold tracking-tight">Refining your professional footprint on the network.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-none p-4 bg-white border border-slate-200 rounded-2xl sm:rounded-[1.75rem] text-slate-600 hover:bg-slate-50 transition-all shadow-sm group flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => { setSettingsView('MAIN'); setIsSettingsModalOpen(true); }}
            className="flex-1 sm:flex-none p-4 bg-slate-950 text-white rounded-2xl sm:rounded-[1.75rem] hover:bg-slate-800 transition-all shadow-2xl group flex items-center justify-center"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Profile Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-900/5 border border-slate-100 overflow-hidden">
        {/* Banner */}
        <div className="h-20 sm:h-28 bg-slate-950 relative">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/50 to-transparent"></div>
        </div>

        <div className="px-4 sm:px-8 pb-8">
          {/* Profile Header Row */}
          <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-end gap-6 -mt-4 sm:-mt-6 mb-8 sm:mb-6">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="p-1.5 bg-white rounded-[2rem] sm:rounded-[2rem] shadow-xl ring-4 ring-white">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-[1.6rem] overflow-hidden border border-slate-100 flex items-center justify-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-indigo-600/20">{(user?.name || 'U').charAt(0)}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-1.5 bg-slate-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[1.6rem] cursor-pointer backdrop-blur-md"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[8px] font-black uppercase tracking-wider">Update</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
 
            {/* Name & Meta */}
            <div className="flex-1 pb-1 w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-3">
                <div className="flex flex-col items-center sm:items-start w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 shrink-0">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none truncate max-w-[280px] sm:max-w-md">{user?.name}</h2>
                    <div className="flex gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                        <BusinessIcon className="w-3.5 h-3.5" />
                        {user?.businessType || 'Organization'}
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        stats?.reputationTier === 'Platinum' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-md shadow-indigo-100' :
                        stats?.reputationTier === 'Gold' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-md shadow-amber-100' :
                        stats?.reputationTier === 'Silver' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        <Award className="w-3.5 h-3.5" />
                        {stats?.reputationTier || 'Bronze'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-3">
                    {user?.availability && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                        user.availability.status === 'Open for Referrals' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        user.availability.status === 'Limited Capacity' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        user.availability.status === 'On Vacation' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {user.availability.status === 'Open for Referrals' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {user.availability.status === 'Limited Capacity' && <Clock className="w-3.5 h-3.5" />}
                        {user.availability.status === 'On Vacation' && <Palmtree className="w-3.5 h-3.5" />}
                        {user.availability.status === 'Not Accepting Referrals' && <Slash className="w-3.5 h-3.5" />}
                        {user.availability.status}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-400 font-bold text-[11px] sm:text-xs">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {user?.location || 'Global Base'}
                    </p>
                    <div className="hidden sm:block w-1 h-1 bg-slate-200 rounded-full"></div>
                    <p className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      {user?.category || 'Lead Industry'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full sm:w-auto bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.15em] italic"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row — BNI Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-5 border-y border-slate-100">
            {[
              { label: 'Attendance', val: `${stats.attendanceRate}%`, icon: UserCheck, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
              { label: 'Conv. Rate', val: `${Math.round((stats.dealsClosed / (stats.referralsGiven + stats.referralsReceived || 1)) * 100)}%`, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              { label: 'Given', val: stats.referralsGiven, icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
              { label: 'Received', val: stats.referralsReceived, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
              { label: 'Successes', val: stats.dealsClosed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { label: 'Business Vol.', val: `₹${(stats.revenueImpact / 1000).toFixed(1)}K`, icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${stat.border} ${stat.bg} group hover:shadow-sm transition-all cursor-default`}>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5">{stat.label}</p>
                  <p className={`text-sm font-black ${stat.color} tracking-tight`}>{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Full-Width: Executive Summary */}
          <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-100 mt-5 w-full">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Executive Summary
            </h4>
            <p className="text-slate-600 font-medium leading-relaxed text-[13px] italic">
              {user?.description || "No mission statement provided. Clearly defining your business goals helps other members identify perfect referral opportunities for you."}
            </p>
          </div>

          {/* Full-Width Centerpiece: Professional Spotlight */}
          <div className="mt-8 w-full max-w-full">
            <div className="bg-white rounded-[2.5rem] border border-slate-100/80 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(79,70,229,0.08)] transition-all duration-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6 sm:px-8 pt-8 pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] grow-0 shrink-0">
                    <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight italic">Professional Spotlight</h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 flex items-center gap-2">
                       <Sparkles className="w-3 h-3 text-indigo-400" /> Elevator pitch · Member intro
                    </p>
                  </div>
                </div>
                {user?.portfolioVideo && (
                  <button 
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full sm:w-auto group/btn relative flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-950 text-slate-600 hover:text-white rounded-full transition-all duration-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-slate-950 shadow-sm"
                  >
                    <RefreshCcw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-700" />
                    <span>Replace Video</span>
                  </button>
                )}
              </div>
              
              <div className="px-6 sm:px-8 pb-8 w-full">
                <div className="bg-slate-50/50 p-2 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100/50">
                  {user?.portfolioVideo ? (
                    <div className="relative rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden aspect-video bg-slate-950 shadow-2xl group/video w-full">
                      <video 
                        ref={videoRef}
                        src={user.portfolioVideo} 
                        className="w-full h-full object-cover" 
                        controlsList="nodownload"
                        playsInline
                        onPlay={() => {
                          const overlay = document.getElementById('video-overlay');
                          if (overlay) overlay.style.opacity = '0';
                        }}
                        onPause={() => {
                          const overlay = document.getElementById('video-overlay');
                          if (overlay) overlay.style.opacity = '1';
                        }}
                      />
                      
                      {/* Play Overlay */}
                      <div 
                        id="video-overlay"
                        className="absolute inset-0 bg-slate-950/20 group-hover/video:bg-slate-950/40 transition-all duration-500 flex items-center justify-center cursor-pointer pointer-events-none"
                      >
                         <button 
                           onClick={() => videoRef.current?.play()}
                           className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover/video:scale-100 transition-all duration-500 pointer-events-auto"
                         >
                           <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 fill-white/20" />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full py-12 sm:py-24 rounded-[1.5rem] sm:rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-6 group/upload hover:bg-indigo-50/30 hover:border-indigo-300 transition-all duration-500 cursor-pointer" 
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 text-slate-300 group-hover/upload:text-indigo-600 group-hover/upload:bg-white group-hover/upload:scale-110 transition-all duration-500">
                        <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <div className="text-center max-w-sm px-6">
                        <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight italic mb-2">Pitch Video Missing</h4>
                        <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">Illuminate your professional journey. Upload a pitch video to skyrocket conversion and trust.</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}
                        className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all duration-500 flex items-center gap-3"
                      >
                        <Plus className="w-4 h-4" />
                        Init Cloud Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
            </div>
          </div>

          {/* Main Two-Column Grid: Left stacks Services + Referrals, Right has Ledger */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 mt-5 items-start">

            {/* Left Column: Business Services + Ideal Referrals stacked */}
            <div className="lg:col-span-8 space-y-5 order-2 lg:order-1 w-full">

              {/* Business Services */}
              <div>
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> Business Services
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user?.services && user.services.length > 0 ? (
                    user.services.map((service: any, idx: number) => (
                      <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h5 className="font-black text-slate-900 text-sm tracking-tight">{service.name}</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-11">{service.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center gap-4">
                      <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-700 italic mb-0.5">No services added yet</p>
                        <p className="text-[10px] text-slate-500 italic">Add your services in "Edit Profile" to attract better referrals.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ideal Referrals */}
              <div>
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Ideal Referrals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user?.idealReferrals && user.idealReferrals.length > 0 ? (
                    user.idealReferrals.map((ref: any, idx: number) => (
                      <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-100 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                              <Users className="w-4 h-4" />
                            </div>
                            <h5 className="font-black text-slate-900 text-sm tracking-tight">{ref.target}</h5>
                          </div>
                          {ref.industry && (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100">{ref.industry}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-11">{ref.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center gap-4">
                      <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-700 italic mb-0.5">No ideal referral targets defined</p>
                        <p className="text-[10px] text-slate-500 italic">Help the network connect you with the right clients.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Ledger Status only — stays pinned to 4-col width */}
            <div className="lg:col-span-4 order-1 lg:order-2 w-full">
              <div className="bg-slate-950 p-5 rounded-[1.75rem] shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 to-transparent pointer-events-none"></div>
                <h4 className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Ledger Status
                </h4>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] font-bold italic">Active Plan</span>
                    <span className="text-[7px] font-black text-white px-2.5 py-1 bg-indigo-600 rounded-full uppercase tracking-widest">Enterprise Pro</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] font-bold italic">Activity Rebate</span>
                    <span className="text-emerald-400 font-black text-[11px]">₹{currentDiscount}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Net Due</p>
                      <p className="text-2xl font-black text-white tracking-tighter italic">₹{finalBill}</p>
                    </div>
                    <button 
                      onClick={() => setIsPaymentOpen(true)}
                      className="px-4 py-2 bg-white text-slate-950 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-indigo-50 transition-all"
                    >
                      Settle
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoRenew(!autoRenew)}
                  className={`w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${
                    autoRenew 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <RefreshCcw className={`w-3 h-3 ${autoRenew ? 'animate-spin-slow' : ''}`} />
                  {autoRenew ? 'Auto-Sync On' : 'Enable Auto-Sync'}
                </button>
              </div>
            </div>

          </div>

          {/* Row 3: Dividend Trail + Growth Engine — Equal 2-col */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <div className="bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-6 w-full h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Referral Engine</h3>
                      <p className="text-xl font-black text-emerald-600 tracking-tight italic">
                        {user?.walletBalance ? `₹${user.walletBalance.toLocaleString()}` : '₹0'} <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase not-italic">Wallet</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-[1.25rem] border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Your Unique Link</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 truncate shadow-inner">
                      {window.location.origin}/register?ref={user?.referralCode || 'PENDING'}
                    </div>
                    <button 
                      onClick={() => handleCopy(`${window.location.origin}/register?ref=${user?.referralCode}`, 'refLink')}
                      className={`p-2.5 rounded-xl text-white transition-all shadow-md ${copiedField === 'refLink' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-950 hover:bg-indigo-600 shadow-slate-950/20'}`}
                      title={copiedField === 'refLink' ? "Copied!" : "Copy Referral Link"}
                    >
                      {copiedField === 'refLink' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {user?.referredBy && (
                    <p className="text-[9px] text-slate-400 font-bold mt-3">Referred by: {user.referredBy}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Network Invites</p>
                    <p className="text-sm font-black text-slate-800">
                      {stats.referralsGiven || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Reward Per Join</p>
                    <p className="text-sm font-black text-amber-500">+ ₹50</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth Engine</h3>
                    <p className="text-xl font-black text-indigo-600 tracking-tight italic">₹{(stats.revenueImpact / 100000).toFixed(1)}L</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">Generated</p>
                  <p className="text-sm font-black text-slate-800">₹{(stats.revenueImpact || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">Active Deals</p>
                  <p className="text-sm font-black text-slate-800">{stats.activeReferrals || 0}</p>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">Closed Deals</p>
                  <p className="text-sm font-black text-slate-800">{stats.closedDeals || 0}</p>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">Win Rate</p>
                  <p className="text-sm font-black text-emerald-600">
                    {stats.closedDeals && stats.referralPoints ? Math.round((stats.closedDeals / stats.referralPoints) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="h-24 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.analytics.length > 0 ? stats.analytics : [
                    {month: 'Jan', projectRevenue: 0},
                    {month: 'Feb', projectRevenue: 0},
                    {month: 'Mar', projectRevenue: 0},
                    {month: 'Apr', projectRevenue: 0},
                    {month: 'May', projectRevenue: 0},
                    {month: 'Jun', projectRevenue: 0}
                  ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }} dy={10} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="projectRevenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Bottom Row: Verification & Public Presence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
            {[
              { label: 'GSTIN Protocol', val: user?.gstNumber, field: 'gst' },
              { label: 'Asset PAN', val: user?.panNumber, field: 'pan' }
            ].map((item) => (
              <div key={item.field} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-2.5 mb-3">
                  {item.field === 'gst' ? (
                    <Fingerprint className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                  )}
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 tracking-[0.08em] text-[11px] uppercase truncate">{item.val || '— PENDING —'}</span>
                  {item.val && (
                    <button 
                      onClick={() => handleCopy(item.val!, item.field)}
                      className="p-1.5 bg-white hover:bg-indigo-50 rounded-lg text-slate-300 hover:text-indigo-600 transition-all ml-3 border border-slate-100"
                    >
                      {copiedField === item.field ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Globe className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Public Presence</h5>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mb-4">
                  Share your profile link for external introductions.
                </p>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 group transition-colors"
              >
                Share Identity Link <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Sharing Protocol Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-sm rounded-[4rem] shadow-2xl p-12 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">Identity Link</h2>
                <p className="text-xs text-slate-400 font-bold mt-2 tracking-tight">Expand your ripple effect.</p>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                className="p-4 bg-slate-50 text-slate-300 rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-12">
               <label className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em] ml-2">Secure Link</label>
               <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border-2 border-slate-50">
                 <span className="text-xs font-mono font-black text-indigo-600 truncate mr-6 italic lowercase">xoon.io/p/{userId}</span>
                 <button 
                   onClick={() => handleCopy(`https://xoon.io/profile/${userId}`, 'shareLink')}
                   className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all"
                 >
                   {copiedField === 'shareLink' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center px-2">
              {[
                { icon: Twitter, color: 'text-sky-500 bg-sky-50', platform: 'whatsapp', label: 'WhatsApp' },
                { icon: Linkedin, color: 'text-blue-600 bg-blue-50', platform: 'linkedin', label: 'LinkedIn' },
                { icon: Mail, color: 'text-rose-500 bg-rose-50', platform: 'email', label: 'Email' }
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => handleShare(item.platform as any)}
                  className="space-y-3 group"
                >
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto transition-all group-hover:scale-110 shadow-sm group-hover:rotate-6`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Control Panel Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-24">
            <div className="p-12">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSettingsView('MAIN')}
                    className={`p-3 rounded-2xl transition-all ${settingsView === 'MAIN' ? 'hidden' : 'bg-slate-50'}`}
                  >
                    <ChevronRight className="w-6 h-6 text-slate-400 rotate-180" />
                  </button>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic">
                    {settingsView === 'MAIN' ? 'Vault Settings' : settingsView === 'PASSWORD' ? 'Security Core' : 'Alert Node'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)} 
                  className="p-4 bg-slate-50 text-slate-300 rounded-[1.5rem] hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {settingsView === 'MAIN' ? (
                <div className="space-y-3">
                  {[
                    { id: 'notif', label: 'Push Intelligence', icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-50/50', view: 'NOTIF' },
                    { id: 'profile', label: 'Profile Settings', icon: Settings, color: 'text-blue-500', bg: 'bg-blue-50/50', view: 'EDIT_PROFILE' },
                    { id: 'security', label: 'Cryptography Keys', icon: Lock, color: 'text-amber-500', bg: 'bg-amber-50/50', view: 'PASSWORD' },
                  ].map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        if (item.view === 'EDIT_PROFILE') {
                          setIsSettingsModalOpen(false);
                          setIsEditModalOpen(true);
                        } else {
                          setSettingsView(item.view as any);
                        }
                      }}
                      className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-50"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <span className="font-black text-slate-900 tracking-tight text-base italic">{item.label}</span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-100 group-hover:text-slate-900 transition-all" />
                    </div>
                  ))}

                  <div className="pt-12 border-t border-slate-50 mt-10">
                    <button 
                      onClick={onSignOut}
                      className="w-full flex items-center gap-6 p-6 bg-rose-50/50 rounded-[2rem] text-rose-600 transition-all font-black text-xs uppercase tracking-[0.3em] shadow-sm hover:shadow-xl hover:bg-rose-50"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-rose-400">
                        <LogOut className="w-7 h-7" />
                      </div>
                      <span>Execute Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : settingsView === 'PASSWORD' ? (
                <form onSubmit={handlePasswordUpdate} className="space-y-10 animate-in slide-in-from-right-12">
                  <div className="space-y-6">
                    {passwordError && (
                      <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black flex items-center gap-3">
                        <AlertCircle className="w-4 h-4" />
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[11px] font-black flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4" />
                        Successfully updated security keys.
                      </div>
                    )}
                    <div className="p-7 bg-slate-50 rounded-[2rem] border border-slate-100 focus-within:border-indigo-200 transition-colors">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-3">Legacy Hash (Current Password)</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full bg-transparent border-none outline-none font-mono text-2xl tracking-[0.5em]"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="p-7 bg-white rounded-[2rem] border-2 border-slate-100 focus-within:border-indigo-600 transition-all">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-3">Fresh Signature (New Password)</label>
                      <input 
                        type="password" 
                        placeholder="Define new key" 
                        className="w-full bg-transparent border-none outline-none font-black text-base italic tracking-tight"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    
                    {/* Strength visual feedback */}
                    {passwordForm.newPassword && (
                      <div className="px-4 space-y-3">
                        <div className="flex gap-1 h-1">
                          {[1,2,3].map(lvl => {
                            const str = getPasswordStrength(passwordForm.newPassword);
                            const active = str >= lvl;
                            let color = 'bg-slate-100';
                            if (active) {
                              if (str === 1) color = 'bg-rose-500';
                              else if (str === 2) color = 'bg-amber-500';
                              else color = 'bg-emerald-500';
                            }
                            return <div key={lvl} className={`flex-1 rounded-full ${color} transition-all duration-500`} />;
                          })}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: '8+ chars', met: passwordForm.newPassword.length >= 8 },
                            { label: 'Upper', met: /[A-Z]/.test(passwordForm.newPassword) },
                            { label: 'Lower', met: /[a-z]/.test(passwordForm.newPassword) },
                            { label: 'Number', met: /[0-9]/.test(passwordForm.newPassword) },
                            { label: 'Special', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) }
                          ].map((req, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${req.met ? 'text-slate-600' : 'text-slate-300'}`}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-7 bg-slate-50 rounded-[2rem] border border-slate-100 focus-within:border-indigo-200 transition-colors">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-3">Sync Signature (Confirm New Password)</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full bg-transparent border-none outline-none font-mono text-2xl tracking-[0.5em]"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 italic"
                  >
                    {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5" /> Update Cryptography</>}
                  </button>
                </form>
              ) : (
                <div className="p-12 text-center animate-in slide-in-from-right-12">
                   <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                     <Bell className="w-12 h-12 text-indigo-400 animate-bounce" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">Alert Nodes</h3>
                   <p className="text-sm text-slate-400 font-bold mt-4 leading-relaxed italic">Configure how the Hub synchronizes with your device for critical referrals.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Tuning Modal - High Performance */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-950 italic tracking-tight">Edit Profile</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Updating your network footprint</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <form onSubmit={handleUpdateProfile} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-10">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Brand Identity (Name)</label>
                  <input 
                    required
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Operational Node (Location)</label>
                  <input 
                    required
                    type="text" 
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Primary Category</label>
                  <input 
                    type="text" 
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Lead Strategist</label>
                  <input 
                    type="text" 
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({...editForm, ownerName: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Mission Statement (Bio)</label>
                <textarea 
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all resize-none"
                  placeholder="Describe your business mission..."
                />
              </div>

              {/* Status Section */}
              <div className="space-y-5 pt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Network Availability</label>
                <div className="flex flex-wrap gap-3">
                  {['Open for Referrals', 'Limited Capacity', 'Not Accepting Referrals', 'On Vacation'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditForm({...editForm, availability: {...editForm.availability, status}})}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        editForm.availability.status === status
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Services</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {editForm.services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{s.description}</p>
                      </div>
                      <button type="button" onClick={() => removeService(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <div className="sm:col-span-10 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Service Title..."
                      value={editForm.newService.name}
                      onChange={(e) => setEditForm({...editForm, newService: {...editForm.newService, name: e.target.value}})}
                      className="w-full p-3 bg-white border border-transparent rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600/10"
                    />
                    <input 
                      type="text" 
                      placeholder="Service description..."
                      value={editForm.newService.description}
                      onChange={(e) => setEditForm({...editForm, newService: { ...editForm.newService, description: e.target.value}})}
                      className="w-full p-3 bg-white border border-transparent rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addService}
                    className="sm:col-span-2 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors py-3 sm:py-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-4 pt-4 pb-20 sm:pb-0">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Search Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {editForm.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(i)} className="text-white/50 hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add tag..."
                      value={editForm.newKeyword}
                      onChange={(e) => setEditForm({...editForm, newKeyword: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="w-28 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black outline-none focus:bg-white focus:border-indigo-600 transition-all"
                    />
                    <button type="button" onClick={addKeyword} className="bg-slate-200 text-slate-600 p-2.5 rounded-xl hover:bg-slate-300 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Action Bar for Mobile */}
              <div className="fixed sm:relative bottom-0 left-0 right-0 p-4 sm:p-0 bg-white/80 backdrop-blur-lg sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex gap-4 pt-6 mt-10">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-2xl transition-all"
                >
                  Save Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        baseAmount={baseMembershipFee}
        discount={currentDiscount}
        onSuccess={handlePaymentSuccess}
      />

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Profile;
