"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, CheckCheck, Info, Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  
  // State សម្រាប់ Profile
  const [userProfile, setUserProfile] = useState({ 
    fullName: 'Loading...', 
    avatar: '', 
    role: '' 
  });
  
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'ការលក់ថ្មី', message: 'អ្នកទើបតែទទួលបានការកុម្ម៉ង់ $45.00', time: '2 នាទីមុន', read: false },
    { id: 2, title: 'ស្តុកទំនិញ', message: 'អាវយឺត ZWAY Classic ជិតអស់ពីស្តុកហើយ', time: '1 ម៉ោងមុន', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLang(false);
    localStorage.setItem('i18nextLng', lng);
  };

  // --- មុខងារទាញយកទិន្នន័យ Profile ពិតប្រាកដពីបញ្ជីបុគ្គលិក ---
  const loadProfile = () => {
    const loginEmail = localStorage.getItem('userEmail');
    const savedStaff = localStorage.getItem('zway_staff_data');
    
    if (loginEmail && savedStaff) {
      const staffList = JSON.parse(savedStaff);
      // ស្វែងរកទិន្នន័យបុគ្គលិកដែលមាន Email ដូចអ្នក Login
      const currentUser = staffList.find((s: any) => s.email.toLowerCase() === loginEmail.toLowerCase());
      
      if (currentUser) {
        setUserProfile({
          fullName: currentUser.name,
          avatar: currentUser.image || '/unnamed.png', // បើគ្មានរូបប្រើរូប default
          role: currentUser.role === 'admin' ? 'Administrator' : 'Staff Member'
        });
      }
    } else {
      // ករណីរកមិនឃើញ (Default)
      setUserProfile({
        fullName: 'ZWAY User',
        avatar: '/unnamed.png',
        role: localStorage.getItem('userRole') || 'Guest'
      });
    }
  };

  useEffect(() => {
    loadProfile();
    
    // ចាប់យកការផ្លាស់ប្តូរទិន្នន័យ (ក្រែងលោ Admin កែឈ្មោះខ្លួនឯងក្នុងទំព័រ ManageStaff)
    window.addEventListener('storage', loadProfile);
    
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
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40 italic">
      
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        
        {/* --- Language Switcher --- */}
        <div className="relative" ref={langRef}>
          <button 
            onClick={() => { setShowLang(!showLang); setShowNotif(false); }}
            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all border ${showLang ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}
          >
            <Globe size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">
              {i18n.language === 'kh' ? 'KH' : 'EN'}
            </span>
          </button>

          <AnimatePresence>
            {showLang && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-1"
              >
                <button onClick={() => changeLanguage('en')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase rounded-xl transition-colors ${i18n.language === 'en' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                  English {i18n.language === 'en' && <Check size={12} />}
                </button>
                <button onClick={() => changeLanguage('kh')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase rounded-xl transition-colors ${i18n.language === 'kh' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
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
                className="absolute right-0 mt-3 w-80 bg-white rounded-[30px] shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 italic">Notifications</h3>
                  <button onClick={markAllAsRead} className="text-[9px] font-black text-rose-500 uppercase hover:underline flex items-center gap-1">
                    <CheckCheck size={12} /> {t('mark_all_read', 'អានទាំងអស់')}
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 mb-1 rounded-2xl flex gap-3 transition-colors cursor-pointer ${!n.read ? 'bg-gray-50' : 'opacity-60'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Info size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter italic">{n.title}</p>
                          <p className="text-[11px] text-gray-500 leading-tight mt-1 font-bold">{n.message}</p>
                          <p className="text-[8px] font-black text-gray-300 uppercase mt-2 tracking-widest">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-300 font-black uppercase text-[10px]">No new alerts</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        {/* --- User Profile Section --- */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-tighter leading-none italic">
              {userProfile.fullName}
            </p>
            <p className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] mt-1.5">
              {userProfile.role}
            </p>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-zinc-100 border-2 border-white shadow-lg overflow-hidden ring-1 ring-gray-100">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-black italic uppercase">
                {userProfile.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <button className="md:hidden p-2 text-gray-600"><Menu size={24} /></button>
      </div>
    </nav>
  );
}