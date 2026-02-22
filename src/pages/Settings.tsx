"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Globe, Camera, Save, ShieldCheck, 
  CheckCircle2, ChevronRight, Mail, Phone, Fingerprint, Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  // ១. ទាញទិន្នន័យពី LocalStorage ជា Default
  const [profile, setProfile] = useState({
    fullName: 'Sitha THUL',
    email: 'sitha.zway@gmail.com',
    phone: '+855 12 345 678',
    avatar: '/unnamed.png'
  });

  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem('zway_user_profile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    };

    loadProfile();
    // ស្តាប់ការផ្លាស់ប្តូរពី Tab ផ្សេងៗ ឬទំព័រផ្សេង
    window.addEventListener('storage', loadProfile);
    window.addEventListener('profileUpdated', loadProfile);
    
    return () => {
      window.removeEventListener('storage', loadProfile);
      window.removeEventListener('profileUpdated', loadProfile);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // រក្សាទុកក្នុង LocalStorage
    localStorage.setItem('zway_user_profile', JSON.stringify(profile));
    
    // បាញ់ Custom Event ដើម្បីប្រាប់ Navbar ឱ្យ Update ភ្លាមៗ (Reactive UI)
    window.dispatchEvent(new Event('profileUpdated'));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: t('tab_profile', 'Profile'), icon: User },
    { id: 'security', label: t('tab_security', 'Security'), icon: Lock },
    { id: 'system', label: t('tab_system', 'Language'), icon: Globe },
  ];

  return (
    <div className="flex min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-black selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <motion.main 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-16 max-w-7xl mx-auto w-full"
        >
          {/* Header Section */}
          <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-zinc-400 font-black text-[10px] uppercase tracking-[0.3em]">
                <Sparkles size={14} className="text-amber-500" /> {t('preferences_subtitle', 'System Preferences')}
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                {t('settings_title', 'Settings')}
              </h1>
            </div>

            <AnimatePresence>
              {isSaved && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 bg-black text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-2xl italic"
                >
                  <CheckCircle2 size={16} className="text-emerald-400" /> {t('msg_saved_success', 'Configuration Saved')}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Navigation Tabs */}
            <aside className="w-full lg:w-72 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 ml-4 mb-6 text-left">Account Overview</p>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group w-full flex items-center justify-between px-6 py-5 rounded-[24px] transition-all duration-500 ${
                    activeTab === tab.id 
                    ? 'bg-black text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]' 
                    : 'bg-transparent text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-zinc-800' : 'bg-zinc-100 group-hover:bg-white'}`}>
                      <tab.icon size={20} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-widest italic">{tab.label}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-transform duration-500 ${activeTab === tab.id ? 'rotate-90' : 'opacity-0'}`} />
                </button>
              ))}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-[48px] border border-zinc-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] p-10 md:p-16 relative overflow-hidden">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-[56px] overflow-hidden ring-8 ring-zinc-50 border-4 border-white shadow-2xl transition-transform duration-700 group-hover:scale-105">
                          <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 p-4 bg-black text-white rounded-[20px] shadow-2xl hover:bg-zinc-800 transition-all hover:rotate-12 active:scale-90"
                        >
                          <Camera size={20} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                      </div>
                      <div className="text-center md:text-left space-y-3">
                        <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500 inline-block">System Admin</div>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase">{profile.fullName}</h3>
                        <p className="text-zinc-400 font-medium text-sm">Update your personal photo and public details.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 text-left">
                      <PremiumInput label={t('label_full_name', 'Full Name')} icon={<User size={16}/>} value={profile.fullName} onChange={(v: string) => setProfile({...profile, fullName: v})} />
                      <PremiumInput label={t('label_email', 'Email Address')} icon={<Mail size={16}/>} value={profile.email} onChange={(v: string) => setProfile({...profile, email: v})} />
                      <PremiumInput label={t('label_phone', 'Phone Number')} icon={<Phone size={16}/>} value={profile.phone} onChange={(v: string) => setProfile({...profile, phone: v})} />
                      <div className="space-y-3 flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Account Rank</label>
                        <div className="h-[62px] flex items-center px-6 bg-zinc-50 rounded-[22px] border border-zinc-100 text-xs font-black uppercase italic tracking-widest text-zinc-400">
                          {t('role_founder', 'ZWAY Founder & Lead')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-zinc-50 pb-8">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[20px]">
                        <Fingerprint size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight">{t('security_auth_title', 'Security')}</h3>
                        <p className="text-zinc-400 text-sm font-medium">Protect your workspace with high-grade security.</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <PremiumInput label={t('label_current_password', 'Current Password')} type="password" value={password.current} onChange={(v: any)=>setPassword({...password, current: v})} placeholder="••••••••" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <PremiumInput label={t('label_new_password', 'New Password')} type="password" value={password.new} onChange={(v: any)=>setPassword({...password, new: v})} placeholder="••••••••" />
                        <PremiumInput label={t('label_confirm_password', 'Confirm New Password')} type="password" value={password.confirm} onChange={(v: any)=>setPassword({...password, confirm: v})} placeholder="••••••••" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* System Tab */}
                {activeTab === 'system' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-zinc-50 pb-8">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[20px]">
                        <Globe size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight">{t('section_language', 'Global Language')}</h3>
                        <p className="text-zinc-400 text-sm font-medium">Sync your workspace language preferences.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <PremiumLanguageBtn active={i18n.language === 'en'} label="English (US)" flag="🇺🇸" onClick={() => i18n.changeLanguage('en')} />
                      <PremiumLanguageBtn active={i18n.language === 'kh'} label="ភាសាខ្មែរ (KH)" flag="🇰🇭" onClick={() => i18n.changeLanguage('kh')} />
                    </div>
                  </motion.div>
                )}

                {/* Bottom Actions */}
                <div className="mt-20 pt-10 border-t border-zinc-50 flex flex-col sm:flex-row justify-end gap-6">
                  <button onClick={() => window.location.reload()} className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all italic">
                    {t('btn_discard', 'Reset View')}
                  </button>
                  <button onClick={handleSave} className="group relative flex items-center justify-center gap-3 bg-black text-white px-12 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-500">
                    <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
                    {t('btn_save_changes', 'Save Configuration')}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

// Sub-components --------------------------------------------------------------------------------

function PremiumInput({ label, value, onChange, type="text", placeholder="", icon }: any) {
  return (
    <div className="flex flex-col gap-3 group">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 group-focus-within:text-black transition-colors">
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors">{icon}</div>}
        <input 
          type={type} 
          value={value} 
          onChange={(e)=>onChange(e.target.value)} 
          placeholder={placeholder} 
          className={`w-full bg-zinc-50 border border-zinc-100 ${icon ? 'pl-14' : 'px-6'} pr-6 py-5 rounded-[22px] text-sm font-black italic shadow-sm focus:bg-white focus:ring-[8px] focus:ring-black/5 focus:border-black/10 outline-none transition-all duration-500`} 
        />
      </div>
    </div>
  );
}

function PremiumLanguageBtn({ active, label, flag, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`relative p-8 rounded-[35px] border-2 flex items-center gap-6 transition-all duration-700 overflow-hidden group ${
        active 
        ? 'border-black bg-white shadow-2xl' 
        : 'border-zinc-100 bg-zinc-50 opacity-60 hover:opacity-100 hover:border-zinc-300'
      }`}
    >
      <div className={`text-4xl transition-transform duration-700 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{flag}</div>
      <div className="text-left">
        <span className={`block font-black text-[11px] uppercase tracking-[0.2em] italic ${active ? 'text-black' : 'text-zinc-500'}`}>{label}</span>
        {active && <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Active</span>}
      </div>
      {active && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
          <ShieldCheck size={16} />
        </div>
      )}
    </button>
  );
}