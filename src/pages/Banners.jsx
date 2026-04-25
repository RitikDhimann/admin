import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Megaphone, 
  CheckCircle2, 
  X, 
  Check, 
  Palette,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { API_BASE, BASE_URL } from "../config";
import { toast } from "react-toastify";

const BannerCard = ({ banner, onEdit, onDelete, onToggleActive }) => {
    const imageUrl = banner.image ? (banner.image.startsWith('http') ? banner.image : `${BASE_URL}/${banner.image}`) : null;

    return (
        <div className={`bg-white rounded-3xl border ${banner.isActive ? 'border-brand-primary' : 'border-slate-100'} p-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative`}>
            {banner.isActive && (
                <div className="absolute -top-3 -right-3 bg-brand-primary text-white p-2 rounded-full shadow-lg z-10 animate-bounce">
                    <Check size={16} strokeWidth={4} />
                </div>
            )}
            
            <div 
                className="relative aspect-[16/5] rounded-2xl overflow-hidden mb-5 border border-slate-100 flex items-center justify-center p-4 text-center"
                style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
            >
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-black/20" />
                    </>
                ) : null}
                
                <p className="relative z-10 font-black text-sm uppercase tracking-wider line-clamp-2 drop-shadow-md">{banner.text}</p>
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                    <button
                        onClick={() => onEdit(banner)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-slate-800 transition-all"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(banner._id)}
                        className="w-10 h-10 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-100 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight line-clamp-1">
                            {banner.text}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            ID: {banner._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        onClick={() => onToggleActive(banner._id)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
                            banner.isActive 
                            ? 'bg-brand-primary text-white' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                        <Palette size={10} className="text-slate-400" />
                        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: banner.backgroundColor }} />
                        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: banner.textColor }} />
                    </div>

                    {banner.image && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full">
                            <ImageIcon size={10} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Image</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BannersPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentBannerId, setCurrentBannerId] = useState(null);
    const [newBanner, setNewBanner] = useState({ 
        text: "", 
        link: "", 
        backgroundColor: "#000000", 
        textColor: "#ffffff", 
        isActive: false,
        image: null,
        imagePreview: null
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${API_BASE}/banner`);
            setBanners(res.data.banners || []);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load banners");
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewBanner({
                ...newBanner,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const url = isEdit
                ? `${API_BASE}/banner/${currentBannerId}`
                : `${API_BASE}/banner`;
            
            const formData = new FormData();
            formData.append('text', newBanner.text);
            formData.append('link', newBanner.link);
            formData.append('backgroundColor', newBanner.backgroundColor);
            formData.append('textColor', newBanner.textColor);
            formData.append('isActive', newBanner.isActive);
            if (newBanner.image) {
                formData.append('image', newBanner.image);
            }

            const method = isEdit ? axios.patch : axios.post;
            await method(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowModal(false);
            toast.success(isEdit ? "Banner updated!" : "Banner created!");
            fetchBanners();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error saving banner");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            try {
                await axios.delete(`${API_BASE}/banner/${id}`);
                toast.success("Banner deleted");
                fetchBanners();
            } catch (err) {
                toast.error("Error deleting banner");
            }
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await axios.patch(`${API_BASE}/banner/${id}/toggle`);
            fetchBanners();
            toast.success("Banner status updated");
        } catch (err) {
            toast.error("Error toggling status");
        }
    };

    const filteredBanners = banners.filter((b) =>
        b.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && banners.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Banners...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Announcement Banners</h1>
                    <p className="text-slate-500 font-medium">Create alerts and event notifications for your customers.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setIsEdit(false);
                            setCurrentBannerId(null);
                            setNewBanner({ 
                                text: "", 
                                link: "", 
                                backgroundColor: "#000000", 
                                textColor: "#ffffff", 
                                isActive: false,
                                image: null,
                                imagePreview: null
                            });
                            setShowModal(true);
                        }}
                        className="btn-bubbly bg-slate-900 text-white shadow-slate-900/20 flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-pink/30 flex items-center justify-center text-brand-primary">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Banners</p>
                        <p className="text-2xl font-black text-slate-800">{banners.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-blue/30 flex items-center justify-center text-blue-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Banner</p>
                        <p className="text-xl font-black text-slate-800 truncate max-w-[150px]">
                            {banners.find(b => b.isActive)?.text || "None"}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-purple/30 flex items-center justify-center text-purple-600">
                        <Palette size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Visibility</p>
                        <p className="text-2xl font-black text-brand-primary font-brand uppercase">LIVE</p>
                    </div>
                </div>
            </div>

            {/* Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBanners.map((banner) => (
                    <BannerCard
                        key={banner._id}
                        banner={banner}
                        onEdit={(b) => {
                            setIsEdit(true);
                            setCurrentBannerId(b._id);
                            setNewBanner({ 
                                text: b.text, 
                                link: b.link, 
                                backgroundColor: b.backgroundColor, 
                                textColor: b.textColor, 
                                isActive: b.isActive,
                                image: null,
                                imagePreview: b.image ? (b.image.startsWith('http') ? b.image : `${BASE_URL}/${b.image}`) : null
                            });
                            setShowModal(true);
                        }}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                    />
                ))}
            </div>

            {filteredBanners.length === 0 && !loading && (
                <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <Megaphone size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No Banners Found</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">Start by creating a new announcement banner to engage your visitors.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-900/20"
                    >
                        Create Your First Banner
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {isEdit ? "Edit Banner" : "New Banner"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Banner Image (Optional)</label>
                                <div className="relative group/img">
                                    {newBanner.imagePreview ? (
                                        <div className="relative aspect-[16/5] rounded-2xl overflow-hidden border border-slate-100 group">
                                            <img src={newBanner.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                    <Upload size={14} /> Change Image
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setNewBanner({...newBanner, image: null, imagePreview: null})}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center aspect-[16/5] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-brand-primary/30 transition-all cursor-pointer group">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:scale-110 transition-all">
                                                <ImageIcon size={24} />
                                            </div>
                                            <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Banner Background</p>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Banner Content</label>
                                <textarea
                                    placeholder="e.g. ✨ FLAT 20% OFF ON ALL GIFT KITS! USE CODE: SURPRISE20 ✨"
                                    value={newBanner.text}
                                    onChange={(e) => setNewBanner({ ...newBanner, text: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none resize-none h-32"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Link (Optional)</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text"
                                        placeholder="e.g. /diy-kits or https://example.com"
                                        value={newBanner.link}
                                        onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Background Color</label>
                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                                        <input
                                            type="color"
                                            value={newBanner.backgroundColor}
                                            onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                                            className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs font-black text-slate-600 uppercase">{newBanner.backgroundColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Text Color</label>
                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                                        <input
                                            type="color"
                                            value={newBanner.textColor}
                                            onChange={(e) => setNewBanner({ ...newBanner, textColor: e.target.value })}
                                            className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs font-black text-slate-600 uppercase">{newBanner.textColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={14} className="text-brand-primary" />
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Preview</p>
                                </div>
                                <div 
                                    className="relative p-4 rounded-xl text-center font-black text-[10px] uppercase tracking-wider min-h-[60px] flex items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: newBanner.backgroundColor, color: newBanner.textColor }}
                                >
                                    {newBanner.imagePreview && (
                                        <>
                                            <img src={newBanner.imagePreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                            <div className="absolute inset-0 bg-black/20" />
                                        </>
                                    )}
                                    <span className="relative z-10 drop-shadow-md">{newBanner.text || "Banner Preview Content"}</span>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-100">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${newBanner.isActive ? 'bg-brand-primary text-white' : 'bg-white border border-slate-200'}`}>
                                    {newBanner.isActive && <Check size={14} strokeWidth={4} />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={newBanner.isActive}
                                    onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Set as Active Banner</span>
                            </label>
                        </form>

                        <div className="p-8 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {isEdit ? "Update Banner" : "Create Banner"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannersPage;
