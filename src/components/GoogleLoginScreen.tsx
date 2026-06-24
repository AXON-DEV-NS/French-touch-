import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  LogIn, Sparkles, AlertCircle, HelpCircle, Shield, 
  Settings, Key, CheckCircle, ArrowRight, UserCheck, 
  BookOpen, Lock, Landmark
} from "lucide-react";
import { Language, TRANSLATIONS } from "../types";
import RestaurantLogo from "./RestaurantLogo";

// Firebase Imports
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface GoogleLoginScreenProps {
  currentLang: Language;
  onLoginSuccess: (user: { email: string; name: string; picture?: string; role: "Developer" | "Manager" | "Customer" }) => void;
}

export default function GoogleLoginScreen({ currentLang, onLoginSuccess }: GoogleLoginScreenProps) {
  const t = TRANSLATIONS[currentLang];
  const isRtl = currentLang === "ar";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real Google OAuth configuration state - always active since we have Firebase
  const [missingConfig, setMissingConfig] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Handle Real Google Sign-In via Firebase Popup
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Attempt standard Google Sign-in with Firebase Popup first
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error(
          currentLang === "ar"
            ? "فشل في استرداد البريد الإلكتروني من حساب جوجل الخاص بك."
            : "Failed to retrieve email from your Google account."
        );
      }

      // 2. Send profile details to backend to register visitor and resolve role
      let dbUser: any = null;
      try {
        const res = await fetch("/api/auth/firebase-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || user.email.split("@")[0],
            picture: user.photoURL || ""
          })
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const text = await res.text();
            try {
              dbUser = JSON.parse(text);
            } catch (jsonErr) {
              console.warn("Failed to parse firebase-login JSON:", jsonErr);
            }
          }
        }
      } catch (apiErr) {
        console.warn("Server registering failed, falling back to secure client-side role resolution:", apiErr);
      }

      // Client-side role resolution fallback if server is offline or on static hosting (like Vercel)
      if (!dbUser) {
        const emailLower = user.email.toLowerCase();
        let role: "Developer" | "Manager" | "Customer" = "Customer";
        
        if (emailLower === "oren.on.oren.25@gmail.com") {
          role = "Developer";
        } else {
          const defaultManagers = ["uvyffi5@gmail.com", "manager@frenchtouch.com"];
          let savedManagers: any[] = [];
          try {
            const saved = localStorage.getItem("frenchtouch_managers");
            if (saved) savedManagers = JSON.parse(saved);
          } catch (e) {
            console.error(e);
          }
          
          const isManager = defaultManagers.includes(emailLower) || 
                            savedManagers.some((m: any) => m && m.email && m.email.toLowerCase() === emailLower);
          if (isManager) {
            role = "Manager";
          }
        }

        dbUser = {
          email: emailLower,
          name: user.displayName || user.email.split("@")[0],
          picture: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${emailLower}`,
          role
        };
      }

      setLoading(false);
      onLoginSuccess(dbUser);
    } catch (err: any) {
      console.warn("Firebase native signInWithPopup failed (expected in sandboxed iframes), attempting secure server-assisted Google Auth popup fallback. Error:", err);
      
      try {
        // Fallback: Open a secure popup directly pointing to Google's OAuth server via our server-assisted route.
        // This is extremely robust and avoids iframe sandbox limitations.
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const urlRes = await fetch(`/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
        
        if (!urlRes.ok) {
          throw new Error(
            currentLang === "ar"
              ? "الخدمة المساعدة غير متوفرة على بيئة الاستضافة هذه. يرجى استخدام الدخول التجريبي المباشر أدناه."
              : "Server-assisted Auth URL is unavailable. Please use the Quick Demo Entry below."
          );
        }

        const contentType = urlRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            currentLang === "ar"
              ? "الخادم لم يرجع استجابة صالحة. يرجى استخدام الدخول التجريبي المباشر أدناه."
              : "Server did not return a valid response. Please use the Quick Demo Entry below."
          );
        }

        const text = await urlRes.text();
        let urlData: any = null;
        try {
          urlData = JSON.parse(text);
        } catch (jsonErr) {
          throw new Error(
            currentLang === "ar"
              ? "فشل في قراءة بيانات الدخول من الخادم بشكل صحيح."
              : "Failed to parse Auth URL data from server."
          );
        }

        const { url, missingConfig: isMissing } = urlData || {};

        if (isMissing || !url) {
          setMissingConfig(true);
          throw new Error(
            currentLang === "ar"
              ? "فشل تسجيل الدخول التلقائي من جوجل. يرجى ضبط معرفات جوجل في الإعدادات."
              : "Standard Firebase popup failed. Server-assisted login is also missing Google Client ID. Please configure GOOGLE_CLIENT_ID in Settings."
          );
        }

        // Open OAuth provider URL directly in popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          url,
          "google_oauth_popup",
          `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
        );

        if (!popup) {
          throw new Error(
            currentLang === "ar"
              ? "تم حظر النافذة المنبثقة! الرجاء تفعيل السماح بالنوافذ المنبثقة في متصفحك لإتمام تسجيل الدخول الحقيقي."
              : "Popup was blocked! Please allow popups in your browser settings to sign in."
          );
        }
      } catch (fallbackErr: any) {
        console.error("Firebase Auth & Server-assisted Google Sign-In both failed:", fallbackErr);
        
        let friendlyError = fallbackErr.message || "Authentication failed";
        
        // Localize common Firebase error codes for maximum user friendliness
        if (err.code === "auth/popup-blocked") {
          friendlyError = currentLang === "ar"
            ? "تم حظر النافذة المنبثقة! يرجى تفعيل السماح بالنوافذ المنبثقة في متصفحك لإتمام عملية تسجيل الدخول."
            : "Popup was blocked! Please allow popups in your browser settings to sign in.";
        } else if (err.code === "auth/popup-closed-by-user") {
          friendlyError = currentLang === "ar"
            ? "تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية."
            : "The login popup was closed before completing the sign-in.";
        } else if (err.code === "auth/cancelled-popup-request") {
          friendlyError = currentLang === "ar"
            ? "تم إلغاء طلب تسجيل الدخول الحالي."
            : "The ongoing login request was cancelled.";
        } else if (err.code === "auth/network-request-failed") {
          friendlyError = currentLang === "ar"
            ? "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً."
            : "Network error. Please check your internet connection and try again.";
        }
        
        setError(friendlyError);
        setLoading(false);
      }
    }
  };

  // Listen for Google Auth success message from popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin to avoid security warnings
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        setLoading(false);
        const { user, idToken } = event.data;

        // Try to sign into client-side Firebase Auth instance using the Google ID Token
        if (idToken) {
          try {
            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
            console.log("Successfully synchronized client-side Firebase Auth session using ID Token!");
          } catch (fbErr) {
            console.warn("Client-side Firebase Auth synchronization skipped or failed:", fbErr);
          }
        }

        onLoginSuccess(user);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-[#0d0c0b] text-[#fbf8f5] flex flex-col justify-between items-center relative overflow-hidden font-sans select-none px-4 py-8">
      {/* Background Decorative Rings & Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#002395]/10 blur-[120px] pointer-events-none" />

      {/* Top Brand Banner */}
      <div className="w-full h-1 absolute top-0 left-0 right-0 flex pointer-events-none">
        <div className="flex-1 h-full bg-[#002395]" />
        <div className="flex-1 h-full bg-white" />
        <div className="flex-1 h-full bg-[#ED2939]" />
      </div>

      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center z-10"
      >
        <RestaurantLogo light className="scale-110 mb-2" />
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold font-mono">
          L’Art de la Table • Securité
        </p>
      </motion.div>

      {/* Central Login Card Container */}
      <div className="w-full max-w-md bg-stone-900/80 backdrop-blur-xl border border-stone-800 rounded-3xl overflow-hidden shadow-2xl my-auto z-10">
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="text-center space-y-2">
            <h3 className="serif-heading text-lg font-bold text-[#FDFBF7]">
              {currentLang === "ar" ? "تسجيل الدخول الآمن من جوجل" : "Secure Google Sign-In"}
            </h3>
            <p className="text-stone-400 text-xs max-w-xs mx-auto leading-relaxed">
              {currentLang === "ar" 
                ? "سجل دخولك بحساب جوجل لتحديد صلاحياتك ودخول الواجهة المناسبة لك."
                : "Sign in with your Google account to automatically resolve your account roles."}
            </p>
          </div>

          {missingConfig && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs space-y-2">
              <div className="flex gap-2 items-center font-bold">
                <Key className="w-4 h-4 text-amber-400" />
                <span>{currentLang === "ar" ? "وضع الإعداد المعلق" : "Configuration Pending"}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-stone-300">
                {currentLang === "ar"
                  ? "لم يتم ضبط معرفات تسجيل دخول جوجل (Google Client ID) بالشكل الصحيح في لوحة الإعدادات (Settings). يرجى مراجعة إعدادات الخادم والبيئة."
                  : "Google Client ID is not configured yet. Please configure the GOOGLE_CLIENT_ID in the environment Settings panel."}
              </p>
              <button
                onClick={() => setShowConfigGuide(!showConfigGuide)}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer text-[11px] block mt-1"
              >
                {showConfigGuide 
                  ? (currentLang === "ar" ? "إخفاء دليل الإعداد ✕" : "Hide Setup Guide ✕")
                  : (currentLang === "ar" ? "عرض دليل ضبط جوجل ⚜️" : "Show Google Setup Guide ⚜️")}
              </button>
            </div>
          )}

          {/* Show Config Guide */}
          {showConfigGuide && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-xl bg-[#141211] border border-stone-800 text-[11px] text-stone-300 space-y-3 font-mono leading-relaxed"
            >
              <div className="font-bold text-amber-400 border-b border-stone-800 pb-1.5 flex justify-between items-center">
                <span>CONFIG INSTRUCTIONS</span>
                <Settings className="w-3.5 h-3.5" />
              </div>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Go to Google Cloud Console API Credentials</li>
                <li>Add authorized Redirect URI: <span className="text-amber-300 select-all">{window.location.origin}/auth/google/callback</span></li>
                <li>Configure environment variables in AI Studio Settings panel:
                  <ul className="list-disc pl-4 mt-1 text-stone-400 space-y-1">
                    <li><span className="text-amber-500">GOOGLE_CLIENT_ID</span></li>
                    <li><span className="text-amber-500">GOOGLE_CLIENT_SECRET</span></li>
                  </ul>
                </li>
              </ol>
            </motion.div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 bg-white hover:bg-stone-100 text-stone-900 font-black rounded-2xl text-xs flex items-center justify-center gap-3 shadow-lg hover:shadow-white/5 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.13C18.28 1.83 15.54.96 12.24.96 6.136.96 1.16 5.916 1.16 12s4.975 11.04 11.08 11.04c6.38 0 10.614-4.484 10.614-10.8 0-.727-.08-1.282-.175-1.955H12.24z"/>
              </svg>
            )}
            <span>{currentLang === "ar" ? "سجل الدخول بحساب جوجل" : "Sign In with Google"}</span>
          </button>

          {/* Elegant Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-amber-500/50 uppercase tracking-widest font-mono">
              {currentLang === "ar" ? "أو الدخول التجريبي السريع" : "Or Quick Demo Bypass"}
            </span>
            <div className="flex-grow border-t border-stone-800"></div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onLoginSuccess({
                email: "demo-customer@frenchtouch.com",
                name: currentLang === 'ar' ? "عميل تجريبي" : "Demo Customer",
                picture: "https://api.dicebear.com/7.x/bottts/svg?seed=customer",
                role: "Customer"
              })}
              className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700/80 text-stone-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-stone-700/50 cursor-pointer"
            >
              <span>🍽️</span>
              <span>{currentLang === "ar" ? "دخول سريع كـ زبون تجريبي" : "Enter as Demo Customer"}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLoginSuccess({
                  email: "uvyffi5@gmail.com",
                  name: currentLang === 'ar' ? "مدير الفرع" : "Branch Manager",
                  picture: "https://api.dicebear.com/7.x/bottts/svg?seed=manager",
                  role: "Manager"
                })}
                className="py-2.5 px-3 bg-stone-900 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all border border-amber-500/20 cursor-pointer"
              >
                <span>💼</span>
                <span>{currentLang === "ar" ? "مدير تجريبي" : "Demo Manager"}</span>
              </button>
              <button
                onClick={() => onLoginSuccess({
                  email: "oren.on.oren.25@gmail.com",
                  name: currentLang === 'ar' ? "مطور النظام" : "System Developer",
                  picture: "https://api.dicebear.com/7.x/bottts/svg?seed=dev",
                  role: "Developer"
                })}
                className="py-2.5 px-3 bg-stone-900 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all border border-blue-500/20 cursor-pointer"
              >
                <span>🛠️</span>
                <span>{currentLang === "ar" ? "مطور تجريبي" : "Demo Developer"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="mt-8 text-center text-stone-600 text-[10px] font-mono tracking-widest uppercase space-y-1">
        <div>PARIS • MILANO • CAIRO</div>
        <div className="text-[9px] text-amber-500/40">French Touch Secure Framework v1.4</div>
      </div>
    </div>
  );
}
