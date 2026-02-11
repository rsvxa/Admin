"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Handbag,
  Users, 
  Settings, 
  LogOut,
  Store,
  UserPlus,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Sidebar() {
  const location = useLocation();
  // ២. ប្រកាសប្រើ t សម្រាប់បកប្រែ
  const { t } = useTranslation();
  
  const userRole = localStorage.getItem('userRole') || 'staff';

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: t('menu_dashboard'), 
      path: '/dashboard', 
      show: userRole === 'admin' 
    },
    { 
      icon: <ShoppingBag size={20} />, 
      label: t('menu_products'), 
      path: '/products', 
      show: true
    },
    { 
      icon: <Handbag size={20} />, 
      label: t('menu_ordering'), 
      path: '/ordering', 
      show: true 
    },
    { 
      icon: <CreditCard size={20} />, 
      label: t('menu_expenses'), 
      path: '/expenses', 
      show: userRole === 'admin' 
    },
    { 
      icon: <UserPlus size={20} />, 
      label: t('menu_staff'), 
      path: '/add-staff', 
      show: userRole === 'admin'
    },
    { 
      icon: <Users size={20} />, 
      label: t('menu_customers'), 
      path: '/customers', 
      show: userRole === 'admin' 
    },
    { 
      icon: <TrendingUp size={20} />, 
      label: t('menu_reports'), 
      path: '/report', 
      show: userRole === 'admin' 
    },
    { 
      icon: <Settings size={20} />, 
      label: t('menu_settings'), 
      path: '/settings', 
      show: userRole === 'admin'
    }
  ];

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 z-50">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
          <Store size={22} />
        </div>
        <div className="text-left">
          <span className="text-xl font-black text-gray-800 tracking-tighter uppercase italic block leading-none">ZWAY</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px] mt-1 block">Fashion</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4 scrollbar-hide text-left">
        <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[2.5px] mb-4">
          {/* ៤. បកប្រែពាក្យ Admin Control / Staff Access */}
          {userRole === 'admin' ? t('admin_control') : t('staff_access')}
        </p>
        
        {menuItems.filter(item => item.show).map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-black text-white shadow-xl shadow-black/10' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-50 bg-gray-50/30">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all group border border-transparent hover:border-rose-100"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          {/* ៥. បកប្រែពាក្យ Logout */}
          <span className="font-bold text-sm uppercase tracking-widest text-left">{t('menu_logout')}</span>
        </button>
      </div>
    </div>
  );
}