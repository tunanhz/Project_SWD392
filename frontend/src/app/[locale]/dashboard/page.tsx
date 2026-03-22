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
      const token = localStorage.getItem("token");
      try {
        const [propRes, auctionRes, bidsRes, depositsRes] = await Promise.all([
          fetch("http://localhost:5000/api/properties"),
          fetch("http://localhost:5000/api/auctions"),
          token ? fetch("http://localhost:5000/api/bids/my", { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
          token ? fetch("http://localhost:5000/api/deposits/my", { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null)
        ]);

        const properties = await propRes.json();
        const auctions = await auctionRes.json();
        const myBids = bidsRes && bidsRes.ok ? await bidsRes.json() : [];
        const myDeposits = depositsRes && depositsRes.ok ? await depositsRes.json() : [];

        setStats({
          activeBids: myBids.filter((b: any) => b.auction?.status === 'ACTIVE').length,
          auctionsWon: properties.filter((p: any) => p.status === 'SOLD').length,
          totalBidsPlaced: myBids.length,
          recentActivity: myBids.slice(0, 5).map((bid: any) => ({
            property: bid.auction?.property?.title || 'N/A',
            bid: `$${parseFloat(bid.amount).toLocaleString()}`,
            status: bid.auction?.status || 'Ended',
            date: new Date(bid.bidTime).toLocaleDateString()
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
          <p className="text-gray-500 italic">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{t('activeBids')}</p>
          <p className="text-3xl font-black text-primary">{stats?.activeBids || 0}</p>
          <p className="text-xs text-gray-400 italic">{t('liveRightNow')}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2 text-primary">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{t('totalBidsPlaced')}</p>
          <p className="text-3xl font-black">{stats?.totalBidsPlaced || 0}</p>
          <p className="text-xs text-gray-400 italic">{t('acrossAllAuctions')}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{t('auctionsWon')}</p>
          <p className="text-3xl font-black text-primary">{stats?.auctionsWon || 0}</p>
          <p className="text-xs text-gray-400 italic">{t('verifiedTitles')}</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">{t('recentActivity')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">{t('property')}</th>
                <th className="px-6 py-4">{t('yourBid')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {stats?.recentActivity?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-accent/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-primary group-hover:text-accent transition-colors">{row.property}</td>
                  <td className="px-6 py-4 font-mono font-bold text-accent">{row.bid}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      row.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-accent/10 text-accent'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{row.date}</td>
                </tr>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">{t('noRecentActivity')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
