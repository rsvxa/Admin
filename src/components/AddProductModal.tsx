"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, ChevronDown, Package, DollarSign, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// ១. Import useTranslation
import { useTranslation } from 'react-i18next';

export default function AddProductModal({ isOpen, onClose, onSave, initialData }: any) {
  const { t } = useTranslation(); // ២. ប្រកាសប្រើ t()
  
  const [product, setProduct] = useState({
    name: '',
    price: '',
    category: 'Clothes',
    size: '',
    color: '',
    brand: 'None',
    type: '',
    description: '',
    stocks: '1',
    status: 'In Stock',
    image: null as string | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const brands = ["Nike", "Zara", "Adidas", "Dior", "Prada", "LV", "Chanel", "None"];
  const statusOptions = ["In Stock", "Ordering", "Out of Stock"];
  
  const typesByCategory: Record<string, string[]> = {
    Clothes: ["T-shirt", "Shirt", "Dress", "Jean", "Pant", "Hoodie", "Suite"],
    Jewelry: ["Necklace", "Earring", "Bracelet", "Ring"],
    Shoes: ["Sneaker", "Heel", "Dress Shoes"],
    Hats: ["Baseball Cap", "Beret", "Cowboy Hat"],
    Bags: ["Handbag", "Backpack", "Crossbody", "Clutches", "Wallet"]
  };

  useEffect(() => {
    if (initialData) {
      setProduct({
        ...initialData,
        price: initialData.price?.toString() || '',
        stocks: initialData.stocks?.toString() || '1',
        status: initialData.status || 'In Stock',
      });
    } else {
      setProduct({
        name: '', price: '', category: 'Clothes', size: '', color: '',
        brand: 'None', type: '', description: '', stocks: '1', status: 'In Stock', image: null
      });
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct({ ...product, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...product,
      price: parseFloat(product.price) || 0,
      stocks: parseInt(product.stocks) || 0,
      status: product.status 
    };
    onSave(finalData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl z-10 flex flex-col"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                  {initialData ? t('modal_update_title') : t('modal_create_title')}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('system_subtitle')}</p>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all shadow-sm">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar p-10 pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left: Image Section */}
                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">{t('label_gallery')}</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-100 bg-gray-50 rounded-[32px] aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-black/10 hover:bg-gray-100/50 transition-all overflow-hidden relative group shadow-inner"
                    >
                      {product.image ? (
                        <img src={product.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-16 h-16 bg-white shadow-sm text-gray-400 rounded-[20px] flex items-center justify-center mx-auto mb-4 group-hover:text-black transition-colors">
                            <Upload size={24} strokeWidth={2.5} />
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('click_to_upload')}</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100/50">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                         <Info className="text-white" size={12} />
                      </div>
                      <p className="text-[11px] font-medium text-blue-600/80 leading-relaxed">
                        {t('upload_tip')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Form Section */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Status Select */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_status')}</label>
                      <div className="relative">
                        <select 
                          className={`w-full appearance-none border-none rounded-2xl py-4.5 px-6 text-sm font-black outline-none transition-all shadow-sm ${
                            product.status === 'In Stock' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : product.status === 'Out of Stock' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          } focus:ring-4 focus:ring-black/5`}
                          value={product.status}
                          onChange={(e) => setProduct({...product, status: e.target.value})}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt} className="bg-white text-gray-800 font-bold">
                              {t(`status_${opt.toLowerCase().replace(/\s+/g, '_')}`)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} strokeWidth={3} />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_title')}</label>
                      <div className="relative">
                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                          type="text" required 
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 pl-14 pr-6 text-sm focus:bg-white focus:ring-4 ring-black/5 outline-none transition-all font-bold shadow-sm"
                          placeholder={t('placeholder_title')}
                          value={product.name}
                          onChange={(e) => setProduct({...product, name: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_stock')}</label>
                      <input 
                        type="number" required min="0"
                        className="w-full bg-gray-50 border-none rounded-2xl py-4.5 px-6 text-sm focus:bg-white focus:ring-4 ring-black/5 outline-none transition-all font-bold shadow-sm"
                        placeholder="1"
                        value={product.stocks}
                        onChange={(e) => setProduct({...product, stocks: e.target.value})}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_price')}</label>
                      <div className="relative">
                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="number" required step="0.01"
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 ring-black/5 outline-none transition-all font-black shadow-sm"
                          placeholder="0.00"
                          value={product.price}
                          onChange={(e) => setProduct({...product, price: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_category')}</label>
                      <div className="relative">
                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <select 
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 pl-14 pr-6 text-sm focus:bg-white outline-none appearance-none cursor-pointer font-bold transition-all shadow-sm focus:ring-4 focus:ring-black/5"
                          value={product.category}
                          onChange={(e) => setProduct({...product, category: e.target.value, type: ''})}
                        >
                          {Object.keys(typesByCategory).map(cat => (
                            <option key={cat} value={cat}>{t(`cat_${cat.toLowerCase()}`)}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_type')}</label>
                      <div className="relative">
                        <select 
                          required
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 px-6 text-sm focus:bg-white outline-none appearance-none cursor-pointer font-bold transition-all shadow-sm focus:ring-4 focus:ring-black/5"
                          value={product.type}
                          onChange={(e) => setProduct({...product, type: e.target.value})}
                        >
                          <option value="">{t('select_type')}</option>
                          {typesByCategory[product.category].map(type => (
                            <option key={type} value={type}>{t(`type_${type.toLowerCase().replace(/\s+/g, '_')}`)}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Size & Color */}
                    {(product.category === 'Clothes' || product.category === 'Shoes') && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_size')}</label>
                        <input 
                          type="text"
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 px-6 text-sm focus:bg-white outline-none transition-all font-bold shadow-sm focus:ring-4 focus:ring-black/5"
                          placeholder={product.category === 'Clothes' ? "S, M, L, XL" : "38, 39, 40, 41"}
                          value={product.size}
                          onChange={(e) => setProduct({...product, size: e.target.value})}
                        />
                      </div>
                    )}

                    {product.category !== 'Jewelry' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_color')}</label>
                        <input 
                          type="text"
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 px-6 text-sm focus:bg-white outline-none transition-all font-bold shadow-sm focus:ring-4 focus:ring-black/5"
                          placeholder={t('placeholder_color')}
                          value={product.color}
                          onChange={(e) => setProduct({...product, color: e.target.value})}
                        />
                      </div>
                    )}

                    {/* Brand */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_brand')}</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-gray-50 border-none rounded-2xl py-4.5 px-6 text-sm focus:bg-white outline-none appearance-none cursor-pointer font-bold transition-all shadow-sm focus:ring-4 focus:ring-black/5"
                          value={product.brand}
                          onChange={(e) => setProduct({...product, brand: e.target.value})}
                        >
                          {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('label_desc')}</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-gray-50 border-none rounded-[24px] py-5 px-6 text-sm focus:bg-white outline-none transition-all font-bold shadow-sm focus:ring-4 focus:ring-black/5"
                      placeholder={t('placeholder_desc')}
                      value={product.description}
                      onChange={(e) => setProduct({...product, description: e.target.value})}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 shrink-0 bg-white">
                    <button 
                      type="button" onClick={onClose}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black py-5 rounded-[20px] transition-all uppercase tracking-widest text-[10px]"
                    >
                      {t('btn_discard')}
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-black hover:bg-zinc-800 text-white font-black py-5 rounded-[20px] shadow-xl shadow-black/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
                    >
                      {initialData ? t('btn_update') : t('btn_publish')}
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}