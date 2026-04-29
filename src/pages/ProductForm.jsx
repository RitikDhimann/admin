import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Package, 
  ChevronLeft,
  Globe,
  Layers,
  IndianRupee,
  Info
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { API_BASE, BASE_URL } from "../config";

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [activeTab, setActiveTab] = useState('basic'); // basic, variants, seo
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]); // General images (Files)
    const [variantImages] = useState({}); // { "Color-Size": [Files] }
    
    const [product, setProduct] = useState({
      title: "",
      handle: "",
      description: "",
      vendor: "Surprise Sutra",
      productCategory: "",
      type: "",
      tags: [],
      published: false,
      giftCard: false,
      seo: { title: "", description: "" },
      variants: [],
      images: [],
      variantImages: [],
      termsAndConditions: "",
      boxContents: "",
      colors: [],
      // Easy access fields for products without complex variants
      basePrice: 0,
      baseInventory: 0,
    });

    const processedCombos = useRef(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await axios.get(`${API_BASE}/category`);
                setCategories(catRes.data.categories || []);

                if (isEdit) {
                    const prodRes = await axios.get(`${API_BASE}/products/${id}`);
                    const data = prodRes.data;
                    setProduct(data);
                    processedCombos.current = new Set(
                        data.variants.map((v) => `${v.color}-${v.size}`)
                    );
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct((p) => {
            const newProduct = { ...p, [name]: type === "checkbox" ? checked : value };
            if (name === "published") {
                newProduct.status = checked ? "active" : "draft";
            }
            return newProduct;
        });
    };

    const handleSeoChange = (e) => {
        const { name, value } = e.target;
        setProduct((p) => ({
            ...p,
            seo: { ...p.seo, [name]: value },
        }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (!product.tags.includes(tag)) {
                setProduct((p) => ({ ...p, tags: [...p.tags, tag] }));
            }
            e.target.value = "";
        }
    };

    const removeTag = (tag) => {
        setProduct((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
    };

    // Color/Size/Variant Handlers (from original logic)
    const addColor = () => {
        setProduct((p) => ({
            ...p,
            colors: [...p.colors, { id: Date.now().toString(), name: "", hex: "#000000", sizes: [] }],
        }));
    };

    const updateColor = (id, field, value) => {
        setProduct((p) => ({
            ...p,
            colors: p.colors.map((c) => c.id === id ? { ...c, [field]: value } : c),
        }));
    };

    const removeColor = (id) => {
        const color = product.colors.find((c) => c.id === id);
        const colorName = color?.name;
        setProduct((p) => ({
            ...p,
            colors: p.colors.filter((c) => c.id !== id),
            variants: p.variants.filter((v) => v.color !== colorName),
        }));
    };

    const handleSizeKeyDown = (e, colorId) => {
        if (e.key === "Enter" && e.target.value.trim()) {
            e.preventDefault();
            addSize(colorId, e.target.value.trim());
            e.target.value = "";
        }
    };

    const addSize = (colorId, sizeInput) => {
        const size = sizeInput.toUpperCase();
        const color = product.colors.find((c) => c.id === colorId);
        if (!color || !color.name) {
            alert("Please enter color name first");
            return;
        }
        setProduct((p) => ({
            ...p,
            colors: p.colors.map((c) =>
                c.id === colorId
                    ? { ...c, sizes: c.sizes.includes(size) ? c.sizes : [...c.sizes, size] }
                    : c
            ),
        }));
    };

    const removeSizeFromColor = (colorId, size) => {
        const color = product.colors.find((c) => c.id === colorId);
        const colorName = color?.name;
        setProduct((p) => ({
            ...p,
            colors: p.colors.map((c) => c.id === colorId ? { ...c, sizes: c.sizes.filter((s) => s !== size) } : c),
            variants: p.variants.filter((v) => !(v.color === colorName && v.size === size)),
        }));
    };

    const addVariantsForColor = (colorId, currentInputValue) => {
        const color = product.colors.find((c) => c.id === colorId);
        if (!color || !color.name) return;

        // If there's pending text in the input, add it as a size first
        let currentSizes = [...color.sizes];
        if (currentInputValue && currentInputValue.trim()) {
            const newSize = currentInputValue.trim().toUpperCase();
            if (!currentSizes.includes(newSize)) {
                currentSizes.push(newSize);
                // Also update the color object so the tag appears
                setProduct(p => ({
                    ...p,
                    colors: p.colors.map(c => c.id === colorId ? { ...c, sizes: currentSizes } : c)
                }));
            }
        }

        if (currentSizes.length === 0) {
            alert("Please add at least one size (type and press Enter)");
            return;
        }

        setProduct((p) => {
            const newVariants = [...p.variants];
            let addedCount = 0;

            currentSizes.forEach((size) => {
                const key = `${color.name}-${size}`;
                if (!newVariants.some(v => v.variantKey === key)) {
                    newVariants.push({
                        color: color.name,
                        size,
                        variantKey: key,
                        price: p.basePrice || 0,
                        compareAtPrice: 0,
                        sku: `SS-${color.name.slice(0, 2).toUpperCase()}-${size}-${Date.now().toString().slice(-4)}`,
                        inventoryQty: p.baseInventory || 0,
                    });
                    addedCount++;
                }
            });

            if (addedCount === 0) {
                alert("All variants for this color already exist!");
                return p;
            }

            return { ...p, variants: newVariants };
        });
    };

    const updateVariant = (color, size, field, value) => {
        setProduct((p) => ({
            ...p,
            variants: p.variants.map((v) =>
                v.color === color && v.size === size
                    ? {
                        ...v,
                        [field]: field === "price" || field === "compareAtPrice" ? parseFloat(value) || 0 : field === "inventoryQty" ? parseInt(value) || 0 : value,
                    }
                    : v
            ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        // Auto-generate default variant if no variants exist but price/stock is set
        let finalVariants = [...product.variants];
        if (finalVariants.length === 0 && (product.basePrice > 0 || product.baseInventory > 0)) {
            finalVariants = [{
                color: "Default",
                size: "Regular",
                variantKey: "Default-Regular",
                price: parseFloat(product.basePrice) || 0,
                compareAtPrice: 0,
                sku: `SS-${Date.now().toString().slice(-6)}`,
                inventoryQty: parseInt(product.baseInventory) || 0,
            }];
        }

        const payload = { 
            ...product, 
            variants: finalVariants,
            images: isEdit ? product.images : [], 
            variantImages: isEdit ? product.variantImages : [] 
        };
        formData.append("data", JSON.stringify(payload));

        images.forEach((file) => formData.append("general", file));
        Object.entries(variantImages).forEach(([variantKey, files]) => {
            files.forEach((file) => formData.append(`variant-${variantKey}`, file));
        });

        try {
            if (isEdit) {
                await axios.put(`${API_BASE}/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                await axios.post(`${API_BASE}/products`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            }
            navigate("/products");
        } catch (err) {
            alert(err.response?.data?.message || "Error saving product");
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === id 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                   <button 
                        type="button"
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-slate-400 hover:text-brand-primary font-bold text-xs uppercase tracking-widest mb-4 transition-colors"
                   >
                       <ChevronLeft size={16} /> Back to Products
                   </button>
                   <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                       {isEdit ? "Edit Product" : "New Product"}
                   </h1>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button 
                        type="button"
                        onClick={() => navigate('/products')}
                        className="flex-1 lg:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex-1 lg:flex-none btn-bubbly bg-slate-900 text-white shadow-slate-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        {isEdit ? "Save Changes" : "Publish Product"}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-3">
                <TabButton id="basic" icon={Info} label="General" />
                <TabButton id="variants" icon={Layers} label="Variants & Stock" />
                <TabButton id="seo" icon={Globe} label="SEO & More" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    {activeTab === 'basic' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={product.title}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Handle (URL)</label>
                                        <input
                                            type="text"
                                            name="handle"
                                            value={product.handle}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Base Price (₹)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="number"
                                                name="basePrice"
                                                value={product.basePrice}
                                                onChange={handleChange}
                                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 transition-all outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium pl-1 italic">Used if no variants are defined</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Initial Stock</label>
                                        <div className="relative">
                                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="number"
                                                name="baseInventory"
                                                value={product.baseInventory}
                                                onChange={handleChange}
                                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 transition-all outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium pl-1 italic">Total available quantity</p>
                                    </div>
                                </div>

                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows="6"
                                        value={product.description}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Gallery</h3>
                                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-brand-primary/30 transition-all group">
                                    <Upload className="mx-auto w-12 h-12 text-slate-300 mb-4 group-hover:text-brand-primary transition-colors" />
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        id="general-upload"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files);
                                            setImages([...images, ...files]);
                                        }}
                                    />
                                    <label htmlFor="general-upload" className="btn-bubbly bg-slate-100 text-slate-600 px-6 py-2 cursor-pointer inline-block">Choose Files</label>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {(images || []).map((file, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => setImages((images || []).filter((_, idx) => idx !== i))}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all z-10"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                    {isEdit && (product.images || []).map((img, i) => (
                                        <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                                            <img src={img.src.startsWith('http') ? img.src : `${BASE_URL}${img.src}`} alt="" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newImages = product.images.filter((_, idx) => idx !== i);
                                                    setProduct(prev => ({ ...prev, images: newImages }));
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all z-10"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variants */}
                    {activeTab === 'variants' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex justify-between items-center capitalize font-black text-slate-800">
                                    <span>Define Options</span>
                                    <button type="button" onClick={addColor} className="text-xs text-brand-primary flex items-center gap-1">
                                        <Plus size={14} /> Add Color Group
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {(product.colors || []).map((color) => (
                                        <div key={color.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Color Name (e.g. Red)"
                                                    value={color.name}
                                                    onChange={(e) => updateColor(color.id, "name", e.target.value)}
                                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black"
                                                />
                                                <input
                                                    type="color"
                                                    value={color.hex}
                                                    onChange={(e) => updateColor(color.id, "hex", e.target.value)}
                                                    className="w-full h-full min-h-[50px] bg-white border border-slate-200 rounded-2xl cursor-pointer"
                                                />
                                                <button type="button" onClick={() => removeColor(color.id)} className="text-red-400 hover:text-red-500 flex justify-center items-center">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="relative group/size">
                                                <input
                                                    type="text"
                                                    id={`size-input-${color.id}`}
                                                    placeholder="Type size and press Enter (e.g. S, M, L)"
                                                    onKeyDown={(e) => handleSizeKeyDown(e, color.id)}
                                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium pr-16"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.getElementById(`size-input-${color.id}`);
                                                        if (input.value.trim()) {
                                                            addSize(color.id, input.value.trim());
                                                            input.value = "";
                                                        }
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(color.sizes || []).map(size => (
                                                    <span key={size} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                                                        {size} <X size={12} className="cursor-pointer text-slate-300 hover:text-red-500" onClick={() => removeSizeFromColor(color.id, size)} />
                                                    </span>
                                                ))}
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const input = document.getElementById(`size-input-${color.id}`);
                                                    addVariantsForColor(color.id, input.value);
                                                    input.value = "";
                                                }}
                                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-900/20"
                                            >
                                                Generate Variants for {color.name || 'this color'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight px-4">Active Variants</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(product.variants || []).map((v, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 relative group/v">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setProduct(p => ({
                                                        ...p,
                                                        variants: p.variants.filter((_, idx) => idx !== i)
                                                    }));
                                                }}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="flex justify-between font-black text-slate-800 pr-8">
                                                <span className="text-xs uppercase">{v.color} / {v.size}</span>
                                                <span className="text-[10px] text-slate-300">{v.sku || 'NO SKU'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</label>
                                                    <input type="number" value={v.price} onChange={(e) => updateVariant(v.color, v.size, "price", e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-xs font-black" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</label>
                                                    <input type="number" value={v.inventoryQty} onChange={(e) => updateVariant(v.color, v.size, "inventoryQty", e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-xs font-black" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO */}
                    {activeTab === 'seo' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Search Engine Optimization</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Title</label>
                                        <input type="text" name="title" value={product.seo.title} onChange={handleSeoChange} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-black text-blue-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                                        <textarea name="description" rows="4" value={product.seo.description} onChange={handleSeoChange} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-500 outline-none" />
                                    </div>
                                </div>
                             </div>
                             
                             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Policies & Contents</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Box Contents</label>
                                        <textarea value={product.boxContents} onChange={(e) => setProduct({...product, boxContents: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Conditions</label>
                                        <textarea value={product.termsAndConditions} onChange={(e) => setProduct({...product, termsAndConditions: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none" />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Categorization</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collection</label>
                                <select 
                                    name="productCategory" 
                                    value={product.productCategory} 
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-700 outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</label>
                                <input type="text" onKeyDown={handleTagKeyDown} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium" placeholder="Add tags..." />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(product.tags || []).map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-pastel-pink/30 text-brand-primary rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                                            {tag} <X size={10} className="cursor-pointer" onClick={() => removeTag(tag)} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Status</h3>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full transition-all relative ${product.published ? 'bg-green-400' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${product.published ? 'left-7' : 'left-1'}`}></div>
                                </div>
                                <input type="checkbox" name="published" checked={product.published} onChange={handleChange} className="hidden" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Published</span>
                            </label>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] bg-slate-900 p-8 shadow-xl text-white space-y-6 overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 blur-3xl -translate-y-12 translate-x-12"></div>
                         <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Analytics Preview</h4>
                         <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Margin</span>
                                <span className="text-xl font-brand text-brand-primary">45%</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</span>
                                <span className="text-xl font-brand">₹{product.variants[0]?.price || '0'}</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;