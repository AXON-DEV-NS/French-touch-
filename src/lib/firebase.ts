import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence, 
  GoogleAuthProvider 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsXBRqYXnVmV8p_M-tQfdJuAfuY-ADWGo",
  authDomain: "french-touch-9e02b.firebaseapp.com",
  projectId: "french-touch-9e02b",
  storageBucket: "french-touch-9e02b.firebasestorage.app",
  messagingSenderId: "162224246102",
  appId: "1:162224246102:web:3888ec39aaf4e16c585af7",
  measurementId: "G-4N2LLM558H"
};

// Initialize Firebase safely to prevent re-initialization errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Safe storage availability check
function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    const testKey = "__firebase_storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

let tempAuth;

try {
  if (isStorageAvailable()) {
    try {
      // Standard initialization
      tempAuth = initializeAuth(app, {
        persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
      });
    } catch (e: any) {
      if (e.code === "auth/already-initialized" || e.name === "FirebaseError") {
        tempAuth = getAuth(app);
      } else {
        console.warn("Standard initializeAuth failed, falling back to getAuth:", e);
        tempAuth = getAuth(app);
      }
    }
  } else {
    console.log("Storage is not available (sandboxed iframe context). Initializing Firebase Auth with in-memory persistence.");
    try {
      tempAuth = initializeAuth(app, {
        persistence: inMemoryPersistence
      });
    } catch (e: any) {
      if (e.code === "auth/already-initialized" || e.name === "FirebaseError") {
        tempAuth = getAuth(app);
      } else {
        console.warn("initializeAuth with inMemoryPersistence failed, falling back to getAuth:", e);
        tempAuth = getAuth(app);
      }
    }
  }
} catch (outerErr) {
  console.error("Outer Firebase Auth initialization error:", outerErr);
  tempAuth = getAuth(app);
}

// Initialize Firebase Auth
export const auth = tempAuth;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

