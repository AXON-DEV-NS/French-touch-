import React, { useState, useEffect } from 'react';
import { 
  Globe, User, LogOut, Lock, Calendar, MapPin, 
  Clock, Phone, Sparkles, Compass, Eye, ShieldAlert, CheckCircle2, Ticket,
  ShoppingBag, Plus, Minus, Trash2, LayoutDashboard, Utensils, Map,
  ChevronRight, ArrowRight, Star, Heart, MessageSquare
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
import PortalLogin from './components/PortalLogin';
import SubscriptionModal from './components/SubscriptionModal';
import RestaurantLogo from './components/RestaurantLogo';
import LanguageLandingScreen from './components/LanguageLandingScreen';
import GoogleLoginScreen from './components/GoogleLoginScreen';
import DeveloperConsole from './components/DeveloperConsole';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import ReviewsDiscussion from './components/ReviewsDiscussion';
import AICopilotConsole from './components/AICopilotConsole';
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

import { compressImage } from './utils/imageCompressor';

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => {
            if (p.category === 'appetizers' || p.category === 'mains') {
              return { ...p, category: p.category === 'appetizers' ? 'fries' : 'sandwiches' };
            }
            return p;
          });
        }
      } catch (e) {
        console.warn("Failed to parse cached products", e);
      }
    }
    return INITIAL_PRODUCTS;
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
      { id: "sandwiches", name: { ar: "السندوتشات الفاخرة", en: "Gourmet Sandwiches", fr: "Sandwiches Fins", it: "Panini Gourmet" }, icon: "ChefHat" },
      { id: "fries", name: { ar: "بطاطس فرنش تاتش", en: "French Touch Fries", fr: "Frites Croustillantes", it: "Patatine Croccanti" }, icon: "Sparkles" },
      { id: "desserts", name: { ar: "الحلويات اللذيذة", en: "Delicious Desserts", fr: "Desserts Fins", it: "Dolci Deliziosi" }, icon: "Cake" },
      { id: "drinks", name: { ar: "المشروبات المنعشة", en: "Refreshing Drinks", fr: "Boissons", it: "Bevande" }, icon: "GlassWater" }
    ];
  });

  // --- Current Signed in User State ---
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; picture?: string; role: 'Developer' | 'Manager' | 'Customer'; lang?: Language } | null>(() => {
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

  // Synchronize language for managers and prevent changes
  useEffect(() => {
    if (currentUser?.role === 'Manager' && currentUser?.lang) {
      setCurrentLang(currentUser.lang);
      safeStorage.setItem('frenchtouch_lang', currentUser.lang);
    }
  }, [currentUser]);

  // Save previewRole to sessionStorage
  useEffect(() => {
    safeSessionStorage.setItem('frenchtouch_preview_role', previewRole);
  }, [previewRole]);

  // --- App-style Navigation State ---
  const [activeAppTab, setActiveAppTab] = useState<'dashboard' | 'menu' | 'reserve' | 'offers' | 'locations' | 'admin' | 'account' | 'reviews'>('menu');

  // --- Interactive Simulated Order Bag/Cart State ---
  const [cart, setCart] = useState<{ id: string; product: Product; quantity: number; selectedAddons?: CustomizeOption[]; selectedSauces?: CustomizeOption[] }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);

  // --- Customizer Modal State ---
  const [customizerProduct, setCustomizerProduct] = useState<Product | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // --- UI Controls ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSecretPortal, setIsSecretPortal] = useState(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    return path === "/french-touch-2572010-yg";
  });

  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
      setIsSecretPortal(path === "/french-touch-2572010-yg");
    };
    window.addEventListener('popstate', handleLocationCheck);
    return () => window.removeEventListener('popstate', handleLocationCheck);
  }, []);
  const [isAdminConsoleVisible, setIsAdminConsoleVisible] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'products' | 'offers' | 'super' | 'copilot' | 'reviews'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Customer Registration State ---
  const [regFirstName, setRegFirstName] = useState('');
  const [regSecondName, setRegSecondName] = useState('');
  const [regThirdName, setRegThirdName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAltPhone, setRegAltPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPicture, setRegPicture] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  
  // 2FA Verification Flow
  const [verificationFlow, setVerificationFlow] = useState<{
    active: boolean;
    step: 'email' | 'phone';
    sessionId: string;
    email: string;
    phone: string;
    otpInput: string;
  }>({ active: false, step: 'email', sessionId: '', email: '', phone: '', otpInput: '' });

  // Existing Customer Login / Account Retrieval State
  const [authFormTab, setAuthFormTab] = useState<'register' | 'login'>('register');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Helper to validate Egyptian Mobile Phone Format
  const checkEgyptianPhone = (num: string): boolean => {
    let cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("20") && cleaned.length === 12) {
      cleaned = "0" + cleaned.substring(2);
    } else if (cleaned.startsWith("0020") && cleaned.length === 14) {
      cleaned = "0" + cleaned.substring(4);
    } else if (cleaned.length === 10 && (cleaned.startsWith("10") || cleaned.startsWith("11") || cleaned.startsWith("12") || cleaned.startsWith("15"))) {
      cleaned = "0" + cleaned;
    }
    return /^01[0125]\d{8}$/.test(cleaned);
  };

  // --- New Checkout Flow States ---
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [isCheckoutDetailsOpen, setIsCheckoutDetailsOpen] = useState(false);
  const [checkoutBranch, setCheckoutBranch] = useState<'medical' | 'waha'>('medical');
  const [checkoutDiningType, setCheckoutDiningType] = useState<'takeaway' | 'dinein'>('takeaway');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [checkoutTime, setCheckoutTime] = useState('');
  const [checkoutRulesAccepted, setCheckoutRulesAccepted] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<number | null>(null);

  // --- Secret Portal Logic ---
  const handleLogoClick = () => {
    setActiveAppTab('menu');
  };

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

  // --- Fetch Unique Order Number Effect ---
  useEffect(() => {
    const fetchOrderNum = async () => {
      if (isCheckoutDetailsOpen && currentUser && !currentOrderNumber) {
        try {
          const res = await fetch("/api/orders/next-number", { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            setCurrentOrderNumber(data.orderNumber);
          } else {
            setCurrentOrderNumber(Math.floor(Date.now() / 1000) - 1770000000);
          }
        } catch (err) {
          setCurrentOrderNumber(Math.floor(Date.now() / 1000) - 1770000000);
        }
      }
    };
    fetchOrderNum();
  }, [isCheckoutDetailsOpen, currentUser, currentOrderNumber]);

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

  // Fetch authorized managers from server-side database
  useEffect(() => {
    if (currentUser?.role !== 'Developer') return;

    fetch('/api/managers', {
      headers: {
        'x-user-email': currentUser.email,
        'x-user-role': currentUser.role
      }
    })
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
          setManagers(data);
        }
      })
      .catch(err => console.warn('Failed to fetch managers from server:', err));
  }, [currentUser]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_products', JSON.stringify(products));
    safeStorage.setItem('frenchtouch_products_backup', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_exclusive', JSON.stringify(exclusiveOffer));
    safeStorage.setItem('frenchtouch_exclusive_backup', JSON.stringify(exclusiveOffer));
  }, [exclusiveOffer]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_weekly', JSON.stringify(weeklyOffers));
    safeStorage.setItem('frenchtouch_weekly_backup', JSON.stringify(weeklyOffers));
  }, [weeklyOffers]);

  useEffect(() => {
    safeStorage.setItem('frenchtouch_managers', JSON.stringify(managers));
    safeStorage.setItem('frenchtouch_managers_backup', JSON.stringify(managers));
  }, [managers]);

  // Load products and offers from server-side database on startup
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          safeStorage.setItem('frenchtouch_products_backup', JSON.stringify(data));
        } else {
          // If server was empty, try to populate from our active products to seed the server
          const activeProducts = products;
          if (activeProducts && activeProducts.length > 0 && currentUser && (currentUser.role === 'Manager' || currentUser.role === 'Developer')) {
            fetch('/api/products/bulk-sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-email': currentUser.email,
                'x-user-role': currentUser.role
              },
              body: JSON.stringify({ products: activeProducts })
            }).catch(e => console.warn('Failed auto-seeding products on server:', e));
          }
        }
      })
      .catch(err => console.warn('Failed to fetch products from server:', err));

    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.exclusiveOffer) {
            setExclusiveOffer(data.exclusiveOffer);
            safeStorage.setItem('frenchtouch_exclusive_backup', JSON.stringify(data.exclusiveOffer));
          }
          if (Array.isArray(data.weeklyOffers) && data.weeklyOffers.length > 0) {
            setWeeklyOffers(data.weeklyOffers);
            safeStorage.setItem('frenchtouch_weekly_backup', JSON.stringify(data.weeklyOffers));
          }
        }
      })
      .catch(err => console.warn('Failed to fetch offers from server:', err));
  }, []);

  // Self-Healing Sync Engine: Automatically restore products, categories, registered customers and settings if server resets
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'Manager' && currentUser.role !== 'Developer')) return;

    const performDatabaseCheckAndRestore = async () => {
      try {
        // Fetch server products
        const productsRes = await fetch('/api/products');
        const serverProducts = await productsRes.json();

        // Fetch server categories
        const categoriesRes = await fetch('/api/categories');
        const serverCategories = await categoriesRes.json();

        // Fetch server registered customers
        const customersRes = await fetch('/api/registered-customers', {
          headers: {
            'x-user-email': currentUser.email,
            'x-user-role': currentUser.role
          }
        });
        const serverCustomers = await customersRes.json();

        const localProductsSaved = safeStorage.getItem('frenchtouch_products_backup') || safeStorage.getItem('frenchtouch_products');
        const localCategoriesSaved = safeStorage.getItem('frenchtouch_categories_backup');
        const localCustomersSaved = safeStorage.getItem('frenchtouch_customers_backup');
        const localManagersSaved = safeStorage.getItem('frenchtouch_managers_backup') || safeStorage.getItem('frenchtouch_managers');
        const localWeeklyOffersSaved = safeStorage.getItem('frenchtouch_weekly_backup') || safeStorage.getItem('frenchtouch_weekly');
        const localExclusiveOfferSaved = safeStorage.getItem('frenchtouch_exclusive_backup') || safeStorage.getItem('frenchtouch_exclusive');

        let restorePayload: any = {};
        let needsRestore = false;

        if ((!Array.isArray(serverProducts) || serverProducts.length === 0) && localProductsSaved) {
          const parsed = JSON.parse(localProductsSaved);
          if (parsed && parsed.length > 0) {
            restorePayload.products = parsed;
            needsRestore = true;
          }
        }

        if ((!Array.isArray(serverCategories) || serverCategories.length <= 4) && localCategoriesSaved) {
          const parsed = JSON.parse(localCategoriesSaved);
          if (parsed && parsed.length > 4) {
            restorePayload.categories = parsed;
            needsRestore = true;
          }
        }

        if ((!Array.isArray(serverCustomers) || serverCustomers.length === 0) && localCustomersSaved) {
          const parsed = JSON.parse(localCustomersSaved);
          if (parsed && parsed.length > 0) {
            restorePayload.registeredCustomers = parsed;
            needsRestore = true;
          }
        }

        if (needsRestore) {
          console.log("Auto-Restore Engine: Server reset or update detected. Restoring data from browser backup...");

          const restoreRes = await fetch('/api/db/sync-restore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': currentUser.email,
              'x-user-role': currentUser.role
            },
            body: JSON.stringify(restorePayload)
          });

          if (restoreRes.ok) {
            console.log("Auto-Restore Engine: Data restored successfully!");
            if (restorePayload.products) setProducts(restorePayload.products);
            if (restorePayload.categories) setCategories(restorePayload.categories);

            alert(currentLang === 'ar'
              ? "🔄 نظام المزامنة الفرنسي الذكي: تم الكشف عن تحديث للنظام أو إعادة تعيين الاستضافة. تم استعادة جميع المنتجات، الأقسام، والحسابات المحفوظة من متصفحك تلقائياً دون أي فقدان للبيانات!"
              : "🔄 Gourmet Smart Sync System: Server update or hosting reset detected. Restored all saved products, categories, and accounts from your browser backup instantly!"
            );
          }
        } else {
          // Live server has valid data, back them up in local storage to keep sync updated!
          if (Array.isArray(serverProducts) && serverProducts.length > 0) {
            safeStorage.setItem('frenchtouch_products_backup', JSON.stringify(serverProducts));
          }
          if (Array.isArray(serverCategories) && serverCategories.length > 0) {
            safeStorage.setItem('frenchtouch_categories_backup', JSON.stringify(serverCategories));
          }
          if (Array.isArray(serverCustomers) && serverCustomers.length > 0) {
            safeStorage.setItem('frenchtouch_customers_backup', JSON.stringify(serverCustomers));
          }
        }
      } catch (e) {
        console.warn("Auto-Restore Engine error:", e);
      }
    };

    const timer = setTimeout(() => {
      performDatabaseCheckAndRestore();
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentUser]);

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

  // --- Auth Checks (Strict Isolation of Roles) ---
  const isDeveloper = currentUser?.role === 'Developer';
  const isManager = currentUser?.role === 'Manager';
  const isSuperAdmin = currentUser?.role === 'Developer';
  const activeRole = currentUser?.role || 'Customer';

  const handleLoginSuccess = (user: { email: string; name: string; picture?: string; role: 'Developer' | 'Manager' | 'Customer'; lang?: Language }) => {
    setCurrentUser(user);
    if (user.role === 'Developer') {
      setPreviewRole('Developer');
    } else if (user.role === 'Manager') {
      setActiveAppTab('admin');
      setIsAdminConsoleVisible(true);
      if (user.lang) {
        setCurrentLang(user.lang);
        safeStorage.setItem('frenchtouch_lang', user.lang);
      }
    } else {
      setIsAdminConsoleVisible(false);
      if (pendingCheckout) {
        setActiveAppTab('menu');
        setIsCartOpen(true);
        setIsCheckoutDetailsOpen(true);
        setPendingCheckout(false);
      } else {
        setActiveAppTab('menu');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPreviewRole('Developer');
    setIsAdminConsoleVisible(false);
    setActiveAppTab('menu');
    setIsSecretPortal(false);
    window.history.pushState({}, '', '/');
  };

  // --- Action Handlers ---
  const handleAddManager = async (email: string, name: string, password?: string, lang?: Language) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const cleanPassword = password?.trim() || '123';
    const cleanLang = lang || 'ar';
    if (managers.some(m => m.email.toLowerCase() === cleanEmail)) {
      alert(currentLang === 'ar' ? "هذا المدير مضاف بالفعل في النظام." : "This manager is already authorized.");
      return;
    }
    try {
      const res = await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: cleanName, password: cleanPassword, lang: cleanLang })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add manager');
      }
      if (Array.isArray(data.managers)) {
        setManagers(data.managers);
      }
    } catch (err: any) {
      alert(err.message || "Failed to add manager on the server.");
    }
  };

  const handleRemoveManager = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'oren.on.oren.25@gmail.com') return;
    try {
      const res = await fetch(`/api/managers/${encodeURIComponent(cleanEmail)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove manager');
      }
      if (Array.isArray(data.managers)) {
        setManagers(data.managers);
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove manager on the server.");
    }
  };

  const handleDatabaseMutated = (updatedData: {
    products?: any[];
    exclusiveOffer?: any;
    weeklyOffers?: any[];
  }) => {
    if (updatedData.products) {
      setProducts(updatedData.products);
      safeStorage.setItem('frenchtouch_products', JSON.stringify(updatedData.products));
      safeStorage.setItem('frenchtouch_products_backup', JSON.stringify(updatedData.products));
    }
    if (updatedData.exclusiveOffer) {
      setExclusiveOffer(updatedData.exclusiveOffer);
      safeStorage.setItem('frenchtouch_exclusive', JSON.stringify(updatedData.exclusiveOffer));
      safeStorage.setItem('frenchtouch_exclusive_backup', JSON.stringify(updatedData.exclusiveOffer));
    }
    if (updatedData.weeklyOffers) {
      setWeeklyOffers(updatedData.weeklyOffers);
      safeStorage.setItem('frenchtouch_weekly', JSON.stringify(updatedData.weeklyOffers));
      safeStorage.setItem('frenchtouch_weekly_backup', JSON.stringify(updatedData.weeklyOffers));
    }
  };

  const handleSaveProduct = async (product: Product) => {
    const exists = products.some(p => p.id === product.id);
    let newProducts = [];
    if (exists) {
      newProducts = products.map(p => p.id === product.id ? product : p);
    } else {
      newProducts = [product, ...products];
    }
    setProducts(newProducts);
    safeStorage.setItem('frenchtouch_products_backup', JSON.stringify(newProducts));

    if (currentUser?.role === 'Manager' || currentUser?.role === 'Developer') {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
            'x-user-role': currentUser.role
          },
          body: JSON.stringify(product)
        });
      } catch (err) {
        console.warn('Failed to save product on server:', err);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    setCart(cart.filter(item => item.product.id !== id));
    safeStorage.setItem('frenchtouch_products_backup', JSON.stringify(newProducts));

    if (currentUser?.role === 'Manager' || currentUser?.role === 'Developer') {
      try {
        await fetch(`/api/products/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
            'x-user-email': currentUser.email,
            'x-user-role': currentUser.role
          }
        });
      } catch (err) {
        console.warn('Failed to delete product from server:', err);
      }
    }
  };

  const handleDeleteAllProducts = async () => {
    setProducts([]);
    setCart([]);
    safeStorage.setItem('frenchtouch_products_backup', JSON.stringify([]));

    if (currentUser?.role === 'Manager' || currentUser?.role === 'Developer') {
      try {
        await fetch('/api/products/delete-all', {
          method: 'POST',
          headers: {
            'x-user-email': currentUser.email,
            'x-user-role': currentUser.role
          }
        });
      } catch (err) {
        console.warn('Failed to delete all products on server:', err);
      }
    }
  };

  const handleAddCategory = async (id: string, name: any, icon?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || '',
          'x-user-role': currentUser?.role || ''
        },
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
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser?.email || '',
          'x-user-role': currentUser?.role || ''
        }
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

  const handleUpdateCategory = async (id: string, name: any, icon?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || '',
          'x-user-role': currentUser?.role || ''
        },
        body: JSON.stringify({ name, icon })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update category');
      setCategories(data.categories);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleSaveExclusiveOffer = async (offer: ExclusiveOffer) => {
    setExclusiveOffer(offer);
    safeStorage.setItem('frenchtouch_exclusive_backup', JSON.stringify(offer));

    if (currentUser?.role === 'Manager' || currentUser?.role === 'Developer') {
      try {
        await fetch('/api/offers/exclusive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
            'x-user-role': currentUser.role
          },
          body: JSON.stringify(offer)
        });
      } catch (err) {
        console.warn('Failed to save exclusive offer to server:', err);
      }
    }
  };

  const handleSaveWeeklyOffers = async (offers: WeeklyOffer[]) => {
    setWeeklyOffers(offers);
    safeStorage.setItem('frenchtouch_weekly_backup', JSON.stringify(offers));

    if (currentUser?.role === 'Manager' || currentUser?.role === 'Developer') {
      try {
        await fetch('/api/offers/weekly', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
            'x-user-role': currentUser.role
          },
          body: JSON.stringify({ weeklyOffers: offers })
        });
      } catch (err) {
        console.warn('Failed to save weekly offers to server:', err);
      }
    }
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

  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    
    // Check if customer is registered/logged in
    if (!currentUser) {
      setPendingCheckout(true);
      alert(currentLang === 'ar' 
        ? '⚠️ عذراً! يجب عليك تسجيل حساب عميل فخم أولاً في الموقع لإتمام طلب الطعام وإرساله للواتساب.\n\nسيقوم الموقع الآن بنقلك إلى صفحة التسجيل فوراً، وستبقى وجباتك محفوظة في السلة لتكمل الطلب تلقائياً بعد التسجيل!' 
        : '⚠️ Sorry! You must register/login to a gourmet account first to finalize your food order and send it to WhatsApp.\n\nYou will now be redirected to the Registration page, and your cart items will be saved!'
      );
      setActiveAppTab('account');
      return;
    }

    // Fetch unique order number
    try {
      const res = await fetch("/api/orders/next-number", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCurrentOrderNumber(data.orderNumber);
      } else {
        setCurrentOrderNumber(Math.floor(Date.now() / 1000) - 1770000000);
      }
    } catch (err) {
      setCurrentOrderNumber(Math.floor(Date.now() / 1000) - 1770000000);
    }

    // If logged in, open checkout details wizard
    setIsCheckoutDetailsOpen(true);
    setIsCartOpen(true);
  };

  const handleFinalizeOrderWhatsApp = () => {
    if (!checkoutDate || !checkoutTime) {
      alert(currentLang === 'ar' ? 'الرجاء اختيار تاريخ ووقت استلاف الطلب أولاً!' : 'Please choose a date and time to collect your gourmet order first!');
      return;
    }
    if (!checkoutRulesAccepted) {
      alert(currentLang === 'ar' ? 'يجب عليك الموافقة على القواعد الصارمة والالتزام بعدم تعديل الرسالة لإتمام الطلب!' : 'You must agree to the rules and commit to not modifying the message!');
      return;
    }

    const orderCode = currentOrderNumber ? `#${currentOrderNumber}` : ('ORDER-' + Math.floor(100000 + Math.random() * 900000));
    const subtotal = cartSubtotal;
    const tax = Math.round(subtotal * 0.14);
    const total = subtotal + tax;

    const branchName = checkoutBranch === 'medical' 
      ? (currentLang === 'ar' ? 'ميديكال بارك إيليت (التجمع الخامس)' : 'Medical Park Elite (Fifth Settlement)')
      : (currentLang === 'ar' ? 'فرع الواحة (مدينة نصر)' : 'El-Waha Branch (Nasr City)');

    const diningTypeStr = checkoutDiningType === 'takeaway'
      ? (currentLang === 'ar' ? 'سفري / تيك أواي 🛍️' : 'Takeaway 🛍️')
      : (currentLang === 'ar' ? 'تناول داخل الصالة 🍽️' : 'Dine-In 🍽️');

    // Format list of food items
    const itemsList = cart.map((item, idx) => {
      const addonsCost = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
      const saucesCost = item.selectedSauces?.reduce((s, sd) => s + sd.price, 0) || 0;
      const singlePrice = item.product.price + addonsCost + saucesCost;
      const addonsList = item.selectedAddons?.map(a => `   + إضافي: ${a.name[currentLang] || a.name.en} (+${a.price} ج)`).join('\n') || '';
      const saucesList = item.selectedSauces?.map(s => `   + صوص: ${s.name[currentLang] || s.name.en} (+${s.price} ج)`).join('\n') || '';
      
      let itemStr = `${idx + 1}. ${item.product.name[currentLang] || item.product.name.en} (عدد ${item.quantity}) = ${singlePrice * item.quantity} ج`;
      if (addonsList) itemStr += `\n${addonsList}`;
      if (saucesList) itemStr += `\n${saucesList}`;
      return itemStr;
    }).join('\n\n');

    // User details (fallback to empty strings if not present)
    const clientName = currentUser?.name || '';
    const clientEmail = currentUser?.email || '';
    const clientPhone = currentUser?.details?.phone || currentUser?.details?.regPhone || '';
    const clientAltPhone = currentUser?.details?.alternativePhone || currentUser?.details?.regAltPhone || '';

    const whatsappMessage = 
`⚜️ *طلب طعام فاخر - مطعم French Touch* ⚜️
----------------------------------------
🔢 *رقم الأوردر الفريد:* ${orderCode}
----------------------------------------
👤 *بيانات العميل المسجل:*
- الاسم الثلاثي: ${clientName}
- الجيميل: ${clientEmail}
- الهاتف الأساسي: ${clientPhone}
- الهاتف الاحتياطي: ${clientAltPhone || '-'}

📍 *تفاصيل الاستلام والفرع:*
- الفرع المختار: ${branchName}
- نوع الاستلام: ${diningTypeStr}
- تاريخ الحضور: ${checkoutDate}
- وقت الحضور: ${checkoutTime}

🍽️ *قائمة المأكولات المطلوبة:*
${itemsList}

💰 *الحساب الإجمالي:*
- المجموع الفرعي: ${subtotal} جنيه
- ضريبة القيمة المضافة (14%): ${tax} جنيه
- *المجموع الكلي الفاخر:* ${total} جنيه

⚠️ *تنبيه صارم وهام جداً:*
نظام مطعم French Touch يراقب سلامة الطلبات. لقد تم توثيق وحفظ بصمة حسابك وبياناتك في قاعدة بيانات المطور والمدير. 
يُمنع منعاً باتاً تعديل أو مسح أو اللعب في أي من محتويات هذه الرسالة التلقائية في الواتساب. إذا قمت بحذف أو تعديل أي معلومة، فسيتم تجاهل طلبك فوراً وحظر حسابك الشخصي وبصمتك من النظام تلقائياً ولن يتم تفعيل الطلب!
----------------------------------------`;

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/201044686954?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');

    // Create order receipt to display in client dashboard or screen
    setOrderReceipt({
      code: orderCode,
      items: [...cart],
      subtotal,
      tax,
      total,
      branch: branchName,
      diningType: diningTypeStr,
      date: checkoutDate,
      time: checkoutTime,
      timestamp: new Date().toLocaleString()
    });

    // Reset States
    setCart([]);
    setIsCheckoutDetailsOpen(false);
    setIsCartOpen(false);
    setPendingCheckout(false);

    alert(currentLang === 'ar' 
      ? '🎉 تم فتح محادثة الواتساب بنجاح وإرسال الطلب الفاخر!\nيرجى إرسال الرسالة كما هي دون تعديل لضمان موافقة المطبخ وتجهيز الطلب.'
      : '🎉 WhatsApp checkout opened successfully!\nPlease send the message without modifications to guarantee order acceptance.'
    );
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

  // If on the secret portal route and not logged in as Manager or Developer, display PortalLogin
  if (isSecretPortal && (!currentUser || (currentUser.role !== 'Developer' && currentUser.role !== 'Manager'))) {
    return (
      <PortalLogin
        currentLang={currentLang}
        onLoginSuccess={(email, name, role, lang) => {
          handleLoginSuccess({ email, name, role, lang });
          // Redirect the path back to "/" in browser bar for secrecy
          window.history.pushState({}, '', '/');
          setIsSecretPortal(false);
        }}
      />
    );
  }

  if (!entered && currentUser?.role !== 'Manager') {
    return (
      <LanguageLandingScreen
        onSelectLanguage={(lang) => {
          setCurrentLang(lang);
        }}
        currentLang={currentLang}
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
        setPreviewRole={setPreviewRole}
        onDatabaseMutated={handleDatabaseMutated}
      />
    );
  }

  const visibleLanguages = currentUser?.role === 'Manager'
    ? LANGUAGES.filter((l) => l.code === currentLang)
    : LANGUAGES;

  // Calculate cart total items count
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const addonsCost = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
    const saucesCost = item.selectedSauces?.reduce((s, sd) => s + sd.price, 0) || 0;
    const singlePrice = item.product.price + addonsCost + saucesCost;
    return sum + (singlePrice * item.quantity);
  }, 0);

  return (
    <div className={`min-h-[100dvh] bg-brand-cream text-brand-charcoal flex flex-col justify-between selection:bg-brand-gold selection:text-brand-blue ${currentLangDir === 'rtl' ? 'ar-dir' : 'ltr-dir'}`}>
      
      {/* 1. TOP MARGIN FRENCH FLAG DECORATIVE RIBBON */}
      <div className="w-full h-1.5 flex flex-row shrink-0">
        <div className="flex-1 h-full bg-[#002395]"></div>
        <div className="flex-1 h-full bg-white"></div>
        <div className="flex-1 h-full bg-[#ED2939]"></div>
      </div>

      {/* 2. DYNAMIC APP CONTAINER HEADER */}
      <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-md border-b border-brand-gold/15 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Header Left: Logo & Home triggers */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogoClick} 
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
            {visibleLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  if (currentUser?.role !== 'Manager') {
                    setCurrentLang(lang.code);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentLang === lang.code
                    ? 'bg-brand-blue text-brand-gold shadow-sm font-mono'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                disabled={currentUser?.role === 'Manager'}
              >
                <span>{lang.name.split(' ')[0]} {lang.flag}</span>
                {currentUser?.role === 'Manager' && <Lock className="w-3 h-3 text-brand-gold ml-1" />}
              </button>
            ))}
            
            {/* Sparkling Welcome Screen Replay Button */}
            {currentUser?.role !== 'Manager' && (
              <button
                onClick={() => setEntered(false)}
                className="p-1 px-2 text-[10px] uppercase font-bold text-amber-600 hover:bg-amber-500/10 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title={currentLang === 'ar' ? 'أعد عرض شاشة الترحيب' : 'Replay intro welcome screen'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{currentLang === 'ar' ? 'التقديم' : currentLang === 'fr' ? 'Accueil' : 'Intro'}</span>
              </button>
            )}
          </div>

          {/* Mobile Language Selector (Visible on Mobile Only) */}
          <div className="flex md:hidden items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
            {visibleLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  if (currentUser?.role !== 'Manager') {
                    setCurrentLang(lang.code);
                  }
                }}
                className={`w-6.5 h-6.5 flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer relative ${
                  currentLang === lang.code ? 'bg-brand-blue text-brand-gold scale-105 shadow-sm' : 'opacity-65 hover:opacity-100'
                }`}
                title={lang.name}
                disabled={currentUser?.role === 'Manager'}
              >
                {lang.flag}
                {currentUser?.role === 'Manager' && (
                  <span className="absolute -bottom-1 -right-1 bg-brand-gold text-brand-blue rounded-full p-0.5 scale-75">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
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
            ) : null}
          </div>
        </div>
      </header>

      {/* 3. MAIN APP LAYOUT (With sidebar navigation on desktop) */}
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row flex-grow px-4 py-6 md:py-8 gap-8 items-stretch overflow-hidden">
        
        {/* Desktop Left Sidebar (App Navigation) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-brand-cream border border-brand-gold/15 rounded-3xl p-6 shadow-sm justify-between gap-6 self-start">
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

              <button
                onClick={() => { setActiveAppTab('reviews'); setIsAdminConsoleVisible(false); }}
                id="tab-btn-reviews"
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'reviews'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5 text-brand-gold" />
                <span>{currentLang === 'ar' ? 'التقييمات والمناقشات' : 'Reviews & Discussions'}</span>
              </button>

              <button
                onClick={() => { setActiveAppTab('account'); setIsAdminConsoleVisible(false); }}
                id="tab-btn-account"
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all transform active:scale-98 cursor-pointer ${
                  activeAppTab === 'account'
                    ? 'bg-brand-blue text-[#FDFBF7] shadow-md shadow-brand-blue/15'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4.5 h-4.5 text-brand-gold" />
                <span>{currentLang === 'ar' ? 'حسابي الشخصي' : 'My Account'}</span>
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

          {/* Quick Stats Widget or Brand Quote Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            {(isManager || isDeveloper) ? (
              <>
                <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
                  {currentLang === 'ar' ? 'بيانات التطبيق اللحظية' : 'App Real-time Telemetry'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/40">
                    <p className="text-[10px] text-slate-400">{currentLang === 'ar' ? 'الأصناف' : 'Dishes'}</p>
                    <p className="font-mono font-black text-xs text-brand-blue">{products.length}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/40">
                    <p className="text-[10px] text-slate-400">{currentLang === 'ar' ? 'الفروع' : 'Cities'}</p>
                    <p className="font-mono font-black text-xs text-brand-blue">2</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-1">
                <span className="text-lg">⚜️</span>
              </div>
            )}
            
            {/* Ambient French Quote */}
            <p className="text-[10px] text-slate-500 italic leading-normal text-center pt-1 border-t border-slate-200/50">
              {currentLang === 'ar' 
                ? '✦ "الطهي الجيد هو أساس السعادة الحقيقية"' 
                : '✦ "La bonne cuisine est la base du véritable bonheur."'}
            </p>
          </div>
        </aside>

        {/* Dynamic App Center Workspace View Panel */}
        <main className="flex-1 min-w-0 bg-brand-cream border border-brand-gold/15 rounded-3xl shadow-sm p-4 md:p-8 flex flex-col justify-between overflow-y-auto">
          
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
                  
                  {/* Widget 1: Live table reservation/order status */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                          {currentLang === 'ar' ? 'حالة طلب الطعام الفاخر' : 'Gourmet Order Status'}
                        </span>
                        <h4 className="serif-heading text-lg font-black text-brand-blue">
                          {orderReceipt ? (currentLang === 'ar' ? 'تم تحويل الطلب للواتساب 🚀' : 'Order Sent to WhatsApp 🚀') : (currentLang === 'ar' ? 'اطلب وجبتك الآن 🛍️' : 'Order to WhatsApp Now 🛍️')}
                        </h4>
                      </div>
                      <span className={`p-2 rounded-xl text-xs font-mono font-bold ${orderReceipt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {orderReceipt ? 'SENT' : 'READY'}
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs leading-relaxed">
                      {orderReceipt 
                        ? (currentLang === 'ar' 
                            ? `الطلب ${orderReceipt.code} • فرع ${orderReceipt.branch} • الاستلام ${orderReceipt.date} الساعة ${orderReceipt.time}`
                            : `Order ${orderReceipt.code} • Branch ${orderReceipt.branch} • Pickup ${orderReceipt.date} @ ${orderReceipt.time}`)
                        : (currentLang === 'ar' ? 'تصفح قائمتنا الملكية، صمم طلبك بالتفصيل والصلصات الإضافية، وسيتم نقله للواتساب بضغطة زر واحدة بجميع معلوماتك.' : 'Browse our royal menu, customize your options & sauces, and forward details seamlessly to WhatsApp in one tap.')}
                    </p>

                    <button
                      onClick={() => setActiveAppTab('menu')}
                      className="w-full py-2.5 bg-slate-200/80 hover:bg-slate-300/90 text-brand-blue font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {currentLang === 'ar' ? 'تصفح قائمة الأطعمة 🍽️' : 'Browse Gourmet Menu 🍽️'}
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
                    onDeleteAllProducts={handleDeleteAllProducts}
                    onSaveExclusiveOffer={handleSaveExclusiveOffer}
                    onSaveWeeklyOffers={handleSaveWeeklyOffers}
                    onLogout={handleLogout}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDatabaseMutated={handleDatabaseMutated}
                  />
                </div>
              </div>
            )}

            {/* REVIEWS & DISCUSSIONS VIEW */}
            {activeAppTab === 'reviews' && (
              <ReviewsDiscussion
                currentLang={currentLang}
                currentUser={currentUser}
                onOpenLogin={() => setActiveAppTab('account')}
              />
            )}

            {/* MY ACCOUNT VIEW */}
            {activeAppTab === 'account' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="serif-heading text-2xl md:text-3xl font-extrabold text-brand-blue">
                    {currentLang === 'ar' ? 'حسابي الشخصي والخدمات' : 'My Profile & Culinary Desk'}
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">
                    {currentLang === 'ar' ? 'قم بإنشاء حساب زبون جديد، أو تصفح عروضك المخصصة والرسائل المرسلة إليك تلقائياً.' : 'Register a classic gourmet customer profile or manage your active subscription details.'}
                  </p>
                </div>

                <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
                  
                  {/* LOADING OVERLAY WHILE GEMINI CHECKS THE PICTURE */}
                  {regLoading && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-[3px] border-brand-gold border-t-brand-blue animate-spin mb-3"></div>
                      <h4 className="serif-heading text-base sm:text-lg font-black text-brand-blue mb-2">
                        {currentLang === 'ar' ? '🔮 فحص ملامح الوجه بالذكاء الاصطناعي' : '🔮 AI Facial Feature Inspection'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        {currentLang === 'ar' 
                          ? 'يقوم نظامنا الآن بتحليل صورتك المرفوعة عبر ذكاء Gemini الاصطناعي للتأكد من أنها صورة شخص حقيقي بملامح ظاهرة، وتأكيد اشتراكك التلقائي...' 
                          : 'Our system is currently analyzing your profile photo using Gemini AI to verify authentic human features and authorize your mandatory subscription...'}
                      </p>
                    </div>
                  )}

                  {currentUser ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100 pb-6">
                        <img 
                          src={currentUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.email}`} 
                          alt={currentUser.name} 
                          className="w-20 h-20 rounded-full border-2 border-brand-gold shadow-md object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-center sm:text-start space-y-1">
                          <h3 className="serif-heading text-xl font-bold text-brand-blue">{currentUser.name}</h3>
                          <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                          
                          {currentUser.details && (
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              📞 {currentUser.details.phone} | ☎️ {currentUser.details.alternativePhone}
                            </p>
                          )}

                          <span className="inline-block px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] uppercase font-bold tracking-widest font-mono rounded-full mt-1.5">
                            {currentUser.role === 'Developer' 
                              ? (currentLang === 'ar' ? 'المطور المعتمد' : 'Primary Developer') 
                              : currentUser.role === 'Manager' 
                                ? (currentLang === 'ar' ? 'مدير المطعم' : 'Restaurant Manager') 
                                : (currentLang === 'ar' ? 'زبون كلاسيك معتمد بالذكاء الاصطناعي ✓' : 'AI-Verified Classic Customer ✓')}
                          </span>
                        </div>
                      </div>

                      {/* GEMINI AI PROFILE IMAGE CULINARY PERSONALITY ANALYSIS */}
                      {currentUser.details?.aiAnalysis && (
                        <div className="bg-gradient-to-br from-indigo-50/75 to-purple-50/50 border border-indigo-100/60 rounded-2xl p-4 md:p-5 space-y-3 shadow-xs text-start">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔮</span>
                            <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider">
                              {currentLang === 'ar' ? 'تحليل صورتك بالذكاء الاصطناعي Gemini:' : 'Gemini AI Face Taste Analysis:'}
                            </h4>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-[10px] font-bold">
                              <span>🌟</span>
                              <span>{currentUser.details.aiAnalysis.culinaryMood}</span>
                            </div>
                            
                            <p className="text-[11px] text-indigo-950 leading-relaxed font-semibold">
                              {currentUser.details.aiAnalysis.personalityAnalysis}
                            </p>
                            
                            <div className="bg-white/80 border border-indigo-100/80 p-2.5 rounded-xl text-[11px] flex items-center justify-between shadow-xs">
                              <span className="text-slate-600 font-bold">
                                {currentLang === 'ar' ? 'طبقك المثالي الموصى به:' : 'Your recommended perfect dish:'}
                              </span>
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                                {currentUser.details.aiAnalysis.recommendedDish}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* EXCLUSIVE AUTO-SENT PROMOS NEWSLETTER DISPLAY FOR ACTIVE CUSTOMERS */}
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 md:p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📬</span>
                          <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                            {currentLang === 'ar' ? 'العروض والمنتجات الحصرية (مرسلة تلقائياً لبريدك المسجل)' : 'Your Mandatory Offers Newsletter (Sent to Your Gmail)'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          {currentLang === 'ar' 
                            ? `مرحباً ${currentUser.name.split(' ')[0]}! لقد تم تفعيل إرسال جميع العروض الجديدة والأطباق الحصرية تلقائياً وإجبارياً إلى بريدك الإلكتروني [${currentUser.email}]. إليك ملخص النشرة الترحيبية الحالية:` 
                            : `Hello ${currentUser.name.split(' ')[0]}! New discounts and newly curated French dishes are automatically broadcasted to your Gmail account [${currentUser.email}]. Your active subscriber portal overview:`}
                        </p>
                        
                        <div className="space-y-2.5 pt-1">
                          <div className="bg-white border border-emerald-200/50 p-2.5 rounded-xl text-[11px] flex justify-between items-center shadow-xs">
                            <span className="font-bold text-emerald-900">{currentLang === 'ar' ? 'كود خصم الترحيب (20%):' : 'Welcome Promo Code (20%):'}</span>
                            <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs select-all">WELCOME20</span>
                          </div>
                          
                          <div className="bg-white border border-emerald-200/50 p-2.5 rounded-xl text-[11px] space-y-1 shadow-xs">
                            <span className="font-bold text-emerald-900 block mb-1">🎁 {currentLang === 'ar' ? 'أحدث المنتجات التي تم إضافتها بالنظام وجاهزة للطلب:' : 'Newly Added Dishes In System:'}</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                              <li>{currentLang === 'ar' ? 'بطاطس فرنش تاتش اللذيذة المجهزة بالجبنة والأعشاب البرية.' : 'French Touch Cheesy Wild Herb Fries.'}</li>
                              <li>{currentLang === 'ar' ? 'سندوتشات الكروك موسيو الكلاسيكية بالخلطة الباريسية الفاخرة.' : 'Parisian Croque Monsieur Sandwiches.'}</li>
                              <li>{currentLang === 'ar' ? 'الحلويات المبتكرة والماكارون الطازج.' : 'Curated Artisanal Macarons & Desserts.'}</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            {currentLang === 'ar' ? 'لغة التطبيق الافتراضية' : 'Default Application Language'}
                          </label>
                          <div className="flex gap-2">
                            {(['ar', 'en', 'fr', 'it'] as Language[]).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => {
                                  setCurrentLang(lang);
                                  safeStorage.setItem('frenchtouch_lang', lang);
                                }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  currentLang === lang 
                                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100'
                                }`}
                              >
                                {lang === 'ar' ? 'العربية 🇪🇬' : lang === 'en' ? 'English 🇺🇸' : lang === 'fr' ? 'Français 🇫🇷' : 'Italiano 🇮🇹'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {orderReceipt && (
                          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4 space-y-3">
                            <h4 className="text-xs font-black text-brand-blue flex items-center gap-1.5">
                              <span>🧾</span>
                              <span>{currentLang === 'ar' ? 'طلبك الأخير المعتمد' : 'Your Latest Receipt'}</span>
                            </h4>
                            <div className="text-[11px] text-slate-600 space-y-1.5 font-mono">
                              <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span>ID:</span>
                                <span className="font-bold text-brand-blue">{orderReceipt.receiptId}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span>Date:</span>
                                <span>{new Date(orderReceipt.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between text-amber-700 font-bold">
                                <span>Total (VAT incl.):</span>
                                <span>{orderReceipt.total} {t.currency}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-brand-red font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-red-100"
                      >
                        {currentLang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Logout from Account'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {verificationFlow.active ? (
                        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                          <div className="mx-auto w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center text-2xl">
                            ✉️
                          </div>
                          <h3 className="serif-heading text-xl font-extrabold text-brand-blue">
                            {currentLang === 'ar' ? 'توثيق الحساب' : 'Account Verification'}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {currentLang === 'ar' 
                                ? `الرجاء إدخال رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الإلكتروني: ${verificationFlow.email}` 
                                : `Please enter the 6-digit verification code sent to your email: ${verificationFlow.email}`
                            }
                          </p>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={verificationFlow.otpInput}
                              onChange={(e) => setVerificationFlow({ ...verificationFlow, otpInput: e.target.value })}
                              placeholder={currentLang === 'ar' ? 'ادخل الرمز هنا...' : 'Enter code here...'}
                              className="w-full bg-slate-50 border border-slate-200 text-brand-blue text-center text-2xl font-mono tracking-[0.5em] rounded-xl px-4 py-4 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
                              maxLength={6}
                            />
                            {regError && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{regError}</p>}
                            <button
                              type="button"
                              onClick={async () => {
                                setRegLoading(true);
                                setRegError('');
                                try {
                                  const res = await fetch('/api/auth/verify-email-otp', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ sessionId: verificationFlow.sessionId, otp: verificationFlow.otpInput })
                                  });
                                  const data = await res.json();
                                  if (res.ok && data.success) {
                                      setVerificationFlow({ ...verificationFlow, active: false });
                                      setRegFirstName('');
                                      setRegSecondName('');
                                      setRegThirdName('');
                                      setRegEmail('');
                                      setRegPhone('');
                                      setRegAltPhone('');
                                      setRegPicture('');
                                      handleLoginSuccess(data.user);
                                      alert(currentLang === 'ar' 
                                        ? `🎉 تم تسجيل وتوثيق حسابك بنجاح!` 
                                        : `🎉 Registration & Verification successful!`);
                                  } else {
                                    setRegError(data.error || 'Verification failed');
                                  }
                                } catch (err) {
                                  setRegError('Server error');
                                } finally {
                                  setRegLoading(false);
                                }
                              }}
                              className="w-full bg-brand-blue text-brand-cream py-4 rounded-xl font-bold hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                              disabled={regLoading}
                            >
                              {currentLang === 'ar' ? 'تحقق واستمرار' : 'Verify & Continue'}
                            </button>
                            
                            <button 
                              type="button"
                              onClick={() => {
                                setVerificationFlow({ ...verificationFlow, active: false });
                                setRegError('');
                              }}
                              className="text-xs text-slate-400 hover:text-brand-blue cursor-pointer"
                            >
                              {currentLang === 'ar' ? 'إلغاء والعودة' : 'Cancel & Return'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Form Tabs */}
                          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthFormTab('register');
                            setRegError('');
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            authFormTab === 'register'
                              ? 'bg-white text-brand-blue shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {currentLang === 'ar' ? '✨ إنشاء حساب جديد' : '✨ Register New'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthFormTab('login');
                            setRegError('');
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            authFormTab === 'login'
                              ? 'bg-white text-brand-blue shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {currentLang === 'ar' ? '🔑 لدي حساب مسجل' : '🔑 Existing Account'}
                        </button>
                      </div>

                      {authFormTab === 'register' ? (
                        <>
                          <div className="text-center space-y-2">
                            <span className="inline-block p-2 bg-brand-gold/10 rounded-full text-lg">✨</span>
                            <h3 className="serif-heading text-xl font-extrabold text-brand-blue">
                              {currentLang === 'ar' ? 'إنشاء حساب زبون جديد فخم' : 'Register Gourmet Customer Account'}
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                              {currentLang === 'ar' 
                                ? 'سجل حسابك مجاناً لتتمكن من الطلب وحجز الطاولات، وستصلك جميع عروضنا والمنتجات الجديدة تلقائياً وإجبارياً على بريدك الإلكتروني.' 
                                : 'Sign up to manage table reservations, order dishes, and auto-subscribe to premium emails.'}
                            </p>
                          </div>

                          {regError && (
                            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-brand-red leading-relaxed flex items-start gap-2 animate-shake">
                              <span className="text-sm">⚠️</span>
                              <div className="text-start">
                                <span className="font-bold block mb-0.5">{currentLang === 'ar' ? 'حدث خطأ في التسجيل:' : 'Registration Refused:'}</span>
                                {regError}
                              </div>
                            </div>
                          )}

                          <form 
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!regFirstName || !regSecondName || !regThirdName || !regEmail || !regPhone || !regAltPhone) {
                                setRegError(currentLang === 'ar' ? 'يرجى إدخال كافة المعلومات النصية المطلوبة أولاً.' : 'Please enter all required text fields.');
                                return;
                              }
                              if (!checkEgyptianPhone(regPhone)) {
                                setRegError(currentLang === 'ar' 
                                  ? 'رقم الهاتف الأساسي غير صحيح! يجب إدخال رقم هاتف محمول مصري حقيقي نشط (مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015).' 
                                  : 'Invalid primary phone! Must be a real Egyptian mobile number starting with 010, 011, 012, or 015 (11 digits).');
                                return;
                              }
                              if (!checkEgyptianPhone(regAltPhone)) {
                                setRegError(currentLang === 'ar' 
                                  ? 'رقم الهاتف الاحتياطي غير صحيح! يجب إدخال رقم هاتف محمول مصري حقيقي احتياطي مختلف (مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015).' 
                                  : 'Invalid alternative phone! Must be a real Egyptian mobile number starting with 010, 011, 012, or 015 (11 digits).');
                                return;
                              }
                              if (regPhone.replace(/\D/g, "") === regAltPhone.replace(/\D/g, "")) {
                                setRegError(currentLang === 'ar' 
                                  ? 'رقم الهاتف الاحتياطي يجب أن يكون مختلفاً تماماً عن رقم الهاتف الأساسي.' 
                                  : 'Alternative phone number must be different from primary phone number.');
                                return;
                              }
                              if (!regPicture) {
                                setRegError(currentLang === 'ar' ? 'صورة الحساب الشخصي إجبارية! يرجى رفع صورة واضحة لوجهك الشخصي.' : 'Profile picture is mandatory! Please upload a clear photo.');
                                return;
                              }

                              setRegLoading(true);
                              setRegError('');

                              try {
                                const response = await fetch('/api/auth/register-customer', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    firstName: regFirstName,
                                    secondName: regSecondName,
                                    thirdName: regThirdName,
                                    email: regEmail,
                                    phone: regPhone,
                                    alternativePhone: regAltPhone,
                                    picture: regPicture
                                  })
                                });

                                const data = await response.json();
                                if (response.ok && data.success) {
                                  if (data.requiresVerification) {
                                    setVerificationFlow({
                                      active: true,
                                      step: 'email',
                                      sessionId: data.sessionId,
                                      email: regEmail,
                                      phone: regPhone,
                                      otpInput: ''
                                    });
                                  } else {
                                    // Fallback for direct login (if no verification required)
                                    setRegFirstName('');
                                    setRegSecondName('');
                                    setRegThirdName('');
                                    setRegEmail('');
                                    setRegPhone('');
                                    setRegAltPhone('');
                                    setRegPicture('');
                                    handleLoginSuccess(data.user);
                                  }
                                } else {
                                  setRegError(data.error || 'Registration failed');
                                }
                              } catch (err) {
                                console.error(err);
                                setRegError(currentLang === 'ar' ? 'فشل الاتصال بالخادم لمراجعة الصورة والبيانات.' : 'Server connection failed.');
                              } finally {
                                setRegLoading(false);
                              }
                            }} 
                            className="space-y-4"
                          >
                            {/* TRIPLE NAME FIELDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                  {currentLang === 'ar' ? 'الاسم الأول *' : 'First Name *'}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={regFirstName}
                                  onChange={(e) => setRegFirstName(e.target.value)}
                                  placeholder={currentLang === 'ar' ? 'مثال: أحمد' : 'e.g. Ahmad'}
                                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                  {currentLang === 'ar' ? 'الاسم الثاني *' : 'Second Name *'}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={regSecondName}
                                  onChange={(e) => setRegSecondName(e.target.value)}
                                  placeholder={currentLang === 'ar' ? 'مثال: محمد' : 'e.g. Mohamed'}
                                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                  {currentLang === 'ar' ? 'الاسم الثالث *' : 'Third Name *'}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={regThirdName}
                                  onChange={(e) => setRegThirdName(e.target.value)}
                                  placeholder={currentLang === 'ar' ? 'مثال: علي' : 'e.g. Ali'}
                                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                                />
                              </div>
                            </div>

                            {/* EMAIL / GMAIL */}
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                {currentLang === 'ar' ? 'البريد الإلكتروني (الجيميل الخاص بك) *' : 'Gmail Address *'}
                              </label>
                              <input
                                type="email"
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue font-mono"
                              />
                            </div>

                            {/* PHONE NUMBERS INSTRUCTIONAL BANNER */}
                            <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200/80 rounded-2xl p-4 text-start space-y-1.5 shadow-sm">
                              <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
                                <span className="text-sm">🇪🇬</span>
                                <span>{currentLang === 'ar' ? 'تعليمات وإرشادات هامة لأرقام الهواتف:' : 'Egyptian Phone Verification Rules:'}</span>
                              </div>
                              <ul className="text-[10px] text-amber-700 leading-relaxed font-semibold list-disc list-inside space-y-1">
                                {currentLang === 'ar' ? (
                                  <>
                                    <li>يجب أن تكون أرقام الهواتف تابعة لشبكات الاتصالات المصرية (فودافون، أورانج، اتصالات، وي).</li>
                                    <li>يجب إدخال الأرقام بالصيغة المحلية المكونة من 11 رقماً (مثل: <span className="font-mono bg-white/60 px-1 rounded text-amber-900">01012345678</span>).</li>
                                    <li>يجب أن يكون الهاتف الأساسي نشطاً لاستقبال إيصال الأوردر عبر الواتساب.</li>
                                    <li>يُمنع منعاً باتاً تكرار نفس الرقم في حقل الهاتف الأساسي والاحتياطي.</li>
                                  </>
                                ) : (
                                  <>
                                    <li>Phone numbers must belong to standard Egyptian mobile networks (Vodafone, Orange, Etisalat, WE).</li>
                                    <li>Use the 11-digit local format (e.g., <span className="font-mono bg-white/60 px-1 rounded text-amber-900">01012345678</span>).</li>
                                    <li>The primary phone must have active WhatsApp to accept gourmet order receipts.</li>
                                    <li>Primary and alternative phone numbers must be completely distinct.</li>
                                  </>
                                )}
                              </ul>
                            </div>

                            {/* PHONE NUMBERS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                  {currentLang === 'ar' ? 'رقم الهاتف الأساسي *' : 'Primary Phone *'}
                                </label>
                                <input
                                  type="tel"
                                  required
                                  value={regPhone}
                                  onChange={(e) => setRegPhone(e.target.value)}
                                  placeholder="01xxxxxxxxx"
                                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue font-mono"
                                />
                                {regPhone && (
                                  <div className="mt-1 text-[9px] font-bold">
                                    {checkEgyptianPhone(regPhone) ? (
                                      <span className="text-emerald-600 flex items-center gap-1">✓ {currentLang === 'ar' ? 'رقم محمول مصري معتمد' : 'Approved Egyptian mobile'}</span>
                                    ) : (
                                      <span className="text-rose-500 flex items-center gap-1">⚠️ {currentLang === 'ar' ? 'يرجى إدخال رقم هاتف مصري حقيقي (11 رقم)' : 'Enter 11-digit Egyptian phone'}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                  {currentLang === 'ar' ? 'رقم هاتف احتياطي مختلف *' : 'Alternative Phone *'}
                                </label>
                                <input
                                  type="tel"
                                  required
                                  value={regAltPhone}
                                  onChange={(e) => setRegAltPhone(e.target.value)}
                                  placeholder="01xxxxxxxxx"
                                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue font-mono"
                                />
                                {regAltPhone && (
                                  <div className="mt-1 text-[9px] font-bold">
                                    {checkEgyptianPhone(regAltPhone) ? (
                                      regPhone && regPhone.replace(/\D/g, "") === regAltPhone.replace(/\D/g, "") ? (
                                        <span className="text-rose-500 flex items-center gap-1">⚠️ {currentLang === 'ar' ? 'يجب أن يكون مختلفاً عن الهاتف الأساسي' : 'Must differ from primary phone'}</span>
                                      ) : (
                                        <span className="text-emerald-600 flex items-center gap-1">✓ {currentLang === 'ar' ? 'رقم محمول احتياطي معتمد' : 'Approved alternative mobile'}</span>
                                      )
                                    ) : (
                                      <span className="text-rose-500 flex items-center gap-1">⚠️ {currentLang === 'ar' ? 'يرجى إدخال رقم هاتف مصري حقيقي (11 رقم)' : 'Enter 11-digit Egyptian phone'}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* MANDATORY HUMAN PHOTO UPLOAD */}
                            <div className="space-y-2 text-start">
                              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-blue">
                                {currentLang === 'ar' ? 'صورة الحساب الشخصي (إجبارية بشرية حقيقية) *' : 'Mandatory Profile Photo (Real Human Face) *'}
                              </label>
                              
                              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-gold transition-all relative bg-slate-50/50">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  required
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setRegLoading(true);
                                      const compressedBase64 = await compressImage(file);
                                      setRegPicture(compressedBase64);
                                      setRegError('');
                                    } catch (err) {
                                      console.error("Compression error:", err);
                                      setRegError(currentLang === 'ar' ? 'فشل معالجة الصورة، يرجى المحاولة بصورة أخرى.' : 'Image processing failed.');
                                    } finally {
                                      setRegLoading(false);
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                
                                {regPicture ? (
                                  <div className="space-y-2">
                                    <img 
                                      src={regPicture} 
                                      alt="Preview" 
                                      className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-brand-gold shadow-md"
                                    />
                                    <span className="block text-[10px] text-emerald-600 font-bold">✓ تم تجهيز الصورة بنجاح</span>
                                    <span className="block text-[9px] text-slate-400">{currentLang === 'ar' ? 'انقر أو اسحب لتغيير الصورة' : 'Click or drag to change'}</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1 py-2">
                                    <span className="text-2xl block">📸</span>
                                    <span className="block text-xs font-bold text-slate-600">{currentLang === 'ar' ? 'اختر صورة شخصية حقيقية لك' : 'Select a real photo of yourself'}</span>
                                    <span className="block text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                                      {currentLang === 'ar' 
                                        ? 'يجب أن تكون صورتك الشخصية بملامح واضحة وظاهرة ليقبلها نظام التحقق من الوجه بالذكاء الاصطناعي Gemini.' 
                                        : 'Your face features must be clearly visible. Selfies or portraits are verified live via Gemini AI.'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-4 bg-brand-blue hover:bg-brand-blue/95 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                            >
                              <span>👑</span>
                              <span>{currentLang === 'ar' ? 'إنشاء حساب الزبون وتأكيد الاشتراك' : 'Register & Authorize Account'}</span>
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <div className="text-center space-y-2">
                            <span className="inline-block p-2 bg-brand-gold/10 rounded-full text-lg">🔑</span>
                            <h3 className="serif-heading text-xl font-extrabold text-brand-blue">
                              {currentLang === 'ar' ? 'استعادة بيانات حسابي المسجل' : 'Retrieve My Registered Account'}
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                              {currentLang === 'ar' 
                                ? 'أدخل معلومات حسابك المسجل مسبقاً لمطابقتها واستعادة حسابك وصورتك المعتمدة بالذكاء الاصطناعي فوراً.' 
                                : 'Enter your registered email, full name, and phone number to restore your account details instantly.'}
                            </p>
                          </div>

                          {regError && (
                            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-brand-red leading-relaxed flex items-start gap-2 animate-shake">
                              <span className="text-sm">⚠️</span>
                              <div className="text-start">
                                <span className="font-bold block mb-0.5">{currentLang === 'ar' ? 'فشل التحقق والمطابقة:' : 'Verification Denied:'}</span>
                                {regError}
                              </div>
                            </div>
                          )}

                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!loginEmail || !loginName || !loginPhone) {
                                setRegError(currentLang === 'ar' ? 'يرجى إدخال كافة البيانات المطلوبة للمطابقة.' : 'Please enter all required fields.');
                                return;
                              }
                              setRegLoading(true);
                              setRegError('');

                              try {
                                const response = await fetch('/api/auth/login-existing-customer', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    email: loginEmail,
                                    name: loginName,
                                    phone: loginPhone
                                  })
                                });

                                const data = await response.json();
                                if (response.ok && data.success) {
                                  setLoginEmail('');
                                  setLoginName('');
                                  setLoginPhone('');
                                  handleLoginSuccess(data.user);
                                  alert(currentLang === 'ar'
                                    ? `🎉 تم التحقق بنجاح ومطابقة ملامح صورتك المعتمدة! أهلاً بك مجدداً: ${data.user.name}`
                                    : `🎉 Verified successfully! Welcome back, ${data.user.name}`
                                  );
                                } else {
                                  setRegError(data.error || 'Matching failed');
                                }
                              } catch (err) {
                                console.error(err);
                                setRegError(currentLang === 'ar' ? 'فشل الاتصال بالخادم لمطابقة البيانات.' : 'Server connection failed.');
                              } finally {
                                setRegLoading(false);
                              }
                            }}
                            className="space-y-4 text-start"
                          >
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                {currentLang === 'ar' ? 'البريد الإلكتروني الجيميل المسجل *' : 'Registered Gmail *'}
                              </label>
                              <input
                                type="email"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                {currentLang === 'ar' ? 'الاسم بالكامل المسجل *' : 'Registered Full Name *'}
                              </label>
                              <input
                                type="text"
                                required
                                value={loginName}
                                onChange={(e) => setLoginName(e.target.value)}
                                placeholder={currentLang === 'ar' ? 'مثال: أحمد محمد علي' : 'e.g. Ahmad Mohamed Ali'}
                                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                                {currentLang === 'ar' ? 'رقم الهاتف المسجل *' : 'Registered Phone Number *'}
                              </label>
                              <input
                                type="tel"
                                required
                                value={loginPhone}
                                onChange={(e) => setLoginPhone(e.target.value)}
                                placeholder="01xxxxxxxxx"
                                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue font-mono"
                              />
                              {loginPhone && (
                                <div className="mt-1 text-[9px] font-bold">
                                  {checkEgyptianPhone(loginPhone) ? (
                                    <span className="text-emerald-600 flex items-center gap-1">✓ {currentLang === 'ar' ? 'رقم محمول مصري معتمد' : 'Approved Egyptian mobile'}</span>
                                  ) : (
                                    <span className="text-rose-500 flex items-center gap-1">⚠️ {currentLang === 'ar' ? 'يرجى إدخال رقم هاتف مصري حقيقي (11 رقم)' : 'Enter 11-digit Egyptian phone'}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="w-full py-4 bg-brand-blue hover:bg-brand-blue/95 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                            >
                              <span>🔑</span>
                              <span>{currentLang === 'ar' ? 'المطابقة واستعادة الحساب فوراً' : 'Verify & Retrieve Account'}</span>
                            </button>
                          </form>
                        </>
                      )}
                      </>
                    )}
                  </div>
                )}
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
                    {isCheckoutDetailsOpen 
                      ? (currentLang === 'ar' ? 'تجهيز تفاصيل الاستلام' : 'Finalize Delivery & Branch')
                      : (currentLang === 'ar' ? 'سلة المأكولات الفاخرة' : 'Gourmet Selection')}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 font-mono text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {pendingCheckout && !currentUser ? (
                /* VIEW 2: REGISTRATION REQUIRED NOTICE VIEW */
                <div className="space-y-6 py-6 text-start">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                    ⚠️
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <h4 className="serif-heading text-lg font-black text-brand-blue">
                      {currentLang === 'ar' ? 'خطوة أخيرة مطلوبة: يجب التسجيل!' : 'Final Step: Registration Required!'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {currentLang === 'ar' 
                        ? 'عذراً! طلبك الحالي معلق ومحفوظ في السلة مؤقتاً. لحمايتنا ولضمان جدية الطلبات في مطعم French Touch، يُشترط تسجيل حساب زبون حقيقي ورفع صورتك لتأكيدها بالذكاء الاصطناعي Gemini قبل إرسال الطلب للواتساب.' 
                        : 'Sorry! Your current order is pending and saved. To guarantee authenticity, you must register a classic customer profile and upload your photo for live Gemini AI verification before WhatsApp forwarding.'}
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-[11px] text-amber-800 leading-relaxed font-sans space-y-1">
                    <span className="font-bold block">💡 {currentLang === 'ar' ? 'ماذا سيحدث لطلبك الحالي؟' : 'What happens to your current tray?'}</span>
                    <p>{currentLang === 'ar' ? '• قمنا بحفظ الوجبات في السلة مؤقتاً لن تضيع.' : '• Your selected items are locked and will not be lost.'}</p>
                    <p>{currentLang === 'ar' ? '• بمجرد انتهاء تسجيل الحساب، سيقوم الموقع تلقائياً بمتابعة هذا الطلب وعرض خيارات التوصيل.' : '• Once registered, the system redirects you here to select branch & time.'}</p>
                  </div>

                  <div className="space-y-2.5 pt-4">
                    <button
                      onClick={() => {
                        setActiveAppTab('account');
                        setIsCartOpen(false);
                      }}
                      className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>👤</span>
                      <span>{currentLang === 'ar' ? 'الانتقال للتسجيل الفوري الآن' : 'Go to Registration Now'}</span>
                    </button>

                    <button
                      onClick={() => setPendingCheckout(false)}
                      className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {currentLang === 'ar' ? 'العودة لمشاهدة مأكولات السلة' : 'Return to Gourmet Tray'}
                    </button>
                  </div>
                </div>
              ) : isCheckoutDetailsOpen && currentUser ? (
                /* VIEW 3: CHECKOUT DETAILS WIZARD FORM */
                <div className="space-y-5 py-2 text-start">
                  
                  {/* PROMINENT ORDER NUMBER & SCREENSHOT CAPTURE BANNER */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-dashed border-amber-300 rounded-3xl p-5 text-center space-y-3 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-1 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl">
                      {currentLang === 'ar' ? 'معتمد' : 'VERIFIED'}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl animate-pulse">📸</span>
                      <h4 className="serif-heading text-sm font-black text-brand-blue tracking-tight">
                        {currentLang === 'ar' ? 'التقط لقطة شاشة الآن!' : 'Take a Screenshot Now!'}
                      </h4>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {currentLang === 'ar' ? 'رقم طلبك الفريد والنهائي' : 'Your Unique Order ID'}
                      </p>
                      <div className="text-4xl font-black text-amber-600 font-mono tracking-wider animate-bounce py-1">
                        #{currentOrderNumber || '...'}
                      </div>
                    </div>

                    <p className="text-[10.5px] text-brand-blue font-bold leading-relaxed max-w-sm mx-auto font-sans">
                      {currentLang === 'ar' 
                        ? '⚠️ احتفظ بهذا الرقم جيداً! سوف تستلم طلبك وتأخذه من الفرع فوراً بمجرد إخبار الكاشير بهذا الرقم ليتعرف على أوردرك.' 
                        : '⚠️ Keep this number! You will receive and collect your order at the salon immediately by stating this verified number.'}
                    </p>
                  </div>

                  {/* Collapsible/Compact items list summary */}
                  <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                      {currentLang === 'ar' ? 'ملخص مأكولات الطلب الفاخر' : 'Your Gourmet Tray Summary'}
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1.5 divide-y divide-slate-200/40 text-[11px]">
                      {cart.map((item) => (
                        <div key={item.id} className="pt-1.5 flex justify-between text-brand-blue font-bold">
                          <span>{item.product.name[currentLang] || item.product.name.en} <span className="font-mono text-slate-400 font-normal">x{item.quantity}</span></span>
                          <span className="font-mono text-amber-600">{item.product.price * item.quantity} ج</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BRANCH SELECTION */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue">
                      {currentLang === 'ar' ? 'اختر فرع الاستلام المعتمد *' : 'Choose Pickup Branch *'}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCheckoutBranch('medical')}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          checkoutBranch === 'medical'
                            ? 'bg-brand-blue/5 border-brand-blue text-brand-blue ring-1 ring-brand-blue'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-base mb-1">🏥</div>
                        <div>{currentLang === 'ar' ? 'التجمع الخامس' : 'Fifth Settlement'}</div>
                        <div className="text-[9px] text-slate-400 font-normal mt-0.5">ميديكال بارك</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutBranch('waha')}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          checkoutBranch === 'waha'
                            ? 'bg-brand-blue/5 border-brand-blue text-brand-blue ring-1 ring-brand-blue'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-base mb-1">🌳</div>
                        <div>{currentLang === 'ar' ? 'مدينة نصر' : 'Nasr City'}</div>
                        <div className="text-[9px] text-slate-400 font-normal mt-0.5">فرع الواحة</div>
                      </button>
                    </div>
                  </div>

                  {/* DINING TYPE (TAKEAWAY VS DINE-IN) */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue">
                      {currentLang === 'ar' ? 'طريقة تناول الطعام *' : 'Dining Option *'}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCheckoutDiningType('takeaway')}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          checkoutDiningType === 'takeaway'
                            ? 'bg-brand-blue/5 border-brand-blue text-brand-blue ring-1 ring-brand-blue'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-base mb-1">🛍️</span>
                        <span>{currentLang === 'ar' ? 'تيك أواي / سفري' : 'Takeaway / To-Go'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutDiningType('dinein')}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          checkoutDiningType === 'dinein'
                            ? 'bg-brand-blue/5 border-brand-blue text-brand-blue ring-1 ring-brand-blue'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-base mb-1">🍽️</span>
                        <span>{currentLang === 'ar' ? 'أكل داخل الصالة' : 'Dine-In / Salon'}</span>
                      </button>
                    </div>
                  </div>

                  {/* DATE & TIME SELECTORS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                        {currentLang === 'ar' ? 'تاريخ الاستلام *' : 'Pickup Date *'}
                      </label>
                      <input
                        type="date"
                        required
                        value={checkoutDate}
                        onChange={(e) => setCheckoutDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-blue mb-1">
                        {currentLang === 'ar' ? 'وقت الاستلام *' : 'Pickup Time *'}
                      </label>
                      <input
                        type="time"
                        required
                        value={checkoutTime}
                        onChange={(e) => setCheckoutTime(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  {/* STRICT RULES STYLISH BOX */}
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-red flex items-center gap-1 animate-pulse">
                      <span>🛑</span>
                      <span>{currentLang === 'ar' ? 'تنبيه صارم وهام جداً للزبون' : 'Strict Restrictive Decree'}</span>
                    </span>
                    <p className="text-[10px] text-brand-red leading-relaxed font-sans">
                      {currentLang === 'ar' 
                        ? 'سيقوم الموقع الآن بتحويلك للواتساب مع رسالة تلقائية مجهزة بجميع بياناتك المسجلة والوجبات. يمنع منعاً باتاً تعديل، أو حذف، أو تشويه أي جزء من الرسالة. في حال إرسال بيانات معدلة أو كاذبة، سيقوم النظام تلقائياً بتعطيل حسابك وحظر بصمتك نهائياً من دخول المطعم!' 
                        : 'You will be redirected to WhatsApp with an auto-docket message containing food tray and account metadata. Modifying or deleting any character results in instant, permanent account ban across all branches!'}
                    </p>
                    
                    <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checkoutRulesAccepted}
                        onChange={(e) => setCheckoutRulesAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-brand-red focus:ring-brand-red border-slate-300"
                      />
                      <span className="text-[9px] font-black text-slate-700 leading-normal">
                        {currentLang === 'ar' 
                          ? 'أقر وأتعهد بالالتزام بالقواعد وعدم تعديل الرسالة التلقائية نهائياً.' 
                          : 'I solemnly pledge to obey all salon rules and not modify the docket text.'}
                      </span>
                    </label>
                  </div>

                </div>
              ) : (
                /* VIEW 1: STANDARD GOURMET TRAY LIST */
                cart.length === 0 ? (
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
                )
              )}
            </div>

            {cart.length > 0 && !pendingCheckout && (
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

                {isCheckoutDetailsOpen && currentUser ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setIsCheckoutDetailsOpen(false)}
                      className="py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl text-xs transition-colors cursor-pointer text-center"
                    >
                      {currentLang === 'ar' ? 'تعديل السلة' : 'Edit Tray'}
                    </button>
                    
                    <button
                      onClick={handleFinalizeOrderWhatsApp}
                      className="col-span-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🚀</span>
                      <span>{currentLang === 'ar' ? 'إرسال للواتساب' : 'Send to WhatsApp'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCartCheckout}
                    className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-black rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🥂</span>
                    <span>{currentLang === 'ar' ? 'تأكيد طلب الطعام' : 'Checkout & Generate Receipt'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. RESPONSIVE MOBILE APP BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex justify-around py-2 shrink-0">
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

        <button
          onClick={() => { setActiveAppTab('reviews'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'reviews' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeAppTab === 'reviews' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'التقييمات' : 'Reviews'}</span>
        </button>

        <button
          onClick={() => { setActiveAppTab('account'); setIsAdminConsoleVisible(false); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold py-1 px-3 rounded-xl transition-all ${
            activeAppTab === 'account' ? 'text-brand-blue scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <User className={`w-5 h-5 ${activeAppTab === 'account' ? 'text-brand-gold' : ''}`} />
          <span>{currentLang === 'ar' ? 'الحساب' : 'Account'}</span>
        </button>
      </div>

      {/* AUTHENTICATION MODAL */}
      <LoginModal
        currentLang={currentLang}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(email, name, role, lang) => {
          handleLoginSuccess({ 
            email, 
            name, 
            role,
            lang
          });
        }}
      />

      {/* PERSUASIVE NEWSLETTER SUBSCRIPTION MODAL */}
      <SubscriptionModal currentLang={currentLang} />

      {/* PRODUCT CUSTOMIZER MODAL */}
      <ProductCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        product={customizerProduct}
        currentLang={currentLang}
        onConfirm={handleCustomizerConfirm}
      />

      {currentUser?.role === 'Developer' && previewRole !== 'Developer' && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-stone-900 border border-amber-500/30 text-stone-100 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-bold text-stone-300">
            {currentLang === 'ar' ? `محاكاة دور (${previewRole === 'Manager' ? 'المدير' : 'الزبون'})` : `Simulating: ${previewRole}`}
          </span>
          <button
            onClick={() => setPreviewRole('Developer')}
            className="text-xs font-black text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/20 transition-all cursor-pointer"
          >
            {currentLang === 'ar' ? 'الرجوع للمطور 🛠️' : 'Back to Console 🛠️'}
          </button>
        </div>
      )}

    </div>
  );
}
