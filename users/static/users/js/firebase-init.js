// static/users/js/firebase-init.js
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Firebase config will be loaded from Django template context
// This prevents exposing sensitive data in client-side code
const firebaseConfig = window.firebaseConfig || {
    apiKey: "AIzaSyDvhr0sUXXVlt8inK-i9JttepuCX59Y9LE",
    authDomain: "django-4c5e9.firebaseapp.com",
    projectId: "django-4c5e9",
    storageBucket: "django-4c5e9.firebasestorage.app",
    messagingSenderId: "748834554329",
    appId: "1:748834554329:web:a5cb30ea9e7583e5cd99c8",
    measurementId: "G-JSHRP5E2GB"
};

let app;
let auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        app = getApp();
        auth = getAuth(app);
    } else {
        console.error('Firebase initialization error', error);
    }
}

export {
    firebaseConfig,
    app,
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
};