"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export default function NotificationDropdown() {
  const t = useTranslations("Navbar");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://127.0.0.1:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch {}
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      
      await Promise.all(unreadIds.map(id => 
        fetch(`http://127.0.0.1:5000/api/notifications/${id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      fetchNotifications();
    } catch {}
  };

  const getNotificationLink = (n: Notification) => {
    switch (n.type) {
      case "AUCTION_WON": return `/dashboard/bids`;
      case "AUCTION_ENDED": return `/auctions/${n.metadata?.propertyId || ''}`;
      case "PROPERTY_APPROVED": 
      case "PROPERTY_REJECTED": return `/dashboard/properties`;
      case "COMPLAINT_RESPONSE": return `/dashboard/complaints`;
      default: return "#";
    }
  };

  return (
    <div className="relative group" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-full transition-colors focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center p-1 w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full border border-card shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-accent/5 border-b border-border/50">
            <h3 className="text-sm font-bold text-primary">{t("notifications")}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-accent font-medium hover:underline"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                {t("noNotifications")}
              </div>
            ) : (
              <ul className="divide-y divide-border/20">
                {notifications.map((n) => (
                  <li key={n.id} className={`hover:bg-accent/5 transition-colors ${n.isRead ? 'opacity-70' : 'bg-transparent'}`}>
                    <Link 
                      href={getNotificationLink(n)} 
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold ${!n.isRead ? 'text-accent' : 'text-primary'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <div 
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            className="w-2 h-2 rounded-full bg-accent cursor-pointer flex-shrink-0 mt-1" 
                            title="Mark as read"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-1 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
