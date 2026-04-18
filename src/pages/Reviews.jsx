import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE, BASE_URL } from '../config';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Star, 
  Plus,
  X,
  Edit2,
  Image as ImageIcon,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';

const ReviewCard = ({ review, onEdit, onDelete }) => {
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group relative">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(review)}
          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-brand-primary transition-all"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(review._id)}
          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < review.rating ? "#c73020" : "none"} 
              className={i < review.rating ? "text-[#c73020]" : "text-slate-200"} 
            />
          ))}
        </div>

        <p className="text-slate-600 italic text-sm line-clamp-3">
          "{review.text}"
        </p>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
          <img 
            src={getImageUrl(review.image)} 
            alt={review.name} 
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
            <p className="text-[10px] text-[#c73020] font-black uppercase tracking-wider">{review.occasion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    occasion: '',
    rating: 5,
    text: '',
    image: '',
    published: true
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/reviews`);
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear URL if file is selected
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('occasion', formData.occasion);
      data.append('rating', formData.rating);
      data.append('text', formData.text);
      data.append('published', formData.published);

      if (selectedFile) {
        data.append('image', selectedFile);
      } else {
        data.append('image', formData.image);
      }

      if (isEditing) {
        await axios.patch(`${API_BASE}/reviews/${formData._id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Review updated!');
      } else {
        await axios.post(`${API_BASE}/reviews`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Review added!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchReviews();
    } catch (err) {
      toast.error(isEditing ? 'Update failed' : 'Failed to add review');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${API_BASE}/reviews/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      occasion: '',
      rating: 5,
      text: '',
      image: '',
      published: true
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const editReview = (review) => {
    setFormData(review);
    setPreviewUrl(review.image && !review.image.startsWith('http') ? `${BASE_URL}${review.image}` : review.image);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const filteredReviews = reviews.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Client Reviews</h1>
          <p className="text-slate-500 font-medium">Manage testimonials shown on the landing page.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium shadow-sm"
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            <Plus size={20} />
            Add Review
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <MessageSquare size={40} />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              onEdit={editReview} 
              onDelete={deleteReview} 
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  {isEditing ? <Edit2 size={24} /> : <Plus size={24} />}
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {isEditing ? 'Edit Review' : 'Add New Review'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occasion</label>
                  <input 
                    type="text" 
                    value={formData.occasion}
                    onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
                    placeholder="e.g. Birthday Party"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                  <select 
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-black"
                  >
                    {[5,4,3,2,1].map(num => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Photo</label>
                  <div className="flex items-center gap-4">
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-brand-primary transition-all group">
                      <Upload size={16} className="text-slate-400 group-hover:text-brand-primary" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-brand-primary">Upload Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">or</p>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({...formData, image: e.target.value});
                        setPreviewUrl(e.target.value);
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
                      placeholder="Paste Image URL..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Text</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
                  placeholder="Share the customer's experience..."
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  {isEditing ? 'Save Changes' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
