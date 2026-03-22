"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AdminReports() {
  const t = useTranslations("AdminReports");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propRes, auctionRes] = await Promise.all([
          fetch("http://localhost:5000/api/properties"),
          fetch("http://localhost:5000/api/auctions")
        ]);
        const properties = await propRes.json();
        const auctions = await auctionRes.json();

        const totalBids = auctions.reduce((sum: number, a: any) => sum + (a.bids?.length || 0), 0);
        const totalDeposits = auctions.reduce((sum: number, a: any) => sum + (a.auctionDeposits?.length || 0), 0);
        const totalRevenue = auctions
          .filter((a: any) => a.status === 'COMPLETED')
          .reduce((sum: number, a: any) => {
            const highest = a.bids?.sort((x: any, y: any) => y.amount - x.amount)[0];
            return sum + (highest ? parseFloat(highest.amount) : 0);
          }, 0);

        setStats({
          totalProperties: properties.length,
          pendingApprovals: properties.filter((p: any) => p.status === 'PENDING').length,
          totalAuctions: auctions.length,
          activeAuctions: auctions.filter((a: any) => a.status === 'ACTIVE').length,
          completedAuctions: auctions.filter((a: any) => a.status === 'COMPLETED').length,
          totalBids,
          totalDeposits,
          totalRevenue
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-2 gap-8">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-accent/5 rounded-2xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('title')}</h1>
        <p className="text-gray-500 italic">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('totalProperties'), value: stats?.totalProperties || 0, color: 'text-primary' },
          { label: t('pending'), value: stats?.pendingApprovals || 0, color: 'text-yellow-600' },
          { label: t('active'), value: stats?.activeAuctions || 0, color: 'text-green-600' },
          { label: t('completed'), value: stats?.completedAuctions || 0, color: 'text-blue-600' },
          { label: 'Total Bids', value: stats?.totalBids || 0, color: 'text-accent' },
          { label: 'Total Deposits', value: stats?.totalDeposits || 0, color: 'text-primary' },
          { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-green-600' },
          { label: 'System Status', value: 'Healthy', color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
