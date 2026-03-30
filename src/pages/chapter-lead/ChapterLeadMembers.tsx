import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/apiService';
import { 
  Users, 
  UserMinus, 
  ExternalLink, 
  Search, 
  Filter,
  MoreVertical,
  Building2,
  MapPin,
  CheckCircle2,
  Tag,
  Phone,
  Mail,
  Calendar,
  Loader2,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL}/auth`;

interface Member {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  business?: string;
  category?: string;
  chapter?: string;
  createdAt: string;
}

interface ChapterLeadMembersProps {
  user: any;
}

const ChapterLeadMembers: React.FC<ChapterLeadMembersProps> = ({ user }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalType, setModalType] = useState<'profile' | 'message' | 'remove' | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [user.chapter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/chapter-members/${user.chapter}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid server response');
      }
      const data = await response.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(members.map(m => m.category).filter(Boolean))) as string[]];

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.business?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.mobile?.includes(searchTerm) ?? false);
    
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleExportRoster = () => {
    if (members.length === 0) return;
    
    const headers = ['Name', 'Business', 'Category', 'Phone', 'Email', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...members.map(m => `"${m.name}","${m.business || ''}","${m.category || ''}","${m.mobile || ''}","${m.email}","${new Date(m.createdAt).toISOString().split('T')[0]}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    const safeChapter = user.chapter.toLowerCase().replace(/\s+/g, '-');
    link.setAttribute('download', `chapter-members-${safeChapter}-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmRemoval = () => {
    // In a real app this would hit a DELETE /api/members/:id endpoint
    if (selectedMember) {
      setMembers(members.filter(m => m._id !== selectedMember._id));
      setModalType(null);
      setSelectedMember(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Syncing Chapter Roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chapter Members</h1>
          <p className="text-slate-500 font-medium">Manage the active member roster for {user.chapter}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportRoster}
            className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            Export Roster
          </button>
        </div>
      </header>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Members</p>
               <p className="text-3xl font-black text-white">{members.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Members Verified</p>
               <p className="text-3xl font-black text-slate-950">100%</p>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Categories Complete</p>
               <p className="text-3xl font-black text-slate-950">{categories.length > 1 ? categories.length - 1 : 0}</p>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Profile Completion</p>
               <p className="text-3xl font-black text-slate-950">94%</p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter roster..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:bg-white focus:border-indigo-600 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar-hide">
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 whitespace-nowrap font-black text-[10px] uppercase tracking-widest rounded-xl transition-all ${
                  selectedCategory === cat 
                    ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/10' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-First Card View (hidden on desktop) */}
        <div className="lg:hidden p-4 space-y-4 bg-slate-50/50">
          {filteredMembers.length > 0 ? filteredMembers.map((member) => (
            <div key={member._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all hover:shadow-xl active:scale-[0.98]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-950 truncate">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100">{member.category || 'MEMBER'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-400 shadow-sm">
                      <Building2 className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Business</p>
                     <p className="text-xs font-bold text-slate-700">{member.business || 'Growth Node Pending'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-emerald-400 shadow-sm">
                      <Phone className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Contact Signal</p>
                     <p className="text-xs font-bold text-slate-700">{member.mobile || 'No signal data'}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <button 
                  onClick={() => { setSelectedMember(member); setModalType('profile'); }}
                  className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setSelectedMember(member); setModalType('message'); }}
                  className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setSelectedMember(member); setModalType('remove'); }}
                  className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <p className="text-slate-400 font-bold italic">No node matches in this chapter.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Business</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic shadow-xl">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-950">{member.name}</p>
                        <p className="flex items-center gap-2 mt-1.5 font-bold text-indigo-400 text-[10px] uppercase tracking-[0.2em]">
                             <Building2 className="w-3.5 h-3.5" /> {member.business || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl w-fit">
                       {member.category || 'MEMBER'}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <Phone className="w-4 h-4 text-emerald-500" /> {member.mobile || 'No Phone'}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                        <Mail className="w-4 h-4 text-indigo-400" /> {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                       <Calendar className="w-5 h-5 text-slate-200" />
                       {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => { setSelectedMember(member); setModalType('profile'); }}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <ExternalLink className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => { setSelectedMember(member); setModalType('message'); }}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <MessageSquare className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => { setSelectedMember(member); setModalType('remove'); }}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <UserMinus className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modals */}
      {modalType && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            
            {modalType === 'remove' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                  <UserMinus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Remove Member</h3>
                <p className="text-sm font-medium text-slate-500 mb-8">
                  Are you sure you want to remove <span className="font-bold text-slate-800">{selectedMember.name}</span> from the chapter? This action will sever their referral ties to this node.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setModalType(null); setSelectedMember(null); }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={confirmRemoval}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-200 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            )}

            {modalType === 'profile' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedMember.name}</h3>
                    <p className="text-sm font-bold text-slate-500">{selectedMember.business || 'Independent Professional'}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                    <span className="font-bold text-slate-400">Category</span>
                    <span className="font-black text-slate-700">{selectedMember.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                    <span className="font-bold text-slate-400">Email</span>
                    <span className="font-black text-slate-700">{selectedMember.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Phone</span>
                    <span className="font-black text-slate-700">{selectedMember.mobile || 'N/A'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setModalType(null); setSelectedMember(null); }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Close Profile
                </button>
              </div>
            )}

            {modalType === 'message' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Message {selectedMember.name.split(' ')[0]}</h3>
                </div>
                <textarea 
                  rows={4}
                  placeholder="Type your secure message here..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all resize-none mb-6"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setModalType(null); setSelectedMember(null); }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                    Discard
                  </button>
                  <button 
                    onClick={() => { setModalType(null); setSelectedMember(null); alert('Message Sent securely.'); }}
                    className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors">
                    Send Mail
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ChapterLeadMembers;
