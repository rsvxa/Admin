"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, CheckCircle, Truck, Package, Clock, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Ordering() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    setOrders(savedOrders);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order: any) => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('zway_orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteOrder = (orderId: string) => {
    if (window.confirm(t('confirm_delete_order'))) {
        const updatedOrders = orders.filter((order: any) => order.id !== orderId);
        setOrders(updatedOrders);
        localStorage.setItem('zway_orders', JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event('storage'));
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-10">
          <div className="mb-10 text-left">
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
              {t('order_mgmt_title')}
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              {t('order_mgmt_subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden text-left">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">{t('col_order_id')}</th>
                  <th className="px-8 py-6">{t('col_customer')}</th>
                  <th className="px-8 py-6">{t('col_total')}</th>
                  <th className="px-8 py-6">{t('col_status')}</th>
                  <th className="px-8 py-6 text-right">{t('col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6 font-black text-gray-900">#{order.id.slice(-5)}</td>
                    <td className="px-8 py-6 font-bold text-gray-600">{order.customerName}</td>
                    <td className="px-8 py-6 font-black text-gray-900">${order.total}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                        {t(`status_${order.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                            <div className="relative inline-block text-left">
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className={`appearance-none cursor-pointer pl-4 pr-10 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all focus:outline-none ${getStatusStyle(order.status)}`}
                            >
                                <option value="Pending">{t('status_pending')}</option>
                                <option value="Processing">{t('status_processing')}</option>
                                <option value="Shipped">{t('status_shipped')}</option>
                                <option value="Delivered">{t('status_delivered')}</option>
                                <option value="Cancelled">{t('status_cancelled')}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-current">
                                <ChevronRight size={14} className="rotate-90" />
                            </div>
                            </div>

                            <button 
                              onClick={() => deleteOrder(order.id)}
                              className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                              title={t('tooltip_delete')}
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-gray-400 font-bold italic">{t('no_orders_found')}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}