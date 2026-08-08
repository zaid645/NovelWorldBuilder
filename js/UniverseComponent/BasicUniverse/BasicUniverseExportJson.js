// Logika bantuan export json

export const BasicUniverseExportJson = {
    // --- HELPER UNTUK POPULATED UNIVERSE (JSON) REVISED ---
    populateUniverse(universe) {
        const populatedCharacters = JSON.parse(JSON.stringify(universe.characters || {}));
        const populatedMonsters = JSON.parse(JSON.stringify(universe.monsters || {}));
        
        // 1. POPULATE KARAKTER (Abaikan ID yang terhapus)
        for (let category in populatedCharacters) {
            if (Array.isArray(populatedCharacters[category])) {
                populatedCharacters[category].forEach(char => {
                    if (char.skillIds && Array.isArray(char.skillIds) && app.data.skills) {
                        char.skills = char.skillIds
                            .map(sId => app.data.skills.find(s => s.id === sId))
                            .filter(Boolean);
                        delete char.skillIds;
                    }

                    // 1. Populate Kelas & Gelar pada Karakter
                    if (char.classIds && Array.isArray(char.classIds) && app.data.classes) {
                        char.classes = char.classIds
                            .map(cId => app.data.classes.find(c => c.id === cId))
                            .filter(Boolean);
                        delete char.classIds;
                    }

                    if (char.titleIds && Array.isArray(char.titleIds) && app.data.titles) {
                        char.titles = char.titleIds
                            .map(tId => app.data.titles.find(t => t.id === tId))
                            .filter(Boolean);
                        delete char.titleIds;
                    }
                    
                    if (char.itemIds && Array.isArray(char.itemIds) && app.data.items) {
                        char.items = char.itemIds
                            .map(itemId => {
                                const masterItem = app.data.items.find(i => i.id === itemId);
                                if (masterItem) {
                                    const fullItem = JSON.parse(JSON.stringify(masterItem));
                                    if (fullItem.skillIds && Array.isArray(fullItem.skillIds) && app.data.skills) {
                                        fullItem.skills = fullItem.skillIds
                                            .map(sId => app.data.skills.find(s => s.id === sId))
                                            .filter(Boolean);
                                        delete fullItem.skillIds;
                                    }
                                    return fullItem;
                                }
                                return null;
                            })
                            .filter(Boolean);
                        delete char.itemIds;
                    }

                    if (char.familiarIds && Array.isArray(char.familiarIds) && app.data.familiars) {
                        char.familiars = char.familiarIds
                            .map(famId => {
                                const masterFam = app.data.familiars.find(f => f.id === famId);
                                if (masterFam) {
                                    const fullFam = JSON.parse(JSON.stringify(masterFam));
                                    if (fullFam.skillIds && Array.isArray(fullFam.skillIds) && app.data.skills) {
                                        fullFam.skills = fullFam.skillIds
                                            .map(sId => app.data.skills.find(s => s.id === sId))
                                            .filter(Boolean);
                                        delete fullFam.skillIds;
                                    }
                                    return fullFam;
                                }
                                return null;
                            })
                            .filter(Boolean);
                        delete char.familiarIds;
                    }
                });
            }
        }

        // 2. POPULATE MONSTER (Abaikan ID yang terhapus)
        for (let category in populatedMonsters) {
            if (Array.isArray(populatedMonsters[category])) {
                populatedMonsters[category].forEach(monster => {
                    if (monster.skillIds && Array.isArray(monster.skillIds) && app.data.skills) {
                        monster.skills = monster.skillIds
                            .map(sId => app.data.skills.find(s => s.id === sId))
                            .filter(Boolean);
                        delete monster.skillIds;
                    }
                    if (monster.itemIds && Array.isArray(monster.itemIds) && app.data.items) {
                        monster.items = monster.itemIds
                            .map(iId => app.data.items.find(i => i.id === iId))
                            .filter(Boolean);
                        delete monster.itemIds;
                    }
                    if (monster.familiarIds && Array.isArray(monster.familiarIds) && app.data.familiars) {
                        monster.familiars = monster.familiarIds
                            .map(fId => app.data.familiars.find(f => f.id === fId))
                            .filter(Boolean);
                        delete monster.familiarIds;
                    }
                });
            }
        }

        return {
            id: universe.id,
            name: universe.name,
            description: universe.description,
            lores: universe.lores || [],
            charactersCategoryDescriptions: universe.charactersCategoryDescriptions || {},
            characters: populatedCharacters,
            monstersCategoryDescriptions: universe.monstersCategoryDescriptions || {},
            monsters: populatedMonsters,
            locations: universe.locations || []
        };
    }
}