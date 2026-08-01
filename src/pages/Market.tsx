import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ShoppingBag, Star, Tag, Heart, Filter, X, ChevronRight, DollarSign, Zap, Clock, Flame, Gift, Timer, Search, ArrowUpDown, Plus, Image as ImageIcon, Eye, AlertTriangle, Printer, CreditCard, LayoutDashboard, Package, Edit2, Trash2, Wallet, ShieldAlert, BadgeCheck, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import FeatureLoader from '../components/FeatureLoader';
import AdBanner from '../components/AdBanner';
import MarketDealerOnboarding from '../components/MarketDealerOnboarding';
import { useAds } from '../context/AdsContext';
import { useWallet } from '../context/WalletContext';
import { db, collection, addDoc, getDocs, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType, doc, getDoc } from '../firebase';

const event = ({ action, category, label, value }: { action: string; category: string; label?: string; value?: any }) => {
  console.log(`[Analytics] ${category} - ${action}: ${label || ''} ${value || ''}`);
};

const initialProducts = [
  {
    id: 1,
    name: 'Supreme Gold Watch',
    price: 12500,
    originalPrice: 25000,
    discount: 50,
    rating: 4.9,
    image: 'https://picsum.photos/seed/watch/800/800',
    category: 'Luxury',
    description: 'Crafted from 24k solid gold, this timepiece represents the pinnacle of horological engineering. Features a Swiss automatic movement and a sapphire crystal face.',
    shippingDetails: 'Express worldwide shipping via DHL (3-5 business days). Fully insured.',
    billingDetails: 'Secure checkout with Stripe. 2-year international warranty included.',
    deliveryPeriod: '5 days',
    stockLeft: 3,
    soldCount: 142,
    isFlashSale: true,
    sellerUid: 'system',
    status: 'active',
    reviews: [
        { user: 'James B.', rating: 5, comment: 'Absolutely stunning. The craftsmanship is unmatched.' },
        { user: 'Sarah C.', rating: 5, comment: 'A true statement piece.' }
    ],
    competitorPrices: {
        amazon: 26000,
        temu: 24500,
        ebay: 25500
    }
  },
  {
    id: 2,
    name: 'Quantum Laptop Pro',
    price: 3200,
    originalPrice: 4000,
    discount: 20,
    rating: 4.8,
    image: 'https://picsum.photos/seed/laptop/800/800',
    category: 'Tech',
    description: 'Experience computing at the speed of light. The Quantum Laptop Pro features a holographic display and AI-integrated OS.',
    shippingDetails: 'Standard shipping (5-7 business days). Eco-friendly packaging.',
    billingDetails: 'Flexible payment plans available. 1-year technical support.',
    deliveryPeriod: '7 days',
    stockLeft: 12,
    soldCount: 850,
    isFlashSale: false,
    sellerUid: 'system',
    status: 'active',
    reviews: [
        { user: 'TechGuru', rating: 5, comment: 'The fastest laptop I have ever used.' },
        { user: 'DevMike', rating: 4, comment: 'Great performance, but battery life could be better.' }
    ],
    competitorPrices: {
        amazon: 3800,
        temu: 3500,
        ebay: 3600
    }
  },
  {
    id: 3,
    name: 'Designer Sneakers',
    price: 850,
    originalPrice: 1200,
    discount: 30,
    rating: 4.7,
    image: 'https://picsum.photos/seed/sneakers/800/800',
    category: 'Fashion',
    description: 'Limited edition sneakers designed by world-renowned artists. Made with premium Italian leather and sustainable materials.',
    shippingDetails: 'Ships within 48 hours. Free returns within 30 days.',
    billingDetails: 'Direct bank transfer or credit card. Authenticity certificate included.',
    deliveryPeriod: '2 days',
    stockLeft: 5,
    soldCount: 2300,
    isFlashSale: true,
    sellerUid: 'system',
    status: 'active',
    reviews: [
        { user: 'HypeBeast', rating: 5, comment: 'Fire kicks! 🔥' },
        { user: 'RunnerGirl', rating: 4, comment: 'Comfortable and stylish.' }
    ],
    competitorPrices: {
        amazon: 1100,
        temu: 950,
        ebay: 1050
    }
  },
  {
    id: 4,
    name: 'Private Jet Charter',
    price: 25000,
    rating: 5.0,
    image: 'https://picsum.photos/seed/jet/800/800',
    category: 'Travel',
    description: 'Fly in ultimate luxury. Our private jet charter service offers bespoke travel experiences to any destination in the world.',
    shippingDetails: 'Instant booking confirmation. Personalized concierge service.',
    billingDetails: 'Wire transfer only. All-inclusive pricing (fuel, crew, catering).',
    deliveryPeriod: '1 day',
    stockLeft: 1,
    soldCount: 12,
    isFlashSale: false,
    sellerUid: 'system',
    status: 'active',
    reviews: [
        { user: 'CEO_John', rating: 5, comment: 'Seamless experience from start to finish.' }
    ],
    competitorPrices: {
        amazon: 30000,
        temu: 28000,
        ebay: 29000
    }
  },
  {
    id: 5,
    name: 'Limited Edition NFT',
    price: 15000, // Approx ETH conversion for sorting
    displayPrice: '5.2 ETH',
    rating: 4.5,
    image: 'https://picsum.photos/seed/nft/800/800',
    category: 'Digital',
    description: 'Own a piece of digital history. This unique NFT grants access to exclusive Supreme events and digital assets.',
    shippingDetails: 'Instant digital delivery to your wallet address.',
    billingDetails: 'Payment in ETH or USDC. Smart contract verified.',
    deliveryPeriod: '1 day',
    stockLeft: 10,
    soldCount: 90,
    isFlashSale: false,
    sellerUid: 'system',
    status: 'active',
    reviews: [
        { user: 'CryptoKing', rating: 5, comment: 'To the moon! 🚀' }
    ],
    competitorPrices: {
        amazon: 18000,
        temu: 16000,
        ebay: 17000
    }
  },
  {
    id: 6,
    name: 'Smart Home Hub',
    price: 499,
    originalPrice: 999,
    discount: 50,
    rating: 4.6,
    image: 'https://picsum.photos/seed/home/800/800',
    category: 'Tech',
    description: 'Control your entire home with voice commands. Compatible with all major smart devices and features advanced security protocols.',
    shippingDetails: 'Free standard shipping. Installation guide included.',
    billingDetails: 'One-time payment. No monthly subscription fees.',
    deliveryPeriod: '14 days',
    stockLeft: 45,
    soldCount: 5000,
    isFlashSale: true,
    sellerUid: 'system',
    status: 'active',
    reviews: [
        { user: 'HomeOwner', rating: 4, comment: 'Very convenient setup.' }
    ],
    competitorPrices: {
        amazon: 800,
        temu: 600,
        ebay: 700
    }
  }
];

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(3600 * 2 * 1000); // 2 hours in milliseconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1000 : 3600 * 2 * 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return <>{formatTime(timeLeft)}</>;
};

export default function Market() {
  const { user, profile, updateProfile } = useAuth();
  const { sendPayment } = useWallet();
  const { getActiveAds, shouldShowMarketAd, resetMarketAdCounter, productViewCount, incrementProductViewCount } = useAds();
  const level3Ads = getActiveAds(3);
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'market' | 'wishlist' | 'dealer'>('market');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    if (shouldShowMarketAd) {
      setShowAdModal(true);
    }
  }, [shouldShowMarketAd]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      setShowAddProduct(true);
    }

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for verified products and 24h logic
      const filteredVisible = productsData.filter((p: any) => {
        if (p.sellerUid === 'system') return true;
        
        // Product must be verified and 24h waiting period passed
        if (p.status === 'active' && p.isVerified) {
            if (p.readyToListAt) {
                const readyAt = new Date(p.readyToListAt).getTime();
                return Date.now() >= readyAt;
            }
            return true;
        }
        return false;
      });

      // Use Firestore as source of truth
      setProducts(filteredVisible.length > 0 ? filteredVisible : initialProducts.map(p => ({ ...p, id: String(p.id), isVerifiedSeller: p.sellerUid === 'system' })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCloseAd = () => {
    setShowAdModal(false);
    resetMarketAdCounter();
  };
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  // Add Product State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isDealerVerified, setIsDealerVerified] = useState(false);
  const [dealerProfile, setDealerProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'market_dealer_profiles'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setDealerProfile(data);
            setIsDealerVerified(data.status === 'verified');
        }
    });
    return () => unsubscribe();
  }, [user]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    description: '',
    category: 'Luxury',
    image: '',
    stockLeft: '',
    dealerId: profile?.uid || 'SUP-001',
    dealerName: profile?.name || 'Authorized Dealer',
    location: '',
    mobileNumber: profile?.mobile || '',
    shippingDetails: '',
    billingDetails: '',
    deliveryPeriod: '7/14 days'
  });

  // Review State
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const handleRestrictedAction = (action: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile?.isSuspended) {
      toast.error(`Your account is suspended for policy violations. ${profile.suspensionReason ? `Reason: ${profile.suspensionReason}` : ''} You cannot perform this action.`);
      return;
    }
    action();
  };

  const handleOpenAddProduct = () => {
    handleRestrictedAction(() => {
      if (profile?.role === 'admin') {
         setShowAddProduct(true);
         return;
      }

      if (!isDealerVerified) {
        setShowPolicyModal(true);
        return;
      }

      setShowAddProduct(true);
    });
  };

  const handleOnboardingSuccess = () => {
    setShowPolicyModal(false);
    // User is now pending or verified, but if they just finished onboarding they are pending
    // We let them add the product but inform them it will be pending
    setShowAddProduct(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    handleRestrictedAction(async () => {
        const productData = {
            name: newProduct.name,
            price: Number(newProduct.price),
            originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price), 
            discount: Number(newProduct.discount) || 0,
            rating: 5.0, 
            image: newProduct.image || `https://picsum.photos/seed/${newProduct.name}/800/800`,
            category: newProduct.category,
            description: newProduct.description,
            shippingDetails: newProduct.shippingDetails,
            billingDetails: newProduct.billingDetails,
            stockLeft: Number(newProduct.stockLeft),
            location: newProduct.location || dealerProfile?.address || profile?.location || 'Supreme HQ',
            mobileNumber: newProduct.mobileNumber || dealerProfile?.contactPhone || profile?.mobile || '',
            deliveryPeriod: newProduct.deliveryPeriod,
            dealerName: dealerProfile?.businessName || profile?.name || user?.name || 'Supreme Dealer',
            dealerId: dealerProfile?.id || `DLR-${user?.uid?.substring(0, 8).toUpperCase()}`,
            soldCount: 0,
            isFlashSale: false,
            sellerUid: user?.uid,
            isVerified: false, // Must be verified by admin
            status: 'queued', // New product starts as queued
            createdAt: new Date().toISOString(),
            competitorPrices: {
                amazon: Number(newProduct.price) * 1.3,
                temu: Number(newProduct.price) * 1.1,
                ebay: Number(newProduct.price) * 1.2
            }
        };

        try {
            await addDoc(collection(db, 'products'), productData);
            event({ action: 'create_product', category: 'Market', label: productData.category });
            setShowAddProduct(false);
            toast.success("Product submitted for admin review. Listing will activate 24h after approval.");
            setNewProduct({ 
              name: '', 
              price: '', 
              originalPrice: '',
              discount: '', 
              description: '', 
              category: 'Luxury', 
              image: '', 
              stockLeft: '', 
              dealerId: profile?.uid || 'SUP-001',
              dealerName: profile?.name || 'Authorized Dealer',
              location: '', 
              mobileNumber: '', 
              shippingDetails: '', 
              billingDetails: '', 
              deliveryPeriod: '7/14 days' 
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'products');
        }
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    handleRestrictedAction(() => {
        if (!selectedProduct) return;

        const review = {
            user: user?.name || 'User',
            rating: newReview.rating,
            comment: newReview.comment
        };

        const updatedReviews = [review, ...selectedProduct.reviews];
        const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

        const updatedProduct = {
            ...selectedProduct,
            reviews: updatedReviews,
            rating: Number(newRating.toFixed(1))
        };

        // Update products list
        setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        
        // Update selected product view
        setSelectedProduct(updatedProduct);
        
        // Reset form
        setNewReview({ rating: 5, comment: '' });
    });
  };

  const printCart = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const finalTotal = spinReward ? total * 0.1 : total;

    const html = `
      <html>
        <head>
          <title>Supreme Market - Cart Receipt</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            h1 { color: #b8860b; border-bottom: 3px solid #b8860b; padding-bottom: 10px; font-size: 32px; text-transform: uppercase; letter-spacing: 2px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; color: #666; }
            table { border-collapse: collapse; margin-top: 20px; width: 100%; border: 1px solid #eee; }
            th, td { border: 1px solid #eee; padding: 15px; text-align: left; }
            th { background-color: #fcfcfc; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .total-section { margin-top: 30px; border-top: 2px solid #b8860b; pt: 20px; text-align: right; }
            .total { font-size: 28px; font-weight: bold; color: #b8860b; }
            .discount { color: #ef4444; font-weight: bold; margin-top: 10px; font-size: 16px; }
            .disclaimer { margin-top: 40px; padding: 20px; bg: #fff5f5; border: 1px solid #feb2b2; border-radius: 12px; font-size: 13px; color: #c53030; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            .dealer-info { font-style: italic; font-size: 12px; color: #777; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h1>Supreme Market Receipt</h1>
          <div class="meta">
            <div>
              <p><strong>Receipt ID:</strong> SUP-${Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p><strong>Customer:</strong> ${user?.name || 'Guest User'}</p>
            </div>
            <div style="text-align: right">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item & Dealer Details</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: bold; font-size: 16px;">${item.name}</div>
                    <div style="font-size: 12px; color: #444; margin-top: 4px;"><strong>Product ID:</strong> ${item.id || 'N/A'}</div>
                    <div class="dealer-info">
                      <strong>Dealer:</strong> ${item.dealerName || 'Supreme'} (ID: ${item.dealerId || 'SYS-DEFAULT'})<br/>
                      <strong>Location:</strong> ${item.location || 'Distributed'}<br/>
                      <strong>Contact:</strong> ${item.mobileNumber || 'N/A'}<br/>
                      <strong>Delivery Period:</strong> ${item.deliveryPeriod || '7/14 days - 1 month'}
                    </div>
                  </td>
                  <td style="font-weight: bold;">$${item.price.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            ${spinReward ? `<p class="discount">90% Spin Reward Discount Applied!</p>` : ''}
            <p style="font-size: 16px; color: #666;">Grand Total</p>
            <div class="total">$${finalTotal.toLocaleString()}</div>
          </div>

          <div class="disclaimer">
            <strong>IMPORTANT: PROTECT YOUR TRANSACTION</strong><br/>
            Please record all <strong>Dealer IDs</strong> and <strong>Product IDs</strong> listed on this receipt. 
            The Dealer ID is used for security tracking and accountability across the Supreme platform. 
            If a dealer fails to deliver the purchased product or service within the agreed delivery period (7/14 days - 1 month), 
            you can report this specific Dealer ID to Supreme Admin for investigation. 
            Reliable dealers are rewarded, while fraudulent activities linked to an ID will result in permanent blocking of the dealer.
          </div>

          <div class="footer">
            Thank you for choosing Supreme Market. Prestige. Power. Purity.<br/>
            © 2026 Supreme Network Global.
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const checkoutWallet = async () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const finalTotal = spinReward ? total * 0.1 : total;

    if (total === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const success = await sendPayment(
      finalTotal,
      `Market Purchase: ${cart.length} item(s)`,
      'Marketplace',
      undefined, 
      'Supreme Market'
    );

    if (success) {
      toast.success("Payment successful! Your order has been placed.");

      // Create Order documents for tracking
      try {
        for (const item of cart) {
          const daysStr = item.deliveryPeriod || '14';
          const deliveryDays = parseInt(daysStr) || 14;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + deliveryDays);

          await addDoc(collection(db, 'orders'), {
            buyerUid: user?.uid,
            dealerUid: item.sellerUid || 'system',
            productId: String(item.id),
            productName: item.name,
            amount: item.price,
            status: 'pending',
            createdAt: new Date().toISOString(),
            deliveryDueDate: dueDate.toISOString(),
            userMarkedReceived: false,
            reminderSent: false,
            adminAlerted: false
          });
        }
      } catch (error) {
        console.error("Error creating orders:", error);
      }

      setCart([]);
      setSpinReward(null);
      setShowCart(false);
      event({ action: 'checkout_wallet', category: 'Market', value: finalTotal });
    }
  };

  const checkoutStripe = () => {
    handleRestrictedAction(() => {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const finalTotal = spinReward ? total * 0.1 : total;
        event({ action: 'checkout', category: 'Market', value: finalTotal });
        toast.info("Redirecting to Stripe Checkout...");
    });
  };

  const addToCart = (product: typeof initialProducts[0]) => {
    handleRestrictedAction(() => {
        setCart([...cart, product]);
        event({ action: 'add_to_cart', category: 'Market', label: product.name, value: product.price });
    });
  };

  const buyNow = (product: typeof initialProducts[0]) => {
    handleRestrictedAction(() => {
        setCart([...cart, product]);
        event({ action: 'buy_now', category: 'Market', label: product.name, value: product.price });
        setShowCart(true);
    });
  };

  const payWithWalletDirect = async (product: typeof initialProducts[0]) => {
    handleRestrictedAction(async () => {
      const discountedPrice = spinReward ? product.price * 0.1 : product.price;
      
      const success = await sendPayment(
        discountedPrice,
        `Market Purchase: ${product.name}`,
        'Marketplace',
        product.id.toString(),
        'Supreme Market'
      );

      if (success) {
        toast.success(`Purchase successful! ${product.name} is yours.`);

        // Create Order document
        try {
          const daysStr = product.deliveryPeriod || '14';
          const deliveryDays = parseInt(daysStr) || 14;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + deliveryDays);

          await addDoc(collection(db, 'orders'), {
            buyerUid: user?.uid,
            dealerUid: product.sellerUid || 'system',
            productId: String(product.id),
            productName: product.name,
            amount: discountedPrice,
            status: 'pending',
            createdAt: new Date().toISOString(),
            deliveryDueDate: dueDate.toISOString(),
            userMarkedReceived: false,
            reminderSent: false,
            adminAlerted: false
          });
        } catch (error) {
          console.error("Error creating order:", error);
        }

        setSelectedProduct(null);
        setQuickViewProduct(null);
        setSpinReward(null);
        event({ action: 'direct_purchase_wallet', category: 'Market', label: product.name, value: discountedPrice });
      }
    });
  };
  
  // Temu-style features state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [spinReward, setSpinReward] = useState<string | null>(null);
  const [recentlyAdded] = useState(() => [...initialProducts].sort(() => 0.5 - Math.random()).slice(0, 6));

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const currentTabProducts = activeTab === 'market' 
    ? products 
    : products.filter(p => wishlist.includes(p.id));

  const toggleWishlist = (id: number) => {
    handleRestrictedAction(() => {
        setWishlist(prev => 
          prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    });
  };

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesTab = activeTab === 'market' || wishlist.includes(product.id);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTab && matchesPrice && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'stock-low': return (a.stockLeft || 100) - (b.stockLeft || 100);
        case 'stock-high': return (b.stockLeft || 0) - (a.stockLeft || 0);
        default: return 0; // featured/default order
      }
    });

  const [visibleProductsCount, setVisibleProductsCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight && !isLoadingMore && visibleProductsCount < filteredProducts.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleProductsCount(prev => Math.min(prev + 8, filteredProducts.length));
          setIsLoadingMore(false);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, visibleProductsCount, filteredProducts.length]);

  const formatPrice = (price: number, displayPrice?: string) => {
    if (displayPrice) return displayPrice;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const handleSpin = () => {
    setHasSpun(true);
    setTimeout(() => {
        setSpinReward('90% OFF');
        setTimeout(() => setShowSpinWheel(false), 2000);
    }, 2000);
  };

  return (
    <FeatureLoader text="Market Place">
    <div className="space-y-8 relative pb-20">
      <MarketDealerOnboarding 
        isOpen={showPolicyModal} 
        onClose={() => setShowPolicyModal(false)} 
        onSuccess={handleOnboardingSuccess} 
      />

      {/* Market Policy Link */}
      <div className="flex justify-center mt-12">
        <button 
          onClick={() => setShowPolicyModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)]/30 transition-all font-bold text-sm"
        >
          <ShieldCheck className="w-5 h-5" />
          View Supreme Market Policy
        </button>
      </div>

      {/* Suspension Banner */}
      {profile?.isSuspended && (
        <div className="sticky top-20 3xl:top-40 4xl:top-56 5xl:top-80 z-40 bg-red-500 text-white py-3 3xl:py-10 px-8 3xl:px-24 text-center font-bold animate-pulse shadow-lg">
          <div className="flex items-center justify-center gap-2 3xl:gap-8">
            <ShieldAlert className="w-5 h-5 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32" />
            <span className="3xl:text-4xl 4xl:text-6xl 5xl:text-8xl">YOUR ACCOUNT IS SUSPENDED: {profile.suspensionReason || 'Policy Violation'}</span>
          </div>
          <p className="text-[10px] 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl opacity-80 mt-1 uppercase tracking-widest">Your products are currently on hold and you cannot list new items or make purchases.</p>
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md"
                onClick={() => setShowAddProduct(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-5xl 3xl:max-w-7xl 4xl:max-w-[2000px] rounded-3xl 3xl:rounded-[60px] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.4)] flex flex-col max-h-[95vh] md:max-h-[90vh]"
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-6 md:p-8 3xl:p-16 border-b border-gray-100 bg-gray-100/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <Plus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl 3xl:text-5xl 4xl:text-7xl font-display font-black text-[var(--color-supreme-text)] tracking-tight">Add New <span className="text-emerald-600">Product</span></h2>
                                <p className="text-[10px] md:text-xs 3xl:text-xl 4xl:text-2xl text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Authorized Dealer Portal</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowAddProduct(false)} 
                            className="p-2 3xl:p-8 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 group shadow-sm hover:shadow-md"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>

                    {/* Form Body - Scrollable */}
                    <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 md:p-10 3xl:p-24 space-y-8 md:space-y-12 no-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 3xl:gap-32">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-6 md:space-y-10 3xl:space-y-20">
                                <div>
                                    <label className="block text-xs md:text-sm 3xl:text-xl font-black text-gray-900 mb-2 uppercase tracking-widest">Product Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-gray-50/30 font-bold text-gray-700"
                                        placeholder="Enter definitive product name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest">Standard Rate ($)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
                                            <input 
                                                type="number" 
                                                value={newProduct.originalPrice}
                                                onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none font-mono font-bold text-gray-400"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest">Listing Price ($)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</div>
                                            <input 
                                                required
                                                type="number" 
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl border-emerald-500/30 border focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-mono font-bold text-gray-900"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-900 uppercase tracking-widest">Classification</label>
                                        <select 
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold text-gray-700"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-900 uppercase tracking-widest">Inventory</label>
                                        <input 
                                            required
                                            type="number" 
                                            value={newProduct.stockLeft}
                                            onChange={(e) => setNewProduct({...newProduct, stockLeft: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700"
                                            placeholder="Available units"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Visuals & Logistics */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest">Digital Proof / Imagery</label>
                                    <div className="relative group">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="url" 
                                            value={newProduct.image}
                                            onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm"
                                            placeholder="Secure Image URL (Hosted on CDN)"
                                        />
                                    </div>
                                    
                                    <div className="aspect-video w-full relative rounded-2xl overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        {newProduct.image ? (
                                            <img 
                                                src={newProduct.image} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/market/800/450';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-center">No Image<br/>Live Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-900 uppercase tracking-widest">Official Description</label>
                            <textarea 
                                required
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none h-32 md:h-40 resize-none text-sm font-medium leading-relaxed"
                                placeholder="Detail the luxury, specifications, and provenance of the item..."
                            />
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Operational Hub</label>
                                    <input 
                                        type="text" 
                                        value={newProduct.location}
                                        onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                                        className="w-full px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold"
                                        placeholder="City / Region"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Dealer ID</label>
                                    <input 
                                        type="text" 
                                        readOnly
                                        value={newProduct.dealerId}
                                        className="w-full px-4 py-2 bg-gray-100/50 text-gray-400 rounded-lg text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Contact</label>
                                    <input 
                                        type="tel" 
                                        value={newProduct.mobileNumber}
                                        onChange={(e) => setNewProduct({...newProduct, mobileNumber: e.target.value})}
                                        className="w-full px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold"
                                        placeholder="Dealer Contact Link"
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                Submit Listing
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowCart(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-lg 3xl:max-w-5xl 4xl:max-w-7xl 5xl:max-w-[2000px] rounded-3xl 3xl:rounded-[60px] overflow-hidden shadow-2xl p-8 3xl:p-24 max-h-[90vh] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6 3xl:mb-16">
                        <h2 className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-9xl font-display font-bold text-[var(--color-supreme-text)] flex items-center gap-2 3xl:gap-8">
                            <ShoppingBag className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32" /> Your Cart
                        </h2>
                        <button onClick={() => setShowCart(false)} className="p-2 3xl:p-6 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 3xl:space-y-12">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 3xl:py-24 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl">
                                Your cart is empty.
                            </div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 3xl:gap-12 p-4 3xl:p-12 border border-gray-100 rounded-2xl 3xl:rounded-[40px] bg-gray-50">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 3xl:w-48 3xl:h-48 object-cover rounded-xl 3xl:rounded-3xl" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[var(--color-supreme-text)] 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl">{item.name}</h4>
                                        <p className="text-[var(--color-supreme-gold)] font-bold 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">${item.price.toLocaleString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => setCart(cart.filter((_, i) => i !== index))}
                                        className="p-2 3xl:p-6 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="mt-6 3xl:mt-16 pt-6 3xl:pt-16 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4 3xl:mb-10">
                                <span className="text-gray-500 font-bold 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">Subtotal</span>
                                <span className="font-bold text-xl 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl">${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</span>
                            </div>
                            {spinReward && (
                                <div className="flex justify-between items-center mb-4 3xl:mb-10 text-red-500">
                                    <span className="font-bold flex items-center gap-1 3xl:gap-4 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"><Gift className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" /> Spin Reward (90% OFF)</span>
                                    <span className="font-bold 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">- ${(cart.reduce((sum, item) => sum + item.price, 0) * 0.9).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-6 3xl:mb-16">
                                <span className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-[var(--color-supreme-text)]">Total</span>
                                <span className="text-3xl 3xl:text-7xl 4xl:text-9xl 5xl:text-[10rem] font-bold text-[var(--color-supreme-gold)]">
                                    ${(spinReward ? cart.reduce((sum, item) => sum + item.price, 0) * 0.1 : cart.reduce((sum, item) => sum + item.price, 0)).toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 3xl:gap-12">
                                <button 
                                    onClick={printCart}
                                    className="py-3 px-4 3xl:py-10 3xl:px-12 bg-gray-100 text-gray-700 font-bold rounded-xl 3xl:rounded-3xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 3xl:gap-6 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                                >
                                    <Printer className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Print PDF
                                </button>
                                <button 
                                    onClick={() => handleRestrictedAction(checkoutWallet)}
                                    className="py-3 px-4 3xl:py-10 3xl:px-12 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl 3xl:rounded-3xl hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center justify-center gap-2 3xl:gap-6 shadow-lg shadow-yellow-600/30 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                                >
                                    <Wallet className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Central Wallet
                                </button>
                                <button 
                                    onClick={checkoutStripe}
                                    className="py-3 px-4 3xl:py-10 3xl:px-12 bg-[#635BFF] text-white font-bold rounded-xl 3xl:rounded-3xl hover:bg-[#4B45D6] transition-colors flex items-center justify-center gap-2 3xl:gap-6 shadow-lg shadow-indigo-500/30 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                                >
                                    <CreditCard className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Stripe
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl 3xl:rounded-[40px] p-4 3xl:p-12 4xl:p-16 5xl:p-24 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 3xl:gap-12 4xl:gap-16 5xl:gap-24 animate-pulse-slow mb-6 3xl:mb-12">
        <div className="flex items-center gap-3 3xl:gap-8">
            <div className="p-2 3xl:p-6 bg-white/20 rounded-full">
                <Zap className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-yellow-300 fill-current" />
            </div>
            <div>
                <h2 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold font-display italic tracking-wider">FLASH SALE</h2>
                <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-white/90">Limited time offers ending soon!</p>
            </div>
        </div>
        <div className="flex items-center gap-4 3xl:gap-10 bg-black/20 px-6 py-2 3xl:px-12 3xl:py-6 rounded-xl 3xl:rounded-3xl backdrop-blur-sm">
            <span className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold uppercase tracking-widest opacity-80">Ends in</span>
            <div className="flex items-center gap-2 3xl:gap-6 font-mono text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-9xl font-bold text-yellow-300">
                <Clock className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                <CountdownTimer />
            </div>
        </div>
      </div>

      {/* Recently Added Slider */}
      <div className="mb-6 3xl:mb-16">
        <h3 className="text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl font-bold text-[var(--color-supreme-text)] mb-4 3xl:mb-10 flex items-center gap-2 3xl:gap-6">
            <Clock className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28 text-[var(--color-supreme-gold)]" /> Recently Added
        </h3>
        <div className="flex overflow-x-auto gap-4 3xl:gap-12 pb-4 snap-x snap-mandatory hide-scrollbar">
            {recentlyAdded.map((product) => (
                <motion.div 
                    key={`recent-${product.id}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedProduct(product)}
                    className="flex-none w-32 h-32 md:w-40 md:h-40 3xl:w-80 3xl:h-80 4xl:w-[480px] 4xl:h-[480px] 5xl:w-[640px] 5xl:h-[640px] rounded-2xl 3xl:rounded-[40px] overflow-hidden relative cursor-pointer snap-start shadow-sm border border-gray-100 group"
                >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 3xl:p-10">
                        <p className="text-white text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold truncate">{product.name}</p>
                        <p className="text-yellow-400 text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold">${product.price.toLocaleString()}</p>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setQuickViewProduct(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-2xl 3xl:max-w-7xl 4xl:max-w-[1600px] 5xl:max-w-[2400px] rounded-2xl 3xl:rounded-[60px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                >
                    <div className="w-full md:w-1/2 h-64 md:h-auto 3xl:h-[800px] 4xl:h-[1200px] 5xl:h-[1600px] bg-gray-100 relative">
                        <img 
                            src={quickViewProduct.image} 
                            alt={quickViewProduct.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="w-full md:w-1/2 p-6 3xl:p-20 4xl:p-32 5xl:p-48 flex flex-col">
                        <div className="flex justify-between items-start mb-4 3xl:mb-12">
                            <div>
                                <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-[var(--color-supreme-text)]">{quickViewProduct.name}</h3>
                                <div className="flex items-center gap-1 3xl:gap-4 text-yellow-500 mt-1 3xl:mt-4">
                                    <Star className="w-4 h-4 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28 fill-current" />
                                    <span className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold">{quickViewProduct.rating}</span>
                                </div>
                            </div>
                            <button onClick={() => setQuickViewProduct(null)}>
                                <X className="w-5 h-5 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
                        
                        <div className="mb-6 3xl:mb-16">
                            <span className="text-2xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[12rem] font-bold text-red-600">{formatPrice(quickViewProduct.price, quickViewProduct.displayPrice)}</span>
                            {quickViewProduct.stockLeft && quickViewProduct.stockLeft < 5 && (
                                <div className="mt-2 3xl:mt-8 flex items-center gap-2 3xl:gap-6 text-orange-600 text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold">
                                    <AlertTriangle className="w-4 h-4 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                                    Only {quickViewProduct.stockLeft} left in stock!
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}
                            className="mt-auto w-full py-3 3xl:py-10 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl 3xl:rounded-3xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg flex items-center justify-center gap-2 3xl:gap-6 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                        >
                            <ShoppingBag className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Add to Cart
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedProduct(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-5xl 3xl:max-w-[1800px] 4xl:max-w-[2400px] 5xl:max-w-[3200px] max-h-[90vh] rounded-3xl 3xl:rounded-[80px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                >
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto 3xl:h-[1000px] 4xl:h-[1400px] 5xl:h-[1800px] bg-gray-100 relative">
                        <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name} 
                            className="w-full h-full object-cover"
                        />
                        {selectedProduct.discount && (
                            <div className="absolute top-4 right-16 3xl:top-12 3xl:right-48 bg-red-500 text-white px-3 py-1 3xl:px-10 3xl:py-4 rounded-full text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold shadow-lg animate-bounce">
                                {selectedProduct.discount}% OFF
                            </div>
                        )}
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 left-4 3xl:top-12 3xl:left-12 p-2 3xl:p-6 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors md:hidden"
                        >
                            <X className="w-6 h-6 3xl:w-16 3xl:h-16" />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 3xl:p-24 4xl:p-36 5xl:p-48 overflow-y-auto bg-white flex flex-col">
                        <div className="flex justify-between items-start mb-6 3xl:mb-16">
                            <div>
                                <span className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-gold)] uppercase tracking-wider mb-2 3xl:mb-6 block">{selectedProduct.category}</span>
                                <h2 className="text-3xl md:text-4xl 3xl:text-7xl 4xl:text-9xl 5xl:text-[12rem] font-display font-bold text-[var(--color-supreme-text)] mb-2 3xl:mb-8 flex items-center gap-3 3xl:gap-12">
                                    {selectedProduct.name}
                                    {(selectedProduct as any).isVerifiedSeller && (
                                        <BadgeCheck className="w-6 h-6 3xl:w-20 3xl:h-20 4xl:w-28 4xl:h-28 5xl:w-36 5xl:h-36 text-blue-600 fill-current" />
                                    )}
                                </h2>
                                <div className="flex items-center gap-2 3xl:gap-6 text-yellow-500">
                                    <div className="flex gap-0.5 3xl:gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={clsx("w-4 h-4 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28", i < Math.floor(selectedProduct.rating) ? "fill-current" : "text-gray-300")} />
                                        ))}
                                    </div>
                                    <span className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-medium text-gray-500">({selectedProduct.reviews.length} reviews)</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                className="hidden md:block p-2 3xl:p-6 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-8 3xl:mb-20">
                            <div className="flex items-baseline gap-3 3xl:gap-10 mb-4 3xl:mb-12">
                                <h3 className="text-3xl 3xl:text-8xl 4xl:text-[10rem] 5xl:text-[14rem] font-bold text-red-600">{formatPrice(selectedProduct.price, selectedProduct.displayPrice)}</h3>
                                {selectedProduct.originalPrice && (
                                    <span className="text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl text-gray-400 line-through">{formatPrice(selectedProduct.originalPrice)}</span>
                                )}
                            </div>
                            
                            {/* Stock Indicator */}
                            {selectedProduct.stockLeft && (
                                <div className="mb-6 3xl:mb-16">
                                    <div className="flex justify-between text-xs 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold mb-1 3xl:mb-6">
                                        <span className="text-orange-500 flex items-center gap-1 3xl:gap-4"><Flame className="w-3 h-3 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 fill-current" /> Almost Sold Out</span>
                                        <span className="text-gray-500">{selectedProduct.stockLeft} left</span>
                                    </div>
                                    <div className="h-2 3xl:h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" 
                                            style={{ width: `${Math.max(10, 100 - (selectedProduct.stockLeft * 5))}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Price Comparison */}
                            {selectedProduct.competitorPrices && (
                                <div className="mb-6 3xl:mb-16 bg-gray-50 p-4 3xl:p-12 rounded-xl 3xl:rounded-[40px] border border-gray-100">
                                    <h4 className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-gray-500 mb-3 3xl:mb-10 uppercase tracking-wider">Price Comparison</h4>
                                    <div className="space-y-2 3xl:space-y-8">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl text-[var(--color-supreme-text)] flex items-center gap-2 3xl:gap-6">
                                                <div className="w-2 h-2 3xl:w-6 3xl:h-6 rounded-full bg-[var(--color-supreme-gold)]" />
                                                Supreme Market
                                            </span>
                                            <span className="font-bold 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl text-[var(--color-supreme-gold)]">{formatPrice(selectedProduct.price)}</span>
                                        </div>
                                        {Object.entries(selectedProduct.competitorPrices).map(([competitor, price]) => (
                                            <div key={competitor} className="flex justify-between items-center text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500">
                                                <span className="capitalize">{competitor}</span>
                                                <span className="line-through decoration-red-500/50">{formatPrice(price as number)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 3xl:pt-8 mt-2 3xl:mt-8 border-t border-gray-200 text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-green-600 font-bold flex items-center gap-1 3xl:gap-4">
                                            <Zap className="w-3 h-3 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 fill-current" />
                                            You save up to {formatPrice(Math.max(...Object.values(selectedProduct.competitorPrices) as number[]) - selectedProduct.price)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-gray-600 leading-relaxed text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl mb-6 3xl:mb-16">{selectedProduct.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 3xl:gap-12 mb-8 3xl:mb-20">
                                <div className="p-4 3xl:p-12 rounded-2xl 3xl:rounded-[40px] bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2 3xl:gap-6 text-[var(--color-supreme-gold)] font-bold mb-1 3xl:mb-4">
                                        <Clock className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                        <span className="text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl uppercase tracking-wider">Shipping Details</span>
                                    </div>
                                    <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-600">{(selectedProduct as any).shippingDetails || 'Standard shipping applies.'}</p>
                                </div>
                                <div className="p-4 3xl:p-12 rounded-2xl 3xl:rounded-[40px] bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2 3xl:gap-6 text-[var(--color-supreme-gold)] font-bold mb-1 3xl:mb-4">
                                        <CreditCard className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                        <span className="text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl uppercase tracking-wider">Billing Info</span>
                                    </div>
                                    <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-600">{(selectedProduct as any).billingDetails || 'Secure payment processing.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 3xl:gap-12 mb-8 3xl:mb-20">
                            <button 
                                onClick={() => addToCart(selectedProduct)}
                                className="flex-1 py-4 3xl:py-12 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl 3xl:rounded-[40px] hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg flex items-center justify-center gap-2 3xl:gap-8 relative overflow-hidden group 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                <ShoppingBag className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Add to Cart
                            </button>
                            <button 
                                onClick={() => buyNow(selectedProduct)}
                                className="flex-1 py-4 3xl:py-12 bg-orange-600 text-white font-bold rounded-xl 3xl:rounded-[40px] hover:bg-orange-700 transition-colors shadow-lg flex items-center justify-center gap-2 3xl:gap-8 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                            >
                                <Zap className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Buy Now
                            </button>
                            <button 
                                onClick={() => payWithWalletDirect(selectedProduct)}
                                className="flex-1 py-4 3xl:py-12 bg-emerald-600 text-white font-bold rounded-xl 3xl:rounded-[40px] hover:bg-emerald-700 transition-colors shadow-lg flex items-center justify-center gap-2 3xl:gap-8 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
                            >
                                <Wallet className="w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" /> Pay with Wallet
                            </button>
                            <button 
                                onClick={() => toggleWishlist(selectedProduct.id)}
                                className="p-4 3xl:p-12 border border-gray-200 rounded-xl 3xl:rounded-[40px] hover:bg-gray-50 transition-colors"
                            >
                                <Heart className={clsx("w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32", wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-8 3xl:pt-20 mt-auto">
                            <h4 className="font-bold 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl text-[var(--color-supreme-text)] mb-4 3xl:mb-12">Customer Reviews</h4>
                            <div className="space-y-4 3xl:space-y-12">
                                {selectedProduct.reviews.map((review, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 3xl:p-12 rounded-xl 3xl:rounded-[40px]">
                                        <div className="flex justify-between items-center mb-2 3xl:mb-6">
                                            <span className="font-bold text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl">{review.user}</span>
                                            <div className="flex text-yellow-500 gap-0.5 3xl:gap-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={clsx("w-3 h-3 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20", i < review.rating ? "fill-current" : "text-gray-300")} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-600">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>

                            {/* Review Form */}
                            <form onSubmit={handleSubmitReview} className="mt-6 3xl:mt-20 bg-gray-50 p-6 3xl:p-16 rounded-2xl 3xl:rounded-[60px] border border-gray-100">
                                <h5 className="font-bold text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl text-[var(--color-supreme-text)] mb-4 3xl:mb-12">Write a Review</h5>
                                <div className="mb-4 3xl:mb-12">
                                    <label className="block text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-gray-700 mb-2 3xl:mb-6">Rating</label>
                                    <div className="flex gap-2 3xl:gap-8">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star 
                                                    className={clsx(
                                                        "w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 transition-colors", 
                                                        star <= newReview.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300 hover:text-yellow-200"
                                                    )} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                    <textarea
                                        required
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your thoughts about this product..."
                                        className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 resize-none bg-white"
                                        rows={4}
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="px-6 py-3 bg-[var(--color-supreme-text)] text-white font-bold rounded-xl hover:bg-black/80 transition-colors shadow-lg w-full md:w-auto"
                                >
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Wheel Overlay */}
      <AnimatePresence>
        {showSpinWheel && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div 
                    initial={{ scale: 0.5, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.5, rotate: 180 }}
                    className="bg-white rounded-full p-8 3xl:p-24 max-w-sm 3xl:max-w-4xl w-full aspect-square relative flex items-center justify-center shadow-[0_0_100px_rgba(255,215,0,0.3)] 3xl:shadow-[0_0_300px_rgba(255,215,0,0.5)]"
                >
                    {!hasSpun ? (
                        <div className="text-center space-y-4 3xl:space-y-12">
                            <Gift className="w-16 h-16 3xl:w-48 3xl:h-48 text-[var(--color-supreme-gold)] mx-auto animate-bounce" />
                            <h3 className="text-2xl 3xl:text-7xl font-bold font-display">Mystery Reward</h3>
                            <p className="text-gray-500 3xl:text-3xl">Spin to unlock your exclusive discount!</p>
                            <button 
                                onClick={handleSpin}
                                className="px-8 py-3 3xl:px-20 3xl:py-10 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform 3xl:text-4xl"
                            >
                                SPIN NOW
                            </button>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-4 3xl:space-y-12"
                        >
                            <div className="text-6xl 3xl:text-[12rem] font-black text-red-600 font-display">{spinReward || '...'}</div>
                            <p className="font-bold text-gray-800 3xl:text-5xl">CONGRATULATIONS!</p>
                            <p className="text-sm 3xl:text-3xl text-gray-500">Discount applied to your cart.</p>
                        </motion.div>
                    )}
                    <button 
                        onClick={() => setShowSpinWheel(false)}
                        className="absolute top-0 right-0 p-4 3xl:p-12 text-gray-400 hover:text-gray-600"
                    >
                        <X className="3xl:w-16 3xl:h-16" />
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Spin Button */}
      {!showSpinWheel && !spinReward && (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleRestrictedAction(() => setShowSpinWheel(true))}
            className="fixed bottom-8 right-8 3xl:bottom-24 3xl:right-24 z-40 w-16 h-16 3xl:w-48 3xl:h-48 rounded-full bg-gradient-to-br from-[var(--color-supreme-gold)] to-yellow-500 shadow-xl flex items-center justify-center border-4 border-white animate-bounce"
        >
            <Gift className="w-8 h-8 3xl:w-24 3xl:h-24 text-white" />
        </motion.button>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:gap-6 3xl:gap-12 4xl:gap-16 5xl:gap-24">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 3xl:gap-12 4xl:gap-16 5xl:gap-24">
            <div className="space-y-1 3xl:space-y-4">
                <h1 className="text-3xl md:text-4xl 3xl:text-6xl 4xl:text-8xl 5xl:text-9xl font-display font-bold text-[var(--color-supreme-text)] tracking-tight">Supreme <span className="text-[var(--color-supreme-gold)]">Market</span></h1>
                <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500 font-medium">Elite marketplace for the world's most powerful collectors.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 3xl:gap-8 4xl:gap-12 5xl:gap-16">
                <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 3xl:p-3 4xl:p-5 5xl:p-8 rounded-full border border-gray-200 w-full sm:w-auto shadow-sm">
                    {profile?.role === 'dealer' && (
                        <button 
                            onClick={() => setShowPolicyModal(true)}
                            className="flex-1 sm:flex-none px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-500 hover:text-[var(--color-supreme-text)] transition-all flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                            Market Policy
                        </button>
                    )}
                    <div className="w-px h-6 3xl:h-12 4xl:h-20 5xl:h-32 bg-gray-200 mx-1 3xl:mx-4" />
                    <button 
                        onClick={() => setActiveTab('market')}
                        className={clsx(
                            "flex-1 sm:flex-none px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'market' ? "bg-[var(--color-supreme-text)] text-white shadow-lg" : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                        )}
                    >
                        <ShoppingBag className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                        Market
                    </button>
                    <button 
                        onClick={() => handleRestrictedAction(() => setActiveTab('wishlist'))}
                        className={clsx(
                            "flex-1 sm:flex-none px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'wishlist' ? "bg-[var(--color-supreme-text)] text-white shadow-lg" : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                        )}
                    >
                        <Heart className={clsx("w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20", activeTab === 'wishlist' ? "fill-current" : "")} /> 
                        <span className="hidden xs:inline">Wishlist</span>
                    </button>
                    {profile?.role === 'dealer' && (
                        <>
                            <div className="w-px h-6 3xl:h-12 4xl:h-20 5xl:h-32 bg-gray-200 mx-1 3xl:mx-4" />
                            <button 
                                onClick={handleOpenAddProduct}
                                className="flex-1 sm:flex-none px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <Plus className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                                Add Product
                            </button>
                        </>
                    )}
                    {(profile?.role === 'dealer' || profile?.role === 'admin') && (
                        <>
                            <div className="w-px h-6 3xl:h-12 4xl:h-20 5xl:h-32 bg-gray-200 mx-1 3xl:mx-4" />
                            <button 
                                onClick={() => handleRestrictedAction(() => setActiveTab('dealer'))}
                                className={clsx(
                                    "flex-1 sm:flex-none px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold transition-all flex items-center justify-center gap-2",
                                    activeTab === 'dealer' ? "bg-[var(--color-supreme-text)] text-white shadow-lg" : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                                )}
                            >
                                <LayoutDashboard className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" /> 
                                <span className="hidden xs:inline">Dealer Hub</span>
                            </button>
                            <div className="w-px h-6 3xl:h-12 4xl:h-20 5xl:h-32 bg-gray-200 mx-1 3xl:mx-4" />
                            <button 
                                onClick={() => navigate('/dealer-dashboard')}
                                className="flex-1 sm:flex-none px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-[var(--color-supreme-gold)] hover:bg-yellow-50 transition-all flex items-center justify-center gap-2 border border-[var(--color-supreme-gold)]/20"
                            >
                                <LayoutDashboard className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" /> 
                                <span className="hidden xs:inline">Dealer Dashboard</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 3xl:gap-6">
                    <button 
                        onClick={() => handleRestrictedAction(() => setShowCart(true))}
                        className="flex-1 sm:flex-none px-4 py-2 3xl:px-8 3xl:py-4 4xl:px-12 4xl:py-6 5xl:px-20 5xl:py-10 bg-[var(--color-supreme-gold)] text-white font-bold rounded-full hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center justify-center gap-2 shadow-md relative text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                    >
                        <ShoppingBag className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" /> Cart ({cart.length})
                        {spinReward && (
                            <span className="absolute -top-2 -right-2 3xl:-top-4 3xl:-right-4 bg-red-500 text-white text-[10px] 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold px-1.5 py-0.5 3xl:px-3 3xl:py-1 rounded-full animate-pulse">
                                -90%
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 3xl:gap-12 4xl:gap-16 5xl:gap-24 bg-white/50 p-3 md:p-4 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-[40px] border border-gray-200">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 3xl:gap-12 4xl:gap-16 5xl:gap-24 justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 3xl:pl-20 3xl:pr-8 3xl:py-6 4xl:pl-32 4xl:pr-12 4xl:py-10 5xl:pl-48 5xl:pr-20 5xl:py-16 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 bg-white text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl"
                    />
                </div>
                <div className="flex items-center gap-2 3xl:gap-6">
                    <div className="relative flex-1 md:flex-none">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 text-gray-400" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-auto pl-10 pr-8 py-2 3xl:pl-20 3xl:pr-16 3xl:py-6 4xl:pl-32 4xl:pr-24 4xl:py-10 5xl:pl-48 5xl:pr-32 5xl:py-16 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 bg-white appearance-none cursor-pointer text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold"
                        >
                            <option value="featured">Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="stock-low">Low Stock</option>
                            <option value="stock-high">High Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Categories and Price Range Row */}
            <div className="flex flex-col lg:flex-row gap-4 3xl:gap-12 4xl:gap-16 5xl:gap-24 items-stretch lg:items-center justify-between pt-2 3xl:pt-10 border-t border-gray-100">
                <div className="flex gap-2 3xl:gap-6 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
                    {categories.map(category => {
                        const count = category === 'All' 
                            ? currentTabProducts.length 
                            : currentTabProducts.filter(p => p.category === category).length;
                        
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={clsx(
                                    "px-4 py-1.5 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-8 5xl:px-24 5xl:py-12 rounded-full text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold border transition-all whitespace-nowrap flex items-center gap-2 3xl:gap-4",
                                    selectedCategory === category 
                                        ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)] text-[var(--color-supreme-gold)]" 
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                )}
                            >
                                {category}
                                <span className={clsx("text-[10px] 3xl:text-lg 4xl:text-2xl 5xl:text-4xl px-1.5 py-0.5 3xl:px-3 3xl:py-1 rounded-full", selectedCategory === category ? "bg-[var(--color-supreme-gold)]/20" : "bg-gray-100")}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 3xl:gap-10 w-full lg:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-2 3xl:gap-6 text-xs md:text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500 bg-white px-3 py-1.5 3xl:px-8 3xl:py-4 rounded-full border border-gray-200 whitespace-nowrap">
                        <div className="flex items-center gap-2 3xl:gap-4">
                            <DollarSign className="w-4 h-4 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                            <span>{formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full sm:w-40 md:w-48 3xl:w-80 4xl:w-[480px] 5xl:w-[640px] gap-1.5 3xl:gap-4 px-2">
                        <input 
                            type="range" 
                            min="0" 
                            max="30000" 
                            step="1000"
                            value={priceRange[0]} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
                            }}
                            className="w-full accent-[var(--color-supreme-gold)] h-1 3xl:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input 
                            type="range" 
                            min="0" 
                            max="30000" 
                            step="1000"
                            value={priceRange[1]} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
                            }}
                            className="w-full accent-[var(--color-supreme-gold)] h-1 3xl:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Product Grid / Dealer Hub */}
      {activeTab === 'dealer' ? (
        <div className="space-y-6">
            {/* Verification Status Banner */}
            {!profile?.isVerifiedSeller && profile?.role === 'dealer' && (
                <div className="bg-blue-50 border border-blue-200 p-6 3xl:p-16 rounded-2xl 3xl:rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-4 3xl:gap-12 shadow-sm">
                    <div className="flex items-center gap-4 3xl:gap-12">
                        <div className="p-3 3xl:p-10 bg-blue-100 rounded-xl 3xl:rounded-3xl text-blue-600">
                            <ShieldCheck className="w-8 h-8 3xl:w-24 3xl:h-24 4xl:w-32 4xl:h-32 5xl:w-48 5xl:h-48" />
                        </div>
                        <div className="space-y-1 3xl:space-y-4">
                            <h4 className="text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl font-bold text-blue-900">Become a Verified Seller</h4>
                            <p className="text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-blue-700">Verified sellers get a badge, higher visibility, and lower fees. Complete your verification to unlock full features.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/dealer-dashboard')}
                        className="px-6 py-3 3xl:px-16 3xl:py-8 bg-blue-600 text-white font-bold rounded-xl 3xl:rounded-3xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
                    >
                        Get Verified Now
                    </button>
                </div>
            )}

            {/* Dealer Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 3xl:gap-12">
                {[
                    { label: 'Total Revenue', value: '$12,450.00', icon: DollarSign, color: 'emerald' },
                    { label: 'Active Products', value: '8', icon: Package, color: 'blue' },
                    { label: 'Total Sales', value: '142', icon: ShoppingBag, color: 'purple' },
                    { label: 'Store Rating', value: '4.9', icon: Star, color: 'yellow' }
                ].map((stat) => (
                    <div key={stat.label} className="glass-panel p-6 3xl:p-16 rounded-2xl 3xl:rounded-[40px] border border-gray-200 bg-white/80 flex items-center gap-4 3xl:gap-12">
                        <div className={clsx("p-3 3xl:p-10 rounded-xl 3xl:rounded-3xl", `bg-${stat.color}-500/10 text-${stat.color}-600`)}>
                            <stat.icon className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32" />
                        </div>
                        <div className="space-y-1 3xl:space-y-4">
                            <p className="text-xs 3xl:text-xl 4xl:text-2xl 5xl:text-4xl font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-[var(--color-supreme-text)]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 3xl:gap-16">
                {/* Product Management */}
                <div className="lg:col-span-2 space-y-4 3xl:space-y-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-[var(--color-supreme-text)]">Your Products</h3>
                        <button 
                            onClick={handleOpenAddProduct}
                            className="px-4 py-2 3xl:px-10 3xl:py-6 bg-[var(--color-supreme-text)] text-white text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold rounded-xl 3xl:rounded-3xl hover:bg-black transition-colors flex items-center gap-2 3xl:gap-6 shadow-lg shadow-black/20"
                        >
                            <Plus className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" /> Add New Product
                        </button>
                    </div>
                    <div className="glass-panel rounded-2xl 3xl:rounded-[40px] border border-gray-200 bg-white/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left min-w-[600px] 3xl:min-w-[1200px]">
                                <thead className="bg-gray-50/50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-[10px] 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-400 uppercase tracking-[0.2em]">Product</th>
                                        <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-[10px] 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-400 uppercase tracking-[0.2em]">Price</th>
                                        <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-[10px] 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-400 uppercase tracking-[0.2em]">Stock</th>
                                        <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-[10px] 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4 3xl:px-12 3xl:py-10 text-[10px] 3xl:text-2xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.slice(0, 5).map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                                                <div className="flex items-center gap-3 3xl:gap-8">
                                                    <div className="w-12 h-12 3xl:w-32 3xl:h-32 rounded-xl 3xl:rounded-3xl overflow-hidden border border-gray-200 group-hover:border-[var(--color-supreme-gold)]/50 transition-colors">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-text)]">{product.name}</span>
                                                        <span className="text-[10px] 3xl:text-xl 4xl:text-2xl 5xl:text-4xl text-gray-400 font-medium">{product.category}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                                                <span className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-emerald-600">{formatPrice(product.price)}</span>
                                            </td>
                                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                                                <div className="flex flex-col gap-1 3xl:gap-4">
                                                    <span className="text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-gray-600">{product.stockLeft || 0} left</span>
                                                    <div className="w-20 3xl:w-48 h-1 3xl:h-3 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 3xl:px-12 3xl:py-12">
                                                <span className="px-3 py-1 3xl:px-8 3xl:py-3 rounded-full text-[9px] 3xl:text-xl 4xl:text-2xl 5xl:text-4xl font-bold uppercase tracking-widest bg-emerald-100 text-emerald-600 border border-emerald-200">Active</span>
                                            </td>
                                            <td className="px-6 py-4 3xl:px-12 3xl:py-12 text-right">
                                                <div className="flex items-center justify-end gap-1 3xl:gap-4">
                                                    <button className="p-2 3xl:p-6 text-gray-400 hover:text-[var(--color-supreme-gold)] hover:bg-gray-100 rounded-lg 3xl:rounded-2xl transition-all">
                                                        <Edit2 className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                                    </button>
                                                    <button className="p-2 3xl:p-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg 3xl:rounded-2xl transition-all">
                                                        <Trash2 className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4 3xl:space-y-12">
                    <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-[var(--color-supreme-text)]">Recent Activity</h3>
                    <div className="glass-panel p-6 3xl:p-16 rounded-2xl 3xl:rounded-[40px] border border-gray-200 bg-white/80 space-y-6 3xl:space-y-16">
                        {[
                            { action: 'New Sale', detail: 'Supreme Gold Watch', time: '2 mins ago', icon: ShoppingBag, color: 'emerald' },
                            { action: 'Stock Low', detail: 'Elite Sneakers', time: '1 hour ago', icon: AlertTriangle, color: 'orange' },
                            { action: 'Review', detail: '5 stars from John D.', time: '3 hours ago', icon: Star, color: 'yellow' },
                            { action: 'Payout', detail: '$1,200.00 processed', time: 'Yesterday', icon: Wallet, color: 'blue' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 3xl:gap-12">
                                <div className={clsx("p-2 3xl:p-8 rounded-lg 3xl:rounded-3xl", `bg-${item.color}-500/10 text-${item.color}-600`)}>
                                    <item.icon className="w-4 h-4 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                                </div>
                                <div className="space-y-1 3xl:space-y-4">
                                    <p className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-text)]">{item.action}</p>
                                    <p className="text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500">{item.detail}</p>
                                    <p className="text-[10px] 3xl:text-xl 4xl:text-2xl 5xl:text-4xl text-gray-400 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 5xl:grid-cols-8 gap-3 md:gap-6 3xl:gap-12 4xl:gap-16 5xl:gap-24">
        <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, visibleProductsCount).map((product, index) => (
                <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      setSelectedProduct(product);
                      incrementProductViewCount();
                    }}
                    className="glass-panel rounded-xl md:rounded-2xl 3xl:rounded-[40px] overflow-hidden group hover:shadow-[0_0_30px_rgba(184,134,11,0.15)] 3xl:hover:shadow-[0_0_60px_rgba(184,134,11,0.25)] transition-all duration-500 border border-gray-200 hover:border-[var(--color-supreme-gold)]/30 bg-white/80 cursor-pointer relative flex flex-col"
                >
                    <div className="relative aspect-square overflow-hidden">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        
                        {/* Verified Seller Badge */}
                        {(product as any).isVerifiedSeller && (
                            <div className="absolute top-2 left-2 3xl:top-6 3xl:left-6 bg-blue-600 text-white p-1 3xl:p-3 rounded-full shadow-lg z-20 border border-blue-400" title="Verified Seller">
                                <BadgeCheck className="w-3 h-3 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 fill-current" />
                            </div>
                        )}

                        {/* Verified Dealer Badge */}
                        {product.isVerifiedSeller && (
                            <div className="absolute top-2 md:top-4 3xl:top-10 left-2 md:left-4 3xl:left-10 bg-blue-600 text-white px-2 md:px-3 3xl:px-8 py-0.5 md:py-1 3xl:py-4 rounded-full text-[10px] 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold shadow-lg z-10 flex items-center gap-1 3xl:gap-4 border border-blue-400">
                                <ShieldCheck className="w-2.5 h-2.5 md:w-3 h-3 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
                                <span>VERIFIED</span>
                            </div>
                        )}

                        {/* Discount Badge */}
                        {product.discount && (
                            <div className="absolute top-0 left-0 bg-red-600 text-white px-2 md:px-3 3xl:px-8 py-0.5 md:py-1 3xl:py-4 rounded-br-lg md:rounded-br-xl 3xl:rounded-br-[32px] text-[10px] md:text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold shadow-md z-10">
                                {product.discount}% OFF
                            </div>
                        )}

                        {/* Flash Sale Badge */}
                        {product.isFlashSale && product.status === 'active' && (
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] md:text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold py-1 px-2 md:px-3 3xl:py-4 3xl:px-8 flex items-center gap-1 3xl:gap-4">
                                <Zap className="w-2.5 h-2.5 md:w-3 h-3 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 fill-current text-yellow-300" />
                                <span className="hidden xs:inline">FLASH DEAL</span>
                                <span className="ml-auto font-mono"><CountdownTimer /></span>
                            </div>
                        )}

                        {/* Status Badge */}
                        {product.status !== 'active' && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-30">
                                <div className="bg-red-600 text-white px-4 py-2 3xl:px-12 3xl:py-6 rounded-full font-bold text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl shadow-xl border border-red-400 animate-pulse flex items-center gap-2 3xl:gap-6">
                                    <AlertTriangle className="w-4 h-4 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28" />
                                    {product.status === 'suspended' ? 'NOT AVAILABLE NOW' : 'ON HOLD'}
                                </div>
                            </div>
                        )}

                        <div className="absolute top-2 md:top-4 3xl:top-10 right-2 md:right-4 3xl:right-10 flex flex-col gap-2 3xl:gap-6">
                            <div className="bg-white/90 backdrop-blur-md px-2 md:px-3 3xl:px-8 py-0.5 md:py-1 3xl:py-4 rounded-full text-[10px] 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold text-[var(--color-supreme-text)] border border-gray-200 shadow-sm self-end">
                                {product.category}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            className="absolute top-10 md:top-12 3xl:top-24 right-2 md:right-4 3xl:right-10 p-1.5 md:p-2 3xl:p-6 rounded-full bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500 transition-colors shadow-sm border border-gray-200"
                        >
                            <Heart className={clsx("w-4 h-4 md:w-5 h-5 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-28 5xl:h-28 transition-all", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "")} />
                        </button>

                        {/* Quick View Button - Desktop Only */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 3xl:p-10 rounded-full bg-white/90 backdrop-blur-md text-[var(--color-supreme-text)] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 z-20 hidden md:flex"
                        >
                            <Eye className="w-6 h-6 3xl:w-20 3xl:h-20 4xl:w-28 4xl:h-28 5xl:w-36 5xl:h-36" />
                        </button>

                        {/* Low Stock Alert Overlay */}
                        {product.stockLeft && product.stockLeft < 5 && (
                            <div className="absolute bottom-2 right-2 3xl:bottom-8 3xl:right-8 bg-red-600 text-white text-[8px] md:text-[10px] 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold px-1.5 md:px-2 3xl:px-6 py-0.5 md:py-1 3xl:py-3 rounded-lg 3xl:rounded-2xl shadow-md flex items-center gap-1 3xl:gap-3 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 md:w-3 h-3 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                                Low
                            </div>
                        )}
                    </div>
                    
                    <div className="p-3 md:p-4 3xl:p-10 4xl:p-16 5xl:p-24 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1 3xl:mb-4">
                            <h3 className="text-sm md:text-lg 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)] transition-colors line-clamp-1 flex items-center gap-2">
                                {product.name}
                                {product.isVerifiedSeller && <ShieldCheck className="w-3 h-3 md:w-4 h-4 3xl:w-10 3xl:h-10 text-blue-600" />}
                            </h3>
                        </div>
                        
                        <div className="flex items-baseline gap-1 md:gap-2 3xl:gap-6 mb-1 md:mb-2 3xl:mb-6">
                            <span className="text-base md:text-xl 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl font-display font-bold text-red-600">{formatPrice(product.price, product.displayPrice)}</span>
                            {product.originalPrice && (
                                <span className="text-[10px] md:text-xs 3xl:text-xl 4xl:text-3xl 5xl:text-5xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                            )}
                        </div>

                        {/* Stock Bar - Desktop Only */}
                        {product.stockLeft && (
                            <div className="mb-2 md:mb-3 3xl:mb-8 hidden xs:block">
                                <div className="flex justify-between text-[8px] md:text-[10px] 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold mb-1 3xl:mb-3 text-gray-500">
                                    <span className="text-orange-500 flex items-center gap-1 3xl:gap-3"><Flame className="w-2.5 h-2.5 md:w-3 h-3 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16 fill-current" /> Almost Gone</span>
                                    <span>{product.soldCount} sold</span>
                                </div>
                                <div className="h-1 md:h-1.5 3xl:h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" 
                                        style={{ width: `${Math.max(10, 100 - (product.stockLeft * 5))}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-1 3xl:gap-3 text-yellow-500 mb-2 md:mb-3 3xl:mb-8">
                            <Star className="w-2.5 h-2.5 md:w-3 h-3 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16 fill-current" />
                            <span className="text-[10px] md:text-xs 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold">{product.rating}</span>
                        </div>

                        {/* Mini Price Comparison - Desktop Only */}
                        {product.competitorPrices && (
                            <div className="mb-2 md:mb-3 3xl:mb-8 text-[8px] md:text-[10px] 3xl:text-xl 4xl:text-3xl 5xl:text-5xl text-gray-400 hidden sm:flex items-center gap-2 3xl:gap-6">
                                <span className="line-through">Amazon: {formatPrice(product.competitorPrices.amazon as number)}</span>
                                <span className="text-green-600 font-bold">Save {Math.round((1 - product.price / (product.competitorPrices.amazon as number)) * 100)}%</span>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-1.5 md:gap-2 3xl:gap-6 mt-auto">
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (product.status === 'active') {
                                        addToCart(product);
                                        event({ action: 'add_to_cart_click', category: 'Market', label: product.name });
                                    }
                                }}
                                disabled={product.status !== 'active'}
                                className={clsx(
                                    "py-1.5 md:py-2 3xl:py-6 px-2 md:px-3 3xl:px-10 rounded-lg 3xl:rounded-2xl text-[10px] md:text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold transition-colors flex items-center justify-center gap-1 3xl:gap-3",
                                    product.status === 'active' ? "bg-gray-100 hover:bg-gray-200 text-[var(--color-supreme-text)]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                <ShoppingBag className="w-3 h-3 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" /> <span className="hidden xs:inline">Add</span>
                            </button>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (product.status === 'active') {
                                        buyNow(product);
                                        event({ action: 'buy_now_click', category: 'Market', label: product.name });
                                    }
                                }}
                                disabled={product.status !== 'active'}
                                className={clsx(
                                    "py-1.5 md:py-2 3xl:py-6 px-2 md:px-3 3xl:px-10 rounded-lg 3xl:rounded-2xl text-white text-[10px] md:text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold transition-colors flex items-center justify-center gap-1 3xl:gap-3 shadow-sm",
                                    product.status === 'active' ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-400 cursor-not-allowed"
                                )}
                            >
                                <Zap className="w-3 h-3 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 fill-current" /> <span className="hidden xs:inline">Buy Now</span><span className="xs:hidden">Buy</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
                ))
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="col-span-full py-20 3xl:py-64 text-center"
                >
                    <div className="w-20 h-20 3xl:w-64 3xl:h-64 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 3xl:mb-12">
                        <Heart className="w-10 h-10 3xl:w-32 3xl:h-32 text-gray-300" />
                    </div>
                    <h3 className="text-xl 3xl:text-6xl 4xl:text-8xl 5xl:text-9xl font-bold text-[var(--color-supreme-text)] mb-2 3xl:mb-8">
                        {activeTab === 'wishlist' && wishlist.length === 0 ? 'Your wishlist is empty' : 'No products found'}
                    </h3>
                    <p className="text-gray-500 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl mb-6 3xl:mb-16">
                        {activeTab === 'wishlist' && wishlist.length === 0
                            ? 'Start adding items you love to your collection.' 
                            : 'Try adjusting your filters or search query.'}
                    </p>
                    {(selectedCategory !== 'All' || searchQuery !== '' || priceRange[0] > 0 || priceRange[1] < 30000) && (
                        <button 
                            onClick={() => {
                                setSelectedCategory('All');
                                setSearchQuery('');
                                setPriceRange([0, 30000]);
                            }}
                            className="px-6 py-2 3xl:px-16 3xl:py-8 bg-[var(--color-supreme-text)] text-white rounded-full text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold hover:opacity-90 transition-opacity"
                        >
                            Clear Filters
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      )}

      {/* Level 3 Ad Modal */}
      <AnimatePresence>
        {showAdModal && level3Ads.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-4 3xl:p-24"
          >
            <div className="max-w-2xl 3xl:max-w-7xl 4xl:max-w-[1600px] 5xl:max-w-[2400px] w-full relative">
              <button 
                onClick={handleCloseAd}
                className="absolute -top-12 3xl:-top-32 right-0 text-white hover:text-[var(--color-supreme-gold)] transition-colors flex items-center gap-2 3xl:gap-8 font-bold 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl"
              >
                <X className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32" /> Close Ad
              </button>
              <div className="bg-white rounded-[2rem] 3xl:rounded-[80px] overflow-hidden shadow-2xl border-4 3xl:border-[12px] border-[var(--color-supreme-gold)]">
                <AdBanner 
                  ad={level3Ads[Math.floor(Math.random() * level3Ads.length)]} 
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-white/60 text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl mt-4 3xl:mt-12">
                Ad will close when you click the close button.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </FeatureLoader>
  );
}
