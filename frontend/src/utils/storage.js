const STORAGE_KEY = "tms_settings_v1";

/**
 * Safely read settings from localStorage.
 */
export const readSettings = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        const data = JSON.parse(raw);

        // If it’s not an object, reset storage
        if (typeof data !== "object" || Array.isArray(data)) {
            console.warn("Invalid settings format, resetting storage");
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return data;
    } catch (e) {
        console.warn("Failed to read settings:", e);
        return null;
    }
};

/**
 * Save settings object into localStorage.
 */
export const writeSettings = (payload) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn("Failed to write settings:", e);
    }
};

/**
 * Merge new values into existing settings.
 */
export const updateSettings = (patch) => {
    const current = readSettings() || {};
    const updated = { ...current, ...patch };
    writeSettings(updated);
    return updated;
};
