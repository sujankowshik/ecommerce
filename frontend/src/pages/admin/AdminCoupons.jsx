import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Loader2, Plus, Trash2, X, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (e) {
      console.error(e.message);
      toast.error('Failed to load system coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (couponId) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success('Coupon code deleted.');
      fetchCoupons();
    } catch (e) {
      toast.error(e.message || 'Failed to delete coupon.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      return toast.error('Code, Discount value, and Expiry date are required.');
    }

    setIsSaving(true);
    try {
      await api.post('/coupons', {
        code,
        discountType,
        discountValue: Number(discountValue),
        expiryDate
      });
      toast.success('Discount coupon successfully created!');
      setCode('');
      setDiscountValue('');
      setExpiryDate('');
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to create coupon.');
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
            <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Discount Coupons</h1>
            <p className="text-sm text-slate-500 mt-1">Configure and manage active promotional checkout codes ({coupons.length} total)</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary py-2.5 px-6 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>

        {/* Coupons table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-xl font-bold font-display">No Discount Coupons</h3>
            <p className="text-sm text-slate-500 font-light">Create promo codes to offer custom discount percentages to shoppers.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Coupon Code</th>
                    <th className="py-4 px-6">Discount Type</th>
                    <th className="py-4 px-6">Discount Value</th>
                    <th className="py-4 px-6">Expiry Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 font-bold font-mono text-primary-600 dark:text-primary-400 text-sm uppercase tracking-wider">{c.code}</td>
                      <td className="py-4 px-6 font-semibold text-slate-500 capitalize">{c.discountType}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-slate-200">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue.toFixed(2)}`}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500">{new Date(c.expiryDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          c.isActive && new Date(c.expiryDate) >= new Date()
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          {c.isActive && new Date(c.expiryDate) >= new Date() ? 'Active' : 'Expired/Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 rounded-xl"
                          aria-label="Delete coupon"
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
        )}

      </main>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl animate-fadeIn">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Create Coupon</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVE30"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm uppercase tracking-wider outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-700"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Value</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
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

export default AdminCoupons;
