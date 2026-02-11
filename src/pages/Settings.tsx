"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Lock, Globe, Camera, Save, ShieldCheck, Laptop, CheckCircle2, UploadCloud 
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  // --- State សម្រាប់ទិន្នន័យ ---
  const [profile, setProfile] = useState({
    fullName: 'Sitha THUL',
    email: 'sitha.zway@gmail.com',
    phone: '+855 12 345 678',
    avatar: '/unnamed.png' // រូបភាពដើម
  });

  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

  // ទាញយកទិន្នន័យពី LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('zway_user_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // --- មុខងារប្តូររូបភាព (Image Upload) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- មុខងាររក្សាទុក ---
  const handleSave = () => {
    localStorage.setItem('zway_user_profile', JSON.stringify(profile));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    // បញ្ជូន Event ទៅ Navbar ដើម្បីប្តូររូបភាពតាមដែរ
    window.dispatchEvent(new Event('storage'));
  };

  const tabs = [
    { id: 'profile', label: t('tab_profile'), icon: User },
    { id: 'security', label: t('tab_security'), icon: Lock },
    { id: 'system', label: t('tab_system'), icon: Laptop },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <motion.main 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10"
        >
          {/* Header */}
          <div className="mb-10 text-left flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">{t('settings_title')}</h1>
              <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[2px] mt-1">{t('settings_subtitle')}</p>
            </div>
            {isSaved && (
              <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                <CheckCircle2 size={14} /> {t('msg_saved_success')}
              </motion.div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </aside>

            <div className="flex-1">
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-12">
                
                {activeTab === 'profile' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 border-b border-gray-50 pb-8">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-[40px] bg-zinc-100 overflow-hidden border-4 border-white shadow-lg">
                          <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageChange} 
                          className="hidden" 
                          accept="image/*" 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 p-3 bg-black text-white rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95"
                        >
                          <Camera size={18} />
                        </button>
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-black text-gray-900 leading-none">{profile.fullName}</h3>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mt-2">{t('role_admin_access')}</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <InputGroup label={t('label_full_name')} value={profile.fullName} onChange={(v) => setProfile({...profile, fullName: v})} />
                      <InputGroup label={t('label_email')} value={profile.email} onChange={(v) => setProfile({...profile, email: v})} />
                      <InputGroup label={t('label_phone')} value={profile.phone} onChange={(v) => setProfile({...profile, phone: v})} />
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('label_role_status')}</label>
                        <div className="bg-zinc-50 px-5 py-4 rounded-2xl text-sm font-bold text-zinc-500 border border-zinc-100">{t('role_founder')}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Security & System Sections (រក្សាទុកដូចមុន) --- */}
                {activeTab === 'security' && (
                   <div className="space-y-8 animate-in fade-in duration-500 text-left">
                     <h3 className="text-lg font-black flex items-center gap-2 uppercase"><ShieldCheck className="text-emerald-500" /> {t('security_auth_title')}</h3>
                     <div className="space-y-6">
                        <InputGroup label={t('label_current_password')} type="password" value={password.current} onChange={(v)=>setPassword({...password, current: v})} placeholder="••••••••" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputGroup label={t('label_new_password')} type="password" value={password.new} onChange={(v)=>setPassword({...password, new: v})} placeholder="••••••••" />
                          <InputGroup label={t('label_confirm_password')} type="password" value={password.confirm} onChange={(v)=>setPassword({...password, confirm: v})} placeholder="••••••••" />
                        </div>
                     </div>
                   </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <h3 className="text-lg font-black flex items-center gap-2 uppercase"><Globe className="text-indigo-500" /> {t('section_language')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <LanguageBtn active={i18n.language === 'en'} label="English" flag="🇺🇸" onClick={() => i18n.changeLanguage('en')} />
                      <LanguageBtn active={i18n.language === 'kh'} label="ភាសាខ្មែរ" flag="🇰🇭" onClick={() => i18n.changeLanguage('kh')} />
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end gap-4">
                  <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors">{t('btn_discard')}</button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:-translate-y-1 transition-all">
                    <Save size={16} /> {t('btn_save_changes')}
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

// Components ជំនួយ
function InputGroup({ label, value, onChange, type="text", placeholder="" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">{label}</label>
      <input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="bg-white border border-gray-100 px-5 py-4 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-black/5 outline-none transition-all" />
    </div>
  );
}

function LanguageBtn({ active, label, flag, onClick }: any) {
  return (
    <button onClick={onClick} className={`p-6 rounded-[32px] border-2 flex items-center justify-between transition-all ${active ? 'border-black bg-gray-50' : 'border-gray-100 opacity-60'}`}>
      <div className="flex items-center gap-4">
        <span className="text-2xl">{flag}</span>
        <span className="font-black text-xs uppercase tracking-widest">{label}</span>
      </div>
      {active && <ShieldCheck size={16} className="text-black" />}
    </button>
  );
}