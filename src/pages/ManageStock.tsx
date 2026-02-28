"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Plus, Trash2, Pencil, Search, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AddProductModal from '../components/AddProductModal';

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', 'Clothes', 'Jewelry', 'Shoes', 'Hats', 'Bags'];
  
  // ប្រើ key 'zway_products' ឱ្យដូច Dashboard ដើម្បីឱ្យវាទាញទិន្នន័យគ្នាបាន
  const [products, setProducts] = useState(() => {
    const savedData = localStorage.getItem('zway_products');
    if (savedData) return JSON.parse(savedData);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('zway_products', JSON.stringify(products));
    // បាញ់ Event ដើម្បីឱ្យ Dashboard ដឹងថាមានការផ្លាស់ប្តូរទិន្នន័យ
    window.dispatchEvent(new Event('storage'));
  }, [products]);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p: any) => p.id !== id));
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      setProducts(products.map((p: any) => 
        p.id === editingProduct.id 
          ? { 
              ...productData, 
              id: p.id, 
              publishDate: p.publishDate,
              // បញ្ជាក់តម្លៃលេខឱ្យច្បាស់សម្រាប់ Dashboard
              cost: Number(productData.cost) || 0,
              price: Number(productData.price) || 0,
              stocks: Number(productData.stocks) || 0
            } 
          : p
      ));
    } else {
      const newProduct = {
        ...productData,
        id: Date.now(),
        publishDate: getCurrentDate(),
        cost: Number(productData.cost) || 0,
        price: Number(productData.price) || 0,
        stocks: Number(productData.stocks) || 0,
      };
      setProducts((prev: any) => [newProduct, ...prev]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-medium italic">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <AnimatePresence mode="wait">
          <motion.main 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10 text-left"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Inventory</h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Manage stock & profit margins</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input 
                    type="text" 
                    placeholder="Search stock..."
                    className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <button 
                  onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                  className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase hover:bg-zinc-800 transition-all shadow-xl whitespace-nowrap"
                >
                  <Plus size={18} /> Add Product
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto pb-4 mb-10 no-scrollbar justify-center">
              <div className="bg-white p-1.5 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-8 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCategory === cat ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cost</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Margin</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((p: any) => {
                      const margin = p.price - (p.cost || 0);
                      return (
                        <motion.tr key={p.id} layout className="group hover:bg-zinc-50/50 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm flex-shrink-0">
                                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>}
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm italic uppercase tracking-tighter">{p.name}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">{p.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-bold text-rose-500 text-sm">${p.cost || 0}</td>
                          <td className="px-6 py-6 font-black text-gray-900 text-base italic">${p.price}</td>
                          <td className="px-6 py-6 italic font-black text-[11px]">
                            <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">+${margin.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`text-[11px] font-black uppercase italic ${Number(p.stocks) < 5 ? 'text-rose-500' : 'text-gray-900'}`}>
                              {p.stocks} units
                            </span>
                            <div className="w-12 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full ${Number(p.stocks) < 5 ? 'bg-rose-500' : 'bg-black'}`} style={{ width: `${Math.min((Number(p.stocks) / 20) * 100, 100)}%` }} />
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleEdit(p)} className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-2xl transition-all"><Pencil size={16} /></button>
                              <button onClick={() => handleDelete(p.id)} className="p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.main>
        </AnimatePresence>

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