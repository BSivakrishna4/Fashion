import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function sendOtp(uid, email, name) {
        const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, email, name })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send verification code.');
        }
        return data;
    }

    async function verifyOtp(uid, email, otp) {
        const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, email, otp })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to verify code.');
        }

        const targetUid = uid || data.uid || auth.currentUser?.uid || `user_${Date.now()}`;
        const targetEmail = email ? email.trim() : (data.email || auth.currentUser?.email || '');
        const normEmail = targetEmail.toLowerCase();
        const isAdmin = normEmail === 'sivabulle4@gmail.com' || normEmail === 'admin@nfashions.com';

        let activeUser = {
            uid: targetUid,
            email: targetEmail,
            name: targetEmail.split('@')[0] || 'Customer',
            role: isAdmin ? 'admin' : 'user',
            isVerified: true
        };

        if (targetUid) {
            try {
                const docRef = doc(db, 'users', targetUid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    activeUser = { ...docSnap.data(), isVerified: true };
                }
                await setDoc(docRef, activeUser, { merge: true });
            } catch (e) {
                console.error('Failed to update Firestore verification state by uid:', e);
            }
        }
        if (targetEmail) {
            try {
                const q = query(collection(db, 'users'), where('email', '==', targetEmail));
                const querySnap = await getDocs(q);
                querySnap.forEach(async (docSnap) => {
                    await setDoc(docSnap.ref, { isVerified: true }, { merge: true });
                });
            } catch (e) {
                console.error('Failed to update Firestore verification state by email:', e);
            }
        }

        setUserData(activeUser);
        setCurrentUser(prev => prev || {
            uid: activeUser.uid,
            email: activeUser.email,
            displayName: activeUser.name
        });

        return data;
    }

    async function checkUserVerification(uid, email) {
        if (!uid && !email) return false;
        try {
            if (uid) {
                const docRef = doc(db, 'users', uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && (docSnap.data().isVerified === true || docSnap.data().role === 'admin')) {
                    return true;
                }
            }
            const identifier = uid || email;
            const res = await fetch(`${API_BASE_URL}/api/check-verification/${identifier}`);
            if (res.ok) {
                const data = await res.json();
                if (data.isVerified) return true;
            }
        } catch (err) {
            console.error('Error checking verification status:', err);
        }
        return false;
    }

    async function signup(name, email, password) {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update auth profile display name
        await updateProfile(user, { displayName: name });

        const isDefaultAdmin = email.toLowerCase() === 'sivabulle4@gmail.com' || email.toLowerCase() === 'admin@nfashions.com';

        const newUserData = {
            uid: user.uid,
            email: user.email,
            name: name,
            role: isDefaultAdmin ? 'admin' : 'user',
            isVerified: isDefaultAdmin ? true : false,
            createdAt: serverTimestamp()
        };

        // Save metadata to Firestore 'users' collection (without saving passwords/tokens)
        try {
            await setDoc(doc(db, 'users', user.uid), newUserData);
        } catch (error) {
            console.error('Failed to create user document:', error);
        }

        // Trigger OTP generation and email dispatch via backend server
        if (!isDefaultAdmin) {
            try {
                await sendOtp(user.uid, user.email, name);
            } catch (otpErr) {
                console.warn('Initial OTP send error:', otpErr);
            }
        }

        return { userCredential, user };
    }

    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const isDefaultAdmin = email.toLowerCase() === 'sivabulle4@gmail.com' || email.toLowerCase() === 'admin@nfashions.com';

        let isVerified = isDefaultAdmin;
        if (!isVerified) {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().isVerified) {
                    isVerified = true;
                } else {
                    const resUid = await fetch(`${API_BASE_URL}/api/check-verification/${user.uid}`);
                    if (resUid.ok) {
                        const dataUid = await resUid.json();
                        if (dataUid.isVerified) isVerified = true;
                    }
                    if (!isVerified && user.email) {
                        const resEmail = await fetch(`${API_BASE_URL}/api/check-verification/${user.email}`);
                        if (resEmail.ok) {
                            const dataEmail = await resEmail.json();
                            if (dataEmail.isVerified) isVerified = true;
                        }
                    }
                    if (isVerified) {
                        await setDoc(doc(db, 'users', user.uid), { isVerified: true }, { merge: true });
                    }
                }
            } catch (err) {
                console.error('Error reading verification state on login:', err);
            }
        }

        return { userCredential, isVerified };
    }

    async function changePassword(currentPassword, newPassword) {
        if (!auth.currentUser) throw new Error('No user logged in');
        await updatePassword(auth.currentUser, newPassword);
        return true;
    }

    async function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    async function logout() {
        return signOut(auth);
    }

    // Listen to Firebase Auth state changes globally
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        const isAdmin = user.email.toLowerCase() === 'sivabulle4@gmail.com' || user.email.toLowerCase() === 'admin@nfashions.com';
                        setUserData({
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName,
                            role: isAdmin ? 'admin' : 'user',
                            isVerified: isAdmin
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        logout,
        changePassword,
        resetPassword,
        sendOtp,
        verifyOtp,
        checkUserVerification
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
