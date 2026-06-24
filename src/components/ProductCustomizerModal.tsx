import React, { useState, useEffect } from 'react';
import { Product, Language, CustomizeOption } from '../types';
import { INITIAL_ADDONS, INITIAL_SAUCES } from '../initialData';
import { Plus, Minus, ShoppingBag, X } from 'lucide-react';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentLang: Language;
  onConfirm: (
    product: Product,
    quantity: number,
    selectedAddons: CustomizeOption[],
    selectedSauces: CustomizeOption[]
  ) => void;
}

export default function ProductCustomizerModal({
  isOpen,
  onClose,
  product,
  currentLang,
  onConfirm
}: ProductCustomizerModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<CustomizeOption[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<CustomizeOption[]>([]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
      setSelectedSauces([]);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const showAddons = product.canHaveAddons ?? false;
  const showSauces = product.canHaveSauces ?? false;

  const handleToggleAddon = (addon: CustomizeOption) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleToggleSauce = (sauce: CustomizeOption) => {
    if (selectedSauces.some((s) => s.id === sauce.id)) {
      setSelectedSauces(selectedSauces.filter((s) => s.id !== sauce.id));
    } else {
      setSelectedSauces([...selectedSauces, sauce]);
    }
  };

  const addonsCost = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const saucesCost = selectedSauces.reduce((sum, s) => sum + s.price, 0);
  const singleItemPrice = product.price + addonsCost + saucesCost;
  const totalCost = singleItemPrice * quantity;

  const isRtl = currentLang === 'ar';

  const t = {
    title: isRtl ? 'تخصيص طلبك الفاخر' : 'Customize Your Selection',
    addonsTitle: isRtl ? 'إضافات مميزة (اختياري)' : 'Gourmet Add-ons (Optional)',
    saucesTitle: isRtl ? 'صوصات إضافية في الساندوتش' : 'Premium Sauces',
    quantity: isRtl ? 'الكمية' : 'Quantity',
    addToCart: isRtl ? 'أضف للطلب' : 'Add to Gourmet Tray',
    currency: isRtl ? 'ج.م' : 'EGP',
    total: isRtl ? 'المجموع' : 'Total',
    close: isRtl ? 'إغلاق' : 'Close'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        id="product-customizer-modal"
      >
        {/* Header Image & Detail */}
        <div className="relative h-48 sm:h-56 bg-slate-100 shrink-0">
          <img 
            src={product.image} 
            alt={product.name[currentLang] || product.name.en}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-lg transition-all cursor-pointer"
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Product Name overlay */}
          <div className="absolute bottom-4 left-6 right-6 text-white text-left">
            <h3 className="serif-heading text-lg sm:text-2xl font-black text-brand-cream tracking-tight leading-tight">
              {product.name[currentLang] || product.name.en}
            </h3>
            <p className="text-[10px] sm:text-xs text-brand-gold/90 font-mono mt-1 font-bold">
              {product.price} {t.currency}
            </p>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <p className="text-gray-500 text-xs leading-relaxed border-b border-slate-100 pb-4 text-start">
            {product.description[currentLang] || product.description.en}
          </p>

          {/* Add-ons Checklist */}
          {showAddons && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-brand-blue flex items-center gap-1.5 text-start">
                <span>🧀</span>
                <span>{t.addonsTitle}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INITIAL_ADDONS.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-start transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-brand-blue font-bold shadow-sm'
                          : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{addon.name[currentLang] || addon.name.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sauces Checklist */}
          {showSauces && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-brand-blue flex items-center gap-1.5 text-start">
                <span>🥫</span>
                <span>{t.saucesTitle}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INITIAL_SAUCES.map((sauce) => {
                  const isSelected = selectedSauces.some((s) => s.id === sauce.id);
                  return (
                    <button
                      key={sauce.id}
                      onClick={() => handleToggleSauce(sauce)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-start transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-brand-blue font-bold shadow-sm'
                          : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{sauce.name[currentLang] || sauce.name.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Area - Fixed */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            {/* Quantity Control */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-500 mr-2">{t.quantity}</span>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white text-slate-600 font-bold transition-all cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-black font-mono text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white text-slate-600 font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Total Cost Presentation */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.total}</span>
              <span className="text-lg font-black text-amber-600 font-mono">
                {totalCost} {t.currency}
              </span>
            </div>
          </div>

          <button
            onClick={() => onConfirm(product, quantity, selectedAddons, selectedSauces)}
            className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-brand-gold" />
            <span>{t.addToCart}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
