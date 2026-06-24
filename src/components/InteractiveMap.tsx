import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface InteractiveMapProps {
  currentLang: Language;
}

export default function InteractiveMap({ currentLang }: InteractiveMapProps) {
  const [selectedBranch, setSelectedBranch] = useState<'medical' | 'waha'>('medical');
  const [navigationActive, setNavigationActive] = useState(false);
  const t = TRANSLATIONS[currentLang];

  const branches = {
    medical: {
      name: t.medicalBranch,
      mapUrl: 'https://maps.app.goo.gl/kZrtWKGWMr1mMZmY6?g_st=ac',
      address: currentLang === 'ar' 
        ? 'التجمع الخامس، شارع التسعين الشمالي، بجوار مستشفى الجوية، القاهرة الجديدة'
        : currentLang === 'fr'
        ? 'Cinquième Établissement, Rue Nord du 90, à côté de l\'Hôpital Aérien, Nouveau Le Caire'
        : currentLang === 'it'
        ? 'Quinto Insediamento, Via Nord 90, vicino all\'Ospedale Militare, Nuovo Cairo'
        : 'Fifth Settlement, North 90th St, next to Air Force Hospital, New Cairo',
      phone: '+20 104 468 6954',
      hours: '12:00 PM - 01:00 AM',
      coords: { x: 420, y: 220 }, // position on SVG map
      routeDuration: currentLang === 'ar' ? '١٨ دقيقة (خالي من الازدحام)' : currentLang === 'fr' ? '18 min (Trafic fluide)' : currentLang === 'it' ? '18 min (Traffico regolare)' : '18 mins (Fluid traffic)'
    },
    waha: {
      name: t.wahaBranch,
      mapUrl: 'https://maps.app.goo.gl/7ecAh73zpgYJ2sZU6',
      address: currentLang === 'ar' 
        ? 'الحي العاشر، منطقة الواحة، خلف مسجد المشير طنطاوي، مدينة نصر'
        : currentLang === 'fr'
        ? '10ème district, Quartier El Waha, derrière la Mosquée El Mousheer, Nasr City'
        : currentLang === 'it'
        ? '10° Distretto, Zona El Waha, dietro la Moschea El Mousheer, Nasr City'
        : '10th District, El Waha Area, behind El Mousheer Tantawy Mosque, Nasr City',
      phone: '+20 104 468 6954',
      hours: '11:00 AM - Midnight',
      coords: { x: 260, y: 140 },
      routeDuration: currentLang === 'ar' ? '١٢ دقيقة (ازدحام طفيف)' : currentLang === 'fr' ? '12 min (Ralentissement léger)' : currentLang === 'it' ? '12 min (Traffico moderato)' : '12 mins (Light traffic)'
    }
  };

  const activeBranch = branches[selectedBranch];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="branches-section">
      {/* Map Information / Branch Details Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-brand-blue text-brand-cream p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Subtle decorative French flag background touch */}
        <div className="absolute top-0 right-0 w-3 h-full flex flex-col">
          <div className="h-1/3 bg-[#002395]"></div>
          <div className="h-1/3 bg-white"></div>
          <div className="h-1/3 bg-[#ED2939]"></div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-brand-gold/30">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            {t.cairoLocations}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedBranch('medical'); setNavigationActive(false); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all duration-300 ${
                selectedBranch === 'medical'
                  ? 'bg-brand-gold text-brand-blue shadow-lg scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/15 text-brand-cream'
              }`}
            >
              {t.medicalBranch.split('(')[0]}
            </button>
            <button
              onClick={() => { setSelectedBranch('waha'); setNavigationActive(false); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all duration-300 ${
                selectedBranch === 'waha'
                  ? 'bg-brand-gold text-brand-blue shadow-lg scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/15 text-brand-cream'
              }`}
            >
              {t.wahaBranch.split('(')[0]}
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="serif-heading text-2xl font-bold text-brand-gold">
              {activeBranch.name}
            </h3>

            <div className="space-y-3 text-sm text-brand-cream/80">
              <div>
                <p className="font-semibold text-brand-cream mb-1">{t.address}:</p>
                <p>{activeBranch.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-semibold text-brand-cream mb-1">{t.phone}:</p>
                  <a href={`tel:${activeBranch.phone}`} className="hover:text-brand-gold transition-colors font-mono">
                    {activeBranch.phone}
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-brand-cream mb-1">{t.workingHours}:</p>
                  <p className="font-mono text-xs">{activeBranch.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {navigationActive && (
            <div className="p-4 bg-brand-cream/10 border border-brand-gold/30 rounded-2xl animate-pulse">
              <div className="flex items-center justify-between text-xs text-brand-gold mb-1 font-semibold">
                <span>📍 GPS NAVIGATION SIMULATION ACTIVE</span>
                <span className="font-mono">{activeBranch.routeDuration}</span>
              </div>
              <p className="text-xs text-brand-cream/90">
                {currentLang === 'ar'
                  ? 'يتم تتبع المسار الأسرع الآن عبر المحاور الرئيسية من وسط البلد.'
                  : currentLang === 'fr'
                  ? 'Calcul de l\'itinéraire le plus rapide depuis le centre-ville.'
                  : currentLang === 'it'
                  ? 'Calcolo del percorso più veloce dal centro città.'
                  : 'Tracing the fastest route in real-time from Downtown Cairo.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a
              href={activeBranch.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setNavigationActive(true)}
              className="py-3 bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 text-center"
            >
              <Navigation className="w-4 h-4" />
              {t.getDirections}
            </a>
            <a
              href={`tel:${activeBranch.phone}`}
              className="py-3 border border-brand-cream/20 hover:bg-white/10 text-brand-cream font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 text-center"
            >
              {t.reserveTable}
            </a>
            <a
              href="https://wa.me/201044686954"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 text-center"
            >
              <span className="text-base leading-none">💬</span>
              {currentLang === 'ar' ? 'واتساب' : 'WhatsApp'}
            </a>
          </div>
        </div>
      </div>

      {/* SVG Interactive Map Vector Panel */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-brand-blue/5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-ping"></div>
            <span className="text-xs font-bold tracking-wider text-brand-blue font-mono uppercase">
              {currentLang === 'ar' ? 'خريطة تفاعلية لشرق القاهرة' : 'East Cairo Interactive Vector Map'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">Scale: 1:15,000</span>
        </div>

        {/* Beautiful vector canvas with landmarks and branches */}
        <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
          <svg
            className="w-full h-full text-slate-300"
            viewBox="0 0 500 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
              <linearGradient id="nileGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="500" height="300" fill="url(#grid)" />

            {/* River Nile (Left side) */}
            <path
              d="M 20 -10 C 35 40, 15 100, 25 150 C 35 200, 20 260, 40 310"
              stroke="url(#nileGrad)"
              strokeWidth="24"
              strokeLinecap="round"
              className="opacity-40"
            />
            <text x="25" y="80" fill="#0284c7" fontSize="8" fontFamily="sans-serif" className="font-bold rotate-90 opacity-60">
              {currentLang === 'ar' ? 'نهر النيل' : 'Nile River'}
            </text>

            {/* Major Highways / Ring Road (Circular Beltway) */}
            <path
              d="M 50 150 C 120 50, 380 50, 450 150 C 380 250, 120 250, 50 150 Z"
              stroke="#cbd5e1"
              strokeWidth="4"
              strokeDasharray="4 2"
              className="opacity-70"
            />
            <text x="180" y="44" fill="#64748b" fontSize="7" fontFamily="monospace" className="opacity-80">
              {currentLang === 'ar' ? 'الطريق الدائري' : 'Cairo Ring Road'}
            </text>

            {/* Nasr Road / North 90th St */}
            <path d="M 120 180 L 260 140 L 420 220" stroke="#94a3b8" strokeWidth="3" className="opacity-40" />

            {/* Cairo Downtown & Landmarks */}
            <circle cx="80" cy="150" r="14" fill="#cbd5e1" fillOpacity="0.4" />
            <text x="50" y="153" fill="#475569" fontSize="8" className="font-semibold">
              {currentLang === 'ar' ? 'وسط البلد' : 'Downtown'}
            </text>

            {/* Nasr City Area */}
            <text x="200" y="115" fill="#94a3b8" fontSize="8" fontWeight="bold">
              {currentLang === 'ar' ? 'مدينة نصر' : 'Nasr City'}
            </text>

            {/* Fifth Settlement Area */}
            <text x="380" y="260" fill="#94a3b8" fontSize="8" fontWeight="bold">
              {currentLang === 'ar' ? 'التجمع الخامس' : 'New Cairo'}
            </text>

            {/* Landmark: El Mousheer Mosque */}
            <g transform="translate(290, 105)">
              <rect x="0" y="0" width="8" height="8" rx="1" fill="#cbd5e1" />
              <text x="12" y="7" fill="#64748b" fontSize="6">
                {currentLang === 'ar' ? 'مسجد المشير' : 'El Mousheer Mosque'}
              </text>
            </g>

            {/* GPS Navigation Route Overlay (Dynamic Dotted line) */}
            {navigationActive && (
              <path
                d={selectedBranch === 'medical' 
                  ? "M 80 150 Q 200 130 260 140 T 420 220" 
                  : "M 80 150 Q 150 130 260 140"
                }
                stroke={selectedBranch === 'medical' ? '#C8102E' : '#0A1C3A'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="8 4"
                className="animate-route-dash"
                style={{
                  strokeDashoffset: 100,
                  animation: 'dash 5s linear infinite'
                }}
              />
            )}

            {/* Branch 2: El Waha Branch (Nasr City) */}
            <g 
              transform="translate(260, 140)" 
              className="cursor-pointer"
              onClick={() => { setSelectedBranch('waha'); }}
            >
              <circle cx="0" cy="0" r="12" fill={selectedBranch === 'waha' ? '#0A1C3A' : '#f1f5f9'} stroke="#0A1C3A" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4" fill="#C8102E" className={selectedBranch === 'waha' ? 'animate-ping' : ''} />
              <text x="-15" y="-16" fill="#0A1C3A" fontSize="8" fontWeight="bold" className="serif-heading">
                Touch El Waha
              </text>
            </g>

            {/* Branch 1: Medical Center 3 (New Cairo) */}
            <g 
              transform="translate(420, 220)" 
              className="cursor-pointer"
              onClick={() => { setSelectedBranch('medical'); }}
            >
              <circle cx="0" cy="0" r="12" fill={selectedBranch === 'medical' ? '#0A1C3A' : '#f1f5f9'} stroke="#0A1C3A" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4" fill="#C8102E" className={selectedBranch === 'medical' ? 'animate-ping' : ''} />
              <text x="-40" y="-16" fill="#0A1C3A" fontSize="8" fontWeight="bold" className="serif-heading">
                Touch Medical 3
              </text>
            </g>
          </svg>

          {/* Floating Map Compass / Indicators */}
          <div className="absolute bottom-3 right-3 bg-white/95 p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-1 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-brand-blue">
              <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
              <span>{currentLang === 'ar' ? 'الواحة' : 'El Waha'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-red">
              <div className="w-2 h-2 rounded-full bg-brand-red"></div>
              <span>{currentLang === 'ar' ? 'المركز الطبي ٣' : 'Medical 3'}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <p className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            {currentLang === 'ar' ? 'انقر على الفروع في الخريطة لتغيير الفرع المحدد.' : 'Click on the branch icons to explore details.'}
          </p>
          <span className="text-brand-gold font-bold">French Touch Cairo ©</span>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-route-dash {
          animation: dash 3s linear infinite !important;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
