"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Pencil, Search, Mail, ShieldCheck, Shield, X, Download, Camera, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';

interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'Active' | 'Inactive';
  joinDate: string;
  image: string | null;
}

export default function ManageStaff() {
  const { t } = useTranslation(); // ២. ប្រកាសប្រើ t()
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff',
    status: 'Active' as 'Active' | 'Inactive',
    image: null as string | null
  });

  const [staffList, setStaffList] = useState<Staff[]>(() => {
    if (typeof window !== 'undefined') {
      const savedStaff = localStorage.getItem('zway_staff_data');
      if (savedStaff) return JSON.parse(savedStaff);
    }
    return [
      { id: 1, name: "Sitha THUL", email: "sitha@zway.com", role: "admin", status: "Active", joinDate: "01 Jan 2026", image: "https://i.pravatar.cc/150?u=sitha" },
      { id: 2, name: "Vannak KEO", email: "vannak@zway.com", role: "staff", status: "Active", joinDate: "10 Feb 2026", image: null },
    ];
  });

  useEffect(() => {
    localStorage.setItem('zway_staff_data', JSON.stringify(staffList));
  }, [staffList]);

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
        joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      updatedList = [newStaff, ...staffList];
    }

    setStaffList(updatedList);
    localStorage.setItem('zway_staff_data', JSON.stringify(updatedList));

    if (formData.name === "Sitha THUL") {
      window.dispatchEvent(new Event('profileUpdate'));
    }

    setIsModalOpen(false);
  };

  const handleExport = () => {
    const dataToExport = staffList.map(staff => ({
      'Full Name': staff.name, 'Email': staff.email, 'Role': staff.role.toUpperCase(), 'Status': staff.status, 'Join Date': staff.joinDate
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");
    XLSX.writeFile(workbook, "ZWAY_Staff_List.xlsx");
  };

  const handleAddClick = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', role: 'staff', status: 'Active', image: null });
    setIsModalOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name, email: staff.email, role: staff.role, status: staff.status, image: staff.image });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('confirm_delete_staff'))) setStaffList(staffList.filter(s => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">{t('manage_staff_title')}</h1>
              <p className="text-gray-400 text-sm font-medium">{t('manage_staff_subtitle')}</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" placeholder={t('placeholder_search_staff')}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={handleExport} className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 p-3 rounded-xl transition-all shadow-sm">
                <Download size={20} />
              </button>
              <button onClick={handleAddClick} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-black/10">
                <UserPlus size={20} /> {t('btn_add_staff')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">{t('col_staff_member')}</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">{t('col_role')}</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">{t('col_status')}</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">{t('col_join_date')}</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px] text-right">{t('col_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((staff) => (
                    <tr key={staff.id} className="group hover:bg-gray-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {staff.image ? (
                            <img src={staff.image} alt="" className="w-11 h-11 rounded-2xl object-cover border border-gray-100" />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-400 border border-zinc-200 text-xs">
                              {staff.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col leading-tight">
                            <span className="font-bold text-gray-900 text-sm">{staff.name}</span>
                            <span className="text-[11px] text-gray-400 font-medium">{staff.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {staff.role === 'admin' ? <ShieldCheck size={14} className="text-blue-500" /> : <Shield size={14} className="text-gray-400" />}
                          <span className={`text-[10px] font-black uppercase tracking-tight ${staff.role === 'admin' ? 'text-blue-600' : 'text-gray-500'}`}>
                            {t(`role_${staff.role}`)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${staff.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {t(`status_${staff.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-gray-400">{staff.joinDate}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEditClick(staff)} className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(staff.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase tracking-tight italic">
                    {editingStaff ? t('modal_edit_staff') : t('modal_add_staff')}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
                  <div className="flex flex-col items-center mb-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-[28px] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-black transition-all group overflow-hidden shadow-inner"
                    >
                      {formData.image ? (
                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera size={24} className="text-gray-300 mx-auto mb-1 group-hover:text-black transition-colors" />
                          <span className="text-[8px] font-black uppercase text-gray-400">{t('upload_label')}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload size={18} className="text-white" />
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('label_full_name')}</label>
                      <input required type="text" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 transition-all outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('label_email')}</label>
                      <input required type="email" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-black/5 transition-all outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('col_role')}</label>
                        <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-black focus:ring-4 focus:ring-black/5 outline-none transition-all cursor-pointer appearance-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}>
                          <option value="staff">{t('role_staff')}</option>
                          <option value="admin">{t('role_admin')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('col_status')}</label>
                        <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-black focus:ring-4 focus:ring-black/5 outline-none transition-all cursor-pointer appearance-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                          <option value="Active">{t('status_active')}</option>
                          <option value="Inactive">{t('status_inactive')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-black text-white font-black py-4.5 rounded-[20px] mt-4 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 text-[11px] uppercase tracking-[2px]">
                    {editingStaff ? t('btn_update') : t('btn_confirm_save')}
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