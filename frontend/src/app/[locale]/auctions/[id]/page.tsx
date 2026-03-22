"use client";

import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useTranslations } from "next-intl";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const t = useTranslations("AuctionDetail");
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<{ amount: string; bidTime: string; message: string }[]>([]);
  const [bidMessage, setBidMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/properties/${id}`);
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        setProperty(data);
      } catch (err: any) {
        setError(err.message === "Property not found" ? t('errPropertyNotFound') : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Connect socket AFTER property loads so we have the auction ID
  useEffect(() => {
    const auctionId = property?.auction?.id;
    if (!auctionId) return;

    socket.connect();
    socket.emit("joinAuction", auctionId);

    socket.on("newBid", (newBid) => {
      setBids((prevBids) => [newBid, ...prevBids]);
      setBidMessage("");
    });

    socket.on("error", (err) => {
      let msg = err.message;
      if (typeof msg === 'string') {
        if (msg.startsWith("Bid must be higher than starting price")) {
          const priceStr = msg.match(/\(\$([\d,]+(\.\d+)?)\)/)?.[1] || "";
          msg = t('errBidHigherStarting', { price: `$${priceStr}` });
        } else if (msg.startsWith("Bid must be higher than current highest")) {
          const priceStr = msg.match(/\(\$([\d,]+(\.\d+)?)\)/)?.[1] || "";
          msg = t('errBidHigherCurrent', { price: `$${priceStr}` });
        }
      }
      setBidMessage(msg);
    });

    return () => {
      socket.off("newBid");
      socket.off("error");
      socket.disconnect();
    };
  }, [property]);

  // Check registration status
  useEffect(() => {
    const checkReg = async () => {
      if (!property?.auction?.id) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:5000/api/auctions/${property.auction.id}/check-registration`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsRegistered(data.registered);
        }
      } catch { }
    };
    checkReg();
  }, [property]);

  // Fetch existing bid history
  useEffect(() => {
    const fetchBids = async () => {
      if (!property?.auction?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/bids/auction/${property.auction.id}`);
        if (res.ok) {
          const data = await res.json();
          setBids(data.map((b: any) => ({ amount: b.amount, bidTime: b.bidTime, message: '' })));
        }
      } catch { }
    };
    fetchBids();
  }, [property]);

  const handleRegister = async () => {
    if (!property?.auction?.id) return;
    setRegistering(true);
    setRegMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/auctions/${property.auction.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setIsRegistered(true);
        setRegMessage(t('successRegistration'));
      }
    } catch (err: any) {
      const msg = err.message === 'Registration failed' ? t('errRegistrationFailed') : err.message;
      setRegMessage(`Error: ${msg}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleBid = () => {
    if (!bidAmount || !property?.auction?.id) return;
    setBidMessage("");
    
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : "anonymous";
    
    socket.emit("placeBid", {
      auctionId: property.auction.id,
      userId,
      amount: parseFloat(bidAmount)
    });
    setBidAmount("");
  };

  if (loading) return (
    <div className="container px-4 mx-auto py-24 space-y-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
                <div className="aspect-video bg-accent/5 rounded-3xl"></div>
                <div className="h-10 bg-accent/5 rounded-xl w-1/2"></div>
                <div className="h-32 bg-accent/5 rounded-3xl"></div>
            </div>
            <div className="h-96 bg-accent/5 rounded-3xl"></div>
        </div>
    </div>
  );

  if (error || !property) return (
    <div className="p-20 text-center glass m-10 rounded-3xl border border-red-100">
        <p className="text-red-500 font-bold">Error: {error || "Property not found"}</p>
    </div>
  );

  const auctionActive = property.auction?.status === 'ACTIVE';

  return (
    <div className="container px-4 mx-auto py-12 space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
            <img 
              src={property.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"} 
              alt={property.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-primary tracking-tight">{property.title}</h1>
                <p className="text-lg text-gray-500 font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}
                </p>
              </div>
              <div className="text-right">
                <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/20">
                  {property.auction?.status || property.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y border-border/50 py-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">{t('beds')}</p>
                <p className="text-2xl font-bold text-primary">{property.beds || 0}</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">{t('baths')}</p>
                <p className="text-2xl font-bold text-primary">{property.baths || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">{t('area')}</p>
                <p className="text-2xl font-bold text-primary">{property.area || 0} m²</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">{t('propertyDetails')}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {property.description || "No description provided for this property. Exclusive luxury residence featuring state-of-the-art amenities and breathtaking views."}
              </p>
              
              {property.LegalDocuments && property.LegalDocuments.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border/50">
                  <h3 className="text-xl font-bold text-primary mb-4">{t('viewDocs')}</h3>
                  <div className="flex flex-wrap gap-4">
                    {property.LegalDocuments.map((doc: any) => (
                      <a 
                        key={doc.id} 
                        href={`http://localhost:5000/${doc.filePath}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-xl border border-accent/20 text-accent font-medium hover:bg-accent/10 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0-2.25v2.25A2.25 2.25 0 0010.5 9h2.25m-2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        {doc.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Bidding Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-border/50 shadow-2xl sticky top-24 space-y-6">
            <div className="space-y-2 text-center pb-4 border-b border-border/50">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t('reservePrice')}</p>
              <p className="text-4xl font-black text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(property.startingPrice))}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-accent/10">
                <div className="space-y-0.5 w-full text-center">
                  <p className="text-xs text-accent font-bold uppercase">{t('endsAt')}</p>
                  <p className="text-xl font-mono font-bold text-primary">
                    {property.auction?.endTime ? new Date(property.auction.endTime).toLocaleString() : 'Not Scheduled'}
                  </p>
                </div>
              </div>

              {/* Deposit section */}
              {property.auction && user?.role === 'CUSTOMER' && !isRegistered && (
                <div className="space-y-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
                  <p className="text-sm font-bold text-yellow-800">⚠️ Deposit Required</p>
                  <p className="text-xs text-yellow-700">
                    Pay a deposit of <strong>${Number(property.auction.depositAmount).toLocaleString()}</strong> to participate in this auction.
                  </p>
                  {regMessage && (
                    <p className={`text-xs font-bold ${regMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{regMessage}</p>
                  )}
                  <Button 
                    variant="accent" 
                    size="lg" 
                    className="w-full h-12"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? t('processing') : `${t('payDeposit')} ($${Number(property.auction.depositAmount).toLocaleString()})`}
                  </Button>
                </div>
              )}

              {/* Bidding section */}
              {(isRegistered || user?.role !== 'CUSTOMER') && (auctionActive || property.auction?.status === 'PAUSED') && (
                <div className="space-y-4 pt-4">
                  {isRegistered && auctionActive && (
                    <div className="p-2 rounded-lg bg-green-50 border border-green-100 text-center">
                      <p className="text-xs font-bold text-green-700">✓ {t('registeredDepositPaid')}</p>
                    </div>
                  )}

                  {property.auction?.status === 'PAUSED' ? (
                     <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                        <p className="font-bold text-orange-700 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {t('pausedWarning')}
                        </p>
                        {property.auction.pauseReason && (
                          <p className="text-sm text-orange-600 mt-2 font-medium">{t('pauseReason')} {property.auction.pauseReason}</p>
                        )}
                     </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary uppercase tracking-wider">{t('yourBid')}</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input 
                            type="number"
                            placeholder="Enter amount"
                            step="1000000"
                            className="w-full bg-background border border-border h-14 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-accent outline-none font-bold text-lg"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 italic mt-1 ml-1">{t('bidStepHelp')}</p>
                      </div>
                      <Button 
                        variant="accent" 
                        size="lg" 
                        className="w-full h-14 text-xl shadow-xl shadow-accent/20"
                        onClick={handleBid}
                      >
                        {t('placeBidNow')}
                      </Button>
                      {bidMessage && (
                        <p className={`text-xs font-bold text-center p-2 rounded-lg ${bidMessage.startsWith('Error') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                          {bidMessage}
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-[10px] text-center text-gray-400 uppercase font-medium mt-4">
                    {t('bidTerms')}
                  </p>
                </div>
              )}

              {!auctionActive && !property.auction && (
                <div className="p-4 text-center rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">{t('noActiveAuction')}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-border/50">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">{t('liveActivity')}</h3>
                <div className="max-h-48 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {bids.length > 0 ? bids.map((bid, i) => (
                        <div key={i} className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-right-3 duration-500">
                            <span className="text-gray-500 font-medium">Bidder ****{Math.floor(Math.random() * 900) + 100}</span>
                            <span className="font-bold text-primary">${parseFloat(bid.amount).toLocaleString()}</span>
                        </div>
                    )) : (
                        <p className="text-xs text-center text-gray-400">{t('noBidsYet')}</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
