import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyANKzFLH6H2WdS4CbRDk-wi4adL4d7jTf4",
  authDomain: "refood-d60ec.firebaseapp.com",
  projectId: "refood-d60ec",
  storageBucket: "refood-d60ec.firebasestorage.app",
  messagingSenderId: "596529427641",
  appId: "1:596529427641:web:2640f99c1ee4f9637b1768"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);