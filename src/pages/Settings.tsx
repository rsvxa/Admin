"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Database, Camera, Save, ShieldCheck, CheckCircle2, 
  Mail, Phone, History, Monitor, Briefcase, Clock, 
  Download, Upload, Lock, ShieldAlert, Key, Copy, RefreshCw, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next'; 
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CryptoJS from 'crypto-js';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    name: '', email: '', role: '', image: '', joinDate: '', phone: ''
  });

  const [backupPassword, setBackupPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // ឆែកមើលថា តើអ្នកប្រើប្រាស់បច្ចុប្បន្នជា Admin ឬ Staff
  const isAdmin = profile.role?.toLowerCase() === 'admin' || profile.role?.toLowerCase() === 'manager';

  // --- 1. Auto-Clear Activity Logs at 11:00 PM ---
  useEffect(() => {
    const checkTimeAndClear = () => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 0) {
        localStorage.removeItem('zway_login_logs');
        setLoginHistory([]);
      }
    };
    const interval = setInterval(checkTimeAndClear, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Load Data ---
  useEffect(() => {
    const syncData = () => {
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
        setIs2FAEnabled(!!currentStaff.twoFactorEnabled);
        setBackupCodes(currentStaff.backupCodes || []);
      }
      setLoginHistory(JSON.parse(localStorage.getItem('zway_login_logs') || '[]'));
    };

    syncData();
    window.addEventListener('profileUpdated', syncData);
    return () => window.removeEventListener('profileUpdated', syncData);
  }, []);

  // --- 3. 2FA & Backup Logic (រក្សាទុកតែសម្រាប់ Admin) ---
  const generateBackupCodes = () => {
    const codes = Array.from({ length: 5 }, () => Math.floor(100000 + Math.random() * 900000).toString());
    setBackupCodes(codes);
    return codes;
  };

  const toggle2FA = () => {
    const newStatus = !is2FAEnabled;
    let newCodes = backupCodes;
    if (newStatus && backupCodes.length === 0) newCodes = generateBackupCodes();
    const masterStaffData = JSON.parse(localStorage.getItem('zway_staff_data') || '[]');
    const updatedData = masterStaffData.map((s: any) => 
      s.email?.toLowerCase() === profile.email?.toLowerCase() ? { ...s, twoFactorEnabled: newStatus, backupCodes: newCodes } : s
    );
    localStorage.setItem('zway_staff_data', JSON.stringify(updatedData));
    setIs2FAEnabled(newStatus);
  };

  const handleExportBackup = () => {
    if (!backupPassword) return alert(t('settings.alerts.set_password'));
    const allData = { staff: JSON.parse(localStorage.getItem('zway_staff_data') || '[]'), logs: loginHistory, timestamp: new Date().toISOString() };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(allData), backupPassword).toString();
    const blob = new Blob([encrypted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `zway_backup_${new Date().getTime()}.zway`;
    a.click();
  };

  const handleUpdateMasterProfile = () => {
    const masterStaffData = JSON.parse(localStorage.getItem('zway_staff_data') || '[]');
    const updated = masterStaffData.map((s: any) => 
      s.email?.toLowerCase() === profile.email?.toLowerCase() ? { ...s, name: profile.name, phone: profile.phone, image: profile.image } : s
    );
    localStorage.setItem('zway_staff_data', JSON.stringify(updated));
    window.dispatchEvent(new Event('profileUpdated'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans italic selection:bg-black selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 md:p-16 max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase text-left">{t('settings.title')}</h1>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-left">{t('settings.subtitle')}</p>
            </div>
            <AnimatePresence>
              {isSaved && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-black text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl">
                  <CheckCircle2 size={16} className="text-emerald-400" /> {t('settings.status.synced')}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            <aside className="w-full lg:w-64 space-y-3">
               <TabBtn active={activeTab === 'profile'} label={t('settings.tabs.identity')} icon={<User size={18}/>} onClick={() => setActiveTab('profile')} />
               
               {/* លាក់ Tab ទាំងនេះ ប្រសិនបើមិនមែនជា Admin */}
               {isAdmin && (
                 <>
                  <TabBtn active={activeTab === 'activity'} label={t('settings.tabs.activity')} icon={<History size={18}/>} onClick={() => setActiveTab('activity')} />
                  <TabBtn active={activeTab === '2fa'} label={t('settings.tabs.security')} icon={<ShieldAlert size={18}/>} onClick={() => setActiveTab('2fa')} />
                  <TabBtn active={activeTab === 'backup'} label={t('settings.tabs.backup')} icon={<Database size={18}/>} onClick={() => setActiveTab('backup')} />
                 </>
               )}
            </aside>

            <div className="flex-1 bg-white rounded-[48px] border border-zinc-100 p-10 md:p-16 shadow-sm min-h-[600px]">
              
              {/* PROFILE TAB - Staff អាចចូលបាន */}
              {activeTab === 'profile' && (
                <div className="space-y-12 text-left">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                      <div className="w-36 h-36 rounded-[48px] overflow-hidden bg-zinc-50 ring-8 ring-zinc-50 border-4 border-white shadow-2xl">
                        <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-black text-white rounded-[20px] shadow-2xl hover:bg-zinc-800 transition-all active:scale-90">
                        <Camera size={20} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProfile({...profile, image: reader.result as string});
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" accept="image/*" />
                    </div>
                    <div className="space-y-3">
                      <div className="px-4 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest inline-block">{profile.role}</div>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase">{profile.name}</h2>
                      <div className="flex gap-4 text-zinc-400 text-[10px] font-bold uppercase italic text-left">
                         <span className="flex items-center gap-1"><Clock size={12}/> {t('settings.profile.joined')} {profile.joinDate}</span>
                         <span className="flex items-center gap-1"><Briefcase size={12}/> ID: ZW-{profile.email.split('@')[0]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 border-t border-zinc-50 pt-12">
                    <InputGroup label={t('settings.profile.full_name')} value={profile.name} onChange={(v: string) => setProfile({...profile, name: v})} icon={<User size={16}/>} />
                    <InputGroup label={t('settings.profile.master_email')} value={profile.email} readonly icon={<Mail size={16}/>} />
                    <InputGroup label={t('settings.profile.phone')} value={profile.phone} onChange={(v: string) => setProfile({...profile, phone: v})} icon={<Phone size={16}/>} />
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{t('settings.profile.shield')}</label>
                       <div className="h-[60px] flex items-center px-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest italic">
                          <ShieldCheck size={16} className="mr-2"/> {t('settings.profile.authenticated')}
                       </div>
                    </div>
                  </div>
                  <button onClick={handleUpdateMasterProfile} className="w-full bg-black text-white font-black py-6 rounded-[24px] text-[10px] uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                    <Save size={18}/> {t('settings.profile.save_btn')}
                  </button>
                </div>
              )}

              {/* SECURITY / ACTIVITY / BACKUP TABS - សម្រាប់តែ Admin */}
              {isAdmin && (
                <>
                  {activeTab === 'activity' && (
                    <div className="space-y-8 text-left">
                      <div className="flex justify-between items-end border-b border-zinc-50 pb-6">
                        <div className="space-y-1 text-left">
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('settings.activity.title')}</h3>
                           <p className="text-[10px] text-zinc-400 font-bold uppercase italic">{t('settings.activity.note')}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-4 py-2 rounded-full">
                          <Clock size={12}/> {t('settings.activity.auto_clear')}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {loginHistory.length > 0 ? loginHistory.map((log, i) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-[32px] border border-zinc-100 hover:bg-zinc-100 transition-colors">
                            <div className="flex items-center gap-5">
                              <div className="p-4 bg-white rounded-[20px] shadow-sm text-black"><Monitor size={22} /></div>
                              <div className="text-left">
                                <p className="text-xs font-black italic uppercase">{log.user || 'Unknown'} • <span className="text-zinc-400">{log.role}</span></p>
                                <div className="flex gap-3 mt-1">
                                  <p className="text-[9px] text-zinc-400 font-bold uppercase italic flex items-center gap-1"><Monitor size={10}/> {log.device}</p>
                                  <p className="text-[9px] text-zinc-400 font-bold uppercase italic flex items-center gap-1"><Clock size={10}/> {new Date(log.time).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">{t('settings.activity.authorized')}</span>
                          </div>
                        )) : (
                          <div className="py-20 text-center space-y-4 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-100">
                             <Trash2 size={40} className="mx-auto text-zinc-200" />
                             <p className="text-zinc-400 text-xs font-black uppercase italic tracking-widest">{t('settings.activity.no_logs')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === '2fa' && (
                    <div className="space-y-10 text-left">
                      <div className="flex justify-between items-center text-left">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('settings.security.title')}</h3>
                          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest italic">{t('settings.security.subtitle')}</p>
                        </div>
                        <button onClick={toggle2FA} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${is2FAEnabled ? 'bg-black text-white shadow-lg' : 'bg-zinc-100 text-zinc-400'}`}>
                          {is2FAEnabled ? t('settings.security.enabled') : t('settings.security.disabled')}
                        </button>
                      </div>
                      {is2FAEnabled ? (
                        <div className="space-y-8">
                          <div className="p-8 bg-zinc-900 rounded-[40px] text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                              <div className="flex items-center gap-3"><Key className="text-emerald-400" size={20} /><p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('settings.security.backup_codes')}</p></div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {backupCodes.map((code, i) => (
                                  <div key={i} className="bg-white/10 p-4 rounded-2xl font-mono text-xl tracking-widest flex justify-between items-center group">
                                    {code} <Copy size={14} className="text-white/20 group-hover:text-white cursor-pointer" onClick={() => { navigator.clipboard.writeText(code); alert(t('settings.alerts.code_copied')); }} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <ShieldAlert size={120} className="absolute -right-10 -bottom-10 text-white/5" />
                          </div>
                          <button onClick={() => { generateBackupCodes(); alert(t('settings.alerts.new_codes')); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"><RefreshCw size={14} /> {t('settings.security.refresh_btn')}</button>
                        </div>
                      ) : (
                        <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px]">
                          <Lock size={40} className="mx-auto text-zinc-200 mb-4" /><p className="text-zinc-400 text-xs font-black uppercase italic tracking-widest">{t('settings.security.offline')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'backup' && (
                    <div className="space-y-10 text-left">
                      <div className="space-y-2 text-left">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('settings.backup.title')}</h3>
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{t('settings.backup.subtitle')}</p>
                      </div>
                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{t('settings.backup.password_label')}</label>
                        <div className="relative">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                          <input type="password" placeholder="••••••••" value={backupPassword} onChange={(e) => setBackupPassword(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 py-6 pl-14 pr-6 rounded-[24px] text-sm font-black italic focus:bg-white transition-all outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BackupBtn onClick={handleExportBackup} icon={<Download/>} label={t('settings.backup.export_label')} sub={t('settings.backup.export_sub')} />
                        <BackupBtn onClick={() => importFileRef.current?.click()} icon={<Upload/>} label={t('settings.backup.import_label')} sub={t('settings.backup.import_sub')} color="text-emerald-500" />
                        <input type="file" ref={importFileRef} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const password = prompt(t('settings.alerts.enter_password'));
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            try {
                              const bytes = CryptoJS.AES.decrypt(ev.target?.result as string, password || '');
                              const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                              localStorage.setItem('zway_staff_data', JSON.stringify(data.staff));
                              localStorage.setItem('zway_login_logs', JSON.stringify(data.logs));
                              window.location.reload();
                            } catch (err) { alert(t('settings.alerts.invalid_password')); }
                          };
                          reader.readAsText(file);
                        }} className="hidden" accept=".zway" />
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

// Sub-Components
function TabBtn({ active, label, icon, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-5 rounded-[22px] transition-all duration-300 ${active ? 'bg-black text-white shadow-xl scale-[1.02]' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}>
      <div className="flex items-center gap-4">
        {icon} <span className="text-[11px] font-black uppercase italic tracking-widest">{label}</span>
      </div>
    </button>
  );
}

function InputGroup({ label, value, onChange, icon, readonly }: any) {
  return (
    <div className="space-y-3 text-left">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300">{icon}</div>
        <input readOnly={readonly} value={value} onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-zinc-50 border border-zinc-100 py-5 pl-12 pr-6 rounded-2xl text-sm font-black italic outline-none transition-all ${readonly ? 'opacity-50 select-none' : 'focus:bg-white focus:ring-4 focus:ring-black/5'}`} />
      </div>
    </div>
  );
}

function BackupBtn({ onClick, icon, label, sub, color = "text-black" }: any) {
  return (
    <button onClick={onClick} className="p-10 rounded-[40px] border-2 border-zinc-100 bg-zinc-50 hover:bg-white hover:border-black hover:shadow-2xl transition-all text-left space-y-4 group">
      <div className={`w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className={`font-black text-[11px] uppercase tracking-widest italic ${color}`}>{label}</p>
        <p className="text-zinc-400 text-[10px] font-bold mt-1 uppercase italic">{sub}</p>
      </div>
    </button>
  );
}