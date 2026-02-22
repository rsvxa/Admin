"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, 
  Package, Calendar, Star, AlertCircle,
  CreditCard, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    activeProducts: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);

  const loadDashboardData = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
      const products = JSON.parse(localStorage.getItem('zway_products') || '[]');
      const expenses = JSON.parse(localStorage.getItem('zway_expenses') || '[]');

      // ១. គណនាចំណូល
      const revenue = orders.reduce((sum: number, order: any) => 
        order.status !== 'Cancelled' ? sum + (parseFloat(order.total) || 0) : sum, 0);

      const totalExp = expenses.reduce((sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0), 0);
      
      const totalCostOfGoods = orders.reduce((sum: number, order: any) => {
        const items = Array.isArray(order.items) ? order.items : [];
        const orderCost = items.reduce((iSum: number, item: any) => {
          const p = products.find((prod: any) => prod.id === item.id);
          return iSum + (parseFloat(p?.cost || 0) * (parseFloat(item.quantity) || 1));
        }, 0);
        return sum + orderCost;
      }, 0);

      const profit = revenue - (totalExp + totalCostOfGoods);

      // រៀបចំទិន្នន័យឆាត (Chart)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyData = days.map(day => ({ name: day, sales: 0 }));
      
      orders.forEach((order: any) => {
        if (order.date && order.status !== 'Cancelled') {
          const orderDate = new Date(order.date);
          const dayName = days[orderDate.getDay()];
          const dayEntry = weeklyData.find(d => d.name === dayName);
          if (dayEntry) dayEntry.sales += parseFloat(order.total || 0);
        }
      });
      setChartData(weeklyData);

      // រកទំនិញលក់ដាច់
      const productSalesMap: any = {};
      orders.forEach((order: any) => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
          productSalesMap[item.id] = (productSalesMap[item.id] || 0) + (parseFloat(item.quantity) || 1);
        });
      });

      const sortedTopProducts = products
        .map((p: any) => ({ ...p, soldCount: productSalesMap[p.id] || 0 }))
        .sort((a: any, b: any) => b.soldCount - a.soldCount)
        .slice(0, 4);

      setStats({
        totalRevenue: revenue,
        totalExpenses: totalExp + totalCostOfGoods,
        netProfit: profit,
        totalOrders: orders.length,
        activeProducts: products.length
      });
      
      setLowStockProducts(products.filter((p: any) => parseInt(p.stock || p.stocks || 0) <= 5).slice(0, 4));
      setTopSellingProducts(sortedTopProducts);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('storage', loadDashboardData);
    return () => window.removeEventListener('storage', loadDashboardData);
  }, []);

  const statCards = [
    { title: t('revenue'), value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: t('total_expenses'), value: `$${stats.totalExpenses.toLocaleString()}`, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: t('net_profit'), value: `$${stats.netProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-white', bg: 'bg-black', highlight: true },
    { title: t('active_items'), value: stats.activeProducts, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-medium italic">
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
              <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {t('dashboard_title')}
              </h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 italic">
                {t('dashboard_subtitle')}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
              <Calendar size={14} className="text-black" />
              {new Date().toLocaleDateString(i18n.language === 'kh' ? 'km-KH' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-left">
            {statCards.map((card, idx) => (
              <motion.div 
                whileHover={{ y: -8 }} 
                key={idx} 
                className={`${card.highlight ? 'bg-black shadow-2xl shadow-black/20 border-black' : 'bg-white border-gray-100'} p-7 rounded-[35px] border shadow-sm flex items-center gap-5 transition-all`}
              >
                <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}><card.icon size={24} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[2px] mb-1 text-gray-400">{card.title}</p>
                  <h3 className={`text-2xl font-black leading-none tracking-tighter italic ${card.highlight ? 'text-white' : 'text-gray-900'}`}>{card.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 text-left">
              {/* Sales Chart Section */}
              <div className="bg-white p-10 rounded-[45px] shadow-sm border border-gray-100 min-h-[480px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                  <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                    <TrendingUp size={20} /> {t('sales_performance')}
                  </h3>
                </div>
                
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#9ca3af'}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#9ca3af'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px', fontWeight: '900', fontStyle: 'italic' }} 
                        cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Alert Section */}
              <div className="bg-white p-10 rounded-[45px] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3 text-rose-500">
                    <AlertCircle size={24} /> {t('critical_stock')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 font-black shadow-sm border border-rose-100">
                             {p.stock || p.stocks || 0}
                           </div>
                           <div>
                             <p className="text-xs font-black text-gray-900 uppercase truncate w-32 italic">{p.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</p>
                           </div>
                        </div>
                        <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{t('restock_needed')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-10 text-center bg-emerald-50 rounded-[2rem]">
                       <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] italic">{t('inventory_healthy')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Selling Section */}
            <div className="bg-white p-10 rounded-[45px] shadow-sm border border-gray-100 text-left">
              <div className="flex items-center gap-3 mb-10 text-gray-900 border-b border-gray-50 pb-6">
                <Star size={24} className="fill-black" />
                <h3 className="text-lg font-black uppercase italic tracking-tight">{t('best_sellers')}</h3>
              </div>
              
              <div className="space-y-10">
                {topSellingProducts.map((product: any, idx: number) => (
                  <div key={product.id} className="flex items-center gap-5 group cursor-pointer">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 overflow-hidden border border-gray-100">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div>
                        )}
                      </div>
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-black text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter italic">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                           <div style={{ width: `${Math.min((product.soldCount / 50) * 100, 100)}%` }} className="h-full bg-black" />
                        </div>
                        <span className="text-[9px] font-black italic">{product.soldCount || 0} {t('sold_label')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Achievement Card */}
              <div className="mt-14 p-8 bg-zinc-900 rounded-[3rem] text-white relative overflow-hidden group">
                <div className="relative z-10 text-left">
                  <p className="text-[9px] font-black uppercase tracking-[3px] text-zinc-500 mb-2">{t('monthly_target')}</p>
                  <h3 className="text-4xl font-black italic tracking-tighter mb-4">78%</h3>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}