import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0447591345",
  appId: "1:1047666840859:web:8d9938fad9ed225339efbe",
  apiKey: "AIzaSyDHyK14UAnuxfrREq80KIA-s5Ks9qKlN3s",
  authDomain: "gen-lang-client-0447591345.firebaseapp.com",
  storageBucket: "gen-lang-client-0447591345.firebasestorage.app",
  messagingSenderId: "1047666840859",
  measurementId: ""
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, "ai-studio-franchtouch-c185637b-7de9-4621-bd19-1411605bdf0f");
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

