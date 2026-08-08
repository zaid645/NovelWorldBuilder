// Logika yang berhubungan dengan modul di luar karakter: skill, item, dan pet

export const UniverseCharacterFormOuter = {

    // --- FUNGSI BANTUAN RAS (SPECIES) ---
    onCharRaceSearchInput(event, univId, category) {
        app.currentCharRaceFilter = event.target.value;
        app.renderCharRaceRadioButtons(univId, category);
    },

    renderCharRaceRadioButtons(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charRaceList_${safeCat}`);
        if (!container) return;

        let selectedRaceId = "";

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            selectedRaceId = activeChar ? (activeChar.raceId || "") : "";
        } else {
            const currentCheckedNode = document.querySelector(`input[name="charRaceRadio_${safeCat}"]:checked`);
            selectedRaceId = currentCheckedNode ? currentCheckedNode.value : "";
        }

        const filterQuery = (app.currentCharRaceFilter || '').toLowerCase();
        const allRaces = this.data.races || app.data.races || [];

        const filteredRaces = allRaces.filter(r => 
            !filterQuery || (r.name || '').toLowerCase().includes(filterQuery)
        ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (filteredRaces.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada ras yang ditemukan.</span>';
            return;
        }

        // Tambahkan opsi "Tanpa Ras" di posisi pertama
        let html = `
            <label class="flex items-center space-x-2 cursor-pointer bg-slate-800/50 p-1.5 rounded border border-slate-700/60 hover:border-slate-500 transition">
                <input type="radio" name="charRaceRadio_${safeCat}" value="" class="form-radio text-emerald-500 bg-slate-900 border-slate-600 focus:ring-emerald-500" ${!selectedRaceId ? 'checked' : ''}>
                <span class="truncate text-xs text-slate-400 italic">Tanpa Ras</span>
            </label>
        `;

        html += filteredRaces.map(r => `
            <label class="flex items-center space-x-2 cursor-pointer bg-slate-800/50 p-1.5 rounded border border-slate-700/60 hover:border-emerald-500/50 transition">
                <input type="radio" name="charRaceRadio_${safeCat}" value="${r.id}" class="form-radio text-emerald-500 bg-slate-900 border-slate-600 focus:ring-emerald-500" ${selectedRaceId === r.id ? 'checked' : ''}>
                <span class="truncate text-xs text-slate-200 hover:text-white transition font-medium" title="${r.name}">${r.name}</span>
            </label>
        `).join('');

        container.innerHTML = html;
    },

    // --- FUNGSI BANTUAN KELAS / CLASS ---
    onCharClassSearchInput(event, univId, category) {
        app.currentClassFilter = event.target.value;
        app.renderCharClassCheckboxes(univId, category);
    },

    renderCharClassCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charClassList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            allCheckedIds = activeChar ? (activeChar.classIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.classCheck_${safeCat}:checked`);
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentClassFilter || '').toLowerCase();
        const allClasses = this.data.classes || app.data.classes || [];

        const filteredClasses = allClasses.filter(c => 
            !filterQuery || (c.name || '').toLowerCase().includes(filterQuery)
        );

        const classMap = new Map();
        filteredClasses.forEach(c => classMap.set(c.id, c));

        allCheckedIds.forEach(id => {
            if (!classMap.has(id)) {
                const originalClass = allClasses.find(c => c.id === id);
                if (originalClass) classMap.set(originalClass.id, originalClass);
            }
        });

        const displayClasses = Array.from(classMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displayClasses.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada kelas yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displayClasses.map(c => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${c.id}" class="classCheck_${safeCat} form-checkbox rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500" 
                ${allCheckedIds.includes(c.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${c.name}">${c.name}</span>
            </label>
        `).join('');
    },

    // --- FUNGSI BANTUAN GELAR / TITLE ---
    onCharTitleSearchInput(event, univId, category) {
        app.currentTitleFilter = event.target.value;
        app.renderCharTitleCheckboxes(univId, category);
    },

    renderCharTitleCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charTitleList_${safeCat}`);
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            allCheckedIds = activeChar ? (activeChar.titleIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.titleCheck_${safeCat}:checked`);
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentTitleFilter || '').toLowerCase();
        const allTitles = this.data.titles || app.data.titles || [];

        const filteredTitles = allTitles.filter(t => 
            !filterQuery || (t.name || '').toLowerCase().includes(filterQuery)
        );

        const titleMap = new Map();
        filteredTitles.forEach(t => titleMap.set(t.id, t));

        allCheckedIds.forEach(id => {
            if (!titleMap.has(id)) {
                const originalTitle = allTitles.find(t => t.id === id);
                if (originalTitle) titleMap.set(originalTitle.id, originalTitle);
            }
        });

        const displayTitles = Array.from(titleMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displayTitles.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada gelar yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displayTitles.map(t => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${t.id}" class="titleCheck_${safeCat} form-checkbox rounded text-amber-500 bg-slate-800 border-slate-600 focus:ring-amber-500" 
                ${allCheckedIds.includes(t.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${t.name}">${t.name}</span>
            </label>
        `).join('');
    },

    // --- FUNGSI BANTUAN WATAK ---
    onCharWatakSearchInput(event, univId, category) {
        app.currentWatakFilter = event.target.value;
        app.renderCharWatakCheckboxes(univId, category);
    },

    renderCharWatakCheckboxes(univId, category, isInitial = false) {
        const safeCat = category.replace(/\s/g, '');
        const container = document.getElementById(`charWatakList_${safeCat}`);
        if (!container) return;

        let allCheckedWataks = [];

        if (isInitial) {
            const universe = this.data.universes.find(u => u.id === univId);
            const activeChar = this.editCharId ? universe.characters[category]?.find(c => c.id === this.editCharId) : null;
            if (activeChar) {
                if (Array.isArray(activeChar.personality)) {
                    allCheckedWataks = activeChar.personality;
                } else if (typeof activeChar.personality === 'string' && activeChar.personality.trim() !== '') {
                    allCheckedWataks = activeChar.personality.split(',').map(s => s.trim());
                }
            }
        } else {
            const currentCheckedNodes = document.querySelectorAll(`.charWatakCheck_${safeCat}:checked`);
            allCheckedWataks = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentWatakFilter || '').toLowerCase();
        const allWatak = this.data.watakList || app.data.watakList || [];

        const filteredWatak = allWatak.filter(w => 
            !filterQuery || w.toLowerCase().includes(filterQuery)
        );

        if (filteredWatak.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada watak yang ditemukan.</span>';
            return;
        }

        container.innerHTML = filteredWatak.map(w => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${w}" class="charWatakCheck_${safeCat} form-checkbox rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500" ${allCheckedWataks.includes(w) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition">${w}</span>
            </label>
        `).join('');
    },
    
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