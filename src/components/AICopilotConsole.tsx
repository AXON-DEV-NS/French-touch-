import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Bot, User, CheckCircle2, AlertTriangle, HelpCircle, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface AICopilotConsoleProps {
  currentLang: 'ar' | 'en' | 'fr' | 'it';
  currentUserEmail: string;
  currentUserRole: 'Manager' | 'Developer';
  onDatabaseMutated: (updatedData: {
    products?: any[];
    exclusiveOffer?: any;
    weeklyOffers?: any[];
    reviews?: any[];
    registeredCustomers?: any[];
    blockedCustomers?: any[];
  }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actionsExecuted?: { type: string; payload: any }[];
  timestamp: string;
}

export default function AICopilotConsole({ currentLang, currentUserEmail, currentUserRole, onDatabaseMutated }: AICopilotConsoleProps) {
  const [prompt, setPrompt] = useState('');
  const isAr = currentLang === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const isDev = currentUserRole === 'Developer';
    if (isAr) {
      return [
        {
          id: 'welcome',
          sender: 'ai',
          text: isDev
            ? `مرحباً بك في لوحة تحكم الذكاء الاصطناعي الكاملة للمطور (Developer Full Copilot). 🛠️⚡\nلديك الصلاحيات المطلقة والتحكم الكامل والشامل في كافة أقسام الموقع، بما في ذلك التحكم بالبيانات والعملاء والتقارير واللوقات والأمان.\n\nأمثلة على الأوامر التي يمكنك تنفيذها بصفتك مطوراً:\n1. 🍔 **إضافة وتعديل المنتجات والأقسام**: "أضف ساندوتش برجر اللحم المدخن الفاخر بسعر 45 ريال في قسم السندوتشات"\n2. 🎫 **إدارة العروض والخصومات بالكامل**: "تعديل عرض اليوم الحصري ليكون خصم 40% على البيتزا الكبيرة"\n3. 🚫 **التحكم بالعملاء وحظر الحسابات**: "ابحث عن العميل ذو البريد uvyffi5@gmail.com واحظره فوراً من الموقع"\n4. 📂 **الاستعلام وإدارة البيانات والمراجعات**: "كم عدد التقييمات السلبية؟ احذف التقييم ذو المعرف rev_123"\n5. 🛡️ **استعلامات المطور الشاملة**: "أظهر لي حالة الخادم وأداء العمليات الحالية"\n\nاطلب أي شيء في الموقع، وسأقوم بتحليله وتفعيله فوراً على الخادم بالكامل ودون قيود!`
            : `مرحباً بك في مساعد الذكاء الاصطناعي لإدارة المنتجات والعروض (Manager Limited Copilot). 📋💼\nبصفتك مديراً، تم تحديد صلاحيات هذا المساعد الذكي لتقتصر حصرياً على العمليات اليومية للمطعم مثل إدارة المنتجات، الأقسام، العروض والترويج، وحذف التقييمات غير المناسبة. لا يمتلك هذا المساعد صلاحية حظر العملاء أو التلاعب ببيانات الحسابات الحساسة أو لوقات المطور.\n\nأمثلة على ما يمكنك القيام به بصفتك مديراً:\n1. 🍔 **إدارة وتحديث قائمة المنتجات**: "أضف طبق باستا ثمار البحر بصلصة الطماطم الغنية بسعر 50 ريال"\n2. 🎫 **تعديل وتفعيل العروض الترويجية**: "تفعيل العرض الحصري اليوم بخصم 20% على قسم المشروبات"\n3. 📅 **تحديث العروض الأسبوعية**: "اجعل عرض يوم الثلاثاء خصم 15% على جميع الوجبات"\n4. 🧹 **مراجعة التعليقات**: "ابحث عن التقييمات السيئة واحذفها"\n\nاطلب أي تعديل يخص المنتجات أو العروض، وسأقوم به فوراً!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    } else {
      return [
        {
          id: 'welcome',
          sender: 'ai',
          text: isDev
            ? `Welcome to the Developer Full-Access AI Copilot Console. 🛠️⚡\nYou possess ultimate system authority with complete, unrestricted access to all aspects of the application, databases, analytics, customer access levels, and logs.\n\nExamples of developer commands you can execute:\n1. 🍔 **Full Catalog Management**: "Add a custom Premium Smoked Beef Burger for $45 in the Sandwiches category"\n2. 🎫 **Gourmet Promotions**: "Set active exclusive promotion discount to 40% for the entire Pizza menu"\n3. 🚫 **Absolute Account Control**: "Locate the customer uvyffi5@gmail.com and block them instantly from the system"\n4. 🧼 **Data Cleanup**: "Purge incorrect reviews or query general customer profiles"\n\nAsk anything across the entire system, and I will execute it with high priority!`
            : `Welcome to the Manager Limited AI Copilot Console. 📋💼\nAs a Manager, your smart assistant is specifically tailored to focus on daily restaurant operations, including catalog updates, category setups, special/weekly promotional offers, and purging inappropriate reviews. Please note that security actions (such as blocking customers) and system configurations are restricted to Developer access only.\n\nExamples of manager tasks you can prompt:\n1. 🍔 **Menu Catalog Management**: "Add Seafood Marinara Pasta for $50 under the meals category"\n2. 🎫 **Promotions & Discounts**: "Update the active exclusive offer to a 20% discount on gourmet drinks"\n3. 📅 **Weekly Specials Schedule**: "Set Tuesday's special deal to buy-one-get-one-free on pasta dishes"\n4. 🧹 **Review moderation**: "Locate and delete bad reviews"\n\nTell me any adjustments needed for the restaurant's products or offers, and I will execute them immediately!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
  });

  const [loading, setLoading] = useState(false);

  const t = {
    title: isAr 
      ? (currentUserRole === 'Developer' ? 'المساعد الذكي المطلق للمطور (Full Developer Copilot)' : 'المساعد المحدود للمدير (Limited Manager Copilot)')
      : (currentUserRole === 'Developer' ? 'Full Developer AI Copilot' : 'Limited Manager AI Copilot'),
    subtitle: isAr 
      ? (currentUserRole === 'Developer' ? 'تحكم كامل وشامل بدون قيود على جميع أجزاء وقاعدة بيانات الموقع.' : 'إدارة المنتجات، الأقسام، العروض والتقييمات فقط.') 
      : (currentUserRole === 'Developer' ? 'Complete unrestricted command center for database & configurations.' : 'Authorized only for catalog updates, categories, offers, and reviews.'),
    placeholder: isAr ? 'اكتب أمرك هنا (مثال: أضف طبق باستا...)' : 'Type your command here...',
    executing: isAr ? 'جاري تحليل الأمر وتحديث قاعدة البيانات...' : 'Analyzing command & mutating database...',
    badgeExecuted: isAr ? 'تم التنفيذ live' : 'Executed Live',
    actionAddProd: isAr ? '➕ إضافة منتج بنجاح:' : '➕ Added Product:',
    actionDelProd: isAr ? '🗑️ حذف منتج:' : '🗑️ Deleted Product:',
    actionSetExc: isAr ? '🎫 تعديل العرض الحصري:' : '🎫 Set Exclusive Offer:',
    actionSetWeekly: isAr ? '📅 تحديث العروض الأسبوعية' : '📅 Updated Weekly Offers',
    actionBlock: isAr ? '🚫 حظر العميل بنجاح:' : '🚫 Blocked Customer:',
    actionUnblock: isAr ? '🟢 إلغاء حظر العميل:' : '🟢 Unblocked Customer:',
    actionDelReview: isAr ? '🧹 حذف تقييم/تعليق' : '🧹 Deleted Review'
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: cleanPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
          'x-user-role': currentUserRole
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          currentLanguage: currentLang
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Append AI response with executed actions
        const aiMsg: ChatMessage = {
          id: 'msg_' + Date.now() + '_ai',
          sender: 'ai',
          text: data.response,
          actionsExecuted: data.actionsExecuted,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);

        // Propagate the real updated arrays back to parent App.tsx
        onDatabaseMutated({
          products: data.dbProducts,
          exclusiveOffer: data.dbExclusiveOffer,
          weeklyOffers: data.dbWeeklyOffers,
          reviews: data.dbReviews,
          registeredCustomers: data.dbRegisteredCustomers,
          blockedCustomers: data.dbBlockedCustomers
        });
      } else {
        throw new Error(data.error || 'Failed to communicate with AI Copilot.');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + Date.now() + '_err',
        sender: 'ai',
        text: isAr 
          ? `❌ حدث خطأ أثناء تنفيذ الأمر: ${err.message}`
          : `❌ An error occurred during execution: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-slate-100 rounded-3xl p-4 md:p-6 shadow-sm space-y-4 flex flex-col h-[580px]" id="ai-copilot-container">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/10 animate-pulse">
            <Sparkles className="w-5 h-5 text-brand-gold fill-brand-gold" />
          </div>
          <div>
            <h3 className="serif-heading text-sm md:text-base font-extrabold text-brand-blue flex items-center gap-1.5">
              <span>{t.title}</span>
              <span className="inline-flex px-1.5 py-0.5 bg-brand-gold/15 text-brand-gold text-[8px] font-black rounded-full uppercase tracking-wider">
                <Cpu className="w-2 h-2 inline mr-0.5" /> Core v3.5
              </span>
            </h3>
            <p className="text-gray-400 text-[10px]">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>{isAr ? 'متصل ومصرح بالكامل' : 'Online & Fully Authorized'}</span>
          </div>
        </div>
      </div>

      {/* CHAT BUBBLES WINDOW */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 min-h-0 scrollbar-thin">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${
                isAi ? 'bg-brand-blue text-[#FDFBF7]' : 'bg-brand-gold text-[#FDFBF7]'
              }`}>
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                  isAi 
                    ? 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none' 
                    : 'bg-brand-blue text-[#FDFBF7] rounded-tr-none'
                }`}>
                  {/* Message Text */}
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Message Actions Executed Badges */}
                  {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-emerald-600 block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.badgeExecuted}</span>
                      </span>

                      {msg.actionsExecuted.map((act, index) => {
                        let textLabel = '';
                        if (act.type === 'ADD_PRODUCT' && act.payload) {
                          textLabel = `${t.actionAddProd} ${act.payload.name?.[currentLang] || act.payload.name?.ar || ''}`;
                        } else if (act.type === 'DELETE_PRODUCT' && act.payload) {
                          textLabel = `${t.actionDelProd} ${act.payload.id}`;
                        } else if (act.type === 'SET_EXCLUSIVE_OFFER' && act.payload) {
                          textLabel = `${t.actionSetExc} ${act.payload.title?.[currentLang] || act.payload.title?.ar || ''}`;
                        } else if (act.type === 'SET_WEEKLY_OFFERS') {
                          textLabel = `${t.actionSetWeekly}`;
                        } else if (act.type === 'BLOCK_CUSTOMER' && act.payload) {
                          textLabel = `${t.actionBlock} ${act.payload.email}`;
                        } else if (act.type === 'UNBLOCK_CUSTOMER' && act.payload) {
                          textLabel = `${t.actionUnblock} ${act.payload.email}`;
                        } else if (act.type === 'DELETE_REVIEW' && act.payload) {
                          textLabel = `${t.actionDelReview} ID: ${act.payload.id}`;
                        }

                        return (
                          <div key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg">
                            <span>{textLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className={`text-[9px] text-gray-400 block ${isAi ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-brand-blue text-[#FDFBF7] flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-4 rounded-2xl text-xs text-slate-400 border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce delay-200"></span>
              <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce delay-300"></span>
              <span className="ml-1 font-medium italic">{t.executing}</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER SUBMIT FORM */}
      <form onSubmit={handleSendMessage} className="flex gap-2 items-center pt-2 border-t border-slate-100">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.placeholder}
          disabled={loading}
          className="flex-1 text-xs px-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all leading-normal placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-brand-blue hover:bg-brand-blue/95 disabled:opacity-50 text-[#FDFBF7] p-4 rounded-2xl cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center shadow-md shadow-brand-blue/5"
        >
          <Send className="w-4.5 h-4.5 transform rotate-180" />
        </button>
      </form>
    </div>
  );
}
