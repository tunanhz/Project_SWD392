"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function MonitorAuctionsPage() {
  const t = useTranslations("AdminAuctions");
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auctions");
        if (!res.ok) throw new Error("Failed to fetch auctions");
        const data = await res.json();
        setAuctions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="h-64 bg-accent/5 rounded-3xl"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('title')}</h1>
        <p className="text-gray-500 italic">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('totalAuctions'), value: auctions.length, color: 'text-primary' },
          { label: t('activeAuctions'), value: auctions.filter(a => a.status === 'ACTIVE').length, color: 'text-green-600' },
          { label: t('upcomingAuctions'), value: auctions.filter(a => a.status === 'UPCOMING').length, color: 'text-blue-600' },
          { label: t('completedAuctions'), value: auctions.filter(a => a.status === 'COMPLETED').length, color: 'text-gray-500' },
        ].map((s, i) => (
          <div key={i} className="glass p-4 rounded-2xl border border-border/50 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Auction Table */}
      {auctions.length === 0 ? (
        <div className="glass rounded-3xl border border-border/50 p-12 text-center">
          <p className="text-gray-400 text-lg">No auctions found.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-accent/5">
                <th className="px-6 py-4">{t('property')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">Bids</th>
                <th className="px-6 py-4">{t('deposit')}</th>
                <th className="px-6 py-4">{t('startTime')}</th>
                <th className="px-6 py-4">{t('endTime')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {auctions.map((auction: any) => (
                <tr key={auction.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/auctions/${auction.property?.id}`} className="font-bold text-primary hover:text-accent transition-colors">
                      {auction.property?.title || 'N/A'}
                    </Link>
                    <p className="text-xs text-gray-400">{auction.property?.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      auction.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      auction.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                      auction.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-accent">{auction.bids?.length || 0}</td>
                  <td className="px-6 py-4 font-mono">{auction.auctionDeposits?.length || 0}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(auction.startTime).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(auction.endTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
