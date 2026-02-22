"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Trash2, Pencil, Search, ShieldCheck, Shield, X, 
  Camera, CalendarDays, FileSpreadsheet, FileText, MoreHorizontal 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'Active' | 'Inactive';
  joinDate: string;
  dayOff: string;
  image: string | null;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ManageStaff() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff',
    image: null as string | null
  });

  const [staffList, setStaffList] = useState<Staff[]>(() => {
    if (typeof window !== 'undefined') {
      const savedStaff = localStorage.getItem('zway_staff_data');
      if (savedStaff) return JSON.parse(savedStaff);
    }
    return [
      { id: 1, name: "Sitha THUL", email: "sitha.zway@gmail.com", role: "admin", status: "Active", joinDate: "01 Jan 2026", dayOff: "Sunday", image: null },
      { id: 2, name: "Vannak KEO", email: "vannak@zway.com", role: "staff", status: "Active", joinDate: "10 Feb 2026", dayOff: "Monday", image: null },
    ];
  });

  useEffect(() => {
    localStorage.setItem('zway_staff_data', JSON.stringify(staffList));
  }, [staffList]);

  // រកថ្ងៃឈប់សម្រាកដែលទំនេរ (មិនឱ្យជាន់គ្នា)
  const suggestDayOff = () => {
    const usedDays = staffList.map(s => s.dayOff);
    for (const day of DAYS_OF_WEEK) {
      if (!usedDays.includes(day)) return day;
    }
    return DAYS_OF_WEEK[staffList.length % 7];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: Staff[];

    if (editingStaff) {
      updatedList = staffList.map(s => 
        s.id === editingStaff.id ? { ...s, ...formData } : s
      );

      // Sync ជាមួយ Profile បើកែព័ត៌មានខ្លួនឯង
      const savedProfile = localStorage.getItem('zway_user_profile');
      const currentProfile = savedProfile ? JSON.parse(savedProfile) : null;
      
      if (currentProfile && editingStaff.email === currentProfile.email) {
        const newProfile = { ...currentProfile, fullName: formData.name, email: formData.email, avatar: formData.image || currentProfile.avatar };
        localStorage.setItem('zway_user_profile', JSON.stringify(newProfile));
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } else {
      const newStaff: Staff = {
        id: Date.now(),
        ...formData,
        status: 'Active',
        dayOff: suggestDayOff(),
        joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      updatedList = [newStaff, ...staffList];
    }

    setStaffList(updatedList);
    setIsModalOpen(false);
  };

  const handleExportExcel = () => {
    const data = staffList.map(s => ({ Name: s.name, Email: s.email, Role: s.role, DayOff: s.dayOff, Joined: s.joinDate }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "ZWAY_Staff.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Role', 'Day Off', 'Joined']],
      body: staffList.map(s => [s.name, s.email, s.role, s.dayOff, s.joinDate]),
      styles: { font: 'courier', fontSize: 9 }
    });
    doc.save("ZWAY_Staff_List.pdf");
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-black selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 md:p-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="text-left space-y-2">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                {t('manage_staff_title', 'Manage Staff')}
              </h1>
              <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">{t('manage_staff_subtitle', 'Team directory & schedules')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={t('placeholder_search_staff', 'Search name...')}
                  className="bg-white border border-zinc-100 rounded-[20px] py-4 pl-12 pr-6 text-xs font-bold italic outline-none focus:ring-[8px] focus:ring-black/5 transition-all w-64 shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <button onClick={handleExportExcel} className="bg-white hover:bg-zinc-50 border border-zinc-100 p-4 rounded-2xl transition-all shadow-sm text-emerald-600">
                  <FileSpreadsheet size={20} />
                </button>
                <button onClick={handleExportPDF} className="bg-white hover:bg-zinc-50 border border-zinc-100 p-4 rounded-2xl transition-all shadow-sm text-rose-600">
                  <FileText size={20} />
                </button>
              </div>

              <button onClick={() => { setEditingStaff(null); setFormData({name:'', email:'', role:'staff', image:null}); setIsModalOpen(true); }} className="bg-black text-white px-8 py-4 rounded-[22px] flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl shadow-black/10">
                <UserPlus size={18} /> {t('btn_add_staff', 'Add Staff')}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[40px] border border-zinc-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-50 bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-7">{t('col_staff_member', 'Staff Member')}</th>
                    <th className="px-6 py-7">{t('col_role', 'Role')}</th>
                    <th className="px-6 py-7">{t('col_day_off', 'Weekly Off')}</th>
                    <th className="px-6 py-7">{t('col_join_date', 'Joined Date')}</th>
                    <th className="px-10 py-7 text-right">{t('col_actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[18px] overflow-hidden bg-zinc-100 border-2 border-white shadow-sm ring-1 ring-zinc-100">
                            {staff.image ? <img src={staff.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-zinc-300 italic">{staff.name.charAt(0)}</div>}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-xs uppercase italic tracking-tight">{staff.name}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{staff.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase italic ${staff.role === 'admin' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                          {staff.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                          {staff.role}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase italic">
                          <CalendarDays size={14} className="opacity-40" /> {staff.dayOff}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-[10px] font-bold text-zinc-400 italic uppercase">{staff.joinDate}</td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingStaff(staff); setFormData({name:staff.name, email:staff.email, role:staff.role, image:staff.image}); setIsModalOpen(true); }} className="p-3 bg-white border border-zinc-100 rounded-xl text-zinc-400 hover:text-black hover:shadow-md transition-all"><Pencil size={14} /></button>
                          <button onClick={() => confirm('Delete staff?') && setStaffList(staffList.filter(s => s.id !== staff.id))} className="p-3 bg-white border border-zinc-100 rounded-xl text-zinc-400 hover:text-rose-600 hover:shadow-md transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-100">
                <div className="p-10 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">{editingStaff ? 'Update Member' : 'New Member'}</h2>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Enter staff credentials</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full transition-all text-zinc-400 border border-transparent hover:border-zinc-100"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="p-10 space-y-8">
                  <div className="flex justify-center">
                    <div onClick={() => fileInputRef.current?.click()} className="relative w-32 h-32 rounded-[40px] bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center cursor-pointer hover:border-black transition-all group overflow-hidden shadow-inner">
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="text-center"><Camera size={24} className="text-zinc-300 mx-auto mb-1" /><span className="text-[8px] font-black text-zinc-400 uppercase">Upload</span></div>}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">Full Name</label>
                      <input required className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm font-bold italic focus:ring-[6px] focus:ring-black/5 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">Email Address</label>
                      <input required type="email" className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm font-bold italic focus:ring-[6px] focus:ring-black/5 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase ml-2">System Role</label>
                      <select className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm font-black italic focus:ring-[6px] focus:ring-black/5 outline-none transition-all cursor-pointer appearance-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}>
                        <option value="staff">Staff Member</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-black text-white font-black py-5 rounded-[24px] hover:shadow-2xl hover:shadow-black/20 transition-all text-[10px] uppercase tracking-[0.2em] italic">
                    {editingStaff ? 'Apply Changes' : 'Confirm Registration'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}