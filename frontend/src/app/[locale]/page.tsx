"use client";
import Button from "@/components/ui/Button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import DtaLogo from "@/components/DtaLogo";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Home() {
  const t = useTranslations("Landing");
  const [stats, setStats] = useState({ sold: 0, active: 0, bidders: 0, properties: 0 });
  const [featuredAuctions, setFeaturedAuctions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, auctionRes] = await Promise.all([
          fetch("http://localhost:5000/api/properties"),
          fetch("http://localhost:5000/api/auctions")
        ]);
        const properties = await propRes.json();
        const auctions = await auctionRes.json();
        const totalBidders = new Set(
          auctions.flatMap((a: any) => (a.auctionDeposits || []).map((d: any) => d.userId))
        ).size;

        setStats({
          sold: properties.filter((p: any) => p.status === 'SOLD').length,
          active: auctions.filter((a: any) => a.status === 'ACTIVE').length,
          bidders: totalBidders,
          properties: properties.length
        });

        const active = auctions
          .filter((a: any) => a.status === 'ACTIVE' && a.property)
          .slice(0, 3);
        setFeaturedAuctions(active);
      } catch { }
    };
    fetchData();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl"></div>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="container px-4 mx-auto text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-full text-amber-400 text-sm font-semibold backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {stats.active > 0 ? `${stats.active} ${t('activeAuctions')}` : 'Premium Platform'}
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {t('heroTitle').split(' ').map((word, i) => (
              <span key={i} className={word === 'Premium' || word === 'Cao' || word === 'cấp' || word === 'Future' || word === 'Tương' || word === 'lai' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: '200ms' }}>
            {t('heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000" style={{ animationDelay: '400ms' }}>
            <Link href="/auctions">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  {t('exploreAuctions')}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
            <Link href="/register">
              <button className="px-8 py-4 border-2 border-slate-600 text-white font-bold text-lg rounded-2xl hover:bg-white/5 hover:border-amber-500/50 transition-all duration-300">
                {t('listProperty')}
              </button>
            </Link>
          </div>

          {/* Hero Stats Bar */}
          <div className="pt-20 animate-in fade-in duration-1000" style={{ animationDelay: '600ms' }}>
            <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-1 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-2">
              {[
                { label: t('propertiesSold'), value: stats.sold, suffix: '+' },
                { label: t('activeAuctions'), value: stats.active, suffix: '' },
                { label: t('registeredBidders'), value: stats.bidders, suffix: '+' },
                { label: t('trustScore'), value: 99, suffix: '.9%' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-5 rounded-2xl hover:bg-white/5 transition-colors duration-300">
                  <p className="text-3xl md:text-4xl font-black text-white">
                    <AnimatedCounter target={stat.value} />
                    <span className="text-amber-400">{stat.suffix}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-500 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-amber-400"></div>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED AUCTIONS ═══════ */}
      {featuredAuctions.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16 space-y-4">
              <p className="text-amber-600 font-bold text-sm uppercase tracking-[0.2em]">Featured</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {t('activeAuctions')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredAuctions.map((auction: any, i: number) => (
                <Link key={auction.id} href={`/auctions/${auction.property?.id}`}>
                  <div className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative bg-slate-100">
                      <img
                        src={auction.property?.images?.[0]?.imageUrl || [
                          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
                          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
                          "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&q=80&w=800"
                        ][i % 3]}
                        alt={auction.property?.title || "Property"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          // Fallback if the image URL is broken (e.g. backend local path without host)
                          e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      {/* Status badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          LIVE
                        </span>
                      </div>
                      {/* Price overlay */}
                      <div className="absolute bottom-4 left-4">
                        <p className="text-3xl font-black text-white">
                          ${Number(auction.property?.startingPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {auction.property?.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {auction.property?.address}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400 font-semibold pt-2 border-t border-slate-100">
                        {auction.property?.beds && <span>{auction.property.beds} Beds</span>}
                        {auction.property?.baths && <span>{auction.property.baths} Baths</span>}
                        {auction.property?.area && <span>{auction.property.area} m²</span>}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-slate-400">
                          <span className="text-amber-600 font-bold">{auction.bids?.length || 0} bids</span>
                        </div>
                        <span className="text-amber-600 font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/auctions">
                <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-amber-600 transition-colors duration-300">
                  {t('exploreAuctions')} →
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-[0.2em]">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', title: 'Browse', desc: 'Explore verified premium properties' },
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Register', desc: 'Create account & verify identity' },
              { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', title: 'Deposit', desc: 'Pay deposit to join auction' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Bid & Win', desc: 'Place bids in real-time' },
            ].map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-slate-300"></div>
                )}
                <div className="relative mx-auto w-20 h-20 bg-white rounded-2xl border-2 border-slate-200 shadow-lg flex items-center justify-center mb-6 group-hover:border-amber-500 group-hover:shadow-amber-500/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                  </svg>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 max-w-[200px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TRUST / WHY US ═══════ */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-amber-600 font-bold text-sm uppercase tracking-[0.2em]">Why Choose Us</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Trusted by Property Investors Worldwide
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Our platform ensures complete transparency, legal compliance, and secure transactions for every auction.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'Verified Properties', desc: 'Every property undergoes rigorous legal verification before listing.' },
                  { title: 'Real-time Bidding', desc: 'WebSocket-powered live auctions with instant bid updates.' },
                  { title: 'Secure Deposits', desc: 'Your deposit is protected and fully refundable if you don\'t win.' },
                  { title: 'Anonymous Bidding', desc: 'Your identity is protected — only bid amounts are visible.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats visual */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { value: stats.properties, label: 'Total Properties', icon: '🏠', bg: 'from-amber-50 to-orange-50' },
                  { value: stats.active, label: t('activeAuctions'), icon: '🔴', bg: 'from-emerald-50 to-teal-50' },
                  { value: stats.bidders, label: t('registeredBidders'), icon: '👥', bg: 'from-blue-50 to-indigo-50' },
                  { value: 99, label: t('trustScore') + ' %', icon: '🛡️', bg: 'from-purple-50 to-pink-50' },
                ].map((card, i) => (
                  <div key={i} className={`bg-gradient-to-br ${card.bg} p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                    <p className="text-3xl mb-3">{card.icon}</p>
                    <p className="text-4xl font-black text-slate-900">
                      <AnimatedCounter target={card.value} />
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA BANNER ═══════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl"></div>

        <div className="container px-4 mx-auto relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight max-w-3xl mx-auto">
            Ready to Start Bidding?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Join thousands of investors who trust our platform for premium real estate auctions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <button className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105">
                {t('listProperty')}
              </button>
            </Link>
            <Link href="/auctions">
              <button className="px-10 py-4 border-2 border-slate-600 text-white font-bold text-lg rounded-2xl hover:bg-white/5 hover:border-amber-500/50 transition-all duration-300">
                {t('exploreAuctions')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <DtaLogo className="w-12 h-12 drop-shadow-lg" />
              <span className="text-white font-black text-2xl tracking-tight">Auctions</span>
            </div>
            <p className="text-slate-600 text-sm">© 2026 Duong Tuan Anh Auctions. All rights reserved.</p>
            <div className="flex gap-6 text-slate-500 text-sm">
              <span className="hover:text-amber-500 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-amber-500 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-amber-500 cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
