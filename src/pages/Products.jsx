import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, BASE_URL } from '../config';
import { 
  Trash2, 
  Edit, 
  Eye, 
  Plus, 
  Store, 
  IndianRupee, 
  Info, 
  Tag, 
  Layers, 
  Image, 
  Package, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';



const ProductTable = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(25);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const stockParam = searchParams.get('stock');
    const [stockFilter, setStockFilter] = useState(stockParam || 'all');

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE}/products/all`);
                setProducts(response.data?.products);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch products');
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (stockParam) {
            setStockFilter(stockParam);
        } else {
            setStockFilter('all');
        }
    }, [stockParam]);

    // Calculate pagination for filtered products
    const filteredProducts = products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.vendor && p.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesStock = true;
      if (stockFilter === 'out-of-stock') {
        matchesStock = p.variants?.some(v => v.inventoryQty <= 0);
      } else if (stockFilter === 'in-stock') {
        matchesStock = p.variants?.every(v => v.inventoryQty > 0);
      }
      
      return matchesSearch && matchesStock;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Handle View action
    const handleView = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Handle Edit action
    const handleEdit = (id) => {
        navigate(`/edit-product/${id}`);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    // Handle Delete Click
    const onDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    // Close Delete Modal
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    // Perform Delete
    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            setIsDeleting(true);
            await axios.delete(`${API_BASE}/products/${productToDelete._id}`);
            
            // Update local state
            setProducts(products.filter(p => p._id !== productToDelete._id));
            
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            setIsDeleting(false);
        } catch (err) {
            console.error("Delete error:", err);
            setError('Failed to delete product. Please try again.');
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            setIsDeleting(false);
        }
    };

    if (loading) return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Magical Products...</p>
      </div>
    );

    if (error) return (
      <div className="text-center bg-red-50 p-8 rounded-3xl border border-red-100 mx-auto max-w-md my-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-red-800">Oops! Something went wrong</h3>
        <p className="text-red-600 font-medium mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-bubbly bg-red-500 text-white">Try Again</button>
      </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Search and Add Product */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">Products</h1>
                  <p className="text-slate-500 font-medium">Manage your magical collection with ease.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
                      <Filter size={18} className="text-slate-400" />
                      <select 
                        value={stockFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStockFilter(val);
                          setSearchParams(prev => {
                            if (val === 'all') {
                              prev.delete('stock');
                            } else {
                              prev.set('stock', val);
                            }
                            return prev;
                          });
                          setCurrentPage(1);
                        }}
                        className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 outline-none pr-8 cursor-pointer"
                      >
                        <option value="all">All Stock</option>
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                      </select>
                    </div>
                    <Link
                        to="/add-product"
                        className="btn-bubbly bg-slate-900 text-white shadow-slate-900/20 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={20} /> Add Product
                    </Link>
                </div>
            </div>

            {/* Pagination and View Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm gap-4">
              <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Show:</span>
                  <select
                      value={productsPerPage}
                      onChange={(e) => {
                        setProductsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-slate-50 border-none rounded-xl text-xs font-black px-4 py-2 focus:ring-2 focus:ring-brand-primary/20"
                  >
                      <option value={25}>25 Items</option>
                      <option value={50}>50 Items</option>
                      <option value={100}>100 Items</option>
                  </select>
                  <span className="text-xs font-bold text-slate-400">Total: {filteredProducts.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     const pageNum = i + 1;
                     return (
                       <button
                         key={pageNum}
                         onClick={() => setCurrentPage(pageNum)}
                         className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                           currentPage === pageNum 
                           ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                           : 'bg-white text-slate-500 hover:bg-slate-50'
                         }`}
                       >
                         {pageNum}
                       </button>
                     );
                   })}
                   {totalPages > 5 && <span className="px-2 text-slate-300">...</span>}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Product Table */}
            {currentProducts.length > 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentProducts.map((product) => {
                                const price = product.variants && product.variants.length > 0 
                                  ? `₹${product.variants[0].price || 0}` 
                                  : 'N/A';
                                
                                const statusColors = {
                                  active: 'bg-green-100 text-green-700',
                                  draft: 'bg-amber-100 text-amber-700',
                                  archived: 'bg-slate-100 text-slate-700'
                                };

                                return (
                                    <tr key={product._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img 
                                                            src={product.images[0].src.startsWith('http') ? product.images[0].src : `${BASE_URL}${product.images[0].src}`} 
                                                            alt={product.title} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 truncate group-hover:text-brand-primary transition-colors max-w-[200px]">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                                        ID: {product._id.slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${statusColors[product.status] || statusColors.active}`}>
                                                {product.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-medium text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Store size={14} className="text-slate-300" />
                                                {product.vendor || 'Propz Vendor'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-medium text-slate-600">
                                            <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                {product.productCategory || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-black text-slate-800">
                                            {price}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleView(product)}
                                                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(product._id)}
                                                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center shadow-sm"
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteClick(product)}
                                                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-400">No products found</h3>
                <p className="text-slate-300 font-medium">Try adjusting your search or add a new magical item.</p>
              </div>
            )}

            {/* Modal for View Product Details */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-pastel-pink rounded-2xl flex items-center justify-center text-brand-brown">
                                <Package size={24} />
                              </div>
                              <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                    {selectedProduct.title}
                                </h2>
                                <p className="text-sm font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                  <Store size={14} /> {selectedProduct.vendor || "N/A"}
                                </p>
                              </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-all flex items-center justify-center"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Basic Info & Description */}
                                <div className="space-y-8">
                                    <section>
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detailed Information</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                          {[
                                              { icon: <IndianRupee size={16} />, label: "Base Price", value: selectedProduct.variants?.[0]?.price ? `₹${selectedProduct.variants[0].price}` : "N/A", color: 'text-brand-primary' },
                                              { icon: <Info size={16} />, label: "Status", value: selectedProduct.status, color: 'text-pastel-blue' },
                                              { icon: <Layers size={16} />, label: "Product Type", value: selectedProduct.type, color: 'text-pastel-purple' },
                                              { icon: <Tag size={16} />, label: "Category", value: selectedProduct.productCategory, color: 'text-pastel-orange' },
                                          ].map((item, index) => (
                                              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                  <div className={`mb-1 ${item.color}`}>{item.icon}</div>
                                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                                  <p className="text-sm font-black text-slate-800 capitalize">{item.value || "N/A"}</p>
                                              </div>
                                          ))}
                                      </div>
                                    </section>
                                    
                                    <section>
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Description</h3>
                                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                          {selectedProduct.description || "No description provided for this magical item."}
                                        </p>
                                      </div>
                                    </section>

                                    <section>
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Search Engine Optimization</h3>
                                      <div className="space-y-3">
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                          <p className="text-xs font-black text-blue-600 mb-1 truncate">{selectedProduct.seo?.title || "No SEO Title"}</p>
                                          <p className="text-[10px] text-green-700 font-medium mb-2">propz.com &gt; {selectedProduct.title.toLowerCase().replace(/ /g, '-')}</p>
                                          <p className="text-xs text-slate-500 line-clamp-2">{selectedProduct.seo?.description || "No SEO description available."}</p>
                                        </div>
                                      </div>
                                    </section>
                                </div>

                                {/* Right Column: Media & Variants */}
                                <div className="space-y-8">
                                    <section>
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Product Gallery</h3>
                                      <div className="grid grid-cols-3 gap-3">
                                          {selectedProduct.images?.length > 0 ? (
                                              selectedProduct.images.map((img, idx) => (
                                                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group">
                                                    <img
                                                      src={img.src}
                                                      alt={img.altText || "Product Image"}
                                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                  </div>
                                              ))
                                          ) : (
                                              <div className="col-span-3 py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <Image className="mx-auto text-slate-300 mb-2" size={32} />
                                                <p className="text-xs font-bold text-slate-400">No images available</p>
                                              </div>
                                          )}
                                      </div>
                                    </section>

                                    <section>
                                      <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Inventory & Variants</h3>
                                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{selectedProduct.variants?.length || 0} Variants</span>
                                      </div>
                                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                          <table className="w-full text-left">
                                              <thead className="bg-slate-50">
                                                  <tr>
                                                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                                                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-50">
                                                  {selectedProduct.variants?.length > 0 ? (
                                                    selectedProduct.variants.map((variant, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-bold text-slate-800">{variant.sku || "N/A"}</td>
                                                            <td className="px-4 py-3 text-sm font-black text-brand-primary">₹{variant.price || 0}</td>
                                                            <td className="px-4 py-3">
                                                              <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${variant.inventoryQty > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                <span className="text-sm font-medium text-slate-600">{variant.inventoryQty || 0}</span>
                                                              </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                  ) : (
                                                    <tr>
                                                      <td colSpan="3" className="px-4 py-8 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">No variants found</td>
                                                    </tr>
                                                  )}
                                              </tbody>
                                          </table>
                                      </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button
                                onClick={closeModal}
                                className="px-6 py-3 bg-white text-slate-600 font-black text-sm uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                  handleEdit(selectedProduct._id);
                                  closeModal();
                                }}
                                className="btn-bubbly bg-slate-900 text-white shadow-slate-900/20"
                            >
                                Edit Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Delete Confirmation */}
            {isDeleteModalOpen && productToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Delete Product?</h2>
                            <p className="text-slate-500 font-medium">
                                Are you sure you want to delete <span className="font-bold text-slate-800">"{productToDelete.title}"</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-white text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deleting...
                                  </>
                                ) : "Delete Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductTable;