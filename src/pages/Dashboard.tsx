"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ShoppingBag, DollarSign, 
  ArrowUpRight, Package, Calendar, Star, AlertCircle,
  ArrowDownRight, CreditCard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

const salesData = [
  { name: 'Mon', sales: 400 },
  { name: 'Tue', sales: 700 },
  { name: 'Wed', sales: 500 },
  { name: 'Thu', sales: 900 },
  { name: 'Fri', sales: 1200 },
  { name: 'Sat', sales: 1500 },
  { name: 'Sun', sales: 1100 },
];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    activeProducts: 0
  });
  
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const loadDashboardData = () => {
    const orders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const products = JSON.parse(localStorage.getItem('zway_products') || '[]');
    const expenses = JSON.parse(localStorage.getItem('zway_expenses') || '[]');

    const revenue = orders.reduce((sum: number, order: any) => 
      order.status !== 'Cancelled' ? sum + (parseFloat(order.total) || 0) : sum, 0);

    const totalExp = expenses.reduce((sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0), 0);
    const profit = revenue - totalExp;
    const lowStock = products.filter((p: any) => parseInt(p.stocks) <= 5);
    
    const sortedProducts = [...products]
      .sort((a, b) => (parseInt(b.stocks) - parseInt(a.stocks)))
      .slice(0, 3);

    setStats({
      totalRevenue: revenue,
      totalExpenses: totalExp,
      netProfit: profit,
      totalOrders: orders.length,
      activeProducts: products.length
    });
    
    setLowStockProducts(lowStock);
    setTopProducts(sortedProducts);
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('storage', loadDashboardData);
    return () => window.removeEventListener('storage', loadDashboardData);
  }, []);

  const statCards = [
    { title: t('revenue'), key: 'totalRevenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: t('expenses'), key: 'totalExpenses', value: `$${stats.totalExpenses.toLocaleString()}`, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: t('net_profit'), key: 'netProfit', value: `$${stats.netProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-white', bg: 'bg-black' },
    { title: t('menu_ordering'), key: 'totalOrders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10"
        >
          {/* Header */}
          <div className="flex justify-between items-end mb-10 text-left">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {t('financial_overview')}
              </h1>
              <p className="text-gray-400 font-medium mt-1">{t('financial_subtitle')}</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
              <Calendar size={16} />
              {new Date().toLocaleDateString(i18n.language === 'kh' ? 'km-KH' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
            {statCards.map((card, idx) => (
              <motion.div 
                whileHover={{ y: -5 }} 
                key={idx} 
                className={`${card.key === 'netProfit' ? 'bg-black shadow-xl shadow-black/20' : 'bg-white border-gray-100'} p-6 rounded-[32px] border shadow-sm flex items-center gap-5 transition-all`}
              >
                <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}><card.icon size={24} /></div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[2px] mb-1 ${card.key === 'netProfit' ? 'text-gray-400' : 'text-gray-400'}`}>{card.title}</p>
                  <h3 className={`text-2xl font-black leading-none ${card.key === 'netProfit' ? 'text-white' : 'text-gray-900'}`}>{card.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 text-left">
              {/* Sales Chart */}
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">{t('performance_flow')}</h3>
                    <p className="text-sm text-gray-400 font-medium">{t('daily_activity')}</p>
                  </div>
                  <div className="flex gap-2">
                     <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">{t('revenue')} <ArrowUpRight size={12}/></span>
                     <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">{t('expenses')} <ArrowDownRight size={12}/></span>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '700', fill: '#9ca3af'}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '700', fill: '#9ca3af'}} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }} />
                      <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Alert Section */}
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                    <AlertCircle size={22} className="text-rose-500" /> {t('stock_status')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 font-bold shadow-sm border border-rose-100">
                             {p.stocks}
                           </div>
                           <div>
                             <p className="text-xs font-black text-gray-900 uppercase truncate w-32">{p.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</p>
                           </div>
                        </div>
                        <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md uppercase">{t('low_stock_label')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-gray-400 py-4">{t('inventory_healthy')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Selling Section */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-left">
              <div className="flex items-center gap-2 mb-8 text-gray-900 border-b border-gray-50 pb-4">
                <Star size={20} className="fill-black" />
                <h3 className="text-lg font-black uppercase italic tracking-tight">{t('product_performance')}</h3>
              </div>
              
              <div className="space-y-8">
                {topProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-50 shadow-sm flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20}/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter">{product.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">${product.price}</p>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{product.stocks} {t('left_label')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-black rounded-[32px] text-white">
                <p className="text-[10px] font-black uppercase tracking-[2px] opacity-60 mb-1">{t('target_achievement')}</p>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-2xl font-black">78%</h3>
                  <span className="text-[10px] font-bold text-emerald-400">+5.2%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[78%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}