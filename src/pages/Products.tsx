"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Plus, Trash2, Pencil, Search, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AddProductModal from '../components/AddProductModal';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Products() {
  const { t } = useTranslation(); // ២. ប្រកាសប្រើ t()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const currentRole = localStorage.getItem('userRole') || 'admin';
    setUserRole(currentRole);
    const checkRole = () => setUserRole(localStorage.getItem('userRole') || 'admin');
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, []);

  // ៣. បកប្រែឈ្មោះ Category
  const categories = ['All', 'Clothes', 'Jewelry', 'Shoes', 'Hats', 'Bags'];

  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('zway_products');
      if (savedData) return JSON.parse(savedData);
    }
    return [
      {
        id: 1,
        name: "Nike Jordan 1 High",
        category: "Shoes",
        price: 1199,
        stocks: 15,
        status: "In Stock",
        publishDate: "05 Feb 2026",
        image: "https://i.pinimg.com/1200x/cc/df/79/ccdf79d72c01826b3e23db5f1c75a396.jpg"
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('zway_products', JSON.stringify(products));
    window.dispatchEvent(new Event('storage')); 
  }, [products]);

  const handleDelete = (id: number) => {
    // ៤. បកប្រែពាក្យក្នុង Alert
    if (window.confirm(t('confirm_delete'))) {
      setProducts(products.filter((p: any) => p.id !== id));
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    const finalStatus = productData.status || (Number(productData.stocks) <= 0 ? "Out of Stock" : "In Stock");
    const formattedData = {
      ...productData,
      stocks: Number(productData.stocks) || 0,
      price: Number(productData.price) || 0,
      status: finalStatus
    };

    if (editingProduct) {
      setProducts(products.map((p: any) => 
        p.id === editingProduct.id 
          ? { ...formattedData, id: p.id, publishDate: p.publishDate } 
          : p
      ));
    } else {
      const newProduct = {
        ...formattedData,
        id: Date.now(),
        publishDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setProducts((prev: any) => [newProduct, ...prev]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 text-left">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {t('inventory_title')}
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                {t('manage_items', { count: products.length })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('search_placeholder')}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {userRole === 'admin' && (
                <button 
                  onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                  className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95 hover:bg-zinc-800"
                >
                  <Plus size={20} strokeWidth={3} /> {t('add_product')}
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto pb-6 mb-4 no-scrollbar">
            <div className="bg-white p-1.5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat ? 'text-white' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  <span className="relative z-10">{t(`cat_${cat.toLowerCase()}`)}</span>
                  {selectedCategory === cat && (
                    <motion.div layoutId="activePill" className="absolute inset-0 bg-black rounded-[18px] z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_info')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_category')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_price')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_inventory')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_status')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((p: any) => (
                    <motion.tr key={p.id} layout className="group hover:bg-zinc-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 group-hover:rotate-2 transition-transform shadow-sm">
                            {p.image ? (
                              <img src={p.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm uppercase tracking-tighter">{p.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{p.id.toString().slice(-5)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                          {t(`cat_${p.category.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-gray-900 text-lg">${Number(p.price).toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${Number(p.stocks) <= 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {p.stocks} {t('units_label')}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${Math.min((Number(p.stocks) / 50) * 100, 100)}%` }}
                              className={`h-full ${Number(p.stocks) <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[2px] border ${
                          p.status === 'Out of Stock' || Number(p.stocks) <= 0
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {p.status === 'In Stock' ? t('status_in_stock') : t('status_out_stock')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          {userRole === 'admin' && (
                            <>
                              <button onClick={() => handleEdit(p)} className="p-3 bg-white text-gray-400 hover:text-black border border-gray-100 rounded-2xl shadow-sm transition-all hover:-translate-y-1">
                                <Pencil size={16} strokeWidth={3} />
                              </button>
                              <button onClick={() => handleDelete(p.id)} className="p-3 bg-white text-gray-400 hover:text-rose-500 border border-gray-100 rounded-2xl shadow-sm transition-all hover:-translate-y-1">
                                <Trash2 size={16} strokeWidth={3} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>

        <AddProductModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
          onSave={handleSaveProduct}
          initialData={editingProduct} 
        />
      </div>
    </div>
  );
}