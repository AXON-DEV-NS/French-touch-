import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface PortalLoginProps {
  currentLang: Language;
  onLoginSuccess: (email: string, name: string, role: 'Developer' | 'Manager', lang?: Language) => void;
}

export default function PortalLogin({ currentLang, onLoginSuccess }: PortalLoginProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const t = TRANSLATIONS[currentLang];

  const handleSubmit = async (e: React.FormEvent) => {
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
          setErrorMsg(currentLang === 'ar' ? 'كلمة مرور المطور غير صحيحة.' : 'Incorrect developer password.');
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
      setErrorMsg(err.message || (currentLang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'An error occurred while connecting.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Tricolor Accent Line on Top */}
      <div className="w-full h-1 absolute top-0 left-0 right-0 flex pointer-events-none z-10">
        <div className="flex-1 h-full bg-[#002395]" />
        <div className="flex-1 h-full bg-white" />
        <div className="flex-1 h-full bg-[#ED2939]" />
      </div>

      {/* Abstract Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Portal Branding */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-gold/30 flex items-center justify-center shadow-lg border border-stone-700/50">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
          </div>

          <div className="space-y-1">
            <h1 className="serif-heading text-xl font-bold tracking-tight text-white">
              {currentLang === 'ar' ? 'بوابة الكوادر المصرحة' : 'Authorized Personnel Gateway'}
            </h1>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              {currentLang === 'ar'
                ? 'النظام الأمني المتكامل لإدارة مطعم فرنش تاتش (المديرين والمطور)'
                : 'Secure administrative portal for French Touch (Managers & Developer)'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-start gap-3 text-xs text-red-400 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <p className="font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300">
              {currentLang === 'ar' ? 'البريد الإلكتروني المهني' : 'Professional Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="manager@frenchtouch.com"
                required
                className="w-full text-xs p-4 pl-11 bg-stone-950 border border-stone-800 focus:border-brand-gold rounded-2xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-stone-100 font-mono transition-all"
              />
              <Mail className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300">
              {currentLang === 'ar' ? 'رمز المرور السري' : 'Secret Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs p-4 pl-11 bg-stone-950 border border-stone-800 focus:border-brand-gold rounded-2xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-stone-100 font-mono transition-all"
              />
              <Lock className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-blue/80 hover:from-brand-gold hover:to-brand-gold text-white hover:text-stone-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading
                ? (currentLang === 'ar' ? 'جاري التحقق والمصادقة...' : 'Verifying Credentials...')
                : (currentLang === 'ar' ? 'تسجيل دخول آمن' : 'Establish Secure Connection')}
            </span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Return to Main Site Link */}
        <div className="pt-4 border-t border-stone-800/60 text-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-brand-gold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{currentLang === 'ar' ? 'الرجوع للموقع الرئيسي' : 'Return to Customer Website'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
