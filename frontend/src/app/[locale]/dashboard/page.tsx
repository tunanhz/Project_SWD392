"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function DashboardOverview() {
  const t = useTranslations("Dashboard");
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchDashboardData = async () => {
      try {
        // Simplified fetching: in a real app, these would be dedicated endpoints
        const response = await fetch("http://localhost:5000/api/properties");
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        
        // Mocking some stats based on real data structure for now
        // In a real production app, we would have /api/user/stats
        setStats({
          activeBids: data.filter((p: any) => p.auction?.status === 'ACTIVE').length,
          walletBalance: "$25,000",
          auctionsWon: data.filter((p: any) => p.status === 'SOLD').length,
          recentActivity: data.slice(0, 3).map((p: any) => ({
            property: p.title,
            bid: `$${p.startingPrice}`,
            status: p.auction?.status || 'Ended',
            date: new Date(p.createdAt).toLocaleDateString()
          }))
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-accent/5 rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-accent/5 rounded-3xl"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {t('welcome')}, {user ? user.username : 'User'}
          </h1>
          <p className="text-gray-500 italic">Here's what's happening with your auctions today.</p>
        </div>
        <Button variant="accent" className="font-bold">{t('topUp')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{t('activeBids')}</p>
          <p className="text-3xl font-black text-primary">{stats?.activeBids || 0}</p>
          <p className="text-xs text-gray-400 italic">Live right now</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2 text-primary">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{t('walletBalance')}</p>
          <p className="text-3xl font-black">{stats?.walletBalance || "$0"}</p>
          <p className="text-xs text-gray-400 italic">Deposited via VNPay</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{t('auctionsWon')}</p>
          <p className="text-3xl font-black text-primary">{stats?.auctionsWon || 0}</p>
          <p className="text-xs text-gray-400 italic">Verified titles</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">{t('recentActivity')}</h2>
          <Button variant="ghost" size="sm" className="font-bold">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Current Bid</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {stats?.recentActivity?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-accent/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-primary group-hover:text-accent transition-colors">{row.property}</td>
                  <td className="px-6 py-4 font-mono font-bold text-accent">{row.bid}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      row.status === 'ACTIVE' || row.status === 'Winning' ? 'bg-green-100 text-green-700' : 
                      row.status === 'REJECTED' || row.status === 'Outbid' ? 'bg-red-100 text-red-700' : 'bg-accent/10 text-accent'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{row.date}</td>
                </tr>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
