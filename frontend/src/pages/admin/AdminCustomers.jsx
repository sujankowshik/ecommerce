import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Loader2, Users, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/analytics/customers');
        setCustomers(data);
      } catch (e) {
        console.error(e.message);
        toast.error('Failed to load customers base.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto fade-in">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Customer Base</h1>
          <p className="text-sm text-slate-500 mt-1">Review customer contact profiles, order distributions, and total value contributions</p>
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading customers base...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-xl font-bold font-display">No Registered Customers</h3>
            <p className="text-sm text-slate-500 font-light">As soon as users register accounts in the system, they will register here.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Customer Profile</th>
                    <th className="py-4 px-6">Contact Phone</th>
                    <th className="py-4 px-6">Total Orders</th>
                    <th className="py-4 px-6">Completed Orders</th>
                    <th className="py-4 px-6">Total Contributions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 flex items-center space-x-3 min-w-[200px]">
                        {c.avatar ? (
                          <img src={c.avatar} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block">{c.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-500">{c.phoneNumber || 'Not supplied'}</td>
                      <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-350">{c.ordersCount}</td>
                      <td className="py-4 px-6">
                        <span className="text-emerald-500 font-bold">{c.paidOrdersCount} Paid</span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white flex items-center space-x-0.5 mt-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span>{c.totalSpent.toFixed(2)}</span>
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

export default AdminCustomers;
