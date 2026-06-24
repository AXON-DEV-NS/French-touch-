import React, { useState, useEffect } from 'react';
import { 
  Globe, User, LogOut, Lock, Calendar, MapPin, 
  Clock, Phone, Sparkles, Compass, Eye, ShieldAlert, CheckCircle2, Ticket,
  ShoppingBag, Plus, Minus, Trash2, LayoutDashboard, Utensils, Map,
  ChevronRight, ArrowRight, Star, Heart
} from 'lucide-react';

import { 
  Language, Product, ExclusiveOffer, WeeklyOffer, 
  Manager, LANGUAGES, TRANSLATIONS, CategoryItem 
} from './types';

import { 
  INITIAL_MANAGERS, INITIAL_PRODUCTS, 
  INITIAL_EXCLUSIVE_OFFER, INITIAL_WEEKLY_OFFERS 
} from './initialData';

import InteractiveMap from './components/InteractiveMap';
import MenuSection from './components/MenuSection';
import ExclusiveOfferBanner from './components/ExclusiveOfferBanner';
import AdminManagerConsole from './components/AdminManagerConsole';
import LoginModal from './components/LoginModal';
import RestaurantLogo from './components/RestaurantLogo';
import LanguageLandingScreen from './components/LanguageLandingScreen';
import GoogleLoginScreen from './components/GoogleLoginScreen';
import DeveloperConsole from './components/DeveloperConsole';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import { CustomizeOption } from './types';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access blocked:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write blocked:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove blocked:", e);
    }
  }
};

const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn("Session storage access blocked:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn("Session storage write blocked:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("Session storage remove blocked:", e);
    }
  }
};

export default function App() {
  // --- Landing Screen Entry State ---
  const [entered, setEntered] = useState(() => {
    const saved = safeSessionStorage.getItem('frenchtouch_entered');
    return saved === 'true';
  });

  // --- Persistent State Loaded from LocalStorage ---
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = safeStorage.getItem('frenchtouch_lang');
    return (saved as Language) || 'ar';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeStorage.getItem('frenchtouch_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [exclusiveOffer, setExclusiveOffer] = useState<ExclusiveOffer>(() => {
    const saved = safeStorage.getItem('frenchtouch_exclusive');
    return saved ? JSON.parse(saved) : INITIAL_EXCLUSIVE_OFFER;
  });

  const [weeklyOffers, setWeeklyOffers] = useState<WeeklyOffer[]>(() => {
    const saved = safeStorage.getItem('frenchtouch_weekly');
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_OFFERS;
  });

  const [managers, setManagers] = useState<Manager[]>(() => {
    const saved = safeStorage.getItem('frenchtouch_managers');
    return saved ? JSON.parse(saved) : INITIAL_MANAGERS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    return [
      { id: "appetizers", name: { ar: "مقبلات شهية", en: "Gourmet Appetizers", fr: "Entrées", it: "Antipasti" }, icon: "Soup" },
      { id: "mains", name: { ar: "أطباق رئيسية فاخرة", en: "Signature Mains", fr: "Plats", it: "Piatti" }, icon: "Utensils" },
      { id: "desserts", name: { ar: "حلويات فرنسية وإيطالية", en: "French & Italian Pastries", fr: "Desserts", it: "Dolci" }, icon: "Cake" },
      { id: "drinks", name: { ar: "مشروبات منعشة", en: "Refreshing Drinks", fr: "Boissons", it: "Bevande" }, icon: "GlassWater" }
    ];
  });

  // --- Current Signed in User State ---
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; picture?: string; role: 'Developer' | 'Manager' | 'Customer' } | null>(() => {
    const saved = safeSessionStorage.getItem('frenchtouch_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Preview Role State for Developer Console Simulation ---
  const [previewRole, setPreviewRole] = useState<'Developer' | 'Manager' | 'Customer'>(() => {
    const saved = safeSessionStorage.getItem('frenchtouch_preview_role');
    return (saved as 'Developer' | 'Manager' | 'Customer') || 'Developer';
  });

  // Keep previewRole in sync when currentUser changes
  useEffect(() => {
    if (currentUser?.role) {
      setPreviewRole(currentUser.role);
    }
  }, [currentUser]);

  // Save previewRole to sessionStorage
  useEffect(() => {
    safeSessionStorage.setItem('frenchtouch_preview_role', previewRole);
  }, [previewRole]);

  // --- App-style Navigation State ---
  const [activeAppTab, setActiveAppTab] = useState<'dashboard' | 'menu' | 'reserve' | 'offers' | 'locations' | 'admin'>('dashboard');

  // --- Interactive Simulated Order Bag/Cart State ---
  const [cart, setCart] = useState<{ id: string; product: Product; quantity: number; selectedAddons?: CustomizeOption[]; selectedSauces?: CustomizeOption[] }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);

  // --- Customizer Modal State ---
  const [customizerProduct, setCustomizerProduct] = useState<Product | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // --- UI Controls ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminConsoleVisible, setIsAdminConsoleVisible] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'products' | 'offers' | 'super'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Booking Form State ---
  const [bookingBranch, setBookingBranch] = useState<'medical' | 'waha'>('medical');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingReceipt, setBookingReceipt] = useState<any | null>(null);

  const t = TRANSLATIONS[currentLang];
  const currentLangDir = LANGUAGES.find(l => l.code === currentLang)?.dir || 'ltr';

  // --- LocalStorage Sync Effects ---
  useEffect(() => {
    safeStorage.setItem('frenchtouch_lang', currentLang);
    // Dynamically adjust html dir and lang attributes
    document.documentElement.dir = currentLangDir;
    document.documentElement.lang = currentLang;
  }, [currentLang, currentLangDir]);

  // Increment page views once on mount
  useEffect(() => {
    fetch('/api/pageviews/increment', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Not ok');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON');
      })
      .catch(err => console.warn('Failed to increment page views:', err));
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('Not ok');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON');
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.warn('Failed to fetch categories, using robust default categories instead:', err));
  }, []);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_exclusive', JSON.stringify(exclusiveOffer));
  }, [exclusiveOffer]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_weekly', JSON.stringify(weeklyOffers));
  }, [weeklyOffers]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_managers', JSON.stringify(managers));
  }, [managers]);

  useEffect(() => {
    if (currentUser) {
      safeSessionStorage.setItem('frenchtouch_current_user', JSON.stringify(currentUser));
    } else {
      safeSessionStorage.removeItem('frenchtouch_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (entered) {
      safeSessionStorage.setItem('frenchtouch_entered', 'true');
    } else {
      safeSessionStorage.removeItem('frenchtouch_entered');
    }
  }, [entered]);

  useEffect(() => {
    (window as any).__dismissLanding = () => {
      setEntered(true);
    };
    return () => {
      delete (window as any).__dismissLanding;
    };
  }, []);

  // --- Auth Checks (Reactive to developer simulation) ---
  const isDeveloper = currentUser?.role === 'Developer';
  const activeRole = (isDeveloper ? previewRole : currentUser?.role) || 'Customer';

  const isManager = activeRole === 'Manager' || activeRole === 'Developer' || currentUser?.email === 'uvyffi5@gmail.com';
  const isSuperAdmin = activeRole === 'Developer' || currentUser?.email === 'uvyffi5@gmail.com';

  const handleLoginSuccess = (user: { email: string; name: string; picture?: string; role: 'Developer' | 'Manager' | 'Customer' }) => {
    setCurrentUser(user);
    if (user.role === 'Developer') {
      setPreviewRole('Developer');
    } else if (user.role === 'Manager') {
      setActiveAppTab('admin');
      setIsAdminConsoleVisible(true);
    } else {
      setActiveAppTab('dashboard');
      setIsAdminConsoleVisible(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPreviewRole('Developer');
    setIsAdminConsoleVisible(false);
    setActiveAppTab('dashboard');
  };

  // --- Action Handlers ---
  const handleAddManager = (email: string, name: string) => {
    if (managers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      alert("This manager is already authorized.");
      return;
    }
    const newM: Manager = {
      email,
      name,
      addedAt: new Date().toISOString()
    };
    setManagers([...managers, newM]);
  };

  const handleRemoveManager = (email: string) => {
    if (email === 'uvyffi5@gmail.com') return;
    setManagers(managers.filter(m => m.email !== email));
  };

  const handleSaveProduct = (product: Product) => {
    const exists = products.some(p => p.id === product.id);
    if (exists) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([product, ...products]);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm(currentLang === 'ar' ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
      setCart(cart.filter(item => item.product.id !== id));
    }
  };

  const handleAddCategory = async (id: string, name: any, icon?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, icon })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');
      setCategories(data.categories);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleDeleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');
      setCategories(data.categories);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleSaveExclusiveOffer = (offer: ExclusiveOffer) => {
    setExclusiveOffer(offer);
  };

  const handleSaveWeeklyOffers = (offers: WeeklyOffer[]) => {
    setWeeklyOffers(offers);
  };

  // --- Booking Table Submission ---
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingDate || !bookingTime) {
      alert(currentLang === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة للحجز.' : 'Please fill all fields for reservation.');
      return;
    }
    const receiptCode = 'FT-' + Math.floor(100000 + Math.random() * 900000);
    setBookingReceipt({
      code: receiptCode,
      name: bookingName,
      phone: bookingPhone,
      branch: bookingBranch === 'medical' ? t.medicalBranch : t.wahaBranch,
      guests: bookingGuests,
      date: bookingDate,
      time: bookingTime,
      timestamp: new Date().toLocaleString()
    });
  };

  // --- Cart / Order operations ---
  const handleAddToCart = (product: Product) => {
    // If product can have addons or sauces, open customizer modal first
    if (product.canHaveAddons || product.canHaveSauces) {
      setCustomizerProduct(product);
      setIsCustomizerOpen(true);
    } else {
      // Add standard non-customized product
      const itemId = product.id;
      const existing = cart.find(item => item.id === itemId);
      if (existing) {
        setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        setCart([...cart, { id: itemId, product, quantity: 1 }]);
      }
      setIsCartOpen(true);
    }
  };

  const handleCustomizerConfirm = (
    product: Product,
    qty: number,
    addons: CustomizeOption[],
    sauces: CustomizeOption[]
  ) => {
    // Generate a unique ID based on the customizations selected
    const addonIds = addons.map(a => a.id).sort().join(',');
    const sauceIds = sauces.map(s => s.id).sort().join(',');
    const itemId = `${product.id}-${addonIds || 'none'}-${sauceIds || 'none'}`;

    const existing = cart.find(item => item.id === itemId);
    if (existing) {
      setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + qty } : item));
    } else {
      setCart([...cart, {
        id: itemId,
        product,
        quantity: qty,
        selectedAddons: addons,
        selectedSauces: sauces
      }]);
    }
    setIsCustomizerOpen(false);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    const orderCode = 'ORDER-' + Math.floor(100000 + Math.random() * 900000);
    
    // Calculate total including addons and sauces
    const subtotal = cart.reduce((sum, item) => {
      const addonsCost = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
      const saucesCost = item.selectedSauces?.reduce((s, sd) => s + sd.price, 0) || 0;
      const singlePrice = item.product.price + addonsCost + saucesCost;
      return sum + (singlePrice * item.quantity);
    }, 0);
    
    const tax = Math.round(subtotal * 0.14); // 14% Egyptian Tax rate
    const total = subtotal + tax;

    setOrderReceipt({
      code: orderCode,
      items: [...cart],
      subtotal,
      tax,
      total,
      timestamp: new Date().toLocaleString()
    });

    // Clear cart after checkout
    setCart([]);
  };

  const currentDayOfWeek = new Date().getDay();
  const todaysWeeklyOffer = weeklyOffers.find(w => w.dayOfWeek === currentDayOfWeek);

  // Dynamic Greeting based on time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) {
      return {
        fr: 'Bonjour',
        en: 'Good Morning',
        ar: 'صباح الخير والياسمين',
        it: 'Buongiorno'
      }[currentLang] || 'Bonjour';
    } else {
      return {
        fr: 'Bonsoir',
        en: 'Good Evening',
        ar: 'مساء الفخامة والروعة',
        it: 'Buonasera'
      }[currentLang] || 'Bonsoir';
    }
  };

  if (!entered) {
    return (
      <LanguageLandingScreen
        onSelectLanguage={(lang) => {
          setCurrentLang(lang);
        }}
        currentLang={currentLang}
      />
    );
  }

  // Google Login Page blocks access after choosing language
  if (!currentUser) {
    return (
      <GoogleLoginScreen
        currentLang={currentLang}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Developer Command Center view
  if (currentUser?.role === 'Developer' && previewRole === 'Developer') {
    return (
      <DeveloperConsole
        currentLang={currentLang}
        currentUser={currentUser}
        onLogout={handleLogout}
        previewRole={previewRole}
        setPreviewRole={(role) => {
          setPreviewRole(role);
          if (role !== 'Developer') {
            if (role === 'Manager') {
              setActiveAppTab('admin');
              setIsAdminConsoleVisible(true);
            } else {
              setActiveAppTab('dashboard');
              setIsAdminConsoleVisible(false);
            }
          }
        }}
      />
    );
  }

  // Calculate cart total items count
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const addonsCost = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
    const saucesCost = item.selectedSauces?.reduce((s, sd) => s + sd.price, 0) || 0;
    const singlePrice = item.product.price + addonsCost + saucesCost;
    return sum + (singlePrice * item.quantity);
  }, 0);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-brand-gold selection:text-brand-blue ${currentLangDir === 'rtl' ? 'ar-dir' : 'ltr-dir'}`}>
      
      {/* 1. TOP MARGIN FRENCH FLAG DECORATIVE RIBBON */}
      <div className="w-full h-1.5 flex flex-row shrink-0">
        <div className="flex-1 h-full bg-[#002395]"></div>
        <div className="flex-1 h-full bg-white"></div>
        <div className="flex-1 h-full bg-[#ED2939]"></div>
      </div>

      {/* 2. DYNAMIC APP CONTAINER HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Header Left: Logo & Home triggers */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveAppTab('dashboard')} 
              className="hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <RestaurantLogo className="scale-90" />
            </button>
            <span className="hidden lg:inline-flex h-6 w-px bg-slate-200"></span>
            
            {/* Quick Live Kitchen Status Indicator */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 font-mono">
                {currentLang === 'ar' ? 'المطبخ متصل ومفتوح' : 'Kitchen Live'}
              </span>
            </div>
          </div>

          {/* Header Center: Language Selectors + Intro Replay */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setCurrentLang(lang.code)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === lang.code
                    ? 'bg-brand-blue text-brand-gold shadow-sm font-mono'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang.name.split(' ')[0]} {lang.flag}
              </button>
            ))}
            
            {/* Sparkling Welcome Screen Replay Button */}
            <button
              onClick={() => setEntered(false)}
              className="p-1 px-2 text-[10px] uppercase font-bold text-amber-600 hover:bg-amber-500/10 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title={currentLang === 'ar' ? 'أعد عرض شاشة الترحيب' : 'Replay intro welcome screen'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{currentLang === 'ar' ? 'التقديم' : currentLang === 'fr' ? 'Accueil' : 'Intro'}</span>
            </button>
          </div>

          {/* Mobile Language Selector (Visible on Mobile Only) */}
          <div className="flex md:hidden items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setCurrentLang(lang.code)}
                className={`w-6.5 h-6.5 flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer ${
                  currentLang === lang.code ? 'bg-brand-blue text-brand-gold scale-105 shadow-sm' : 'opacity-65 hover:opacity-100'
                }`}
                title={lang.name}
              >
                {lang.flag}
              </button>
            ))}
          </div>

          {/* Header Right: Cart Indicator & Login */}
          <div className="flex items-center gap-2.5">
            {/* Cart Icon Web App Shortcut with Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="gourmet-bag-shortcut"
              className="relative p-2.5 bg-slate-100 hover:bg-amber-100/50 rounded-xl transition-all cursor-pointer group border border-slate-200/60"
            >
              <ShoppingBag className="w-5 h-5 text-brand-blue group-hover:text-amber-600 transition-colors" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Auth Button / Profile Badge */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* User Info Badge */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 pr-3 rounded-xl border border-slate-200/50">
                  <img 
                    src={currentUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.email}`} 
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-slate-200 bg-slate-200 shrink-0"
                  />
                  <span className="text-xs font-black text-slate-700 truncate max-w-[80px] hidden sm:inline-block">
                    {currentUser.name}
                  </span>
                </div>

                {isManager && (
                  <button
                    onClick={() => {
                      setActiveAppTab('admin');
                      setIsAdminConsoleVisible(true);
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeAppTab === 'admin'
                        ? 'bg-brand-blue text-brand-cream border-brand-blue'
                        : 'border-slate-200 hover:bg-slate-50 text-brand-blue'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="hidden md:inline">{t.adminPanel}</span>
                  </button>
                )}

                {isDeveloper && (
                  <button
                    onClick={() => setPreviewRole('Developer')}
                    className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:text-amber-700 border border-amber-400/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    title={currentLang === 'ar' ? 'الرجوع لبوابة المطور' : 'Back to Dev Portal'}
                  >
                    <span>🛠️</span>
                    <span className="hidden lg:inline">{currentLang === 'ar' ? 'بوابة المطور' : 'Dev Portal'}</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-brand-red hover:bg-brand-red/10 rounded-xl transition-all cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-2 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. MAIN APP LAYOUT (With sidebar navigation on desktop) */}
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row flex-grow px-4 py-6 md:py-8 gap-8 items-stretch overflow-hidden">
        
        {/* Desktop Left Sidebar (App Navigation) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm justify-between gap-6 self-start">
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono block mb-1">
                {currentLang === 'ar' ? 'التطبيق الفاخر' : 'Premium Web App'}
              </span>
              <h3 className="serif-heading text-lg font-extrabold text-brand-blue">
                French Touch
              </h3>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              <button
                onClick={() => { setActiveAppTab('dashboard'); setIsAdminConsoleVisible(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'dashboard'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-brand-gold" />
                <span>{currentLang === 'ar' ? 'لوحة التحكم الرئيسية' : 'Dashboard Hub'}</span>
              </button>

              <button
                onClick={() => { setActiveAppTab('menu'); setIsAdminConsoleVisible(false); }}
                id="tab-btn-menu"
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'menu'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Utensils className="w-4.5 h-4.5 text-brand-gold" />
                <span>{t.menu}</span>
              </button>

              <button
                onClick={() => { setActiveAppTab('reserve'); setIsAdminConsoleVisible(false); }}
                id="tab-btn-reserve"
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'reserve'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-4.5 h-4.5 text-brand-gold" />
                <span>{t.reserveTable}</span>
              </button>

              <button
                onClick={() => { setActiveAppTab('offers'); setIsAdminConsoleVisible(false); }}
                id="tab-btn-offers"
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'offers'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4.5 h-4.5 text-brand-gold" />
                <span>{t.offers}</span>
              </button>

              <button
                onClick={() => { setActiveAppTab('locations'); setIsAdminConsoleVisible(false); }}
                id="tab-btn-locations"
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'locations'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Map className="w-4.5 h-4.5 text-brand-gold" />
                <span>{t.branches}</span>
              </button>

              {isManager && (
                <button
                  onClick={() => { setActiveAppTab('admin'); setIsAdminConsoleVisible(true); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                    activeAppTab === 'admin'
                      ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                      : 'text-slate-600 hover:bg-slate-50 border border-emerald-500/10'
                  }`}
                >
                  <Lock className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="text-emerald-700">{t.adminPanel}</span>
                </button>
              )}
            </nav>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5">
            <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
              {currentLang === 'ar' ? 'بيانات التطبيق اللحظية' : 'App Real-time Telemetry'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl border border-slate-200/40">
                <p className="text-xs text-slate-400">{currentLang === 'ar' ? 'الأصناف' : 'Dishes'}</p>
                <p className="font-mono font-black text-sm text-brand-blue">{products.length}</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/40">
                <p className="text-xs text-slate-400">{currentLang === 'ar' ? 'الفروع' : 'Cities'}</p>
                <p className="font-mono font-black text-sm text-brand-blue">2</p>
              </div>
            </div>
            
            {/* Ambient French Quote */}
            <p className="text-[10px] text-slate-500 italic leading-normal text-center pt-1 border-t border-slate-200/50">
              {currentLang === 'ar' 
                ? '✦ "الطهي الجيد هو أساس السعادة الحقيقية"' 
                : '✦ "La bonne cuisine est la base du véritable bonheur."'}
            </p>
          </div>
        </aside>

        {/* Dynamic App Center Workspace View Panel */}
        <main className="flex-1 min-w-0 bg-white border border-slate-100 rounded-3xl shadow-sm p-4 md:p-8 flex flex-col justify-between overflow-y-auto">
          
          {/* Active Tab Component Render Wrapper */}
          <div className="space-y-8 flex-grow">
            
            {/* HEADER METADATA OR DYNAMIC GREETING IN HOME */}
            {activeAppTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Greeting banner card */}
                <div className="bg-gradient-to-r from-brand-blue to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
                  {/* Glowing absolute spheres */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="space-y-3 max-w-2xl relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] uppercase font-bold tracking-widest font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      L'Art de la Table Royale
                    </span>
                    
                    <h2 className="serif-heading text-3xl md:text-5xl font-extrabold text-white leading-tight">
                      {getGreeting()} 🥂
                    </h2>
                    
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-sans">
                      {currentLang === 'ar' 
                        ? 'أهلاً بك في منصتك الفاخرة للطهي الفرنسي الراقي. تصفح أشهى الأطباق والمسات الإيطالية الساحرة، واطلب طعامك أو احجز طاولتك فوراً.'
                        : 'Experience a sublime digital menu hub. Explore meticulously crafted French dishes infused with warm, subtle Italian hospitality.'}
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                      <button
                        onClick={() => setActiveAppTab('menu')}
                        className="px-4 py-2 bg-[#FDFBF7] text-brand-blue font-bold rounded-xl text-xs shadow-md hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        {t.viewMenuBtn}
                      </button>
                      <button
                        onClick={() => setActiveAppTab('reserve')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-brand-blue font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                      >
                        {t.reserveTable}
                      </button>
                    </div>
                  </div>
                  
                  {/* Tricolore Flag corner badge */}
                  <div className="absolute top-0 right-0 h-full w-2 flex flex-col opacity-80">
                    <div className="flex-1 bg-[#002395]"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-[#ED2939]"></div>
                  </div>
                </div>

                {/* Grid Bento Widgets Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  
                  {/* Widget 1: Live table reservation status */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                          {currentLang === 'ar' ? 'حالة طاولة العشاء' : 'Booking Desk'}
                        </span>
                        <h4 className="serif-heading text-lg font-black text-brand-blue">
                          {bookingReceipt ? (currentLang === 'ar' ? 'حجزك معتمد' : 'Reservation VIP') : (currentLang === 'ar' ? 'احجز طاولة الآن' : 'No Active Booking')}
                        </h4>
                      </div>
                      <span className={`p-2 rounded-xl text-xs font-mono font-bold ${bookingReceipt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {bookingReceipt ? 'OK' : 'FREE'}
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs leading-relaxed">
                      {bookingReceipt 
                        ? `${bookingReceipt.name} • ${bookingReceipt.guests} ${currentLang === 'ar' ? 'أفراد' : 'Guests'}`
                        : (currentLang === 'ar' ? 'احجز طاولتك مجاناً في أي من فروعنا الفاخرة بالقاهرة للحصول على مقعد مميز.' : 'Reserve a culinary experience slot for today and show your electronic receipt to the chef.')}
                    </p>

                    <button
                      onClick={() => setActiveAppTab('reserve')}
                      className="w-full py-2.5 bg-slate-200/80 hover:bg-slate-300/90 text-brand-blue font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {bookingReceipt ? (currentLang === 'ar' ? 'عرض التذكرة' : 'View Ticket Pass') : (currentLang === 'ar' ? 'افتح الحجز الفوري' : 'Open Reservation Portal')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Widget 2: Active Special Promo */}
                  <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-mono block">
                        {currentLang === 'ar' ? 'العروض الحصرية' : 'Exclusive Specials'}
                      </span>
                      <h4 className="serif-heading text-lg font-black text-amber-800">
                        {exclusiveOffer.title[currentLang] || exclusiveOffer.title.en}
                      </h4>
                    </div>

                    <p className="text-amber-900/70 text-xs leading-relaxed">
                      {exclusiveOffer.description[currentLang] || exclusiveOffer.description.en}
                    </p>

                    <button
                      onClick={() => setActiveAppTab('offers')}
                      className="w-full py-2.5 bg-amber-500 text-brand-blue font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>🎁</span>
                      <span>{currentLang === 'ar' ? 'عرض عداد الخصم' : 'Show Countdown'}</span>
                    </button>
                  </div>

                  {/* Widget 3: Operating Hours & Hotline app-widget */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                        {currentLang === 'ar' ? 'ساعات العمل والمساعدة' : 'Hours & Inquiries'}
                      </span>
                      <h4 className="serif-heading text-lg font-black text-brand-blue">
                        12:00 PM - 01:00 AM
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="font-mono font-bold">+20 104 468 6954</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-red" />
                        <span>Nasr City / New Cairo</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveAppTab('locations')}
                      className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ar' ? 'عرض الخرائط التفاعلية' : 'Find Nearest branch'}</span>
                    </button>
                  </div>

                </div>

                {/* Quick Culinary Feature Showcase */}
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                    <h3 className="serif-heading text-lg font-bold text-brand-blue">
                      {currentLang === 'ar' ? 'لمسة باريس الراقية مع الدفء الإيطالي' : 'Classic French Sophistication meets Warm Italy'}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-sans">
                    {t.aboutText}
                  </p>
                </div>

              </div>
            )}

            {/* THE MENU VIEW */}
            {activeAppTab === 'menu' && (
              <div className="space-y-8">
                <div>
                  <h2 className="serif-heading text-2xl md:text-3xl font-extrabold text-brand-blue">
                    {t.menu}
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">
                    {currentLang === 'ar' 
                      ? 'تصفح قائمة الطعام المنسقة يدويًا بواسطة كبار الطهاة الفرنسيين مع نكهات خفيفة ومثيرة للاهتمام.'
                      : 'Select from our premier French Gastronomy collection with beautiful subtle touches.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Menu Items Area (8 columns on huge screens) */}
                  <div className="xl:col-span-8 space-y-6">
                    <MenuSection
                      products={products}
                      currentLang={currentLang}
                      isManager={isManager}
                      onEditProduct={(p) => {
                        setActiveAppTab('admin');
                        setIsAdminConsoleVisible(true);
                        setEditingProduct(p);
                      }}
                      onDeleteProduct={handleDeleteProduct}
                      onAddProductClick={() => {
                        setActiveAppTab('admin');
                        setIsAdminConsoleVisible(true);
                        setEditingProduct({ 
                          id: 'new', 
                          name: { ar: '', en: '', fr: '', it: '' }, 
                          description: { ar: '', en: '', fr: '', it: '' }, 
                          price: 150, 
                          category: 'mains', 
                          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' 
                        });
                      }}
                      onAddToCart={handleAddToCart}
                      categories={categories}
                    />
                  </div>

                  {/* Sidebar Quick Cart Area inside App View (4 columns) */}
                  <div className="xl:col-span-4 bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4.5 h-4.5 text-brand-gold" />
                        <h3 className="serif-heading text-sm font-black text-brand-blue">
                          {currentLang === 'ar' ? 'سلتك الفرنسية' : 'Gourmet Selection Bag'}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                        {cartItemsCount}
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <span className="text-3xl">🍽️</span>
                        <p className="text-xs text-gray-400">
                          {currentLang === 'ar' ? 'سلة الطلبات فارغة، أضف بعض الأطباق الراقية لبدء التجربة.' : 'Your gourmet tray is empty. Add culinary delights!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          {cart.map((item) => (
                            <div key={item.product.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200/50">
                              <img 
                                src={item.product.image} 
                                alt="" 
                                className="w-10 h-10 rounded-lg object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-brand-blue truncate">
                                  {item.product.name[currentLang] || item.product.name.en}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-mono font-bold">
                                  {item.product.price} {t.currency}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-black font-mono w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleRemoveFromCart(item.product.id)}
                                  className="p-1 text-brand-red hover:bg-red-50 rounded cursor-pointer ml-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Calculation breakdown */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-200 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>{currentLang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                            <span className="font-mono">{cartSubtotal} {t.currency}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>{currentLang === 'ar' ? 'ضريبة القيمة المضافة (14%)' : 'VAT (14%)'}</span>
                            <span className="font-mono">{Math.round(cartSubtotal * 0.14)} {t.currency}</span>
                          </div>
                          <div className="flex justify-between text-brand-blue font-black border-t border-slate-100 pt-2 text-sm">
                            <span>{currentLang === 'ar' ? 'الإجمالي الفاخر' : 'Grand Total'}</span>
                            <span className="font-mono">{Math.round(cartSubtotal * 1.14)} {t.currency}</span>
                          </div>
                        </div>

                        {/* Order Bag action submit */}
                        <button
                          onClick={handleCartCheckout}
                          className="w-full py-3 bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>🥂</span>
                          <span>{currentLang === 'ar' ? 'إرسال طلب الطهي الفوري' : 'Submit Gourmand Order'}</span>
                        </button>
                      </div>
                    )}

                    {/* Order Output Receipts */}
                    {orderReceipt && (
                      <div className="p-4 bg-brand-blue text-white rounded-2xl relative overflow-hidden border border-brand-gold/30 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-2 right-2 text-brand-gold font-mono font-bold text-[9px]">
                          {orderReceipt.code}
                        </div>
                        <h4 className="font-serif font-black text-xs text-brand-gold uppercase flex items-center gap-1 border-b border-white/10 pb-1">
                          <span>⚜️</span> {currentLang === 'ar' ? 'فاتورة طلب الطهي' : 'Chef’s Kitchen Docket'}
                        </h4>
                        
                        <div className="space-y-1 text-[10px] font-mono opacity-95">
                          {orderReceipt.items.map((item: any) => (
                            <div key={item.product.id} className="flex justify-between">
                              <span className="truncate max-w-[140px]">{item.product.name[currentLang] || item.product.name.en} (x{item.quantity})</span>
                              <span>{item.product.price * item.quantity} {t.currency}</span>
                            </div>
                          ))}
                          <div className="border-t border-white/10 my-1 pt-1 flex justify-between font-bold text-brand-gold">
                            <span>Total (VAT incl.)</span>
                            <span>{orderReceipt.total} {t.currency}</span>
                          </div>
                          <p className="text-[9px] text-slate-300 mt-2 text-center italic">
                            {currentLang === 'ar' ? 'أُرسل للمطبخ للتجهيز فوراً.' : 'Sent directly to Cairo kitchens.'}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )}

            {/* RESERVATION VIEW */}
            {activeAppTab === 'reserve' && (
              <div className="space-y-8">
                <div>
                  <h2 className="serif-heading text-2xl md:text-3xl font-extrabold text-brand-blue">
                    {t.reserveTable}
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">
                    {currentLang === 'ar' 
                      ? 'احجز مقعدك الفخم لتناول العشاء في أي فرع من فروع القاهرة بخطوات فورية وتذكرة سفر معتمدة.'
                      : 'Book your luxury seat directly in our Cairo branches and obtain your instant VIP ticket.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Explanation card */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                      <span className="inline-flex items-center gap-1.5 bg-brand-blue/5 text-brand-blue font-bold px-3 py-1 rounded-full text-[10px] uppercase">
                        <Ticket className="w-3.5 h-3.5 text-brand-gold" />
                        {currentLang === 'ar' ? 'حجوزات فورية معتمدة' : 'Instant Web Pass'}
                      </span>
                      <h3 className="serif-heading text-xl font-bold text-brand-blue">
                        {currentLang === 'ar' ? 'آلية الحجز الرقمية' : 'Digital Seating Ticket'}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {currentLang === 'ar' 
                          ? 'بمجرد ملء الاستمارة بالمعلومات المطلوبة، يقوم نظام المطعم بحجز الطاولة الخاصة بك فورياً وإصدار تذكرة سفر إلكترونية رسمية لتظهرها للمضيف عند الوصول.'
                          : 'Upon submitting the form, your table is automatically blocked in the chosen lounge. A digital travel docket ticket will be generated instantly.'}
                      </p>
                    </div>

                    {/* Confirmed Ticket Pass */}
                    {bookingReceipt && (
                      <div className="p-5 bg-amber-500/5 border-2 border-dashed border-amber-400/50 rounded-2xl relative overflow-hidden space-y-4 animate-in fade-in duration-300">
                        <div className="absolute top-2 right-2 text-brand-blue font-mono font-bold text-[10px]">
                          # {bookingReceipt.code}
                        </div>
                        
                        <h4 className="font-bold text-xs text-brand-blue uppercase font-mono border-b border-brand-gold/20 pb-1 flex items-center gap-1">
                          <span>🎟️</span> {currentLang === 'ar' ? 'تذكرة حجز معتمدة' : 'Confirmed Table Receipt'}
                        </h4>

                        <div className="space-y-1.5 text-xs">
                          <p><span className="text-gray-500 font-semibold">{currentLang === 'ar' ? 'الاسم' : 'Name'}:</span> <span className="font-bold text-brand-blue">{bookingReceipt.name}</span></p>
                          <p><span className="text-gray-500 font-semibold">{currentLang === 'ar' ? 'الهاتف' : 'Phone'}:</span> <span className="font-mono">{bookingReceipt.phone}</span></p>
                          <p><span className="text-gray-500 font-semibold">{currentLang === 'ar' ? 'الفرع' : 'Branch'}:</span> <span className="font-bold">{bookingReceipt.branch}</span></p>
                          <p><span className="text-gray-500 font-semibold">{currentLang === 'ar' ? 'عدد الأفراد' : 'Guests'}:</span> <span className="font-bold font-mono">{bookingReceipt.guests}</span></p>
                          <p><span className="text-gray-500 font-semibold">{currentLang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}:</span> <span className="font-mono font-bold text-brand-red">{bookingReceipt.date} @ {bookingReceipt.time}</span></p>
                        </div>

                        <div className="bg-brand-blue text-brand-cream p-2.5 rounded-xl text-center text-[10px] font-semibold">
                          {currentLang === 'ar' ? 'يرجى تقديم التذكرة للمضيف عند الوصول.' : 'Show this ticket to the host upon arrival.'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking Form Area */}
                  <form onSubmit={handleBookingSubmit} className="lg:col-span-7 space-y-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-blue mb-1.5">{currentLang === 'ar' ? 'اختر الفرع' : 'Select Branch'}</label>
                        <select
                          value={bookingBranch}
                          onChange={(e) => setBookingBranch(e.target.value as 'medical' | 'waha')}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-brand-blue cursor-pointer"
                        >
                          <option value="medical">{t.medicalBranch}</option>
                          <option value="waha">{t.wahaBranch}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-blue mb-1.5">{currentLang === 'ar' ? 'عدد الأفراد' : 'Guests Count'}</label>
                        <select
                          value={bookingGuests}
                          onChange={(e) => setBookingGuests(Number(e.target.value))}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-brand-blue font-mono cursor-pointer"
                        >
                          <option value="2">2 People (Couple) 👩‍❤️‍👨</option>
                          <option value="4">4 People (Family) 👨‍👩‍👧‍👦</option>
                          <option value="6">6 People (Gourmet group) 🥂</option>
                          <option value="10">10 People (Royal Gathering) 👑</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-blue mb-1.5">{currentLang === 'ar' ? 'التاريخ المفضّل' : 'Select Date'}</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          required
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-blue mb-1.5">{currentLang === 'ar' ? 'الوقت المفضّل' : 'Select Time'}</label>
                        <input
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          required
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-blue mb-1.5">{currentLang === 'ar' ? 'اسم صاحب الحجز' : 'Your Full Name'}</label>
                        <input
                          type="text"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="Pierre Marc"
                          required
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-blue mb-1.5">{currentLang === 'ar' ? 'رقم الهاتف للتأكيد' : 'Phone Number'}</label>
                        <input
                          type="tel"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="+20 1..."
                          required
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <span>✅</span> {currentLang === 'ar' ? 'تأكيد وحجز الطاولة فوراً' : 'Confirm & Print Reservation Voucher'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* OFFERS VIEW */}
            {activeAppTab === 'offers' && (
              <div className="space-y-8">
                <div>
                  <h2 className="serif-heading text-2xl md:text-3xl font-extrabold text-brand-blue">
                    {t.offers}
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">
                    {t.exclusiveBannerTitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                  {/* Exclusive Countdown Banner */}
                  <div className="xl:col-span-8 flex flex-col">
                    <ExclusiveOfferBanner
                      offer={exclusiveOffer}
                      currentLang={currentLang}
                      isManager={isManager}
                      onEditOfferClick={() => {
                        setActiveAppTab('admin');
                        setIsAdminConsoleVisible(true);
                        setAdminActiveTab('offers');
                      }}
                    />
                  </div>

                  {/* Today's Weekly Offer */}
                  <div className="xl:col-span-4 bg-brand-gold/10 border border-brand-gold/20 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-1.5 bg-brand-blue text-brand-cream font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-brand-gold" />
                        {t.todayRecurringOffer}
                      </span>

                      {todaysWeeklyOffer && todaysWeeklyOffer.active ? (
                        <div className="space-y-3">
                          <h3 className="serif-heading text-2xl font-black text-brand-blue">
                            {todaysWeeklyOffer.title[currentLang] || todaysWeeklyOffer.title.en}
                          </h3>
                          <div className="text-xs font-bold text-brand-red font-mono uppercase bg-white px-3 py-1.5 rounded-lg inline-block border border-brand-red/10">
                            🎁 DISCOUNT: {todaysWeeklyOffer.discount}
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            {todaysWeeklyOffer.description[currentLang] || todaysWeeklyOffer.description.en}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">{t.noOfferToday}</p>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-brand-gold/20 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <span>{t.weeklyOffer}</span>
                      <span className="text-brand-blue font-mono">
                        {t.weeklyRecurringDay.replace('{day}', t.days[currentDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOCATIONS VIEW */}
            {activeAppTab === 'locations' && (
              <div className="space-y-8">
                <div>
                  <h2 className="serif-heading text-2xl md:text-3xl font-extrabold text-brand-blue">
                    {t.branches}
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">
                    {currentLang === 'ar' ? 'حدد موقعنا الجغرافي بالقاهرة واحصل على اتجاهات الخرائط فورياً.' : 'Locate our high-end chefs and view real-time maps.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-sm overflow-hidden">
                  <InteractiveMap currentLang={currentLang} />
                </div>
              </div>
            )}

            {/* ADMIN HUB VIEW */}
            {activeAppTab === 'admin' && isManager && (
              <div className="space-y-6">
                <div>
                  <h2 className="serif-heading text-2xl md:text-3xl font-extrabold text-brand-blue">
                    {t.adminPanel}
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">
                    {currentLang === 'ar' ? 'أنت مسجل كمشرف رسمي، قم بتعديل القائمة والأسعار والعروض اللحظية هنا.' : 'Authenticated manager workspace settings panel.'}
                  </p>
                </div>

                <div className="animate-in slide-in-from-top-4 duration-300">
                  <AdminManagerConsole
                    currentLang={currentLang}
                    currentUserEmail={currentUser.email}
                    isSuperAdmin={isSuperAdmin}
                    isManager={isManager}
                    managers={managers}
                    products={products}
                    exclusiveOffer={exclusiveOffer}
                    weeklyOffers={weeklyOffers}
                    activeTab={adminActiveTab}
                    setActiveTab={setAdminActiveTab}
                    onAddManager={handleAddManager}
                    onRemoveManager={handleRemoveManager}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onSaveExclusiveOffer={handleSaveExclusiveOffer}
                    onSaveWeeklyOffers={handleSaveWeeklyOffers}
                    onLogout={handleLogout}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                </div>
              </div>
            )}

          </div>

          {/* DYNAMIC BACKEND OVERVIEW FOOTNOTE */}
          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-mono">
            <p>© 2026 French Touch. Cairo Culinary Web Application.</p>
            <div className="flex gap-3">
              <span>Paris</span>
              <span className="text-brand-gold">•</span>
              <span>Cairo</span>
            </div>
            <p className="font-semibold text-brand-blue">V6 Application Standard</p>
          </div>

        </main>

      </div>

      {/* 4. FLOATING GOURMET BAG FULL DRAWER OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="gourmet-bag-drawer">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsCartOpen(false)}></div>
          
          <div className={`absolute inset-y-0 ${currentLangDir === 'rtl' ? 'left-0' : 'right-0'} max-w-md w-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-slate-100 z-50 animate-in slide-in-from-${currentLangDir === 'rtl' ? 'left' : 'right'} duration-300`}>
            
            <div className="space-y-6 flex-grow overflow-y-auto">
              {/* Drawer Title Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" />
                  <h3 className="serif-heading text-lg font-black text-brand-blue">
                    {currentLang === 'ar' ? 'سلة المأكولات الفاخرة' : 'Gourmet Selection'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 font-mono text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <span className="text-5xl block animate-pulse">🍽️</span>
                  <p className="text-sm font-semibold text-slate-400">
                    {currentLang === 'ar' ? 'السلة فارغة حالياً' : 'Your gourmet tray is empty'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {currentLang === 'ar' ? 'تصفح قائمة الطعام في التطبيق وأضف خياراتك للحصول على طلب لذيذ!' : 'Add standard signature entrees, mains or drinks.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const addonsCost = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
                    const saucesCost = item.selectedSauces?.reduce((s, sd) => s + sd.price, 0) || 0;
                    const singlePrice = item.product.price + addonsCost + saucesCost;

                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/40">
                        <img 
                          src={item.product.image} 
                          alt="" 
                          className="w-12 h-12 rounded-xl object-cover mt-0.5" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 text-start">
                          <h4 className="text-xs font-extrabold text-brand-blue truncate">
                            {item.product.name[currentLang] || item.product.name.en}
                          </h4>
                          
                          {/* Selected Customizations list */}
                          {((item.selectedAddons && item.selectedAddons.length > 0) || 
                            (item.selectedSauces && item.selectedSauces.length > 0)) && (
                            <div className="text-[9px] text-slate-500 leading-tight space-y-0.5 mt-1 font-sans">
                              {item.selectedAddons?.map((a) => (
                                <div key={a.id} className="text-slate-500 flex justify-between">
                                  <span>• {a.name[currentLang] || a.name.en}</span>
                                </div>
                              ))}
                              {item.selectedSauces?.map((s) => (
                                <div key={s.id} className="text-slate-500 flex justify-between">
                                  <span>• {s.name[currentLang] || s.name.en}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-[10px] text-brand-gold font-bold font-mono mt-1">
                            {singlePrice} {t.currency}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 self-center">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1 hover:bg-white rounded border border-slate-200 text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black font-mono w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1 hover:bg-white rounded border border-slate-200 text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-1 text-brand-red hover:bg-red-50 rounded cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>{currentLang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-mono font-bold">{cartSubtotal} {t.currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{currentLang === 'ar' ? 'ضريبة القيمة المضافة (14%)' : 'VAT (14%)'}</span>
                    <span className="font-mono font-bold">{Math.round(cartSubtotal * 0.14)} {t.currency}</span>
                  </div>
                  <div className="flex justify-between text-brand-blue font-black border-t border-slate-100 pt-3 text-sm">
                    <span>{currentLang === 'ar' ? 'المجموع الكلي الفاخر' : 'Grand Total'}</span>
                    <span className="font-mono text-lg text-amber-600">{Math.round(cartSubtotal * 1.14)} {t.currency}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleCartCheckout();
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-black rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🥂</span>
                  <span>{currentLang === 'ar' ? 'تأكيد طلب الطعام' : 'Checkout & Generate Receipt'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. RESPONSIVE MOBILE APP BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex justify-around py-2 shrink-0">
        <button
          onClick={() => { setActiveAppTab('dashboard'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'dashboard' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeAppTab === 'dashboard' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>

        <button
          onClick={() => { setActiveAppTab('menu'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'menu' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <Utensils className={`w-5 h-5 ${activeAppTab === 'menu' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'القائمة' : 'Menu'}</span>
        </button>

        <button
          onClick={() => { setActiveAppTab('reserve'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'reserve' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <Ticket className={`w-5 h-5 ${activeAppTab === 'reserve' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'الحجز' : 'Reserve'}</span>
        </button>

        <button
          onClick={() => { setActiveAppTab('offers'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'offers' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeAppTab === 'offers' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'العروض' : 'Offers'}</span>
        </button>

        <button
          onClick={() => { setActiveAppTab('locations'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'locations' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <Map className={`w-5 h-5 ${activeAppTab === 'locations' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'الفروع' : 'Branches'}</span>
        </button>
      </div>

      {/* AUTHENTICATION MODAL */}
      <LoginModal
        currentLang={currentLang}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        managers={managers}
        onLoginSuccess={(email, name) => {
          handleLoginSuccess({ 
            email, 
            name, 
            role: email.toLowerCase() === 'oren.on.oren.25@gmail.com' ? 'Developer' : 'Manager' 
          });
        }}
      />

      {/* PRODUCT CUSTOMIZER MODAL */}
      <ProductCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        product={customizerProduct}
        currentLang={currentLang}
        onConfirm={handleCustomizerConfirm}
      />

      {/* FLOATING DEVELOPER QUICK SWITCHER HELPER */}
      {isDeveloper && previewRole !== 'Developer' && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 animate-bounce">
          <button
            onClick={() => setPreviewRole('Developer')}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4.5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border border-amber-300 cursor-pointer"
          >
            <span className="text-sm">🛠️</span>
            <span className="text-xs font-black uppercase tracking-wider">
              {currentLang === 'ar' ? 'العودة لبوابة المطور' : 'Back to Developer Portal'}
            </span>
          </button>
        </div>
      )}

    </div>
  );
}
