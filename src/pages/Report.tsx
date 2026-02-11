"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';

export default function Report() {
  const { t } = useTranslation(); // ២. ប្រកាសប្រើ t()
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadData = () => {
      const orders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
      setReportData(orders);
    };
    loadData();
  }, []);

  // --- មុខងារ Export PDF ជាមួយ Filter ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    const filteredOrders = reportData.filter((order: any) => {
      if (!startDate || !endDate) return true;
      const orderDate = new Date(order.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return orderDate >= start && orderDate <= end;
    });

    // ចំណងជើងក្នុង PDF (ប្រើ t() សម្រាប់ភាសា)
    doc.setFontSize(18);
    doc.text(`ZWAY FASHION - ${t('pdf_report_title')}`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`${t('pdf_date_range')}: ${startDate || t('pdf_all')} ${t('pdf_to')} ${endDate || t('pdf_all')}`, 14, 28);
    doc.text(`${t('pdf_total_transactions')}: ${filteredOrders.length}`, 14, 34);

    const tableRows = filteredOrders.map((order: any, index: number) => [
      index + 1,
      order.id?.slice(-5) || "N/A",
      order.customerName || "Guest",
      order.date || "N/A",
      t(`status_${order.status.toLowerCase()}`), // បកប្រែ Status ក្នុង PDF
      `$${order.total}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [[
        '#', 
        t('pdf_col_order_id'), 
        t('pdf_col_customer'), 
        t('pdf_col_date'), 
        t('pdf_col_status'), 
        t('pdf_col_amount')
      ]],
      body: tableRows,
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.save(`ZWAY_Report_${startDate || 'all'}_to_${endDate || 'all'}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="text-left">
              <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-3">
                <BarChart3 className="text-indigo-600" /> {t('report_title')}
              </h1>
              <p className="text-gray-400 font-medium text-xs uppercase tracking-widest mt-1">
                {t('report_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-1">{t('label_from')}</label>
                <input 
                  type="date" 
                  className="text-xs font-bold border-none focus:ring-0 bg-gray-50 rounded-lg px-3 py-2 outline-none"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-1">{t('label_to')}</label>
                <input 
                  type="date" 
                  className="text-xs font-bold border-none focus:ring-0 bg-gray-50 rounded-lg px-3 py-2 outline-none"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button 
                onClick={handleExportPDF}
                className="mt-4 md:mt-0 flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
              >
                <Download size={14} /> {t('btn_export_pdf')}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black uppercase text-xs tracking-widest text-gray-500">{t('recent_transactions')}</h3>
                <span className="bg-black text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">
                    {reportData.length} {t('total_suffix')}
                </span>
             </div>
             <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                   <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-4">{t('col_customer')}</th>
                      <th className="px-8 py-4">{t('col_date')}</th>
                      <th className="px-8 py-4">{t('col_amount')}</th>
                      <th className="px-8 py-4 text-right">{t('col_status')}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-left">
                   {reportData.slice(0, 10).map((order: any, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-all">
                         <td className="px-8 py-4 font-black text-sm text-gray-900">{order.customerName}</td>
                         <td className="px-8 py-4 text-xs font-bold text-gray-400">{order.date}</td>
                         <td className="px-8 py-4 font-black text-gray-900">${order.total}</td>
                         <td className="px-8 py-4 text-right">
                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                                {t(`status_${order.status.toLowerCase()}`)}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

        </main>
      </div>
    </div>
  );
}