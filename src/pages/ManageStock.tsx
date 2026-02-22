import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Plus, Trash2, Pencil, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AddProductModal from '../components/AddProductModal';

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', 'Clothes', 'Jewelry', 'Shoes', 'Hats', 'Bags'];
  
  const [products, setProducts] = useState(() => {
    const savedData = localStorage.getItem('my_inventory_data');
    if (savedData) return JSON.parse(savedData);
    
    return [
      {
        id: 1,
        name: "Nike Jordan 1 High",
        category: "Shoes",
        price: 1199,
        stocks: 15,
        publishDate: "05 Feb 2026",
        image: "https://i.pinimg.com/1200x/cc/df/79/ccdf79d72c01826b3e23db5f1c75a396.jpg"
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('my_inventory_data', JSON.stringify(products));
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
          ? { ...productData, id: p.id, publishDate: p.publishDate } 
          : p
      ));
    } else {
      const newProduct = {
        ...productData,
        id: Date.now(),
        publishDate: getCurrentDate(),
        stocks: Number(productData.stocks) || 0,
        price: Number(productData.price) || 0,
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
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <AnimatePresence mode="wait">
          <motion.main 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Product Inventory</h1>
                <p className="text-gray-400 text-sm font-medium">Manage and monitor your store stock</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="Search products..."
                    className="w-full bg-gray-100 border border-gray-400 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:bg-gray-200 focus:ring-gray-500/10 transition-all"
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <button 
                  onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                  className="bg-gray-100 hover:bg-black border border-gray-300 text-black hover:text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-gray-500/20 whitespace-nowrap"
                >
                  <Plus size={25} /> Add Product
                </button>
              </div>
            </div>

            {/* Category Filter - White Style */}
            <div className="flex justify-center mb-10">
              <div className="bg-white border border-gray-100 p-1.5 rounded-full shadow-sm flex items-center gap-1 relative">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`relative px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[1px] transition-colors duration-300 z-10 ${
                        isActive ? 'text-white' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {cat}
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 bg-black rounded-full -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Section - Light Style */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Product</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Category</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Price</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Stock</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Published</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[2px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((p: any) => (
                      <motion.tr key={p.id} layout className="group hover:bg-gray-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 shadow-sm">
                              {p.image ? (
                                <img src={p.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                              )}
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-800 text-base">${p.price}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${Number(p.stocks) < 5 ? 'text-red-500' : 'text-[#10b981]'}`}>
                              {p.stocks} pcs
                            </span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                              <div 
                                className={`h-full ${Number(p.stocks) < 5 ? 'bg-red-400' : 'bg-[#10b981]'}`} 
                                style={{ width: `${Math.min((Number(p.stocks) / 20) * 100, 100)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[13px] text-gray-400 font-medium">{p.publishDate}</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                              <button onClick={() => handleEdit(p)} className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-xl transition-all">
                                <Pencil size={18} />
                              </button>
                              <button onClick={() => handleDelete(p.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={18} />
                              </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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