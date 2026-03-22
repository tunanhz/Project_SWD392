"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function MyComplaintsPage() {
  const t = useTranslations("Complaints");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/complaints/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
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
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('myTitle')}</h1>
        <p className="text-gray-500 italic">{t('mySubtitle')}</p>
      </div>

      {complaints.length === 0 ? (
        <div className="glass rounded-3xl border border-border/50 p-12 text-center">
          <p className="text-gray-400 text-lg">{t('noComplaints')}</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-accent/5">
                <th className="px-6 py-4">{t('subject')}</th>
                <th className="px-6 py-4">Auction</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">Response</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {complaints.map((c: any) => (
                <tr key={c.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{c.subject}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{c.auction?.property?.title || 'Unknown'}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                      c.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      c.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.response ? (
                      <div className="text-xs text-wrap max-w-[200px] border-l-2 border-accent pl-2 text-gray-600">
                        {c.response}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Pending response...</span>
                    )}
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
