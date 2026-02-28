"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Globe, Camera, Save, ShieldCheck, CheckCircle2, 
  Mail, Phone, History, Monitor, MapPin, Clock, Briefcase
} from 'lucide-react';
// Correct import for Vite/React-Router
import { useNavigate } from 'react-router-dom'; 
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    image: '',
    joinDate: '',
    phone: ''
  });

  // --- 1. Sync Logic ---
  const syncFromMasterData = () => {
    const currentUserEmail = localStorage.getItem('userEmail');
    if (!currentUserEmail) return;

    const masterStaffData = JSON.parse(localStorage.getItem('zway_staff_data') || '[]');
    const currentStaff = masterStaffData.find(
      (s: any) => s.email?.toLowerCase() === currentUserEmail?.toLowerCase()
    );

    if (currentStaff) {
      setProfile({
        name: currentStaff.name || '',
        email: currentStaff.email || '',
        role: currentStaff.role || 'Staff',
        image: currentStaff.image || '/unnamed.png',
        joinDate: currentStaff.joinDate || 'N/A',
        phone: currentStaff.phone || ''
      });
    }
    setLoginHistory(JSON.parse(localStorage.getItem('zway_login_logs') || '[]'));
  };

  useEffect(() => {
    syncFromMasterData();
    const handleGlobalUpdate = () => syncFromMasterData();
    window.addEventListener('storage', handleGlobalUpdate);
    window.addEventListener('profileUpdated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('storage', handleGlobalUpdate);
      window.removeEventListener('profileUpdated', handleGlobalUpdate);
    };
  }, []);

  // --- 2. Save Logic ---
  const handleUpdateMasterProfile = () => {
    if (!profile.name.trim()) return alert("Name cannot be empty!");
    const masterStaffData = JSON.parse(localStorage.getItem('zway_staff_data') || '[]');
    const updatedMasterData = masterStaffData.map((s: any) => {
      if (s.email?.toLowerCase() === profile.email?.toLowerCase()) {
        return { ...s, name: profile.name, image: profile.image, phone: profile.phone };
      }
      return s;
    });

    localStorage.setItem('zway_staff_data', JSON.stringify(updatedMasterData));
    window.dispatchEvent(new Event('profileUpdated'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-8 md:p-16 max-w-7xl mx-auto w-full"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 text-left w-full">
            <div className="space-y-2 mr-auto">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">Settings</h1>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Configurations</p>
            </div>
            
            <AnimatePresence>
              {isSaved && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-black text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl"
                >
                  <CheckCircle2 size={16} className="text-emerald-400" /> Master Data Synced
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Sidebar Tabs */}
            <aside className="w-full lg:w-64 space-y-3">
               <TabBtn active={activeTab === 'profile'} label="Identity" icon={<User size={18}/>} onClick={() => setActiveTab('profile')} />
               <TabBtn active={activeTab === 'activity'} label="Activity" icon={<History size={18}/>} onClick={() => setActiveTab('activity')} />
               <TabBtn active={activeTab === 'system'} label="Language" icon={<Globe size={18}/>} onClick={() => setActiveTab('system')} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-[48px] border border-zinc-100 p-10 md:p-16 shadow-sm">
              
              {activeTab === 'profile' && (
                <div className="space-y-12 text-left">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                      <div className="w-36 h-36 rounded-[48px] overflow-hidden bg-zinc-50 ring-8 ring-zinc-50 border-4 border-white shadow-2xl">
                        <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-black text-white rounded-[20px] shadow-2xl hover:bg-zinc-800 transition-all">
                        <Camera size={20} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                    <div className="text-center md:text-left space-y-3">
                      <div className="px-4 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest inline-block">{profile.role}</div>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase">{profile.name || 'User'}</h2>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-zinc-400 text-[10px] font-bold uppercase italic">
                         <span className="flex items-center gap-1"><Clock size={12}/> Joined {profile.joinDate}</span>
                         <span className="flex items-center gap-1"><Briefcase size={12}/> ID: ZW-{profile.email.split('@')[0]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 border-t border-zinc-50 pt-12">
                    <InputGroup label="Full Name" value={profile.name} onChange={(v: string) => setProfile({...profile, name: v})} icon={<User size={16}/>} />
                    <InputGroup label="Master Email" value={profile.email} readonly icon={<Mail size={16}/>} />
                    <InputGroup label="Phone Number" value={profile.phone} onChange={(v: string) => setProfile({...profile, phone: v})} icon={<Phone size={16}/>} />
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Status</label>
                       <div className="h-[60px] flex items-center px-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest italic">
                          <ShieldCheck size={16} className="mr-2"/> Verified Master Account
                       </div>
                    </div>
                  </div>

                  <button onClick={handleUpdateMasterProfile} className="w-full bg-black text-white font-black py-6 rounded-[24px] text-[10px] uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                    <Save size={18}/> Update Master Identity
                  </button>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-8 text-left">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Recent Sessions</h3>
                  <div className="space-y-4">
                    {loginHistory.length > 0 ? loginHistory.map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-[32px] border border-zinc-100">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-white rounded-[20px] shadow-sm"><Monitor size={22} /></div>
                          <div>
                            <p className="text-xs font-black italic uppercase">{profile.name} • {log.device}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase italic">{new Date(log.time).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    )) : (
                      <p className="text-zinc-400 text-xs italic">No history found.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-10">
                </div>
              )}

            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

// Sub-components
function TabBtn({ active, label, icon, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-5 rounded-[22px] transition-all ${active ? 'bg-black text-white shadow-xl' : 'text-zinc-400 hover:bg-zinc-100'}`}>
      <div className="flex items-center gap-4">
        {icon} <span className="text-[11px] font-black uppercase italic tracking-widest">{label}</span>
      </div>
    </button>
  );
}

function InputGroup({ label, value, onChange, icon, readonly }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300">{icon}</div>
        <input 
          readOnly={readonly} value={value} onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-zinc-50 border border-zinc-100 py-5 pl-12 pr-6 rounded-2xl text-sm font-black italic outline-none transition-all ${readonly ? 'opacity-50' : 'focus:bg-white focus:ring-4 focus:ring-black/5'}`} 
        />
      </div>
    </div>
  );
}

function LangBtn({ active, label, flag, onClick }: any) {
  return (
    <button onClick={onClick} className={`p-8 rounded-[32px] border-2 flex items-center gap-6 transition-all ${active ? 'border-black bg-white shadow-xl' : 'border-zinc-100 bg-zinc-50 opacity-60'}`}>
      <span className="text-4xl">{flag}</span>
      <span className={`font-black text-[11px] uppercase tracking-widest italic ${active ? 'text-black' : 'text-zinc-500'}`}>{label}</span>
    </button>
  );
}