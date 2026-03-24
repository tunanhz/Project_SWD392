"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function AdminTransactionsPage() {
  const t = useTranslations("AdminTransactions");
  const [data, setData] = useState<{ payments: any[], deposits: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'deposits'>('payments');
  const [actionMsg, setActionMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/payments/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTransactions();
  }, [token]);

  const handleRefund = async (depositId: string) => {
    setActionMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/payments/refund/${depositId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || resData.message || "Refund failed");
      setActionMsg(t('refundSuccess'));
      fetchTransactions();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="flex gap-4">
        <div className="h-10 bg-accent/5 rounded-xl w-32"></div>
        <div className="h-10 bg-accent/5 rounded-xl w-32"></div>
      </div>
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
        <div className={`p-4 text-sm font-bold rounded-xl border ${actionMsg.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/50 pb-2">
        <button 
          onClick={() => setActiveTab('payments')}
          className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'payments' ? 'border-b-2 border-accent text-accent' : 'text-gray-400 hover:text-primary'}`}
        >
          {t('paymentsTab')}
        </button>
        <button 
          onClick={() => setActiveTab('deposits')}
          className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'deposits' ? 'border-b-2 border-accent text-accent' : 'text-gray-400 hover:text-primary'}`}
        >
          {t('depositsTab')}
        </button>
      </div>

      <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        {activeTab === 'payments' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-accent/5">
                <th className="px-6 py-4">{t('paymentId')}</th>
                <th className="px-6 py-4">{t('user')}</th>
                <th className="px-6 py-4">{t('auction')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('method')}</th>
                <th className="px-6 py-4">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {data?.payments?.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{payment.transactionId || payment.id}</td>
                  <td className="px-6 py-4 font-medium">{payment.user?.username || 'Unknown'}</td>
                  <td className="px-6 py-4 text-primary font-bold">{payment.auction?.property?.title || 'Unknown Property'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-green-600">${parseFloat(payment.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(payment.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {(!data?.payments || data.payments.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">{t('noRecords')}</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'deposits' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-accent/5">
                <th className="px-6 py-4">{t('paymentId')}</th>
                <th className="px-6 py-4">{t('user')}</th>
                <th className="px-6 py-4">{t('auction')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/20">
              {data?.deposits?.map((deposit: any) => (
                <tr key={deposit.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{deposit.transactionId || deposit.id}</td>
                  <td className="px-6 py-4 font-medium">{deposit.user?.username || 'Unknown'}</td>
                  <td className="px-6 py-4 font-bold text-primary max-w-xs truncate" title={deposit.auction?.property?.title}>
                    {deposit.auction?.property?.title || 'Unknown Property'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-accent">${parseFloat(deposit.amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      deposit.status === 'REFUNDED' ? 'bg-green-100 text-green-700' :
                      deposit.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {deposit.status === 'PAID' && deposit.auction?.status === 'COMPLETED' && deposit.auction?.winnerId !== deposit.userId && (
                      <Button variant="outline" size="sm" onClick={() => handleRefund(deposit.id)} className="border-green-200 text-green-600 hover:bg-green-50">
                        {t('refund')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.deposits || data.deposits.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">{t('noRecords')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {activeTab === 'deposits' && (
         <p className="text-xs text-gray-400 italic mb-4">{t('refundInfo')}</p>
      )}
    </div>
  );
}
