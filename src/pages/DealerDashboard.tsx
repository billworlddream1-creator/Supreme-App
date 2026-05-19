import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Loader2,
  XCircle,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone
} from 'lucide-react';
import { clsx } from 'clsx';
import FeatureLoader from '../components/FeatureLoader';
import { db, collection, query, where, getDocs, doc, updateDoc, deleteDoc, handleFirestoreError, OperationType } from '../firebase';

import { toast } from 'sonner';

export default function DealerDashboard() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'verification' | 'ads'>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Verification Form State
  const [verificationForm, setVerificationForm] = useState({
    businessName: profile?.businessName || '',
    businessContact: profile?.businessContact || '',
    agreedToPolicy: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile && profile.role !== 'dealer' && profile.role !== 'admin') {
      toast.error("Access denied. This dashboard is for Supreme Dealers only.");
      navigate('/market');
      return;
    }
    fetchDealerData();
  }, [user, profile]);

  const fetchDealerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), where('sellerUid', '==', user.uid));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching dealer data:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationForm.agreedToPolicy) {
      toast.error("You must agree to the platform policies.");
      return;
    }
    try {
      await updateProfile({
        businessName: verificationForm.businessName,
        businessContact: verificationForm.businessContact,
        verificationStatus: 'pending'
      });
      toast.success("Verification request submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit verification request.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Product deleted successfully.");
      setConfirmDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
      toast.error("Failed to delete product.");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const { id, ...data } = editingProduct;
      await updateDoc(doc(db, 'products', id), data);
      setProducts(prev => prev.map(p => p.id === id ? editingProduct : p));
      setEditingProduct(null);
      toast.success("Product updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${editingProduct.id}`);
      toast.error("Failed to update product.");
    }
  };

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'blue' },
    { label: 'Total Sales', value: '0', icon: TrendingUp, color: 'emerald' },
    { label: 'Revenue', value: '$0.00', icon: DollarSign, color: 'amber' },
    { label: 'Views', value: '0', icon: TrendingUp, color: 'purple' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <Loader2 className="w-12 h-12 text-[var(--color-supreme-gold)] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl 3xl:max-w-[2000px] 4xl:max-w-[2800px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-24">
          <div className="flex justify-between items-center h-16 3xl:h-40 4xl:h-56 5xl:h-80">
            <div className="flex items-center gap-3 3xl:gap-10">
              <div className="w-10 h-10 3xl:w-24 3xl:h-24 4xl:w-32 4xl:h-32 5xl:w-48 5xl:h-48 bg-[var(--color-supreme-gold)] rounded-xl 3xl:rounded-3xl flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/20">
                <LayoutDashboard className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-white" />
              </div>
              <div className="space-y-1 3xl:space-y-3">
                <h1 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-display font-bold text-gray-900">Dealer Dashboard</h1>
                <p className="text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500">Manage your Supreme Market presence</p>
              </div>
            </div>
            <div className="flex items-center gap-4 3xl:gap-12">
              <button 
                onClick={() => navigate('/market')}
                className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-medium text-gray-600 hover:text-[var(--color-supreme-gold)] transition-colors flex items-center gap-2 3xl:gap-6"
              >
                <ExternalLink className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                View Market
              </button>
              {profile?.isVerifiedSeller && (
                <div className="flex items-center gap-1 3xl:gap-4 bg-emerald-50 text-emerald-600 px-3 py-1 3xl:px-10 3xl:py-4 rounded-full text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold border border-emerald-100">
                  <ShieldCheck className="w-3 h-3 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                  Verified Seller
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl 3xl:max-w-[2000px] 4xl:max-w-[2800px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-24 py-8 3xl:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 3xl:gap-24">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2 3xl:space-y-8">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'products', label: 'My Products', icon: Package },
              { id: 'ads', label: 'Ads Manager', icon: Megaphone },
              { id: 'verification', label: 'Verification', icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "w-full flex items-center gap-3 3xl:gap-10 px-4 py-3 3xl:px-12 3xl:py-8 rounded-2xl 3xl:rounded-[40px] text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-[var(--color-supreme-gold)] shadow-sm border border-gray-100" 
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <tab.icon className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 3xl:space-y-24">
            {activeTab === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 3xl:gap-12">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 3xl:p-16 rounded-[2rem] 3xl:rounded-[60px] border border-gray-100 shadow-sm space-y-4 3xl:space-y-10"
                    >
                      <div className={clsx(
                        "w-10 h-10 3xl:w-24 3xl:h-24 rounded-xl 3xl:rounded-3xl flex items-center justify-center",
                        stat.color === 'blue' && "bg-blue-50 text-blue-600",
                        stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                        stat.color === 'amber' && "bg-amber-50 text-amber-600",
                        stat.color === 'purple' && "bg-purple-50 text-purple-600",
                      )}>
                        <stat.icon className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                      </div>
                      <div className="space-y-1 3xl:space-y-4">
                        <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-medium text-gray-500">{stat.label}</p>
                        <p className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Verification Alert */}
                {!profile?.isVerifiedSeller && (
                  <div className="bg-amber-50 border border-amber-100 rounded-[2rem] 3xl:rounded-[60px] p-6 3xl:p-16 flex items-start gap-4 3xl:gap-12">
                    <div className="w-12 h-12 3xl:w-32 3xl:h-32 bg-amber-100 rounded-2xl 3xl:rounded-[40px] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-amber-600" />
                    </div>
                    <div className="flex-1 space-y-2 3xl:space-y-8">
                      <h3 className="text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl font-bold text-amber-900">Verification Required</h3>
                      <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-amber-700">
                        To build trust with buyers and unlock premium features, please complete your seller verification.
                      </p>
                      <button 
                        onClick={() => setActiveTab('verification')}
                        className="mt-4 px-6 py-2 3xl:px-16 3xl:py-8 bg-amber-600 text-white text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold rounded-xl 3xl:rounded-3xl hover:bg-amber-700 transition-colors"
                      >
                        Start Verification
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Performance Placeholder */}
                <div className="bg-white rounded-[2.5rem] 3xl:rounded-[80px] border border-gray-100 shadow-sm p-8 3xl:p-24">
                  <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-display font-bold text-gray-900 mb-6 3xl:mb-16">Recent Performance</h3>
                  <div className="h-64 3xl:h-[600px] flex flex-col items-center justify-center text-gray-400 space-y-4 3xl:space-y-12">
                    <TrendingUp className="w-12 h-12 3xl:w-48 3xl:h-48 mb-4 opacity-20" />
                    <p className="3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">Sales data will appear here once you start selling.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6 3xl:space-y-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 3xl:gap-12">
                  <h3 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-gray-900">My Products</h3>
                  <button 
                    onClick={() => navigate('/market?action=add')}
                    className="flex items-center gap-2 3xl:gap-6 px-6 py-3 3xl:px-16 3xl:py-8 bg-[var(--color-supreme-gold)] text-white rounded-2xl 3xl:rounded-[40px] font-bold hover:shadow-lg transition-all 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                  >
                    <Plus className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                    Add New Product
                  </button>
                </div>

                <div className="bg-white rounded-[2.5rem] 3xl:rounded-[80px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 3xl:p-16 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4 3xl:gap-12">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search your products..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl 3xl:rounded-3xl pl-10 pr-4 py-2 3xl:pl-20 3xl:pr-8 3xl:py-6 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 3xl:gap-6">
                      <button className="p-2 3xl:p-6 bg-gray-50 rounded-xl 3xl:rounded-3xl text-gray-500 hover:bg-gray-100">
                        <Filter className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px] 3xl:min-w-[1200px]">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-xs 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-xs 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-xs 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-xs 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-xs 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products
                          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                              <div className="flex items-center gap-3 3xl:gap-10">
                                <img src={product.image} alt="" className="w-12 h-12 3xl:w-32 3xl:h-32 rounded-xl 3xl:rounded-3xl object-cover" />
                                <div className="space-y-1 3xl:space-y-4">
                                  <p className="font-bold text-gray-900 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">{product.name}</p>
                                  <p className="text-xs 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl text-gray-500">{product.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                              <p className="font-bold text-gray-900 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">${product.price}</p>
                            </td>
                            <td className="px-6 py-4 3xl:px-12 3xl:py-12 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500">
                              {product.stockLeft} units
                            </td>
                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                              <span className={clsx(
                                "px-2 py-1 3xl:px-6 3xl:py-3 rounded text-[10px] 3xl:text-xl 4xl:text-2xl 5xl:text-4xl font-bold uppercase tracking-widest",
                                product.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {product.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 3xl:px-12 3xl:py-12 text-right">
                              <div className="flex justify-end gap-2 3xl:gap-6">
                                <button 
                                  onClick={() => setEditingProduct(product)}
                                  className="p-2 3xl:p-6 text-gray-400 hover:text-[var(--color-supreme-gold)] transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                </button>
                                <button 
                                  onClick={() => setConfirmDelete(product.id)}
                                  className="p-2 3xl:p-6 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 3xl:py-32 text-center text-gray-400 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">
                              No products found. Start by adding your first product!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ads' && (
              <div className="space-y-8 3xl:space-y-24">
                <div className="bg-white rounded-[2.5rem] 3xl:rounded-[80px] border border-gray-100 shadow-sm p-8 3xl:p-24">
                  <div className="flex items-center justify-between mb-8 3xl:mb-24">
                    <div className="flex items-center gap-4 3xl:gap-12">
                      <div className="w-16 h-16 3xl:w-40 3xl:h-40 bg-purple-50 rounded-2xl 3xl:rounded-[40px] flex items-center justify-center">
                        <Megaphone className="w-8 h-8 3xl:w-20 3xl:h-20 4xl:w-28 4xl:h-28 5xl:w-36 5xl:h-36 text-purple-600" />
                      </div>
                      <div className="space-y-1 3xl:space-y-4">
                        <h3 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-gray-900">Ads Manager</h3>
                        <p className="text-gray-500 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">Promote your products and reach more customers</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/ads')}
                      className="px-6 py-3 3xl:px-16 3xl:py-8 bg-[var(--color-supreme-gold)] text-white rounded-2xl 3xl:rounded-[40px] font-bold hover:shadow-lg transition-all 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl flex items-center gap-2 3xl:gap-6"
                    >
                      Open Full Ad Manager
                      <ChevronRight className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 3xl:gap-16">
                    <div className="p-8 3xl:p-24 bg-gray-50 rounded-3xl 3xl:rounded-[60px] border border-gray-100 space-y-4 3xl:space-y-12">
                      <h4 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-gray-900">Why Advertise?</h4>
                      <ul className="space-y-3 3xl:space-y-10">
                        {[
                          'Reach up to 1M+ potential buyers',
                          'Target specific categories and interests',
                          'Boost your product visibility by 300%',
                          'Detailed analytics and performance tracking'
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 3xl:gap-10 text-gray-600 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">
                            <CheckCircle className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28 text-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8 3xl:p-24 bg-purple-50 rounded-3xl 3xl:rounded-[60px] border border-purple-100 space-y-4 3xl:space-y-12">
                      <h4 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-purple-900">AI Ad Generation</h4>
                      <p className="text-purple-700 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">
                        Use our Supreme AI to generate high-converting ad copies and banners automatically from your product descriptions.
                      </p>
                      <button 
                        onClick={() => navigate('/ads')}
                        className="w-full py-4 3xl:py-12 bg-purple-600 text-white rounded-2xl 3xl:rounded-[40px] font-bold hover:bg-purple-700 transition-colors 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                      >
                        Try AI Ad Generator
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-8 3xl:space-y-24">
                <div className="bg-white rounded-[2.5rem] 3xl:rounded-[80px] border border-gray-100 shadow-sm p-8 3xl:p-24">
                  <div className="flex items-center gap-4 3xl:gap-12 mb-8 3xl:mb-24">
                    <div className="w-16 h-16 3xl:w-40 3xl:h-40 bg-blue-50 rounded-2xl 3xl:rounded-[40px] flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 3xl:w-20 3xl:h-20 4xl:w-28 4xl:h-28 5xl:w-36 5xl:h-36 text-blue-600" />
                    </div>
                    <div className="space-y-1 3xl:space-y-4">
                      <h3 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-gray-900">Seller Verification</h3>
                      <p className="text-gray-500 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">Complete this process to become a Verified Supreme Dealer</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 3xl:gap-16 mb-12 3xl:mb-32">
                    {[
                      { label: 'Application', status: profile?.verificationStatus ? 'completed' : 'pending', icon: Clock },
                      { label: 'Review', status: profile?.verificationStatus === 'pending' ? 'current' : (profile?.verificationStatus === 'approved' || profile?.verificationStatus === 'rejected' ? 'completed' : 'pending'), icon: Search },
                      { label: 'Verification', status: profile?.isVerifiedSeller ? 'completed' : 'pending', icon: CheckCircle },
                    ].map((step, i) => (
                      <div key={i} className="relative">
                        <div className={clsx(
                          "p-4 3xl:p-12 rounded-2xl 3xl:rounded-[40px] border flex items-center gap-3 3xl:gap-10",
                          step.status === 'completed' && "bg-emerald-50 border-emerald-100 text-emerald-700",
                          step.status === 'current' && "bg-blue-50 border-blue-100 text-blue-700 animate-pulse",
                          step.status === 'pending' && "bg-gray-50 border-gray-100 text-gray-400"
                        )}>
                          <step.icon className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                          <span className="font-bold text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">{step.label}</span>
                          {step.status === 'completed' && <CheckCircle className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 ml-auto" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {profile?.verificationStatus === 'approved' ? (
                    <div className="text-center py-12 3xl:py-32 bg-emerald-50 rounded-3xl 3xl:rounded-[60px] border border-emerald-100">
                      <div className="w-20 h-20 3xl:w-48 3xl:h-48 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 3xl:mb-16">
                        <ShieldCheck className="w-10 h-10 3xl:w-24 3xl:h-24 4xl:w-32 4xl:h-32 5xl:w-40 5xl:h-40 text-emerald-600" />
                      </div>
                      <h4 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-bold text-emerald-900">You are a Verified Dealer!</h4>
                      <p className="text-emerald-700 mt-2 3xl:mt-8 max-w-md 3xl:max-w-4xl mx-auto 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">
                        Your business profile is now active and your products will display the Verified Seller badge.
                      </p>
                    </div>
                  ) : profile?.verificationStatus === 'pending' ? (
                    <div className="text-center py-12 3xl:py-32 bg-blue-50 rounded-3xl 3xl:rounded-[60px] border border-blue-100">
                      <div className="w-20 h-20 3xl:w-48 3xl:h-48 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 3xl:mb-16">
                        <Clock className="w-10 h-10 3xl:w-24 3xl:h-24 4xl:w-32 4xl:h-32 5xl:w-40 5xl:h-40 text-blue-600" />
                      </div>
                      <h4 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-bold text-blue-900">Application Under Review</h4>
                      <p className="text-blue-700 mt-2 3xl:mt-8 max-w-md 3xl:max-w-4xl mx-auto 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">
                        Our team is currently reviewing your business information. This typically takes 24-48 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleVerificationSubmit} className="space-y-6 3xl:space-y-16">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 3xl:gap-16">
                        <div className="space-y-2 3xl:space-y-6">
                          <label className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700 flex items-center gap-2 3xl:gap-6">
                            <Building2 className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                            Business Name
                          </label>
                          <input 
                            required
                            type="text" 
                            value={verificationForm.businessName}
                            onChange={(e) => setVerificationForm({...verificationForm, businessName: e.target.value})}
                            className="w-full px-4 py-3 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                            placeholder="Supreme Luxury Goods Ltd."
                          />
                        </div>
                        <div className="space-y-2 3xl:space-y-6">
                          <label className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700 flex items-center gap-2 3xl:gap-6">
                            <Phone className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                            Business Contact Number
                          </label>
                          <input 
                            required
                            type="tel" 
                            value={verificationForm.businessContact}
                            onChange={(e) => setVerificationForm({...verificationForm, businessContact: e.target.value})}
                            className="w-full px-4 py-3 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div className="p-6 3xl:p-16 bg-gray-50 rounded-2xl 3xl:rounded-[40px] border border-gray-100">
                        <h4 className="font-bold text-gray-900 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl mb-4 3xl:mb-12">Supreme Market Policy Agreement</h4>
                        <div className="space-y-3 3xl:space-y-8 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-600 max-h-48 3xl:max-h-[500px] overflow-y-auto pr-4 3xl:pr-12 custom-scrollbar">
                          <p>1. A dealer must agree to deliver or ship products within 7-14 days (max 1 month).</p>
                          <p>2. Listed goods must be readily available for shipping.</p>
                          <p>3. Accounts will be suspended immediately upon valid user complaints.</p>
                          <p>4. Wallet suspension applies for policy violations.</p>
                          <p>5. Strict verification for all external withdrawals.</p>
                        </div>
                        <label className="flex items-center gap-3 3xl:gap-10 mt-6 3xl:mt-16 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={verificationForm.agreedToPolicy}
                            onChange={(e) => setVerificationForm({...verificationForm, agreedToPolicy: e.target.checked})}
                            className="w-5 h-5 3xl:w-10 3xl:h-10 rounded border-gray-300 text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]"
                          />
                          <span className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            I agree to the Supreme Market Policy and Terms of Service
                          </span>
                        </label>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-4 3xl:py-12 bg-[var(--color-supreme-gold)] text-white rounded-2xl 3xl:rounded-[40px] font-bold shadow-lg shadow-[var(--color-supreme-gold)]/20 hover:shadow-xl transition-all 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                      >
                        Submit Verification Request
                      </button>
                    </form>
                  )}
                </div>

                {/* Benefits Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 3xl:gap-16">
                  {[
                    { title: 'Trust Badge', desc: 'Verified badge on all your listings', icon: ShieldCheck },
                    { title: 'Higher Limits', desc: 'Increased listing and sales limits', icon: TrendingUp },
                    { title: 'Priority Support', desc: 'Direct line to dealer support team', icon: Mail },
                  ].map((benefit, i) => (
                    <div key={i} className="bg-white p-6 3xl:p-16 rounded-3xl 3xl:rounded-[60px] border border-gray-100 shadow-sm space-y-4 3xl:space-y-10">
                      <div className="w-10 h-10 3xl:w-24 3xl:h-24 bg-gray-50 rounded-xl 3xl:rounded-3xl flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28 text-[var(--color-supreme-gold)]" />
                      </div>
                      <div className="space-y-1 3xl:space-y-4">
                        <h4 className="font-bold text-gray-900 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">{benefit.title}</h4>
                        <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 3xl:p-24 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg 3xl:max-w-[1400px] 4xl:max-w-[2000px] 5xl:max-w-[2800px] rounded-3xl 3xl:rounded-[80px] overflow-hidden shadow-2xl p-8 3xl:p-24 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 3xl:mb-16">
                <h2 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-gray-900">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 3xl:p-6 hover:bg-gray-100 rounded-full transition-colors">
                  <XCircle className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4 3xl:space-y-12">
                <div className="space-y-1 3xl:space-y-4">
                  <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 3xl:gap-12">
                  <div className="space-y-1 3xl:space-y-4">
                    <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                    />
                  </div>
                  <div className="space-y-1 3xl:space-y-4">
                    <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct.stockLeft}
                      onChange={(e) => setEditingProduct({...editingProduct, stockLeft: Number(e.target.value)})}
                      className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                    />
                  </div>
                </div>

                <div className="space-y-1 3xl:space-y-4">
                  <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Category</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                  >
                    <option value="Luxury">Luxury</option>
                    <option value="Tech">Tech</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Travel">Travel</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>

                <div className="space-y-1 3xl:space-y-4">
                  <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Description</label>
                  <textarea 
                    required
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 h-24 3xl:h-64 resize-none text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 3xl:py-10 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl 3xl:rounded-[40px] hover:shadow-lg transition-all mt-4 3xl:mt-12 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 3xl:p-24 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm 3xl:max-w-[1000px] 4xl:max-w-[1400px] 5xl:max-w-[1800px] rounded-3xl 3xl:rounded-[80px] overflow-hidden shadow-2xl p-8 3xl:p-24 text-center space-y-4 3xl:space-y-12"
            >
              <div className="w-16 h-16 3xl:w-48 3xl:h-48 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 3xl:mb-12">
                <Trash2 className="w-8 h-8 3xl:w-24 3xl:h-24 4xl:w-32 4xl:h-32 5xl:w-40 5xl:h-40 text-red-500" />
              </div>
              <div className="space-y-2 3xl:space-y-8">
                <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-gray-900">Delete Product?</h3>
                <p className="text-gray-500 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">Are you sure you want to delete this product? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 3xl:gap-10">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 3xl:py-10 bg-gray-100 text-gray-700 font-bold rounded-xl 3xl:rounded-[40px] hover:bg-gray-200 transition-colors 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteProduct(confirmDelete)}
                  className="flex-1 py-3 3xl:py-10 bg-red-600 text-white font-bold rounded-xl 3xl:rounded-[40px] hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 3xl:p-24 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg 3xl:max-w-[1400px] 4xl:max-w-[2000px] 5xl:max-w-[2800px] rounded-3xl 3xl:rounded-[80px] overflow-hidden shadow-2xl p-8 3xl:p-24 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 3xl:mb-16">
                <h2 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-gray-900">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 3xl:p-6 hover:bg-gray-100 rounded-full transition-colors">
                  <XCircle className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4 3xl:space-y-12">
                <div className="space-y-1 3xl:space-y-4">
                  <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 3xl:gap-12">
                  <div className="space-y-1 3xl:space-y-4">
                    <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                    />
                  </div>
                  <div className="space-y-1 3xl:space-y-4">
                    <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct.stockLeft}
                      onChange={(e) => setEditingProduct({...editingProduct, stockLeft: Number(e.target.value)})}
                      className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                    />
                  </div>
                </div>

                <div className="space-y-1 3xl:space-y-4">
                  <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Category</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                  >
                    <option value="Luxury">Luxury</option>
                    <option value="Tech">Tech</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Travel">Travel</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>

                <div className="space-y-1 3xl:space-y-4">
                  <label className="block text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-700">Description</label>
                  <textarea 
                    required
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full px-4 py-2 3xl:px-10 3xl:py-8 rounded-xl 3xl:rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 h-24 3xl:h-64 resize-none text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 3xl:py-10 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl 3xl:rounded-[40px] hover:shadow-lg transition-all mt-4 3xl:mt-12 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 3xl:p-24 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm 3xl:max-w-[1000px] 4xl:max-w-[1400px] 5xl:max-w-[1800px] rounded-3xl 3xl:rounded-[80px] overflow-hidden shadow-2xl p-8 3xl:p-24 text-center space-y-4 3xl:space-y-12"
            >
              <div className="w-16 h-16 3xl:w-48 3xl:h-48 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 3xl:mb-12">
                <Trash2 className="w-8 h-8 3xl:w-24 3xl:h-24 4xl:w-32 4xl:h-32 5xl:w-40 5xl:h-40 text-red-500" />
              </div>
              <div className="space-y-2 3xl:space-y-8">
                <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-gray-900">Delete Product?</h3>
                <p className="text-gray-500 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">Are you sure you want to delete this product? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 3xl:gap-10">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 3xl:py-10 bg-gray-100 text-gray-700 font-bold rounded-xl 3xl:rounded-[40px] hover:bg-gray-200 transition-colors 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteProduct(confirmDelete)}
                  className="flex-1 py-3 3xl:py-10 bg-red-600 text-white font-bold rounded-xl 3xl:rounded-[40px] hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
