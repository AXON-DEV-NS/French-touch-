import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Globe, ArrowRight, ChefHat, Award } from 'lucide-react';
import { Language, LANGUAGES } from '../types';
import RestaurantLogo from './RestaurantLogo';

interface LanguageLandingScreenProps {
  onSelectLanguage: (lang: Language) => void;
  currentLang: Language;
}

export default function LanguageLandingScreen({
  onSelectLanguage,
  currentLang,
}: LanguageLandingScreenProps) {
  
  // Custom motivating details for each language to entice the user
  const languageHighlights = {
    fr: {
      greeting: 'Bienvenue',
      accentText: 'La Haute Cuisine Française',
      desc: 'Savourez le prestige culinaire et l’élégance ultime à chaque plat.',
      action: 'Commencer l’Expérience ⚜️',
      badge: 'Touche de Prestige',
      ambientGlow: 'rgba(43, 62, 140, 0.15)', // French Blue
      glowBorder: 'border-blue-500/30'
    },
    it: {
      greeting: 'Benvenuti',
      accentText: 'L’Autentico Calore Italiano',
      desc: 'Gustate la passione, la freschezza e i segreti della tradizione italiana.',
      action: 'Inizia il Viaggio ⚜️',
      badge: 'Un Tocco di Passione',
      ambientGlow: 'rgba(34, 197, 94, 0.15)', // Italian Green
      glowBorder: 'border-emerald-500/30'
    },
    ar: {
      greeting: 'مساء الفخامة والروعة',
      accentText: 'أرقى تجربة طهي في القاهرة',
      desc: 'استمتع بمزيج ساحر يجمع بين رقي المطبخ الفرنسي العريق وعراقة المذاق الإيطالي الأصيل.',
      action: 'ابدأ رحلة الطهي الفاخرة ⚜️',
      badge: 'التميز والجمال الفرنسي الإيطالي',
      ambientGlow: 'rgba(239, 68, 68, 0.15)', // Red accent
      glowBorder: 'border-red-500/30'
    },
    en: {
      greeting: 'Welcome',
      accentText: 'Exquisite Gastronomic Fusion',
      desc: 'Embark on a remarkable journey of refined tastes and luxury dining.',
      action: 'Begin the Gastronomic Journey ⚜️',
      badge: 'A Touch of Sophistication',
      ambientGlow: 'rgba(245, 158, 11, 0.15)', // Gold
      glowBorder: 'border-amber-500/30'
    }
  };

  const selectedHighlight = languageHighlights[currentLang] || languageHighlights.ar;

  const handleEnter = () => {
    const el = document.getElementById('language-landing-container');
    if (el) {
      el.classList.add('animate-out', 'fade-out', 'slide-out-to-top-20', 'duration-700');
    }
    setTimeout(() => {
      onSelectLanguage(currentLang);
      // Set true state to dismiss landing
      if (typeof (window as any).__dismissLanding === 'function') {
        (window as any).__dismissLanding();
      }
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0F19] text-[#FDFBF7] flex flex-col items-center justify-center p-4 overflow-hidden" 
      id="language-landing-container"
    >
      {/* Decorative Radial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-[#0B0F19] to-[#05070B] z-0" />
      
      {/* Dynamic Glow that changes color depending on the selected language */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none z-0 transition-colors duration-1000"
        style={{
          backgroundColor: selectedHighlight.ambientGlow,
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating Sparkles in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 800 - 400, 
              y: Math.random() * 600 - 300, 
              scale: Math.random() * 0.4 + 0.5,
              opacity: Math.random() * 0.4 + 0.2
            }}
            animate={{ 
              y: [0, -30, 0], 
              opacity: [0.2, 0.7, 0.2] 
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute left-1/2 top-1/2"
            style={{ 
              marginLeft: `${Math.random() * 80 - 40}%`,
              marginTop: `${Math.random() * 80 - 40}%`,
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
          </motion.div>
        ))}
      </div>

      {/* Flag Borders (Top Line Accent) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10">
        <div className="flex-1 bg-[#2B3E8C]" /> {/* French Blue */}
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#ED2939]" /> {/* French Red */}
      </div>

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl flex flex-col items-center relative z-10 text-center px-4"
      >
        {/* Luxury Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-amber-400/20 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold mb-6 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          French Touch • Paris • Rome • Cairo
        </motion.div>

        {/* Polished Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 scale-110 md:scale-125"
        >
          <RestaurantLogo light />
        </motion.div>

        {/* Dynamic Welcoming Header Box - motivating & engaging */}
        <div className="min-h-[140px] md:min-h-[160px] flex flex-col items-center justify-center mb-8 px-4 w-full">
          <motion.span 
            key={`${currentLang}-badge`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            className="text-[11px] font-bold tracking-widest text-amber-400 uppercase mb-2 font-mono"
          >
            ⚜️ {selectedHighlight.badge} ⚜️
          </motion.span>
          <motion.h1 
            key={`${currentLang}-title`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="serif-heading text-3xl md:text-4xl font-extrabold text-[#FDFBF7] tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF9] to-[#E2DFD9]"
          >
            {selectedHighlight.greeting}
          </motion.h1>
          <motion.p 
            key={`${currentLang}-desc`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-stone-300 text-sm md:text-base max-w-lg leading-relaxed font-medium"
          >
            {selectedHighlight.desc}
          </motion.p>
        </div>

        {/* Clean, Simple Language Grid - No complex forms, just 4 elegant buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl mb-8">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            const hl = languageHighlights[lang.code];
            
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code)}
                id={`lang-select-${lang.code}`}
                className={`flex flex-col items-center justify-between p-4 rounded-2xl text-center transition-all duration-300 transform active:scale-95 border cursor-pointer relative group ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/10 to-white/5 text-amber-300 shadow-xl border-amber-400 scale-[1.05]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] text-[#FDFBF7] border-white/5 hover:border-white/10'
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}

                {/* Country Flag Circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/5 mb-3 border border-white/10 group-hover:scale-110 transition-transform ${isSelected ? 'border-amber-400/40 bg-white/10' : ''}`}>
                  {lang.flag}
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold font-mono tracking-widest text-stone-400 group-hover:text-amber-300 transition-colors">
                    {lang.code.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold mt-1">
                    {lang.name.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Majestic Motivational Entry CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnter}
          id="enter-restaurant-btn"
          className="w-full max-w-md py-4.5 px-8 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black rounded-2xl text-sm shadow-2xl shadow-amber-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
        >
          <span className="tracking-wide">{selectedHighlight.action}</span>
          <ArrowRight className={`w-4 h-4 transition-transform ${currentLang === 'ar' ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Small motivational subtext */}
        <p className="mt-4 text-[10px] text-stone-500 tracking-wider">
          {currentLang === 'ar' ? 'أجواء مذهلة، خدمة راقية، وأطباق تحبس الأنفاس بانتظارك' :
           currentLang === 'fr' ? 'Une ambiance incroyable, un service raffiné et des plats d’exception vous attendent' :
           currentLang === 'it' ? 'Un’atmosfera incredibile, un servizio raffinato e piatti eccezionali ti aspettano' :
           'An incredible ambiance, refined service, and exceptional dishes await you'}
        </p>

        {/* Footer Concept Accent */}
        <div className="mt-12 text-[10px] font-mono text-stone-500 tracking-[0.2em] uppercase flex items-center gap-3">
          <span>Paris</span>
          <span className="text-amber-500/60">•</span>
          <span>Roma</span>
          <span className="text-amber-500/60">•</span>
          <span>Cairo</span>
        </div>
      </motion.div>
    </div>
  );
}
