import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Loader2, Plus, Trash2, X, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (e) {
      console.error(e.message);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (catId) => {
    if (!window.confirm('Delete category? This action is permanent.')) return;
    try {
      await api.delete(`/categories/${catId}`);
      toast.success('Category deleted.');
      fetchCategories();
    } catch (e) {
      toast.error(e.message || 'Failed to delete category.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required.');

    setIsSaving(true);
    try {
      const placeholderImg = image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
      await api.post('/categories', { name, image: placeholderImg });
      toast.success('Category successfully created!');
      setName('');
      setImage('');
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      toast.error(e.message || 'Failed to create category.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Store Categories</h1>
            <p className="text-sm text-slate-500 mt-1">Configure and manage catalog curations ({categories.length} total)</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary py-2.5 px-6 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-xl font-bold font-display">No Categories</h3>
            <p className="text-sm text-slate-500 font-light">Create a new category using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-[2/1] relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img src={cat.image || 'https://via.placeholder.com/400x200'} alt={cat.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl active:scale-90 transition-colors shadow-md"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest">Slug: {cat.slug}</span>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-white mt-1">{cat.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl animate-fadeIn">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Create Category</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports & Recreation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Image Cover URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold"
                >
                  {isSaving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
