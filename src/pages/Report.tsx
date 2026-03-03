"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Download, TrendingUp, AlertTriangle, DollarSign,
  Users, ShoppingBag, HeartCrack, PieChart, ArrowUpRight, X, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Report() {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState<string | null>(null);
  const [rawItems, setRawItems] = useState<any>({ orders: [], expenses: [], damaged: [], lowStock: [] });
  const [stats, setStats] = useState({
    totalRevenue: 0, totalExpense: 0, netProfit: 0,
    staffSalary: 0, restockExpense: 0, damagedValue: 0, lowStockCount: 0
  });

  const loadData = () => {
    const orders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    const products = JSON.parse(localStorage.getItem('zway_products') || '[]');
    const damaged = JSON.parse(localStorage.getItem('zway_damaged_items') || '[]');
    const expenses = JSON.parse(localStorage.getItem('zway_expenses') || '[]');

    const fOrders = orders.filter((o: any) => (o.date || "").startsWith(selectedMonth));
    const fExpenses = expenses.filter((e: any) => (e.date || "").startsWith(selectedMonth));
    const fDamaged = damaged.filter((d: any) => (d.date || "").startsWith(selectedMonth));
    const lowStock = products.filter((p: any) => p.stock <= 5);

    const revenue = fOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);
    const restock = fOrders.reduce((sum: number, o: any) => {
      return sum + (o.items?.reduce((is: number, i: any) => {
        const p = products.find((p: any) => p.id === i.id);
        return is + (parseFloat(p?.cost || 0) * (i.quantity || 1));
      }, 0) || 0);
    }, 0);

    const salary = fExpenses.filter((e: any) => e.category?.toLowerCase() === 'salary').reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
    const otherExp = fExpenses.filter((e: any) => e.category?.toLowerCase() !== 'salary').reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
    const damagedVal = fDamaged.reduce((sum: number, d: any) => sum + (parseFloat(d.cost || 0) * (d.quantity || 1)), 0);

    const totalAllExpenses = restock + salary + otherExp + damagedVal;
    
    setRawItems({ orders: fOrders, expenses: fExpenses, damaged: fDamaged, lowStock });
    setStats({
      totalRevenue: revenue, totalExpense: totalAllExpenses, netProfit: revenue - totalAllExpenses,
      staffSalary: salary, restockExpense: restock, damagedValue: damagedVal, lowStockCount: lowStock.length
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [selectedMonth]);

  const exportCSV = (type: string, data: any[]) => {
    const headers = ["Date", "Description", "Amount"];
    const rows = data.map(item => [item.date || 'N/A', item.customerName || item.category || item.name, item.total || item.amount || 0]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ZWAY_${type}_${selectedMonth}.csv`;
    link.click();
  };

  const handleFullReportPDF = () => {
    const doc = new jsPDF();
    doc.text("ZWAY FASHION REPORT", 105, 20, { align: 'center' });
    autoTable(doc, {
      startY: 30,
      head: [[t('reports.modal.name'), 'Amount']],
      body: [
        [t('reports.revenue'), `$${stats.totalRevenue}`],
        [t('reports.cogs'), `-$${stats.restockExpense}`],
        [t('reports.salary'), `-$${stats.staffSalary}`],
        [t('reports.damaged'), `-$${stats.damagedValue}`],
        [t('reports.profit'), `$${stats.netProfit}`],
      ],
      theme: 'striped'
    });
    doc.save(`Full_Report_${selectedMonth}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-medium italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 md:p-10 text-left">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">
                {t('reports.title')}
              </h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">
                {t('reports.sync')} • {selectedMonth}
              </p>
            </div>
            <div className="flex gap-3 bg-white p-2 px-4 rounded-[2rem] shadow-sm border border-gray-100">
              <input type="month" value={selectedMonth} className="text-xs font-black border-none outline-none bg-transparent cursor-pointer" onChange={(e) => setSelectedMonth(e.target.value)} />
              <button onClick={handleFullReportPDF} className="bg-black text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Download size={14} /> {t('reports.export_pdf')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard icon={<DollarSign/>} label={t('reports.profit')} value={`$${stats.netProfit}`} color="bg-emerald-50 text-emerald-600" onClick={() => setShowModal('profit')} />
            <StatCard icon={<ShoppingBag/>} label={t('reports.cogs')} value={`$${stats.restockExpense}`} color="bg-blue-50 text-blue-600" onClick={() => setShowModal('orders')} />
            <StatCard icon={<Users/>} label={t('reports.salary')} value={`$${stats.staffSalary}`} color="bg-purple-50 text-purple-600" onClick={() => setShowModal('expenses')} />
            <StatCard icon={<HeartCrack/>} label={t('reports.damaged')} value={`$${stats.damagedValue}`} color="bg-rose-50 text-rose-600" onClick={() => setShowModal('damaged')} />
            <StatCard icon={<TrendingUp/>} label={t('reports.revenue')} value={`$${stats.totalRevenue}`} color="bg-zinc-900 text-white" onClick={() => setShowModal('orders')} />
            <StatCard icon={<AlertTriangle/>} label={t('reports.low_stock')} value={stats.lowStockCount} color="bg-orange-50 text-orange-600" onClick={() => setShowModal('lowStock')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black uppercase text-sm italic">{t('reports.analysis')}</h3>
                    <BarChart3 className="text-gray-300" />
                </div>
                <div className="space-y-8">
                   <ProgressItem label={t('reports.revenue')} val={stats.totalRevenue} total={stats.totalRevenue} color="bg-emerald-500" />
                   <ProgressItem label={t('reports.salary')} val={stats.staffSalary} total={stats.totalRevenue} color="bg-purple-500" />
                   <ProgressItem label={t('reports.cogs')} val={stats.restockExpense} total={stats.totalRevenue} color="bg-blue-500" />
                </div>
            </div>
            <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
                <PieChart size={32} className="text-emerald-400" />
                <div>
                   <h3 className="text-xl font-black uppercase italic mb-4">{t('reports.summary')}</h3>
                   <p className="text-4xl font-black italic text-emerald-400">${stats.netProfit.toLocaleString()}</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </main>

        {/* Modal Logic */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase italic">{t('reports.details')}</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 bg-gray-100 rounded-full hover:bg-rose-100 transition-colors"><X/></button>
                </div>
                <div className="p-8 max-h-[400px] overflow-y-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase text-gray-400 border-b">
                          <th className="pb-4">{t('reports.modal.date')}</th>
                          <th className="pb-4">{t('reports.modal.name')}</th>
                          <th className="pb-4 text-right">{t('reports.modal.amount')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {renderModalTable(showModal, rawItems, t)}
                      </tbody>
                   </table>
                </div>
                <div className="p-8 bg-gray-50 flex justify-end">
                   <button onClick={() => exportCSV(showModal, rawItems[showModal === 'orders' ? 'orders' : showModal] || [])} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                     <FileText size={14}/> {t('reports.export_section')}
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ icon, label, value, color, onClick }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} onClick={onClick} className={`cursor-pointer p-7 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm flex items-center gap-5 transition-all`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <h4 className="text-2xl font-black italic">{value}</h4>
      </div>
    </motion.div>
  );
}

function ProgressItem({ label, val, total, color }: any) {
  const percent = total > 0 ? (val / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase mb-2">
        <span className="text-gray-400">{label}</span>
        <span>${val.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full ${color}`} />
      </div>
    </div>
  );
}

function renderModalTable(type: string, data: any, t: any) {
  let list = [];
  if (type === 'orders') list = data.orders;
  else if (type === 'expenses') list = data.expenses;
  else if (type === 'damaged') list = data.damaged;
  else if (type === 'lowStock') list = data.lowStock;
  else if (type === 'profit') list = data.orders; // Simplified for demo

  if (list.length === 0) return <tr><td colSpan={3} className="py-10 text-center text-gray-400 font-bold italic">{t('reports.modal.no_data')}</td></tr>;

  return list.map((item: any, i: number) => (
    <tr key={i} className="text-xs font-bold uppercase italic">
      <td className="py-4">{item.date || 'N/A'}</td>
      <td className="py-4">{item.customerName || item.category || item.name}</td>
      <td className="py-4 text-right text-black font-black">${(item.total || item.amount || item.price || 0).toLocaleString()}</td>
    </tr>
  ));
}