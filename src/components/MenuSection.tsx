import React, { useState, useEffect } from 'react';
import { Soup, Utensils, Cake, GlassWater, Edit, Trash2, Plus, ArrowRight, Coffee, Beer, Pizza, Croissant } from 'lucide-react';
import { Product, Category, Language, TRANSLATIONS, CategoryItem } from '../types';

const getCategoryIcon = (iconName?: string) => {
  switch (iconName?.toLowerCase()) {
    case 'soup':
    case 'appetizers':
      return <Soup className="w-4 h-4" />;
    case 'cake':
    case 'desserts':
      return <Cake className="w-4 h-4" />;
    case 'glasswater':
    case 'drinks':
    case 'beverages':
      return <GlassWater className="w-4 h-4" />;
    case 'coffee':
      return <Coffee className="w-4 h-4" />;
    case 'beer':
      return <Beer className="w-4 h-4" />;
    case 'pizza':
      return <Pizza className="w-4 h-4" />;
    case 'croissant':
      return <Croissant className="w-4 h-4" />;
    default:
      return <Utensils className="w-4 h-4" />;
  }
};

function getProductOrigin(product: Product, lang: Language): { 
  code: 'french' | 'italian'; 
  label: string; 
  colors: string; 
  flag: string;
} {
  const id = product.id;
  const nameEn = (product.name.en || '').toLowerCase();
  const descEn = (product.description.en || '').toLowerCase();
  
  const isItalian = (
    id === 'p1' || 
    id === 'p4' || 
    nameEn.includes('caprese') || 
    nameEn.includes('lasagna') || 
    nameEn.includes('bolognese') || 
    nameEn.includes('tiramisu') || 
    nameEn.includes('risotto') || 
    nameEn.includes('bruschetta') || 
    nameEn.includes('panna cotta') || 
    descEn.includes('italian') || 
    descEn.includes('tuscany') || 
    descEn.includes('roma') || 
    descEn.includes('parmigiano')
  );

  if (isItalian) {
    let label = 'Tocco Italiano';
    if (lang === 'ar') label = 'لمسة إيطالية دافئة';
    else if (lang === 'en') label = 'Subtle Italian Touch';
    else if (lang === 'fr') label = 'Touche Italienne';
    
    return {
      code: 'italian',
      label,
      colors: 'bg-amber-500/5 text-amber-700 border-amber-500/15',
      flag: '✦'
    };
  } else {
    let label = 'Touche Française';
    if (lang === 'ar') label = 'لمسة فرنسية فاخرة';
    else if (lang === 'en') label = 'Elegant French Touch';
    else if (lang === 'it') label = 'Tocco Francese';

    return {
      code: 'french',
      label,
      colors: 'bg-blue-500/10 text-blue-700 border-blue-500/25',
      flag: '🇫🇷'
    };
  }
}

interface MenuSectionProps {
  products: Product[];
  currentLang: Language;
  isManager: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProductClick: () => void;
  onAddToCart?: (product: Product) => void;
  categories: CategoryItem[];
}

export default function MenuSection({
  products,
  currentLang,
  isManager,
  onEditProduct,
  onDeleteProduct,
  onAddProductClick,
  onAddToCart,
  categories = []
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('mains');
  const t = TRANSLATIONS[currentLang];

  // Sync selectedCategory when categories are loaded or updated
  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.id === selectedCategory)) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const filteredProducts = products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-8" id="menu-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="serif-heading text-3xl md:text-4xl font-extrabold text-brand-blue flex items-center gap-2">
            {t.menu}
            <span className="text-brand-gold font-sans font-normal text-lg tracking-wider">/ 01</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {currentLang === 'ar' 
              ? 'تذوق أرقى النكهات المنتقاة بعناية فائقة لتناسب ذوقك الرفيع' 
              : currentLang === 'fr'
              ? 'Savourer les saveurs les plus raffinées, préparées avec passion.'
              : currentLang === 'it'
              ? 'Assapora i sapori più squisiti, preparati con passione.'
              : 'Savor the most exquisite flavors, prepared with ultimate passion.'}
          </p>
        </div>

        {/* Manager Quick Add Button */}
        {isManager && (
          <button
            onClick={onAddProductClick}
            className="self-start md:self-auto px-5 py-2.5 bg-brand-gold text-brand-blue font-bold rounded-xl text-xs flex items-center gap-2 shadow-md hover:bg-brand-gold/90 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            {t.addProduct}
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2.5 justify-start md:justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
              selectedCategory === cat.id
                ? 'bg-brand-blue text-brand-cream shadow-md scale-[1.03]'
                : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100'
            }`}
          >
            <span className={selectedCategory === cat.id ? 'text-brand-gold' : 'text-gray-400'}>
              {getCategoryIcon(cat.icon)}
            </span>
            {cat.name[currentLang] || cat.id}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-400 text-sm font-medium">
            {currentLang === 'ar' ? 'لا توجد أصناف في هذه الفئة حالياً.' : 'No items available in this category yet.'}
          </p>
          {isManager && (
            <button
              onClick={onAddProductClick}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-gold underline hover:text-brand-blue"
            >
              {t.addProduct} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between relative"
            >
              {/* Product Card Top Image with subtle circular/flag vignette overlay */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name[currentLang] || product.name.en}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Aesthetic Circular Flag Border & Category Label */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[10px] font-bold tracking-wider text-brand-blue px-3 py-1 rounded-full shadow-sm border border-brand-gold/20">
                  {t.categories[product.category].toUpperCase()}
                </div>

                {/* Elegant central visual line accent on image hover */}
                <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                </div>

                {/* Manager Quick Actions overlay */}
                {isManager && (
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-2 bg-white/95 backdrop-blur-sm text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl shadow-md transition-all duration-200"
                      title={t.editProduct}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 bg-white/95 backdrop-blur-sm text-brand-red hover:bg-brand-red hover:text-white rounded-xl shadow-md transition-all duration-200"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info Description Area */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="serif-heading text-lg font-bold text-brand-blue leading-tight group-hover:text-brand-gold transition-colors">
                      {product.name[currentLang] || product.name.en}
                    </h3>
                    <div className="flex items-baseline gap-1 bg-brand-gold/10 text-brand-blue font-bold px-3 py-1 rounded-xl text-sm font-mono whitespace-nowrap">
                      <span>{product.price}</span>
                      <span className="text-[10px] font-sans font-medium">{t.currency}</span>
                    </div>
                  </div>

                  {/* Culinary Origin Badge representing French Touch prominence with subtle Italian accents */}
                  <div className="pt-1">
                    {(() => {
                      const origin = getProductOrigin(product, currentLang);
                      return (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[9px] font-extrabold uppercase tracking-wide ${origin.colors}`}>
                          <span>{origin.flag}</span>
                          <span>{origin.label}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                    {product.description[currentLang] || product.description.en}
                  </p>
                </div>

                {/* Underline aesthetic tag element or Add to Cart Button */}
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                  <div className="flex flex-col text-[9px] text-gray-400 uppercase font-semibold font-mono tracking-wider">
                    <span>FT - Selection</span>
                    <span className="text-brand-gold">✨ Ingredients</span>
                  </div>
                  {onAddToCart && (
                    <button
                      onClick={() => onAddToCart(product)}
                      id={`add-to-cart-${product.id}`}
                      className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-gold hover:text-brand-blue text-brand-cream text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all duration-300 transform active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>
                        {currentLang === 'ar' ? 'أضف للطلب' : currentLang === 'fr' ? 'Ajouter' : 'Add'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
