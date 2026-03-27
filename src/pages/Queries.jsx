import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  AlertCircle,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const QueryStatusBadge = ({ status }) => {
  const statusConfig = {
    new: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <AlertCircle size={12} />, label: 'New Lead' },
    contacted: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock size={12} />, label: 'Contacted' },
    closed: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={12} />, label: 'Closed' },
  };

  const config = statusConfig[status] || statusConfig.new;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const QueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/queries`);
      setQueries(res.data);
    } catch (err) {
      toast.error('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/queries/${id}`, { status });
      setQueries(queries.map(q => q._id === id ? { ...q, status } : q));
      if (selectedQuery?._id === id) {
        setSelectedQuery({ ...selectedQuery, status });
      }
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await axios.delete(`${API_BASE}/queries/${id}`);
      setQueries(queries.filter(q => q._id !== id));
      toast.success('Query deleted');
      if (selectedQuery?._id === id) setIsModalOpen(false);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredQueries = queries.filter(q => 
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.occasion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Customer Queries</h1>
          <p className="text-slate-500 font-medium">Manage leads from the "Book Your Dream Event" form.</p>
        </div>
        
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Leads...</td>
                </tr>
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No magic requests found</td>
                </tr>
              ) : filteredQueries.map((q) => (
                <tr key={q._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-sm">
                        {q.name ? q.name[0] : '?'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">{q.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{q.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700">{q.occasion || 'General Inquiry'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {q.date ? new Date(q.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <QueryStatusBadge status={q.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedQuery(q); setIsModalOpen(true); }}
                        className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-primary transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => deleteQuery(q._id)}
                        className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedQuery && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <MessageSquare size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Query Details</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2"><User size={14} className="text-brand-primary" /> {selectedQuery.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Occasion</p>
                  <p className="font-bold text-slate-800">{selectedQuery.occasion || 'General Inquiry'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2 hover:text-brand-primary"><Mail size={14} /> {selectedQuery.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2"><Phone size={14} /> {selectedQuery.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Date</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} /> {selectedQuery.date ? new Date(selectedQuery.date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted On</p>
                  <p className="font-bold text-slate-800">{new Date(selectedQuery.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Their Vision</p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-600 leading-relaxed font-medium">
                  "{selectedQuery.message}"
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <select 
                  value={selectedQuery.status}
                  onChange={(e) => updateStatus(selectedQuery._id, e.target.value)}
                  className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest outline-none"
                >
                  <option value="new">Mark as New</option>
                  <option value="contacted">Mark as Contacted</option>
                  <option value="closed">Mark as Closed</option>
                </select>
                <button 
                  onClick={() => deleteQuery(selectedQuery._id)}
                  className="px-6 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transition-colors flex items-center justify-center"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesPage;

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
