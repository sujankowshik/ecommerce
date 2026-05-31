import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Loader2, ShoppingBag, Eye, Truck, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (e) {
      console.error(e.message);
      toast.error('Failed to load system orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order successfully marked as ${status}!`);
      fetchOrders();
    } catch (e) {
      toast.error(e.message || 'Failed to update order status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case 'Processing':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Shipped':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto fade-in">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Customer Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Review all checkout transactions and fulfill delivery dispatches</p>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading system orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-xl font-bold font-display">No Orders Recorded</h3>
            <p className="text-sm text-slate-500 font-light">As soon as customers check out products, order logs will populate here.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Total Price</th>
                    <th className="py-4 px-6">Billing</th>
                    <th className="py-4 px-6">Delivery Status</th>
                    <th className="py-4 px-6 text-center">Fulfill Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-700 dark:text-slate-300">{ord._id.substring(12)}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{ord.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 block">{ord.user?.email || ''}</span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-slate-200">₹{ord.totalPrice.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${ord.isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {ord.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center space-x-2 shrink-0">
                        {ord.status === 'Processing' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'Shipped')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1 shadow-sm shadow-amber-500/10"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Ship</span>
                          </button>
                        )}
                        {ord.status === 'Shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'Delivered')}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1 shadow-sm shadow-emerald-500/10"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Deliver</span>
                          </button>
                        )}
                        {ord.status === 'Delivered' && (
                          <span className="text-emerald-500 font-bold text-xs">Fulfillment Complete</span>
                        )}
                        {ord.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'Processing')}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl"
                          >
                            Accept Order
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminOrders;
