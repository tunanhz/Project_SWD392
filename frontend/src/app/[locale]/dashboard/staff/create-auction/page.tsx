"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function CreateAuctionPage() {
  const t = useTranslations("CreateAuction");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    propertyId: '',
    startTime: '',
    endTime: '',
    depositAmount: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/properties");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        // Only show APPROVED properties without an existing auction
        setProperties(data.filter((p: any) => p.status === 'APPROVED' && !p.auction));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApproved();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auctions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          depositAmount: parseFloat(formData.depositAmount)
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Failed');
      }
      setMessage('Auction created successfully!');
      setFormData({ propertyId: '', startTime: '', endTime: '', depositAmount: '' });
      // Refresh property list
      const res2 = await fetch("http://127.0.0.1:5000/api/properties");
      const data = await res2.json();
      setProperties(data.filter((p: any) => p.status === 'APPROVED' && !p.auction));
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="h-96 bg-accent/5 rounded-3xl"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('title')}</h1>
        <p className="text-gray-500 italic">{t('subtitle')}</p>
      </div>

      {message && (
        <div className={`p-3 text-sm font-bold rounded-xl border ${message.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
          {message}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="glass rounded-3xl border border-border/50 p-12 text-center">
          <p className="text-gray-400 text-lg">{t('noApproved')}</p>
          <p className="text-sm text-gray-400 mt-2">Approve properties first from the Approval Center.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/50 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('selectProperty')}</label>
              <select
                required
                value={formData.propertyId}
                onChange={e => setFormData({...formData, propertyId: e.target.value})}
                className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="">{t('choosePlaceholder')}</option>
                {properties.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — ${Number(p.startingPrice).toLocaleString()} — {p.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('startTime')}</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('endTime')}</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('depositAmount')}</label>
              <input
                type="number"
                required
                value={formData.depositAmount}
                onChange={e => setFormData({...formData, depositAmount: e.target.value})}
                className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                placeholder="e.g. 50000"
              />
            </div>

            <Button type="submit" variant="accent" className="h-12 px-8 text-lg" disabled={submitting}>
              {submitting ? t('creating') : t('create')}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
