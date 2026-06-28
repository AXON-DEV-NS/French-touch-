import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Sparkles, Wrench, Mail, Lock, ShieldAlert, AlertCircle, Eye, EyeOff, Globe } from 'lucide-react';
import { Language } from '../types';
import RestaurantLogo from './RestaurantLogo';

interface MaintenanceScreenProps {
  currentLang: Language;
  onSelectLanguage: (lang: Language) => void;
  onLoginSuccess: (email: string, name: string, role: 'Developer' | 'Manager', lang?: Language) => void;
}

export default function MaintenanceScreen({
  currentLang,
  onSelectLanguage,
  onLoginSuccess
}: MaintenanceScreenProps) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isRtl = currentLang === 'ar';

  const t = {
    ar: {
      title: 'الموقع تحت التطوير والصيانة حالياً',
      subtitle: 'نحن نعمل خلف الكواليس على ترقية وتحديث منصة "فرنش تاتش" لنقدم لكم تجربة طهي رقمية فائقة الفخامة تليق بطلبكم ومذاقكم الراقي.',
      backSoon: 'سنعود للخدمة واستقبال طلباتكم قريباً جداً ⚜️',
      developerAccess: 'بوابة الإدارة والمطورين',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      loginBtn: 'تسجيل الدخول الآمن',
      invalidDev: 'كلمة مرور المطور غير صحيحة.',
      loadingText: 'جاري التحقق...',
      generalError: 'حدث خطأ أثناء الاتصال بالخادم.',
      companyTag: 'الموقع تم تصميمه وتطويره بواسطة الشركة المطورة لشاشات فرنش تاتش الاحترافية.',
      languageText: 'تغيير اللغة / Change Language'
    },
    en: {
      title: 'Site Under Maintenance & Development',
      subtitle: 'We are working behind the scenes to upgrade and refine the "French Touch" platform to deliver an ultra-luxurious dining experience that matches your refined taste.',
      backSoon: 'We will be back online and accepting orders very soon ⚜️',
      developerAccess: 'Management & Developer Portal',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      loginBtn: 'Secure Login',
      invalidDev: 'Incorrect developer password.',
      loadingText: 'Verifying...',
      generalError: 'An error occurred while connecting.',
      companyTag: 'This platform is developed and maintained by the French Touch Professional Development Team.',
      languageText: 'تغيير اللغة / Change Language'
    },
    fr: {
      title: 'Site en Cours de Maintenance',
      subtitle: 'Nous travaillons en coulisses pour améliorer et perfectionner la plateforme "French Touch" afin de vous offrir une expérience gastronomique numérique d’exception.',
      backSoon: 'Nous serons de retour très bientôt pour vos commandes ⚜️',
      developerAccess: 'Portail Administration & Développeur',
      emailLabel: 'Adresse E-mail',
      passwordLabel: 'Mot de passe',
      loginBtn: 'Connexion Sécurisée',
      invalidDev: 'Mot de passe développeur incorrect.',
      loadingText: 'Vérification...',
      generalError: 'Une erreur est survenue lors de la connexion.',
      companyTag: 'Cette plateforme est développée par l’équipe de développement professionnel de French Touch.',
      languageText: 'تغيير اللغة / Change Language'
    },
    it: {
      title: 'Sito in Manutenzione',
      subtitle: 'Stiamo lavorando dietro le quinte per aggiornare la piattaforma "French Touch" per offrirvi un\'esperienza culinaria digitale di altissimo livello.',
      backSoon: 'Saremo di nuovo online molto presto per i vostri ordini ⚜️',
      developerAccess: 'Portale Amministrazione & Sviluppatori',
      emailLabel: 'Indirizzo E-mail',
      passwordLabel: 'Password',
      loginBtn: 'Accesso Sicuro',
      invalidDev: 'Password sviluppatore errata.',
      loadingText: 'Verifica...',
      generalError: 'Si è verificato un errore durante la connessione.',
      companyTag: 'Questa piattaforma è sviluppata dal team di sviluppo professionale di French Touch.',
      languageText: 'تغيير اللغة / Change Language'
    }
  }[currentLang] || {
    title: 'الموقع تحت التطوير والصيانة حالياً',
    subtitle: 'نحن نعمل خلف الكواليس على ترقية وتحديث منصة "فرنش تاتش" لنقدم لكم تجربة طهي رقمية فائقة الفخامة تليق بطلبكم ومذاقكم الراقي.',
    backSoon: 'سنعود للخدمة واستقبال طلباتكم قريباً جداً ⚜️',
    developerAccess: 'بوابة الإدارة والمطورين',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    loginBtn: 'تسجيل الدخول الآمن',
    invalidDev: 'كلمة مرور المطور غير صحيحة.',
    loadingText: 'جاري التحقق...',
    generalError: 'حدث خطأ أثناء الاتصال بالخادم.',
    companyTag: 'الموقع تم تصميمه وتطويره بواسطة الشركة المطورة لشاشات فرنش تاتش الاحترافية.',
    languageText: 'تغيير اللغة / Change Language'
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const targetEmail = emailInput.trim().toLowerCase();
    const targetPassword = passwordInput.trim();

    if (!targetEmail || !targetPassword) {
      setErrorMsg(currentLang === 'ar' ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Developer Special Check
      if (targetEmail === 'oren.on.oren.25@gmail.com') {
        if (targetPassword === '159357258456Aa##') {
          onLoginSuccess('oren.on.oren.25@gmail.com', 'Developer', 'Developer');
          setLoading(false);
          return;
        } else {
          setErrorMsg(t.invalidDev);
          setLoading(false);
          return;
        }
      }

      // 2. Manager Login via Backend Authenticator
      const res = await fetch('/api/auth/manager-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشلت المصادقة');
      }

      onLoginSuccess(data.user.email, data.user.name, 'Manager', data.user.lang);
    } catch (err: any) {
      setErrorMsg(err.message || t.generalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden ${isRtl ? 'ar-dir' : 'ltr-dir'}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Top Margin Accent (French Colors) */}
      <div className="w-full h-1.5 absolute top-0 left-0 right-0 flex pointer-events-none">
        <div className="flex-1 h-full bg-[#002395]" />
        <div className="flex-1 h-full bg-white" />
        <div className="flex-1 h-full bg-[#ED2939]" />
      </div>

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-gradient-to-tr from-amber-500/10 to-red-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Language Selector at the Top */}
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center relative z-10 py-2">
        <div className="opacity-80">
          <RestaurantLogo />
        </div>
        <div className="flex items-center gap-2 bg-stone-900/60 backdrop-blur-md border border-stone-800/80 px-3.5 py-1.5 rounded-2xl">
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={currentLang}
            onChange={(e) => onSelectLanguage(e.target.value as Language)}
            className="bg-transparent text-xs text-stone-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ar" className="bg-stone-900 text-stone-200">العربية 🇪🇬</option>
            <option value="en" className="bg-stone-900 text-stone-200">English 🇺🇸</option>
            <option value="fr" className="bg-stone-900 text-stone-200">Français 🇫🇷</option>
            <option value="it" className="bg-stone-900 text-stone-200">Italiano 🇮🇹</option>
          </select>
        </div>
      </div>

      {/* Center Hero Card */}
      <div className="max-w-2xl w-full mx-auto my-auto relative z-10 py-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-24 h-24 bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/40 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/5 mb-8 relative"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Wrench className="w-10 h-10 text-amber-400" />
          </motion.div>
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="serif-heading text-3xl md:text-4xl font-black text-[#FDFBF7] tracking-tight leading-snug mb-5"
        >
          {t.title}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-stone-300 text-sm md:text-base leading-relaxed max-w-xl mb-8"
        >
          {t.subtitle}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-5 py-3 rounded-2xl text-xs font-bold text-amber-300 shadow-sm"
        >
          <ChefHat className="w-4 h-4" />
          <span>{t.backSoon}</span>
        </motion.div>

        {/* Collapsible Admin/Developer login */}
        <div className="w-full max-w-sm mt-12 pt-6 border-t border-stone-800/60">
          {!showAdminLogin ? (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-stone-500 hover:text-stone-300 text-xs font-bold transition-all underline decoration-stone-600 hover:decoration-stone-400 cursor-pointer"
            >
              {t.developerAccess}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900/80 backdrop-blur-md border border-stone-800 p-5 rounded-2xl text-right"
              style={{ direction: isRtl ? 'rtl' : 'ltr' }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {t.developerAccess}
                </span>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setErrorMsg('');
                  }}
                  className="text-stone-500 hover:text-stone-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-400">{t.emailLabel}</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all text-left placeholder-stone-700"
                      disabled={loading}
                    />
                    <Mail className="w-3.5 h-3.5 text-stone-600 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-400">{t.passwordLabel}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 transition-all text-left placeholder-stone-700"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-stone-600 hover:text-stone-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-950/30 border border-red-900/40 p-3 rounded-xl flex items-start gap-2 text-right">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-red-300 leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? t.loadingText : t.loginBtn}</span>
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>

      {/* Beautiful footer tag designed cleanly */}
      <div className="max-w-7xl w-full mx-auto text-center relative z-10 pt-4 border-t border-stone-900/60 mt-auto">
        <p className="text-[10px] text-stone-500 font-medium font-sans">
          {t.companyTag}
        </p>
        <p className="text-[9px] text-stone-600 font-mono mt-1">
          French Touch © {new Date().getFullYear()} - Professional Operations Engine
        </p>
      </div>
    </div>
  );
}
