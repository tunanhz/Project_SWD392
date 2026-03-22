"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  
  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUser(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      
      // Update local storage user context
      const currentStorage = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentStorage, ...data }));
      
      // Notify other components (like Navbar) to update
      window.dispatchEvent(new Event('userProfileUpdated'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!name || name.trim().length < 2) errors.name = t('title') === 'My Profile' ? "Name must be at least 2 characters" : "Họ tên phải có ít nhất 2 ký tự";
    if (phone && !/^\d{10,15}$/.test(phone.trim().replace(/\s+/g,''))) errors.phone = t('title') === 'My Profile' ? "Valid phone (10-15 digits)" : "Số điện thoại không hợp lệ (10-15 số)";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, phone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      
      alert(t('updateSuccess') || "Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload avatar");
      
      alert(t('avatarSuccess') || "Avatar updated successfully!");
      fetchProfile();
      
      // Dispatch a custom event to notify other components (like Navbar) to update
      window.dispatchEvent(new Event('userProfileUpdated'));
    } catch (err: any) {
      alert(err.message || "Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse pt-20">
        <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
        <div className="h-96 bg-accent/5 rounded-3xl w-full max-w-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl pt-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">{t('title') || 'My Profile'}</h1>
        <p className="text-gray-500 italic">{t('subtitle') || 'Manage your personal information and avatar.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="col-span-1">
          <div className="glass p-8 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-accent/20 bg-gray-100 shadow-inner flex items-center justify-center relative">
                {uploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : null}
                
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl text-gray-300 font-bold uppercase">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || '?'}
                  </span>
                )}
                
                <div 
                  onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">{t('changeAvatar') || 'Change Avatar'}</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-primary">{user?.name}</h2>
              <p className="text-sm font-medium text-accent uppercase tracking-widest mt-1">{user?.role}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {user?.isVerified ? 'Verified Account' : 'Account Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="col-span-1 md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="glass p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-primary border-b border-border/50 pb-4 mb-6">{t('personalInfo') || 'Personal Information'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('name') || 'Full Name'}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFormErrors({...formErrors, name: undefined}); }}
                  className={`w-full px-4 py-3 bg-white border ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-accent focus:border-accent'} rounded-xl focus:ring-2 transition-all duration-200 outline-none shadow-sm`}
                />
                {formErrors.name && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('phone') || 'Phone Number'}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setFormErrors({...formErrors, phone: undefined}); }}
                  className={`w-full px-4 py-3 bg-white border ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-accent focus:border-accent'} rounded-xl focus:ring-2 transition-all duration-200 outline-none shadow-sm`}
                />
                {formErrors.phone && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('email') || 'Email Address'}</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed shadow-inner"
                />
                <p className="text-xs text-gray-400 mt-1">{t('emailHint') || 'Email address cannot be changed.'}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('username') || 'Username'}</label>
                <input
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed shadow-inner"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border/50 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-8 py-3.5 bg-gradient-to-r from-accent to-accent/90 hover:to-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t('saveChanges') || 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
