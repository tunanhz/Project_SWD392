"use client";

import { useState, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import Button from './ui/Button';
import DtaLogo from './DtaLogo';
import NotificationDropdown from './NotificationDropdown';

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
    window.addEventListener("userAvatarUpdated", handleAuthChange);
    window.addEventListener("userProfileUpdated", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("userAvatarUpdated", handleAuthChange);
      window.removeEventListener("userProfileUpdated", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'vi' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <DtaLogo className="w-10 h-10 drop-shadow-md" />
            <span className="text-2xl font-black tracking-tight text-primary">Auctions</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">{t('home')}</Link>
            <Link href="/auctions" className="text-sm font-medium hover:text-accent transition-colors">{t('auctions')}</Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">{t('dashboard')}</Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={switchLocale}
              className="px-2 py-1 text-xs font-bold border border-border/50 rounded-lg hover:bg-accent/5 transition-colors uppercase cursor-pointer"
            >
              {locale === 'en' ? 'VI' : 'EN'}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-primary">{user.name || user.username}</span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{user.role}</span>
                </div>

                <NotificationDropdown />

                <div className="relative group">
                  <div className="h-10 w-10 rounded-full bg-accent/20 border-2 border-accent/20 flex items-center justify-center cursor-pointer hover:border-accent transition-all ring-2 ring-transparent group-hover:ring-accent/20 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent font-black text-lg">{(user?.name?.charAt(0) || user?.username?.charAt(0) || '?').toUpperCase()}</span>
                    )}
                  </div>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/50 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                    <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent/5 rounded-xl transition-colors">
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
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t('login')}</Button>
                </Link>
                <Link href="/register">
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
