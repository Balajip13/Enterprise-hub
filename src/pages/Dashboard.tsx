
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Lock, 
  Gift, 
  Tag,
  Quote,
  Sparkles,
  ArrowRight,
  Target,
  Calendar,
  Users,
  IndianRupee,
  PlusCircle,
  ExternalLink,
  Clock,
  User,
  UserCheck,
  Trophy,
  Clock as ClockIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BUSINESS_QUOTES } from '../constants';
import { apiService } from '../services/apiService';
import { getLocalStorage } from '../utils/storageHelper';

interface UserDashboardProps {
  user: any;
  onTabChange?: (tab: string) => void;
}

const Dashboard: React.FC<UserDashboardProps> = ({ user, onTabChange }) => {
  const [stats, setStats] = useState<any>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [data, leaderboardData] = await Promise.all([
          apiService.getDashboardStats(user?.id),
          apiService.getLeaderboard()
        ]);
        setStats(data.stats);
        setUpcomingMeetings(data.upcomingMeetings);
        setRecentReferrals(data.recentReferrals);
        setLeaderboard(leaderboardData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const dailyQuote = useMemo(() => {
    const day = new Date().getDate();
    return BUSINESS_QUOTES[day % BUSINESS_QUOTES.length];
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] text-center font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Hi, {user?.name?.split(' ')[0] || 'User'} <span className="text-indigo-600">👋</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">Here's what's happening in your business circle.</p>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-3 px-5 py-2.5 bg-white shadow-sm border border-slate-100 rounded-2xl self-center md:self-auto">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reputation Tier</p>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight text-white ${
                stats?.reputationTier === 'Platinum' ? 'bg-indigo-600 shadow-lg shadow-indigo-200' :
                stats?.reputationTier === 'Gold' ? 'bg-amber-500 shadow-lg shadow-amber-200' :
                stats?.reputationTier === 'Silver' ? 'bg-slate-400 shadow-lg shadow-slate-200' :
                'bg-emerald-500 shadow-lg shadow-emerald-200' // Bronze/Default
              }`}>
                {stats?.reputationTier || 'Bronze'}
              </div>
              <p className="text-sm font-bold text-slate-800">System Verified</p>
            </div>
          </div>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-0">
        <button 
          onClick={() => {
            if (user?.status !== 'Approved') return;
            onTabChange?.('new-referral');
          }}
          disabled={user?.status !== 'Approved'}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl shadow-xl transition-all font-black text-[10px] uppercase tracking-widest ${
            user?.status === 'Approved' ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <PlusCircle className="w-6 h-6" />
          Give Referral
        </button>
        <button 
          onClick={() => {
            if (user?.status !== 'Approved') return;
            onTabChange?.('referrals');
          }}
          disabled={user?.status !== 'Approved'}
          className={`flex flex-col items-center justify-center gap-2 p-4 border border-slate-100 rounded-2xl shadow-sm transition-all font-black text-[10px] uppercase tracking-widest ${
            user?.status === 'Approved' ? 'bg-white text-slate-700 hover:shadow-md' : 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'
          }`}
        >
          <Target className={`w-6 h-6 ${user?.status === 'Approved' ? 'text-indigo-600' : 'text-slate-300'}`} />
          My Referrals
        </button>
        <button 
          onClick={() => onTabChange?.('members')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white text-slate-700 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <Users className="w-6 h-6 text-indigo-600" />
          Members
        </button>
        <button 
          onClick={() => onTabChange?.('meetings')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white text-slate-700 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <Calendar className="w-6 h-6 text-indigo-600" />
          Meetings
        </button>
        <button 
          onClick={() => onTabChange?.('profile')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white text-slate-700 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <User className="w-6 h-6 text-indigo-600" />
          Profile
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
        {[
          { label: 'Referrals Given', val: stats?.referralsGiven || 0, icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Referrals Received', val: stats?.referralsReceived || 0, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Business Volume', val: `₹${(stats?.closedBusiness || 0).toLocaleString('en-IN')}`, icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pipeline Deals', val: stats?.pipelineCount || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Success Rate', val: `${stats?.successRate || 0}%`, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Attendance Rate', val: `${stats?.attendanceRate || 0}%`, icon: UserCheck, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { label: 'Avg Deal Value', val: `₹${(stats?.avgDealValue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Upcoming Meetings', val: stats?.upcomingMeetingsCount || 0, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-4`}>
              <m.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-2xl font-black ${m.color === 'text-indigo-600' ? 'text-slate-950' : m.color}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 sm:px-0">
        {/* Recent Referrals Section */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Recent Referrals
            </h3>
            <button 
              onClick={() => onTabChange?.('referrals')}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full min-w-[500px] px-6">
              <thead>
                <tr className="text-left text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-6 sm:px-0 pb-4">Referrer</th>
                  <th className="pb-4">Recipient</th>
                  <th className="pb-4">Business</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentReferrals.length > 0 ? (
                  recentReferrals.map((ref) => (
                    <tr key={ref._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 sm:px-0 py-4 font-bold text-sm text-slate-700">{ref.referrer?.name || 'Partner'}</td>
                      <td className="py-4 font-bold text-sm text-slate-700">{ref.recipient?.name || 'Member'}</td>
                      <td className="py-4 font-bold text-sm text-slate-700">{ref.businessType || 'General'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight 
                          ${ref.status === 'Closed' ? 'bg-emerald-100 text-emerald-600' : 
                            ref.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                            ref.status === 'Rejected' ? 'bg-red-100 text-red-600' : 
                            'bg-indigo-100 text-indigo-600'}`}>
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No recent referrals</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

          <div className="bg-slate-950 p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <h3 className="font-black text-white flex items-center gap-2 mb-8 relative z-10">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Next Meetings
            </h3>
  
            <div className="space-y-6 relative z-10">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
                  <div key={meeting._id} className="group cursor-pointer">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                      {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-white font-bold group-hover:text-indigo-400 transition-colors">{meeting.title}</p>
                    <p className="text-slate-500 text-xs font-medium">{meeting.location}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">No upcoming meetings scheduled for your chapter.</p>
              )}
            </div>
  
            <button 
              onClick={() => onTabChange?.('meetings')}
              className="w-full mt-10 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Check Calendar <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        {/* Daily Wisdom Section - Moved into grid */}
        <div className="md:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group shadow-sm border border-slate-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-100">
              <Quote className="w-8 h-8 fill-indigo-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-3">Daily Professional Insight</span>
              <p className="text-slate-800 font-bold italic text-base sm:text-lg leading-relaxed mb-4">
                "{dailyQuote.text}"
              </p>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">— {dailyQuote.author}</p>
            </div>
          </div>
        </div>

        {/* Top Contributors / Leaderboard Preview - Now in the right column */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
          
          <h3 className="font-black text-slate-900 flex items-center gap-2 mb-8 relative z-10">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Contributors
          </h3>

          <div className="space-y-6 relative z-10">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 italic">Top Performers Global</p>
            <div className="flex flex-col gap-5">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.name === user?.name ? 'You' : item.name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-tight ${item.activityScore >= 80 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {item.activityScore >= 90 ? 'Platinum Tier' : item.activityScore >= 75 ? 'Gold Tier' : item.activityScore >= 50 ? 'Silver Tier' : 'Bronze Tier'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{item.activityScore}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Score</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                   <p className="text-slate-400 text-xs italic">Calculating rankings...</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onTabChange?.('leaderboard')}
            className="w-full mt-8 py-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
          >
            Full Leaderboard
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
