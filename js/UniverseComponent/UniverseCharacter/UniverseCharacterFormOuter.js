// Logika yang berhubungan dengan modul di luar karakter: skill, item, dan pet

export const UniverseCharacterFormOuter = {
    onCharSkillSearchInput(event, univId, category) {
        app.currentSkillFilter = event.target.value; // Titipkan di MainScript
        app.renderCharSkillCheckboxes(univId, category); // Gambar ulang checkbox
    },

    renderCharSkillCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charSkillList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            allCheckedIds = activeChar ? (activeChar.skillIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.skillCheck_${safeCat}:checked`);
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
                <input type="checkbox" value="${s.id}" class="skillCheck_${safeCat} form-checkbox rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500" 
                ${allCheckedIds.includes(s.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${s.name}">${s.name}</span>
            </label>
        `).join('');
    },

    // --- FUNGSI BANTUAN ITEM ---
    onCharItemSearchInput(event, univId, category) {
        app.currentItemFilter = event.target.value; // Berbagi variabel dengan MainScript / ItemModule
        app.renderCharItemCheckboxes(univId, category);
    },

    renderCharItemCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charItemList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            allCheckedIds = activeChar ? (activeChar.itemIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.itemCheck_${safeCat}:checked`);
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
                <input type="checkbox" value="${i.id}" class="itemCheck_${safeCat} form-checkbox rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" 
                ${allCheckedIds.includes(i.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${i.name}">${i.name}</span>
            </label>
        `).join('');
    },

    // --- FUNGSI BANTUAN FAMILIAR / PET ---
    onCharFamiliarSearchInput(event, univId, category) {
        app.currentFamiliarFilter = event.target.value; // Berbagi variabel dengan MainScript / PetModule
        app.renderCharFamiliarCheckboxes(univId, category);
    },

    // --- FUNGSI BANTUAN FAMILIAR / PET ---
    renderCharFamiliarCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charFamiliarList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            allCheckedIds = activeChar ? (activeChar.familiarIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.familiarCheck_${safeCat}:checked`);
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
                <input type="checkbox" value="${f.id}" class="familiarCheck_${safeCat} form-checkbox rounded text-fuchsia-500 bg-slate-800 border-slate-600 focus:ring-fuchsia-500" 
                ${allCheckedIds.includes(f.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${f.name}">${f.name}</span>
            </label>
        `).join('');
    }
}