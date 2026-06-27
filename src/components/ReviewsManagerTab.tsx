import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Send, Star, User, Clock, ShieldCheck, ChefHat } from 'lucide-react';
import { Language, Manager } from '../types';

interface ReviewsManagerTabProps {
  currentLang: Language;
  currentUserEmail: string;
  isSuperAdmin: boolean;
  managers: Manager[];
}

interface ReviewReply {
  id: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  role: string;
  text: string;
  createdAt: string;
}

interface RestaurantReview {
  id: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  role: string;
  rating: number;
  comment: string;
  createdAt: string;
  replies: ReviewReply[];
}

export default function ReviewsManagerTab({
  currentLang,
  currentUserEmail,
  isSuperAdmin,
  managers
}: ReviewsManagerTabProps) {
  const isAr = currentLang === 'ar';
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [key: string]: boolean }>({});

  // Resolve manager name
  const currentManager = managers?.find(m => m.email === currentUserEmail);
  const managerName = currentManager?.name || (isSuperAdmin ? (isAr ? 'مطور النظام' : 'System Developer') : (isAr ? 'مدير المطعم' : 'Restaurant Manager'));

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;

    setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          userEmail: currentUserEmail,
          userName: managerName,
          userPicture: '',
          role: isSuperAdmin ? 'Developer' : 'Manager'
        })
      });

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
      } else {
        alert(isAr ? 'فشل إرسال الرد: ' + (data.error || '') : 'Failed to send reply: ' + (data.error || ''));
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا التقييم نهائياً؟' : 'Are you sure you want to permanently delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUserEmail,
          'x-user-role': isSuperAdmin ? 'Developer' : 'Manager'
        }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleDeleteReply = async (reviewId: string, replyId: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الرد نهائياً؟' : 'Are you sure you want to delete this reply?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUserEmail,
          'x-user-role': isSuperAdmin ? 'Developer' : 'Manager'
        }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <h3 className="serif-heading text-lg font-bold text-brand-blue flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-gold" />
            <span>{isAr ? 'لوحة إدارة ومتابعة التقييمات' : 'Reviews & Comments Dashboard'}</span>
          </h3>
          <p className="text-xs text-gray-500">
            {isAr 
              ? 'متابعة ما يكتبه العملاء والرد عليهم بصفتك مديراً، أو إزالة التعليقات المخالفة فوراً.' 
              : 'Interact with customer evaluations, send management replies, and moderate spam feedback.'}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-brand-blue border border-slate-200 rounded-xl text-xs font-bold transition-all"
        >
          {isAr ? 'تحديث التعليقات 🔄' : 'Refresh Feedback 🔄'}
        </button>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-brand-gold border-t-brand-blue animate-spin"></div>
          <p className="text-xs text-gray-400">{isAr ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-500">
            {isAr ? 'لا توجد تعليقات أو تقييمات مكتوبة حالياً.' : 'No customer reviews available yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-white rounded-2xl border border-slate-100/80 p-5 md:p-6 shadow-xs hover:shadow-sm transition-all relative overflow-hidden space-y-4"
            >
              {/* Badge for high rating */}
              {rev.rating >= 4 && (
                <div className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} bg-brand-gold/10 text-brand-gold text-[9px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl tracking-wider uppercase`}>
                  ⭐ {isAr ? 'تقييم ممتاز' : 'Excellent'}
                </div>
              )}

              {/* Reviewer Header info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 shadow-sm">
                    {rev.userPicture ? (
                      <img 
                        src={rev.userPicture} 
                        alt={rev.userName} 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-brand-blue">{rev.userName}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{rev.userEmail}</span>
                      
                      {rev.role === 'Developer' ? (
                        <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">DEV</span>
                      ) : rev.role === 'Manager' ? (
                        <span className="bg-brand-red/5 text-brand-red border border-brand-red/10 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">{isAr ? 'مدير' : 'MGR'}</span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">{isAr ? 'عميل' : 'GUEST'}</span>
                      )}
                    </div>
                    
                    {/* Stars and Date */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-gray-400 text-[10px]">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${rev.rating >= star ? 'text-brand-gold fill-brand-gold' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{new Date(rev.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls (Delete Review) */}
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-1.5 text-slate-300 hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-all shrink-0 cursor-pointer"
                  title={isAr ? 'حذف هذا التقييم' : 'Delete Review'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comment Content */}
              <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/50 text-xs text-brand-charcoal leading-relaxed font-medium">
                {rev.comment}
              </div>

              {/* Replies Container */}
              {rev.replies && rev.replies.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100/50">
                  <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                    <span>💬</span>
                    <span>{isAr ? 'الردود والمناقشات الحالية' : 'Active Discussion'}</span>
                  </h5>
                  
                  <div className="space-y-2">
                    {rev.replies.map((reply) => {
                      const isMgrReply = reply.role === 'Manager' || reply.role === 'Developer';
                      return (
                        <div 
                          key={reply.id} 
                          className={`p-3 rounded-xl border text-xs relative ${
                            isMgrReply 
                              ? 'bg-amber-500/[0.03] border-brand-gold/20 mr-4 ml-0' 
                              : 'bg-slate-50/70 border-slate-100/60 ml-4 mr-0'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              {isMgrReply ? (
                                <ChefHat className="w-3.5 h-3.5 text-brand-gold" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span className="font-bold text-brand-blue">{reply.userName}</span>
                              {isMgrReply && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] bg-brand-gold text-brand-blue font-extrabold px-1.5 py-0.2 rounded">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>{isAr ? 'الرد الرسمي' : 'Official Reply'}</span>
                                </span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleDeleteReply(rev.id, reply.id)}
                              className="text-slate-300 hover:text-brand-red p-1 rounded hover:bg-slate-100 transition-all cursor-pointer"
                              title={isAr ? 'حذف الرد' : 'Delete Reply'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <p className="text-slate-700 font-medium leading-relaxed">{reply.text}</p>
                          <span className="block text-[9px] text-gray-400 font-mono mt-1">
                            {new Date(reply.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fast Reply Box for Manager */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100/50">
                <input
                  type="text"
                  value={replyInputs[rev.id] || ''}
                  onChange={(e) => setReplyInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                  placeholder={isAr ? `اكتب رداً رسمياً بصفتك ${managerName}...` : `Write an official reply as ${managerName}...`}
                  className="flex-1 text-xs px-3.5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all leading-normal"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendReply(rev.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleSendReply(rev.id)}
                  disabled={submittingReply[rev.id] || !replyInputs[rev.id]?.trim()}
                  className="bg-brand-blue hover:bg-brand-blue/95 text-white p-3.5 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
