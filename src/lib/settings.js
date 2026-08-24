import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'global_settings';

export const DEFAULT_SETTINGS = {
    adminPhone: '8919554973',
    adminEmail: 'sivabulle4@gmail.com',
    supportEmail: 'sivabulle4@gmail.com',
    businessHours: 'Mon-Sat, 9AM-8PM',
    location: '123 Fashion Street, Style City',
    whatsappLink: 'https://wa.me/918919554973'
};

export async function getSettings() {
    try {
        const docRef = doc(db, "settings", SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...DEFAULT_SETTINGS, ...docSnap.data() };
        } else {
            return DEFAULT_SETTINGS;
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
        return DEFAULT_SETTINGS;
    }
}

export async function updateSettings(newSettings) {
    try {
        const docRef = doc(db, "settings", SETTINGS_DOC_ID);
        await setDoc(docRef, newSettings, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating settings:", error);
        throw error;
    }
}
