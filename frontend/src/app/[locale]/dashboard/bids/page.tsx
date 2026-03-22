"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import CreateComplaintModal from "@/components/CreateComplaintModal";

export default function MyBidsPage() {
  const t = useTranslations("MyBids");
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Complaint Modal State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('');
  const [selectedAuctionTitle, setSelectedAuctionTitle] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

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

  const handleCheckout = async (auctionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/payments/checkout/${auctionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          alert(t('checkoutSuccess') || "Payment successful! Property ownership transferred.");
          window.location.reload();
        }
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("Error processing checkout");
    }
  };

  const handleDownloadReceipt = async (paymentData: any) => {
    try {
      let paymentId = paymentData.id;
      if (Array.isArray(paymentData)) {
        const checkoutPayment = paymentData.find(p => p.type === 'AUCTION_CHECKOUT');
        if (checkoutPayment) paymentId = checkoutPayment.id;
        else paymentId = paymentData[0]?.id;
      }
      if (!paymentId) {
        alert("Receipt not available");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/payments/receipt/${paymentId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to download receipt");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Receipt_${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error downloading receipt");
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
                <th className="px-6 py-4 text-right">Action</th>
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
                  <td className="px-6 py-4 text-right">
                    {bid.auction?.status === 'COMPLETED' && bid.auction?.winnerId === user?.id && (
                      bid.auction.payment && (!Array.isArray(bid.auction.payment) || bid.auction.payment.length > 0) ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 drop-shadow-sm inline-block">
                            {t('paid') || 'Paid & Transferred'}
                          </span>
                          <button 
                            onClick={() => handleDownloadReceipt(bid.auction.payment)}
                            className="flex items-center gap-1 text-[10px] font-bold text-accent hover:text-accent/80 hover:underline transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {t('downloadReceipt')}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider animate-pulse">
                            You Won!
                          </span>
                          <button 
                            onClick={() => handleCheckout(bid.auction.id)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all"
                          >
                            {t('checkoutBtn') || 'Pay Balance'}
                          </button>
                        </div>
                      )
                    )}
                    {bid.auction?.status === 'COMPLETED' && (
                      <div className="flex flex-col items-end gap-2 mt-2">
                        <button 
                          onClick={() => {
                            setSelectedAuctionId(bid.auction.id);
                            setSelectedAuctionTitle(bid.auction.property?.title || 'Unknown');
                            setComplaintModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline transition-all"
                        >
                          Report Issue
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complaint Modal */}
      <CreateComplaintModal 
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        auctionId={selectedAuctionId}
        title={selectedAuctionTitle}
        onSuccess={() => {
          setComplaintModalOpen(false);
          alert("Complaint filed successfully.");
        }}
      />
    </div>
  );
}
