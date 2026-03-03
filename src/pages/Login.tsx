"use client";

import React, { useState } from 'react';
import { LogIn, Mail, Lock, UserCheck, ShieldCheck, Key, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  
  // States សម្រាប់គ្រប់គ្រងលំហូរ 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  // --- អនុគមន៍កត់ត្រា Log ---
  const createLoginLog = (userName: string, userRole: string) => {
    const existingLogs = JSON.parse(localStorage.getItem('zway_login_logs') || '[]');
    const userAgent = navigator.userAgent;
    let deviceName = "Unknown Device";
    if (userAgent.match(/iPhone/i)) deviceName = "iPhone";
    else if (userAgent.match(/Android/i)) deviceName = "Android Mobile";
    else if (userAgent.match(/Windows/i)) deviceName = "Windows PC";
    else if (userAgent.match(/Mac/i)) deviceName = "MacBook / macOS";

    const newLog = {
      id: Date.now(),
      user: userName,
      role: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      device: deviceName,
      location: 'Phnom Penh, KH',
      time: new Date().toISOString(),
      status: 'Success'
    };

    const updatedLogs = [newLog, ...existingLogs].slice(0, 20);
    localStorage.setItem('zway_login_logs', JSON.stringify(updatedLogs));
  };

  // --- វគ្គទី ១: ឆែក Email & Password ---
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedStaff = localStorage.getItem('zway_staff_data');
    const staffList = savedStaff ? JSON.parse(savedStaff) : [];

    // ស្វែងរក User
    const foundUser = staffList.find(
      (user: any) => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.role === role
    );

    const isAdminDemo = email === "admin@zway.com" && role === "admin" && password === "admin123";

    if (foundUser || isAdminDemo) {
      const userToAuth = foundUser || { name: "System Admin", email: "admin@zway.com", role: "admin", twoFactorEnabled: false };
      
      // បើគណនីនោះបើក 2FA
      if (userToAuth.twoFactorEnabled) {
        setTempUser(userToAuth);
        setShow2FA(true);
      } else {
        // បើមិនបើក 2FA ទេ ឱ្យចូលតែម្តង
        proceedToLogin(userToAuth);
      }
    } else {
      alert(t('error_login', 'រកមិនឃើញគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!'));
    }
  };

  // --- វគ្គទី ២: ផ្ទៀងផ្ទាត់លេខកូដ 2FA ---
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ឆែកមើលថាតើលេខកូដដែលវាយបញ្ចូល មានក្នុងបញ្ជី Backup Codes របស់ User ដែរឬទេ
    const isValidCode = tempUser.backupCodes?.includes(twoFactorCode);

    if (isValidCode) {
      // លុបលេខកូដដែលប្រើរួចចេញ (Single-use logic)
      const updatedStaffData = JSON.parse(localStorage.getItem('zway_staff_data') || '[]').map((s: any) => {
        if (s.email === tempUser.email) {
          return { ...s, backupCodes: s.backupCodes.filter((c: string) => c !== twoFactorCode) };
        }
        return s;
      });
      localStorage.setItem('zway_staff_data', JSON.stringify(updatedStaffData));
      
      proceedToLogin(tempUser);
    } else {
      alert("លេខកូដ 2FA មិនត្រឹមត្រូវឡើយ!");
    }
  };

  // --- វគ្គបញ្ចប់: កំណត់ Session និងចូលទៅកាន់ Dashboard ---
  const proceedToLogin = (user: any) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', user.role); 
    localStorage.setItem('userEmail', user.email.toLowerCase()); 
    localStorage.setItem('userName', user.name);

    createLoginLog(user.name, user.role);
    onLogin();

    setTimeout(() => {
      window.location.href = user.role === 'admin' ? '/dashboard' : '/staffdashboard';
    }, 100);
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 font-sans italic text-left">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 border border-gray-100"
      >
        <AnimatePresence mode="wait">
          {!show2FA ? (
            /* --- ទម្រង់ Login ធម្មតា --- */
            <motion.div key="login" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 italic">Z</div>
                <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">{t('login_title', 'ចូលប្រើប្រាស់')}</h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Master Identity Access</p>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <RoleBtn active={role === 'staff'} onClick={() => setRole('staff')} label="Staff" icon={<UserCheck size={20}/>} />
                  <RoleBtn active={role === 'admin'} onClick={() => setRole('admin')} label="Admin" icon={<ShieldCheck size={20}/>} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Identity</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-gray-50 border-none rounded-[20px] py-4 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all italic" placeholder="name@zway.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-[20px] py-4 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all italic" placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-white py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verify Credentials</span>
                  <LogIn size={18} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <button onClick={() => setShow2FA(true)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-black transition-colors">
                <ArrowLeft size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
              </button>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 italic">
                  <Key size={28} />
                </div>
                <h1 className="text-2xl font-black text-black tracking-tighter uppercase italic">2-Step Verification</h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-2">Enter one of your 6-digit backup codes</p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                    <input 
                      type="text" 
                      required 
                      autoFocus
                      maxLength={6}
                      placeholder="000000"
                      value={twoFactorCode} 
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-5 text-center text-2xl font-black tracking-[0.5em] focus:bg-white focus:border-gray-500 outline-none transition-all text-black-600"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-white py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-gray-200 hover:scale-[1.02] transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Authorize Access</span>
                  <LogIn size={18} />
                </button>
                
                <p className="text-[9px] text-gray-400 text-center font-bold uppercase italic leading-relaxed">
                  Protecting account: {tempUser.email}
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function RoleBtn({ active, onClick, label, icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all ${
        active 
        ? 'border-black bg-black text-white shadow-lg' 
        : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
      }`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}