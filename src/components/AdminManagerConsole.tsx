import React, { useState } from 'react';
import { 
  Users, PlusCircle, Sparkles, Calendar, BookOpen, 
  Trash2, Edit, Check, AlertCircle, Eye, LogOut, ArrowLeftRight, FolderPlus
} from 'lucide-react';
import { 
  Product, ExclusiveOffer, WeeklyOffer, Manager, 
  Language, Category, TRANSLATIONS, LANGUAGES, CategoryItem 
} from '../types';

interface AdminManagerConsoleProps {
  currentLang: Language;
  currentUserEmail: string;
  isSuperAdmin: boolean;
  isManager: boolean;
  managers: Manager[];
  products: Product[];
  exclusiveOffer: ExclusiveOffer;
  weeklyOffers: WeeklyOffer[];
  activeTab: 'products' | 'offers' | 'super';
  setActiveTab: (tab: 'products' | 'offers' | 'super') => void;
  onAddManager: (email: string, name: string, password?: string, lang?: Language) => void;
  onRemoveManager: (email: string) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteAllProducts?: () => void;
  onSaveExclusiveOffer: (offer: ExclusiveOffer) => void;
  onSaveWeeklyOffers: (offers: WeeklyOffer[]) => void;
  onLogout: () => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  categories: CategoryItem[];
  onAddCategory: (id: string, name: any, icon?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateCategory: (id: string, name: any, icon?: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminManagerConsole({
  currentLang,
  currentUserEmail,
  isSuperAdmin,
  isManager,
  managers,
  products,
  exclusiveOffer,
  weeklyOffers,
  activeTab,
  setActiveTab,
  onAddManager,
  onRemoveManager,
  onSaveProduct,
  onDeleteProduct,
  onDeleteAllProducts,
  onSaveExclusiveOffer,
  onSaveWeeklyOffers,
  onLogout,
  editingProduct,
  setEditingProduct,
  categories = [],
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory
}: AdminManagerConsoleProps) {
  const t = TRANSLATIONS[currentLang];
  
  // New Manager form state
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('123');
  const [newManagerLang, setNewManagerLang] = useState<Language>('ar');
  const [managerError, setManagerError] = useState('');

  // Dynamic Category form state
  const [newCatId, setNewCatId] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameFr, setNewCatNameFr] = useState('');
  const [newCatNameIt, setNewCatNameIt] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('utensils');
  const [catMessage, setCatMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Product form state (when editing or adding)
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [pId, setPId] = useState('');
  const [pCategory, setPCategory] = useState<string>('sandwiches');
  const [pPrice, setPPrice] = useState<number | "">(100);
  const [pImage, setPImage] = useState('');
  
  // Multilingual product strings
  const [pNameAr, setPNameAr] = useState('');
  const [pNameEn, setPNameEn] = useState('');
  const [pNameFr, setPNameFr] = useState('');
  const [pNameIt, setPNameIt] = useState('');
  
  const [pDescAr, setPDescAr] = useState('');
  const [pDescEn, setPDescEn] = useState('');
  const [pDescFr, setPDescFr] = useState('');
  const [pDescIt, setPDescIt] = useState('');

  // Exclusive Offer form state
  const [excTitleAr, setExcTitleAr] = useState(exclusiveOffer.title.ar);
  const [excTitleEn, setExcTitleEn] = useState(exclusiveOffer.title.en);
  const [excTitleFr, setExcTitleFr] = useState(exclusiveOffer.title.fr);
  const [excTitleIt, setExcTitleIt] = useState(exclusiveOffer.title.it);

  const [excDescAr, setExcDescAr] = useState(exclusiveOffer.description.ar);
  const [excDescEn, setExcDescEn] = useState(exclusiveOffer.description.en);
  const [excDescFr, setExcDescFr] = useState(exclusiveOffer.description.fr);
  const [excDescIt, setExcDescIt] = useState(exclusiveOffer.description.it);

  const [excDiscount, setExcDiscount] = useState(exclusiveOffer.discount);
  const [excEndTime, setExcEndTime] = useState(exclusiveOffer.endTime.substring(0, 16)); // Format for input datetime-local
  const [excImage, setExcImage] = useState(exclusiveOffer.image);
  const [excActive, setExcActive] = useState(exclusiveOffer.active);
  const [excSavedMsg, setExcSavedMsg] = useState(false);

  // Weekly Offers edit index/form state
  const [editingWeeklyDay, setEditingWeeklyDay] = useState<number | null>(null);
  const [weeklyTitleAr, setWeeklyTitleAr] = useState('');
  const [weeklyTitleEn, setWeeklyTitleEn] = useState('');
  const [weeklyTitleFr, setWeeklyTitleFr] = useState('');
  const [weeklyTitleIt, setWeeklyTitleIt] = useState('');

  const [weeklyDescAr, setWeeklyDescAr] = useState('');
  const [weeklyDescEn, setWeeklyDescEn] = useState('');
  const [weeklyDescFr, setWeeklyDescFr] = useState('');
  const [weeklyDescIt, setWeeklyDescIt] = useState('');
  const [weeklyDiscount, setWeeklyDiscount] = useState('');

  // Confirmation state for deleting products (iframe-safe)
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Dynamic automatic translation states
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  // Trigger editing a product
  const startEditProduct = (p: Product) => {
    setIsAddingNewProduct(false);
    setPId(p.id);
    setPCategory(p.category);
    setPPrice(p.price);
    setPImage(p.image);
    
    setPNameAr(p.name.ar || '');
    setPNameEn(p.name.en || '');
    setPNameFr(p.name.fr || '');
    setPNameIt(p.name.it || '');
    
    setPDescAr(p.description.ar || '');
    setPDescEn(p.description.en || '');
    setPDescFr(p.description.fr || '');
    setPDescIt(p.description.it || '');
  };

  React.useEffect(() => {
    if (editingProduct) {
      if (editingProduct.id === 'new') {
        startAddProduct();
      } else {
        startEditProduct(editingProduct);
      }
    }
  }, [editingProduct]);

  const startAddProduct = () => {
    setEditingProduct(null);
    setIsAddingNewProduct(true);
    setPId('p_' + Date.now());
    setPCategory('sandwiches');
    setPPrice(150);
    setPImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80');
    
    setPNameAr('');
    setPNameEn('');
    setPNameFr('');
    setPNameIt('');
    
    setPDescAr('');
    setPDescEn('');
    setPDescFr('');
    setPDescIt('');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoTranslate = async () => {
    const availableName = pNameAr || pNameEn || pNameFr || pNameIt;
    const availableDesc = pDescAr || pDescEn || pDescFr || pDescIt;

    if (!availableName) {
      setTranslationError(currentLang === 'ar' ? 'الرجاء إدخال اسم المنتج بلغة واحدة على الأقل للترجمة التلقائية.' : 'Please enter the product name in at least one language first to translate.');
      return;
    }

    setIsTranslating(true);
    setTranslationError('');

    try {
      const langs: ('ar' | 'en' | 'fr' | 'it')[] = ['ar', 'en', 'fr', 'it'];

      const translateText = async (text: string, targetLang: string): Promise<string> => {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang })
        });
        if (!response.ok) throw new Error('Translation failed');
        const data = await response.json();
        return data.translation;
      };

      // Translate Names
      const nameTranslations = await Promise.all(
        langs.map(async (lang) => {
          const currentVal = { ar: pNameAr, en: pNameEn, fr: pNameFr, it: pNameIt }[lang];
          if (currentVal) return { lang, val: currentVal };
          const trans = await translateText(availableName, lang);
          return { lang, val: trans };
        })
      );

      // Translate Descriptions
      let descTranslations = [];
      if (availableDesc) {
        descTranslations = await Promise.all(
          langs.map(async (lang) => {
            const currentVal = { ar: pDescAr, en: pDescEn, fr: pDescFr, it: pDescIt }[lang];
            if (currentVal) return { lang, val: currentVal };
            const trans = await translateText(availableDesc, lang);
            return { lang, val: trans };
          })
        );
      }

      nameTranslations.forEach((item) => {
        if (item.lang === 'ar') setPNameAr(item.val);
        if (item.lang === 'en') setPNameEn(item.val);
        if (item.lang === 'fr') setPNameFr(item.val);
        if (item.lang === 'it') setPNameIt(item.val);
      });

      if (availableDesc) {
        descTranslations.forEach((item) => {
          if (item.lang === 'ar') setPDescAr(item.val);
          if (item.lang === 'en') setPDescEn(item.val);
          if (item.lang === 'fr') setPDescFr(item.val);
          if (item.lang === 'it') setPDescIt(item.val);
        });
      }
    } catch (err) {
      console.error(err);
      setTranslationError(currentLang === 'ar' ? 'حدث خطأ أثناء الترجمة التلقائية. يرجى ملء الحقول يدوياً.' : 'Error during translation. Please fill fields manually.');
    } finally {
      setIsTranslating(false);
    }
  };

  const saveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const availableName = pNameAr || pNameEn || pNameFr || pNameIt;
    if (!availableName) {
      alert(currentLang === 'ar' ? "يرجى كتابة اسم المنتج بلغة واحدة على الأقل." : "Please fill in the product name in at least one language.");
      return;
    }

    if (pPrice === "" || Number(pPrice) <= 0) {
      alert(currentLang === 'ar' ? "يرجى إدخال سعر صحيح أكبر من الصفر." : "Please enter a valid price greater than zero.");
      return;
    }

    setIsTranslating(true);
    setTranslationError('');

    let finalNameAr = pNameAr;
    let finalNameEn = pNameEn;
    let finalNameFr = pNameFr;
    let finalNameIt = pNameIt;

    let finalDescAr = pDescAr;
    let finalDescEn = pDescEn;
    let finalDescFr = pDescFr;
    let finalDescIt = pDescIt;

    const availableDesc = pDescAr || pDescEn || pDescFr || pDescIt;

    try {
      const translateText = async (text: string, targetLang: string): Promise<string> => {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang })
        });
        if (!response.ok) throw new Error('Translation failed');
        const data = await response.json();
        return data.translation;
      };

      if (!pNameAr) finalNameAr = await translateText(availableName, 'ar');
      if (!pNameEn) finalNameEn = await translateText(availableName, 'en');
      if (!pNameFr) finalNameFr = await translateText(availableName, 'fr');
      if (!pNameIt) finalNameIt = await translateText(availableName, 'it');

      if (availableDesc) {
        if (!pDescAr) finalDescAr = await translateText(availableDesc, 'ar');
        if (!pDescEn) finalDescEn = await translateText(availableDesc, 'en');
        if (!pDescFr) finalDescFr = await translateText(availableDesc, 'fr');
        if (!pDescIt) finalDescIt = await translateText(availableDesc, 'it');
      } else {
        finalDescAr = '';
        finalDescEn = '';
        finalDescFr = '';
        finalDescIt = '';
      }
    } catch (err) {
      console.error("Auto translate during save failed", err);
      finalNameAr = finalNameAr || availableName;
      finalNameEn = finalNameEn || availableName;
      finalNameFr = finalNameFr || availableName;
      finalNameIt = finalNameIt || availableName;

      finalDescAr = finalDescAr || availableDesc || '';
      finalDescEn = finalDescEn || availableDesc || '';
      finalDescFr = finalDescFr || availableDesc || '';
      finalDescIt = finalDescIt || availableDesc || '';
    } finally {
      setIsTranslating(false);
    }

    const newProduct: Product = {
      id: pId,
      category: pCategory,
      price: Number(pPrice),
      image: pImage || 'https://picsum.photos/seed/restaurant/600/600',
      name: {
        ar: finalNameAr,
        en: finalNameEn,
        fr: finalNameFr,
        it: finalNameIt
      },
      description: {
        ar: finalDescAr,
        en: finalDescEn,
        fr: finalDescFr,
        it: finalDescIt
      }
    };

    onSaveProduct(newProduct);
    setIsAddingNewProduct(false);
    setEditingProduct(null);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatMessage(null);
    if (!newCatNameAr || !newCatNameEn || !newCatNameFr || !newCatNameIt) {
      setCatMessage({
        text: currentLang === 'ar' ? 'الرجاء ملء جميع أسماء القسم بأربع لغات.' : 'Please fill all localized names.',
        type: 'error'
      });
      return;
    }

    if (editingCatId) {
      const res = await onUpdateCategory(
        editingCatId,
        {
          ar: newCatNameAr,
          en: newCatNameEn,
          fr: newCatNameFr,
          it: newCatNameIt
        },
        newCatIcon
      );

      if (res.success) {
        setEditingCatId(null);
        setNewCatId('');
        setNewCatNameAr('');
        setNewCatNameEn('');
        setNewCatNameFr('');
        setNewCatNameIt('');
        setNewCatIcon('utensils');
        setCatMessage({
          text: currentLang === 'ar' ? 'تم تعديل القسم بنجاح!' : 'Section updated successfully!',
          type: 'success'
        });
      } else {
        setCatMessage({
          text: res.error || (currentLang === 'ar' ? 'حدث خطأ ما.' : 'An error occurred.'),
          type: 'error'
        });
      }
    } else {
      if (!newCatId) {
        setCatMessage({
          text: currentLang === 'ar' ? 'الرجاء إدخال كود القسم.' : 'Please enter Section ID.',
          type: 'error'
        });
        return;
      }
      const formattedId = newCatId.trim().toLowerCase().replace(/\s+/g, '_');
      const res = await onAddCategory(
        formattedId,
        {
          ar: newCatNameAr,
          en: newCatNameEn,
          fr: newCatNameFr,
          it: newCatNameIt
        },
        newCatIcon
      );

      if (res.success) {
        setNewCatId('');
        setNewCatNameAr('');
        setNewCatNameEn('');
        setNewCatNameFr('');
        setNewCatNameIt('');
        setNewCatIcon('utensils');
        setCatMessage({
          text: currentLang === 'ar' ? 'تم إضافة القسم بنجاح!' : 'Section added successfully!',
          type: 'success'
        });
      } else {
        setCatMessage({
          text: res.error || (currentLang === 'ar' ? 'حدث خطأ ما.' : 'An error occurred.'),
          type: 'error'
        });
      }
    }
  };

  const startEditCategory = (cat: CategoryItem) => {
    setEditingCatId(cat.id);
    setNewCatId(cat.id);
    setNewCatNameAr(cat.name.ar || '');
    setNewCatNameEn(cat.name.en || '');
    setNewCatNameFr(cat.name.fr || '');
    setNewCatNameIt(cat.name.it || '');
    setNewCatIcon(cat.icon || 'utensils');
    setCatMessage(null);
  };

  const cancelEditCategory = () => {
    setEditingCatId(null);
    setNewCatId('');
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatNameFr('');
    setNewCatNameIt('');
    setNewCatIcon('utensils');
    setCatMessage(null);
  };

  const handleRemoveCategoryClick = async (id: string) => {
    setCatMessage(null);
    const res = await onDeleteCategory(id);
    if (res.success) {
      setCatMessage({
        text: currentLang === 'ar' ? 'تم حذف القسم بنجاح!' : 'Section deleted successfully!',
        type: 'success'
      });
    } else {
      setCatMessage({
        text: res.error || (currentLang === 'ar' ? 'حدث خطأ ما.' : 'An error occurred.'),
        type: 'error'
      });
    }
  };

  const saveExclusiveOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ExclusiveOffer = {
      id: exclusiveOffer.id,
      title: { ar: excTitleAr, en: excTitleEn, fr: excTitleFr, it: excTitleIt },
      description: { ar: excDescAr, en: excDescEn, fr: excDescFr, it: excDescIt },
      discount: excDiscount,
      endTime: new Date(excEndTime).toISOString(),
      image: excImage,
      active: excActive
    };
    onSaveExclusiveOffer(updated);
    setExcSavedMsg(true);
    setTimeout(() => setExcSavedMsg(false), 3000);
  };

  const startEditWeekly = (w: WeeklyOffer) => {
    setEditingWeeklyDay(w.dayOfWeek);
    setWeeklyTitleAr(w.title.ar);
    setWeeklyTitleEn(w.title.en);
    setWeeklyTitleFr(w.title.fr);
    setWeeklyTitleIt(w.title.it);
    setWeeklyDescAr(w.description.ar);
    setWeeklyDescEn(w.description.en);
    setWeeklyDescFr(w.description.fr);
    setWeeklyDescIt(w.description.it);
    setWeeklyDiscount(w.discount);
  };

  const saveWeeklyOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWeeklyDay === null) return;
    const updatedWeeklyList = weeklyOffers.map(w => {
      if (w.dayOfWeek === editingWeeklyDay) {
        return {
          ...w,
          title: { ar: weeklyTitleAr, en: weeklyTitleEn, fr: weeklyTitleFr, it: weeklyTitleIt },
          description: { ar: weeklyDescAr, en: weeklyDescEn, fr: weeklyDescFr, it: weeklyDescIt },
          discount: weeklyDiscount
        };
      }
      return w;
    });
    onSaveWeeklyOffers(updatedWeeklyList);
    setEditingWeeklyDay(null);
  };

  const handleAddManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManagerError('');
    if (!newManagerEmail || !newManagerName || !newManagerPassword) {
      setManagerError('All fields are required.');
      return;
    }
    if (!newManagerEmail.includes('@') || !newManagerEmail.includes('.')) {
      setManagerError('Please enter a valid email.');
      return;
    }
    onAddManager(newManagerEmail.trim().toLowerCase(), newManagerName.trim(), newManagerPassword.trim(), newManagerLang);
    setNewManagerEmail('');
    setNewManagerName('');
    setNewManagerPassword('123');
    setNewManagerLang('ar');
  };

  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md space-y-8" id="admin-panel">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
            <h2 className="serif-heading text-2xl font-bold text-brand-blue">
              {t.adminPanel}
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Logged in as: <span className="font-bold text-brand-blue">{currentUserEmail}</span> 
            {isSuperAdmin && <span className="ml-2 px-2 py-0.5 bg-brand-red text-white text-[9px] rounded font-sans">SUPER ADMIN</span>}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-red border border-brand-red/20 rounded-xl hover:bg-brand-red/5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t.logout}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => { setActiveTab('products'); setIsAddingNewProduct(false); setEditingProduct(null); }}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'products'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {currentLang === 'ar' ? 'إدارة المنتجات والقائمة' : 'Menu & Products'}
        </button>

        <button
          onClick={() => { setActiveTab('offers'); setEditingWeeklyDay(null); }}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'offers'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {currentLang === 'ar' ? 'تعديل العروض الترويجية' : 'Offers & Promotions'}
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('super')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'super'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-400 hover:text-red-600'
            }`}
          >
            <Users className="w-4 h-4 text-brand-red" />
            {t.superPanel}
          </button>
        )}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {!isAddingNewProduct && !editingProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Products Database (8 columns) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-brand-blue uppercase tracking-wider font-mono">
                    {currentLang === 'ar' ? 'قائمة المنتجات الحالية' : 'Current Database Products'} ({products.length})
                  </h3>
                  <div className="flex gap-2">
                    {products.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteAllConfirm(true)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-brand-red text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title={currentLang === 'ar' ? 'مسح جميع المنتجات' : 'Delete All Products'}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{currentLang === 'ar' ? 'مسح الكل' : 'Delete All'}</span>
                      </button>
                    )}
                    <button
                      onClick={startAddProduct}
                      className="px-4 py-2 bg-brand-blue text-brand-cream hover:bg-brand-blue/90 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <PlusCircle className="w-4 h-4 text-brand-gold" />
                      {t.addProduct}
                    </button>
                  </div>
                </div>

                {/* Simple Table listing all products with edit/delete triggers */}
                <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-slate-50/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 text-brand-blue font-bold border-b border-gray-200">
                        <th className="p-3 text-center w-12">Image</th>
                        <th className="p-3">Product Name ({currentLang.toUpperCase()})</th>
                        <th className="p-3 w-28">Category</th>
                        <th className="p-3 w-20 text-center">Price</th>
                        <th className="p-3 w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                          <td className="p-3">
                            <img
                              src={p.image}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 mx-auto"
                            />
                          </td>
                          <td className="p-3 font-semibold text-brand-blue">
                            {p.name[currentLang] || p.name.en}
                          </td>
                          <td className="p-3 capitalize text-gray-500 font-mono text-[10px]">
                            {categories.find(c => c.id === p.category)?.name[currentLang] || p.category}
                          </td>
                          <td className="p-3 text-center font-bold font-mono">
                            {p.price} <span className="text-[9px] font-sans font-normal">{t.currency}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 hover:bg-brand-blue/10 text-brand-blue rounded"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setProductToDeleteId(p.id)}
                                className="p-1.5 hover:bg-brand-red/10 text-brand-red rounded cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Dynamic Sections/Categories Manager (4 columns) - Elegant French-Inspired */}
              <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="serif-heading text-base font-extrabold text-brand-blue flex items-center gap-2">
                    <FolderPlus className="w-5 h-5 text-brand-gold" />
                    <span>{currentLang === 'ar' ? 'إدارة الأقسام المخصصة' : 'Sections Manager'}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full font-bold">
                    {categories.length} {currentLang === 'ar' ? 'أقسام' : 'sections'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {currentLang === 'ar' 
                    ? 'بصفتك مديراً، يمكنك هنا إضافة أقسام جديدة كأقسام المشروبات، المقبلات، أو تحريرها وحذفها بالكامل من قائمة الطعام.'
                    : 'As a manager, define menu sections here (e.g., Hot Drinks, French pastries). Added sections instantly appear as tabs in the public menu.'}
                </p>

                {catMessage && (
                  <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    catMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' 
                      : 'bg-rose-50 text-rose-800 border border-rose-150'
                  }`}>
                    <span>{catMessage.text}</span>
                  </div>
                )}

                {/* Categories Creation/Edition Form */}
                <form onSubmit={handleSaveCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-blue mb-1.5">
                      {currentLang === 'ar' ? 'معرّف القسم فريد (إنجليزي)' : 'Unique Section ID (lowercase, e.g. beverages)'}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingCatId}
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      placeholder="e.g. pastries, beverages"
                      className={`w-full text-xs p-3 border border-gray-200 rounded-2xl focus:bg-white focus:outline-brand-blue font-mono ${
                        editingCatId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-slate-50'
                      }`}
                    />
                    {editingCatId && (
                      <span className="block text-[9px] text-gray-400 mt-1">
                        {currentLang === 'ar' 
                          ? 'لا يمكن تغيير معرّف القسم لتفادي كسر روابط المنتجات الحالية.' 
                          : 'Section ID cannot be changed to prevent breaking existing product relationships.'}
                      </span>
                    )}
                  </div>

                  {/* Multi-language Localized Names */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-blue">
                      {currentLang === 'ar' ? 'اسم القسم بمختلف اللغات' : 'Section Name in Multiple Languages'}
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          required
                          value={newCatNameAr}
                          onChange={(e) => setNewCatNameAr(e.target.value)}
                          placeholder="العربية"
                          className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-brand-blue"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={newCatNameEn}
                          onChange={(e) => setNewCatNameEn(e.target.value)}
                          placeholder="English"
                          className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-brand-blue"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={newCatNameFr}
                          onChange={(e) => setNewCatNameFr(e.target.value)}
                          placeholder="Français"
                          className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-brand-blue"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={newCatNameIt}
                          onChange={(e) => setNewCatNameIt(e.target.value)}
                          placeholder="Italiano"
                          className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-brand-blue"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-blue mb-1.5">
                      {currentLang === 'ar' ? 'أيقونة القسم' : 'Section Icon style'}
                    </label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-brand-blue"
                    >
                      <option value="utensils">🍴 Utensils (General food)</option>
                      <option value="soup">🥣 Soup (Appetizers)</option>
                      <option value="cake">🍰 Cake (Desserts)</option>
                      <option value="glasswater">🥤 GlassWater (Drinks)</option>
                      <option value="coffee">☕ Coffee</option>
                      <option value="beer">🍺 Beer</option>
                      <option value="pizza">🍕 Pizza / Oven</option>
                      <option value="croissant">🥐 Croissant / Bakery</option>
                    </select>
                  </div>

                  {editingCatId ? (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelEditCategory}
                        className="flex-1 py-3 border border-gray-200 hover:bg-slate-50 text-gray-500 text-xs font-bold rounded-2xl transition-all text-center cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-brand-gold hover:bg-brand-gold/90 text-brand-blue text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{currentLang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-brand-cream text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <PlusCircle className="w-4 h-4 text-brand-gold" />
                      <span>{currentLang === 'ar' ? 'إضافة قسم جديد' : 'Create New Section'}</span>
                    </button>
                  )}
                </form>

                {/* Section listings */}
                <div className="pt-4 border-t border-gray-100">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-blue mb-2.5">
                    {currentLang === 'ar' ? 'الأقسام المتاحة حالياً' : 'Active Section list'}
                  </span>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div 
                        key={cat.id} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-gray-100/50 hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-brand-gold text-sm">✦</span>
                          <div>
                            <div className="font-bold text-xs text-brand-blue">
                              {cat.name[currentLang] || cat.id}
                            </div>
                            <div className="text-[9px] text-gray-400 font-mono">ID: {cat.id} | Icon: {cat.icon || 'utensils'}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditCategory(cat)}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title={currentLang === 'ar' ? 'تعديل اسم القسم' : 'Edit Section Name'}
                          >
                            <Edit className="w-3 h-3" />
                            <span>{currentLang === 'ar' ? 'تعديل' : 'Edit'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategoryClick(cat.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-brand-red rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Remove Section"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{currentLang === 'ar' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Add / Edit Form */
            <form onSubmit={saveProductSubmit} className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="serif-heading text-lg font-bold text-brand-blue">
                  {editingProduct ? `${t.editProduct}: ${editingProduct.name[currentLang]}` : t.addProduct}
                </h3>
                <button
                  type="button"
                  onClick={() => { setIsAddingNewProduct(false); setEditingProduct(null); }}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 underline"
                >
                  {t.cancel}
                </button>
              </div>

              {/* Dynamic Translation Banner / Loading state */}
              {isTranslating && (
                <div className="bg-amber-500/10 text-amber-700 p-4 rounded-2xl border border-amber-500/20 text-xs font-bold flex items-center gap-3 animate-pulse">
                  <span className="text-sm">✨</span>
                  <span>
                    {currentLang === 'ar' 
                      ? 'جاري الترجمة التلقائية للحقول الفارغة بالذكاء الاصطناعي (Gemini)... يرجى الانتظار.' 
                      : 'Auto-translating blank language fields using Gemini AI... please wait.'}
                  </span>
                </div>
              )}

              {translationError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-xs font-bold">
                  ⚠️ {translationError}
                </div>
              )}

              {/* Price, Category, Image fields */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Category and Price */}
                <div className="lg:col-span-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-blue mb-1.5">{t.category}</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name[currentLang] || cat.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-blue mb-1.5">{t.price} ({t.currency})</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pPrice === 0 ? "" : pPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || val === "0") {
                          setPPrice("");
                        } else {
                          const parsed = parseInt(val, 10);
                          if (!isNaN(parsed)) {
                            setPPrice(parsed);
                          }
                        }
                      }}
                      placeholder={currentLang === 'ar' ? 'أدخل السعر هنا' : 'Enter price'}
                      required
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                    />
                  </div>
                </div>

                {/* Device Image Uploader */}
                <div className="lg:col-span-8">
                  <label className="block text-xs font-bold text-brand-blue mb-1.5">
                    {currentLang === 'ar' ? 'صورة المنتج' : 'Product Image'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="sm:col-span-4 h-28 relative bg-slate-50 border border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {pImage ? (
                        <>
                          <img src={pImage} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPImage('')}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs shadow-md transition-all cursor-pointer border-none"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-3">
                          <span className="block text-xl text-gray-300">📸</span>
                          <span className="block text-[9px] text-gray-400 mt-0.5">
                            {currentLang === 'ar' ? 'لا توجد صورة' : 'No image'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="sm:col-span-8 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 py-2.5 px-4 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer border border-brand-blue text-center">
                          <span>{currentLang === 'ar' ? '📤 ارفع صورة من الهاتف / الجهاز' : '📤 Upload Image from Phone/Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="text-[10px] text-gray-400 leading-relaxed">
                        {currentLang === 'ar' 
                          ? 'اختر صورة من جهازك ليتم حفظها مباشرة، أو يمكنك لصق رابط خارجي للصورة أدناه.'
                          : 'Choose an image from your device to save directly, or paste an external image link below.'}
                      </div>
                      <input
                        type="url"
                        placeholder={currentLang === 'ar' ? 'رابط الصورة البديل (اختياري)' : 'Alternative Image URL (Optional)'}
                        value={pImage.startsWith('data:') ? '' : pImage}
                        onChange={(e) => setPImage(e.target.value)}
                        className="w-full text-[10px] p-2 border border-gray-100 rounded-lg bg-slate-50 focus:outline-brand-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Names (4 Languages) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <h4 className="text-xs font-extrabold text-brand-blue tracking-wider uppercase">
                    {currentLang === 'ar' ? 'اسم المنتج بجميع اللغات (يكفي ملء لغة واحدة والضغط على ترجمة)' : 'Product Name (Fill at least one language)'}
                  </h4>
                  
                  <button
                    type="button"
                    disabled={isTranslating}
                    onClick={handleAutoTranslate}
                    className="py-1 px-3 bg-brand-gold/20 hover:bg-brand-gold/30 disabled:bg-gray-100 text-brand-blue hover:text-brand-blue/90 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✨</span>
                    <span>{currentLang === 'ar' ? 'ترجمة تلقائية بالذكاء الاصطناعي' : '✨ Gemini Auto-Translate Blank Fields'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-red mb-1">ARABIC (العربية)</label>
                    <input
                      type="text"
                      value={pNameAr}
                      onChange={(e) => setPNameAr(e.target.value)}
                      placeholder="مثال: لازانيا دجاج بالكريمة"
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ENGLISH</label>
                    <input
                      type="text"
                      value={pNameEn}
                      onChange={(e) => setPNameEn(e.target.value)}
                      placeholder="e.g. Creamy Chicken Lasagna"
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">FRENCH (Français)</label>
                    <input
                      type="text"
                      value={pNameFr}
                      onChange={(e) => setPNameFr(e.target.value)}
                      placeholder="ex: Lasagne de Poulet Crémeuse"
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ITALIAN (Italiano)</label>
                    <input
                      type="text"
                      value={pNameIt}
                      onChange={(e) => setPNameIt(e.target.value)}
                      placeholder="es: Lasagna Cremosa al Pollo"
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Product Descriptions (4 Languages) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-brand-blue tracking-wider uppercase border-b border-gray-100 pb-1">
                  {currentLang === 'ar' ? 'وصف المنتج ومكوناته بجميع اللغات' : 'Descriptions & Ingredients in All Languages'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-red mb-1">ARABIC Description</label>
                    <textarea
                      value={pDescAr}
                      onChange={(e) => setPDescAr(e.target.value)}
                      rows={3}
                      placeholder="مكونات الطبق والبهارات..."
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ENGLISH Description</label>
                    <textarea
                      value={pDescEn}
                      onChange={(e) => setPDescEn(e.target.value)}
                      rows={3}
                      placeholder="Premium ingredients, sauce details..."
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">FRENCH Description</label>
                    <textarea
                      value={pDescFr}
                      onChange={(e) => setPDescFr(e.target.value)}
                      rows={3}
                      placeholder="Ingrédients nobles, sauce..."
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ITALIAN Description</label>
                    <textarea
                      value={pDescIt}
                      onChange={(e) => setPDescIt(e.target.value)}
                      rows={3}
                      placeholder="Ingredienti freschi, condimento..."
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isTranslating}
                  onClick={() => { setIsAddingNewProduct(false); setEditingProduct(null); }}
                  className="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-500 font-bold rounded-xl text-xs transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isTranslating}
                  className="px-6 py-2.5 bg-brand-gold disabled:bg-amber-300 text-brand-blue font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-gold/90 transition-all shadow-sm cursor-pointer"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                      <span>{currentLang === 'ar' ? 'جاري الترجمة والحفظ...' : 'Translating & Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="space-y-8">
          {/* Section A: One-time Exclusive Offer Form */}
          <form onSubmit={saveExclusiveOfferSubmit} className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <h3 className="font-extrabold text-sm text-brand-blue uppercase tracking-wider font-mono">
                  {t.exclusiveOffer}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400">ACTIVE:</span>
                <input
                  type="checkbox"
                  checked={excActive}
                  onChange={(e) => setExcActive(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-0"
                />
              </div>
            </div>

            {/* Basic values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-blue mb-1.5">Discount Percentage (e.g. 25%, 30%)</label>
                <input
                  type="text"
                  value={excDiscount}
                  onChange={(e) => setExcDiscount(e.target.value)}
                  required
                  placeholder="25%"
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-blue mb-1.5">Countdown End Date & Time</label>
                <input
                  type="datetime-local"
                  value={excEndTime}
                  onChange={(e) => setExcEndTime(e.target.value)}
                  required
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-blue mb-1.5">Offer Banner Image URL</label>
                <input
                  type="url"
                  value={excImage}
                  onChange={(e) => setExcImage(e.target.value)}
                  required
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                />
              </div>
            </div>

            {/* Multilingual Titles */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider border-b border-gray-100 pb-1">
                Offer Title in All 4 Languages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-red mb-1">ARABIC TITLE *</label>
                  <input
                    type="text"
                    value={excTitleAr}
                    onChange={(e) => setExcTitleAr(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">ENGLISH TITLE *</label>
                  <input
                    type="text"
                    value={excTitleEn}
                    onChange={(e) => setExcTitleEn(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">FRENCH TITLE *</label>
                  <input
                    type="text"
                    value={excTitleFr}
                    onChange={(e) => setExcTitleFr(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">ITALIAN TITLE *</label>
                  <input
                    type="text"
                    value={excTitleIt}
                    onChange={(e) => setExcTitleIt(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                  />
                </div>
              </div>
            </div>

            {/* Multilingual Descriptions */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider border-b border-gray-100 pb-1">
                Offer Descriptions in All 4 Languages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-red mb-1">ARABIC DESCRIPTION *</label>
                  <textarea
                    value={excDescAr}
                    onChange={(e) => setExcDescAr(e.target.value)}
                    required
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">ENGLISH DESCRIPTION *</label>
                  <textarea
                    value={excDescEn}
                    onChange={(e) => setExcDescEn(e.target.value)}
                    required
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">FRENCH DESCRIPTION *</label>
                  <textarea
                    value={excDescFr}
                    onChange={(e) => setExcDescFr(e.target.value)}
                    required
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">ITALIAN DESCRIPTION *</label>
                  <textarea
                    value={excDescIt}
                    onChange={(e) => setExcDescIt(e.target.value)}
                    required
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              {excSavedMsg ? (
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <Check className="w-4 h-4" /> Exclusive Offer saved successfully!
                </div>
              ) : <span></span>}

              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-gold text-brand-blue font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-brand-gold/90 transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
                Update Exclusive Offer
              </button>
            </div>
          </form>

          {/* Section B: Weekly Recurring Offers list */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <h3 className="font-extrabold text-sm text-brand-blue uppercase tracking-wider font-mono">
                {t.weeklyOffer} (Recurring Weekly Specials)
              </h3>
            </div>

            {editingWeeklyDay === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyOffers.map((w) => {
                  const isToday = w.dayOfWeek === currentDayOfWeek;
                  return (
                    <div 
                      key={w.dayOfWeek}
                      className={`p-5 rounded-2xl border transition-all duration-300 relative ${
                        isToday 
                          ? 'bg-brand-blue/5 border-brand-gold shadow-md scale-[1.01]' 
                          : 'bg-white border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {isToday && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-brand-gold text-brand-blue font-bold text-[8px] tracking-wider rounded font-mono uppercase animate-pulse">
                          TODAY'S SPECIAL
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-gray-400 font-mono">
                        {t.days[w.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6].toUpperCase()}
                      </span>

                      <h4 className="serif-heading font-bold text-brand-blue text-sm mt-1">
                        {w.title[currentLang] || w.title.en}
                      </h4>

                      <div className="text-[11px] text-brand-red font-mono font-bold mt-1">
                        Offer: {w.discount}
                      </div>

                      <p className="text-gray-500 text-[11px] leading-relaxed mt-2 line-clamp-2">
                        {w.description[currentLang] || w.description.en}
                      </p>

                      <button
                        onClick={() => startEditWeekly(w)}
                        className="mt-4 text-[10px] font-bold text-brand-gold underline hover:text-brand-blue flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit Promo
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Weekly Offer Form */
              <form onSubmit={saveWeeklyOfferSubmit} className="p-6 border border-brand-gold/30 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h4 className="serif-heading font-bold text-brand-blue">
                    Edit Recurring Special for: <span className="text-brand-red">{t.days[editingWeeklyDay as 0 | 1 | 2 | 3 | 4 | 5 | 6]}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingWeeklyDay(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-blue mb-1">Discount Tag (e.g. Free Dessert, 10% OFF)</label>
                  <input
                    type="text"
                    value={weeklyDiscount}
                    onChange={(e) => setWeeklyDiscount(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono font-bold"
                  />
                </div>

                {/* Multilingual Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-red mb-1">ARABIC TITLE *</label>
                    <input
                      type="text"
                      value={weeklyTitleAr}
                      onChange={(e) => setWeeklyTitleAr(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ENGLISH TITLE *</label>
                    <input
                      type="text"
                      value={weeklyTitleEn}
                      onChange={(e) => setWeeklyTitleEn(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">FRENCH TITLE *</label>
                    <input
                      type="text"
                      value={weeklyTitleFr}
                      onChange={(e) => setWeeklyTitleFr(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ITALIAN TITLE *</label>
                    <input
                      type="text"
                      value={weeklyTitleIt}
                      onChange={(e) => setWeeklyTitleIt(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                </div>

                {/* Multilingual Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-red mb-1">ARABIC DESCRIPTION *</label>
                    <textarea
                      value={weeklyDescAr}
                      onChange={(e) => setWeeklyDescAr(e.target.value)}
                      required
                      rows={2}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ENGLISH DESCRIPTION *</label>
                    <textarea
                      value={weeklyDescEn}
                      onChange={(e) => setWeeklyDescEn(e.target.value)}
                      required
                      rows={2}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">FRENCH DESCRIPTION *</label>
                    <textarea
                      value={weeklyDescFr}
                      onChange={(e) => setWeeklyDescFr(e.target.value)}
                      required
                      rows={2}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue mb-1">ITALIAN DESCRIPTION *</label>
                    <textarea
                      value={weeklyDescIt}
                      onChange={(e) => setWeeklyDescIt(e.target.value)}
                      required
                      rows={2}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingWeeklyDay(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-brand-blue/90"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Day Special
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Super Admin (Developer) Tab */}
      {isSuperAdmin && activeTab === 'super' && (
        <div className="space-y-6">
          <div className="p-4 bg-brand-red/5 border border-brand-red/10 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-brand-red mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-brand-red uppercase">SUPER CONTROL ONLY ACCESSIBLE BY DEVELOPERS</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                This Super Panel allows authorizing or revoking manager access by their Gmail address. Managers log in through Google OAuth to access edit rights.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Form to Add Manager */}
            <form onSubmit={handleAddManagerSubmit} className="p-5 border border-gray-100 rounded-2xl bg-slate-50/50 space-y-4">
              <h4 className="font-bold text-xs text-brand-blue uppercase font-mono border-b border-gray-100 pb-2">
                {t.addManager}
              </h4>

              {managerError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-medium">
                  {managerError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-brand-blue mb-1">Manager Gmail Address</label>
                <input
                  type="email"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  placeholder="manager@gmail.com"
                  required
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-blue mb-1">Manager Full Name</label>
                <input
                  type="text"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="e.g. Chef Pierre"
                  required
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-blue mb-1">Manager Entry Password (كلمة مرور الدخول)</label>
                <input
                  type="text"
                  value={newManagerPassword}
                  onChange={(e) => setNewManagerPassword(e.target.value)}
                  placeholder="e.g. 123"
                  required
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
                />
                <p className="text-[9px] text-gray-400 mt-1">Default is '123' if not changed.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-blue mb-1">Manager Interface Language (لغة واجهة المدير)</label>
                <select
                  value={newManagerLang}
                  onChange={(e) => setNewManagerLang(e.target.value as Language)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-medium"
                >
                  <option value="ar">العربية (Arabic) 🇪🇬</option>
                  <option value="en">English 🇬🇧</option>
                  <option value="fr">Français (French) 🇫🇷</option>
                  <option value="it">Italiano (Italian) 🇮🇹</option>
                </select>
                <p className="text-[9px] text-gray-400 mt-1">This language will be locked for this manager.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-red text-white hover:bg-brand-red/90 font-bold rounded-xl text-xs transition-colors"
              >
                {t.addBtn}
              </button>
            </form>

            {/* List of current managers */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-brand-blue uppercase font-mono border-b border-gray-100 pb-2">
                {t.managersList} ({managers.length})
              </h4>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {managers.map((m) => (
                  <div key={m.email} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm">
                    <div>
                      <p className="font-bold text-brand-blue">{m.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500 font-mono">{m.email}</span>
                        {m.password && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-stone-600 text-[9px] font-mono rounded border border-slate-200">
                            Pass: {m.password}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[9px] font-bold rounded border border-amber-100 flex items-center gap-0.5">
                          🌐 {m.lang ? m.lang.toUpperCase() : 'AR'}
                        </span>
                      </div>
                    </div>

                    {/* Cannot remove Super Admin from list to avoid lock-outs */}
                    {m.email === 'oren.on.oren.25@gmail.com' ? (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[8px] tracking-wider rounded font-mono uppercase font-bold">
                        SYSTEM
                      </span>
                    ) : (
                      <button
                        onClick={() => onRemoveManager(m.email)}
                        className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all"
                        title={t.removeBtn}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SINGLE PRODUCT MODAL (iframe-safe) */}
      {productToDeleteId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 text-brand-red rounded-full flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>
              <h3 className="serif-heading text-base font-bold text-brand-blue">
                {currentLang === 'ar' ? 'تأكيد حذف المنتج' : 'Confirm Product Deletion'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {currentLang === 'ar'
                  ? 'هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟'
                  : 'Are you sure you want to permanently delete this product?'}
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setProductToDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDeleteId);
                  setProductToDeleteId(null);
                }}
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {currentLang === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ALL PRODUCTS MODAL (iframe-safe) */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 text-brand-red rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <h3 className="serif-heading text-base font-bold text-brand-red">
                {currentLang === 'ar' ? 'مسح جميع المنتجات' : 'Delete All Products'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {currentLang === 'ar'
                  ? 'هل أنت متأكد من رغبتك في مسح جميع المنتجات بالكامل من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete all products from the database? This action cannot be undone.'}
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAllProducts?.();
                  setShowDeleteAllConfirm(false);
                }}
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {currentLang === 'ar' ? 'مسح الكل' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
