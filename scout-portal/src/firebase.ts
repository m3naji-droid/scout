import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDE2Y7MMEolBdyBLQ0ljGigfH6_eoCuCo",
  authDomain: "ahmed-alfateh-scouts.firebaseapp.com",
  projectId: "ahmed-alfateh-scouts",
  storageBucket: "ahmed-alfateh-scouts.firebasestorage.app",
  messagingSenderId: "801783649355",
  appId: "1:801783649355:web:185d73dae8099ac120e9ce",
  measurementId: "G-7V2SKWS4D8"
};

const app = initializeApp(firebaseConfig);

// تصدير قاعدة البيانات لاستخدامها في التطبيق
export const db = getFirestore(app);

export default app;
