import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/admin/StatCard';
import SalesChart from '../../components/admin/SalesChart';
import { Loader2, DollarSign, ShoppingBag, Users, Box, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/analytics');
        setData(data);
      } catch (e) {
        console.error('Failed to load admin analytics:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-slate-500 font-medium">Assembling analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const { metrics, salesChart, recentOrders, topProducts } = data || {
    metrics: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 },
    salesChart: [],
    recentOrders: [],
    topProducts: []
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto fade-in">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Overview Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time indicators and store health summary</p>
        </div>

        {/* 4 Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${metrics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon={ShoppingBag}
            color="primary"
          />
          <StatCard
            title="Active Customers"
            value={metrics.totalCustomers}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="System Products"
            value={metrics.totalProducts}
            icon={Box}
            color="orange"
          />
        </div>

        {/* Recharts trend */}
        <SalesChart data={salesChart} />

        {/* Recent orders + Top Products grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Orders Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-[32px] space-y-5 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-850">
              <h3 className="font-bold font-display text-base">Recent Checkouts</h3>
              <Link to="/admin/orders" className="text-xs font-semibold text-primary-500 hover:underline">
                View All Orders
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No purchases recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{order.user?.name || 'Customer'}</span>
                      <span className="text-slate-400 font-mono text-[9px]">{order._id.substring(15)}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-800 dark:text-white block">₹{order.totalPrice.toFixed(2)}</span>
                      <span className="text-[10px] text-emerald-500 font-semibold">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products List */}
          <div className="glass-panel p-6 sm:p-8 rounded-[32px] space-y-5 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-850">
              <h3 className="font-bold font-display text-base">High Rated Products</h3>
              <Link to="/admin/products" className="text-xs font-semibold text-primary-500 hover:underline">
                Manage Catalog
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No products seeded in database.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((prod) => (
                  <div key={prod._id} className="flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={prod.images?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-850" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{prod.title}</span>
                        <span className="text-slate-400 font-semibold uppercase text-[9px] block">{prod.category?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{prod.ratings.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
