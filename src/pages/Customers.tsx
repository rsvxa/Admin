"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Mail, Phone, ShoppingBag, MoreVertical, Filter, X, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';

export default function Customers() {
  const { t } = useTranslation(); // ២. ប្រកាសប្រើ t()
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const allOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
      
      const customerMap = allOrders.reduce((acc: any, order: any) => {
        const name = order.customerName || "Unknown Customer";
        if (!acc[name]) {
          acc[name] = {
            name: name,
            email: order.customerEmail || "N/A",
            phone: order.customerPhone || "N/A",
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: order.date || "N/A",
            avatar: `https://i.pravatar.cc/150?u=${name}`
          };
        }
        acc[name].totalOrders += 1;
        acc[name].totalSpent += parseFloat(order.total) || 0;
        return acc;
      }, {});

      setCustomers(Object.values(customerMap));
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewHistory = (customerName: string) => {
    const allOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const history = allOrders.filter((o: any) => o.customerName === customerName);
    const customerInfo = customers.find((c: any) => c.name === customerName);
    
    setSelectedCustomer(customerInfo);
    setCustomerOrders(history);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <motion.main 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 text-left">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                {t('customers_title')}
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                {t('customers_subtitle')}
              </p>
            </div>

            <div className="relative w-full lg:w-80 text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('placeholder_search_customer')}
                className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Users size={28} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('stat_total_customers')}</p>
                <h4 className="text-2xl font-black">{customers.length}</h4>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('col_customer_info')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('col_contact')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('col_orders_count')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('col_total_spent')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((customer: any, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/30 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={customer.avatar} className="w-12 h-12 rounded-2xl object-cover bg-gray-100 border-2 border-white shadow-sm" alt=""/>
                          <span className="font-black text-gray-900 text-sm">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-gray-500 font-medium flex flex-col gap-1">
                          <span className="flex items-center gap-2"><Mail size={12}/> {customer.email}</span>
                          <span className="flex items-center gap-2"><Phone size={12}/> {customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-black text-gray-600">{customer.totalOrders}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-emerald-600">${customer.totalSpent.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleViewHistory(customer.name)}
                          className="flex items-center gap-2 ml-auto p-2.5 bg-gray-50 text-gray-900 rounded-xl hover:bg-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                        >
                          <Eye size={14} /> {t('btn_history')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>

        <AnimatePresence>
          {selectedCustomer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl border border-gray-100"
              >
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <div className="text-left">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">
                      {selectedCustomer.name} {t('history_suffix')}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('history_subtitle')}</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-all"><X size={20}/></button>
                </div>
                <div className="p-8 max-h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    {customerOrders.map((order: any, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-left">
                          <p className="text-xs font-black text-gray-900 uppercase">{t('order_label')} #{order.id?.slice(-5)}</p>
                          <p className="text-[10px] font-bold text-gray-400">{order.date || t('unknown_date')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">${order.total}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                            {t(`status_${order.status.toLowerCase()}`)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {customerOrders.length === 0 && (
                      <p className="text-center text-gray-400 py-10 font-bold italic">{t('no_history_found')}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}