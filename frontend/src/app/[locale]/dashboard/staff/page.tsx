"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function StaffDashboard() {
  const t = useTranslations("StaffApproval");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const fetchPending = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/properties");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProperties(data.filter((p: any) => p.status === 'PENDING'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/properties/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Action failed");
      setActionMsg(`Property ${status.toLowerCase()} successfully!`);
      fetchPending();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

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

      {actionMsg && (
        <div className={`p-3 text-sm font-bold rounded-xl border ${actionMsg.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
          {actionMsg}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="glass rounded-3xl border border-border/50 p-12 text-center">
          <p className="text-gray-400 text-lg">{t('noPending')}</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-accent/5">
                <th className="px-6 py-4">{t('owner')}</th>
                <th className="px-6 py-4">{t('property')}</th>
                <th className="px-6 py-4">{t('startingPrice')}</th>
                <th className="px-6 py-4">{t('address')}</th>
                <th className="px-6 py-4">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/50">
              {properties.map((prop: any) => (
                <tr key={prop.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{prop.owner?.username || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-primary">{prop.title}</td>
                  <td className="px-6 py-4 font-mono">${Number(prop.startingPrice).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{prop.address}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="accent" size="sm" className="h-8" onClick={() => handleAction(prop.id, 'APPROVED')}>
                        {t('approve')}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction(prop.id, 'REJECTED')}>
                        {t('reject')}
                      </Button>
                    </div>
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
