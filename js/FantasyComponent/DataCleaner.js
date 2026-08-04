/**
 * DataCleaner - Utility module untuk membersihkan dangling reference (ID sampah)
 * pada Karakter ketika Skill, Item, atau Familiar dihapus.
 */
export const DataCleaner = {
    /**
     * Helper privat untuk mengiterasi seluruh karakter di semua universe dan kategori,
     * kemudian menjalankan callback pembersihan.
     */
    _cleanCharacterReferences(appData, cleanCallback) {
        if (!appData || !appData.universes) return;

        // Iterasi setiap Universe
        Object.values(appData.universes).forEach(universe => {
            if (!universe || !universe.characters) return;

            // Iterasi setiap Kategori Karakter
            Object.values(universe.characters).forEach(characterCategory => {
                if (!Array.isArray(characterCategory)) return;

                // Iterasi setiap Karakter
                characterCategory.forEach(character => {
                    cleanCallback(character);
                });
            });
        });
    },

    /**
     * Menghapus ID Skill yang sudah tidak ada dari semua karakter.
     * @param {string|number} skillId - ID skill yang dihapus
     * @param {Object} appData - Reference ke state data utama (misal: app.data)
     */
    removeSkillId(skillId, appData) {
        if (!skillId) return;

        this._cleanCharacterReferences(appData, (char) => {
            if (Array.isArray(char.skillIds)) {
                char.skillIds = char.skillIds.filter(id => id !== skillId);
            }
        });
    },

    /**
     * Menghapus ID Item yang sudah tidak ada dari semua karakter.
     * @param {string|number} itemId - ID item yang dihapus
     * @param {Object} appData - Reference ke state data utama (misal: app.data)
     */
    removeItemId(itemId, appData) {
        if (!itemId) return;

        this._cleanCharacterReferences(appData, (char) => {
            if (Array.isArray(char.itemIds)) {
                char.itemIds = char.itemIds.filter(id => id !== itemId);
            }
        });
    },

    /**
     * Menghapus ID Familiar yang sudah tidak ada dari semua karakter.
     * @param {string|number} familiarId - ID familiar yang dihapus
     * @param {Object} appData - Reference ke state data utama (misal: app.data)
     */
    removeFamiliarId(familiarId, appData) {
        if (!familiarId) return;

        this._cleanCharacterReferences(appData, (char) => {
            if (Array.isArray(char.familiarIds)) {
                char.familiarIds = char.familiarIds.filter(id => id !== familiarId);
            }
        });
    },

    /**
     * [Bonus Utility] Membersihkan SELURUH ID sampah sekaligus.
     * Sangat berguna dipanggil saat pertama kali aplikasi dimuat (App Initialization)
     * untuk menyapu bersih sisa-sisa ID hantu dari versi sebelumnya.
     * 
     * @param {Object} appData - Reference ke state data utama (misal: app.data)
     */
    purgeAllOrphanedIds(appData) {
        if (!appData) return;

        // Kumpulkan ID valid yang ada di Master Data
        const validSkillIds = new Set((appData.skills || []).map(s => s.id));
        const validItemIds = new Set((appData.items || []).map(i => i.id));
        const validFamiliarIds = new Set((appData.familiars || []).map(f => f.id));

        this._cleanCharacterReferences(appData, (char) => {
            if (Array.isArray(char.skillIds)) {
                char.skillIds = char.skillIds.filter(id => validSkillIds.has(id));
            }
            if (Array.isArray(char.itemIds)) {
                char.itemIds = char.itemIds.filter(id => validItemIds.has(id));
            }
            if (Array.isArray(char.familiarIds)) {
                char.familiarIds = char.familiarIds.filter(id => validFamiliarIds.has(id));
            }
        });
    }
};