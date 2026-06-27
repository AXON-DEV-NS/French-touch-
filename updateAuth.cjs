import fs from "fs";
const file = "src/App.tsx";
let code = fs.readFileSync(file, "utf8");

const startStr = `                    <div className="space-y-6">\n                          {/* Form Tabs */}`;
const endStr = `                          </form>\n                        </>\n                      )}\n                    </div>`;

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find start or end block.");
  console.log("Start exists?", startIdx !== -1);
  console.log("End exists?", endIdx !== -1);
} else {
  const newCode = `                    <div className="space-y-6">
                      <div className="text-center space-y-3">
                        <span className="inline-block p-4 bg-brand-gold/10 rounded-full text-2xl mb-2">🍽️</span>
                        <h3 className="serif-heading text-xl md:text-2xl font-extrabold text-brand-blue">
                          {currentLang === 'ar' ? 'سجل دخولك لتجربة فرنش تاتش' : 'Sign in to French Touch'}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          {currentLang === 'ar' 
                            ? 'سجل دخولك بحساب جوجل لتتمكن من حجز الطاولات، طلب الأطباق، ومتابعة سجل طلباتك.' 
                            : 'Sign in with your Google account to manage reservations, order dishes, and view your history.'}
                        </p>
                      </div>

                      {regError && (
                        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-brand-red leading-relaxed flex items-start gap-2 animate-shake">
                          <span className="text-sm">⚠️</span>
                          <div className="text-start">
                            <span className="font-bold block mb-0.5">{currentLang === 'ar' ? 'حدث خطأ:' : 'Error:'}</span>
                            {regError}
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <button
                          onClick={async () => {
                            setRegLoading(true);
                            setRegError('');
                            try {
                              const { auth, googleProvider } = await import('./lib/firebase');
                              const { signInWithPopup } = await import('firebase/auth');
                              const result = await signInWithPopup(auth, googleProvider);
                              const user = result.user;
                              
                              if (!user.email) throw new Error("No email found");
                              
                              // Check backend if needed, or just login
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
                                  const text = await res.text();
                                  let dbUser = JSON.parse(text);
                                  handleLoginSuccess(dbUser);
                                } else {
                                   handleLoginSuccess({
                                      email: user.email,
                                      name: user.displayName || user.email.split("@")[0],
                                      picture: user.photoURL || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${user.email}\`,
                                      role: "Customer"
                                    });
                                }
                              } catch (e) {
                                handleLoginSuccess({
                                  email: user.email,
                                  name: user.displayName || user.email.split("@")[0],
                                  picture: user.photoURL || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${user.email}\`,
                                  role: "Customer"
                                });
                              }
                            } catch (err: any) {
                              console.error(err);
                              setRegError(err.message || 'Authentication failed');
                            } finally {
                              setRegLoading(false);
                            }
                          }}
                          disabled={regLoading}
                          className="w-full py-4 px-6 bg-white border-2 border-slate-200 hover:border-brand-gold hover:bg-slate-50 text-slate-700 font-black rounded-2xl text-sm flex items-center justify-center gap-3 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                        >
                          {regLoading ? (
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.13C18.28 1.83 15.54.96 12.24.96 6.136.96 1.16 5.916 1.16 12s4.975 11.04 11.08 11.04c6.38 0 10.614-4.484 10.614-10.8 0-.727-.08-1.282-.175-1.955H12.24z"/>
                            </svg>
                          )}
                          <span>{currentLang === 'ar' ? 'المتابعة بحساب جوجل' : 'Continue with Google'}</span>
                        </button>
                      </div>
                    </div>`;

  code = code.substring(0, startIdx) + newCode + code.substring(endIdx + endStr.length);
  fs.writeFileSync(file, code);
  console.log("Replaced block successfully.");
}
