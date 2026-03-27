import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config';

const AdminLogin = () => {
    const USER_API = `${API_BASE}/user`;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${USER_API}/login`, { email, password, isAdminLogin: true });
            
            const { token, user } = res.data;

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            
            const from = location.state?.from?.pathname || '/';
            toast.success("Welcome, Commander! ✨");
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Login component error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Login failed. Check your magic key.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-brand">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-primary to-purple-600 shadow-2xl shadow-brand-primary/20 mb-6 group cursor-default">
                        <ShieldCheck className="text-white size-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Admin <span className="text-brand-primary">Command</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Surprise Sutra Control Center</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {/* Glossy edge */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@magic.com"
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secret Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white pl-14 pr-14 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all font-bold"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-brand-primary to-purple-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Launch Dashboard
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    Authorized Personnel Only • IP Logged
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
