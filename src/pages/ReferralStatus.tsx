import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Handshake, 
  TrendingUp, 
  Archive,
  User,
  IndianRupee,
  Calendar,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface Referral {
  _id: string;
  clientName: string;
  requirement: string;
  value: number;
  status: string;
  createdAt: string;
  referrer: {
    name: string;
    businessName: string;
  };
  recipient: {
    name: string;
    businessName: string;
  };
}

const STAGES = [
  { id: 'Pending', label: 'Pending', icon: Clock, color: 'bg-slate-100 text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  { id: 'Accepted', label: 'Accepted', icon: CheckCircle2, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' },
  { id: 'Followup', label: 'Followup', icon: MessageSquare, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100', dot: 'bg-purple-500' },
  { id: 'Committed', label: 'Committed', icon: Handshake, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100', dot: 'bg-orange-500' },
  { id: 'Converted', label: 'Converted', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  { id: 'Closed', label: 'Closed', icon: Archive, color: 'bg-slate-900 text-white', border: 'border-slate-800', dot: 'bg-slate-400' }
];

interface ReferralStatusProps {
  user: any;
}

const ReferralStatus: React.FC<ReferralStatusProps> = ({ user }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await apiService.getReferrals(user?.id);
        setReferrals(data);
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError('Failed to load referral pipeline. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, [user?.id]);

  const groupedReferrals = useMemo(() => {
    const groups: Record<string, Referral[]> = {
      Pending: [],
      Accepted: [],
      Followup: [],
      Committed: [],
      Converted: [],
      Closed: []
    };

    referrals.forEach(ref => {
      // Map backend 'Given' to 'Pending'
      const status = ref.status === 'Given' ? 'Pending' : ref.status;
      if (groups[status]) {
        groups[status].push(ref);
      }
    });

    return groups;
  }, [referrals]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Sync Error</h2>
        <p className="text-slate-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Referral Pipeline</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">Lifecycle tracking of your active connections.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Value</span>
              <span className="text-xs font-black text-slate-900">₹{referrals.reduce((sum, r) => sum + (r.value || 0), 0).toLocaleString('en-IN')}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 min-w-0">
        {STAGES.map(stage => {
          const columnReferrals = groupedReferrals[stage.id] || [];
          return (
            <div key={stage.id} className="min-w-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded-md ${stage.color}`}>
                    <stage.icon className="w-3 h-3" />
                  </div>
                  <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-wider truncate">{stage.label}</h2>
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {columnReferrals.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 min-h-[150px] md:min-h-[400px] bg-slate-50/40 rounded-2xl p-2 border-2 border-dashed border-slate-100/60">
                {columnReferrals.length > 0 ? (
                  columnReferrals.map(referral => (
                    <div 
                      key={referral._id}
                      onClick={() => setSelectedReferral(referral)}
                      className="group bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                          ₹{(referral.value || 0).toLocaleString('en-IN')}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${stage.dot} opacity-60`} />
                      </div>

                      <h3 className="text-[11px] font-black text-slate-900 mb-0.5 line-clamp-1">{referral.clientName}</h3>
                      <p className="text-[10px] text-slate-500 font-medium mb-3 line-clamp-1 leading-relaxed">
                        {referral.requirement}
                      </p>

                      <div className="pt-2.5 border-t border-slate-50 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-400" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-slate-700 truncate">
                              {referral.referrer?.name === user?.name ? referral.recipient?.name : referral.referrer?.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(referral.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 opacity-30">
                    <stage.icon className="w-4 h-4 text-slate-400 mb-1" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedReferral.clientName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral Details</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReferral(null)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"
              >
                <Clock className="w-5 h-5 rotate-45" /> {/* Using Clock rotated as X for better theme fit or just X if available */}
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Project Scope</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {selectedReferral.requirement}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-6">
                <div>
                   <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Deal Value</h4>
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <IndianRupee className="w-3.5 h-3.5" />
                     </div>
                     <span className="text-lg font-black text-slate-900">₹{selectedReferral.value.toLocaleString('en-IN')}</span>
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Platform Fee (5%)</h4>
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5" />
                     </div>
                     <span className="text-lg font-black text-amber-600">₹{(selectedReferral.value * 0.05).toLocaleString('en-IN')}</span>
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                      {selectedReferral.referrer?.name?.charAt(0) || 'P'}
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Referred By</p>
                      <p className="text-sm font-black text-slate-800">{selectedReferral.referrer?.name || 'Partner'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Recipient</p>
                      <p className="text-sm font-black text-slate-800">{selectedReferral.recipient?.name || 'Member'}</p>
                   </div>
                   <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black">
                      {selectedReferral.recipient?.name?.charAt(0) || 'M'}
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-4">
              <button 
                onClick={() => setSelectedReferral(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralStatus;
