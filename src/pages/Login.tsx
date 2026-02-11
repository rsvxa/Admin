"use client";

import React, { useState } from 'react';
import { LogIn, Mail, Lock, UserCheck, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role); 
      onLogin();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden font-sans bg-gray-50">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white w-full max-w-md rounded-[32px] shadow-xl p-10 border border-gray-100"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-md shadow-gray-600"
          >
            Z
          </motion.div>
          <h1 className="text-2xl font-bold text-black tracking-widest ml-1">{t('login_title')}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('login_subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* --- Role Selection --- */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                role === 'staff' 
                ? 'border-black bg-gray-50 text-black' 
                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
              }`}
            >
              <UserCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">{t('role_staff')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                role === 'admin' 
                ? 'border-black bg-gray-50 text-black' 
                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
              }`}
            >
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">{t('role_admin')}</span>
            </button>
          </motion.div>

          {/* --- Email Input --- */}
          <motion.div variants={itemVariants} className="space-y-2 text-left">
            <label className="text-[12px] font-bold text-black uppercase tracking-widest ml-1">{t('label_email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="name@company.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </motion.div>

          {/* --- Password Input --- */}
          <motion.div variants={itemVariants} className="space-y-2 text-left">
            <label className="text-[12px] font-bold text-black uppercase tracking-widest ml-1">{t('label_password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-black text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group mt-2 hover:bg-zinc-800 shadow-xl"
          >
            {t('btn_signin')} {role === 'admin' ? t('role_admin') : t('role_staff')}
            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}