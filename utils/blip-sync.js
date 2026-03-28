import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "../firebase-config.js";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Universal Data Sync Utility for BLIPZONES
 * - Syncs to LocalStorage (Immediate feedback)
 * - Syncs to Firestore (Cloud backup for authenticated users)
 */
const blipSync = {
    /**
     * Save Game Data
     * @param {string} gameId - Unique ID for the game (e.g., 'yokai-rebirth', 'flight-glitch')
     * @param {object} data - Game state data to save
     */
    async save(gameId, data) {
        // Enforce timestamp
        const timestamp = Date.now();
        const payload = {
            ...data,
            _lastUpdated: timestamp
        };

        // Always save to localStorage for offline support
        localStorage.setItem(`blip_${gameId}`, JSON.stringify(payload));

        // Sync to cloud if user is authenticated
        const user = auth.currentUser;
        if (user) {
            try {
                const userDocRef = doc(db, "users", user.uid, "games", gameId);
                await setDoc(userDocRef, payload, { merge: true });
                console.log(`[blipSync] Cloud save successful for ${gameId}`);
            } catch (err) {
                console.error(`[blipSync] Cloud save failed:`, err);
            }
        }
    },

    /**
     * Load Game Data
     * @param {string} gameId - Unique ID for the game
     * @returns {object|null} - Game state data
     */
    async load(gameId) {
        let localData = null;
        try {
            const raw = localStorage.getItem(`blip_${gameId}`);
            if (raw) localData = JSON.parse(raw);
        } catch (e) {
            console.error(`[blipSync] Failed to parse local data:`, e);
        }

        const user = auth.currentUser;
        if (user) {
            try {
                const userDocRef = doc(db, "users", user.uid, "games", gameId);
                const snapshot = await getDoc(userDocRef);
                if (snapshot.exists()) {
                    const cloudData = snapshot.data();
                    
                    // Conflict Resolution: Use the newest data
                    if (!localData || (cloudData._lastUpdated > localData._lastUpdated)) {
                        console.log(`[blipSync] Cloud data is newer, updating local storage.`);
                        localStorage.setItem(`blip_${gameId}`, JSON.stringify(cloudData));
                        return cloudData;
                    }
                }
            } catch (err) {
                console.warn(`[blipSync] Cloud fetch failed, using local fallback.`, err);
            }
        }

        return localData;
    },

    /**
     * Save Global Record (e.g., Encyclopedia, Leaderboard Highscore)
     * @param {string} key - Unique key for the record
     * @param {any} value - Value to store (will be wrapped in object)
     */
    async saveGlobal(key, value) {
        const payload = { value, _lastUpdated: Date.now() };
        localStorage.setItem(`blip_global_${key}`, JSON.stringify(payload));

        const user = auth.currentUser;
        if (user) {
            try {
                const globalDocRef = doc(db, "users", user.uid, "globals", key);
                await setDoc(globalDocRef, payload);
            } catch (err) {
                console.error(`[blipSync] Global cloud save failed:`, err);
            }
        }
    },
    
    /**
     * Load Global Record
     */
    async loadGlobal(key) {
        let localValue = null;
        const raw = localStorage.getItem(`blip_global_${key}`);
        if (raw) localValue = JSON.parse(raw);

        const user = auth.currentUser;
        if (user) {
            try {
                const globalDocRef = doc(db, "users", user.uid, "globals", key);
                const snapshot = await getDoc(globalDocRef);
                if (snapshot.exists()) {
                    const cloudVal = snapshot.data();
                    if (!localValue || (cloudVal._lastUpdated > localValue._lastUpdated)) {
                        localStorage.setItem(`blip_global_${key}`, JSON.stringify(cloudVal));
                        return cloudVal.value;
                    }
                }
            } catch (e) {}
        }
        return localValue ? localValue.value : null;
    }
};

// Expose to window for traditional scripts (like yokai.html)
window.blipSync = blipSync;
export default blipSync;
