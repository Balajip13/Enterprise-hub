import React, { useState } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Globe, 
  Zap,
  CheckCircle2,
  Building2,
  ChevronRight,
  X,
  Loader2,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

interface ChapterSelectionProps {
  user: any;
  onOnboardingComplete: (updatedUser: any) => void;
  onSignOut: () => void;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const ChapterSelection: React.FC<ChapterSelectionProps> = ({ user, onOnboardingComplete, onSignOut }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'MEMBER' | 'CHAPTER_LEAD'>('MEMBER');
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoadingChapters(true);
        const token = localStorage.getItem('token');
        const response = await apiFetch(`${API_BASE}/chapters/active`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
          throw new Error('Failed to fetch chapters from backend');
        }
        const data = await response.json();
        setChapters(data.data || []);
      } catch (err: any) {
        console.error('Error fetching chapters:', err);
        setError('Failed to load active chapters.');
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, []);

  const filteredChapters = React.useMemo(() => {
    if (role === 'CHAPTER_LEAD' && user?.chapter) {
      return chapters.filter(c => c.name.toLowerCase() === user.chapter.toLowerCase());
    }
    return chapters;
  }, [chapters, role, user?.chapter]);

  const handleContinue = async () => {
    if (!selectedChapter) {
      setError('Please select a chapter to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE}/auth/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          role: role,
          chapter: selectedChapter.name,
          chapterLocation: selectedChapter.location
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Registration payload failed: Invalid server response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Onboarding failed');
      }

      onOnboardingComplete(data.user);

    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Server connection failed' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear authentication data as requested
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Perform navigation/signout logic
      onSignOut();
      
      // Force redirect to login for session safety as requested
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden">

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[600px] md:w-[90%] lg:max-w-[600px] bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-6 sm:p-10 md:p-12 relative">
          <button
            onClick={handleLogout}
            className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 text-slate-500 hover:text-red-600 rounded-xl font-bold text-xs md:text-sm transition-all border border-transparent hover:border-red-100 hover:bg-red-50 group z-10"
          >
            <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <div className="text-center mb-8 md:mb-10 mt-6 sm:mt-0">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20 text-xl md:text-2xl font-black italic">
              X
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Chapter Selection</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Choose your primary networking node.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in zoom-in-95">
              <X className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-8 md:mb-10">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Assigned Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRole('MEMBER')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                  role === 'MEMBER' 
                    ? 'border-indigo-600 bg-indigo-50/30' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${
                  role === 'MEMBER' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-black text-sm ${role === 'MEMBER' ? 'text-indigo-600' : 'text-slate-600'}`}>Member</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default Level</p>
                </div>
                {role === 'MEMBER' && <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
              </button>

              <button
                onClick={() => setRole('CHAPTER_LEAD')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                  role === 'CHAPTER_LEAD' 
                    ? 'border-indigo-600 bg-indigo-50/30' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${
                  role === 'CHAPTER_LEAD' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-black text-sm ${role === 'CHAPTER_LEAD' ? 'text-indigo-600' : 'text-slate-600'}`}>Chapter Lead</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Leadership Role</p>
                </div>
                {role === 'CHAPTER_LEAD' && <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
              </button>
            </div>
          </div>

          {/* Chapter Selection */}
          <div className="mb-10 md:mb-12">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Chapters</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingChapters ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searching Nodes...</p>
                </div>
              ) : filteredChapters.length > 0 ? (
                filteredChapters.map((chapter) => (
                  <button
                    key={chapter._id}
                    onClick={() => setSelectedChapter(chapter)}
                    className={`w-full p-4 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all text-left flex items-start sm:items-center gap-4 sm:gap-6 ${
                      selectedChapter?._id === chapter._id 
                        ? 'border-indigo-600 bg-indigo-50/30' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-100 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all ${
                      selectedChapter?._id === chapter._id 
                        ? 'bg-indigo-600 text-white shadow-indigo-600/20' 
                        : 'bg-white text-slate-400'
                    }`}>
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-black text-base sm:text-lg truncate ${selectedChapter?._id === chapter._id ? 'text-indigo-600' : 'text-slate-900'}`}>
                        {chapter.name}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 font-bold text-slate-400 text-[10px] sm:text-xs">
                        <span className="flex items-center gap-1.5 uppercase tracking-widest truncate">
                          <MapPin className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                          {chapter.location || chapter.city}
                        </span>
                        <span className="hidden sm:block w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="flex items-center gap-1.5 uppercase tracking-widest">
                          <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          {chapter.nodeCount || 0} Nodes
                        </span>
                      </div>
                    </div>
                    {selectedChapter?._id === chapter._id ? (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white mt-1 sm:mt-0">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 flex-shrink-0 mt-1 sm:mt-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="bg-slate-50 p-10 md:p-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-200 shadow-sm">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h4 className="text-slate-900 font-black mb-1">No active chapters available.</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Check back later for new nodes.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={loading || !selectedChapter}
            className={`w-full h-14 md:h-16 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              selectedChapter 
                ? 'bg-slate-950 text-white hover:bg-slate-900 shadow-slate-950/20' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>

        {/* Footer Metrics */}
        <div className="bg-slate-50 p-6 md:p-8 flex items-center justify-center gap-4 sm:gap-8 border-t border-slate-100">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verified</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="w-5 h-5 text-indigo-500" />
            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Global</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Instant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterSelection;
