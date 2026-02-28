"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mail, Phone, ShoppingBag, X, 
  CreditCard, Calendar, Download, UserCheck, ArrowRight,
  UserX, Trash2, ShieldAlert, UserPlus, History
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Customers() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // ១. អនុគមន៍ទាញទិន្នន័យ
  const loadData = () => {
    const activeOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const historyOrders = JSON.parse(localStorage.getItem('zway_orders_history') || '[]');
    const blocked = JSON.parse(localStorage.getItem('zway_blocked_users') || '[]');
    setBlockedUsers(blocked);
    
    const allOrders = [...activeOrders, ...historyOrders];
    
    const customerMap = allOrders.reduce((acc: any, order: any) => {
      const name = order.customerName || "Unknown Customer";
      if (!acc[name]) {
        acc[name] = {
          name: name,
          email: order.customerEmail || "No Email",
          phone: order.customerPhone || "No Phone",
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.date || "N/A",
          avatar: `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&bold=true`
        };
      }
      acc[name].totalOrders += 1;
      acc[name].totalSpent += parseFloat(order.total) || 0;
      
      if (order.date && (acc[name].lastOrderDate === "N/A" || new Date(order.date) > new Date(acc[name].lastOrderDate))) {
          acc[name].lastOrderDate = order.date;
      }
      return acc;
    }, {});

    const customerList = Object.values(customerMap).sort((a: any, b: any) => b.totalSpent - a.totalSpent);
    setCustomers(customerList);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // ២. មុខងារ Block / Unblock User
  const handleToggleBlock = (customerName: string) => {
    const isBlocked = blockedUsers.includes(customerName);
    const message = isBlocked 
      ? t('confirm_unblock', { name: customerName }) 
      : t('confirm_block', { name: customerName });

    if (window.confirm(message)) {
      let updatedBlocked;
      if (isBlocked) {
        updatedBlocked = blockedUsers.filter(name => name !== customerName);
      } else {
        updatedBlocked = [...blockedUsers, customerName];
      }
      
      setBlockedUsers(updatedBlocked);
      localStorage.setItem('zway_blocked_users', JSON.stringify(updatedBlocked));
    }
  };

  // ៣. មុខងារ Delete User
  const handleDeleteCustomer = (customerName: string) => {
    if (window.confirm(t('confirm_delete_customer', { name: customerName }))) {
      const activeOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
      localStorage.setItem('zway_orders', JSON.stringify(activeOrders.filter((o: any) => o.customerName !== customerName)));
      
      const historyOrders = JSON.parse(localStorage.getItem('zway_orders_history') || '[]');
      localStorage.setItem('zway_orders_history', JSON.stringify(historyOrders.filter((o: any) => o.customerName !== customerName)));
      
      localStorage.setItem('zway_blocked_users', JSON.stringify(blockedUsers.filter(name => name !== customerName)));
      
      loadData();
    }
  };

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleExportCSV = () => {
    const headers = ["Customer Name", "Email", "Phone", "Total Orders", "Total Spent ($)", "Status"];
    const rows = filteredCustomers.map((c: any) => [
      c.name, c.email, c.phone, c.totalOrders, c.totalSpent, blockedUsers.includes(c.name) ? 'Blocked' : 'Active'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `ZWAY_Customers_Report.csv`);
    link.click();
  };

  const handleViewHistory = (customerName: string) => {
    const activeOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const historyOrders = JSON.parse(localStorage.getItem('zway_orders_history') || '[]');
    
    const allHistory = [...activeOrders, ...historyOrders]
      .filter((o: any) => o.customerName === customerName)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setSelectedCustomer(customers.find((c: any) => c.name === customerName));
    setCustomerOrders(allHistory);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-medium italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 text-left">
        <Navbar />

        <motion.main 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2 italic">
                {t('customers_title')}
              </h1>
              <div className="flex items-center gap-2 text-gray-400">
                <UserCheck size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {t('customers_subtitle')} • {customers.length} Users
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('placeholder_search_customer')}
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={handleExportCSV} className="p-4 bg-white text-black rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm border border-gray-100 active:scale-95 group">
                <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_customer')}</th>
                    <th className="px-6 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_contact')}</th>
                    <th className="px-6 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">{t('col_orders')}</th>
                    <th className="px-6 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('col_spent')}</th>
                    <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((customer: any, idx) => {
                    const isBlocked = blockedUsers.includes(customer.name);
                    return (
                      <tr key={idx} className={`group transition-all ${isBlocked ? 'bg-rose-50/30 opacity-80' : 'hover:bg-zinc-50/50'}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={customer.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:rotate-3 transition-transform" alt=""/>
                              {isBlocked && <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><ShieldAlert size={14} className="text-rose-500" /></div>}
                            </div>
                            <div className="flex flex-col">
                                <span className={`font-black text-sm tracking-tight uppercase italic ${isBlocked ? 'text-rose-600 line-through' : 'text-gray-900'}`}>
                                    {customer.name}
                                </span>
                                {isBlocked && <span className="text-[8px] text-rose-500 font-black uppercase tracking-widest italic">{t('status_blocked_label')}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-[10px] space-y-1.5 font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2 text-zinc-400 group-hover:text-black transition-colors">
                              <Mail size={12} /> <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 group-hover:text-black transition-colors">
                              <Phone size={12} /> <span>{customer.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="bg-zinc-100 text-zinc-900 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200">
                            {customer.totalOrders} {t('orders_unit')}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-lg font-black text-emerald-600 tracking-tighter">
                            ${customer.totalSpent.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleViewHistory(customer.name)} className="p-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                              <ShoppingBag size={14} />
                            </button>
                            <button onClick={() => handleToggleBlock(customer.name)} className={`p-3 rounded-xl transition-all active:scale-95 ${isBlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                              {isBlocked ? <UserPlus size={14} /> : <UserX size={14} />}
                            </button>
                            <button onClick={() => handleDeleteCustomer(customer.name)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>

        {/* Modal History */}
        <AnimatePresence>
          {selectedCustomer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('history_modal_title')}</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-3 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all"><X size={20}/></button>
                </div>

                <div className="p-6 max-h-[500px] overflow-y-auto bg-gray-50/30">
                  <div className="space-y-4">
                    {customerOrders.length > 0 ? customerOrders.map((order: any, i) => (
                      <div key={i} className="flex flex-col md:flex-row justify-between md:items-center p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <p className="text-sm font-black text-black uppercase italic">#{order.id?.slice(-8).toUpperCase()}</p>
                             <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                                {t(`status_${order.status.toLowerCase()}`, order.status)}
                             </span>
                             {order.completedAt && <History size={12} className="text-gray-300" />}
                          </div>
                          <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><Calendar size={12}/> {order.date}</span>
                             <span className="flex items-center gap-1.5"><CreditCard size={12}/> {order.paymentMethod || 'COD'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-black text-gray-900 italic">${parseFloat(order.total).toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{order.items?.length || 1} Items</p>
                          </div>
                          <ArrowRight size={16} className="text-gray-200" />
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs italic">{t('no_history_found')}</p>
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