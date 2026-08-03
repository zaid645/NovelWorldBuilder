// Logika helper untuk unduh sebagai json

export const NovelBasicInfoExportJson = {

    // --- HELPER POPULATE CHARACTER DATA ---
    getDetailedCharacters() {
        const info = this.data.storyInfo;

        const populateSkills = (skillIds) => {
            if (!Array.isArray(skillIds)) return [];
            return skillIds.map(skillId => {
                const skillMatch = this.data.skills?.find(s => s.id === skillId);
                return skillMatch ? { ...skillMatch } : { id: skillId, note: "Skill tidak ditemukan di data master" };
            });
        };

        const populateItems = (itemIds) => {
            if (!Array.isArray(itemIds)) return [];
            return itemIds.map(itemId => {
                const itemMatch = this.data.items?.find(i => i.id === itemId);
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

        const populateFamiliars = (familiarIds) => {
            if (!Array.isArray(familiarIds)) return [];
            return familiarIds.map(famId => {
                const familiarMatch = this.data.familiars?.find(f => f.id === famId);
                if (familiarMatch) {
                    const detailedFamiliar = JSON.parse(JSON.stringify(familiarMatch));
                    
                    detailedFamiliar.personality = familiarMatch.personality || '';
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
                            const tag = this.data.familiarTags?.find(t => t.id === tagId);
                            return tag ? { ...tag } : { id: tagId, note: "Tag tidak ditemukan di data master" };
                        });
                        delete detailedFamiliar.tagIds;
                    }
                    
                    return detailedFamiliar;
                }
                return { id: famId, note: "Familiar tidak ditemukan di data master" };
            });
        };

        return (info.mainCharacters || []).map(charId => {
            let foundChar = null;
            
            for (let univ of (this.data.universes || [])) {
                for (let category in univ.characters) {
                    const match = univ.characters[category].find(c => c.id === charId);
                    if (match) {
                        const charCopy = JSON.parse(JSON.stringify(match));

                        foundChar = { 
                            id: charCopy.id,
                            name: charCopy.name,
                            personality: charCopy.personality || '',
                            background: charCopy.background || '',
                            appearance: charCopy.appearance || '',
                            notes: charCopy.notes || [],
                            dialogues: charCopy.dialogues || [],
                            category: category, 
                            universeName: univ.name,
                            skills: populateSkills(charCopy.skillIds),
                            items: populateItems(charCopy.itemIds),
                            familiars: populateFamiliars(charCopy.familiarIds)
                        };

                        break;
                    }
                }
                if (foundChar) break;
            }
            return foundChar || { id: charId, note: "Karakter telah dihapus dari semesta" };
        });
    },
}