"use client";

import { useParams } from "next/navigation";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<{ amount: string; bidTime: string; message: string }[]>([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/properties/${id}`);
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        setProperty(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
      socket.connect();
      socket.emit("joinAuction", id);

      socket.on("newBid", (newBid) => {
        setBids((prevBids) => [newBid, ...prevBids]);
      });

      return () => {
        socket.off("newBid");
        socket.disconnect();
      };
    }
  }, [id]);

  const handleBid = () => {
    if (!bidAmount || !id) return;
    
    // Get real user ID from local storage
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : "anonymous";
    
    socket.emit("placeBid", {
      auctionId: id,
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

  return (
    <div className="container px-4 mx-auto py-12 space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
            <img 
              src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"} 
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
                <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">Bedrooms</p>
                <p className="text-2xl font-bold text-primary">{property.beds || 0}</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">Bathrooms</p>
                <p className="text-2xl font-bold text-primary">{property.baths || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 font-semibold mb-1 uppercase tracking-wider">Total Area</p>
                <p className="text-2xl font-bold text-primary">{property.area || 0} m²</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">Property Description</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {property.description || "No description provided for this property. Exclusive luxury residence featuring state-of-the-art amenities and breathtaking views."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Bidding Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-border/50 shadow-2xl sticky top-24 space-y-6">
            <div className="space-y-2 text-center pb-4 border-b border-border/50">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Reserve Price</p>
              <p className="text-4xl font-black text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(property.startingPrice))}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-accent/10">
                <div className="space-y-0.5 w-full text-center">
                  <p className="text-xs text-accent font-bold uppercase">Ends At</p>
                  <p className="text-xl font-mono font-bold text-primary">
                    {property.auction?.endTime ? new Date(property.auction.endTime).toLocaleString() : 'Not Scheduled'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Your Bid</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number"
                      placeholder="Enter amount"
                      className="w-full bg-background border border-border h-14 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-accent outline-none font-bold text-lg"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full h-14 text-xl shadow-xl shadow-accent/20"
                  onClick={handleBid}
                >
                  Place Bid Now
                </Button>
                <p className="text-[10px] text-center text-gray-400 uppercase font-medium">
                  By bidding, you agree to our Terms and Conditions & BR-18 Compliance
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-border/50">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Live Activity</h3>
                <div className="max-h-48 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {bids.length > 0 ? bids.map((bid, i) => (
                        <div key={i} className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-right-3 duration-500">
                            <span className="text-gray-500 font-medium">Bidder ****{Math.floor(Math.random() * 900) + 100}</span>
                            <span className="font-bold text-primary">${parseFloat(bid.amount).toLocaleString()}</span>
                        </div>
                    )) : (
                        <p className="text-xs text-center text-gray-400">No bids yet. Be the first!</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
