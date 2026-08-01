import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Camera,
  Mail,
  Lock,
  User,
  MapPin,
  Phone,
  Briefcase,
  Star,
  ThumbsUp,
  ThumbsDown,
  Target,
  Save,
  Check,
  Key,
  Clock,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Trophy,
  TrendingUp,
  X,
  Cake,
  FileText,
  Heart,
  MessageCircle,
  Edit2,
  Trash2,
  Music,
  Video,
  Calendar,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Zap,
  Filter,
  Search,
  ChevronRight,
  ShieldAlert,
  Layers,
  Radio,
  Play,
  Film,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { toast } from "sonner";
import VerifiedBadge from "../components/VerifiedBadge";
import OrderTracking from "../components/OrderTracking";
import { useWallet } from "../context/WalletContext";
import InvestmentGrowthChart from "../components/InvestmentGrowthChart";
import RenewalEarningsForecastChart from "../components/RenewalEarningsForecastChart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getRankData, RANK_BENEFITS } from "../constants/ranks";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const AVATAR_STYLES = Array.from(
  { length: 100 },
  (_, i) => `https://picsum.photos/seed/avatar${i}/150`,
);

const DEMO_PROMOTED_SOUNDS = [
  {
    id: "demo-snd-101",
    title: "Afrobeat Supreme Vibe",
    artist: "Kofi Mastermind",
    category: "Afrobeat / Percussion",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    uploadedAt: "2026-02-15",
    earningExpiresAt: new Date(Date.now() + 198 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloads: 1240,
    downloadsWhileExpired: 0,
    usagesCount: 850,
    usagesWhileExpired: 0,
  },
  {
    id: "demo-snd-102",
    title: "Cyberpunk Synth Lead 128 BPM",
    artist: "Neon Pulse",
    category: "Electronic / Synth",
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
    uploadedAt: "2025-06-10",
    earningExpiresAt: new Date(Date.now() - 52 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloads: 890,
    downloadsWhileExpired: 48,
    usagesCount: 620,
    usagesWhileExpired: 32,
  },
  {
    id: "demo-snd-103",
    title: "Deep House Vocal Drop",
    artist: "Siren Beats",
    category: "House / EDM",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    uploadedAt: "2026-01-01",
    earningExpiresAt: new Date(Date.now() + 153 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 10,
    downloads: 2150,
    downloadsWhileExpired: 0,
    usagesCount: 1420,
    usagesWhileExpired: 0,
  }
];

const DEMO_PROMOTED_SHORTS = [
  {
    id: "demo-srt-101",
    title: "Neon City Tokyo Drift Loop",
    creatorName: "VisualsByAlex",
    category: "Cinematic 4K",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-03-01",
    earningExpiresAt: new Date(Date.now() + 212 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloads: 1890,
    downloadsWhileExpired: 0,
    uses: 1100,
    usesWhileExpired: 0,
  },
  {
    id: "demo-srt-102",
    title: "Acoustic Guitar Chill Loop",
    creatorName: "AcousticStudio",
    category: "Music Video",
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80",
    createdAt: "2025-05-20",
    earningExpiresAt: new Date(Date.now() - 73 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloads: 650,
    downloadsWhileExpired: 35,
    uses: 410,
    usesWhileExpired: 20,
  }
];

const PROMOTION_RENEWAL_PLANS = [
  { years: 1, price: 10, label: "1 Year Extension", discount: "Standard Rate", description: "365 days of active monetization ($2.50 / 500 uses) & global promotion." },
  { years: 2, price: 15, label: "2 Years Extension", discount: "Save 25%", description: "730 days of continuous monetization & priority platform placement." },
  { years: 3, price: 25, label: "3 Years Extension", discount: "Save 16%", description: "1,095 days of active earnings & algorithmic feed promotion." },
  { years: 4, price: 35, label: "4 Years Extension", discount: "Save 12%", description: "1,460 days of extended monetization validity for content creators." },
  { years: 5, price: 45, label: "5 Years Extension", discount: "Best Value - Save 10%", description: "1,825 days (5 full years) of maximum royalty collection." },
];

export default function Profile() {
  const { user, updateUser, generateSecurityKey } = useAuth();
  const { balance, sendPayment } = useWallet();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    | "basic"
    | "advanced"
    | "security"
    | "analytics"
    | "monetization"
    | "rank"
    | "posts"
    | "orders"
    | "renewals"
  >("basic");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Subscription Renewal & Promotions State
  const [promotedSounds, setPromotedSounds] = useState<any[]>(DEMO_PROMOTED_SOUNDS);
  const [promotedShorts, setPromotedShorts] = useState<any[]>(DEMO_PROMOTED_SHORTS);
  const [isPromotionsLoading, setIsPromotionsLoading] = useState(false);
  const [renewalFilter, setRenewalFilter] = useState<'all' | 'sounds' | 'shorts' | 'expired'>('all');
  const [renewalSearch, setRenewalSearch] = useState('');
  const [renewalModalItem, setRenewalModalItem] = useState<{ item: any; type: 'sound' | 'short' } | null>(null);

  useEffect(() => {
    if (activeTab === "renewals") {
      setIsPromotionsLoading(true);

      const qSounds = query(collection(db, "super_sounds_promote"));
      const unsubSounds = onSnapshot(
        qSounds,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (items.length > 0) {
            setPromotedSounds(items);
          } else {
            setPromotedSounds(DEMO_PROMOTED_SOUNDS);
          }
        },
        (err) => {
          console.error("Error fetching sounds:", err);
          setPromotedSounds(DEMO_PROMOTED_SOUNDS);
        }
      );

      const qShorts = query(collection(db, "super_shorts"));
      const unsubShorts = onSnapshot(
        qShorts,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (items.length > 0) {
            setPromotedShorts(items);
          } else {
            setPromotedShorts(DEMO_PROMOTED_SHORTS);
          }
          setIsPromotionsLoading(false);
        },
        (err) => {
          console.error("Error fetching shorts:", err);
          setPromotedShorts(DEMO_PROMOTED_SHORTS);
          setIsPromotionsLoading(false);
        }
      );

      return () => {
        unsubSounds();
        unsubShorts();
      };
    }
  }, [activeTab]);

  const handleProcessRenewal = async (item: any, type: 'sound' | 'short', years: number, cost: number) => {
    if (balance < cost) {
      toast.error(`Insufficient wallet balance ($${balance.toFixed(2)})! You need $${cost} for ${years} year(s) renewal.`);
      return;
    }

    const success = sendPayment(cost, `Promotion Renewal (${years} yr) - ${item.title}`, "Promotions");
    if (!success) {
      toast.error("Payment failed. Please verify your wallet balance.");
      return;
    }

    const currentExp = item.earningExpiresAt && new Date(item.earningExpiresAt).getTime() > Date.now()
      ? new Date(item.earningExpiresAt).getTime()
      : Date.now();
    
    const addedMs = years * 365 * 24 * 3600 * 1000;
    const newExpiresAt = new Date(currentExp + addedMs).toISOString();

    const updatedFields = {
      earningExpiresAt: newExpiresAt,
      totalRenewalSpent: (item.totalRenewalSpent || 0) + cost,
    };

    try {
      const collectionName = type === 'sound' ? 'super_sounds_promote' : 'super_shorts';
      if (item.id && !item.id.startsWith('demo-')) {
        await updateDoc(doc(db, collectionName, item.id), updatedFields);
      }
    } catch (err) {
      console.error("Firestore update error:", err);
    }

    if (type === 'sound') {
      setPromotedSounds((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, ...updatedFields } : s))
      );
    } else {
      setPromotedShorts((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, ...updatedFields } : s))
      );
    }

    setRenewalModalItem(null);
    toast.success(
      `🎉 Successfully renewed "${item.title}" for ${years} year(s) ($${cost})! New expiration: ${new Date(newExpiresAt).toLocaleDateString()}.`
    );
  };

  const allPromotions = [
    ...promotedSounds.map((s) => ({
      ...s,
      type: 'sound' as const,
      cover: s.coverImage || s.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
      creator: s.artist || s.creatorName || "Content Creator",
      usageMetric: `${s.downloads || 0} downloads • ${s.usagesCount || 0} uses`,
      uncreditedMetric: (s.downloadsWhileExpired || 0) + (s.usagesWhileExpired || 0),
    })),
    ...promotedShorts.map((s) => ({
      ...s,
      type: 'short' as const,
      cover: s.coverUrl || s.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
      creator: s.creatorName || "Content Creator",
      usageMetric: `${s.downloads || 0} downloads • ${s.uses || 0} uses`,
      uncreditedMetric: (s.downloadsWhileExpired || 0) + (s.usesWhileExpired || 0),
    })),
  ];

  const filteredPromotions = allPromotions.filter((item) => {
    const isExpired = item.earningExpiresAt ? new Date().getTime() > new Date(item.earningExpiresAt).getTime() : false;
    if (renewalFilter === 'sounds' && item.type !== 'sound') return false;
    if (renewalFilter === 'shorts' && item.type !== 'short') return false;
    if (renewalFilter === 'expired' && !isExpired) return false;

    if (renewalSearch) {
      const term = renewalSearch.toLowerCase();
      return (
        item.title?.toLowerCase().includes(term) ||
        item.creator?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          items.sort((a: any, b: any) => {
            const timeA = a.date?.toDate?.()?.getTime() || (a.date ? new Date(a.date).getTime() : 0);
            const timeB = b.date?.toDate?.()?.getTime() || (b.date ? new Date(b.date).getTime() : 0);
            return timeB - timeA;
          });
          setTransactions(items);
        },
        (error) => {
          console.error("Error in transactions listener:", error);
        },
      );
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid && activeTab === "posts") {
      setIsPostsLoading(true);
      const q = query(
        collection(db, "posts"),
        where("authorUid", "==", user.uid),
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          items.sort((a: any, b: any) => {
            const timeA = a.createdAt?.toDate?.()?.getTime() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt?.toDate?.()?.getTime() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          });
          setUserPosts(items);
          setIsPostsLoading(false);
        },
        (error) => {
          console.error("Error fetching user posts:", error);
          setIsPostsLoading(false);
        },
      );
    }
  }, [user?.uid, activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "rank" && activeTab !== "rank") {
      setActiveTab("rank");
    } else if (tab === "posts" && activeTab !== "posts") {
      setActiveTab("posts");
    }
  }, [searchParams, activeTab]);
  const isAdmin = user?.role === "admin" || user?.role === "mini-admin";
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Basic Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_STYLES[0]);
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(
    user?.gender || "",
  );
  const [birthday, setBirthday] = useState(user?.birthday || "");

  // Advanced Profile State
  const [location, setLocation] = useState(user?.location || "");
  const [city, setCity] = useState(user?.city || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [tolerance, setTolerance] = useState(user?.tolerance || "");
  const [likes, setLikes] = useState(user?.likes?.join(", ") || "");
  const [dislikes, setDislikes] = useState(user?.dislikes?.join(", ") || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [careers, setCareers] = useState(user?.careers?.join(", ") || "");

  // Monetization State
  const [isMonetizationEnabled, setIsMonetizationEnabled] = useState(
    user?.monetizationEnabled || false,
  );
  const [monthlyPrice, setMonthlyPrice] = useState(user?.monthlyPrice || 4.99);
  const [yearlyPrice, setYearlyPrice] = useState(user?.yearlyPrice || 49.99);
  const [exclusiveContent, setExclusiveContent] = useState(
    user?.exclusiveContent || false,
  );
  const [payPerView, setPayPerView] = useState(user?.payPerView || false);
  const [ppvPrice, setPpvPrice] = useState(user?.ppvPrice || 0.99);
  const [monthlyFeatures, setMonthlyFeatures] = useState(
    user?.monthlyFeatures?.join(", ") || "Exclusive Posts, Early Access, Badge",
  );
  const [yearlyFeatures, setYearlyFeatures] = useState(
    user?.yearlyFeatures?.join(", ") ||
      "All Monthly Features, 2 Months Free, VIP Discord",
  );
  const [setupStep, setSetupStep] = useState(1);
  const [keyExpiryDays, setKeyExpiryDays] = useState(30);

  const [keyTimeLeft, setKeyTimeLeft] = useState<string>("");
  const [showKeyGenConfirm, setShowKeyGenConfirm] = useState(false);
  const [isSecurityKeyEnabled, setIsSecurityKeyEnabled] = useState(
    user?.isSecurityKeyEnabled || false,
  );

  React.useEffect(() => {
    if (user?.keyExpiresAt) {
      const interval = setInterval(() => {
        const diff = new Date(user.keyExpiresAt!).getTime() - Date.now();
        if (diff <= 0) {
          setKeyTimeLeft("Expired");
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setKeyTimeLeft(`${days}d ${hours}h ${mins}m`);
        }
      }, 60000);

      const diff = new Date(user.keyExpiresAt!).getTime() - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setKeyTimeLeft(`${days}d ${hours}h ${mins}m`);

      return () => clearInterval(interval);
    }
  }, [user?.keyExpiresAt]);

  const handleGenerateKey = () => {
    if (balance < 2.5) {
      toast.error("Insufficient balance. Generating a new key costs $2.50");
      return;
    }

    const success = sendPayment(2.5, "Security Key Generation Fee", "Security");
    if (success) {
      generateSecurityKey(keyExpiryDays);
      setShowKeyGenConfirm(false);
      toast.success("New 16-character security key generated successfully!");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateUser({
        name,
        email,
        avatar,
        location,
        city,
        mobile,
        bio,
        tolerance: Number(tolerance),
        likes: likes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        dislikes: dislikes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        careers: careers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        monetizationEnabled: isMonetizationEnabled,
        isSecurityKeyEnabled,
        monthlyPrice,
        yearlyPrice,
        monthlyFeatures: monthlyFeatures
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        yearlyFeatures: yearlyFeatures
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        exclusiveContent,
        payPerView,
        ppvPrice,
        gender,
        birthday,
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  if (!user)
    return (
      <div className="p-8 text-center">Please log in to view your profile.</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)] tracking-tight">
            Profile Settings
          </h1>
          <VerifiedBadge size={24} />
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-md flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-gray-200 overflow-hidden bg-white/80">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("basic")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "basic"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Basic Profile
            {activeTab === "basic" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          {user?.role === "dealer" && (
            <button
              onClick={() => setActiveTab("advanced")}
              className={clsx(
                "flex-1 py-4 text-sm font-bold transition-colors relative",
                activeTab === "advanced"
                  ? "text-[var(--color-supreme-gold)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              )}
            >
              Dealer Profile
              {activeTab === "advanced" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
                />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("security")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "security"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Security & Keys
            {activeTab === "security" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "analytics"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Analytics
            {activeTab === "analytics" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("monetization")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "monetization"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Monetization
            {activeTab === "monetization" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("rank")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "rank"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Rank Benefits
            {activeTab === "rank" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("renewals")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative flex items-center justify-center gap-1.5 px-3 whitespace-nowrap",
              activeTab === "renewals"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Subscription Renewal
            {allPromotions.filter((p) => p.earningExpiresAt && new Date().getTime() > new Date(p.earningExpiresAt).getTime()).length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-amber-200">
                {allPromotions.filter((p) => p.earningExpiresAt && new Date().getTime() > new Date(p.earningExpiresAt).getTime()).length} Expired
              </span>
            )}
            {activeTab === "renewals" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "posts"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            My Posts
            {activeTab === "posts" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={clsx(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === "orders"
                ? "text-[var(--color-supreme-gold)]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Deliveries
            {activeTab === "orders" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]"
              />
            )}
          </button>
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "basic" ? (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {!isAdmin && (
                      <button
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        className="absolute bottom-0 right-0 p-2 bg-[var(--color-supreme-gold)] text-white rounded-full hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-md border-2 border-white"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-[var(--color-supreme-text)] mb-1">
                      Profile Picture
                    </h3>
                    {isAdmin ? (
                      <p className="text-sm text-gray-500 mb-4">
                        Admin avatars are managed by the system and cannot be
                        changed from this panel.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500 mb-4">
                          Choose from 100+ unique avatar styles to represent you
                          on Supreme.
                        </p>
                        <button
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          {showAvatarPicker
                            ? "Close Gallery"
                            : "Browse Avatars"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Avatar Picker */}
                <AnimatePresence>
                  {showAvatarPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-gray-700">
                            Select an Avatar Style
                          </h4>
                          <button
                            onClick={() => {
                              const randomStyle =
                                AVATAR_STYLES[
                                  Math.floor(
                                    Math.random() * AVATAR_STYLES.length,
                                  )
                                ];
                              setAvatar(randomStyle);
                            }}
                            className="text-xs font-bold text-[var(--color-supreme-gold)] hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Randomize
                          </button>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-1">
                          {AVATAR_STYLES.map((style, i) => (
                            <img
                              key={i}
                              src={style}
                              alt={`Style ${i}`}
                              onClick={() => {
                                setAvatar(style);
                                setShowAvatarPicker(false);
                              }}
                              className={clsx(
                                "w-full aspect-square rounded-lg object-cover cursor-pointer hover:opacity-80 transition-all",
                                avatar === style
                                  ? "ring-2 ring-[var(--color-supreme-gold)] ring-offset-2"
                                  : "border border-gray-200",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50 appearance-none"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "advanced" ? (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New York, USA"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Manhattan"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Map Preview
                    </label>
                    <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
                      <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                      <div className="relative z-10 flex flex-col items-center text-gray-400">
                        <MapPin className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                          {location || city
                            ? `${city ? city + ", " : ""}${location}`
                            : "Enter location to view map"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tolerance / Preferences
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={tolerance}
                        onChange={(e) => setTolerance(e.target.value)}
                        placeholder="e.g. High risk, Low risk"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Likes (comma separated)
                    </label>
                    <div className="relative">
                      <ThumbsUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={likes}
                        onChange={(e) => setLikes(e.target.value)}
                        placeholder="Tech, Luxury, Cars..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dislikes (comma separated)
                    </label>
                    <div className="relative">
                      <ThumbsDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={dislikes}
                        onChange={(e) => setDislikes(e.target.value)}
                        placeholder="Spam, Fake news..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills (comma separated)
                    </label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="React, Design, Marketing..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Careers (comma separated)
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={careers}
                        onChange={(e) => setCareers(e.target.value)}
                        placeholder="Software Engineer, Founder..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "security" ? (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 gap-8">
                  {/* Security Key Card */}
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-red-950 to-black border border-amber-500/20 shadow-2xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-2xl font-display font-bold text-amber-500 flex items-center gap-3">
                            <Key className="w-7 h-7" /> Account Security Key
                          </h3>
                          <p className="text-red-200/60 text-sm mt-2 max-w-md">
                            Your 16-character security key is required for every
                            login. It ensures that only you can access your
                            account, even if your password is compromised.
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                              {keyTimeLeft}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              Login Verification
                            </span>
                            <button
                              onClick={() =>
                                setIsSecurityKeyEnabled(!isSecurityKeyEnabled)
                              }
                              className={clsx(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                isSecurityKeyEnabled
                                  ? "bg-green-500"
                                  : "bg-gray-600",
                              )}
                            >
                              <span
                                className={clsx(
                                  "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                                  isSecurityKeyEnabled
                                    ? "translate-x-5"
                                    : "translate-x-1",
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.3em] mb-3">
                            Active Security Key
                          </p>
                          <p className="text-3xl font-mono font-bold tracking-[0.4em] text-amber-500">
                            {user?.securityKey || "XXXX-XXXX-XXXX-XXXX"}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowKeyGenConfirm(true)}
                          className="px-8 py-4 bg-amber-500 text-red-950 font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-xl flex items-center gap-3 whitespace-nowrap"
                        >
                          <RefreshCw className="w-5 h-5" /> Generate New Key
                        </button>
                      </div>

                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <h4 className="font-bold text-sm">
                              Verified Protection
                            </h4>
                          </div>
                          <p className="text-xs text-red-100/50 leading-relaxed">
                            Your account is protected by military-grade
                            16-character encryption keys.
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h4 className="font-bold text-sm">
                              Monthly Expiration
                            </h4>
                          </div>
                          <p className="text-xs text-red-100/50 leading-relaxed">
                            Keys expire every 30 days for maximum security.
                            Always keep your key safe.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute -left-10 -top-10 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
                  </div>

                  {/* Transaction History for Keys */}
                  <div className="p-6 rounded-2xl border border-gray-200 bg-white">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[var(--color-supreme-gold)]" />{" "}
                      Key Generation History
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                            <Key className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              New Key Generated
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600 text-sm">
                            -$2.50
                          </p>
                          <p className="text-[10px] font-bold text-green-600 uppercase">
                            Completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center py-8 text-gray-400 text-sm italic">
                        No older key transactions found.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Modal */}
                <AnimatePresence>
                  {showKeyGenConfirm && (
                    <div
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                      onClick={() => setShowKeyGenConfirm(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-6 bg-red-950 flex justify-between items-center">
                          <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                            <Key className="w-5 h-5" /> Confirm New Key
                          </h3>
                          <button
                            onClick={() => setShowKeyGenConfirm(false)}
                            className="text-amber-500/50 hover:text-amber-500"
                          >
                            <Lock className="w-5 h-5 rotate-45" />
                          </button>
                        </div>
                        <div className="p-8 space-y-6 text-center">
                          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                            <RefreshCw className="w-10 h-10 text-amber-500" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xl font-bold text-gray-900">
                              Generate New Key?
                            </h4>
                            <p className="text-sm text-gray-500">
                              A fee of{" "}
                              <span className="text-amber-600 font-bold">
                                $2.50
                              </span>{" "}
                              will be deducted from your wallet. Your current
                              key will be deactivated immediately.
                            </p>
                            <div className="pt-4">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-left">
                                Key Expiry Period
                              </label>
                              <select
                                value={keyExpiryDays}
                                onChange={(e) =>
                                  setKeyExpiryDays(Number(e.target.value))
                                }
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold outline-none focus:border-amber-500"
                              >
                                <option value={7}>
                                  7 Days (High Security)
                                </option>
                                <option value={30}>30 Days (Standard)</option>
                                <option value={90}>
                                  90 Days (Convenience)
                                </option>
                                <option value={365}>
                                  365 Days (Low Security)
                                </option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowKeyGenConfirm(false)}
                              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleGenerateKey}
                              className="flex-1 py-3 bg-amber-500 text-red-950 font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg"
                            >
                              Confirm ($2.50)
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : activeTab === "analytics" ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <InvestmentGrowthChart />
              </motion.div>
            ) : (
              <motion.div
                key="monetization"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Follower Monetization
                      </h3>
                      <p className="text-sm text-gray-500">
                        Earn revenue from your followers through subscriptions
                        and exclusive content.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setIsMonetizationEnabled(!isMonetizationEnabled)
                    }
                    className={clsx(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:ring-offset-2",
                      isMonetizationEnabled
                        ? "bg-[var(--color-supreme-gold)]"
                        : "bg-gray-200",
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        isMonetizationEnabled
                          ? "translate-x-6"
                          : "translate-x-1",
                      )}
                    />
                  </button>
                </div>

                {isMonetizationEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-8"
                  >
                    {/* Setup Progress */}
                    <div className="flex items-center justify-between px-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className="flex items-center flex-1 last:flex-none"
                        >
                          <button
                            onClick={() => setSetupStep(step)}
                            className={clsx(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                              setupStep >= step
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                : "bg-gray-100 text-gray-400",
                            )}
                          >
                            {step}
                          </button>
                          {step < 3 && (
                            <div
                              className={clsx(
                                "h-1 flex-1 mx-4 rounded-full",
                                setupStep > step
                                  ? "bg-amber-500"
                                  : "bg-gray-100",
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {setupStep === 1 ? (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                              <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <Clock className="w-5 h-5" />
                                <h4 className="font-bold uppercase tracking-widest text-xs">
                                  Monthly Tier
                                </h4>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                  Monthly Price ($)
                                </label>
                                <input
                                  type="number"
                                  value={monthlyPrice}
                                  onChange={(e) =>
                                    setMonthlyPrice(parseFloat(e.target.value))
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none transition-all bg-gray-50 font-bold"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                  Features (comma separated)
                                </label>
                                <textarea
                                  value={monthlyFeatures}
                                  onChange={(e) =>
                                    setMonthlyFeatures(e.target.value)
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none transition-all bg-gray-50 text-sm min-h-[100px]"
                                  placeholder="e.g. Exclusive Posts, Early Access"
                                />
                              </div>
                            </div>

                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                              <div className="flex items-center gap-2 text-orange-600 mb-2">
                                <Target className="w-5 h-5" />
                                <h4 className="font-bold uppercase tracking-widest text-xs">
                                  Yearly Tier
                                </h4>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                  Yearly Price ($)
                                </label>
                                <input
                                  type="number"
                                  value={yearlyPrice}
                                  onChange={(e) =>
                                    setYearlyPrice(parseFloat(e.target.value))
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 font-bold"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                  Features (comma separated)
                                </label>
                                <textarea
                                  value={yearlyFeatures}
                                  onChange={(e) =>
                                    setYearlyFeatures(e.target.value)
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 text-sm min-h-[100px]"
                                  placeholder="e.g. All Monthly Features, 2 Months Free"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSetupStep(2)}
                              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                            >
                              Next Step
                            </button>
                          </div>
                        </motion.div>
                      ) : setupStep === 2 ? (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                              Content & Pay-Per-View
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                <div
                                  className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    exclusiveContent
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-gray-100 text-gray-400",
                                  )}
                                >
                                  <Lock className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-gray-900">
                                      Exclusive Content
                                    </p>
                                    <input
                                      type="checkbox"
                                      checked={exclusiveContent}
                                      onChange={(e) =>
                                        setExclusiveContent(e.target.checked)
                                      }
                                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Only subscribers can view your premium posts
                                    and media.
                                  </p>
                                </div>
                              </label>

                              <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                <div
                                  className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    payPerView
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-gray-100 text-gray-400",
                                  )}
                                >
                                  <ThumbsUp className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-gray-900">
                                      Pay-Per-View
                                    </p>
                                    <input
                                      type="checkbox"
                                      checked={payPerView}
                                      onChange={(e) =>
                                        setPayPerView(e.target.checked)
                                      }
                                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Sell individual posts or media to
                                    non-subscribers.
                                  </p>
                                </div>
                              </label>
                            </div>

                            {payPerView && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-blue-50 rounded-xl border border-blue-100"
                              >
                                <label className="block text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">
                                  Default PPV Price ($)
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    value={ppvPrice}
                                    onChange={(e) =>
                                      setPpvPrice(parseFloat(e.target.value))
                                    }
                                    className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 outline-none transition-all bg-white font-bold"
                                    step="0.01"
                                  />
                                  <p className="text-xs text-blue-500 font-medium max-w-[200px]">
                                    This is the default price for your locked
                                    content.
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <button
                              onClick={() => setSetupStep(1)}
                              className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => setSetupStep(3)}
                              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                            >
                              Next Step
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="p-8 bg-gray-900 rounded-3xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                              <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Revenue
                                Projection
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                  <p className="text-gray-400 text-xs mb-1">
                                    Target Subscribers
                                  </p>
                                  <p className="text-3xl font-bold">1,240</p>
                                  <p className="text-green-500 text-xs mt-1 font-bold">
                                    +12% growth est.
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-1">
                                    Monthly Revenue
                                  </p>
                                  <p className="text-3xl font-bold text-amber-500">
                                    $
                                    {(1240 * monthlyPrice * 0.8).toLocaleString(
                                      undefined,
                                      { maximumFractionDigits: 2 },
                                    )}
                                  </p>
                                  <p className="text-gray-500 text-[10px] mt-1">
                                    After 20% platform fee
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-1">
                                    Yearly Potential
                                  </p>
                                  <p className="text-3xl font-bold text-orange-500">
                                    $
                                    {(
                                      1240 *
                                      monthlyPrice *
                                      0.8 *
                                      12
                                    ).toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    })}
                                  </p>
                                  <p className="text-gray-500 text-[10px] mt-1">
                                    Estimated annual take-home
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                          </div>

                          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                              <ShieldCheck className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                Ready to Launch!
                              </p>
                              <p className="text-xs text-gray-600">
                                Review your settings and click "Save Changes" at
                                the top to activate your monetization tiers.
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-start">
                            <button
                              onClick={() => setSetupStep(2)}
                              className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                              Back to Settings
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
            {activeTab === "rank" && (
              <motion.div
                key="rank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl text-white border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                          Supreme Rank Privileges
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Your current status:{" "}
                          <span className="font-bold text-amber-500 uppercase tracking-widest">
                            {user?.rank || "Bronze"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                      Elevate your experience on Supreme by climbing the ranks.
                      Each tier unlocks exclusive benefits, lower fees, and
                      higher earning potential.
                    </p>
                  </div>

                  <div className="relative z-10 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-w-[240px]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Next Rank Progress
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    {(() => {
                      const currentRank = user?.rank || "Bronze";
                      const rankList = Object.keys(RANK_BENEFITS);
                      const currentIndex = rankList.findIndex(
                        (r) => r.toLowerCase() === currentRank.toLowerCase(),
                      );
                      const nextRank = rankList[currentIndex + 1];

                      if (!nextRank || nextRank === "Official") {
                        return (
                          <p className="text-sm font-bold text-amber-500">
                            Maximum Rank Achieved!
                          </p>
                        );
                      }

                      const nextRankData = RANK_BENEFITS[nextRank];
                      const reqs = nextRankData.requirements;

                      // Calculate progress (simple average for display)
                      const balanceProgress =
                        Math.min(100, (balance / reqs.minBalance) * 100) || 0;
                      const txProgress =
                        Math.min(
                          100,
                          (transactions.length / reqs.minTransactions) * 100,
                        ) || 0;
                      const followerProgress =
                        Math.min(
                          100,
                          (user.followers / reqs.minFollowers) * 100,
                        ) || 0;
                      const totalProgress =
                        (balanceProgress + txProgress + followerProgress) / 3;

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">
                              {nextRank}
                            </span>
                            <span className="text-xs font-bold text-amber-500">
                              {totalProgress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${totalProgress}%` }}
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 text-center">
                            Complete requirements to unlock {nextRank}
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Decorative */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(RANK_BENEFITS).map((rankData) => {
                    const isCurrentRank =
                      user?.rank?.toLowerCase() === rankData.rank.toLowerCase();
                    const isOfficial = rankData.rank === "Official";

                    if (isOfficial && user?.role !== "admin") return null;

                    return (
                      <div
                        key={rankData.rank}
                        className={clsx(
                          "p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col",
                          isCurrentRank
                            ? "border-amber-500 bg-amber-50/30 shadow-xl scale-105 z-10"
                            : "border-gray-100 bg-white hover:border-gray-300 shadow-sm",
                        )}
                      >
                        {isCurrentRank && (
                          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">
                            Current
                          </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                            style={{ backgroundColor: rankData.color }}
                          >
                            {rankData.rank.charAt(0)}
                          </div>
                          <div>
                            <h4
                              className="text-xl font-bold tracking-tight"
                              style={{ color: rankData.color }}
                            >
                              {rankData.label}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                              Supreme Tier
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6 flex-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                Fees
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {rankData.feeReduction}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                Earnings
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {rankData.earningMultiplier}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Star className="w-3 h-3 text-amber-500" /> Key
                              Benefits
                            </p>
                            <ul className="space-y-2.5">
                              {rankData.benefits.map((benefit, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2.5 text-sm text-gray-600 leading-tight"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                              Requirements
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  Min. Balance
                                </span>
                                <span
                                  className={clsx(
                                    "font-bold",
                                    balance >= rankData.requirements.minBalance
                                      ? "text-green-600"
                                      : "text-gray-900",
                                  )}
                                >
                                  $
                                  {rankData.requirements.minBalance.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  Transactions
                                </span>
                                <span
                                  className={clsx(
                                    "font-bold",
                                    transactions.length >=
                                      rankData.requirements.minTransactions
                                      ? "text-green-600"
                                      : "text-gray-900",
                                  )}
                                >
                                  {rankData.requirements.minTransactions}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Followers</span>
                                <span
                                  className={clsx(
                                    "font-bold",
                                    user.followers >=
                                      rankData.requirements.minFollowers
                                      ? "text-green-600"
                                      : "text-gray-900",
                                  )}
                                >
                                  {rankData.requirements.minFollowers}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h4 className="text-2xl font-bold mb-2">
                        Unlock Your Potential
                      </h4>
                      <p className="text-white/80 text-sm max-w-md">
                        Your rank is calculated automatically based on your
                        platform activity. Keep trading, growing your network,
                        and maintaining a healthy balance to reach the next
                        tier.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        className="px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
                      >
                        <TrendingUp className="w-5 h-5" /> Track Progress
                      </button>
                    </div>
                  </div>
                  {/* Decorative */}
                  <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                </div>
              </motion.div>
            )}
            {activeTab === "posts" && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900">
                      My Posts
                    </h3>
                    <p className="text-gray-500">
                      Manage and view all your shared content.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700">
                    <FileText className="w-4 h-4" />
                    {userPosts.length} Posts
                  </div>
                </div>

                {isPostsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <RefreshCw className="w-10 h-10 text-[var(--color-supreme-gold)] animate-spin" />
                    <p className="text-gray-500 font-medium">
                      Fetching your posts...
                    </p>
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel rounded-2xl border border-gray-200 overflow-hidden flex flex-col bg-white/80 hover:shadow-xl transition-all group"
                      >
                        {post.mediaUrl && (
                          <div className="aspect-video relative overflow-hidden bg-gray-100">
                            {post.mediaType === "video" ? (
                              <video
                                src={post.mediaUrl}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={post.mediaUrl}
                                alt="Post media"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            )}
                            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                              {post.mediaType}
                            </div>
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                              {post.category || "General"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString()
                                : "Just now"}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Heart className="w-4 h-4" />
                                <span className="text-xs font-bold">
                                  {post.likes || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs font-bold">
                                  {post.comments || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      No posts yet
                    </h4>
                    <p className="text-gray-500 max-w-xs mb-6">
                      You haven't shared any content on the Supreme Network yet.
                      Start sharing your thoughts and media!
                    </p>
                    <button
                      onClick={() => (window.location.href = "/#/network")}
                      className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-lg"
                    >
                      Create First Post
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OrderTracking />
              </motion.div>
            )}

            {activeTab === "renewals" && (
              <motion.div
                key="renewals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Banner Header */}
                <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Content Creator Monetization Hub
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
                        Song & Clip Promotion Subscription Renewal
                      </h2>
                      <p className="text-gray-300 text-sm mt-1 max-w-2xl leading-relaxed">
                        All promoted music tracks and video clips earn rewards ($2.50 per 500 uses) for <strong>1 full year (365 days)</strong> per track. Monitor expiration timelines, view uncredited activity, and renew billing tiers (1-5 years) to ensure uninterrupted monetization!
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0">
                      <div className="text-xs text-gray-300 font-medium">Wallet Balance</div>
                      <div className="text-2xl font-black text-amber-400 mt-0.5">${balance.toFixed(2)}</div>
                      <button
                        onClick={() => (window.location.href = "/#/wallet")}
                        className="text-[11px] font-bold text-amber-300 hover:underline mt-1 block ml-auto"
                      >
                        + Add Funds
                      </button>
                    </div>
                  </div>

                  {/* Pricing Matrix Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                    {PROMOTION_RENEWAL_PLANS.map((plan) => (
                      <div
                        key={plan.years}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 text-center transition-all flex flex-col justify-between"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 text-[10px] font-bold uppercase">
                            {plan.discount}
                          </span>
                          <div className="text-base font-black text-amber-300 mt-2">
                            {plan.years} Year{plan.years > 1 ? "s" : ""}
                          </div>
                          <div className="text-xl font-extrabold text-white mt-0.5">${plan.price}</div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 leading-tight">{plan.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recharts Predictive Earnings & Renewal Forecast */}
                <RenewalEarningsForecastChart
                  promotions={allPromotions}
                  walletBalance={balance}
                  onOpenRenewalModal={(item) =>
                    setRenewalModalItem({
                      item,
                      type: item.type,
                    })
                  }
                />

                {/* Quick Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Active Monetized
                    </div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">
                      {allPromotions.filter((p) => !p.earningExpiresAt || new Date().getTime() <= new Date(p.earningExpiresAt).getTime()).length}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1">
                      Earning $0.005 / download or use
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Expired / Paused
                    </div>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                      {allPromotions.filter((p) => p.earningExpiresAt && new Date().getTime() > new Date(p.earningExpiresAt).getTime()).length}
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium mt-1">
                      Renewal needed to resume earnings
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      Renewal Invested
                    </div>
                    <div className="text-2xl font-black text-purple-600 mt-1">
                      ${allPromotions.reduce((acc, curr) => acc + (curr.totalRenewalSpent || 0), 0)}
                    </div>
                    <div className="text-[11px] text-purple-700 font-medium mt-1">
                      Spent extending promotions
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Uncredited Activity
                    </div>
                    <div className="text-2xl font-black text-rose-600 mt-1">
                      {allPromotions.reduce((acc, curr) => acc + (curr.uncreditedMetric || 0), 0)}
                    </div>
                    <div className="text-[11px] text-rose-700 font-medium mt-1">
                      Downloads/uses during expired period
                    </div>
                  </div>
                </div>

                {/* Recharts Revenue & Renewal Forecast Visualization */}
                <PromotionEarningsForecast promotions={allPromotions} />

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                    <button
                      onClick={() => setRenewalFilter("all")}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0",
                        renewalFilter === "all"
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      All Promotions ({allPromotions.length})
                    </button>
                    <button
                      onClick={() => setRenewalFilter("sounds")}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0",
                        renewalFilter === "sounds"
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <Music className="w-3.5 h-3.5" />
                      Songs & Audio ({allPromotions.filter((p) => p.type === "sound").length})
                    </button>
                    <button
                      onClick={() => setRenewalFilter("shorts")}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0",
                        renewalFilter === "shorts"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video Clips ({allPromotions.filter((p) => p.type === "short").length})
                    </button>
                    <button
                      onClick={() => setRenewalFilter("expired")}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0",
                        renewalFilter === "expired"
                          ? "bg-amber-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Expired / Needs Renewal (
                      {
                        allPromotions.filter(
                          (p) =>
                            p.earningExpiresAt &&
                            new Date().getTime() > new Date(p.earningExpiresAt).getTime()
                        ).length
                      }
                      )
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={renewalSearch}
                      onChange={(e) => setRenewalSearch(e.target.value)}
                      placeholder="Search by title or artist..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Promotion Cards Grid */}
                {isPromotionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-supreme-gold)] animate-spin" />
                    <p className="text-gray-500 font-medium text-sm">Loading active song & clip promotions...</p>
                  </div>
                ) : filteredPromotions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPromotions.map((item) => {
                      const isExpired = item.earningExpiresAt
                        ? new Date().getTime() > new Date(item.earningExpiresAt).getTime()
                        : false;
                      const daysRemaining = item.earningExpiresAt
                        ? Math.ceil(
                            (new Date(item.earningExpiresAt).getTime() - new Date().getTime()) /
                              (1000 * 3600 * 24)
                          )
                        : 365;

                      const clampedDays = Math.max(0, Math.min(365, daysRemaining));
                      const pctRemaining = Math.round((clampedDays / 365) * 100);

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden p-5 space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                                <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 p-1 rounded-md bg-black/60 text-white">
                                  {item.type === "sound" ? (
                                    <Music className="w-3 h-3 text-purple-300" />
                                  ) : (
                                    <Video className="w-3 h-3 text-indigo-300" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">
                                    {item.type === "sound" ? "🎵 Song / Sound" : "🎬 Video Clip"}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {item.category}
                                  </span>
                                </div>

                                <h4 className="font-extrabold text-gray-900 text-base line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-gray-500">By {item.creator}</p>
                              </div>
                            </div>

                            {/* Status Badge & Expiration Info */}
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Monetization Status:</span>
                                {isExpired ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-200 text-amber-900 font-extrabold inline-flex items-center gap-1 text-[11px]">
                                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                    Earnings Paused (Expired {Math.abs(daysRemaining)}d ago)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold inline-flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Active Monetization ({daysRemaining}d left)
                                  </span>
                                )}
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
                                  <span>365-Day Validity Cycle</span>
                                  <span>{isExpired ? "0% Left" : `${pctRemaining}% Time Remaining`}</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={clsx(
                                      "h-full transition-all duration-500 rounded-full",
                                      isExpired
                                        ? "bg-amber-500"
                                        : pctRemaining > 30
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                    )}
                                    style={{ width: `${isExpired ? 100 : pctRemaining}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                                <span>
                                  Expiration Date:{" "}
                                  <strong className="text-gray-900">
                                    {item.earningExpiresAt
                                      ? new Date(item.earningExpiresAt).toLocaleDateString()
                                      : "1 Year Default"}
                                  </strong>
                                </span>
                                <span>
                                  Renewal Spent:{" "}
                                  <strong className="text-purple-700">${item.totalRenewalSpent || 0}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                              <span className="font-medium">{item.usageMetric}</span>
                              {item.uncreditedMetric > 0 && (
                                <span className="text-rose-600 font-bold">
                                  ⚠️ {item.uncreditedMetric} uncredited uses while expired
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Renew Now Action Button */}
                          <button
                            onClick={() =>
                              setRenewalModalItem({
                                item,
                                type: item.type,
                              })
                            }
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Renew Now ($10 - $45 Tiers)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 space-y-3">
                    <Music className="w-10 h-10 text-gray-400 mx-auto" />
                    <h4 className="font-bold text-gray-800 text-base">No promotions found</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      No song or video clip promotions match your filter. Upload songs or clips in Super Sounds or Super Shorts to begin earning!
                    </p>
                  </div>
                )}

                {/* Renewal Modal */}
                <AnimatePresence>
                  {renewalModalItem && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6"
                      >
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                              <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                Subscription Renewal Billing
                              </span>
                              <h3 className="text-xl font-extrabold text-gray-900">
                                {renewalModalItem.item.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Creator: {renewalModalItem.item.creator} • Type:{" "}
                                {renewalModalItem.type === "sound" ? "Song Audio Track" : "Video Short Clip"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setRenewalModalItem(null)}
                            className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            1-Year Content Creator Rule
                          </div>
                          <p>
                            Extending your promotion guarantees $2.50 reward credits per 500 downloads/uses and priority algorithmic promotion across Super Sounds & Super Shorts.
                          </p>
                        </div>

                        {/* Select Billing Tier */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Select Renewal Billing Tier (1-5 Years):
                          </label>

                          <div className="grid grid-cols-1 gap-2.5">
                            {PROMOTION_RENEWAL_PLANS.map((plan) => (
                              <button
                                key={plan.years}
                                onClick={() => {
                                  const target = renewalModalItem;
                                  handleProcessRenewal(target.item, target.type, plan.years, plan.price);
                                }}
                                className="w-full p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left flex items-center justify-between group"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-gray-900 text-sm">
                                      {plan.label}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      {plan.discount}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                                </div>

                                <div className="text-right">
                                  <div className="text-lg font-black text-emerald-700">${plan.price}</div>
                                  <div className="text-[10px] text-gray-400 font-bold group-hover:text-emerald-700">
                                    Pay via Wallet →
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
