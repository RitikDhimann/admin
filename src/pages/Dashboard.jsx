import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-2xl font-black text-slate-800">{value}</p>
  </div>
);

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/order/stats`);
        setStatsData(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Revenue', value: `₹${statsData?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: IndianRupee, color: 'bg-slate-900' },
    { title: 'Total Orders', value: statsData?.totalOrders || 0, icon: ShoppingBag, color: 'bg-pastel-blue' },
    { title: 'New Customers', value: statsData?.newCustomers || 0, icon: Users, color: 'bg-pastel-purple' },
    { title: 'Products', value: statsData?.totalProducts || 0, icon: Package, color: 'bg-pastel-orange' },
  ];

  const recentOrders = (statsData?.recentOrders || []).map(order => ({
    id: order?._id ? `#${order._id.substring(Math.max(0, order._id.length - 6)).toUpperCase()}` : 'N/A',
    customer: order?.user?.name || 'Guest',
    amount: `₹${order?.totalPrice || 0}`,
    status: order?.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Processing',
    date: order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'
  }));

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Processing': return 'bg-amber-50 text-amber-600';
      case 'Shipped': return 'bg-blue-50 text-blue-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <button className="btn-bubbly bg-slate-900 text-white shadow-slate-900/20">
          <TrendingUp size={18} className="inline mr-2" />
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Recent Orders</h2>
            <button className="text-brand-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{order.customer}</td>
                    <td className="px-6 py-4 font-black text-slate-800">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
             <h2 className="text-lg font-black text-slate-800 tracking-tight mb-4">Store Overview</h2>
             <div className="space-y-4">
               {[
                 { label: 'Pending Shipments', count: statsData?.storeOverview?.pendingShipments || 0, icon: Clock, color: 'text-amber-500', link: '/orders?status=processing' },
                 { label: 'Completed Orders', count: statsData?.storeOverview?.completedOrders || 0, icon: CheckCircle, color: 'text-green-500', link: '/orders?status=delivered' },
                 { label: 'Out of Stock', count: statsData?.storeOverview?.outOfStock || 0, icon: AlertCircle, color: 'text-red-500', link: '/products?stock=out-of-stock' },
               ].map((item) => (
                 <Link 
                   key={item.label} 
                   to={item.link}
                   className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-100 transition-colors group"
                 >
                   <div className="flex items-center gap-3">
                     <item.icon className={item.color} size={18} />
                     <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{item.label}</span>
                   </div>
                   <span className="text-sm font-black text-slate-800">{item.count}</span>
                 </Link>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
