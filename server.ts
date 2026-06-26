import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Lazy initialization of GoogleGenAI to prevent startup crashes when GEMINI_API_KEY is missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Body parsing middleware (increased limit to support base64 device image uploads)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Persistent JSON Database path
const DB_FILE = path.join(process.cwd(), "database.json");

interface Visitor {
  email: string;
  name: string;
  picture?: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  authType: "google" | "sandbox" | "firebase-google";
  role: "Developer" | "Manager" | "Customer";
}

interface ManagerObj {
  email: string;
  name: string;
  addedAt: string;
  password?: string;
  lang?: string;
}

interface RegisteredCustomer {
  firstName: string;
  secondName: string;
  thirdName: string;
  phone: string;
  alternativePhone: string;
  email: string;
  picture: string; // base64 or URL
  registeredAt: string;
}

interface EmailLogObj {
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "DELIVERED";
}

interface DbSchema {
  managers: ManagerObj[];
  visitors: Visitor[];
  pageViews?: number;
  categories?: { id: string; name: { ar: string; en: string; fr: string; it: string }; icon?: string }[];
  subscribers?: string[];
  registeredCustomers?: RegisteredCustomer[];
  emailLogs?: EmailLogObj[];
  blockedCustomers?: RegisteredCustomer[];
  orderCounter?: number;
}

const DEFAULT_CATEGORIES = [
  { id: "sandwiches", name: { ar: "السندوتشات الفاخرة", en: "Gourmet Sandwiches", fr: "Sandwiches Fins", it: "Panini Gourmet" }, icon: "ChefHat" },
  { id: "fries", name: { ar: "بطاطس فرنش تاتش", en: "French Touch Fries", fr: "Frites Croustillantes", it: "Patatine Croccanti" }, icon: "Sparkles" },
  { id: "desserts", name: { ar: "الحلويات اللذيذة", en: "Delicious Desserts", fr: "Desserts Fins", it: "Dolci Deliziosi" }, icon: "Cake" },
  { id: "drinks", name: { ar: "المشروبات المنعشة", en: "Refreshing Drinks", fr: "Boissons", it: "Bevande" }, icon: "GlassWater" }
];

// Read database helper
function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DbSchema = {
        managers: [], // Developer will add managers dynamically
        visitors: [],
        pageViews: 0,
        categories: DEFAULT_CATEGORIES,
        subscribers: [],
        registeredCustomers: [],
        emailLogs: [],
        blockedCustomers: [],
        orderCounter: 0
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    let changed = false;

    if (parsed.orderCounter === undefined) {
      parsed.orderCounter = 0;
      changed = true;
    }

    if (parsed.pageViews === undefined) {
      parsed.pageViews = 0;
      changed = true;
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
      changed = true;
    }
    if (!parsed.subscribers) {
      parsed.subscribers = [];
      changed = true;
    }
    if (!parsed.registeredCustomers) {
      parsed.registeredCustomers = [];
      changed = true;
    }
    if (!parsed.emailLogs) {
      parsed.emailLogs = [];
      changed = true;
    }
    if (!parsed.blockedCustomers) {
      parsed.blockedCustomers = [];
      changed = true;
    }
    if (parsed.managers) {
      parsed.managers = parsed.managers.map((m: any) => {
        if (typeof m === "string") {
          return {
            email: m.toLowerCase(),
            name: m.split("@")[0],
            addedAt: new Date().toISOString(),
            password: "123" // default fallback password
          };
        }
        return m;
      });
    } else {
      parsed.managers = [];
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (error) {
    console.error("Error reading database:", error);
    return { managers: [], visitors: [], pageViews: 0, categories: DEFAULT_CATEGORIES, subscribers: [], registeredCustomers: [], emailLogs: [] };
  }
}

// Write database helper
function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Security Middlewares for Role Separation
function requireDeveloper(req: express.Request, res: express.Response, next: express.NextFunction) {
  const email = (req.headers["x-user-email"] as string || "").trim().toLowerCase();
  const role = (req.headers["x-user-role"] as string || "").trim();
  
  if (email === "oren.on.oren.25@gmail.com" || role === "Developer") {
    return next();
  }
  
  return res.status(403).json({ error: "Access denied. Only the primary Developer possesses full authorization to access or modify this resource." });
}

function requireManagerOrDeveloper(req: express.Request, res: express.Response, next: express.NextFunction) {
  const email = (req.headers["x-user-email"] as string || "").trim().toLowerCase();
  const role = (req.headers["x-user-role"] as string || "").trim();
  
  if (email === "oren.on.oren.25@gmail.com" || role === "Developer" || role === "Manager") {
    return next();
  }
  
  return res.status(403).json({ error: "Access denied. You must be an authorized Manager or Developer to perform this action." });
}

// 1. Google OAuth URL Request
app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.json({ url: "", missingConfig: true });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    prompt: "select_account"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, missingConfig: false });
});

// 2. Google OAuth Callback Route
app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    // Reconstruct exact redirect URI for token exchange
    // Note: The callback endpoint must receive the same redirect_uri as passed to google authorization.
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const redirectUri = `${protocol}://${host}/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error("Token exchange failed:", tokens);
      return res.status(500).send(`Token exchange failed: ${JSON.stringify(tokens)}`);
    }

    // Fetch user profile from google userinfo API
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      return res.status(400).send("Could not retrieve email from Google Profile");
    }

    const email = profile.email.toLowerCase();
    const name = profile.name || profile.given_name || email.split("@")[0];
    const picture = profile.picture || "";

    // Determine Role
    let role: "Developer" | "Manager" | "Customer" = "Customer";
    let managerLang: string | undefined = undefined;
    if (email === "oren.on.oren.25@gmail.com") {
      role = "Developer";
    } else {
      const db = readDb();
      const manager = db.managers.find(m => m.email.toLowerCase() === email);
      if (manager) {
        role = "Manager";
        managerLang = manager.lang || "ar";
      }
    }

    // Log the visitor
    const db = readDb();
    const newVisitor: Visitor = {
      email,
      name,
      picture,
      timestamp: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Unknown",
      authType: "google",
      role
    };
    db.visitors.unshift(newVisitor);
    writeDb(db);

    // Send successful popup payload to close popup and postMessage back to parent window
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Authentication Success</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f8fafc;">
          <h2 style="color: #1e3a8a;">⚜️ Connexion réussie!</h2>
          <p style="color: #475569;">Authentification avec Google effectuée avec succès.</p>
          <p style="color: #94a3b8; font-size: 12px;">This window will close automatically...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: "GOOGLE_AUTH_SUCCESS",
                user: {
                  email: ${JSON.stringify(email)},
                  name: ${JSON.stringify(name)},
                  picture: ${JSON.stringify(picture)},
                  role: ${JSON.stringify(role)},
                  lang: ${JSON.stringify(managerLang)}
                },
                idToken: ${JSON.stringify(tokens.id_token || null)}
              }, "*");
              window.close();
            } else {
              window.location.href = "/";
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    res.status(500).send(`Authentication failed: ${error.message || error}`);
  }
});

// 3. Sandbox Login Route (For local development & instant testing)
app.post("/api/auth/sandbox", (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split("@")[0];

  // Determine Role
  let role: "Developer" | "Manager" | "Customer" = "Customer";
  let managerLang: string | undefined = undefined;
  if (cleanEmail === "oren.on.oren.25@gmail.com") {
    role = "Developer";
  } else {
    const db = readDb();
    const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
    if (manager) {
      role = "Manager";
      managerLang = manager.lang || "ar";
    }
  }

  // Log visitor
  const db = readDb();
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: cleanName,
    picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Sandbox Sandbox",
    authType: "sandbox",
    role
  };
  db.visitors.unshift(newVisitor);
  writeDb(db);

  res.json({
    email: cleanEmail,
    name: cleanName,
    picture: newVisitor.picture,
    role,
    lang: managerLang
  });
});

// 3.5 Firebase Auth Login Route
app.post("/api/auth/firebase-login", (req, res) => {
  const { email, name, picture } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split("@")[0];

  // Determine Role
  let role: "Developer" | "Manager" | "Customer" = "Customer";
  let managerLang: string | undefined = undefined;
  if (cleanEmail === "oren.on.oren.25@gmail.com") {
    role = "Developer";
  } else {
    const db = readDb();
    const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
    if (manager) {
      role = "Manager";
      managerLang = manager.lang || "ar";
    }
  }

  // Log visitor
  const db = readDb();
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: cleanName,
    picture: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Firebase-Google Auth Client",
    authType: "firebase-google",
    role
  };
  db.visitors.unshift(newVisitor);
  writeDb(db);

  res.json({
    email: cleanEmail,
    name: cleanName,
    picture: newVisitor.picture,
    role,
    lang: managerLang
  });
});

// 4. Managers Endpoints
app.get("/api/managers", requireDeveloper, (req, res) => {
  const db = readDb();
  res.json(db.managers);
});

app.post("/api/managers", requireDeveloper, (req, res) => {
  const { email, name, password, lang } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split("@")[0];
  const cleanPassword = password?.trim() || "123";
  const cleanLang = lang || "ar";
  const db = readDb();

  if (db.managers.some(m => m.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: "Email is already authorized as a manager" });
  }

  const newManager = {
    email: cleanEmail,
    name: cleanName,
    password: cleanPassword,
    lang: cleanLang,
    addedAt: new Date().toISOString()
  };

  db.managers.push(newManager);
  writeDb(db);
  res.json({ success: true, managers: db.managers });
});

app.delete("/api/managers/:email", requireDeveloper, (req, res) => {
  const emailToRemove = req.params.email.trim().toLowerCase();
  const db = readDb();

  db.managers = db.managers.filter(m => m.email.toLowerCase() !== emailToRemove);
  writeDb(db);
  res.json({ success: true, managers: db.managers });
});

// 4.5 Manager Password Login Gate
app.post("/api/auth/manager-login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const db = readDb();

  const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
  if (!manager) {
    return res.status(401).json({ error: "هذا البريد الإلكتروني غير مسجل كمدير في النظام." });
  }

  if (manager.password !== cleanPassword) {
    return res.status(401).json({ error: "كلمة المرور غير صحيحة، يرجى مراجعة المطور." });
  }

  // Log as visitor
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: manager.name,
    picture: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanEmail}`,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "French Touch Secure Gate",
    authType: "sandbox",
    role: "Manager"
  };
  db.visitors.unshift(newVisitor);
  writeDb(db);

  res.json({
    success: true,
    user: {
      email: cleanEmail,
      name: manager.name,
      role: "Manager",
      picture: newVisitor.picture,
      lang: manager.lang || "ar"
    }
  });
});

// 4.5.5 Customer Registration with Gemini Face Validation
async function validateProfilePictureWithGemini(base64DataUrl: string): Promise<{ isHumanFace: boolean; reason?: string }> {
  try {
    const ai = getGeminiClient();
    if (!base64DataUrl) {
      return { isHumanFace: false, reason: "لم يتم توفير صورة الحساب" };
    }

    // Extract mime type and clean base64 data
    const matches = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return { isHumanFace: false, reason: "صيغة الصورة غير صالحة" };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const promptText = `Evaluate the uploaded profile picture.
Determine if it is a photo of a real human being with clear and visible facial features.
Criteria:
- It must be a real photo of a human face (not a cartoon, not an avatar, not an object, not an animal).
- The face and features must be clearly visible and recognizable (not heavily blurred, not extremely dark, not completely obscured, and not heavily filtered).

You must respond STRICTLY with a JSON object in this format:
{
  "isHumanFace": boolean,
  "reason": "Explain in Arabic the reason if false, or leave empty if true"
}

Arabic examples of reasons:
- "الصورة المرفوعة ليست لشخص حقيقي (رسومات أو مجسم أو كارتون). يرجى رفع صورة حقيقية واضحة."
- "ملامح الوجه غير واضحة أو مظلمة جداً أو مغطاة. يرجى رفع صورة بملامح ظاهرة."
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, { text: promptText }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
      isHumanFace: !!result.isHumanFace,
      reason: result.reason || "الصورة غير مطابقة للمواصفات المطلوبة لوجه بشري بملامح ظاهره."
    };
  } catch (error: any) {
    console.error("Gemini face validation failed:", error);
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Profile picture auto-approved (simulated check).");
      return { isHumanFace: true };
    }
    return { isHumanFace: false, reason: "فشل التحقق الذكي من الصورة حالياً: " + error.message };
  }
}

function normalizeArabic(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function checkSimilarityWithBlockedGemini(
  newCust: { firstName: string; secondName: string; thirdName: string; phone: string; alternativePhone: string; email: string; picture: string },
  blockedCusts: any[]
): Promise<{ isBlocked: boolean; reason?: string }> {
  try {
    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) return { isBlocked: false };

    // Format blocked list for text analysis
    const blockedListText = blockedCusts.map((b, idx) => {
      return `Blocked User #${idx + 1}:
- Name: ${b.firstName} ${b.secondName} ${b.thirdName}
- Email: ${b.email}
- Phones: ${b.phone}, ${b.alternativePhone}`;
    }).join("\n\n");

    const promptText = `We are a high-end restaurant with a strict security policy. We have a list of banned/blocked customers who tried to cheat, bypass limits, or misbehave.
We need to check if this new registration belongs to a blocked person using "similar information", "similar numbers", "similar name", or "similar face profile".

NEW REGISTRATION DETAILS:
- Name: ${newCust.firstName} ${newCust.secondName} ${newCust.thirdName}
- Email: ${newCust.email}
- Phones: ${newCust.phone}, ${newCust.alternativePhone}

LIST OF BANNED CUSTOMERS:
${blockedListText}

TASK:
1. Analyze if the new registration details (Name, Email, Phone Numbers) are identical, slightly altered, or highly similar to any of the banned customers above. (For example, slight spelling differences, swapping names, adding/removing country codes in phones, dots in gmail, or slightly different email names).
2. Look at the uploaded photo of the new registrant. Determine if they are the exact same person visually as any previously blocked customer. Note: You should check if the face structure, nose, eyes, or overall facial features are highly similar to any known blocked accounts (if you can determine).

Respond strictly in JSON format:
{
  "isBlocked": boolean,
  "reason": "Explain in clear Arabic why they are blocked (e.g. 'تم رفض التسجيل لمطابقة البيانات مع حساب محظور نهائياً بسبب تماثل الهاتف/الاسم/الملامح')"
}`;

    const parts: any[] = [];
    
    // Add new customer image
    const matches = newCust.picture.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length >= 3) {
      parts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      });
    }

    // Add up to 2 blocked customer images to compare visually
    const recentBlockedWithPics = blockedCusts.filter(b => b.picture).slice(0, 2);
    recentBlockedWithPics.forEach((b, idx) => {
      const bMatches = b.picture.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (bMatches && bMatches.length >= 3) {
        parts.push({
          inlineData: {
            mimeType: bMatches[1],
            data: bMatches[2]
          }
        });
        parts.push({ text: `This is the image of Banned User #${idx + 1}` });
      }
    });

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      isBlocked: !!result.isBlocked,
      reason: result.reason
    };
  } catch (err) {
    console.error("Gemini similarity check failed:", err);
    return { isBlocked: false };
  }
}

app.post("/api/auth/register-customer", async (req, res) => {
  const { firstName, secondName, thirdName, phone, alternativePhone, email, picture } = req.body;
  if (!firstName || !secondName || !thirdName || !phone || !alternativePhone || !email || !picture) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة إجبارياً، بما في ذلك الاسم الثلاثي، الهواتف، البريد وصورة الحساب." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();

  // 1. Check strict programmatic blocking first
  const blocked = db.blockedCustomers || [];
  const cleanNewPhone = cleanPhone(phone);
  const cleanNewAltPhone = cleanPhone(alternativePhone);
  const normNewName = normalizeArabic(`${firstName} ${secondName} ${thirdName}`);

  for (const b of blocked) {
    const bEmail = b.email.trim().toLowerCase();
    const bPhone = cleanPhone(b.phone);
    const bAlt = cleanPhone(b.alternativePhone);
    const normBName = normalizeArabic(`${b.firstName} ${b.secondName} ${b.thirdName}`);

    if (cleanEmail === bEmail) {
      return res.status(400).json({ error: "تم حظر هذا البريد الإلكتروني نهائياً من قبل الإدارة لمخالفته القوانين." });
    }
    if (cleanNewPhone === bPhone || cleanNewPhone === bAlt || (cleanNewAltPhone && (cleanNewAltPhone === bPhone || cleanNewAltPhone === bAlt))) {
      return res.status(400).json({ error: "رقم الهاتف المدخل (أو الاحتياطي) مرتبط بحساب تم حظره نهائياً." });
    }
    if (normNewName === normBName) {
      return res.status(400).json({ error: "الاسم الثلاثي المدخل متطابق مع اسم مستخدم تم حظره نهائياً من النظام." });
    }
    if (picture === b.picture) {
      return res.status(400).json({ error: "الصورة المرفوعة مخصصة لحساب محظور مسبقاً." });
    }
  }

  // 2. Check intelligent Gemini-based similarity block check
  if (blocked.length > 0) {
    const geminiBlockCheck = await checkSimilarityWithBlockedGemini(
      { firstName, secondName, thirdName, phone, alternativePhone, email, picture },
      blocked
    );
    if (geminiBlockCheck.isBlocked) {
      return res.status(400).json({ error: geminiBlockCheck.reason || "تم رفض التسجيل لوجود مطابقة مع حساب محظور." });
    }
  }

  // Check if already registered
  const exists = (db.registeredCustomers || []).some(c => c.email.toLowerCase() === cleanEmail);
  if (exists) {
    return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل." });
  }

  // Validate face
  const faceCheck = await validateProfilePictureWithGemini(picture);
  if (!faceCheck.isHumanFace) {
    return res.status(400).json({ error: faceCheck.reason });
  }

  // Add customer
  const newCustomer: RegisteredCustomer = {
    firstName: firstName.trim(),
    secondName: secondName.trim(),
    thirdName: thirdName.trim(),
    phone: phone.trim(),
    alternativePhone: alternativePhone.trim(),
    email: cleanEmail,
    picture: picture,
    registeredAt: new Date().toISOString()
  };

  if (!db.registeredCustomers) db.registeredCustomers = [];
  db.registeredCustomers.unshift(newCustomer);

  // Automatically make them a subscriber too
  if (!db.subscribers) db.subscribers = [];
  if (!db.subscribers.includes(cleanEmail)) {
    db.subscribers.push(cleanEmail);
  }

  // Log as visitor
  const fullName = `${newCustomer.firstName} ${newCustomer.secondName} ${newCustomer.thirdName}`;
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: fullName,
    picture: picture,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Customer Registration Flow",
    authType: "sandbox",
    role: "Customer"
  };
  db.visitors.unshift(newVisitor);

  // Auto-send welcome email log with latest offers/products
  const emailLog: EmailLogObj = {
    toEmail: cleanEmail,
    subject: "🎁 أهلاً بك في فرنش تاتش! عروضنا الحصرية والمنتجات الجديدة بانتظارك",
    body: `مرحباً ${newCustomer.firstName}،
تم تسجيل حسابك بنجاح في تطبيق مطعم فرنش تاتش (French Touch)!

إليك أحدث العروض والمنتجات الحصرية المتوفرة لدينا الآن:
1. بطاطس فرنش تاتش اللذيذة بالجبنة والأعشاب البرية.
2. السندوتشات الفاخرة مثل سندوتش كروك موسيو الكلاسيكي.
3. الحلويات الفرنسية الفاخرة المجهزة يومياً.

خصم ترحيبي خاص 20% على طلبك القادم! كود الخصم: WELCOME20

تم إرسال هذه النشرة تلقائياً وإجبارياً لبريدك الإلكتروني المسجل لدينا: ${cleanEmail}.
أهلاً بك في عائلتنا المميزة!`,
    sentAt: new Date().toISOString(),
    status: "DELIVERED"
  };

  if (!db.emailLogs) db.emailLogs = [];
  db.emailLogs.unshift(emailLog);

  writeDb(db);

  res.json({
    success: true,
    user: {
      email: cleanEmail,
      name: `${newCustomer.firstName} ${newCustomer.secondName}`,
      role: "Customer",
      picture: picture,
      lang: "ar",
      details: newCustomer
    }
  });
});

app.get("/api/registered-customers", requireDeveloper, (req, res) => {
  const db = readDb();
  res.json(db.registeredCustomers || []);
});

app.get("/api/blocked-customers", requireDeveloper, (req, res) => {
  const db = readDb();
  res.json(db.blockedCustomers || []);
});

app.post("/api/block-customer", requireDeveloper, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to block a customer." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();

  const customerIndex = (db.registeredCustomers || []).findIndex(c => c.email.toLowerCase() === cleanEmail);
  if (customerIndex === -1) {
    return res.status(404).json({ error: "لم يتم العثور على هذا العميل في قائمة المسجلين." });
  }

  const [customerToBlock] = db.registeredCustomers!.splice(customerIndex, 1);

  if (!db.blockedCustomers) db.blockedCustomers = [];
  if (!db.blockedCustomers.some(b => b.email.toLowerCase() === cleanEmail)) {
    db.blockedCustomers.unshift(customerToBlock);
  }

  writeDb(db);
  res.json({ success: true, registeredCustomers: db.registeredCustomers, blockedCustomers: db.blockedCustomers });
});

app.post("/api/unblock-customer", requireDeveloper, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to unblock a customer." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();

  const blockedIndex = (db.blockedCustomers || []).findIndex(b => b.email.toLowerCase() === cleanEmail);
  if (blockedIndex === -1) {
    return res.status(404).json({ error: "هذا العميل ليس في قائمة المحظورين." });
  }

  const [unblockedCust] = db.blockedCustomers!.splice(blockedIndex, 1);
  
  if (!db.registeredCustomers) db.registeredCustomers = [];
  if (!db.registeredCustomers.some(c => c.email.toLowerCase() === cleanEmail)) {
    db.registeredCustomers.unshift(unblockedCust);
  }

  writeDb(db);
  res.json({ success: true, registeredCustomers: db.registeredCustomers, blockedCustomers: db.blockedCustomers });
});

app.get("/api/email-logs", requireDeveloper, (req, res) => {
  const db = readDb();
  res.json(db.emailLogs || []);
});

// 4.6 Newsletter & Gmail Subscribers API
app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  if (!db.subscribers) db.subscribers = [];
  if (!db.subscribers.includes(cleanEmail)) {
    db.subscribers.push(cleanEmail);
    writeDb(db);
  }
  res.json({ success: true, subscribers: db.subscribers });
});

app.get("/api/subscribers", requireDeveloper, (req, res) => {
  const db = readDb();
  res.json(db.subscribers || []);
});

app.post("/api/send-newsletter", requireDeveloper, (req, res) => {
  const { subject, body } = req.body;
  const db = readDb();
  const subs = db.subscribers || [];
  
  console.log(`[SIMULATION] Dispatching newsletter to ${subs.length} emails:`);
  subs.forEach(email => {
    console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${subject}`);
  });
  
  res.json({ success: true, count: subs.length, subscribers: subs });
});

// 5. Visitors logs (accessible to Developer only)
app.get("/api/visitors", requireDeveloper, (req, res) => {
  const db = readDb();
  res.json(db.visitors);
});

app.delete("/api/visitors", requireDeveloper, (req, res) => {
  const db = readDb();
  db.visitors = [];
  writeDb(db);
  res.json({ success: true, visitors: [] });
});

// 6. Page Views Count API
app.get("/api/pageviews", (req, res) => {
  const db = readDb();
  res.json({ count: db.pageViews || 0 });
});

app.post("/api/pageviews/increment", (req, res) => {
  const db = readDb();
  db.pageViews = (db.pageViews || 0) + 1;
  writeDb(db);
  res.json({ count: db.pageViews });
});

app.post("/api/orders/next-number", (req, res) => {
  const db = readDb();
  const nextNum = (db.orderCounter || 0) + 1;
  db.orderCounter = nextNum;
  writeDb(db);
  res.json({ orderNumber: nextNum });
});

// 7. Dynamic Sections/Categories API
app.get("/api/categories", (req, res) => {
  const db = readDb();
  res.json(db.categories || DEFAULT_CATEGORIES);
});

app.post("/api/categories", requireManagerOrDeveloper, (req, res) => {
  const { id, name, icon } = req.body;
  if (!id || !name || !name.ar || !name.en || !name.fr || !name.it) {
    return res.status(400).json({ error: "id and names in all 4 languages are required." });
  }

  const db = readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  // Check duplicate
  if (db.categories.some(c => c.id.toLowerCase() === id.toLowerCase())) {
    return res.status(400).json({ error: "Section ID already exists" });
  }

  db.categories.push({ id, name, icon: icon || "Utensils" });
  writeDb(db);
  res.json({ success: true, categories: db.categories });
});

app.delete("/api/categories/:id", requireManagerOrDeveloper, (req, res) => {
  const categoryId = req.params.id;
  const db = readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  db.categories = db.categories.filter(c => c.id !== categoryId);
  writeDb(db);
  res.json({ success: true, categories: db.categories });
});

app.put("/api/categories/:id", requireManagerOrDeveloper, (req, res) => {
  const categoryId = req.params.id;
  const { name, icon } = req.body;
  if (!name || !name.ar || !name.en || !name.fr || !name.it) {
    return res.status(400).json({ error: "Names in all 4 languages are required." });
  }

  const db = readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  const idx = db.categories.findIndex(c => c.id === categoryId);
  if (idx === -1) {
    return res.status(404).json({ error: "Category not found." });
  }

  db.categories[idx] = {
    ...db.categories[idx],
    name,
    icon: icon || db.categories[idx].icon || "utensils"
  };

  writeDb(db);
  res.json({ success: true, categories: db.categories });
});

// 8. Dynamic Translation API (using Gemini)
app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang" });
  }

  try {
    const langNames: Record<string, string> = {
      ar: "Arabic (العربية)",
      en: "English",
      fr: "French (Français)",
      it: "Italian (Italiano)"
    };

    const target = langNames[targetLang] || targetLang;

    // Check if key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing, returning original text.");
      return res.json({ translation: text });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert culinary translator. Translate the following restaurant menu item name, description, or section title into ${target}. 

Rules:
- Translate the text accurately, keeping a high-end gourmet restaurant tone.
- Return ONLY the exact translated text.
- Do NOT add quotes, explanation, punctuation, markdown, or preface.
- Do NOT say "Here is the translation:".
- If the text is empty or is already in that language, return it exactly as is.

Text to translate:
${text}`,
    });

    const translatedText = response.text?.trim() || text;
    res.json({ translation: translatedText });
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    res.json({ translation: text }); // Fallback
  }
});

// ----------------------------------------------------
// VITE AND ASSETS SERVING MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Load Vite in Middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
