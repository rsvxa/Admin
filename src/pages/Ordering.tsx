"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingCart, User, DollarSign, PlusCircle, PackageCheck, Clock, Search, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Ordering() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  
  // State សម្រាប់ Search និង Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadOrders = () => {
    const activeOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const historyOrders = JSON.parse(localStorage.getItem('zway_orders_history') || '[]');
    setTotalOrderCount(activeOrders.length + historyOrders.length);

    const sorted = activeOrders.sort((a: any, b: any) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    setOrders(sorted);
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  // --- Logic សម្រាប់ Filter និង Search ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchTerm, filterStatus]);

  const generateSampleOrders = () => {
    const sampleNames = ["Sok Dara", "Keo Pich", "Chann Thavy", "Vannak Sak", "Mony Roth", "Nary Som", "Sophea Long"];
    const statuses = ["Pending", "Processing", "Shipped", "Broken"];
    
    const newSampleOrders = Array.from({ length: 10 }).map(() => ({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: sampleNames[Math.floor(Math.random() * sampleNames.length)],
      total: (Math.random() * 500 + 20).toFixed(2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: new Date().toISOString(),
    }));

    const updatedOrders = [...newSampleOrders, ...orders];
    saveAndSync(updatedOrders);
  };

  const updateStatus = (orderId: string, newStatus: string) => {
    if (newStatus === 'Delivered' || newStatus === 'Cancelled') {
      if (window.confirm(t('confirm_move_to_history', 'បញ្ជូនទៅកាន់ប្រវត្តិលក់?'))) {
        const orderToMove = orders.find(o => o.id === orderId);
        if (orderToMove) {
          const historyEntry = { ...orderToMove, status: newStatus, completedAt: new Date().toISOString() };
          const currentHistory = JSON.parse(localStorage.getItem('zway_orders_history') || '[]');
          localStorage.setItem('zway_orders_history', JSON.stringify([historyEntry, ...currentHistory]));
          saveAndSync(orders.filter((o: any) => o.id !== orderId));
        }
      } else { loadOrders(); }
    } else {
      saveAndSync(orders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const saveAndSync = (updatedData: any[]) => {
    setOrders(updatedData);
    localStorage.setItem('zway_orders', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));
    loadOrders();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Broken': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-medium italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 text-left">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {t('order_mgmt_title', 'ការបញ្ជាទិញ')}
              </h1>
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                <ShoppingCart size={16} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('manage_orders', 'គ្រប់គ្រងការលក់')}</p>
              </div>
            </div>

            <button onClick={generateSampleOrders} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-zinc-800 transition-all shadow-xl">
              <PlusCircle size={16} /> {t('add_sample', 'បន្ថែមទិន្នន័យគំរូ')}
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center"><PackageCheck size={20} /></div>
              <div>
                <p className="text-[9px] font-black uppercase text-gray-400">{t('total_all', 'សរុបទាំងអស់')}</p>
                <h3 className="text-2xl font-black italic">{totalOrderCount}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={20} /></div>
              <div>
                <p className="text-[9px] font-black uppercase text-gray-400">{t('current_active', 'កំពុងដំណើរការ')}</p>
                <h3 className="text-2xl font-black italic">{orders.length}</h3>
              </div>
            </div>
          </div>

          {/* --- Search & Filter Bar --- */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text"
                placeholder={t('search_placeholder', 'ស្វែងរកឈ្មោះអតិថិជន ឬលេខកូដ...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[22px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-[22px] border border-gray-100 shadow-sm">
              <Filter size={16} className="text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="All">{t('all_status', 'ស្ថានភាពទាំងអស់')}</option>
                <option value="Pending">{t('status_pending', 'រង់ចាំ')}</option>
                  <option value="Processing">{t('status_processing', 'កំពុងរៀបចំ')}</option>
                  <option value="Shipped">{t('status_shipped', 'កំពុងផ្ញើ')}</option>
                  <option value="Broken">{t('status_broken', 'ខូចខាត')}</option>
                  <option value="Delivered">{t('status_delivered', 'បានដល់ដៃភ្ញៀវ')}</option>
                  <option value="Cancelled">{t('status_cancelled', 'បោះបង់')}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_id', 'លេខកូដ')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_cust', 'អតិថិជន')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_total', 'សរុប')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_status', 'ស្ថានភាព')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('col_act', 'សកម្មភាព')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {filteredOrders.map((order: any) => (
                      <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={order.id} className="group hover:bg-zinc-50/50 transition-all">
                        <td className="px-8 py-6 font-black text-gray-900 text-sm italic">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={14} /></div>
                            <span className="font-bold text-gray-700 uppercase tracking-tight">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black text-gray-900 text-lg italic"><DollarSign size={16} className="inline text-emerald-500 mr-1" />{Number(order.total).toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                         <td className="px-8 py-6 text-right">
                        <div className="flex justify-end">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className={`appearance-none cursor-pointer pl-6 pr-12 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.15em] transition-all focus:outline-none focus:ring-4 focus:ring-black/5 ${getStatusStyle(order.status)}`}
                            >
                              <option value="Pending">{t('status_pending', 'រង់ចាំ')}</option>
                              <option value="Processing">{t('status_processing', 'កំពុងរៀបចំ')}</option>
                              <option value="Shipped">{t('status_shipped', 'កំពុងផ្ញើ')}</option>
                              <option value="Broken">{t('status_broken', 'ខូចខាត')}</option>
                              <option value="Delivered">{t('status_delivered', 'បានដល់ដៃភ្ញៀវ')}</option>
                              <option value="Cancelled">{t('status_cancelled', 'បោះបង់')}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-current">
                              <ChevronRight size={14} className="rotate-90 opacity-50" />
                            </div>
                          </div>
                        </div>
                      </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] italic">{t('no_results', 'រកមិនឃើញទិន្នន័យឡើយ')}</p>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}