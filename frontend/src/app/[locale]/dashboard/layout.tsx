"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const Sidebar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  
  const menuItems = [
    { label: 'Overview', href: `/${locale}/dashboard`, icon: 'M4 6h16M4 12h16M4 18h16' },
    { label: 'My Bids', href: `/${locale}/dashboard/bids`, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'My Properties', href: `/${locale}/dashboard/properties`, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Settings', href: `/${locale}/dashboard/settings`, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="w-64 border-r border-border/50 h-full p-6 space-y-8 bg-card">
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Main Menu</p>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-gray-500 hover:bg-accent/5 hover:text-primary'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-12 bg-background/50">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
