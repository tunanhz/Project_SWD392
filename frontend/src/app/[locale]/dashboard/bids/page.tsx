"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function MyBidsPage() {
  const t = useTranslations("MyBids");
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/bids/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch bids");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
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

      {bids.length === 0 ? (
        <div className="glass rounded-3xl border border-border/50 p-12 text-center">
          <p className="text-gray-400 text-lg">{t('noBids')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('noBidsHint')}</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-accent/5">
                <th className="px-6 py-4">{t('property')}</th>
                <th className="px-6 py-4">{t('yourBid')}</th>
                <th className="px-6 py-4">{t('auctionStatus')}</th>
                <th className="px-6 py-4">{t('bidTime')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {bids.map((bid: any) => (
                <tr key={bid.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">
                    {bid.auction?.property?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-accent">
                    ${parseFloat(bid.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      bid.auction?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      bid.auction?.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {bid.auction?.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {new Date(bid.bidTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
