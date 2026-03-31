
import React from 'react';
import { apiFetch } from '../services/apiService';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  RefreshCcw, 
  Calendar, 
  BarChart3, 
  BellRing, 
  Settings,
  LogOut,
  ChevronRight,
  MessageSquare,
  CreditCard,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange, onSignOut }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'chapters', label: 'Chapters', icon: Layers },
    { id: 'referrals', label: 'Referrals', icon: RefreshCcw },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: MessageSquare },
  ];

  const [supportCount, setSupportCount] = React.useState(0);

  React.useEffect(() => {
    const fetchSupportCount = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        const token = localStorage.getItem('token');
        const response = await apiFetch(`${apiUrl}/admin/support`);
        if (!response.ok) return;
        const data = await response.json();
        const newMessages = data.filter((msg: any) => msg.status === 'New').length;
        setSupportCount(newMessages);
      } catch (error) {
        console.error('Error fetching support count:', error);
      }
    };

    fetchSupportCount();
    const interval = setInterval(fetchSupportCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Mobile Header with Hamburger */}
      <header className="md:hidden sticky top-0 bg-slate-950 text-white p-4 flex items-center justify-between z-[60] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black italic shadow-lg">
            X
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">XOON</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-slate-900 rounded-xl text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[70] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-slate-950 text-white flex flex-col shadow-2xl z-[80] transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-indigo-500/20">
              X
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">XOON</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 bg-slate-900 rounded-xl text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar min-h-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-200 group ${
                activeTab.startsWith(tab.id)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 mr-4 transition-transform group-hover:scale-110 ${activeTab.startsWith(tab.id) ? 'text-white' : 'text-slate-500'}`} />
              <span className="font-bold text-sm">{tab.label}</span>
              {tab.id === 'support' && supportCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black border border-slate-950">
                  {supportCount}
                </span>
              )}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto border-t border-slate-900/50">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center px-6 py-4 rounded-2xl bg-slate-900 text-slate-400 hover:text-white transition-all border border-slate-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:ml-72 bg-slate-50/50">
        <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
