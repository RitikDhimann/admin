import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Plus, Trash2, Calendar, Percent, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE } from '../config';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        expiryDate: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${API_BASE}/coupon`);
            setCoupons(res.data);
        } catch (err) {
            toast.error("Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/coupon`, form);
            toast.success("Coupon added magic!");
            setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', expiryDate: '' });
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add coupon");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this magic code?")) return;
        try {
            await axios.delete(`${API_BASE}/coupon/${id}`);
            toast.success("Coupon vanished!");
            fetchCoupons();
        } catch (err) {
            toast.error("Failed to delete coupon");
        }
    };

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen font-sans">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                    <Ticket className="text-brand-primary" size={32} />
                    Magic <span className="text-brand-primary">Coupons</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Create and manage discount codes for your customers.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-brand-primary" />
                            New Magic Code
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Coupon Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MAGIC20"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none font-bold transition-all"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                    <select
                                        value={form.discountType}
                                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                        className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none font-bold transition-all"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Value</label>
                                    <input
                                        type="number"
                                        placeholder="Value"
                                        value={form.discountValue}
                                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                        className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none font-bold transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Min Order (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0 for no limit"
                                    value={form.minOrderAmount}
                                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none font-bold transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
                                <input
                                    type="date"
                                    value={form.expiryDate}
                                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none font-bold transition-all"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-primary transition-all shadow-lg shadow-slate-900/10">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Active Coupons</h2>
                            <span className="px-4 py-1 bg-white rounded-full text-[10px] font-black text-slate-500 border border-slate-100 uppercase tracking-widest">
                                {coupons.length} Total
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Order</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">Summoning magic strings...</td>
                                        </tr>
                                    ) : coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No coupons found. Create some magic!</td>
                                        </tr>
                                    ) : (
                                        coupons.map((coupon) => (
                                            <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-pastel-pink/10 rounded-xl flex items-center justify-center text-brand-primary">
                                                            <Ticket size={20} />
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900 tracking-tight">{coupon.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                        {coupon.discountType === 'percentage' ? <Percent size={14} /> : <IndianRupee size={14} />}
                                                        <span className="text-sm">{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm text-slate-600 font-bold tracking-tight">₹{coupon.minOrderAmount}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                        <Calendar size={14} />
                                                        <span className="text-xs">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(coupon._id)}
                                                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Coupons;
