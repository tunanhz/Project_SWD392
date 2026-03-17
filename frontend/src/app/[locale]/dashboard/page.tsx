"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function DashboardOverview() {
  const t = useTranslations("Dashboard");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {t('welcome')}, {user ? user.username : 'User'}
          </h1>
          <p className="text-gray-500 italic">Here's what's happening with your auctions today.</p>
        </div>
        <Button variant="accent">{t('topUp')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('activeBids'), value: '4', sub: '+2 this week' },
          { label: t('walletBalance'), value: '$25,000', sub: 'Deposited via VNPay' },
          { label: t('auctionsWon'), value: '1', sub: 'Modern Sunset Villa' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-border/50 shadow-sm space-y-2">
            <p className="text-xs font-bold text-accent uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-primary">{stat.value}</p>
            <p className="text-xs text-gray-400 italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">{t('recentActivity')}</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">My Bid</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/50">
              {[
                { property: 'Skyline Penthouse', bid: '$1,850,000', status: 'Outbid', date: 'Jan 12, 2024' },
                { property: 'Modern Sunset Villa', bid: '$2,650,000', status: 'Winning', date: 'Jan 14, 2024' },
                { property: 'Heritage Mansion', bid: '$4,100,000', status: 'Ended', date: 'Jan 10, 2024' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{row.property}</td>
                  <td className="px-6 py-4 font-mono">{row.bid}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      row.status === 'Winning' ? 'bg-green-100 text-green-700' : 
                      row.status === 'Outbid' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
