"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, DollarSign, Tag, Calendar as CalIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';

export default function Expenses() {
  const { t } = useTranslation(); // ២. ប្រកាសប្រើ t()
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Marketing');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('zway_expenses') || '[]');
    setExpenses(saved);
  }, []);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      category,
      date: new Date().toLocaleDateString()
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem('zway_expenses', JSON.stringify(updated));
    setTitle(''); 
    setAmount('');
    window.dispatchEvent(new Event('storage'));
  };

  const deleteExpense = (id: number) => {
    const updated = expenses.filter((ex: any) => ex.id !== id);
    setExpenses(updated);
    localStorage.setItem('zway_expenses', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form បញ្ចូលការចំណាយ */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm h-fit">
              <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6">
                {t('add_expense_title')}
              </h2>
              <form onSubmit={addExpense} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{t('label_expense_title')}</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e)=>setTitle(e.target.value)} 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" 
                    placeholder={t('placeholder_expense_title')} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{t('label_amount')} ($)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e)=>setAmount(e.target.value)} 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" 
                    placeholder="0.00" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{t('label_category')}</label>
                  <select 
                    value={category} 
                    onChange={(e)=>setCategory(e.target.value)} 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none appearance-none"
                  >
                    <option value="Marketing">{t('cat_marketing')}</option>
                    <option value="Rent">{t('cat_rent')}</option>
                    <option value="Utilities">{t('cat_utilities')}</option>
                    <option value="Delivery">{t('cat_delivery')}</option>
                    <option value="Other">{t('cat_other')}</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                  {t('btn_add_record')}
                </button>
              </form>
            </div>

            {/* បញ្ជីការចំណាយ */}
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-6">{t('col_description')}</th>
                    <th className="px-8 py-6">{t('col_category')}</th>
                    <th className="px-8 py-6">{t('col_amount')}</th>
                    <th className="px-8 py-6 text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.map((ex: any) => (
                    <tr key={ex.id} className="group hover:bg-gray-50/30 transition-all">
                      <td className="px-8 py-5">
                        <p className="font-black text-sm text-gray-900">{ex.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{ex.date}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                          {t(`cat_${ex.category.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-rose-500">
                        -${ex.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => deleteExpense(ex.id)} 
                          className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                        {t('no_expenses_found')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}