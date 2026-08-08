// Logika bantuan export json - REVISED
export const BasicUniverseExportJson = {
    populateUniverse(universe) {
        const populatedCharacters = JSON.parse(JSON.stringify(universe.characters || {}));
        const populatedMonsters = JSON.parse(JSON.stringify(universe.monsters || {}));
        
        // Helper internal untuk populate entitas (Karakter / Pet / Monster)
        const populateEntityRelations = (entity) => {
            if (entity.skillIds && Array.isArray(entity.skillIds) && app.data.skills) {
                entity.skills = entity.skillIds
                    .map(sId => app.data.skills.find(s => s.id === sId))
                    .filter(Boolean);
                delete entity.skillIds;
            }
            if (entity.classIds && Array.isArray(entity.classIds) && app.data.classes) {
                entity.classes = entity.classIds
                    .map(cId => app.data.classes.find(c => c.id === cId))
                    .filter(Boolean);
                delete entity.classIds;
            }
            if (entity.titleIds && Array.isArray(entity.titleIds) && app.data.titles) {
                entity.titles = entity.titleIds
                    .map(tId => app.data.titles.find(t => t.id === tId))
                    .filter(Boolean);
                delete entity.titleIds;
            }
            if (entity.itemIds && Array.isArray(entity.itemIds) && app.data.items) {
                entity.items = entity.itemIds
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
                delete entity.itemIds;
            }
        };

        // 1. POPULATE KARAKTER & PET-NYA
        for (let category in populatedCharacters) {
            if (Array.isArray(populatedCharacters[category])) {
                populatedCharacters[category].forEach(char => {
                    populateEntityRelations(char);

                    // Populate Pet / Familiar milik Karakter (Termasuk Class & Title Pet)
                    if (char.familiarIds && Array.isArray(char.familiarIds) && app.data.familiars) {
                        char.familiars = char.familiarIds
                            .map(famId => {
                                const masterFam = app.data.familiars.find(f => f.id === famId);
                                if (masterFam) {
                                    const fullFam = JSON.parse(JSON.stringify(masterFam));
                                    populateEntityRelations(fullFam); // Populate Skill, Class, Title, & Item milik Pet
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

        // 2. POPULATE MONSTER
        for (let category in populatedMonsters) {
            if (Array.isArray(populatedMonsters[category])) {
                populatedMonsters[category].forEach(monster => {
                    populateEntityRelations(monster);
                    if (monster.familiarIds && Array.isArray(monster.familiarIds) && app.data.familiars) {
                        monster.familiars = monster.familiarIds
                            .map(fId => {
                                const masterFam = app.data.familiars.find(f => f.id === fId);
                                if (masterFam) {
                                    const fullFam = JSON.parse(JSON.stringify(masterFam));
                                    populateEntityRelations(fullFam);
                                    return fullFam;
                                }
                                return null;
                            })
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
};