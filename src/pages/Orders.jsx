import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { 
  Eye, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  User, 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  IndianRupee,
  MessageCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock size={12} />, label: 'Waitlist' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Package size={12} />, label: 'Preparing' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Truck size={12} />, label: 'On its Way' },
    out_for_delivery: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <Truck size={12} />, label: 'Out for Delivery' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={12} />, label: 'Delivered' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle size={12} />, label: 'Cancelled' },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingId, setUpdatingId] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParam = searchParams.get('status');
    const [statusFilter, setStatusFilter] = useState(statusParam || 'all');
    const ordersPerPage = 10;

    const ORDER_API = `${API_BASE}/order`;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(ORDER_API);
                // The API returns an array directly based on previous file
                const data = Array.isArray(response.data) ? response.data : (response.data?.orders || []);
                // Filter OUT Event Bookings (orders with an 'occasion')
                const productOrders = data.filter(order => !order.occasion);
                const sortedOrders = productOrders.sort((a, b) => 
                  new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );
                setOrders(sortedOrders);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch orders');
                setLoading(false);
            }
        };
        fetchOrders();
    }, [ORDER_API]);

    useEffect(() => {
        if (statusParam) {
            setStatusFilter(statusParam);
        } else {
            setStatusFilter('all');
        }
    }, [statusParam]);

    const updateStatus = async (orderId, newStatus, newPaymentStatus) => {
        setUpdatingId(orderId);
        try {
            const body = {};
            if (newStatus) body.orderStatus = newStatus;
            if (newPaymentStatus) body.paymentStatus = newPaymentStatus;

            const res = await axios.patch(`${ORDER_API}/${orderId}/status`, body);
            
            setOrders(orders.map(o => o._id === orderId ? { 
                ...o, 
                orderStatus: newStatus || o.orderStatus,
                paymentStatus: newPaymentStatus || o.paymentStatus
            } : o));
            
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ 
                    ...selectedOrder, 
                    orderStatus: newStatus || selectedOrder.orderStatus,
                    paymentStatus: newPaymentStatus || selectedOrder.paymentStatus
                });
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
      const matchesSearch = 
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (order.orderStatus || 'processing').toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    if (loading) return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Orders...</p>
      </div>
    );

    if (error) return (
      <div className="text-center bg-red-50 p-8 rounded-3xl border border-red-100 mx-auto max-w-md my-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-red-800">Oops!</h3>
        <p className="text-red-600 font-medium mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-bubbly bg-red-500 text-white">Try Again</button>
      </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">Orders</h1>
                  <p className="text-slate-500 font-medium">Track and manage your customer journeys.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by ID or customer..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium shadow-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
                      <Filter size={18} className="text-slate-400" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStatusFilter(val);
                          setSearchParams(prev => {
                            if (val === 'all') {
                              prev.delete('status');
                            } else {
                              prev.set('status', val);
                            }
                            return prev;
                          });
                          setCurrentPage(1);
                        }}
                        className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 outline-none pr-8 cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Waitlist</option>
                        <option value="processing">Preparing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type/Occasion</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentOrders.map((order) => (
                                <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <span className="font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg text-xs">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-slate-300" size={14} />
                                            <span className="text-xs font-bold text-slate-600">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-pastel-pink/30 flex items-center justify-center text-brand-primary font-black text-xs">
                                                {order.shippingAddress?.name?.[0] || order.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">
                                                    {order.shippingAddress?.name || order.user?.name || 'Guest User'}
                                                </p>
                                                <p className="text-[10px] font-medium text-slate-400">{order.shippingAddress?.phone || 'No phone'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-black text-slate-800 tracking-tight">{order.occasion || (order.orderItems?.length > 1 ? 'Multi-Product' : 'DIY Kit')}</p>
                                            <p className="text-[10px] font-bold text-brand-brown/50 uppercase tracking-widest">{order.orderItems?.[0]?.title?.substring(0, 20)}...</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1 font-black text-slate-800">
                                            <IndianRupee size={14} />
                                            <span>{order.totalPrice || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <OrderStatusBadge status={order.orderStatus || 'processing'} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => handleViewDetails(order)}
                                                className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center shadow-sm group-hover:scale-105"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                        currentPage === page 
                                        ? 'bg-slate-900 text-white shadow-lg' 
                                        : 'bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pastel-blue/30 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">
                                        Order #{selectedOrder._id.slice(-8).toUpperCase()}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <OrderStatusBadge status={selectedOrder.orderStatus || 'processing'} />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">•</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(selectedOrder.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Customer & Shipping */}
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Customer Profile</h3>
                                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-primary">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{selectedOrder.shippingAddress?.name || selectedOrder.user?.name}</p>
                                                    <p className="text-xs font-medium text-slate-500">Regular Customer</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 pt-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 px-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {selectedOrder.user?.email || 'No email provided'}
                                                </div>
                                                {selectedOrder.shippingAddress?.phone && (
                                                    <a 
                                                        href={`https://wa.me/${selectedOrder.shippingAddress.phone.replace(/\D/g, '')}?text=Hi ${selectedOrder.shippingAddress.name}, this is from Surprise Sutra regarding your order #${selectedOrder._id.slice(-8).toUpperCase()}.`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-200 mt-2"
                                                    >
                                                        <MessageCircle size={14} />
                                                        WhatsApp Customer
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Order Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Occasion</p>
                                                <p className="text-sm font-black text-slate-800">{selectedOrder.occasion || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fulfillment</p>
                                                <p className="text-sm font-black text-slate-800">{selectedOrder.orderStatus || 'processing'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={14} className="text-brand-primary" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                                                </div>
                                                <p className="text-sm font-black text-slate-800">
                                                    {selectedOrder.eventDate ? new Date(selectedOrder.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date set'}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock size={14} className="text-brand-primary" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Time</p>
                                                </div>
                                                <p className="text-sm font-black text-slate-800">{selectedOrder.eventTime || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Shipping Activity</h3>
                                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                                            <div className="flex gap-3">
                                                <Truck className="text-brand-primary shrink-0" size={18} />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                        Estimated delivery within 3-5 business days. 
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Carrier: Delhivery Express</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Center/Right: Line Items */}
                                <div className="lg:col-span-2 space-y-6">
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Package Items</h3>
                                            <span className="px-3 py-1 bg-pastel-pink/30 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {selectedOrder.orderItems?.length || 0} Products
                                            </span>
                                        </div>
                                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Detail</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {selectedOrder.orderItems?.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                                                        {item.image ? (
                                                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                                                <Package size={20} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-800 leading-tight mb-1">{item.name}</p>
                                                                        <p className="text-[10px] font-bold text-brand-brown/50 uppercase tracking-wider">ID: {item.product || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                                                                {item.qty}
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-sm font-black text-slate-800">
                                                                ₹{item.price}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* Order Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <section className="p-6 rounded-[2rem] bg-slate-900 text-white flex flex-col justify-between">
                                            <div>
                                                <CreditCard className="text-brand-primary mb-4" size={24} />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Due</p>
                                                <div className="flex items-center gap-1 text-3xl font-black tracking-tighter text-brand-primary">
                                                    <IndianRupee size={28} />
                                                    <span>{selectedOrder.totalPrice || 0}</span>
                                                </div>
                                            </div>
                                            <div className="mt-8 space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                                    <span>Status</span>
                                                    <span className={`text-white uppercase ${selectedOrder.paymentStatus === 'paid' ? 'text-brand-primary' : ''}`}>
                                                        {selectedOrder.paymentStatus || 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-brand-primary transition-all duration-500" 
                                                        style={{ 
                                                            width: 
                                                                selectedOrder.orderStatus === 'delivered' ? '100%' :
                                                                selectedOrder.orderStatus === 'out_for_delivery' ? '75%' :
                                                                selectedOrder.orderStatus === 'shipped' ? '50%' :
                                                                selectedOrder.orderStatus === 'processing' ? '25%' : '10%'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <div className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fulfillment Status</p>
                                            <select 
                                                value={selectedOrder.orderStatus || 'processing'}
                                                onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                                                disabled={updatingId === selectedOrder._id}
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none disabled:opacity-50"
                                            >
                                                <option value="processing">Preparing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="out_for_delivery">Out for Delivery</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>

                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Payment Status</p>
                                            <select 
                                                value={selectedOrder.paymentStatus || 'pending'}
                                                onChange={(e) => updateStatus(selectedOrder._id, undefined, e.target.value)}
                                                disabled={updatingId === selectedOrder._id}
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none disabled:opacity-50"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>

                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const res = await axios.post(`${ORDER_API}/${selectedOrder._id}/status-email`);
                                                        alert(res.data.message || 'Notification sent!');
                                                    } catch (err) {
                                                        alert(err.response?.data?.message || 'Failed to send notification');
                                                    }
                                                }}
                                                className="w-full py-4 bg-pastel-pink/30 text-brand-primary rounded-2xl font-black text-xs uppercase tracking-[0.1em] hover:bg-pastel-pink/50 transition-all"
                                            >
                                                Send Update Notification
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={closeModal} className="px-8 py-3 bg-white text-slate-600 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;