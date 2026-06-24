import React, { useState, useEffect } from 'react';
import { Timer, Sparkles, Percent, Edit3 } from 'lucide-react';
import { ExclusiveOffer, Language, TRANSLATIONS } from '../types';

interface ExclusiveOfferBannerProps {
  offer: ExclusiveOffer;
  currentLang: Language;
  isManager: boolean;
  onEditOfferClick: () => void;
}

export default function ExclusiveOfferBanner({
  offer,
  currentLang,
  isManager,
  onEditOfferClick
}: ExclusiveOfferBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (!offer.active || !offer.endTime) {
      setTimeLeft(prev => ({ ...prev, isExpired: true }));
      return;
    }

    const calculateTime = () => {
      const difference = +new Date(offer.endTime) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [offer.endTime, offer.active]);

  if (!offer.active) return null;

  return (
    <div className="bg-brand-blue rounded-3xl overflow-hidden shadow-xl text-brand-cream relative border border-brand-gold/10" id="exclusive-offer">
      {/* Visual Accent - French Flag ribbon */}
      <div className="absolute top-0 left-0 w-full h-1.5 flex">
        <div className="w-1/3 bg-[#002395]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#ED2939]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Banner Details (7 cols) */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-8 relative">
          {/* Decorative background logo watermarks */}
          <div className="absolute right-8 bottom-8 text-white/[0.02] serif-heading text-9xl font-bold select-none pointer-events-none">
            FT
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-blue font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 animate-pulse" />
                {t.exclusiveOffer}
              </span>
              {isManager && (
                <button
                  onClick={onEditOfferClick}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-brand-gold transition-colors"
                  title="Modify Exclusive Offer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h3 className="serif-heading text-3xl md:text-4xl font-bold leading-tight text-brand-gold">
              {offer.title[currentLang] || offer.title.en}
            </h3>

            <p className="text-brand-cream/80 text-sm md:text-base leading-relaxed max-w-xl">
              {offer.description[currentLang] || offer.description.en}
            </p>
          </div>

          {/* Countdown timer UI */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-brand-gold">
              <Timer className="w-5 h-5 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider font-mono">
                {timeLeft.isExpired ? t.offerEnded : t.endsIn}:
              </span>
            </div>

            {!timeLeft.isExpired && (
              <div className="flex items-center gap-3">
                {/* Hours Block */}
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-xl md:text-2xl font-bold font-mono min-w-[50px] text-center border border-white/5 shadow-inner">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-brand-cream/50 uppercase mt-1 font-semibold">{t.hours}</span>
                </div>

                <span className="text-brand-gold font-bold text-xl pb-5">:</span>

                {/* Minutes Block */}
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-xl md:text-2xl font-bold font-mono min-w-[50px] text-center border border-white/5 shadow-inner">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-brand-cream/50 uppercase mt-1 font-semibold">{t.minutes}</span>
                </div>

                <span className="text-brand-gold font-bold text-xl pb-5">:</span>

                {/* Seconds Block */}
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-xl md:text-2xl font-bold font-mono min-w-[50px] text-center border border-white/5 shadow-inner text-brand-gold">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-brand-cream/50 uppercase mt-1 font-semibold">{t.seconds}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner Right Visual Card (5 cols) */}
        <div className="lg:col-span-5 relative min-h-[250px] overflow-hidden lg:rounded-r-3xl">
          <img
            src={offer.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"}
            alt="Exclusive Offer Culinary"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {/* Floating discount tag */}
          <div className="absolute top-6 right-6 bg-brand-red text-white p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center transform rotate-6 border border-white/20">
            <Percent className="w-4 h-4 mb-1 text-white/80" />
            <span className="font-mono text-xl font-black">{offer.discount}</span>
            <span className="text-[8px] uppercase tracking-widest font-bold">SAVINGS</span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-t from-brand-blue via-transparent to-transparent opacity-80 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
