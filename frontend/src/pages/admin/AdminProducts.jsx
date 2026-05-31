import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Loader2, Plus, Edit2, Trash2, X, UploadCloud, Star, SlidersHorizontal, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  // Products listing states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search/Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals / Overlay forms
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form details states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState([]);
  
  // Actions flags
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Products & Categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/products?page=${page}&limit=6&search=${search}&category=${categoryFilter}`
      );
      setProducts(data.products || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e.message);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (e) {
        console.error(e.message);
      }
    };
    fetchCats();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory(categories[0]?._id || '');
    setStock('');
    setFeatured(false);
    setImages([]);
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description || '');
    setPrice(product.price);
    setCategory(product.category?._id || '');
    setStock(product.stock);
    setFeatured(product.featured);
    setImages(product.images || []);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch (e) {
      toast.error(e.message || 'Failed to delete product.');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const { data } = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages((prev) => [...prev, ...data.urls]);
      toast.success('Images uploaded successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to upload images.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!title || !price || !category) {
      return toast.error('Title, Price, and Category are required.');
    }

    setIsSaving(true);
    const productPayload = {
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock || 0),
      featured,
      images
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productPayload);
        toast.success('Product successfully updated!');
      } else {
        await api.post('/products', productPayload);
        toast.success('New product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Product Inventory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and edit your store product listings ({total} total)</p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-primary py-2.5 px-6 rounded-xl text-sm font-bold flex items-center space-x-2 shrink-0 self-start sm:self-auto shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters and Searches row */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl select-none">
          <input
            type="text"
            placeholder="Search catalog titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary-400"
          />

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none text-slate-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          
          <button onClick={fetchProducts} className="btn-secondary py-2 px-5 rounded-xl text-xs font-bold">
            Search
          </button>
        </div>

        {/* Tabular Products Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading inventory catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <Box className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-xl font-bold font-display">No Products Seeded</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto font-light">Change filters or add a new product using the button above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-6 flex items-center space-x-3 min-w-[200px]">
                          <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-850 shrink-0" />
                          <span className="font-bold text-slate-750 dark:text-slate-200 truncate">{p.title}</span>
                          {p.featured && (
                            <span className="bg-amber-400 text-slate-900 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500">{p.category?.name}</td>
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">₹{p.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-bold text-xs ${p.stock <= 5 ? 'text-red-500' : 'text-slate-500'}`}>{p.stock}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 flex items-center space-x-1 mt-2">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>{p.ratings.toFixed(1)}</span>
                        </td>
                        <td className="py-4 px-6 text-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-600 rounded-xl inline-block"
                            aria-label="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 rounded-xl inline-block"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-xl disabled:opacity-40 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500 font-semibold">Page {page} of {pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pages))}
                  disabled={page === pages}
                  className="px-4 py-2 border rounded-xl disabled:opacity-40 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ======================================= */}
      {/* ADD / EDIT OVERLAY MODAL FORM */}
      {/* ======================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-5 shrink-0">
              <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form scroll window */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="col-span-full space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="Premium leather backpack"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="99.99"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="15"
                  />
                </div>

                {/* Category Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-350"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center space-x-3 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id="featuredToggle"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-slate-200 rounded"
                  />
                  <label htmlFor="featuredToggle" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Featured Product</label>
                </div>

                {/* Description */}
                <div className="col-span-full space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm outline-none"
                    placeholder="Write product specifications details..."
                  />
                </div>

                {/* Multi-Image File upload */}
                <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Images</label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800 select-none group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Image file trigger box */}
                    <label className="aspect-square bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer p-2 text-center text-[10px] text-slate-400 transition-colors select-none">
                      <UploadCloud className="w-6 h-6 text-slate-300 mb-1" />
                      <span>{isUploading ? 'Uploading...' : 'Choose files'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary py-3 rounded-2xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 btn-primary py-3 rounded-2xl text-sm font-bold"
                >
                  {isSaving ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
