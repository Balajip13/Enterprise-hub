
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Zap, 
  Users2, 
  PieChart, 
  ArrowUpRight, 
  RefreshCcw,
  FileText,
  Building2,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { apiService, apiFetch } from '../../services/apiService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<any>(null);
  const [velocityData, setVelocityData] = useState<any>(null);
  const [retentionData, setRetentionData] = useState<any>(null);
  const [efficiencyData, setEfficiencyData] = useState<any>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [growth, velocity, retention, efficiency] = await Promise.all([
        apiService.getReferralGrowthReport(),
        apiService.getRevenueVelocityReport(),
        apiService.getMemberRetentionReport(),
        apiService.getChapterEfficiencyReport()
      ]);
      setGrowthData(growth);
      setVelocityData(velocity);
      setRetentionData(retention);
      setEfficiencyData(efficiency);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedReport = async (title: string) => {
    // 1. Call Backend Export Endpoint as requested
    const reportType = title.toLowerCase().replace(' ', '-');
    try {
      await apiFetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/admin/reports/${reportType}/export`);
    } catch (e) {
      console.error('Backend export call failed');
    }

    // 2. Generate PDF for the user
    const doc = new jsPDF();
    const now = new Date().toLocaleString();
    
    doc.setFontSize(22);
    doc.text(`Detailed Report: ${title}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated at: ${now}`, 14, 28);

    if (title === 'Referral Growth' && growthData) {
      doc.text(`Total Referrals: ${growthData.totalReferrals}`, 14, 40);
      doc.text(`Referrals This Month: ${growthData.referralsThisMonth}`, 14, 48);
      (doc as any).autoTable({
        head: [['Chapter', 'Referral Count']],
        body: growthData.topChapters.map((c: any) => [c._id, c.count]),
        startY: 55
      });
    } else if (title === 'Revenue Velocity' && velocityData) {
      doc.text(`Total Revenue: ₹${velocityData.totalRevenue.toLocaleString()}`, 14, 40);
      doc.text(`Avg Deal Value: ₹${Math.round(velocityData.avgDealValue).toLocaleString()}`, 14, 48);
      doc.text(`Avg Conversion Time: ${velocityData.avgConversionTime} Days`, 14, 56);
      doc.text(`Fastest Chapter: ${velocityData.fastestChapter}`, 14, 64);
    } else if (title === 'Member Retention' && retentionData) {
      doc.text(`Active Members: ${retentionData.activeMembers}`, 14, 40);
      doc.text(`Inactive Members: ${retentionData.inactiveMembers}`, 14, 48);
      doc.text(`Retention Rate: ${retentionData.retentionRate.toFixed(2)}%`, 14, 56);
    } else if (title === 'Chapter Efficiency' && efficiencyData) {
      (doc as any).autoTable({
        head: [['Chapter', 'Referrals', 'Conversions', 'Members', 'Efficiency']],
        body: efficiencyData.map((e: any) => [
          e.chapter, 
          e.referrals, 
          e.conversions, 
          e.memberCount, 
          `${e.efficiencyScore.toFixed(1)}%`
        ]),
        startY: 40
      });
    }

    doc.save(`${reportType}-report.pdf`);
  };

  const handleExportAll = async () => {
    try {
      const blob = await apiService.exportAllReports();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xoon-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export reports. Please try again.');
    }
  };

  const reportConfigs = [
    { 
      title: 'Referral Growth', 
      desc: 'Net deals generated per week across all nodes.', 
      icon: TrendingUp, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      metric: growthData ? `${growthData.referralsThisMonth} New` : '...',
      sub: 'This Month'
    },
    { 
      title: 'Revenue Velocity', 
      desc: 'Time taken from referral to closed deal realization.', 
      icon: Zap, 
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      metric: velocityData ? `${velocityData.avgConversionTime} Days` : '...',
      sub: 'Avg Conversion'
    },
    { 
      title: 'Member Retention', 
      desc: 'Analysis of active vs. churned membership profiles.', 
      icon: Users2, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      metric: retentionData ? `${retentionData.retentionRate.toFixed(1)}%` : '...',
      sub: 'Active Rate'
    },
    { 
      title: 'Chapter Efficiency', 
      desc: 'Performance ranking based on referral-to-deal conversion.', 
      icon: ShieldCheck, 
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      metric: efficiencyData.length > 0 ? `${efficiencyData[0].efficiencyScore.toFixed(1)}%` : '...',
      sub: 'Top Conv. Rate'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium text-sm">Deep dive into platform growth and individual chapter KPIs.</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> Export All Data
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-slate-300">
           <RefreshCcw className="w-12 h-12 animate-spin mb-4" />
           <p className="font-bold text-slate-400">Aggregating real-time metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {reportConfigs.map((report, i) => (
            <div key={i} className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
               <div className={`absolute top-0 right-0 w-40 h-40 ${report.bg} rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
               
               <div className="relative z-10">
                 <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 ${report.bg} ${report.color} rounded-[1.5rem] flex items-center justify-center`}>
                       <report.icon className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-slate-900 tracking-tight">{report.metric}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.sub}</p>
                    </div>
                 </div>

                 <h3 className="text-2xl font-black text-slate-950 mb-3">{report.title}</h3>
                 <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed max-w-xs">{report.desc}</p>
                 
                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <button 
                      onClick={() => generateDetailedReport(report.title)}
                      className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      Generate Detailed Report
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                       <ArrowUpRight className="w-4 h-4" />
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Intelligence Card */}
      {!loading && (
        <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-12">
              <div className="max-w-md">
                 <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Platform Intelligence</span>
                 </div>
                 <h2 className="text-4xl font-black mb-4 tracking-tight">Consolidated Network Audit</h2>
                 <p className="text-slate-400 font-medium leading-relaxed italic">"Growth is not just about numbers, it's about the velocity of value exchange within our nodes."</p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                 <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Volume</p>
                    <p className="text-2xl font-black">₹{((velocityData?.totalRevenue || 0) / 10000000).toFixed(2)}Cr</p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Chapters</p>
                    <p className="text-2xl font-black">{efficiencyData.length}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
