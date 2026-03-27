import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Plus, Trash2, Edit, Search, Layers, Image as ImageIcon, CheckCircle2, AlertCircle, MoreVertical, ChevronRight, Package, Clock, ExternalLink, X, Check, Eye as EyeIcon, LayoutGrid, List } from "lucide-react";

import { API_BASE } from "../config";

const CategoryCard = ({ category, onEdit, onDelete, onViewProducts }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-slate-50 border border-slate-50">
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Layers size={48} strokeWidth={1.5} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => onEdit(category)}
                            className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white hover:text-slate-800 transition-all"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(category._id)}
                            className="w-10 h-10 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-100 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-black text-slate-800 tracking-tight group-hover:text-brand-primary transition-colors">
                        {category.name}
                    </h3>
                    <button
                        onClick={() => onViewProducts(category)}
                        className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                    >
                        <EyeIcon size={16} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                        ID: {category._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                        {category.products?.length || 0} Products
                    </span>
                </div>
            </div>
        </div>
    );
};

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewCategory, setViewCategory] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: "", products: [] });
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"


    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/category`);
            setCategories(res.data.categories || []);
            setLoading(false);
        } catch (err) {
            setError("Failed to load categories");
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/products/all`);
            setProducts(res.data?.products || []);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const handleProductSelect = (productId) => {
        setNewCategory((prev) => {
            if (prev.products.includes(productId)) {
                return { ...prev, products: prev.products.filter(id => id !== productId) };
            } else {
                return { ...prev, products: [...prev.products, productId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const url = isEdit
                ? `${API_BASE}/category/${currentCategoryId}`
                : `${API_BASE}/category`;
            const method = isEdit ? axios.put : axios.post;
            await method(url, newCategory);
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || "Error saving category");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await axios.delete(`${API_BASE}/category/${id}`);
                fetchCategories();
            } catch (err) {
                alert("Error deleting category");
            }
        }
    };

    const sortedProductsForModal = useMemo(() => {
        return products.filter(p =>
            p.title.toLowerCase().includes(searchProduct.toLowerCase())
        ).sort((a, b) => {
            const aSelected = newCategory.products.includes(a._id);
            const bSelected = newCategory.products.includes(b._id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });
    }, [products, newCategory.products, searchProduct]);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && categories.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Collections...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Categories</h1>
                    <p className="text-slate-500 font-medium">Organize your magical items into beautiful collections.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search collections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium shadow-sm"
                        />
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setIsEdit(false);
                            setCurrentCategoryId(null);
                            setNewCategory({ name: "", products: [] });
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
                        <Layers size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Collections</p>
                        <p className="text-2xl font-black text-slate-800">{categories.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-blue/30 flex items-center justify-center text-blue-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Items</p>
                        <p className="text-2xl font-black text-slate-800">{products.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-purple/30 flex items-center justify-center text-purple-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Store</p>
                        <p className="text-2xl font-black text-brand-primary font-brand uppercase">Propz.com</p>
                    </div>
                </div>
            </div>

            {/* Category Display Section */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategories.map((cat) => (
                        <CategoryCard
                            key={cat._id}
                            category={cat}
                            onEdit={(cat) => {
                                setIsEdit(true);
                                setCurrentCategoryId(cat._id);
                                setNewCategory({ name: cat.name, products: cat.products.map(p => p._id) });
                                setShowModal(true);
                            }}
                            onDelete={handleDelete}
                            onViewProducts={(cat) => {
                                setViewCategory(cat);
                                setShowViewModal(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest pl-10">Collection Name</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Identifier</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Items</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCategories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 pl-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-brand-primary transition-colors border border-transparent group-hover:border-slate-100">
                                                    <Layers size={20} />
                                                </div>
                                                <span className="font-black text-slate-800 tracking-tight text-base">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                                                ID: {cat._id.slice(-6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span className="text-xs font-black text-brand-primary bg-pastel-pink/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {cat.products?.length || 0} Products
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right pr-10">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setViewCategory(cat);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                                                    title="View Products"
                                                >
                                                    <EyeIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEdit(true);
                                                        setCurrentCategoryId(cat._id);
                                                        setNewCategory({ name: cat.name, products: cat.products.map(p => p._id) });
                                                        setShowModal(true);
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white transition-all"
                                                    title="Edit Category"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCategories.length === 0 && (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                No collections found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View Products Modal */}
            {showViewModal && viewCategory && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Collection Preview</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">"{viewCategory.name}"</p>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {viewCategory.products?.map((p) => (
                                <div key={p._id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-brand-primary/20 transition-all">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                                        {p.images?.[0]?.src ? (
                                            <img src={p.images[0].src} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={20} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-800 leading-tight mb-0.5">{p.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">₹{p.variants?.[0]?.price || 'N/A'}</p>
                                    </div>
                                    <ExternalLink size={16} className="text-slate-300" />
                                </div>
                            ))}
                            {!viewCategory.products?.length && (
                                <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No products in this collection</div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowViewModal(false)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {isEdit ? "Edit Collection" : "New Collection"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Collection Identity</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Handmade DIY Kits"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search & Select Items</label>
                                    <span className="text-[10px] font-black text-brand-primary bg-pastel-pink/30 px-2 py-0.5 rounded-full">{newCategory.products.length} Selected</span>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Find items for this collection..."
                                        value={searchProduct}
                                        onChange={(e) => setSearchProduct(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {sortedProductsForModal.map((p) => {
                                        const isSelected = newCategory.products.includes(p._id);
                                        return (
                                            <div
                                                key={p._id}
                                                onClick={() => handleProductSelect(p._id)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-brand-primary/5 border-brand-primary' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                                    {p.images?.[0]?.src ? (
                                                        <img src={p.images[0].src} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={16} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-800 truncate leading-tight">{p.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">₹{p.variants?.[0]?.price || 'N/A'}</p>
                                                </div>
                                                {isSelected ? (
                                                    <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-white"><Check size={12} strokeWidth={4} /></div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {isEdit ? "Update Collection" : "Create Collection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
