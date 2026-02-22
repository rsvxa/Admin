"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingCart, User, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Ordering() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);

  // ១. អនុគមន៍ទាញទិន្នន័យពី LocalStorage
  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const sorted = savedOrders.sort((a: any, b: any) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    setOrders(sorted);
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  // ២. អនុគមន៍ Update ស្ថានភាព និងផ្ទេរទិន្នន័យទៅកាន់ History (Auto-transfer)
  const updateStatus = (orderId: string, newStatus: string) => {
    if (newStatus === 'Delivered' || newStatus === 'Cancelled') {
      const confirmMsg = newStatus === 'Delivered' 
        ? "ការបញ្ជាទិញនេះបានបញ្ចប់។ ទិន្នន័យនឹងត្រូវផ្ទេរទៅកាន់ 'ប្រវត្តិលក់'?" 
        : "ការបញ្ជាទិញនេះត្រូវបានបោះបង់។ ទិន្នន័យនឹងត្រូវផ្ទេរទៅកាន់ 'ប្រវត្តិលក់'?";

      if (window.confirm(confirmMsg)) {
        // កំណត់រក Order ដែលត្រូវផ្ទេរចេញ
        const orderToMove = orders.find(o => o.id === orderId);
        
        if (orderToMove) {
          // បន្ថែម Status ថ្មី និងថ្ងៃខែបញ្ចប់
          const historyEntry = { 
            ...orderToMove, 
            status: newStatus, 
            completedAt: new Date().toISOString() 
          };

          // រក្សាទុកក្នុង History
          const currentHistory = JSON.parse(localStorage.getItem('zway_orders_history') || '[]');
          localStorage.setItem('zway_orders_history', JSON.stringify([historyEntry, ...currentHistory]));

          // លុបចេញពីបញ្ជីបច្ចុប្បន្ន
          const updatedOrders = orders.filter((order: any) => order.id !== orderId);
          saveAndSync(updatedOrders);

          alert(newStatus === 'Delivered' ? "ជោគជ័យ! ទិន្នន័យត្រូវបានរក្សាទុកក្នុងប្រវត្តិលក់។" : "បានបោះបង់ និងផ្ទេរទៅប្រវត្តិលក់។");
        }
      } else {
        loadOrders(); // Reset select បើ User ចុច Cancel
      }
    } else {
      // បើស្ថានភាពផ្សេង (Pending, Processing, Shipped, Broken) Update ធម្មតា
      const updatedOrders = orders.map((order: any) => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      saveAndSync(updatedOrders);
    }
  };

  const saveAndSync = (updatedData: any[]) => {
    setOrders(updatedData);
    localStorage.setItem('zway_orders', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Broken': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-medium italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10"
        >
          {/* Header */}
          <div className="mb-10 text-left">
            <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              {t('order_mgmt_title', 'ការគ្រប់គ្រងការលក់')}
            </h1>
            <div className="flex items-center gap-2 text-gray-400 mt-2">
              <ShoppingCart size={16} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {t('manage_orders_subtitle', 'ពិនិត្យ និងតាមដានរាល់ប្រតិបត្តិការ')} ({orders.length})
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_order_id', 'លេខកូដ')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_customer', 'អតិថិជន')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_total', 'សរុប')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_status', 'ស្ថានភាព')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('col_action', 'គ្រប់គ្រង')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-zinc-50/50 transition-all">
                      <td className="px-8 py-6 font-black text-gray-900 text-sm italic">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <User size={14} />
                          </div>
                          <span className="font-bold text-gray-700 uppercase tracking-tight">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1 font-black text-gray-900 text-lg italic">
                          <DollarSign size={16} className="text-emerald-500" />
                          {Number(order.total).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                          {t(`status_${order.status.toLowerCase()}`, order.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className={`appearance-none cursor-pointer pl-6 pr-12 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.15em] transition-all focus:outline-none focus:ring-4 focus:ring-black/5 ${getStatusStyle(order.status)}`}
                            >
                              <option value="Pending">{t('status_pending', 'រង់ចាំ')}</option>
                              <option value="Processing">{t('status_processing', 'កំពុងរៀបចំ')}</option>
                              <option value="Shipped">{t('status_shipped', 'កំពុងដឹកជញ្ជូន')}</option>
                              <option value="Broken">{t('status_broken', 'អីវ៉ាន់ខូចខាត')}</option>
                              <option value="Delivered">{t('status_delivered', 'បានប្រគល់ (Archive)')}</option>
                              <option value="Cancelled">{t('status_cancelled', 'បានបោះបង់ (Archive)')}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-current">
                              <ChevronRight size={14} className="rotate-90 opacity-50" />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <ShoppingCart size={32} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    {t('no_orders_found', 'មិនទាន់មានទិន្នន័យលក់នៅឡើយទេ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}