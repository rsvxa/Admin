"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Pencil, Search, ShieldCheck, Shield, X, Download, Camera, CalendarDays, FileSpreadsheet, FileText } from 'lucide-react';
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
      if (savedStaff) {
        return JSON.parse(savedStaff);
      }
    }
    return [
      { id: 1, name: "Sitha THUL", email: "sitha@zway.com", role: "admin", status: "Active", joinDate: "01 Jan 2026", dayOff: "Sunday", image: null },
      { id: 2, name: "Vannak KEO", email: "vannak@zway.com", role: "staff", status: "Active", joinDate: "10 Feb 2026", dayOff: "Monday", image: null },
    ];
  });

  useEffect(() => {
    localStorage.setItem('zway_staff_data', JSON.stringify(staffList));
  }, [staffList]);

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
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
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

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = staffList.map(staff => ({
      'Full Name': staff.name, 
      'Email': staff.email, 
      'Role': staff.role.toUpperCase(), 
      'Day Off': staff.dayOff, 
      'Join Date': staff.joinDate
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");
    XLSX.writeFile(workbook, "ZWAY_Staff_List.xlsx");
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("ZWAY Staff List", 14, 15);
    
    const tableColumn = ["Name", "Email", "Role", "Day Off", "Join Date"];
    const tableRows = staffList.map(staff => [
      staff.name,
      staff.email,
      staff.role.toUpperCase(),
      staff.dayOff,
      staff.joinDate
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontStyle: 'italic' }
    });
    
    doc.save("ZWAY_Staff_List.pdf");
  };

  const handleAddClick = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', role: 'staff', image: null });
    setIsModalOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name, email: staff.email, role: staff.role, image: staff.image });
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-medium italic text-left">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {t('manage_staff_title', 'គ្រប់គ្រងបុគ្គលិក')}
              </h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                {t('manage_staff_subtitle', 'បញ្ជីឈ្មោះ និងកាលវិភាគឈប់សម្រាក')}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('placeholder_search_staff', 'ស្វែងរកឈ្មោះ...')}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm italic font-bold"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <button onClick={handleExportExcel} title="Export Excel" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 p-3.5 rounded-2xl transition-all shadow-sm">
                  <FileSpreadsheet size={20} />
                </button>
                <button onClick={handleExportPDF} title="Export PDF" className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 p-3.5 rounded-2xl transition-all shadow-sm">
                  <FileText size={20} />
                </button>
              </div>

              <button onClick={handleAddClick} className="bg-black hover:bg-zinc-800 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/10">
                <UserPlus size={18} /> {t('btn_add_staff', 'បន្ថែមបុគ្គលិក')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-6">{t('col_staff_member', 'បុគ្គលិក')}</th>
                    <th className="px-6 py-6">{t('col_role', 'តួនាទី')}</th>
                    <th className="px-6 py-6">{t('col_day_off', 'ថ្ងៃឈប់សម្រាក')}</th>
                    <th className="px-6 py-6">{t('col_join_date', 'ថ្ងៃចូលធ្វើការ')}</th>
                    <th className="px-8 py-6 text-right">{t('col_actions', 'សកម្មភាព')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((staff) => (
                    <tr key={staff.id} className="group hover:bg-gray-50/30 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-zinc-100">
                            {staff.image ? (
                              <img src={staff.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-zinc-400 text-sm italic">
                                {staff.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-sm italic uppercase">{staff.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{staff.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {staff.role === 'admin' ? <ShieldCheck size={14} className="text-emerald-500" /> : <Shield size={14} className="text-gray-400" />}
                          <span className={`text-[10px] font-black uppercase italic ${staff.role === 'admin' ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {staff.role === 'admin' ? t('role_admin', 'អ្នកគ្រប់គ្រង') : t('role_staff', 'បុគ្គលិក')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl w-fit border border-zinc-100">
                          <CalendarDays size={12} className="text-rose-500" />
                          <span className="text-[10px] font-black text-gray-700 uppercase italic">
                            {t(`day_${staff.dayOff?.toLowerCase() || 'sunday'}`, staff.dayOff)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{staff.joinDate}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEditClick(staff)} className="p-2.5 text-gray-300 hover:text-black hover:bg-gray-100 rounded-xl transition-all"><Pencil size={16} /></button>
                          <button onClick={() => { if(confirm(t('confirm_delete', 'តើអ្នកប្រាកដជាចង់លុបមែនទេ?'))) setStaffList(staffList.filter(s => s.id !== staff.id)) }} className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>

        {/* Modal Form */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">
                    {editingStaff ? t('modal_edit_staff', 'កែប្រែព័ត៌មាន') : t('modal_add_staff', 'បន្ថែមបុគ្គលិកថ្មី')}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-gray-400"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="p-10 space-y-6">
                  <div className="flex flex-col items-center mb-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-28 h-28 rounded-[35px] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-black transition-all group overflow-hidden shadow-inner"
                    >
                      {formData.image ? (
                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera size={24} className="text-gray-300 mx-auto mb-1 group-hover:text-black transition-colors" />
                          <span className="text-[8px] font-black uppercase text-gray-400">{t('upload_photo', 'រូបថត')}</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">{t('label_full_name', 'ឈ្មោះពេញ')}</label>
                      <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 transition-all outline-none italic" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">{t('label_email', 'អ៊ីមែល')}</label>
                      <input required type="email" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 transition-all outline-none italic" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">{t('col_role', 'តួនាទី')}</label>
                      <select className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-black/5 outline-none transition-all cursor-pointer appearance-none italic" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}>
                        <option value="staff">{t('role_staff', 'បុគ្គលិក')}</option>
                        <option value="admin">{t('role_admin', 'អ្នកគ្រប់គ្រង')}</option>
                      </select>
                    </div>

                    {!editingStaff && (
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{t('auto_day_off_info', 'ថ្ងៃឈប់សម្រាកស្វ័យប្រវត្តិ')}</p>
                        <p className="text-sm font-black text-rose-600 italic uppercase">
                           {t(`day_${suggestDayOff().toLowerCase()}`, suggestDayOff())}
                        </p>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full bg-black text-white font-black py-5 rounded-[24px] mt-4 hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 text-[10px] uppercase tracking-widest">
                    {editingStaff ? t('btn_update', 'កែប្រែទិន្នន័យ') : t('btn_confirm_save', 'រក្សាទុកបុគ្គលិក')}
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