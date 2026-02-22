"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Download, TrendingUp, 
  AlertTriangle, DollarSign,
  Users, ShoppingBag, HeartCrack, PieChart, ArrowUpRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Report() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    staffSalary: 0,
    restockExpense: 0,
    damagedValue: 0,
    lowStockCount: 0
  });
  
  // កំណត់ខែបច្ចុប្បន្នជា Default (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const loadData = () => {
      const orders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
      const products = JSON.parse(localStorage.getItem('zway_products') || '[]');
      const damaged = JSON.parse(localStorage.getItem('zway_damaged_items') || '[]');
      const expenses = JSON.parse(localStorage.getItem('zway_expenses') || '[]');

      // ១. ចម្រោះទិន្នន័យតាមខែដែលបានជ្រើសរើស
      const filteredOrders = orders.filter((o: any) => (o.date || "").startsWith(selectedMonth));
      const filteredExpenses = expenses.filter((e: any) => (e.date || "").startsWith(selectedMonth));
      const filteredDamaged = damaged.filter((d: any) => (d.date || "").startsWith(selectedMonth));

      // ២. គណនាចំណូលសរុប (Revenue)
      const revenue = filteredOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);

      // ៣. គណនាថ្លៃដើមទំនិញដែលបានលក់ (COGS/Restock Expense)
      // យើងទាញយក Cost ពី Product List មកគុណនឹងចំនួនដែលលក់ដាច់
      const restock = filteredOrders.reduce((sum: number, o: any) => {
        const orderCost = o.items?.reduce((itemSum: number, item: any) => {
          const product = products.find((p: any) => p.id === item.id);
          const unitCost = parseFloat(product?.cost || 0);
          return itemSum + (unitCost * (item.quantity || 1));
        }, 0) || 0;
        return sum + orderCost;
      }, 0);

      // ៤. គណនាចំណាយផ្សេងៗ (Salary vs Others)
      const salary = filteredExpenses
        .filter((e: any) => e.category?.toLowerCase() === 'salary')
        .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
      
      const otherExp = filteredExpenses
        .filter((e: any) => e.category?.toLowerCase() !== 'salary')
        .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

      // ៥. គណនាតម្លៃទំនិញខូចខាត (Loss from Damaged Goods)
      const damagedVal = filteredDamaged.reduce((sum: number, d: any) => {
        const product = products.find((p: any) => p.id === d.productId);
        const costPerUnit = parseFloat(product?.cost || d.cost || 0);
        return sum + (costPerUnit * (d.quantity || 1));
      }, 0);

      // ៦. សរុបចំណាយ និងប្រាក់ចំណេញសុទ្ធ
      const totalAllExpenses = restock + salary + otherExp + damagedVal;
      const netProfit = revenue - totalAllExpenses;

      setStats({
        totalRevenue: revenue,
        totalExpense: totalAllExpenses,
        netProfit: netProfit,
        staffSalary: salary,
        restockExpense: restock,
        damagedValue: damagedVal,
        lowStockCount: products.filter((p: any) => p.stock <= 5).length
      });
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [selectedMonth]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ZWAY FASHION - FINANCIAL REPORT", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Report Period: ${selectedMonth}`, 105, 28, { align: 'center' });
    
    autoTable(doc, {
      startY: 40,
      head: [[t('description', 'Description'), t('amount', 'Amount')]],
      body: [
        [t('total_revenue', 'ចំណូលសរុប'), `$${stats.totalRevenue.toLocaleString()}`],
        [t('restock_expense', 'ថ្លៃដើមទំនិញ (COGS)'), `-$${stats.restockExpense.toLocaleString()}`],
        [t('staff_salary', 'ប្រាក់ខែបុគ្គលិក'), `-$${stats.staffSalary.toLocaleString()}`],
        [t('damaged_goods', 'ទំនិញខូចខាត'), `-$${stats.damagedValue.toLocaleString()}`],
        [t('total_expenses', 'ចំណាយសរុប'), `-$${stats.totalExpense.toLocaleString()}`],
        [t('net_profit', 'ប្រាក់ចំណេញសុទ្ធ'), `$${stats.netProfit.toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], fontStyle: 'bold' },
      foot: [[t('status', 'Status'), stats.netProfit >= 0 ? 'PROFITABLE' : 'LOSS']],
      footStyles: { fillColor: stats.netProfit >= 0 ? [16, 185, 129] : [239, 68, 68] }
    });

    doc.save(`ZWAY_Report_${selectedMonth}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-medium italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 md:p-10">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <div className="text-left">
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">
                {t('financial_report', 'របាយការណ៍ហិរញ្ញវត្ថុ')}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                  {t('live_data_sync', 'ទិន្នន័យបច្ចុប្បន្នភាព')} • {selectedMonth}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-[2rem] shadow-sm border border-gray-100 w-full lg:w-auto">
              <input 
                type="month" 
                value={selectedMonth} 
                className="text-xs font-black border-none outline-none bg-transparent cursor-pointer" 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
              <button 
                onClick={handleExportPDF} 
                className="bg-black text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Download size={14} /> {t('export_pdf', 'ទាញយក PDF')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard icon={<DollarSign size={20}/>} label={t('net_profit', 'ចំណេញសុទ្ធ')} value={`$${stats.netProfit.toLocaleString()}`} color={stats.netProfit >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"} />
            <StatCard icon={<ShoppingBag size={20}/>} label={t('restock_expense', 'ថ្លៃដើមទំនិញ')} value={`$${stats.restockExpense.toLocaleString()}`} color="bg-blue-50 text-blue-600 border-blue-100" />
            <StatCard icon={<Users size={20}/>} label={t('staff_salary', 'ប្រាក់ខែបុគ្គលិក')} value={`$${stats.staffSalary.toLocaleString()}`} color="bg-purple-50 text-purple-600 border-purple-100" />
            <StatCard icon={<HeartCrack size={20}/>} label={t('damaged_goods', 'ទំនិញខូចខាត')} value={`$${stats.damagedValue.toLocaleString()}`} color="bg-rose-50 text-rose-600 border-rose-100" />
            <StatCard icon={<TrendingUp size={20}/>} label={t('total_revenue', 'ចំណូលលក់សរុប')} value={`$${stats.totalRevenue.toLocaleString()}`} color="bg-zinc-900 text-white border-zinc-800" />
            <StatCard icon={<AlertTriangle size={20}/>} label={t('low_stock', 'ទំនិញជិតអស់')} value={stats.lowStockCount} color="bg-orange-50 text-orange-600 border-orange-100" />
          </div>

          {/* Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 text-left">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black rounded-2xl text-white">
                      <BarChart3 size={20} />
                    </div>
                    <h3 className="font-black uppercase text-sm tracking-tighter italic">{t('profit_loss_analysis', 'វិភាគចំណេញ និងខាត')}</h3>
                  </div>
                  <ArrowUpRight className="text-gray-300" />
               </div>
               
               <div className="space-y-6">
                  <div className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('revenue', 'ចំណូល')}</span>
                      <span className="text-sm font-black text-emerald-600">+ ${stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: "100%" }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('expenses', 'ចំណាយសរុប')}</span>
                      <span className="text-sm font-black text-rose-600">- ${stats.totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(stats.totalExpense / (stats.totalRevenue || 1)) * 100}%` }}
                        className="h-full bg-rose-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-10 border-[4px] border-black rounded-[2.5rem] mt-12 bg-zinc-50/50">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">{t('net_profit_summary', 'ប្រាក់ចំណេញសុទ្ធចុងក្រោយ')}</p>
                        <h2 className={`text-5xl font-black tracking-tighter italic ${stats.netProfit >= 0 ? 'text-black' : 'text-rose-600'}`}>
                            ${stats.netProfit.toLocaleString()}
                        </h2>
                      </div>
                      <div className="hidden md:block text-right">
                         <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 font-black uppercase text-[10px] tracking-widest ${
                           stats.netProfit >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                         }`}>
                           {stats.netProfit >= 0 ? t('healthy', 'អាជីវកម្មមានចំណេញ') : t('loss', 'កំពុងខាតបង់')}
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-black rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <PieChart className="text-emerald-400 mb-6" size={32} />
                 <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{t('financial_insight', 'ការវាយតម្លៃ')}</h3>
                 <p className="text-zinc-400 text-xs leading-relaxed font-bold uppercase tracking-wide">
                   {stats.netProfit > 0 
                     ? "ស្ថានភាពហិរញ្ញវត្ថុរបស់អ្នកមានភាពល្អប្រសើរ។ អ្នកអាចពិចារណាបន្ថែមស្តុក ឬវិនិយោគលើការផ្សព្វផ្សាយ។"
                     : "ចំណាយលើសចំណូល! សូមពិនិត្យមើលថ្លៃដើមទំនិញ និងកាត់បន្ថយចំណាយមិនចាំបាច់។"}
                 </p>
               </div>
               <div className="mt-10 relative z-10">
                 <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{t('operating_margin', 'Margin')}</p>
                    <p className="text-2xl font-black italic">
                      {stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
                    </p>
                 </div>
               </div>
               {/* Decorative Circle */}
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }} 
      className={`bg-white p-7 rounded-[2.5rem] border ${color.includes('border') ? color : 'border-gray-100'} shadow-sm flex items-center gap-6 transition-all`}
    >
      <div className={`w-16 h-16 ${color.split(' border')[0]} rounded-[1.5rem] flex items-center justify-center shadow-inner`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h4 className="text-2xl font-black text-gray-900 tracking-tighter italic leading-none">{value}</h4>
      </div>
    </motion.div>
  );
}