export const DataCleaner = {
    /**
     * Traversal universal untuk mengiterasi seluruh entitas (Character, Monster, Familiar, Item)
     * termasuk seluruh histori State Snapshot di dalamnya.
     */
    _traverseAllEntities(appData, callback) {
        if (!appData) return;

        // Helper untuk mengeksekusi callback ke root entity & seluruh state snapshot-nya
        const processEntityAndStates = (entity) => {
            if (!entity) return;

            // 1. Eksekusi pembersihan pada root entitas
            callback(entity);

            // 2. Eksekusi pembersihan pada setiap snapshot state-tracker (jika ada)
            if (Array.isArray(entity.states)) {
                entity.states.forEach(state => {
                    if (state && state.snapshot) {
                        callback(state.snapshot);
                    }
                });
            }
        };

        // 1. Iterasi Root Master Data (Items & Familiars)
        if (Array.isArray(appData.items)) appData.items.forEach(item => processEntityAndStates(item));
        if (Array.isArray(appData.familiars)) appData.familiars.forEach(fam => processEntityAndStates(fam));

        // 2. Iterasi Entitas di dalam Universes
        if (appData.universes) {
            const universeList = Array.isArray(appData.universes)
                ? appData.universes
                : Object.values(appData.universes);

            universeList.forEach(universe => {
                if (!universe) return;

                // Helper untuk mengiterasi entitas berbasis Kategori Object { "kategori": [...] }
                const processCategoryGroup = (groupObj) => {
                    if (!groupObj || typeof groupObj !== 'object') return;
                    Object.values(groupObj).forEach(categoryArray => {
                        if (Array.isArray(categoryArray)) {
                            categoryArray.forEach(entity => processEntityAndStates(entity));
                        }
                    });
                };

                // Iterasi Characters & Monsters
                processCategoryGroup(universe.characters);
                processCategoryGroup(universe.monsters);
            });
        }
    },

    removeRaceId(raceId, appData) {
        if (!raceId) return;
        this._traverseAllEntities(appData, (entity) => {
            if (entity.raceId === raceId) entity.raceId = "";
        });
    },

    removeSkillId(skillId, appData) {
        if (!skillId) return;
        this._traverseAllEntities(appData, (entity) => {
            if (Array.isArray(entity.skillIds)) {
                entity.skillIds = entity.skillIds.filter(id => id !== skillId);
            }
        });
    },

    removeItemId(itemId, appData) {
        if (!itemId) return;
        this._traverseAllEntities(appData, (entity) => {
            if (entity.id !== itemId && Array.isArray(entity.itemIds)) {
                entity.itemIds = entity.itemIds.filter(id => id !== itemId);
            }
        });
    },

    removeFamiliarId(familiarId, appData) {
        if (!familiarId) return;
        this._traverseAllEntities(appData, (entity) => {
            if (entity.id !== familiarId && Array.isArray(entity.familiarIds)) {
                entity.familiarIds = entity.familiarIds.filter(id => id !== familiarId);
            }
        });
    },

    purgeAllOrphanedIds(appData) {
        if (!appData) return;

        const validRaceIds = new Set((appData.races || []).map(r => r.id));
        const validSkillIds = new Set((appData.skills || []).map(s => s.id));
        const validItemIds = new Set((appData.items || []).map(i => i.id));
        const validFamiliarIds = new Set((appData.familiars || []).map(f => f.id));

        this._traverseAllEntities(appData, (entity) => {
            if (entity.raceId && !validRaceIds.has(entity.raceId)) entity.raceId = "";
            if (Array.isArray(entity.skillIds)) entity.skillIds = entity.skillIds.filter(id => validSkillIds.has(id));
            if (Array.isArray(entity.itemIds)) entity.itemIds = entity.itemIds.filter(id => validItemIds.has(id));
            if (Array.isArray(entity.familiarIds)) entity.familiarIds = entity.familiarIds.filter(id => validFamiliarIds.has(id));
        });
    }
};