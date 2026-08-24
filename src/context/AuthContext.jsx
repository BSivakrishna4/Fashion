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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

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
            createdAt: serverTimestamp()
        };

        // Save metadata to Firestore 'users' collection
        try {
            await setDoc(doc(db, 'users', user.uid), newUserData);
        } catch (error) {
            console.error('Failed to create user document:', error);
        }

        setUserData(newUserData);
        return { userCredential, user };
    }

    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { userCredential };
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
                        const isAdmin = user.email?.toLowerCase() === 'sivabulle4@gmail.com' || user.email?.toLowerCase() === 'admin@nfashions.com';
                        setUserData({
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName || 'Customer',
                            role: isAdmin ? 'admin' : 'user'
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
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
