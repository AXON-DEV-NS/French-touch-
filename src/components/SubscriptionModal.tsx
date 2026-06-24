import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, X, Bell, CheckCircle } from 'lucide-react';
import { Language } from '../types';

interface SubscriptionModalProps {
  currentLang: Language;
}

export default function SubscriptionModal({ currentLang }: SubscriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const isRtl = currentLang === 'ar';

  useEffect(() => {
    // Show modal 3.5 seconds after loading the site if they haven't made a choice yet
    const selection = localStorage.getItem('ft_newsletter_subscribed');
    if (!selection) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (res.ok) {
        setIsSubscribed(true);
        localStorage.setItem('ft_newsletter_subscribed', 'subscribed');
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('ft_newsletter_subscribed', 'dismissed');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            onClick={handleDismiss}
          />

          {/* Premium Subscription Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="relative bg-brand-cream text-brand-charcoal w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/20 p-6 md:p-8 space-y-6 text-center"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            {/* Close */}
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Premium French Header Accents */}
            <div className="mx-auto flex justify-center gap-1 w-20 h-1.5 rounded-full overflow-hidden">
              <div className="w-1/3 bg-[#002395] h-full" />
              <div className="w-1/3 bg-white h-full" />
              <div className="w-1/3 bg-[#ED2939] h-full" />
            </div>

            {!isSubscribed ? (
              <>
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-brand-blue/5 rounded-full flex items-center justify-center relative">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
                    </span>
                    <Bell className="w-6 h-6 text-brand-gold" />
                  </div>

                  <h3 className="serif-heading text-xl md:text-2xl font-bold text-brand-blue tracking-tight leading-snug">
                    {isRtl 
                      ? 'احصل على خصومات وأطباق فرنش تاتش الحصرية! 🥐' 
                      : 'Exclusive French Touch Offers & Delicacies! 🥐'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {isRtl 
                      ? 'وافق على استقبال الإشعارات لتصلك أحدث أطباقنا الفاخرة والعروض السرية اليومية مباشرة على حساب الجيميل الخاص بك مجاناً!' 
                      : 'Authorize notifications to receive our premium chef specials, hot secret discounts, and newly launched recipes sent directly to your Gmail for free!'}
                  </p>
                </div>

                {/* Subscription Form */}
                <form onSubmit={handleSubscribe} className="space-y-3 max-w-md mx-auto">
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      placeholder={isRtl ? 'عنوان بريدك الالكتروني (Gmail)' : 'Enter your Gmail address'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs md:text-sm p-4 pl-11 border border-brand-blue/20 focus:border-brand-blue rounded-xl bg-white outline-none font-mono text-center"
                    />
                    <Mail className="absolute left-4 top-4.5 w-4.5 h-4.5 text-gray-400" />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/95 text-brand-cream font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    <span>{loading ? (isRtl ? 'جاري التفعيل...' : 'Subscribing...') : (isRtl ? 'سماح واستقبال العروض المباشرة' : 'Authorize & Send Me Offers')}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={handleDismiss}
                    className="text-[11px] text-gray-400 hover:text-gray-600 underline font-medium transition-colors"
                  >
                    {isRtl ? 'لا شكراً، سأفوت الفرصة الحصرية' : 'No thanks, I choose to miss the elite list'}
                  </button>
                </form>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 space-y-4"
              >
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="serif-heading text-lg md:text-xl font-bold text-emerald-600">
                  {isRtl ? 'أنت الآن في قائمة النخبة الفاخرة! 🎉' : 'Welcome to the Culinary Elite! 🎉'}
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  {isRtl 
                    ? 'تم تسجيل بريدك الإلكتروني بنجاح. ستصلك أشهى عروضنا وأطباقنا مباشرة على جيميل.' 
                    : 'Your email has been subscribed. Expect exquisite, hand-crafted updates straight to your mailbox soon.'}
                </p>
              </motion.div>
            )}

            {/* Footer warning */}
            <p className="text-[10px] text-gray-400 font-serif">
              {isRtl ? 'نحترم خصوصيتك بالكامل. يمكنك إلغاء الاشتراك في أي وقت.' : 'We fully respect your inbox. You can opt-out at any time.'}
            </p>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
