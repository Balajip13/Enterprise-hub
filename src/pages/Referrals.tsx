
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Handshake, 
  X, 
  IndianRupee, 
  HeartHandshake,
  MessageCircle,
  Loader2,
  Check,
  Lock,
  ShieldCheck,
  FileUp,
  AlertTriangle,
  Star,
  MessageSquare,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { generateThankYouNote } from '../services/geminiService';

type ReferralStatus = 'Given' | 'Accepted' | 'Meeting Scheduled' | 'Committed' | 'Followup' | 'Converted' | 'Closed';

const statusColors: Record<ReferralStatus, string> = {
  Given: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-yellow-100 text-yellow-700',
  'Meeting Scheduled': 'bg-orange-100 text-orange-700',
  Committed: 'bg-indigo-100 text-indigo-700',
  Followup: 'bg-purple-100 text-purple-700',
  Converted: 'bg-green-100 text-green-700',
  Closed: 'bg-slate-100 text-slate-700',
};

const statusIcons: Record<ReferralStatus, any> = {
  Given: Clock,
  Accepted: Handshake,
  'Meeting Scheduled': Calendar,
  Committed: Lock,
  Followup: Clock,
  Converted: CheckCircle2,
  Closed: XCircle,
};

interface ReferralsProps {
  user: any;
  onNavigateToMember?: (searchTerm: string) => void;
  onAddNew?: () => void;
}

const Referrals: React.FC<ReferralsProps> = ({ user, onNavigateToMember, onAddNew }) => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ReferralStatus | 'ALL'>('ALL');
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState<ReferralStatus>('Given');
  const [editNotes, setEditNotes] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [testimonial, setTestimonial] = useState('');
  const [editValue, setEditValue] = useState('');
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeReferralForNote, setActiveReferralForNote] = useState<any | null>(null);
  const [generatedNote, setGeneratedNote] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [chapterMembers, setChapterMembers] = useState<any[]>([]);
  const [newReferral, setNewReferral] = useState({
    recipientId: '',
    clientName: '',
    clientCompany: '',
    clientPhone: '',
    email: '',
    category: '',
    requirement: '',
    value: ''
  });
  const [emailError, setEmailError] = useState('');


  const fetchReferrals = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await apiService.getReferrals(user?.id);
      setReferrals(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('Failed to load your referral log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    fetchChapterMembers();
  }, [user?.id, user?.chapter]);

  const fetchChapterMembers = async () => {
    if (!user?.chapter) return;
    try {
      const data = await apiService.getChapterMembers(user?.chapter);
      setChapterMembers(data.filter((m: any) => m._id !== user?.id));
    } catch (err) {
      console.error('Error fetching chapter members:', err);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferral.recipientId || !newReferral.clientName) {
      alert('Please select a recipient and enter a client name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newReferral.email || !emailRegex.test(newReferral.email)) {
      setEmailError('Enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await apiService.createReferral({
        referrer: user?.id,
        recipient: newReferral.recipientId,
        clientName: newReferral.clientName,
        email: newReferral.email.toLowerCase().trim(),
        clientPhone: newReferral.clientPhone,
        category: newReferral.category,
        requirement: newReferral.requirement,
        value: Number(newReferral.value) || 0,
        notes: newReferral.clientCompany ? `Company: ${newReferral.clientCompany}` : undefined,
        date: new Date().toISOString(),
        status: 'Given',
      });
      setIsNewModalOpen(false);
      setNewReferral({
        recipientId: '',
        clientName: '',
        clientCompany: '',
        clientPhone: '',
        email: '',
        category: '',
        requirement: '',
        value: ''
      });
      setEmailError('');
      await fetchReferrals();
    } catch (err) {
      console.error('Error creating referral:', err);
      alert('Failed to submit referral');
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = useMemo(() => {
    return activeFilter === 'ALL' 
      ? referrals 
      : referrals.filter(r => r.status === activeFilter);
  }, [referrals, activeFilter]);

  const handleUpdateClick = (ref: any) => {
    setSelectedReferral(ref);
    setEditStatus(ref.status);
    setEditNotes(ref.notes || '');
    setStarRating(ref.rating || 0);
    setTestimonial(ref.review || '');
    setEditValue(ref.value?.toString() || '');
  };

  const handleSaveChanges = async () => {
    if (!selectedReferral) return;
    try {
      setLoading(true);
      const updatedData: any = {
        status: editStatus,
        notes: editNotes,
        rating: editStatus === 'Converted' ? starRating : undefined,
        review: editStatus === 'Converted' ? testimonial : undefined,
        value: editStatus === 'Converted' ? Number(editValue) : undefined
      };
      await apiService.updateReferral(selectedReferral._id, updatedData);
      await fetchReferrals();
      setSelectedReferral(null);
    } catch (err) {
      console.error('Error updating referral:', err);
      alert('Failed to update referral status');
    } finally {
      setLoading(false);
    }
  };

  const openThankYouNote = async (ref: any) => {
    setActiveReferralForNote(ref);
    setIsNoteModalOpen(true);
    setIsGeneratingNote(true);
    setGeneratedNote('');
    
    try {
      const referrerName = ref.referrer?.name || 'Partner';
      const note = await generateThankYouNote(referrerName, ref.clientName, ref.requirement);
      setGeneratedNote(note);
    } catch (err) {
      setGeneratedNote('Failed to generate note. Please try again.');
    } finally {
      setIsGeneratingNote(false);
    }
  };

  if (loading && referrals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full mx-auto px-4 sm:px-6 md:px-8">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left pt-4 sm:pt-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Referral Log</h1>
          <p className="text-slate-500 font-medium text-sm">Managing business relationships within XOON.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button 
            onClick={fetchReferrals}
            className="flex-1 sm:flex-none p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 flex items-center justify-center"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex-[2] sm:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">New Referral</span>
          </button>
        </div>
      </header>

      {/* Trust Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-bold mb-1 uppercase tracking-wider">The Professional Code</p>
          Finalizing deals through XOON ensures your <span className="font-bold">Trust Score</span> increases. Transactions handled outside the platform do not qualify for benefits.
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {['ALL', 'Given', 'Accepted', 'Meeting Scheduled', 'Committed', 'Followup', 'Converted', 'Closed'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f as any)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              activeFilter === f 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-10 text-center bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold">
            {error}
          </div>
        )}

        {filteredReferrals.length > 0 ? (
          filteredReferrals.map((ref) => {
            const StatusIcon = statusIcons[ref.status as ReferralStatus] || Clock;
            const isConverted = ref.status === 'Converted';
            const isCommitted = ref.status === 'Committed';
            const isMyReferral = ref.referrer?._id === user?.id;
            
            return (
              <div key={ref._id} className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all group relative overflow-hidden">
                {(isConverted || isCommitted) && (
                  <div className="absolute top-0 right-0 p-1.5 bg-indigo-600 text-white rounded-bl-xl shadow-md z-10">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border mb-4 inline-block sm:hidden ${statusColors[ref.status as ReferralStatus] || 'border-slate-200'}`}>
                  {ref.status}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusColors[ref.status as ReferralStatus] || 'bg-slate-100'} bg-opacity-10`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950 uppercase tracking-tight text-base truncate">{ref.clientName}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10px] text-slate-500 mt-1">
                        <span className="font-bold">{new Date(ref.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="hidden sm:inline opacity-30">•</span>
                        <div className="flex items-center gap-1 font-black shrink-0">
                          {isMyReferral ? (
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase">TO: {ref.recipient?.name || 'Unknown'}</span>
                          ) : (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">FROM: {ref.referrer?.name || 'Partner'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`hidden sm:block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${statusColors[ref.status as ReferralStatus] || 'border-slate-200'}`}>
                    {ref.status}
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 italic leading-relaxed">
                  "{ref.requirement}"
                </p>

                {ref.rating && (
                  <div className="mb-4 flex items-center gap-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= ref.rating! ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold truncate italic">"{ref.review}"</p>
                  </div>
                )}

                {(isConverted || isCommitted) && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Platform Secured Deal</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Est. Share (5%)</p>
                      <p className="text-sm font-black text-slate-800">₹{(ref.value * 0.05).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-50 gap-4">
                  <div className="flex items-center justify-between sm:justify-start gap-6 w-full sm:w-auto">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Value</span>
                       <span className="font-black text-slate-900 text-base">₹{ref.value.toLocaleString('en-IN')}</span>
                    </div>
                    {(ref.status === 'Accepted' || ref.status === 'Committed') && !isMyReferral && (
                      <button 
                        onClick={() => openThankYouNote(ref)}
                        className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors"
                        title="Say Thanks"
                      >
                        <HeartHandshake className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleUpdateClick(ref)}
                    className="w-full sm:w-auto bg-slate-950 border border-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-slate-950 transition-all shadow-xl shadow-slate-950/10"
                  >
                    {isCommitted ? 'Verify Conversion' : 'Manage Lifecycle'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : !error && (
          <div className="bg-white p-20 rounded-2xl border-2 border-slate-100 border-dashed text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
              <RefreshCw className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No referrals yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm mb-8">Start building your network by creating your first referral and tracking its lifecycle.</p>
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Referral
            </button>
          </div>
        )}
      </div>

      {/* Update Lifecycle Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Referral Details</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[selectedReferral.status as ReferralStatus] || 'border-slate-200'}`}>
                    {selectedReferral.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">ID: {selectedReferral._id.slice(-8)} • {new Date(selectedReferral.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedReferral(null)} className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 pb-10">
              {/* Client Information Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Name</p>
                    <p className="text-sm font-black text-slate-900">{selectedReferral.clientName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-700">{selectedReferral.clientPhone}</p>
                      <a href={`tel:${selectedReferral.clientPhone}`} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Plus className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-700">{selectedReferral.email || 'Not Provided'}</p>
                      {selectedReferral.email && (
                        <a href={`mailto:${selectedReferral.email}`} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Category</p>
                    <p className="text-sm font-bold text-slate-700">{selectedReferral.category || 'General'}</p>
                  </div>
                </div>
              </section>

              {/* Project & Deal Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-1 h-3 bg-emerald-600 rounded-full"></span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Information</h3>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requirement / Scope</p>
                      <p className="text-sm text-slate-600 italic leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 italic">
                        "{selectedReferral.requirement}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deal Value</p>
                        <p className="text-xl font-black text-slate-950">₹{(selectedReferral.value || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          Platform Fee <ShieldCheck className="w-3 h-3" />
                        </p>
                        <p className="text-xl font-black text-indigo-600">₹{((selectedReferral.value || 0) * 0.05).toLocaleString('en-IN')}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Fixed 5% Security Share</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lifecycle Progression */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-3 bg-amber-600 rounded-full"></span>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Lifecycle</h3>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(() => {
                      const statusOrder: ReferralStatus[] = ['Given', 'Accepted', 'Meeting Scheduled', 'Committed', 'Followup', 'Converted', 'Closed'];
                      const currentIdx = statusOrder.indexOf(selectedReferral.status as ReferralStatus);
                      
                      return [
                        { s: 'Accepted', l: 'In Talks' },
                        { s: 'Meeting Scheduled', l: 'Meeting' },
                        { s: 'Committed', l: 'Agreed' },
                        { s: 'Followup', l: 'Followup' },
                        { s: 'Converted', l: 'Won' },
                        { s: 'Closed', l: 'Closed' },
                        { s: 'Rejected', l: 'Rejected' }
                      ].map((item) => {
                        const itemIdx = statusOrder.indexOf(item.s as ReferralStatus);
                        const isNext = itemIdx === currentIdx + 1 || item.s === selectedReferral.status || item.s === 'Closed' || item.s === 'Rejected';
                        const isPast = itemIdx < currentIdx && item.s !== 'Closed' && item.s !== 'Rejected';

                        return (
                          <button
                            key={item.s}
                            disabled={!isNext || isPast || loading}
                            onClick={() => setEditStatus(item.s as ReferralStatus)}
                            className={`px-3 py-3 rounded-xl text-[10px] font-black border transition-all text-center ${
                              editStatus === item.s 
                                ? `${statusColors[item.s as ReferralStatus]} border-transparent shadow-lg shadow-current/10 ring-2 ring-indigo-600/10` 
                                : (!isNext || isPast)
                                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {item.l}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {editStatus === 'Converted' && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">Final Value (₹)</label>
                          <input 
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="e.g. 50000"
                            className="w-full bg-white border border-amber-200 p-3 rounded-xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">Member Rating</label>
                          <div className="flex gap-1 pt-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} type="button" onClick={() => setStarRating(s)}>
                                <Star className={`w-5 h-5 ${s <= starRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">Professional Review</label>
                        <textarea 
                          value={testimonial}
                          onChange={(e) => setTestimonial(e.target.value)}
                          placeholder="How was the service quality?"
                          className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs h-20 resize-none outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pl-1">Confidential Notes</label>
                    <textarea 
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add private deal updates..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs h-20 resize-none outline-none focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              </section>

              <div className="flex gap-3 pt-4 shrink-0">
                <button 
                  onClick={() => setSelectedReferral(null)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                  Confirm Progression
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Referral Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">New Referral</h2>
                <p className="text-sm font-medium text-slate-500">Passing business to your chapter network.</p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateReferral} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 sm:pb-0">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Referrer</label>
                  <input type="text" value={user?.name} disabled className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Referred Member</label>
                  <div className="relative">
                    <select 
                      required
                      value={newReferral.recipientId}
                      onChange={(e) => setNewReferral({...newReferral, recipientId: e.target.value})}
                      className="w-full p-4 pr-10 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all appearance-none"
                    >
                      <option value="">Select a member...</option>
                      {chapterMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.business})</option>
                      ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Client Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="E.g. Rajesh Kumar"
                    value={newReferral.clientName}
                    onChange={(e) => setNewReferral({...newReferral, clientName: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    placeholder="Enter client email"
                    value={newReferral.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewReferral({...newReferral, email: val});
                      if (emailError) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(val)) setEmailError('');
                      }
                    }}
                    className={`w-full p-4 bg-white border ${emailError ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200'} rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`} 
                  />
                  {emailError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-tight pl-1">Enter a valid email address</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Client Company (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="E.g. RK Enterprises"
                    value={newReferral.clientCompany}
                    onChange={(e) => setNewReferral({...newReferral, clientCompany: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Client Contact</label>
                  <input 
                    type="tel" 
                    placeholder="+91 99999 00000"
                    value={newReferral.clientPhone}
                    onChange={(e) => setNewReferral({...newReferral, clientPhone: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Business Category</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Digital Marketing"
                    value={newReferral.category}
                    onChange={(e) => setNewReferral({...newReferral, category: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Expected Deal Value (₹)</label>
                  <input 
                    type="number" 
                    placeholder="50000"
                    value={newReferral.value}
                    onChange={(e) => setNewReferral({...newReferral, value: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Referral Notes / Requirement</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Tell the member what the client needs..."
                    value={newReferral.requirement}
                    onChange={(e) => setNewReferral({...newReferral, requirement: e.target.value})}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4 pb-32 sm:pb-8">
                <button 
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gemini Powered Thank You Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <HeartHandshake className="w-8 h-8" />
                  </div>
                  <button onClick={() => setIsNoteModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <h3 className="text-2xl font-black">AI Thank You Note</h3>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Generated by Google Gemini</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl relative">
                  {isGeneratingNote ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Drafting the perfect note...</p>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm leading-relaxed italic whitespace-pre-wrap">
                      {generatedNote || "Writing your note..."}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedNote);
                      alert('Copied to clipboard!');
                    }}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
                  >
                    Copy to Clipboard
                  </button>
                  <button 
                    onClick={() => openThankYouNote(activeReferralForNote)}
                    className="p-4 bg-pink-100 text-pink-600 rounded-2xl hover:bg-pink-200 transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 ${isGeneratingNote ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
