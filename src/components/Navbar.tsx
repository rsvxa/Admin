"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, CheckCheck, Info, Globe, Check } from 'lucide-react'; // បន្ថែម Globe និង Check
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  
  // State សម្រាប់ Profile
  const [userProfile, setUserProfile] = useState({ fullName: 'Sitha THUL', avatar: '/unnamed.png', role: 'Admin' });
  
  // State សម្រាប់ Dropdowns
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // ទិន្នន័យ Notification
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'ការលក់ថ្មី', message: 'អ្នកទើបតែទទួលបានការកុម្ម៉ង់ $45.00', time: '2 នាទីមុន', read: false },
    { id: 2, title: 'ស្តុកទំនិញ', message: 'អាវយឺត ZWAY Classic ជិតអស់ពីស្តុកហើយ', time: '1 ម៉ោងមុន', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // មុខងារប្តូរភាសា
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLang(false);
    localStorage.setItem('i18nextLng', lng);
  };

  // មុខងារទាញយកទិន្នន័យ Profile និង Role
  const loadProfile = () => {
    const saved = localStorage.getItem('zway_user_profile');
    const role = localStorage.getItem('userRole');
    if (saved) {
      const data = JSON.parse(saved);
      setUserProfile({
        fullName: data.fullName || 'Sitha THUL',
        avatar: data.avatar || '/unnamed.png',
        role: role || 'Admin'
      });
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('storage', loadProfile);
    
    // ចុចខាងក្រៅដើម្បីបិទ Dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLang(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('storage', loadProfile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
      
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        
        {/* --- Language Switcher --- */}
        <div className="relative" ref={langRef}>
          <button 
            onClick={() => { setShowLang(!showLang); setShowNotif(false); }}
            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all border ${showLang ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}
          >
            <Globe size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {i18n.language === 'kh' ? 'KH' : 'EN'}
            </span>
          </button>

          <AnimatePresence>
            {showLang && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <button onClick={() => changeLanguage('en')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase transition-colors ${i18n.language === 'en' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                  English {i18n.language === 'en' && <Check size={12} />}
                </button>
                <button onClick={() => changeLanguage('kh')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase transition-colors ${i18n.language === 'kh' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                  ភាសាខ្មែរ {i18n.language === 'kh' && <Check size={12} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Notification Section --- */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotif(!showNotif); setShowLang(false); }}
            className={`relative p-2.5 rounded-xl transition-all ${showNotif ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Notifications</h3>
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1">
                    <CheckCheck size={12} /> Mark all read
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Info size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{n.title}</p>
                          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{n.message}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400 italic text-xs">No new notifications</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block text-left">
            <p className="text-xs font-black text-gray-900 uppercase tracking-tighter leading-none">{userProfile.fullName}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{userProfile.role}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 border-2 border-white shadow-sm overflow-hidden ring-1 ring-gray-100">
            <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        <button className="md:hidden p-2 text-gray-600"><Menu size={24} /></button>
      </div>
    </nav>
  );
}