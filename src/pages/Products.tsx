"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pencil, Search, Image as ImageIcon, Box, DollarSign, ShoppingCart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AddProductModal from '../components/AddProductModal';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Products() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('admin');
  const [orderCount, setOrderCount] = useState(0);

  // ១. ទាញយកផលិតផលពី LocalStorage
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
    const currentRole = localStorage.getItem('userRole') || 'admin';
    setUserRole(currentRole);
    const savedOrders = JSON.parse(localStorage.getItem('zway_orders') || '[]');
    setOrderCount(savedOrders.length);
  }, []);

  const categories = ['All', 'Clothes', 'Jewelry', 'Shoes', 'Hats', 'Bags'];

  // ២. Filter ទិន្នន័យ (រាល់ពេល Filter ទិន្នន័យក្នុង Table នឹងប្តូរ)
  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ៣. គណនាសរុបតាម filteredProducts (Dynamic Calculation)
  const displayTotalItems = filteredProducts.length;
  const displayTotalValue = filteredProducts.reduce((sum: number, p: any) => sum + (Number(p.price) * Number(p.stocks)), 0);

  useEffect(() => {
    localStorage.setItem('zway_products', JSON.stringify(products));
    window.dispatchEvent(new Event('storage')); 
  }, [products]);

  const handleDelete = (id: number) => {
    if (window.confirm(t('confirm_delete', 'តើអ្នកប្រាកដថាចង់លុបផលិតផលនេះមែនទេ?'))) {
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

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-sans italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10 pb-40"
        >
          {/* Header & Search Area */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 text-left">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {t('inventory_title', 'ឃ្លាំងទំនិញ')}
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                {t('displaying', 'កំពុងបង្ហាញ')}: {filteredProducts.length} {t('items', 'មុខទំនិញ')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('search_placeholder', 'ស្វែងរកផលិតផល...')}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {userRole === 'admin' && (
                <button 
                  onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                  className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95 hover:bg-zinc-800"
                >
                  <Plus size={20} strokeWidth={3} /> {t('add_product', 'បន្ថែមថ្មី')}
                </button>
              )}
            </div>
          </div>

          {/* Categories Tab */}
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
                  <span className="relative z-10">{t(`cat_${cat.toLowerCase()}`, cat)}</span>
                  {selectedCategory === cat && (
                    <motion.div layoutId="activePill" className="absolute inset-0 bg-black rounded-[18px] z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-10">
            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_info', 'ព័ត៌មាន')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_category', 'ប្រភេទ')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_price', 'តម្លៃរាយ')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_inventory', 'ស្តុក')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_total_price', 'តម្លៃសរុប')}</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{t('col_status', 'ស្ថានភាព')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">{t('col_action', 'គ្រប់គ្រង')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((p: any) => {
                    const rowTotalPrice = Number(p.price) * Number(p.stocks);
                    return (
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
                            {t(`cat_${p.category.toLowerCase()}`, p.category)}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-900 text-base">${Number(p.price).toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${Number(p.stocks) <= 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {p.stocks} {t('units_label', 'Units')}
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
                           <span className="font-black text-zinc-900 text-base italic underline decoration-zinc-200 underline-offset-4">
                             ${rowTotalPrice.toLocaleString()}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[2px] border ${
                            p.status === 'Out of Stock' || Number(p.stocks) <= 0
                              ? 'bg-rose-50 text-rose-600 border-rose-100' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {p.status === 'In Stock' ? t('status_in_stock', 'មានក្នុងស្តុក') : t('status_out_stock', 'អស់ពីស្តុក')}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Summary Floating Bar (Calculates based on Filtered Data) */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] p-4 flex flex-wrap justify-between items-center gap-4 px-10">
              
              {/* Total Products in current filter */}
              <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                <div className="p-3 bg-zinc-800 rounded-2xl text-white"><Box size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('total_items', 'ផលិតផលសរុប')}</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">{displayTotalItems} <span className="text-[10px] text-zinc-500">SKUs</span></p>
                </div>
              </div>

              {/* Total Inventory Value in current filter */}
              <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><DollarSign size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('col_total_price', 'តម្លៃសរុប')}</p>
                  <p className="text-xl font-black text-emerald-400 italic tracking-tighter">${displayTotalValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Static Orders Count */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><ShoppingCart size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t('total_orders', 'ការបញ្ជាទិញ')}</p>
                  <p className="text-xl font-black text-blue-400 italic tracking-tighter">{orderCount} <span className="text-[10px] text-zinc-500">Orders</span></p>
                </div>
              </div>

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