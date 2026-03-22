"use client";

import { Link, usePathname } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";

type MenuItem = {
  labelKey: string;
  href: string;
  icon: string;
};

const menuByRole: Record<string, MenuItem[]> = {
  CUSTOMER: [
    { labelKey: 'overview', href: '/dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
    { labelKey: 'myBids', href: '/dashboard/bids', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ],
  OWNER: [
    { labelKey: 'overview', href: '/dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
    { labelKey: 'myProperties', href: '/dashboard/properties', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  ],
  STAFF: [
    { labelKey: 'overview', href: '/dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
    { labelKey: 'approvalCenter', href: '/dashboard/staff', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { labelKey: 'createAuction', href: '/dashboard/staff/create-auction', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  ],
  ADMIN: [
    { labelKey: 'overview', href: '/dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
    { labelKey: 'manageUsers', href: '/dashboard/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { labelKey: 'monitorAuctions', href: '/dashboard/admin/auctions', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { labelKey: 'reports', href: '/dashboard/admin', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ]
};

const Sidebar = () => {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const [role, setRole] = useState<string>('CUSTOMER');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setRole(parsed.role || 'CUSTOMER');
    }
  }, []);

  const menuItems = menuByRole[role] || menuByRole.CUSTOMER;

  return (
    <div className="w-64 border-r border-border/50 h-full p-6 space-y-8 bg-card">
      <div className="space-y-4">
        <div className="px-4 pb-4 border-b border-border/30">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{role}</p>
          <p className="text-xs text-gray-400 font-medium">{t('dashboard')}</p>
        </div>
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
              {t(item.labelKey)}
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
