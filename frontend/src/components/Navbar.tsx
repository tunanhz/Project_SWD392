"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Button from './ui/Button';

const Navbar = () => {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();

    const handleAuthChange = () => checkUser();
    
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-change", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push(`/${locale}`);
  };

  const getSwitchLocalePath = () => {
    const nextLocale = locale === 'en' ? 'vi' : 'en';
    // Pathname looks like /en/dashboard or /vi/auctions
    // We want to replace the first segment
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    return segments.join('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-foreground">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">AuctionProp</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href={`/${locale}`} className="text-sm font-medium hover:text-accent transition-colors">{t('home')}</Link>
            <Link href={`/${locale}/auctions`} className="text-sm font-medium hover:text-accent transition-colors">{t('auctions')}</Link>
            <Link href={`/${locale}/dashboard`} className="text-sm font-medium hover:text-accent transition-colors">{t('dashboard')}</Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <Link 
              href={getSwitchLocalePath()}
              className="px-2 py-1 text-xs font-bold border border-border/50 rounded-lg hover:bg-accent/5 transition-colors uppercase"
            >
              {locale === 'en' ? 'VI' : 'EN'}
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-primary">{user.username}</span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{user.role}</span>
                </div>
                <div className="relative group">
                  <div className="h-10 w-10 rounded-full bg-accent/20 border-2 border-accent/20 flex items-center justify-center cursor-pointer hover:border-accent transition-all ring-2 ring-transparent group-hover:ring-accent/20 overflow-hidden">
                    <span className="text-accent font-black text-lg">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  
                  {/* Tooltip/Dropdown simulation */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/50 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                    <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent/5 rounded-xl transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('myProfile')}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V7" />
                      </svg>
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" size="sm">{t('login')}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button variant="accent" size="sm">{t('joinNow')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
