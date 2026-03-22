"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function StaffComplaintsPage() {
  const t = useTranslations("Complaints");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/complaints", {
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

  const handleRespond = async (id: string, status: string) => {
    const responseText = window.prompt("Enter your response to this complaint:");
    if (!responseText) return;
    
    setActionMsg('');
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/complaints/${id}/respond`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status,
          response: responseText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to respond");
      
      setActionMsg(t('respondSuccess'));
      fetchComplaints();
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
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('staffTitle')}</h1>
        <p className="text-gray-500 italic">{t('staffSubtitle')}</p>
      </div>

      {actionMsg && (
        <div className={`p-4 text-sm font-bold rounded-xl border ${actionMsg.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
          {actionMsg}
        </div>
      )}

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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">{t('deadline')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {complaints.map((c: any) => {
                const isOverdue = new Date(c.deadline) < new Date() && c.status === 'OPEN';
                return (
                  <tr key={c.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary">{c.subject}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px]">{c.description}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{c.user?.username || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <p className={`text-xs font-bold ${isOverdue ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                        {new Date(c.deadline).toLocaleString()}
                      </p>
                      {isOverdue && <span className="text-[10px] text-red-500 font-bold uppercase">Overdue</span>}
                    </td>
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
                    <td className="px-6 py-4 text-right">
                      {c.status !== 'RESOLVED' && c.status !== 'REJECTED' ? (
                        <div className="flex gap-2 justify-end">
                          <Button variant="accent" size="sm" onClick={() => handleRespond(c.id, 'RESOLVED')}>Resolve</Button>
                          <Button variant="outline" size="sm" onClick={() => handleRespond(c.id, 'REJECTED')} className="border-red-200 text-red-600 hover:bg-red-50">Reject</Button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
