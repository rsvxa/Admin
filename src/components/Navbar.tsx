"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, CheckCheck, Info, Globe, Check, Package, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  
  const [userProfile, setUserProfile] = useState({ 
    fullName: 'Loading...', 
    avatar: '', 
    role: '' 
  });
  
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // --- ១. មុខងារបង្កើត Notifications ពី Orders & Products ---
  const generateNotifications = () => {
    const orders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const products = JSON.parse(localStorage.getItem('zway_products') || '[]');
    const allNotifications: any[] = [];

    // ទាញយក Order ដែលថ្មីៗ (Pending)
    const pendingOrders = orders
      .filter((o: any) => o.status === 'Pending')
      .slice(0, 3)
      .map((o: any) => ({
        id: `order-${o.id}`,
        type: 'order',
        title: t('new_order_alert', 'ការកុម្ម៉ង់ថ្មី'),
        message: `${o.customerName} បានកុម្ម៉ង់អស់ $${Number(o.total).toLocaleString()}`,
        time: 'Just now',
        read: false,
        icon: <ShoppingBag size={16} />
      }));

    // ទាញយកទំនិញដែលជិតអស់ពីស្តុក (Stock <= 5)
    const lowStockItems = products
      .filter((p: any) => (parseInt(p.stock || p.stocks || 0)) <= 5)
      .slice(0, 3)
      .map((p: any) => ({
        id: `stock-${p.id}`,
        type: 'stock',
        title: t('low_stock_alert', 'ទំនិញជិតអស់ពីស្តុក'),
        message: `${p.name} នៅសល់តែ ${p.stock || p.stocks} គ្រាប់ទៀតប៉ុណ្ណោះ`,
        time: 'System Update',
        read: false,
        icon: <Package size={16} />
      }));

    setNotifications([...pendingOrders, ...lowStockItems]);
  };

  const loadProfile = () => {
    const loginEmail = localStorage.getItem('userEmail');
    const savedStaff = localStorage.getItem('zway_staff_data');
    
    if (loginEmail && savedStaff) {
      const staffList = JSON.parse(savedStaff);
      const currentUser = staffList.find((s: any) => s.email.toLowerCase() === loginEmail.toLowerCase());
      
      if (currentUser) {
        setUserProfile({
          fullName: currentUser.name,
          avatar: currentUser.image || '',
          role: currentUser.role === 'admin' ? 'Administrator' : 'Staff Member'
        });
      }
    } else {
      setUserProfile({
        fullName: 'ZWAY User',
        avatar: '',
        role: localStorage.getItem('userRole') || 'Guest'
      });
    }
  };

  useEffect(() => {
    loadProfile();
    generateNotifications();
    
    const handleSync = () => {
      loadProfile();
      generateNotifications();
    };

    window.addEventListener('storage', handleSync);
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotif(false);
      if (langRef.current && !langRef.current.contains(event.target as Node)) setShowLang(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleSync);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [t]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLang(false);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40 italic">
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        
        {/* Language Switcher */}
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-1">
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

        {/* Notification Section */}
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
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-[30px] shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 italic">{t('notifications', 'ការជូនដំណឹង')}</h3>
                  <button onClick={markAllAsRead} className="text-[9px] font-black text-rose-500 uppercase hover:underline flex items-center gap-1">
                    <CheckCheck size={12} /> {t('mark_all_read', 'អានទាំងអស់')}
                  </button>
                </div>

                <div className="max-h-[380px] overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 mb-1 rounded-2xl flex gap-3 transition-colors cursor-pointer ${!n.read ? 'bg-zinc-50 border border-zinc-100' : 'opacity-60'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {n.icon}
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter italic">{n.title}</p>
                          <p className="text-[11px] text-gray-500 leading-tight mt-1 font-bold">{n.message}</p>
                          <p className="text-[8px] font-black text-gray-300 uppercase mt-2 tracking-widest">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-300 font-black uppercase text-[10px] italic">
                      {t('no_alerts', 'មិនមានការជូនដំណឹងថ្មី')}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block text-left">
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