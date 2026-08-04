// Logika helper untuk unduh sebagai JSON (Versi Lengkap & Terpadu)

export const NovelBasicInfoExportJson = {

    // --- HELPER POPULATE CHARACTER DATA ---
    getDetailedCharacters() {
        // Mendukung konteks 'this.data' maupun 'app.data'
        const appData = app.data || this.data || {};
        const info = appData.storyInfo || {};
        const mainCharIds = info.mainCharacters || info.mainCharacterIds || [];

        // 1. Helper Populate Skill (Deep Populate)
        const populateSkills = (skillIds) => {
            if (!Array.isArray(skillIds)) return [];
            return skillIds.map(skillId => {
                const skillMatch = appData.skills?.find(s => s.id === skillId);
                return skillMatch ? JSON.parse(JSON.stringify(skillMatch)) : { id: skillId, note: "Skill tidak ditemukan di data master" };
            });
        };

        // 2. Helper Populate Item (+ Skill di dalam Item)
        const populateItems = (itemIds) => {
            if (!Array.isArray(itemIds)) return [];
            return itemIds.map(itemId => {
                const itemMatch = appData.items?.find(i => i.id === itemId);
                if (itemMatch) {
                    const fullItem = JSON.parse(JSON.stringify(itemMatch));
                    if (fullItem.skillIds && Array.isArray(fullItem.skillIds)) {
                        fullItem.skills = populateSkills(fullItem.skillIds);
                        delete fullItem.skillIds;
                    }
                    return fullItem;
                }
                return { id: itemId, note: "Item tidak ditemukan di data master" };
            });
        };

        // 3. Helper Populate Familiar (+ Skill, Item, dan Tag di dalamnya)
        const populateFamiliars = (familiarIds) => {
            if (!Array.isArray(familiarIds)) return [];
            return familiarIds.map(famId => {
                const familiarMatch = appData.familiars?.find(f => f.id === famId);
                if (familiarMatch) {
                    const detailedFamiliar = JSON.parse(JSON.stringify(familiarMatch));
                    
                    detailedFamiliar.personality = familiarMatch.personality || familiarMatch.watak || '';
                    detailedFamiliar.dialogues = familiarMatch.dialogues || [];
                    
                    if (detailedFamiliar.skillIds) {
                        detailedFamiliar.skills = populateSkills(detailedFamiliar.skillIds);
                        delete detailedFamiliar.skillIds;
                    }
                    
                    if (detailedFamiliar.itemIds) {
                        detailedFamiliar.items = populateItems(detailedFamiliar.itemIds);
                        delete detailedFamiliar.itemIds;
                    }

                    if (detailedFamiliar.tagIds) {
                        detailedFamiliar.tags = (detailedFamiliar.tagIds || []).map(tagId => {
                            const tag = appData.familiarTags?.find(t => t.id === tagId);
                            return tag ? JSON.parse(JSON.stringify(tag)) : { id: tagId, note: "Tag tidak ditemukan di data master" };
                        });
                        delete detailedFamiliar.tagIds;
                    }
                    
                    return detailedFamiliar;
                }
                return { id: famId, note: "Familiar tidak ditemukan di data master" };
            });
        };

        // 4. Helper Enrich Data Ras
        const resolveRace = (char) => {
            if (typeof char.race === 'object' && char.race !== null) {
                return char.race;
            }
            const raceId = char.raceId || char.race;
            if (raceId) {
                const raceMatch = (appData.races || []).find(r => r.id === raceId || r.name === raceId);
                if (raceMatch) return JSON.parse(JSON.stringify(raceMatch));
            }
            return char.race || char.raceName || '';
        };

        // Jika mainCharIds kosong, ambil seluruh karakter dari master atau semesta
        const targetIds = Array.isArray(mainCharIds) && mainCharIds.length > 0 ? mainCharIds : null;

        // Pencarian & Pemetaan Karakter
        let characterList = [];

        // Opsi A: Cari di appData.characters jika ada
        if (appData.characters && Array.isArray(appData.characters)) {
            characterList = appData.characters;
        } 
        // Opsi B: Cari di dalam struktur appData.universes
        else if (appData.universes && Array.isArray(appData.universes)) {
            for (let univ of appData.universes) {
                if (!univ.characters) continue;
                for (let category in univ.characters) {
                    univ.characters[category].forEach(c => {
                        characterList.push({
                            ...c,
                            category: c.category || category,
                            universeName: univ.name
                        });
                    });
                }
            }
        }

        // Filter berdasarkan mainCharacters jika ID ditentukan
        const filteredList = targetIds 
            ? targetIds.map(charId => {
                const match = characterList.find(c => c.id === charId);
                return match ? match : { id: charId, note: "Karakter tidak ditemukan di data master / semesta" };
            })
            : characterList;

        return filteredList.map(char => {
            if (char.note) return char; // Skip jika karakter rusak / terhapus

            const charCopy = JSON.parse(JSON.stringify(char));

            return {
                ...charCopy, // << SPREAD OPERATOR: Menjamin SEMUA atribut bawaan (penampilan, motivasi, relasi, dll) tidak hilang

                // Normalisasi dan kelengkapan atribut utama
                universeName: charCopy.universeName || '',
                
                // Ras, Gender, Umur, dan Watak
                race: resolveRace(charCopy),
                gender: charCopy.gender || charCopy.jenisKelamin || '',
                age: charCopy.age || charCopy.usia || charCopy.umur || '',
                personality: charCopy.personality || charCopy.watak || charCopy.sifat || '',

                // Relasi bertingkat yang di-populate
                skills: populateSkills(charCopy.skillIds || charCopy.skills),
                items: populateItems(charCopy.itemIds || charCopy.items),
                familiars: populateFamiliars(charCopy.familiarIds || charCopy.familiars)
            };
        });
    }
};