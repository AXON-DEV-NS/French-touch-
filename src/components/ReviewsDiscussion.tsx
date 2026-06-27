import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, Trash2, ShieldAlert, Award, ArrowUp } from 'lucide-react';

interface ReviewReply {
  id: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  role: 'Customer' | 'Manager' | 'Developer';
  text: string;
  createdAt: string;
}

interface RestaurantReview {
  id: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  role: 'Customer' | 'Manager' | 'Developer';
  rating: number;
  comment: string;
  createdAt: string;
  replies: ReviewReply[];
}

interface ReviewsDiscussionProps {
  currentLang: 'ar' | 'en' | 'fr' | 'it';
  currentUser: { email: string; name: string; role: 'Customer' | 'Manager' | 'Developer'; picture?: string } | null;
  onOpenLogin: () => void;
}

export default function ReviewsDiscussion({ currentLang, currentUser, onOpenLogin }: ReviewsDiscussionProps) {
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState<{ [reviewId: string]: string }>({});
  const [expandedThreads, setExpandedThreads] = useState<{ [reviewId: string]: boolean }>({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingReply, setSubmittingReply] = useState<{ [reviewId: string]: boolean }>({});

  const isAr = currentLang === 'ar';

  const t = {
    title: isAr ? 'تقييمات ومناقشات العملاء' : 'Customer Reviews & Discussions',
    subtitle: isAr 
      ? 'شاركنا تجربتك الفاخرة وتحدث مع زملائك من عشاق المذاق الفرنسي الراقي.' 
      : 'Share your exquisite experience and chat with other French cuisine connoisseurs.',
    averageRating: isAr ? 'متوسط تقييم المطعم' : 'Average Restaurant Rating',
    basedOn: isAr ? 'بناءً على تقييمات حقيقية' : 'Based on authentic reviews',
    writeReview: isAr ? 'اكتب تقييمك الفاخر' : 'Write Your Gourmet Review',
    ratingLabel: isAr ? 'تقييمك النجمي:' : 'Your Star Rating:',
    commentPlaceholder: isAr ? 'اكتب انطباعك عن الأطباق والخدمة والأجواء هنا...' : 'Write your impressions of the dishes, service, and atmosphere...',
    submitReview: isAr ? 'إرسال التقييم الفاخر' : 'Submit Exquisite Review',
    mustLogin: isAr 
      ? 'الرجاء إنشاء حساب زبون فخم أو تسجيل الدخول من صفحة (حسابي) لتتمكن من تقييم المطعم والمشاركة في مناقشات الذواقة.' 
      : 'Please register a Gourmet Customer Account or log in via the (My Account) page to rate the restaurant and join the gourmet discussions.',
    loginBtn: isAr ? 'التوجه لإنشاء حساب أو تسجيل دخول كزبون 👑' : 'Create Account / Log In as Customer 👑',
    replies: isAr ? 'المناقشات والردود' : 'Discussions & Replies',
    writeReplyPlaceholder: isAr ? 'اكتب رداً أو رأياً وتناقش معهم...' : 'Write a reply or opinion and join the chat...',
    sendReply: isAr ? 'إرسال الرد' : 'Send Reply',
    deleteReview: isAr ? 'حظر / حذف التقييم' : 'Block / Delete Review',
    deleteReply: isAr ? 'حذف الرد' : 'Delete Reply',
    noReviews: isAr ? 'لا توجد تقييمات بعد. كن أول من يكتب تقييماً فاخراً!' : 'No reviews yet. Be the first to leave a gourmet review!',
    managerBadge: isAr ? 'مشرف المطعم' : 'Restaurant Manager',
    developerBadge: isAr ? 'مطور النظام' : 'System Developer'
  };

  const fetchReviews = () => {
    setLoading(true);
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(err => console.error('Failed to fetch reviews:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          userEmail: currentUser.email,
          userName: currentUser.name,
          userPicture: currentUser.picture || '',
          role: currentUser.role
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setComment('');
        setRating(5);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!currentUser) return;
    const text = replyText[reviewId]?.trim();
    if (!text) return;

    setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userPicture: currentUser.picture || '',
          role: currentUser.role
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUser || (currentUser.role !== 'Manager' && currentUser.role !== 'Developer')) return;
    if (!window.confirm(isAr ? 'هل أنت متأكد من حظر وحذف هذا التقييم؟' : 'Are you sure you want to block and delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email,
          'x-user-role': currentUser.role
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
    if (!currentUser || (currentUser.role !== 'Manager' && currentUser.role !== 'Developer')) return;
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الرد؟' : 'Are you sure you want to delete this reply?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email,
          'x-user-role': currentUser.role
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

  const toggleThread = (reviewId: string) => {
    setExpandedThreads(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  // Calculate Average Rating
  const average = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div className="space-y-8" id="reviews-discussion-section">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-br from-brand-blue to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-brand-blue/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/20 border border-brand-gold/30 rounded-full text-xs text-brand-gold font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? 'الملتقى التفاعلي الراقي' : 'Exclusive Culinary Forum'}</span>
          </div>
          <h2 className="serif-heading text-2xl md:text-3xl font-black text-brand-gold">
            {t.title}
          </h2>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SIDE PANELS: Stats and Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* STATS CARD */}
          <div className="bg-[#FDFBF7] rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t.averageRating}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-black text-brand-blue">{average}</span>
              <div className="flex flex-col items-start">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-4 h-4 fill-brand-gold ${Number(average) >= s ? 'text-brand-gold' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-[10px] mt-1">{t.basedOn}</span>
              </div>
            </div>
            <div className="h-px bg-slate-100 my-2"></div>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              {isAr 
                ? '⭐ "الطعام الفرنسي ليس مجرد وجبة، بل هو أسلوب حياة ونحن نصنعه بحب للذواقة."'
                : '⭐ "French gourmet is not just a meal, it is a way of life crafted with culinary love."'}
            </p>
          </div>

          {/* RATING SUBMISSION CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="serif-heading text-lg font-bold text-brand-blue flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
              <span>{t.writeReview}</span>
            </h3>

            {currentUser ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-600 block">{t.ratingLabel}</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-transform active:scale-90 cursor-pointer"
                      >
                        <Star 
                          className={`w-7 h-7 transition-colors ${
                            (hoverRating !== null ? hoverRating >= star : rating >= star)
                              ? 'text-brand-gold fill-brand-gold' 
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.commentPlaceholder}
                    rows={4}
                    required
                    className="w-full text-xs p-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-brand-blue hover:bg-brand-blue/95 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-blue/10 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? '...' : t.submitReview}</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center space-y-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-brand-gold">
                  🔑
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {t.mustLogin}
                </p>
                <button
                  onClick={onOpenLogin}
                  className="bg-brand-blue hover:bg-brand-blue/95 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all active:scale-95"
                >
                  {t.loginBtn}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FEED SECTION */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-slate-50 animate-pulse space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-slate-100 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">{t.noReviews}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((rev) => {
                const isExpanded = !!expandedThreads[rev.id];
                const isModerator = currentUser && (currentUser.role === 'Manager' || currentUser.role === 'Developer');

                return (
                  <motion.div
                    key={rev.id}
                    layout="position"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    {/* Review Core Card */}
                    <div className="p-5 md:p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {rev.userPicture ? (
                            <img 
                              src={rev.userPicture} 
                              alt={rev.userName} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-sm">
                              {rev.userName[0]?.toUpperCase() || 'U'}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-800">{rev.userName}</span>
                              {rev.role === 'Manager' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[9px] font-black rounded-full">
                                  <Award className="w-2.5 h-2.5" />
                                  <span>{t.managerBadge}</span>
                                </span>
                              )}
                              {rev.role === 'Developer' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black rounded-full">
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  <span>{t.developerBadge}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(rev.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 fill-brand-gold ${rev.rating >= s ? 'text-brand-gold' : 'text-slate-100'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {rev.comment}
                      </p>

                      {/* Actions row */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => toggleThread(rev.id)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue hover:text-brand-gold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>
                            {t.replies} ({rev.replies?.length || 0})
                          </span>
                        </button>

                        {isModerator && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.deleteReview}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Thread Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-slate-50 border-t border-slate-100 overflow-hidden"
                        >
                          <div className="p-4 md:p-6 space-y-4">
                            {/* Thread Title */}
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              {isAr ? 'المناقشات المباشرة' : 'Live Forum Stream'}
                            </p>

                            {/* Replies List */}
                            <div className="space-y-3">
                              {rev.replies && rev.replies.map((reply) => {
                                return (
                                  <div 
                                    key={reply.id} 
                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 relative"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        {reply.userPicture ? (
                                          <img 
                                            src={reply.userPicture} 
                                            alt={reply.userName} 
                                            referrerPolicy="no-referrer"
                                            className="w-7.5 h-7.5 rounded-full object-cover border border-slate-50" 
                                          />
                                        ) : (
                                          <div className="w-7.5 h-7.5 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs">
                                            {reply.userName[0]?.toUpperCase() || 'U'}
                                          </div>
                                        )}

                                        <div>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-[11px] text-slate-800">{reply.userName}</span>
                                            {reply.role === 'Manager' && (
                                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-brand-gold/10 text-brand-gold text-[8px] font-black rounded">
                                                <span>{t.managerBadge}</span>
                                              </span>
                                            )}
                                            {reply.role === 'Developer' && (
                                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[8px] font-black rounded">
                                                <span>{t.developerBadge}</span>
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[9px] text-gray-400">
                                            {new Date(reply.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {isModerator && (
                                        <button
                                          onClick={() => handleDeleteReply(rev.id, reply.id)}
                                          className="text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Text */}
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium pl-9.5">
                                      {reply.text}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Reply Input Box */}
                            {currentUser ? (
                              <div className="flex gap-2 items-center mt-4">
                                <input
                                  type="text"
                                  value={replyText[rev.id] || ''}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [rev.id]: e.target.value }))}
                                  placeholder={t.writeReplyPlaceholder}
                                  className="flex-1 text-xs px-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all leading-normal"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSubmitReply(rev.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleSubmitReply(rev.id)}
                                  disabled={submittingReply[rev.id]}
                                  className="bg-brand-blue hover:bg-brand-blue/95 text-[#FDFBF7] p-3.5 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md shadow-brand-blue/5 disabled:opacity-50"
                                >
                                  <Send className="w-4 h-4 transform rotate-180" />
                                </button>
                              </div>
                            ) : (
                              <div className="bg-slate-50/55 rounded-xl p-3 text-center border border-slate-100/50 mt-4">
                                <p className="text-[10px] text-gray-500 font-medium">{t.mustLogin}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
