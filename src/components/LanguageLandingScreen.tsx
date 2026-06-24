import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';
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
  
  // Custom elegant greeting in each of the 4 languages
  const greetings = [
    { 
      lang: 'fr' as Language, 
      title: 'Bienvenue', 
      subtitle: 'La Haute Cuisine Française', 
      badge: 'Touche de Prestige', 
      flagColor: 'from-[#2B3E8C] via-white to-[#ED2939]' 
    },
    { 
      lang: 'it' as Language, 
      title: 'Benvenuti', 
      subtitle: 'L’Autentico Calore Italiano', 
      badge: 'Un Tocco di Passione', 
      flagColor: 'from-amber-500/40 via-stone-800 to-stone-900' 
    },
    { 
      lang: 'ar' as Language, 
      title: 'مرحباً بكم', 
      subtitle: 'حيث الفخامة الفرنسية تلتقي بالدفء الإيطالي', 
      badge: 'أرقى تجربة طهي في القاهرة', 
      flagColor: 'from-[#ED2939] via-white to-black' 
    },
    { 
      lang: 'en' as Language, 
      title: 'Welcome', 
      subtitle: 'Exquisite French & Italian Fusion', 
      badge: 'A Touch of Sophistication', 
      flagColor: 'from-[#2B3E8C] via-white to-[#ED2939]' 
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B1120] text-[#FDFBF7] flex flex-col items-center justify-center p-4 overflow-hidden" 
      id="language-landing-container"
    >
      {/* Absolute Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-stone-950 to-stone-950 z-0" />
      
      {/* Animated Glowing Ambient Light */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 pointer-events-none z-0"
      />

      {/* Floating Sparkles in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 1000 - 500, 
              y: Math.random() * 800 - 400, 
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.3 
            }}
            animate={{ 
              y: [0, -40, 0], 
              opacity: [0.2, 0.8, 0.2] 
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute left-1/2 top-1/2"
            style={{ 
              marginLeft: `${Math.random() * 100 - 50}%`,
              marginTop: `${Math.random() * 100 - 50}%`,
            }}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
          </motion.div>
        ))}
      </div>

      {/* Flag Borders (Top Line Accent) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10">
        {/* Dominant French Tricolore spanning 100% of the screen width */}
        <div className="flex-1 bg-[#2B3E8C]" /> {/* French Blue */}
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#ED2939]" /> {/* French Red */}
      </div>

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10 text-center px-4"
      >
        {/* Luxury Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-amber-400/20 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold mb-8 shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          L’Art de la Table • Cairo
        </motion.div>

        {/* Polished Logo in light theme for dark landing background */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <RestaurantLogo light className="scale-110 md:scale-125" />
        </motion.div>

        {/* Dynamic Multilingual Greetings Carousel (fades between languages or stacks them elegantly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
          {greetings.map((g, idx) => (
            <motion.div
              key={g.lang}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
              className={`p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex flex-col justify-between text-left relative overflow-hidden transition-all hover:border-amber-400/30 group ${
                currentLang === g.lang ? 'ring-1 ring-amber-400/50 bg-white/[0.07]' : ''
              }`}
            >
              {/* Country Micro Stripe in the bottom corner */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${g.flagColor}`} />

              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-bold tracking-widest text-amber-400/80 uppercase font-mono">
                  {g.badge}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-white/90">
                  {LANGUAGES.find(l => l.code === g.lang)?.name}
                </span>
              </div>
              <h4 className="serif-heading text-xl font-bold text-[#FDFBF7] group-hover:text-amber-300 transition-colors">
                {g.title}
              </h4>
              <p className="text-stone-400 text-xs mt-1 leading-snug">
                {g.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Language Selection Interface */}
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Decorative French Ribbon inside the box */}
          <div className="absolute top-0 left-0 w-full h-[3px] flex">
            <div className="flex-1 bg-[#2B3E8C]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#ED2939]" />
          </div>

          <h3 className="serif-heading text-lg md:text-xl font-medium text-amber-300 mb-6 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4" />
            اختر لغتك المفضلة لدخول المطعم
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  id={`lang-select-${lang.code}`}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform active:scale-95 ${
                    isSelected
                      ? 'bg-[#FDFBF7] text-[#1C1917] shadow-lg scale-[1.03] ring-2 ring-amber-400/50'
                      : 'bg-white/5 hover:bg-white/10 text-[#FDFBF7] border border-white/10'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-xs opacity-70 uppercase tracking-wider font-mono">
                      {lang.code}
                    </span>
                    <span className="text-sm font-bold leading-none mt-0.5">
                      {lang.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Majestic CTA to Enter Site */}
          <button
            onClick={() => {
              // Smooth exit could be simulated easily
              const el = document.getElementById('language-landing-container');
              if (el) {
                el.classList.add('animate-out', 'fade-out', 'slide-out-to-top-20', 'duration-700');
              }
              // Give 300ms for visual elegance, then let App know selection is made
              setTimeout(() => {
                onSelectLanguage(currentLang);
                // Set true state to dismiss landing
                (window as any).__dismissLanding?.();
              }, 400);
            }}
            id="enter-restaurant-btn"
            className="w-full mt-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#1C1917] font-black rounded-2xl text-sm shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            {currentLang === 'ar' ? 'دخول إلى المطعم' :
             currentLang === 'fr' ? 'Entrer au Restaurant' :
             currentLang === 'it' ? 'Entra nel Ristorante' :
             'Enter the Restaurant'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Notes with subtle details */}
        <div className="mt-8 text-stone-500 text-[11px] font-mono tracking-widest uppercase flex items-center gap-2">
          <span>Paris</span>
          <span className="text-amber-400">•</span>
          <span>Rome</span>
          <span className="text-amber-400">•</span>
          <span>Cairo</span>
        </div>
      </motion.div>
    </div>
  );
}
