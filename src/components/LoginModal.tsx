import React, { useState } from 'react';
import { ShieldAlert, Mail, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { Language, Manager, TRANSLATIONS } from '../types';

interface LoginModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  onLoginSuccess: (email: string, name: string) => void;
}

export default function LoginModal({
  currentLang,
  isOpen,
  onClose,
  managers,
  onLoginSuccess
}: LoginModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const t = TRANSLATIONS[currentLang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const targetEmail = emailInput.trim().toLowerCase();

    if (!targetEmail) {
      setErrorMsg(currentLang === 'ar' ? 'الرجاء إدخال البريد الإلكتروني.' : 'Please enter an email.');
      return;
    }

    const matchedManager = managers.find(m => m.email.toLowerCase() === targetEmail);

    if (matchedManager) {
      onLoginSuccess(matchedManager.email, matchedManager.name);
      onClose();
    } else {
      setErrorMsg(t.notAuthorized);
    }
  };

  const handleShortcutClick = (m: Manager) => {
    onLoginSuccess(m.email, m.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-brand-cream text-brand-charcoal w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-8 space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Elegant centralized logo representation */}
          <div className="mx-auto w-16 h-10 flex items-center justify-center relative">
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full bg-[#002395]"></div>
              <div className="w-1/3 h-full bg-white"></div>
              <div className="w-1/3 h-full bg-[#ED2939]"></div>
            </div>
            <span className="serif-heading font-black text-brand-blue z-10 text-xs bg-brand-cream/90 px-1.5 py-0.5 rounded shadow-sm">
              FT
            </span>
          </div>

          <h3 className="serif-heading text-xl font-bold text-brand-blue">
            {t.loginWithGoogle}
          </h3>
          <p className="text-xs text-gray-500">
            {currentLang === 'ar' 
              ? 'تسجيل الدخول الآمن للمشرفين المعتمدين لمطعم فرنش تاتش' 
              : 'Secure authorization gate for French Touch authorized staff'}
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
              Gmail Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. uvyffi5@gmail.com"
                required
                className="w-full text-xs p-3.5 pl-10 border border-gray-200 rounded-xl bg-white focus:outline-brand-blue font-mono"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200"
          >
            {currentLang === 'ar' ? 'متابعة المصادقة' : 'Authenticate Email'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Shortcut Selector for Demonstration */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[10px] font-bold text-brand-gold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Developer Login Shortcuts:</span>
          </div>

          <div className="space-y-2">
            {managers.map((m) => (
              <button
                key={m.email}
                onClick={() => handleShortcutClick(m)}
                className="w-full p-3 bg-white hover:bg-gray-50 border border-gray-100 hover:border-brand-gold rounded-xl text-left text-xs flex justify-between items-center transition-all duration-200 group"
              >
                <div>
                  <p className="font-bold text-brand-blue group-hover:text-brand-gold transition-colors">{m.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{m.email}</p>
                </div>
                <span className="text-[9px] font-bold bg-brand-blue/5 text-brand-blue px-2.5 py-1 rounded-lg">
                  {m.email === 'uvyffi5@gmail.com' ? 'Super Admin' : 'Manager'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Small warning */}
        <p className="text-[10px] text-gray-400 text-center leading-relaxed font-serif">
          French Touch Security Gate — ABAC Certified V6
        </p>

      </div>
    </div>
  );
}
