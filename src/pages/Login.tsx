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

  // --- អនុគមន៍សម្រាប់កត់ត្រាប្រវត្តិ Login (Activity Log Logic) ---
  const createLoginLog = (userName: string, userRole: string) => {
    // ១. ទាញយក Log ចាស់ៗពី LocalStorage
    const existingLogs = JSON.parse(localStorage.getItem('zway_login_logs') || '[]');

    // ២. កំណត់សម្គាល់ឧបករណ៍ (Device Detection បែបសាមញ្ញ)
    const userAgent = navigator.userAgent;
    let deviceName = "Unknown Device";
    if (userAgent.match(/iPhone/i)) deviceName = "iPhone";
    else if (userAgent.match(/Android/i)) deviceName = "Android Mobile";
    else if (userAgent.match(/Mac/i)) deviceName = "MacBook / macOS";
    else if (userAgent.match(/Windows/i)) deviceName = "Windows PC";

    // ៣. បង្កើតទិន្នន័យ Log ថ្មី
    const newLog = {
      id: Date.now(),
      user: userName,
      role: userRole.charAt(0).toUpperCase() + userRole.slice(1), // ប្តូរទៅជា 'Admin' ឬ 'Staff'
      device: deviceName,
      location: 'Phnom Penh, KH', // អាចប្រើ Geolocation API បន្ថែមបើចង់បានទីតាំងពិត
      time: new Date().toISOString(),
      status: 'Success'
    };

    // ៤. រក្សាទុកចូល LocalStorage (រក្សាទុកតែ ២០ ចុងក្រោយ)
    const updatedLogs = [newLog, ...existingLogs].slice(0, 20);
    localStorage.setItem('zway_login_logs', JSON.stringify(updatedLogs));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ១. ទាញយកបញ្ជីបុគ្គលិកដែល Admin បានរក្សាទុក
    const savedStaff = localStorage.getItem('zway_staff_data');
    const staffList = savedStaff ? JSON.parse(savedStaff) : [];

    // ២. ឆែកមើលថាតើ Email ដែលវាយបញ្ចូល មាននៅក្នុងបញ្ជីបុគ្គលិកដែរឬទេ
    const foundUser = staffList.find(
      (user: any) => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.role === role
    );

    // លក្ខខណ្ឌពិសេស៖ អនុញ្ញាតឱ្យចូលសម្រាប់ Demo ប្រសិនបើបញ្ជីបុគ្គលិកនៅទទេ (Optional)
    const isAdminDemo = email === "admin@zway.com" && role === "admin";

    if (foundUser || isAdminDemo) {
      const finalName = foundUser ? foundUser.name : "System Admin";
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role); 
      localStorage.setItem('userEmail', email.toLowerCase()); 
      localStorage.setItem('userName', finalName);

      // --- កត់ត្រាចូលក្នុង Activity Log មុនពេល Redirect ---
      createLoginLog(finalName, role);

      onLogin();
      
      // បញ្ជូនទៅកាន់ Dashboard តាមតួនាទី
      setTimeout(() => {
        window.location.href = role === 'admin' ? '/dashboard' : '/staffdashboard';
      }, 100);
      
    } else {
      alert(t('error_user_not_found', 'រកមិនឃើញគណនីនេះក្នុងប្រព័ន្ធឡើយ! សូមពិនិត្យអ៊ីមែល ឬតួនាទីរបស់អ្នកឡើងវិញ។'));
    }
  };

  // Variants សម្រាប់ Animation
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
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden font-sans bg-gray-50 italic text-left">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 border border-gray-100"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div 
            whileHover={{ rotate: -10, scale: 1.1 }}
            className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-xl shadow-black/20 italic"
          >
            Z
          </motion.div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">{t('login_title', 'ចូលប្រើប្រាស់')}</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">{t('login_subtitle', 'គ្រប់គ្រងហាងហ្វេសិនរបស់អ្នក')}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Role Selection --- */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all ${
                role === 'staff' 
                ? 'border-black bg-black text-white shadow-lg' 
                : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <UserCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('role_staff', 'បុគ្គលិក')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all ${
                role === 'admin' 
                ? 'border-black bg-black text-white shadow-lg' 
                : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('role_admin', 'អ្នកគ្រប់គ្រង')}</span>
            </button>
          </motion.div>

          {/* --- Email Input --- */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t('label_email', 'អ៊ីមែល')}</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 border-none rounded-[20px] py-4 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all italic"
                placeholder="staff@zway.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </motion.div>

          {/* --- Password Input --- */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t('label_password', 'លេខសម្ងាត់')}</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-gray-50 border-none rounded-[20px] py-4 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all italic"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.button 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-black text-white py-5 rounded-[24px] transition-all flex items-center justify-center gap-3 group mt-4 shadow-xl shadow-black/20"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              {t('btn_signin', 'ចូលប្រព័ន្ធ')}
            </span>
            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}