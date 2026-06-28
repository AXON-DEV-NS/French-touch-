import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, UserCheck, Trash2, PlusCircle, LayoutDashboard, 
  Sparkles, Globe, LogOut, Check, HelpCircle, Key, 
  Database, RefreshCw, Eye, Landmark, ArrowLeftRight, Mail, Send,
  ShieldAlert, ShieldCheck, Power, Lock, Unlock, Wrench
} from "lucide-react";
import { Language, TRANSLATIONS, Manager } from "../types";
import AICopilotConsole from "./AICopilotConsole";

interface VisitorLog {
  email: string;
  name: string;
  picture?: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  authType: "google" | "sandbox" | "firebase-google";
  role: "Developer" | "Manager" | "Customer";
}

interface RegisteredCustomer {
  firstName: string;
  secondName: string;
  thirdName: string;
  phone: string;
  alternativePhone: string;
  email: string;
  picture: string;
  registeredAt: string;
  aiAnalysis?: {
    culinaryMood: string;
    personalityAnalysis: string;
    recommendedDish: string;
  };
}

interface EmailLog {
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: string;
}

interface DeveloperConsoleProps {
  currentLang: Language;
  currentUser: { email: string; name: string; picture?: string; role: string };
  onLogout: () => void;
  // State switches to allow the developer to preview other states
  previewRole: "Developer" | "Manager" | "Customer";
  setPreviewRole: (role: "Developer" | "Manager" | "Customer") => void;
  onDatabaseMutated?: (updatedData: any) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
}

export default function DeveloperConsole({
  currentLang,
  currentUser,
  onLogout,
  previewRole,
  setPreviewRole,
  onDatabaseMutated,
  maintenanceMode,
  setMaintenanceMode
}: DeveloperConsoleProps) {
  const t = TRANSLATIONS[currentLang];
  const isRtl = currentLang === "ar";

  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [customers, setCustomers] = useState<RegisteredCustomer[]>([]);
  const [blockedCustomers, setBlockedCustomers] = useState<RegisteredCustomer[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerPassword, setNewManagerPassword] = useState("");
  const [newManagerLang, setNewManagerLang] = useState<Language>("ar");

  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [newsletterSending, setNewsletterSending] = useState(false);

  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [pageViews, setPageViews] = useState(0);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"logs" | "gmails" | "subscribers" | "customers" | "emaillogs" | "copilot">("copilot");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  const handleToggleMaintenance = async () => {
    setTogglingMaintenance(true);
    setMessage(null);
    try {
      const nextVal = !maintenanceMode;
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        },
        body: JSON.stringify({ maintenanceMode: nextVal })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update maintenance state");
      }

      setMaintenanceMode(data.maintenanceMode);
      setMessage({
        text: currentLang === "ar"
          ? `تم ${data.maintenanceMode ? "تفعيل وضع صيانة وتطوير الموقع بنجاح 🔒" : "إلغاء وضع الصيانة وفتح الموقع للجميع بنجاح 🔓"}`
          : `Maintenance mode has been successfully ${data.maintenanceMode ? "activated 🔒" : "deactivated 🔓"}`,
        type: "success"
      });
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: currentLang === "ar" ? "فشل تحديث حالة صيانة الموقع." : "Failed to update maintenance status.",
        type: "error"
      });
    } finally {
      setTogglingMaintenance(false);
    }
  };

  // Fetch visitors and managers from full-stack server
  const fetchData = async () => {
    setLoadingLogs(true);
    setLoadingManagers(true);
    try {
      const headers = {
        "x-user-email": currentUser.email,
        "x-user-role": currentUser.role
      };

      const visitorsRes = await fetch("/api/visitors", { headers });
      if (!visitorsRes.ok) throw new Error("Unauthorized");
      const visitorsData = await visitorsRes.json();
      setVisitors(visitorsData);

      const managersRes = await fetch("/api/managers", { headers });
      if (!managersRes.ok) throw new Error("Unauthorized");
      const managersData = await managersRes.json();
      setManagers(managersData);

      const pageViewsRes = await fetch("/api/pageviews", { headers });
      const pageViewsData = await pageViewsRes.json();
      setPageViews(pageViewsData.count || 0);

      const subscribersRes = await fetch("/api/subscribers", { headers });
      if (!subscribersRes.ok) throw new Error("Unauthorized");
      const subscribersData = await subscribersRes.json();
      setSubscribers(subscribersData);

      const customersRes = await fetch("/api/registered-customers", { headers });
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      const blockedRes = await fetch("/api/blocked-customers", { headers });
      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedCustomers(blockedData);
      }

      const emailLogsRes = await fetch("/api/email-logs", { headers });
      if (emailLogsRes.ok) {
        const emailLogsData = await emailLogsRes.json();
        setEmailLogs(emailLogsData);
      }
    } catch (err) {
      console.error("Error fetching developer data:", err);
    } finally {
      setLoadingLogs(false);
      setLoadingManagers(false);
    }
  };

  const handleBlockCustomer = async (email: string) => {
    if (!window.confirm(currentLang === "ar" ? "هل أنت متأكد من حظر هذا العميل نهائياً ومنع تسجيله مجدداً بمعلومات مشابهة؟" : "Are you sure you want to ban this customer permanently?")) {
      return;
    }
    const blockReason = window.prompt(currentLang === "ar" ? "ما هو سبب الحظر؟ (اختياري، سيظهر للعميل عند محاولة الدخول)" : "Reason for block? (Optional, will be shown to customer)");
    setMessage(null);
    try {
      const res = await fetch("/api/block-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        },
        body: JSON.stringify({ email, blockReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to block customer");
      setCustomers(data.registeredCustomers || []);
      setBlockedCustomers(data.blockedCustomers || []);
      setMessage({
        text: currentLang === "ar" ? "تم حظر هذا العميل نهائياً ومنع تسجيله مستقبلاً بنجاح!" : "Customer blocked and banned permanently!",
        type: "success"
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const handleWarnCustomer = async (email: string) => {
    const warningMessage = window.prompt(currentLang === "ar" ? "أدخل نص التحذير ليتم عرضه للعميل عند تسجيل الدخول (اتركه فارغاً لإزالة التحذير):" : "Enter warning message to show to the customer on login (leave empty to remove warning):");
    
    setMessage(null);
    try {
      let res;
      if (!warningMessage) {
        res = await fetch("/api/unwarn-customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": currentUser.email,
            "x-user-role": currentUser.role
          },
          body: JSON.stringify({ email })
        });
      } else {
        res = await fetch("/api/warn-customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": currentUser.email,
            "x-user-role": currentUser.role
          },
          body: JSON.stringify({ email, warningMessage })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to warn customer");
      setCustomers(data.registeredCustomers || []);
      setMessage({
        text: currentLang === "ar" ? "تم تحديث حالة التحذير بنجاح!" : "Warning status updated successfully!",
        type: "success"
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const handleUnblockCustomer = async (email: string) => {
    setMessage(null);
    try {
      const res = await fetch("/api/unblock-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unblock customer");
      setCustomers(data.registeredCustomers || []);
      setBlockedCustomers(data.blockedCustomers || []);
      setMessage({
        text: currentLang === "ar" ? "تم إلغاء حظر العميل وإعادته للمسجلين بنجاح." : "Customer unblocked successfully.",
        type: "success"
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add a manager email with name and custom password
  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerEmail) return;

    const email = newManagerEmail.trim().toLowerCase();
    const name = newManagerName.trim() || email.split("@")[0];
    const password = newManagerPassword.trim() || "123";
    setMessage(null);

    try {
      const res = await fetch("/api/managers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        },
        body: JSON.stringify({ email, name, password, lang: newManagerLang })
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Server returned invalid response: ${text.substring(0, 50)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to add manager");
      }

      setManagers(data.managers);
      setNewManagerEmail("");
      setNewManagerName("");
      setNewManagerPassword("");
      setNewManagerLang("ar");
      setMessage({
        text: currentLang === "ar" ? "تمت إضافة وتفويض المدير بكلمة مرور مخصصة بنجاح!" : "Manager added with custom password successfully!",
        type: "success"
      });
      // Refresh visitors in case roles updated
      const visitorsRes = await fetch("/api/visitors", {
        headers: {
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        }
      });
      setVisitors(await visitorsRes.json());
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  // Remove a manager email
  const handleRemoveManager = async (email: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/managers/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to remove manager");

      setManagers(data.managers);
      setMessage({
        text: currentLang === "ar" ? "تم إلغاء صلاحية المدير بنجاح." : "Manager authorization revoked.",
        type: "success"
      });
      // Refresh visitors
      const visitorsRes = await fetch("/api/visitors", {
        headers: {
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        }
      });
      setVisitors(await visitorsRes.json());
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  // Dispatch Newsletter
  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterSubject || !newsletterBody) return;
    setNewsletterSending(true);
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        },
        body: JSON.stringify({ subject: newsletterSubject, body: newsletterBody })
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          currentLang === "ar"
              ? `تمت محاكاة إرسال البريد الإلكتروني بنجاح لـ ${data.count} عملاء مسجلين!`
              : `Newsletter simulated and dispatched successfully to ${data.count} registered clients!`
        );
        setNewsletterSubject("");
        setNewsletterBody("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewsletterSending(false);
    }
  };

  // Clear all visitor logs
  const handleClearLogs = async () => {
    if (!confirm(currentLang === "ar" ? "هل أنت متأكد من مسح جميع سجلات الزيارات؟" : "Are you sure you want to clear all visitor logs?")) {
      return;
    }
    try {
      const res = await fetch("/api/visitors", { 
        method: "DELETE",
        headers: {
          "x-user-email": currentUser.email,
          "x-user-role": currentUser.role
        }
      });
      const data = await res.json();
      setVisitors(data.visitors);
    } catch (err) {
      console.error(err);
    }
  };

  // Format date helper
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString(currentLang === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className={`min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8 ${isRtl ? "ar-dir" : "ltr-dir"}`} style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Top Margin Accent */}
      <div className="w-full h-1 absolute top-0 left-0 right-0 flex pointer-events-none">
        <div className="flex-1 h-full bg-[#002395]" />
        <div className="flex-1 h-full bg-white" />
        <div className="flex-1 h-full bg-[#ED2939]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 mt-4">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-900 p-6 rounded-3xl border border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  {currentLang === "ar" ? "المطور الرئيسي" : "PRIMARY DEVELOPER"}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {currentUser.email}
                </span>
              </div>
              <h1 className="serif-heading text-xl md:text-2xl font-black text-[#FDFBF7] mt-1">
                {currentLang === "ar" ? "بوابة الإدارة الشاملة ومحاكاة الأدوار 🛠️" : "Global Developer Command Portal 🛠️"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-all cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-red-950/40 hover:bg-red-950/60 text-red-300 hover:text-red-200 border border-red-900/40 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{currentLang === "ar" ? "تسجيل الخروج" : "Logout"}</span>
            </button>
          </div>
        </div>

        {/* ROLE PLAYGROUND SELECTOR - SUPER HELPFUL! */}
        <div className="bg-gradient-to-r from-amber-500/5 to-[#002395]/5 p-5 rounded-3xl border border-stone-800 space-y-3.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ArrowLeftRight className="w-4 h-4 animate-bounce" />
            <span>{currentLang === "ar" ? "لوحة اختبار محاكاة الأدوار للمطور" : "Developer Role Testing Playground"}</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            {currentLang === "ar"
              ? "بصفتك المطور، يمكنك الانتقال فوراً بين الشاشات لتجربة شاشة المدير أو شاشة الزبون العادي دون الحاجة لتسجيل الخروج بحسابات أخرى."
              : "As the developer, you can dynamically switch between user roles to test how the manager or regular customer views look and behave instantly."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setPreviewRole("Developer")}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                previewRole === "Developer"
                  ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/10 font-bold"
                  : "bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-800"
              }`}
            >
              🛡️ {currentLang === "ar" ? "لوحة المطور" : "Developer Console"}
            </button>

            <button
              onClick={() => setPreviewRole("Manager")}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                previewRole === "Manager"
                  ? "bg-[#002395] text-white shadow-lg shadow-blue-500/10 font-bold"
                  : "bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-800"
              }`}
            >
              💼 {currentLang === "ar" ? "لوحة المدير" : "Manager Console"}
            </button>

            <button
              onClick={() => setPreviewRole("Customer")}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                previewRole === "Customer"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 font-bold"
                  : "bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-800"
              }`}
            >
              🍽️ {currentLang === "ar" ? "لوحة الزبون" : "Customer Restaurant"}
            </button>
          </div>
        </div>

        {/* MAINTENANCE MODE CONTROLLER */}
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl border ${maintenanceMode ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                <Power className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#FDFBF7]">
                    {currentLang === "ar" ? "التحكم في إتاحة الموقع (حالة الصيانة والتشغيل)" : "Site Operations & Maintenance Control"}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${maintenanceMode ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    {maintenanceMode ? (currentLang === "ar" ? "مغلق للصيانة" : "Closed for Maintenance") : (currentLang === "ar" ? "مفتوح للعامة" : "Open to Public")}
                  </span>
                </div>
                <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                  {currentLang === "ar"
                    ? "عند تفعيل وضع الصيانة، سيتم قفل تصفح الموقع بالكامل لجميع الزوار وسيتم عرض صفحة فاخرة تخبرهم بأن الموقع تحت التطوير. يمكنك كمطور أو مدير تسجيل الدخول الآمن حتى أثناء الصيانة لتعديل البيانات وتجربة الشاشات."
                    : "When maintenance mode is active, the entire restaurant site will be locked for all public visitors, showing a premium under-development screen. Only developers and authorized managers can bypass this using secure credentials."}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleMaintenance}
              disabled={togglingMaintenance}
              className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                maintenanceMode
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30 shadow-lg shadow-emerald-600/10"
                  : "bg-red-600 hover:bg-red-500 text-white border-red-500/30 shadow-lg shadow-red-600/10"
              }`}
            >
              {togglingMaintenance ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : maintenanceMode ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>
                {togglingMaintenance
                  ? (currentLang === "ar" ? "جاري التحديث..." : "Updating...")
                  : maintenanceMode
                  ? (currentLang === "ar" ? "فتح الموقع للعامة 🔓" : "Unlock Site 🔓")
                  : (currentLang === "ar" ? "إغلاق الموقع للصيانة 🔒" : "Lock Site for Maintenance 🔒")}
              </span>
            </button>
          </div>
        </div>

        {/* Mid grid: Visitor stats card & Manager management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: STATS & MANAGERS LIST (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* STATS BENTO PANEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. PAGE VIEWS COUNTER */}
              <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:col-span-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-stone-400 font-mono tracking-wider">
                    {currentLang === "ar" ? "عداد مشاهدات وزيارات الموقع" : "TOTAL SITE PAGE VIEWS"}
                  </span>
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-blue-400 font-mono">
                      {pageViews}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      {currentLang === "ar" ? "مشاهدة فعلية" : "live views"}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2 leading-relaxed">
                    {currentLang === "ar" ? "مجموع زيارات وفتح صفحات تطبيق الويب بالكامل" : "Total triggers logged across client loading sessions"}
                  </p>
                </div>
              </div>

              {/* 2. SIGNED-IN EVENTS */}
              <div className="bg-stone-900 p-5 rounded-3xl border border-stone-800 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider">
                    {currentLang === "ar" ? "جلسات الدخول" : "LOGIN SESSIONS"}
                  </span>
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {visitors.length}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">logs</span>
                </div>
              </div>

              {/* 3. REGISTERED GMAILS */}
              <div className="bg-stone-900 p-5 rounded-3xl border border-stone-800 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider">
                    {currentLang === "ar" ? "الحسابات المسجلة" : "REGISTERED GMAILS"}
                  </span>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {Array.from(new Map(visitors.filter(v => v.email).map(v => [v.email.trim().toLowerCase(), v])).values()).length}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">users</span>
                </div>
              </div>

            </div>

            {/* ADD MANAGERS BOX */}
            <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="serif-heading text-base font-bold text-[#FDFBF7] flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-blue-400" />
                  <span>{currentLang === "ar" ? "إضافة وتفويض المدراء" : "Authorized Managers"}</span>
                </h3>
                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
                  {managers.length} {currentLang === "ar" ? "مدير" : "active"}
                </span>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                {currentLang === "ar"
                  ? "قم بإضافة حساب مدير مخصص مع اسم مرور وسري. سيقوم المدراء بتسجيل الدخول باستخدام بريدهم ورقمهم السري المحدد هنا بشكل مباشر وبشكل سري تماماً."
                  : "Add custom manager accounts with designated names and passwords. Managers will sign in using their email and this password via our secure hidden gate."}
              </p>

              {message && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === "success" 
                    ? "bg-emerald-950/30 border border-emerald-900/50 text-emerald-300"
                    : "bg-red-950/30 border border-red-900/50 text-red-300"
                }`}>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              {/* Form with Password */}
              <form onSubmit={handleAddManager} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="email"
                    required
                    value={newManagerEmail}
                    onChange={(e) => setNewManagerEmail(e.target.value)}
                    placeholder={currentLang === "ar" ? "بريد المدير الالكتروني" : "Manager email"}
                    className="bg-stone-950 border border-stone-800 focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-xs text-[#fbf8f5] outline-none placeholder-stone-600 font-mono"
                  />
                  <input
                    type="text"
                    value={newManagerName}
                    onChange={(e) => setNewManagerName(e.target.value)}
                    placeholder={currentLang === "ar" ? "الاسم (اختياري)" : "Name (optional)"}
                    className="bg-stone-950 border border-stone-800 focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-xs text-[#fbf8f5] outline-none placeholder-stone-600"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newManagerPassword}
                    onChange={(e) => setNewManagerPassword(e.target.value)}
                    placeholder={currentLang === "ar" ? "كلمة المرور للمدير" : "Custom Password / PIN"}
                    className="flex-grow bg-stone-950 border border-stone-800 focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-xs text-[#fbf8f5] outline-none placeholder-stone-600 font-mono"
                  />
                  <select
                    value={newManagerLang}
                    onChange={(e) => setNewManagerLang(e.target.value as Language)}
                    className="bg-stone-950 border border-stone-800 text-stone-300 rounded-xl px-2 py-2 text-xs outline-none"
                  >
                    <option value="ar">العربية 🇪🇬</option>
                    <option value="en">EN 🇬🇧</option>
                    <option value="fr">FR 🇫🇷</option>
                    <option value="it">IT 🇮🇹</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{currentLang === "ar" ? "إضافة" : "Add"}</span>
                  </button>
                </div>
              </form>

              {/* Managers List */}
              <div className="space-y-2 mt-4 max-h-56 overflow-y-auto pr-1">
                {loadingManagers ? (
                  <div className="text-stone-500 text-xs text-center py-4 font-mono">Loading active managers...</div>
                ) : managers.length === 0 ? (
                  <div className="text-stone-600 text-xs text-center py-4 italic">
                    {currentLang === "ar" ? "لا توجد حسابات مضافة كمدير حالياً." : "No manager accounts added yet."}
                  </div>
                ) : (
                  managers.map((m) => (
                    <div 
                      key={m.email}
                      className="flex flex-col p-3 bg-stone-950 border border-stone-800/80 rounded-xl hover:border-stone-700 transition-all gap-1.5"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white font-sans">{m.name || m.email.split('@')[0]}</p>
                          <p className="text-[10px] font-mono text-stone-400 select-all truncate">{m.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveManager(m.email)}
                          className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                          title={currentLang === "ar" ? "حذف المدير" : "Revoke Manager"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] bg-stone-900 px-2 py-1 rounded-md border border-stone-800/50">
                        <div className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="text-stone-400 font-mono">Password:</span>
                          <span className="text-amber-400 font-mono font-bold select-all bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">{m.password || "123"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-stone-500 font-mono">Language:</span>
                          <span className="text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 font-mono font-bold">
                            {m.lang ? m.lang.toUpperCase() : "AR"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: TABBED CONSOLE FOR SESSIONS & REGISTERED EMAILS (7 cols) */}
          <div className="lg:col-span-7 bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden flex flex-col">
            
            {/* Header with Sub-tabs */}
            <div className="p-6 border-b border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="serif-heading text-base font-bold text-[#FDFBF7]">
                  {currentLang === "ar" ? "سجلات المستخدمين والجيميلات" : "User Profiles & Telemetry Database"}
                </h3>
                
                {/* Visual Tab Buttons */}
                <div className="flex gap-2.5 mt-3 border-b border-stone-800/20 pb-1 flex-wrap">
                  <button
                    onClick={() => setActiveConsoleTab("copilot")}
                    className={`pb-1 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                      activeConsoleTab === "copilot" 
                        ? "border-brand-gold text-brand-gold font-black" 
                        : "border-transparent text-stone-400 hover:text-brand-gold"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{currentLang === "ar" ? "🤖 المساعد الذكي (AI Copilot)" : "🤖 AI Copilot"}</span>
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("customers")}
                    className={`pb-1 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeConsoleTab === "customers" 
                        ? "border-amber-400 text-amber-400 font-black" 
                        : "border-transparent text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {currentLang === "ar" ? "👥 الزبائن المسجلون" : "👥 Registered Customers"}
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("emaillogs")}
                    className={`pb-1 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeConsoleTab === "emaillogs" 
                        ? "border-sky-400 text-sky-400 font-black" 
                        : "border-transparent text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {currentLang === "ar" ? "📬 البريد التلقائي" : "📬 Auto Newsletter Logs"}
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("logs")}
                    className={`pb-1 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeConsoleTab === "logs" 
                        ? "border-orange-400 text-orange-400" 
                        : "border-transparent text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {currentLang === "ar" ? "سجل الجلسات الحالي ⏱️" : "Live Session Logs ⏱️"}
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("gmails")}
                    className={`pb-1 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeConsoleTab === "gmails" 
                        ? "border-emerald-400 text-emerald-400" 
                        : "border-transparent text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {currentLang === "ar" ? "جميع الحسابات المسجلة 📧" : "All Registered Accounts 📧"}
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab("subscribers")}
                    className={`pb-1 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeConsoleTab === "subscribers" 
                        ? "border-blue-400 text-blue-400" 
                        : "border-transparent text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {currentLang === "ar" ? "مشتركو العروض 🔔" : "Offer Subscribers 🔔"}
                  </button>
                </div>
              </div>
              
              {activeConsoleTab === "logs" && (
                <button
                  onClick={handleClearLogs}
                  disabled={visitors.length === 0}
                  className="text-xs text-stone-400 hover:text-red-400 disabled:opacity-30 cursor-pointer font-bold"
                >
                  {currentLang === "ar" ? "مسح السجلات ✕" : "Clear All Logs ✕"}
                </button>
              )}
            </div>

            {/* TAB CONTENT: AI COPILOT CONTROL (FULL HANDS-FREE CONTROL) */}
            {activeConsoleTab === "copilot" && (
              <div className="p-4 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl">
                  <p className="text-xs text-amber-400 leading-relaxed font-sans font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse shrink-0 text-brand-gold" />
                    <span>
                      {currentLang === "ar" 
                        ? "صلاحية تحكم مطور مطلقة: يمكنك توجيه المساعد الذكي لتنفيذ تعديلات لحظية ومباشرة على قاعدة بيانات المنتجات والعروض والمستخدمين والتقييمات بالكامل."
                        : "Developer Ultimate Authority: Direct the executive AI to run instant master mutations on all products, offers, categories, customers, and review databases."}
                    </span>
                  </p>
                </div>
                <AICopilotConsole
                  currentLang={currentLang as any}
                  currentUserEmail={currentUser.email}
                  currentUserRole="Developer"
                  onDatabaseMutated={(updatedData) => {
                    if (onDatabaseMutated) {
                      onDatabaseMutated(updatedData);
                    }
                    if (updatedData.registeredCustomers) {
                      setCustomers(updatedData.registeredCustomers);
                    }
                    if (updatedData.blockedCustomers) {
                      setBlockedCustomers(updatedData.blockedCustomers);
                    }
                  }}
                />
              </div>
            )}

            {/* TAB CONTENT: REGISTERED CUSTOMERS (REQUIRED BY USER) */}
            {activeConsoleTab === "customers" && (
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-stone-850">
                  <div className="text-xs text-amber-400 font-bold">
                    {currentLang === "ar" ? `إجمالي الزبائن المسجلين: ${customers.length}` : `Total Registered Customers: ${customers.length}`}
                  </div>
                  <button
                    onClick={fetchData}
                    className="p-1 text-stone-400 hover:text-[#FDFBF7] rounded transition-all flex items-center gap-1 text-[11px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                    <span>{currentLang === "ar" ? "تحديث" : "Refresh"}</span>
                  </button>
                </div>

                {customers.length === 0 ? (
                  <div className="text-center py-16 text-stone-600 text-xs italic">
                    {currentLang === "ar" ? "لا يوجد زبائن مسجلون في الموقع حتى الآن." : "No registered customers in database yet."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="text-[10px] uppercase bg-stone-950 text-stone-400 font-mono tracking-wider border-b border-stone-850">
                        <tr>
                          <th className="px-3 py-2 text-center">{currentLang === "ar" ? "الصورة" : "Avatar"}</th>
                          <th className="px-3 py-2">{currentLang === "ar" ? "الاسم الثلاثي" : "Triple Name"}</th>
                          <th className="px-3 py-2">{currentLang === "ar" ? "الجيميل" : "Gmail"}</th>
                          <th className="px-3 py-2">{currentLang === "ar" ? "الهواتف (أساسي / احتياطي)" : "Phones (Primary / Alt)"}</th>
                          <th className="px-3 py-2">{currentLang === "ar" ? "تاريخ التسجيل" : "Registered At"}</th>
                          <th className="px-3 py-2 text-center">{currentLang === "ar" ? "التحكم بالبصمة" : "Security Block"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {customers.map((c, idx) => (
                          <tr key={idx} className="hover:bg-stone-850 transition-colors">
                            <td className="px-3 py-3 text-center">
                              <img
                                src={c.picture}
                                alt="Face Profile"
                                className="w-10 h-10 rounded-full border border-amber-400 object-cover mx-auto shadow"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="px-3 py-3 font-bold text-stone-200">
                              <div className="flex flex-col">
                                <span>{c.firstName} {c.secondName} {c.thirdName}</span>
                                <span className="text-[9px] text-stone-500 uppercase font-mono mt-0.5">Classic Account</span>
                                {c.warningMessage && (
                                  <span className="text-[9px] text-yellow-500 mt-1 max-w-[120px] truncate" title={c.warningMessage}>
                                    ⚠️ {c.warningMessage}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 font-mono text-stone-300 select-all">
                              {c.email}
                            </td>
                            <td className="px-3 py-3 font-mono text-stone-300">
                              <div className="flex flex-col">
                                <span className="text-amber-400">📱 {c.phone}</span>
                                <span className="text-stone-400 text-[10px]">☎️ {c.alternativePhone || "-"}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-[10px] text-stone-500">
                              {new Date(c.registeredAt).toLocaleString(currentLang === "ar" ? "ar-EG" : "en-US")}
                            </td>
                            <td className="px-3 py-3 flex gap-2 justify-center">
                              <button
                                onClick={() => handleWarnCustomer(c.email)}
                                className="px-2.5 py-1.5 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-500 hover:text-yellow-400 rounded-xl text-[10px] font-bold transition-all border border-yellow-900/40 flex items-center gap-1 cursor-pointer"
                                title={currentLang === "ar" ? "إرسال تحذير" : "Send warning"}
                              >
                                <span>{currentLang === "ar" ? "تحذير ⚠️" : "Warn ⚠️"}</span>
                              </button>
                              <button
                                onClick={() => handleBlockCustomer(c.email)}
                                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-xl text-[10px] font-bold transition-all border border-red-900/40 flex items-center gap-1 cursor-pointer"
                                title={currentLang === "ar" ? "حظر وحظر البصمة/الاسم/الهاتف" : "Ban user permanently"}
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>{currentLang === "ar" ? "حظر نهائي ✕" : "Ban User ✕"}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Blocked/Banned Customers Section */}
                <div className="pt-6 border-t border-stone-800">
                  <div className="text-xs text-red-400 font-bold mb-3 flex items-center gap-1">
                    <span>{currentLang === "ar" ? "🚫 الحسابات المحظورة نهائياً (بصمة الوجه والبيانات)" : "🚫 Permanently Banned Accounts (Face ID & Metadata)"}</span>
                    <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-mono">{blockedCustomers.length}</span>
                  </div>

                  {blockedCustomers.length === 0 ? (
                    <div className="text-center py-6 text-stone-600 text-xs italic bg-stone-900/40 border border-stone-800 rounded-2xl">
                      {currentLang === "ar" ? "لا يوجد حسابات محظورة حالياً." : "No accounts are currently banned."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-stone-950/30 border border-stone-850 rounded-2xl p-2">
                      <table className="w-full text-left text-xs text-stone-300">
                        <thead className="text-[10px] uppercase bg-stone-950 text-stone-500 font-mono tracking-wider border-b border-stone-850">
                          <tr>
                            <th className="px-3 py-2 text-center">{currentLang === "ar" ? "الصورة" : "Avatar"}</th>
                            <th className="px-3 py-2">{currentLang === "ar" ? "الاسم" : "Name"}</th>
                            <th className="px-3 py-2">{currentLang === "ar" ? "الجيميل" : "Gmail"}</th>
                            <th className="px-3 py-2">{currentLang === "ar" ? "الهواتف" : "Phones"}</th>
                            <th className="px-3 py-2 text-center">{currentLang === "ar" ? "التحكم" : "Action"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-850">
                          {blockedCustomers.map((b, idx) => (
                            <tr key={idx} className="hover:bg-red-950/10 transition-colors">
                              <td className="px-3 py-2 text-center">
                                <img
                                  src={b.picture}
                                  alt="Banned Profile"
                                  className="w-8 h-8 rounded-full border border-red-500/50 object-cover mx-auto opacity-60"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="block text-[8px] text-red-400 mt-0.5">محظور ✕</span>
                              </td>
                              <td className="px-3 py-2 font-bold text-stone-400 line-through">
                                {b.firstName} {b.secondName} {b.thirdName}
                              </td>
                              <td className="px-3 py-2 font-mono text-stone-500 select-all">
                                {b.email}
                              </td>
                              <td className="px-3 py-2 font-mono text-stone-500">
                                <div>📱 {b.phone}</div>
                                <div className="text-[10px]">☎️ {b.alternativePhone || "-"}</div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => handleUnblockCustomer(b.email)}
                                  className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 rounded-lg text-[10px] font-bold transition-all border border-emerald-900/40 flex items-center gap-1 mx-auto cursor-pointer"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>{currentLang === "ar" ? "إلغاء الحظر" : "Unban"}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AUTOMATED GMAIL LOGS */}
            {activeConsoleTab === "emaillogs" && (
              <div className="p-4 space-y-4">
                <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-2xl">
                  <p className="text-[11px] text-emerald-400">
                    {currentLang === "ar" 
                      ? "📌 يتم تفعيل الإرسال التلقائي والإجباري لجميع العروض والمنتجات الجديدة تلقائياً إلى بريد الجيميل الخاص بالعميل فور تسجيله بنجاح!" 
                      : "📌 Automated dispatch fires instantly, broadcasting all current promos & newly added dishes straight to each client's Gmail address."}
                  </p>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-stone-850">
                  <div className="text-xs text-sky-400 font-bold">
                    {currentLang === "ar" ? `الرسائل المرسلة تلقائياً: ${emailLogs.length}` : `Simulated Sent Emails: ${emailLogs.length}`}
                  </div>
                  <button
                    onClick={fetchData}
                    className="p-1 text-stone-400 hover:text-[#FDFBF7] rounded transition-all flex items-center gap-1 text-[11px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                    <span>{currentLang === "ar" ? "تحديث" : "Refresh"}</span>
                  </button>
                </div>

                {emailLogs.length === 0 ? (
                  <div className="text-center py-16 text-stone-600 text-xs italic">
                    {currentLang === "ar" ? "لا توجد رسائل مرسلة تلقائياً حتى الآن." : "No auto newsletters dispatched yet."}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {emailLogs.map((log, idx) => (
                      <div key={idx} className="bg-stone-950 border border-stone-850 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-stone-500">{currentLang === "ar" ? "إلى البريد:" : "To Email:"}</span>
                            <span className="ml-1 text-xs font-mono font-bold text-amber-400 select-all">{log.toEmail}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-400 text-[8px] font-bold rounded-full font-mono">
                            {log.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-stone-200">
                          📢 {log.subject}
                        </div>
                        <div className="text-[11px] text-stone-400 whitespace-pre-wrap bg-stone-900 p-2.5 rounded-lg font-mono border border-stone-800">
                          {log.body}
                        </div>
                        <div className="text-[9px] text-stone-500 text-right">
                          {new Date(log.sentAt).toLocaleString(currentLang === "ar" ? "ar-EG" : "en-US")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LIVE SESSIONS */}
            {activeConsoleTab === "logs" && (
              <div className="overflow-x-auto">
                {loadingLogs ? (
                  <div className="text-center py-16 text-stone-500 text-xs font-mono">
                    Loading visitor logs...
                  </div>
                ) : visitors.length === 0 ? (
                  <div className="text-center py-16 text-stone-600 text-xs italic">
                    {currentLang === "ar" ? "لا توجد زيارات مسجلة حتى الآن." : "No visitor logins logged yet."}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="text-[10px] uppercase bg-stone-950 text-stone-400 font-mono tracking-wider border-b border-stone-800">
                      <tr>
                        <th className="px-4 py-3">{currentLang === "ar" ? "المستخدم" : "User Profile"}</th>
                        <th className="px-4 py-3">{currentLang === "ar" ? "الدور المعين" : "Role"}</th>
                        <th className="px-4 py-3">{currentLang === "ar" ? "التوقيت" : "Timestamp"}</th>
                        <th className="px-4 py-3">{currentLang === "ar" ? "الشبكة / جهاز" : "Metadata"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80">
                      {visitors.map((v, idx) => (
                        <tr key={idx} className="hover:bg-stone-850 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={v.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${v.email}`} 
                                alt={v.name}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full border border-stone-700 bg-stone-850 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-stone-200 truncate max-w-[150px]">{v.name}</div>
                                <div className="text-[10px] text-stone-400 font-mono truncate max-w-[150px]" title={v.email}>{v.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {v.role === "Developer" && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-black tracking-wider uppercase border border-amber-500/20">
                                Developer
                              </span>
                            )}
                            {v.role === "Manager" && (
                              <span className="px-2 py-0.5 rounded bg-[#002395]/40 text-blue-300 text-[9px] font-black tracking-wider uppercase border border-blue-500/20">
                                Manager
                              </span>
                            )}
                            {v.role === "Customer" && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-bold tracking-wider uppercase border border-emerald-900/20">
                                Customer
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-[10px] text-stone-400">
                            {formatDate(v.timestamp)}
                          </td>

                          <td className="px-4 py-3.5 text-[10px] text-stone-400 font-mono space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${v.authType === "firebase-google" ? "bg-amber-400" : v.authType === "google" ? "bg-red-500" : "bg-orange-500"}`} />
                              <span className="text-stone-300">
                                {v.authType === "firebase-google" ? "Firebase Google" : v.authType === "google" ? "Google Account" : "Sandbox Mode"}
                              </span>
                            </div>
                            <div className="opacity-80">IP: {v.ip}</div>
                            <div className="truncate max-w-[180px] opacity-60" title={v.userAgent}>{v.userAgent}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB CONTENT: REGISTERED EMAILS/GMAILS ACCORDING TO USER REQUIREMENT */}
            {activeConsoleTab === "gmails" && (
              <div className="overflow-x-auto">
                {(() => {
                  // Deduplicate visitors by email to find unique profiles
                  const uniqueProfilesMap = new Map<string, VisitorLog>();
                  const emailCounts = new Map<string, number>();

                  visitors.forEach(v => {
                    if (!v.email) return;
                    const emailKey = v.email.trim().toLowerCase();
                    emailCounts.set(emailKey, (emailCounts.get(emailKey) || 0) + 1);
                    
                    // Keep latest logged version
                    if (!uniqueProfilesMap.has(emailKey) || new Date(v.timestamp) > new Date(uniqueProfilesMap.get(emailKey)!.timestamp)) {
                      uniqueProfilesMap.set(emailKey, v);
                    }
                  });

                  const uniqueProfiles = Array.from(uniqueProfilesMap.values());

                  if (uniqueProfiles.length === 0) {
                    return (
                      <div className="text-center py-16 text-stone-600 text-xs italic">
                        {currentLang === "ar" ? "لا توجد جيميلات أو حسابات مسجلة حتى الآن." : "No registered user emails recorded yet."}
                      </div>
                    );
                  }

                  return (
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="text-[10px] uppercase bg-stone-950 text-stone-400 font-mono tracking-wider border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-3">{currentLang === "ar" ? "الحساب / البريد الإلكتروني" : "Gmail Account"}</th>
                          <th className="px-4 py-3">{currentLang === "ar" ? "صلاحية الحساب" : "Access Level"}</th>
                          <th className="px-4 py-3 text-center">{currentLang === "ar" ? "عدد الدخول" : "Login Count"}</th>
                          <th className="px-4 py-3">{currentLang === "ar" ? "آخر نشاط" : "Latest Activity"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/80">
                        {uniqueProfiles.map((p, idx) => {
                          const loginCount = emailCounts.get(p.email.trim().toLowerCase()) || 1;
                          return (
                            <tr key={idx} className="hover:bg-stone-850 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={p.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${p.email}`} 
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8 rounded-full border border-stone-700 bg-stone-850 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-stone-200 truncate max-w-[150px]">{p.name}</div>
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded break-all select-all">
                                      {p.email}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                {p.role === "Developer" ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black tracking-wider uppercase border border-amber-500/30">
                                    Developer
                                  </span>
                                ) : managers.some(m => m.email.toLowerCase() === p.email.toLowerCase()) ? (
                                  <span className="px-2 py-0.5 rounded bg-[#002395]/40 text-blue-300 text-[9px] font-black tracking-wider uppercase border border-blue-500/30">
                                    Authorized Manager
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-400 text-[9px] font-medium tracking-wider uppercase border border-stone-700">
                                    Regular Client
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-400 text-sm">
                                {loginCount}
                              </td>

                              <td className="px-4 py-3.5 font-mono text-[10px] text-stone-400">
                                {formatDate(p.timestamp)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            )}

            {/* TAB CONTENT: NEWSLETTER SUBSCRIBERS */}
            {activeConsoleTab === "subscribers" && (
              <div className="p-6 space-y-6">
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{currentLang === "ar" ? "إرسال إشعار / عرض جديد للعملاء على الجيميل" : "Simulate Gmail Campaign / Notification"}</span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {currentLang === "ar"
                      ? "اكتب تفاصيل العرض أو المنتج الجديد هنا، وسيتم إرسال إشعار فوري لجميع العملاء الذين وافقوا على استلام الرسائل عند فتحهم للموقع."
                      : "Craft a new offer or product update. When sent, all users who subscribed on their Gmail will receive simulated dispatch alerts."}
                  </p>
                  <form onSubmit={handleSendNewsletter} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        value={newsletterSubject}
                        onChange={(e) => setNewsletterSubject(e.target.value)}
                        placeholder={currentLang === "ar" ? "عنوان العرض (مثال: خصم 25% على الباستا الفرنسية! 🍝)" : "Newsletter Subject (e.g., 25% Off Fresh Pasta! 🍝)"}
                        className="w-full bg-stone-900 border border-stone-800 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs text-[#fbf8f5] outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        required
                        rows={3}
                        value={newsletterBody}
                        onChange={(e) => setNewsletterBody(e.target.value)}
                        placeholder={currentLang === "ar" ? "اكتب محتوى العرض بالتفصيل هنا..." : "Write your newsletter body here..."}
                        className="w-full bg-stone-900 border border-stone-800 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs text-[#fbf8f5] outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={newsletterSending || subscribers.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {newsletterSending 
                          ? (currentLang === "ar" ? "جاري الإرسال والمحاكاة..." : "Sending Simulation...") 
                          : (currentLang === "ar" ? `إرسال الإشعار لـ (${subscribers.length}) عملاء` : `Send simulated update to (${subscribers.length}) subscribers`)}
                      </span>
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#fbf8f5]">{currentLang === "ar" ? "قائمة المشتركين النشطين" : "Active Email Subscribers"}</h4>
                  {subscribers.length === 0 ? (
                    <p className="text-stone-500 text-xs italic">
                      {currentLang === "ar" ? "لا يوجد مشتركون مسجلون حالياً." : "No clients have subscribed for offers yet."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subscribers.map((subEmail) => (
                        <div key={subEmail} className="flex items-center gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300">
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate flex-1 select-all" title={subEmail}>{subEmail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
