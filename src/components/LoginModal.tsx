import React, { useState } from 'react';
import { ShieldAlert, Mail, ArrowRight, X, KeyRound, Lock } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface LoginModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, name: string, role: "Developer" | "Manager", lang?: Language) => void;
}

export default function LoginModal({
  currentLang,
  isOpen,
  onClose,
  onLoginSuccess
}: LoginModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const t = TRANSLATIONS[currentLang];

  if (!isOpen) return null;

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
          onClose();
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (currentLang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'An error occurred while connecting.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-blue/70 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-brand-cream text-brand-charcoal w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-8 space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Elegant flag icon for premium look */}
          <div className="mx-auto w-12 h-8 flex items-center justify-center relative rounded overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full bg-[#002395]"></div>
              <div className="w-1/3 h-full bg-white"></div>
              <div className="w-1/3 h-full bg-[#ED2939]"></div>
            </div>
          </div>

          <h3 className="serif-heading text-xl font-bold text-brand-blue tracking-tight">
            {currentLang === 'ar' ? 'بوابة المطور والمدراء' : 'Secure Management Gate'}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            {currentLang === 'ar' 
              ? 'تسجيل الدخول الآمن للمشرفين والمدراء المعتمدين لمطعم فرنش تاتش' 
              : 'Authorized developer and staff portal for French Touch Restaurant'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-brand-red/5 border border-brand-red/10 rounded-2xl flex items-start gap-2.5 text-xs text-brand-red">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-blue">
              {currentLang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. oren.on.oren.25@gmail.com"
                required
                className="w-full text-xs p-3.5 pl-10 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-blue">
              {currentLang === 'ar' ? 'كلمة المرور السرية' : 'Secret Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs p-3.5 pl-10 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? (currentLang === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (currentLang === 'ar' ? 'تسجيل دخول آمن' : 'Secure Authenticate')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Small warning */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <KeyRound className="w-3.5 h-3.5 text-brand-gold" />
          <span className="font-serif">French Touch Security Gate — Active Shield</span>
        </div>

      </div>
    </div>
  );
}
