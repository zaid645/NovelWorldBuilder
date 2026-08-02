// Editor monster yang berhubungan dengan modul luar: skill, item, familiar

export const UniverseMonsterFormOuter = {
    onMonsterSkillSearchInput(event, univId, category) {
        app.currentSkillFilter = event.target.value; 
        app.renderMonsterSkillCheckboxes(univId, category); 
    },

    // --- FUNGSI BANTUAN SKILL MONSTER ---
    renderMonsterSkillCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`monsterSkillList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeMonster = this.editMonsterId ? universe.monsters[category]?.find(m => m.id === this.editMonsterId) : null;
            allCheckedIds = activeMonster ? (activeMonster.skillIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.monsterSkillCheck_${safeCat}:checked`);
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentSkillFilter || '').toLowerCase();
        const allSkills = this.data.skills || [];
        const skillMasterTags = this.data.skillTags || [];

        // Filter berdasarkan nama skill ATAU nama tag
        const filteredSkills = allSkills.filter(s => {
            if (!filterQuery) return true;

            const matchName = (s.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (s.tagIds || []).some(tagId => {
                const tagObj = skillMasterTags.find(t => t.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });
            const matchDirectTag = (s.tags || []).some(t => (typeof t === 'string' ? t : t.name || '').toLowerCase().includes(filterQuery));

            return matchName || matchTag || matchDirectTag;
        });

        const skillMap = new Map();
        filteredSkills.forEach(s => skillMap.set(s.id, s));

        // Pertahankan skill yang tercentang agar tidak hilang saat di-filter
        allCheckedIds.forEach(id => {
            if (!skillMap.has(id)) {
                const originalSkill = allSkills.find(s => s.id === id);
                if (originalSkill) skillMap.set(originalSkill.id, originalSkill);
            }
        });

        const displaySkills = Array.from(skillMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displaySkills.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada skill yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displaySkills.map(s => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${s.id}" class="monsterSkillCheck_${safeCat} form-checkbox rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500" 
                ${allCheckedIds.includes(s.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${s.name}">${s.name}</span>
            </label>
        `).join('');
    },

    onMonsterItemSearchInput(event, univId, category) {
        app.currentItemFilter = event.target.value; 
        app.renderMonsterItemCheckboxes(univId, category);
    },

    // --- FUNGSI BANTUAN ITEM MONSTER ---
    renderMonsterItemCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`monsterItemList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeMonster = this.editMonsterId ? universe.monsters[category]?.find(m => m.id === this.editMonsterId) : null;
            allCheckedIds = activeMonster ? (activeMonster.itemIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.monsterItemCheck_${safeCat}:checked`);
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentItemFilter || '').toLowerCase();
        const allItems = this.data.items || [];
        const itemMasterTags = this.data.itemTags || [];

        // Filter berdasarkan nama item ATAU nama tag
        const filteredItems = allItems.filter(i => {
            if (!filterQuery) return true;

            const matchName = (i.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (i.tagIds || []).some(tagId => {
                const tagObj = itemMasterTags.find(t => t.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });
            const matchDirectTag = (i.tags || []).some(t => (typeof t === 'string' ? t : t.name || '').toLowerCase().includes(filterQuery));

            return matchName || matchTag || matchDirectTag;
        });

        const itemMap = new Map();
        filteredItems.forEach(i => itemMap.set(i.id, i));

        // Pertahankan item yang tercentang agar tidak hilang saat di-filter
        allCheckedIds.forEach(id => {
            if (!itemMap.has(id)) {
                const originalItem = allItems.find(i => i.id === id);
                if (originalItem) itemMap.set(originalItem.id, originalItem);
            }
        });

        const displayItems = Array.from(itemMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displayItems.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada item yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displayItems.map(i => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${i.id}" class="monsterItemCheck_${safeCat} form-checkbox rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" 
                ${allCheckedIds.includes(i.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${i.name}">${i.name}</span>
            </label>
        `).join('');
    },

    onMonsterFamiliarSearchInput(event, univId, category) {
        app.currentFamiliarFilter = event.target.value;
        app.renderMonsterFamiliarCheckboxes(univId, category);
    },

    // --- FUNGSI BANTUAN FAMILIAR / PET MONSTER ---
    renderMonsterFamiliarCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`monsterFamiliarList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeMonster = this.editMonsterId ? universe.monsters[category]?.find(m => m.id === this.editMonsterId) : null;
            allCheckedIds = activeMonster ? (activeMonster.familiarIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.monsterFamiliarCheck_${safeCat}:checked`);
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentFamiliarFilter || '').toLowerCase();
        const allFamiliars = this.data.familiars || [];
        const familiarMasterTags = this.data.familiarTags || this.data.petTags || [];

        // Filter berdasarkan nama familiar ATAU nama tag
        const filteredFamiliars = allFamiliars.filter(f => {
            if (!filterQuery) return true;

            const matchName = (f.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (f.tagIds || []).some(tagId => {
                const tagObj = familiarMasterTags.find(t => t.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });
            const matchDirectTag = (f.tags || []).some(t => (typeof t === 'string' ? t : t.name || '').toLowerCase().includes(filterQuery));

            return matchName || matchTag || matchDirectTag;
        });

        const familiarMap = new Map();
        filteredFamiliars.forEach(f => familiarMap.set(f.id, f));

        // Pertahankan familiar yang tercentang agar tidak hilang saat di-filter
        allCheckedIds.forEach(id => {
            if (!familiarMap.has(id)) {
                const originalFam = allFamiliars.find(f => f.id === id);
                if (originalFam) familiarMap.set(originalFam.id, originalFam);
            }
        });

        const displayFamiliars = Array.from(familiarMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displayFamiliars.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada familiar/pet yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displayFamiliars.map(f => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${f.id}" class="monsterFamiliarCheck_${safeCat} form-checkbox rounded text-fuchsia-500 bg-slate-800 border-slate-600 focus:ring-fuchsia-500" 
                ${allCheckedIds.includes(f.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${f.name}">${f.name}</span>
            </label>
        `).join('');
    }
}