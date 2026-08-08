// Logika CRUD Familiar, Manajemen State/Snapshot, dan Integrasi AI

export const PetForm = {

    // ==========================================
    // --- HELPER DUKUNGAN KODE & ID ---
    // ==========================================
    _getId(prefix) {
        if (typeof this.generateId === 'function') {
            return this.generateId(prefix);
        }
        if (typeof app !== 'undefined' && typeof app.generateId === 'function') {
            return app.generateId(prefix);
        }
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    },

    // ==========================================
    // --- LOGIKA FORM & CRUD PET ---
    // ==========================================
    openAddFamiliar() {
        this.editFamiliarId = null;
        const titleEl = document.getElementById('familiarFormTitle');
        if (titleEl) titleEl.innerText = "Buat Familiar Baru";
        
        // Reset Input Teks & Umur
        const nameEl = document.getElementById('newFamiliarName');
        if (nameEl) nameEl.value = '';
        
        const ageEl = document.getElementById('newFamiliarAge');
        if (ageEl) ageEl.value = '';
        
        // Reset Kelamin ke 'Tidak Berlaku' (none)
        const genderDefault = document.querySelector('input[name="famGender"][value="none"]');
        if (genderDefault) genderDefault.checked = true;

        const appEl = document.getElementById('newFamiliarApp');
        if (appEl) appEl.value = '';
        
        const bgEl = document.getElementById('newFamBackground');
        if (bgEl) bgEl.value = ''; 
                
        // Reset Search Input & Render Watak, Ras, Class, Title, Skill, Item
        const famWatakSearch = document.getElementById('famWatakSearch');
        if (famWatakSearch) famWatakSearch.value = '';
        this.renderFamWatakCheckboxes(true);

        const famRaceSearch = document.getElementById('famRaceSearch');
        if (famRaceSearch) famRaceSearch.value = '';
        this.renderFamRaceRadioButtons(true);

        const famClassSearch = document.getElementById('famClassSearch');
        if (famClassSearch) famClassSearch.value = (typeof app !== 'undefined' ? app.currentClassFilter : '') || '';
        this.renderFamClassCheckboxes(true);

        const famTitleSearch = document.getElementById('famTitleSearch');
        if (famTitleSearch) famTitleSearch.value = (typeof app !== 'undefined' ? app.currentTitleFilter : '') || '';
        this.renderFamTitleCheckboxes(true);

        document.querySelectorAll('.familiarTagCheck').forEach(cb => cb.checked = false);
        
        const famSkillSearch = document.getElementById('famSkillSearch');
        if (famSkillSearch) famSkillSearch.value = (typeof app !== 'undefined' ? app.currentSkillFilter : '') || '';
        this.renderFamSkillCheckboxes(true);

        const famItemSearch = document.getElementById('famItemSearch');
        if (famItemSearch) famItemSearch.value = (typeof app !== 'undefined' ? app.currentItemFilter : '') || '';
        this.renderFamItemCheckboxes(true);
        
        // Atur UI Panel
        if (typeof this.setPanelState === 'function') {
            this.setPanelState('addFamiliarForm', true);
        }
        
        const saveBtn = document.getElementById('saveFamiliarBtn');
        if (saveBtn) saveBtn.innerText = "Simpan Familiar";
        
        const aiUniv = document.getElementById('aiFamUniverse');
        if (aiUniv) aiUniv.value = '';
        
        const aiLore = document.getElementById('aiFamDeepLore');
        if (aiLore) aiLore.checked = false;
        
        const formEl = document.getElementById('addFamiliarForm');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    },

    openEditFamiliar(id) {
        const fam = (this.data?.familiars || []).find(f => f.id === id);
        if (!fam) return;
        
        this.editFamiliarId = id;
        const titleEl = document.getElementById('familiarFormTitle');
        if (titleEl) titleEl.innerText = `Edit Familiar: ${fam.name}`;
        
        const nameEl = document.getElementById('newFamiliarName');
        if (nameEl) nameEl.value = fam.name || '';
        
        const ageEl = document.getElementById('newFamiliarAge');
        if (ageEl) ageEl.value = fam.age || '';
        
        // Load Kelamin
        const genderValue = fam.gender || 'none';
        const genderRadio = document.querySelector(`input[name="famGender"][value="${genderValue}"]`);
        if (genderRadio) genderRadio.checked = true;

        const appEl = document.getElementById('newFamiliarApp');
        if (appEl) appEl.value = fam.appearance || '';
        
        const bgEl = document.getElementById('newFamBackground');
        if (bgEl) bgEl.value = fam.description || ''; 

        // Render & Centang Watak, Ras, Class, Title, Tag, Skill, Item
        const famWatakSearch = document.getElementById('famWatakSearch');
        if (famWatakSearch) famWatakSearch.value = '';
        this.renderFamWatakCheckboxes(true);

        const famRaceSearch = document.getElementById('famRaceSearch');
        if (famRaceSearch) famRaceSearch.value = '';
        this.renderFamRaceRadioButtons(true);

        const famClassSearch = document.getElementById('famClassSearch');
        if (famClassSearch) famClassSearch.value = (typeof app !== 'undefined' ? app.currentClassFilter : '') || '';
        this.renderFamClassCheckboxes(true);

        const famTitleSearch = document.getElementById('famTitleSearch');
        if (famTitleSearch) famTitleSearch.value = (typeof app !== 'undefined' ? app.currentTitleFilter : '') || '';
        this.renderFamTitleCheckboxes(true);

        document.querySelectorAll('.familiarTagCheck').forEach(cb => {
            cb.checked = (fam.tagIds || []).includes(cb.value);
        });
        
        const famSkillSearch = document.getElementById('famSkillSearch');
        if (famSkillSearch) famSkillSearch.value = (typeof app !== 'undefined' ? app.currentSkillFilter : '') || '';
        this.renderFamSkillCheckboxes(true);

        const famItemSearch = document.getElementById('famItemSearch');
        if (famItemSearch) famItemSearch.value = (typeof app !== 'undefined' ? app.currentItemFilter : '') || '';
        this.renderFamItemCheckboxes(true);

        const aiUniv = document.getElementById('aiFamUniverse');
        if (aiUniv) aiUniv.value = '';
        
        const aiLore = document.getElementById('aiFamDeepLore');
        if (aiLore) aiLore.checked = false;

        if (typeof this.setPanelState === 'function') {
            this.setPanelState('addFamiliarForm', true);
        }
        
        const saveBtn = document.getElementById('saveFamiliarBtn');
        if (saveBtn) saveBtn.innerText = "Update Familiar";
        
        const formEl = document.getElementById('addFamiliarForm');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    },

    saveFamiliar() {
        const nameInput = document.getElementById('newFamiliarName');
        const name = nameInput ? nameInput.value.trim() : '';
        
        if (!name) {
            if (typeof this.showAlert === 'function') {
                return this.showAlert("Nama familiar wajib diisi", "error");
            }
            return alert("Nama familiar wajib diisi");
        }

        const ageInput = document.getElementById('newFamiliarAge');
        const age = ageInput ? ageInput.value.trim() : '';

        const selectedGender = document.querySelector('input[name="famGender"]:checked');
        const gender = selectedGender ? selectedGender.value : 'none';

        const selectedRace = document.querySelector('input[name="famRace"]:checked');
        const raceId = selectedRace ? selectedRace.value : null;

        const appInput = document.getElementById('newFamiliarApp');
        const appearance = appInput ? appInput.value.trim() : '';

        const descInput = document.getElementById('newFamBackground');
        const description = descInput ? descInput.value.trim() : '';

        const personality = Array.from(document.querySelectorAll('.famWatakCheck:checked')).map(cb => cb.value);
        const tagIds = Array.from(document.querySelectorAll('.familiarTagCheck:checked')).map(cb => cb.value);
        const skillIds = Array.from(document.querySelectorAll('.famSkillCheck:checked')).map(cb => cb.value);
        const itemIds = Array.from(document.querySelectorAll('.famItemCheck:checked')).map(cb => cb.value); 
        const classIds = Array.from(document.querySelectorAll('.famClassCheck:checked')).map(cb => cb.value);
        const titleIds = Array.from(document.querySelectorAll('.famTitleCheck:checked')).map(cb => cb.value);

        const familiarData = {
            name, age, gender, raceId, personality, appearance, 
            description, tagIds, skillIds, itemIds, classIds, titleIds,
            dialogues: [],
            notes: [],
            relations: []
        };

        if (this.editFamiliarId) {
            // Mode EDIT: Update familiar yang ada
            const fam = (this.data?.familiars || []).find(f => f.id === this.editFamiliarId);
            if (fam) {
                // Perbarui properti root
                Object.assign(fam, { 
                    name, age, gender, raceId, personality, appearance, 
                    description, tagIds, skillIds, itemIds, classIds, titleIds 
                });
                
                // Perbarui snapshot pada state aktif jika ada
                if (fam.states && fam.activeStateId) {
                    const activeState = fam.states.find(s => s.id === fam.activeStateId);
                    if (activeState) {
                        activeState.snapshot = this.getCleanFamiliarSnapshot(fam); 
                    }
                }
            }
            this.editFamiliarId = null;
            if (typeof this.showAlert === 'function') this.showAlert("Familiar berhasil diupdate", "success");
        } else {
            // Mode TAMBAH BARU: Buat state awal dan simpan SATU KALI
            const defaultStateId = this._getId('fst');
            const initialSnapshot = structuredClone(familiarData);
            
            if (!this.data.familiars) this.data.familiars = [];
            
            this.data.familiars.push({
                id: this._getId('f'),
                ...familiarData,
                activeStateId: defaultStateId,
                states: [
                    {
                        id: defaultStateId,
                        name: "Awal Cerita (Default)",
                        createdAt: new Date().toISOString(),
                        snapshot: initialSnapshot
                    }
                ]
            });

            if (typeof this.showAlert === 'function') this.showAlert("Familiar baru disimpan", "success");
        }

        if (typeof this.closeFamiliarDetailFloating === 'function') this.closeFamiliarDetailFloating();
        if (typeof this.setPanelState === 'function') this.setPanelState('addFamiliarForm', false);
        if (typeof this.saveData === 'function') this.saveData(true);
        if (typeof this.switchView === 'function') this.switchView('familiars'); 
    },
    
    deleteFamiliar(id) {
        const fam = (this.data?.familiars || []).find(f => f.id === id);
        if (!fam) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus familiar <b class="text-fuchsia-400">"${fam.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tindakan ini tidak dapat dibatalkan dan familiar akan dihapus secara permanen dari daftar.</p>
            </div>
        `;

        if (typeof this.showCustomModal === 'function') {
            this.showCustomModal({
                title: "Hapus Familiar",
                content: content,
                confirmText: "Hapus Familiar",
                confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
                onConfirm: () => {
                    this.data.familiars = this.data.familiars.filter(f => f.id !== id);
                    if (typeof this.removeFamiliarId === 'function') {
                        this.removeFamiliarId(id, this.data);
                    }
                    
                    if (typeof this.closeFamiliarDetailFloating === 'function') this.closeFamiliarDetailFloating();
                    if (typeof this.setPanelState === 'function') this.setPanelState('addFamiliarForm', false);
                    if (typeof this.saveData === 'function') this.saveData();
                    if (typeof this.switchView === 'function') this.switchView('familiars');
                    if (typeof this.showAlert === 'function') this.showAlert(`Familiar "${fam.name}" berhasil dihapus.`, "success");
                    return true;
                }
            });
        }
    },

    // --- LOGIKA ARRAY DIALOG PET ---
    addFamiliarDialogue(famId) {
        const inputEl = document.getElementById(`newFamDlg_${famId}`);
        let text = inputEl ? inputEl.value.trim() : "";
        
        if (text) {
            const fam = (this.data?.familiars || []).find(f => f.id === famId);
            if (fam) {
                if (!fam.dialogues) fam.dialogues = [];
                if (!text.includes('"')) text = `"${text}"`;
                fam.dialogues.push(text);
                
                if (typeof this.saveData === 'function') this.saveData(true);
                if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
                
                if (this.activeFamId === famId && typeof this.showFamiliarDetailFloating === 'function') {
                    this.showFamiliarDetailFloating(famId, { 
                        preserveScroll: true, 
                        focusInputId: `newFamDlg_${famId}` 
                    });
                }
            }
        }
    },

    deleteFamiliarDialogue(famId, dlgIndex) {
        const fam = (this.data?.familiars || []).find(f => f.id === famId);
        if (!fam || !fam.dialogues || fam.dialogues[dlgIndex] === undefined) return;

        const dialogueText = fam.dialogues[dlgIndex];

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus contoh dialog <b class="text-fuchsia-400">${dialogueText}</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tindakan ini tidak dapat dibatalkan.</p>
            </div>
        `;

        if (typeof this.showCustomModal === 'function') {
            this.showCustomModal({
                title: "Hapus Dialog",
                content: content,
                confirmText: "Hapus Dialog",
                confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
                onConfirm: () => {
                    fam.dialogues.splice(dlgIndex, 1);
                    if (typeof this.saveData === 'function') this.saveData(true);
                    if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
                    
                    if (this.activeFamId === famId && typeof this.showFamiliarDetailFloating === 'function') {
                        this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                    }
                    if (typeof this.showAlert === 'function') this.showAlert("Dialog berhasil dihapus.", "success");
                    return true;
                }
            });
        }
    },

    addFamiliarNote(famId) {
        const inputEl = document.getElementById(`newFamNote_${famId}`);
        let text = inputEl ? inputEl.value.trim() : "";
        
        if (text) {
            const fam = (this.data?.familiars || []).find(f => f.id === famId);
            if (fam) {
                if (!fam.notes) fam.notes = [];
                fam.notes.push(text);
                
                if (typeof this.saveData === 'function') this.saveData(true);
                if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
                
                if (this.activeFamId === famId && typeof this.showFamiliarDetailFloating === 'function') {
                    this.showFamiliarDetailFloating(famId, { 
                        preserveScroll: true, 
                        focusInputId: `newFamNote_${famId}` 
                    });
                }
            }
        }
    },

    deleteFamiliarNote(famId, noteIndex) {
        const fam = (this.data?.familiars || []).find(f => f.id === famId);
        if (!fam || !fam.notes || fam.notes[noteIndex] === undefined) return;

        const noteText = fam.notes[noteIndex];

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus catatan <b class="text-fuchsia-400">"${noteText}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tindakan ini tidak dapat dibatalkan.</p>
            </div>
        `;

        if (typeof this.showCustomModal === 'function') {
            this.showCustomModal({
                title: "Hapus Catatan",
                content: content,
                confirmText: "Hapus Catatan",
                confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
                onConfirm: () => {
                    fam.notes.splice(noteIndex, 1);
                    if (typeof this.saveData === 'function') this.saveData(true);
                    if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
                    
                    if (this.activeFamId === famId && typeof this.showFamiliarDetailFloating === 'function') {
                        this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                    }
                    if (typeof this.showAlert === 'function') this.showAlert("Catatan berhasil dihapus.", "success");
                    return true;
                }
            });
        }
    },

    addFamiliarRelation(famId) {
        const inputEl = document.getElementById(`newFamRel_${famId}`);
        let text = inputEl ? inputEl.value.trim() : "";
        
        if (text) {
            const fam = (this.data?.familiars || []).find(f => f.id === famId);
            if (fam) {
                if (!fam.relations) fam.relations = [];
                fam.relations.push(text);
                
                if (typeof this.saveData === 'function') this.saveData(true);
                if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
                
                if (this.activeFamId === famId && typeof this.showFamiliarDetailFloating === 'function') {
                    this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                }
            }
        }
    },

    deleteFamiliarRelation(famId, relIndex) {
        const fam = (this.data?.familiars || []).find(f => f.id === famId);
        if (!fam || !fam.relations || fam.relations[relIndex] === undefined) return;

        const relText = fam.relations[relIndex];

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus catatan relasi <b class="text-fuchsia-400">"${relText}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tindakan ini tidak dapat dibatalkan.</p>
            </div>
        `;

        if (typeof this.showCustomModal === 'function') {
            this.showCustomModal({
                title: "Hapus Relasi",
                content: content,
                confirmText: "Hapus Relasi",
                confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
                onConfirm: () => {
                    fam.relations.splice(relIndex, 1);
                    if (typeof this.saveData === 'function') this.saveData(true);
                    if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
                    
                    if (this.activeFamId === famId && typeof this.showFamiliarDetailFloating === 'function') {
                        this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                    }
                    if (typeof this.showAlert === 'function') this.showAlert("Catatan relasi berhasil dihapus.", "success");
                    return true;
                }
            });
        }
    },

    // ==========================================
    // --- BANTUAN FILTER CLASS & TITLE ---
    // ==========================================
    onFamClassSearchInput(event) {
        if (typeof app !== 'undefined') app.currentClassFilter = event.target.value;
        this.renderFamClassCheckboxes();
    },

    renderFamClassCheckboxes(isInitial = false) {
        const container = document.getElementById('famClassList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? (this.data?.familiars || []).find(f => f.id === this.editFamiliarId) : null;
            allCheckedIds = activeFam ? (activeFam.classIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.famClassCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = ((typeof app !== 'undefined' ? app.currentClassFilter : '') || document.getElementById('famClassSearch')?.value || '').toLowerCase();
        const allClasses = this.data?.classes || [];
        const classMasterTags = this.data?.classTags || [];

        const filteredClasses = allClasses.filter(c => {
            if (!filterQuery) return true;
            const matchName = (c.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (c.tagIds || []).some(tagId => {
                const tagObj = classMasterTags.find(t => t.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });
            return matchName || matchTag;
        });

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
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada class yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displayClasses.map(c => `
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${c.id}" class="famClassCheck form-checkbox rounded text-emerald-500 bg-slate-700 border-slate-600 focus:ring-emerald-500"
                ${allCheckedIds.includes(c.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${c.name}">${c.name}</span>
            </label>
        `).join('');
    },

    onFamTitleSearchInput(event) {
        if (typeof app !== 'undefined') app.currentTitleFilter = event.target.value;
        this.renderFamTitleCheckboxes();
    },

    renderFamTitleCheckboxes(isInitial = false) {
        const container = document.getElementById('famTitleList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? (this.data?.familiars || []).find(f => f.id === this.editFamiliarId) : null;
            allCheckedIds = activeFam ? (activeFam.titleIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.famTitleCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = ((typeof app !== 'undefined' ? app.currentTitleFilter : '') || document.getElementById('famTitleSearch')?.value || '').toLowerCase();
        const allTitles = this.data?.titles || [];
        const titleMasterTags = this.data?.titleTags || [];

        const filteredTitles = allTitles.filter(t => {
            if (!filterQuery) return true;
            const matchName = (t.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (t.tagIds || []).some(tagId => {
                const tagObj = titleMasterTags.find(tg => tg.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });
            return matchName || matchTag;
        });

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
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada title yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displayTitles.map(t => `
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${t.id}" class="famTitleCheck form-checkbox rounded text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-500"
                ${allCheckedIds.includes(t.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${t.name}">${t.name}</span>
            </label>
        `).join('');
    },

    // --- SKILL FILTER ---
    onFamSkillSearchInput(event) {
        if (typeof app !== 'undefined') app.currentSkillFilter = event.target.value;
        this.renderFamSkillCheckboxes();
    },

    renderFamSkillCheckboxes(isInitial = false) {
        const container = document.getElementById('famSkillList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? (this.data?.familiars || []).find(f => f.id === this.editFamiliarId) : null;
            allCheckedIds = activeFam ? (activeFam.skillIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.famSkillCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = ((typeof app !== 'undefined' ? app.currentSkillFilter : '') || document.getElementById('famSkillSearch')?.value || '').toLowerCase();
        const allSkills = this.data?.skills || [];
        const skillMasterTags = this.data?.skillTags || [];

        const filteredSkills = allSkills.filter(s => {
            if (!filterQuery) return true;

            const matchName = (s.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (s.tagIds || []).some(tagId => {
                const tagObj = skillMasterTags.find(t => t.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });

            return matchName || matchTag;
        });

        const skillMap = new Map();
        filteredSkills.forEach(s => skillMap.set(s.id, s));

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
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${s.id}" class="famSkillCheck form-checkbox rounded text-indigo-500 bg-slate-700 border-slate-600 focus:ring-indigo-500"
                ${allCheckedIds.includes(s.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${s.name}">${s.name}</span>
            </label>
        `).join('');
    },

    // --- ITEM FILTER ---
    onFamItemSearchInput(event) {
        if (typeof app !== 'undefined') app.currentItemFilter = event.target.value;
        this.renderFamItemCheckboxes();
    },

    renderFamItemCheckboxes(isInitial = false) {
        const container = document.getElementById('famItemList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? (this.data?.familiars || []).find(f => f.id === this.editFamiliarId) : null;
            allCheckedIds = activeFam ? (activeFam.itemIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.famItemCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = ((typeof app !== 'undefined' ? app.currentItemFilter : '') || document.getElementById('famItemSearch')?.value || '').toLowerCase();
        const allItems = this.data?.items || [];
        const itemMasterTags = this.data?.itemTags || [];

        const filteredItems = allItems.filter(i => {
            if (!filterQuery) return true;

            const matchName = (i.name || '').toLowerCase().includes(filterQuery);
            const matchTag = (i.tagIds || []).some(tagId => {
                const tagObj = itemMasterTags.find(t => t.id === tagId);
                return tagObj && (tagObj.name || '').toLowerCase().includes(filterQuery);
            });

            return matchName || matchTag;
        });

        const itemMap = new Map();
        filteredItems.forEach(i => itemMap.set(i.id, i));

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
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${i.id}" class="famItemCheck form-checkbox rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500"
                ${allCheckedIds.includes(i.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${i.name}">${i.name}</span>
            </label>
        `).join('');
    },

    onFamWatakSearchInput(event) {
        this.renderFamWatakCheckboxes();
    },

    renderFamWatakCheckboxes(isInitial = false) {
        const container = document.getElementById('famWatakList');
        if (!container) return;

        let checkedWataks = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? (this.data?.familiars || []).find(f => f.id === this.editFamiliarId) : null;
            if (activeFam) {
                if (Array.isArray(activeFam.personality)) {
                    checkedWataks = activeFam.personality;
                } else if (typeof activeFam.personality === 'string' && activeFam.personality.trim() !== '') {
                    checkedWataks = activeFam.personality.split(',').map(s => s.trim());
                }
            }
        } else {
            const currentChecked = document.querySelectorAll('.famWatakCheck:checked');
            checkedWataks = Array.from(currentChecked).map(cb => cb.value);
        }

        const filterQuery = (document.getElementById('famWatakSearch')?.value || '').toLowerCase();
        const allWataks = this.data?.watakList || [];

        const filteredWataks = allWataks.filter(w => w.toLowerCase().includes(filterQuery));

        if (filteredWataks.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada watak ditemukan.</span>';
            return;
        }

        container.innerHTML = filteredWataks.map(w => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${w}" class="famWatakCheck form-checkbox rounded text-fuchsia-500 bg-slate-900 border-slate-600 focus:ring-fuchsia-500"
                ${checkedWataks.includes(w) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition">${w}</span>
            </label>
        `).join('');
    },

    // --- BANTUAN FILTER RAS ---
    onFamRaceSearchInput(event) {
        this.renderFamRaceRadioButtons();
    },

    renderFamRaceRadioButtons(isInitial = false) {
        const container = document.getElementById('famRaceList');
        if (!container) return;

        let selectedRaceId = null;

        if (isInitial) {
            const activeFam = this.editFamiliarId ? (this.data?.familiars || []).find(f => f.id === this.editFamiliarId) : null;
            selectedRaceId = activeFam ? activeFam.raceId : null;
        } else {
            const currentSelected = document.querySelector('input[name="famRace"]:checked');
            selectedRaceId = currentSelected ? currentSelected.value : null;
        }

        const filterQuery = (document.getElementById('famRaceSearch')?.value || '').toLowerCase();
        const allRaces = this.data?.races || [];

        const filteredRaces = allRaces.filter(r => (r.name || '').toLowerCase().includes(filterQuery));

        if (filteredRaces.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada ras ditemukan.</span>';
            return;
        }

        container.innerHTML = `
            <label class="flex items-center space-x-2 cursor-pointer border border-slate-800 p-1.5 rounded bg-slate-950/50">
                <input type="radio" name="famRace" value="" class="famRaceRadio form-radio text-amber-500 bg-slate-900 border-slate-600 focus:ring-amber-500"
                ${!selectedRaceId ? 'checked' : ''}>
                <span class="truncate text-slate-400 italic text-xs">Tanpa Ras</span>
            </label>
            ${filteredRaces.map(r => `
                <label class="flex items-center space-x-2 cursor-pointer border border-slate-800 p-1.5 rounded bg-slate-950/50">
                    <input type="radio" name="famRace" value="${r.id}" class="famRaceRadio form-radio text-amber-500 bg-slate-900 border-slate-600 focus:ring-amber-500"
                    ${selectedRaceId === r.id ? 'checked' : ''}>
                    <span class="truncate text-slate-300 hover:text-white transition text-xs">${r.name}</span>
                </label>
            `).join('')}
        `;
    },

    // ==========================================
    // --- STATE / SNAPSHOT MANAJEMEN ---
    // ==========================================
    getCleanFamiliarSnapshot(fam) {
        const { states, activeStateId, id, ...snapshotData } = fam;
        return structuredClone(snapshotData);
    },

    addFamiliarState(famId, stateName) {
        const fam = (this.data?.familiars || []).find(f => f.id === famId);
        if (!fam || !stateName.trim()) return;
        if (!fam.states) fam.states = [];

        // Auto-update snapshot aktif sebelum membuat state baru
        const currentState = fam.states.find(s => s.id === fam.activeStateId);
        if (currentState) currentState.snapshot = this.getCleanFamiliarSnapshot(fam);

        const newStatesId = this._getId('fst');
        const newSnapshot = this.getCleanFamiliarSnapshot(fam);

        fam.states.push({
            id: newStatesId,
            name: stateName.trim(),
            createdAt: new Date().toISOString(),
            snapshot: newSnapshot
        });

        fam.activeStateId = newStatesId;
        if (typeof this.saveData === 'function') this.saveData(true);
        if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
    },

    switchFamiliarState(famId, targetStateId) {
        const fam = (this.data?.familiars || []).find(f => f.id === famId);
        if (!fam || fam.activeStateId === targetStateId) return;

        // Simpan kondisi terkini ke snapshot lama
        const currentState = fam.states?.find(s => s.id === fam.activeStateId);
        if (currentState) currentState.snapshot = this.getCleanFamiliarSnapshot(fam);

        const targetState = fam.states?.find(s => s.id === targetStateId);
        if (!targetState) return;

        // Timpa data root familiar dengan data dari target snapshot
        Object.assign(fam, structuredClone(targetState.snapshot));
        fam.activeStateId = targetStateId;

        if (typeof this.saveData === 'function') this.saveData(true);
        if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid();
    },

    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS PET ---
    // ==========================================
    async generateFamAI(targetField) {
        const nameInput = document.getElementById('newFamiliarName')?.value.trim();
        const checkedWataks = Array.from(document.querySelectorAll('.famWatakCheck:checked')).map(cb => cb.value);

        // Validasi Pre-requisite
        if (!nameInput) {
            return alert("GAGAL: 'Nama Familiar' wajib diisi agar AI memiliki subjek yang jelas.");
        }
        if (checkedWataks.length === 0) {
            return alert("GAGAL: Anda harus memilih minimal 1 'Watak/Kepribadian' agar AI memahami sifat peliharaan ini.");
        }

        // Ambil elemen target & status tombol berdasarkan field
        let targetEl, btnEl, btnId, originalBtnText;
        let aiFocusRule = "";
        let aiLengthRule = "";

        if (targetField === 'appearance') {
            targetEl = document.getElementById('newFamiliarApp');
            btnId = 'btnAiApp';
            aiFocusRule = "Sebutkan wujud fisik, ciri khas, anatomi, dan warna dari familiar ini secara faktual.";
            aiLengthRule = "Hasilkan deskripsi secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf pendek). TANPA metafora, TANPA diksi puitis, dan TANPA majas. Gunakan bahasa yang to-the-point.";
        } else if (targetField === 'description') {
            targetEl = document.getElementById('newFamBackground');
            btnId = 'btnAiDesc';
            aiFocusRule = "Sebutkan latar belakang, asal-usul (origin), dan alasan mengapa ia menjadi peliharaan/partner secara lugas.";
            aiLengthRule = "Hasilkan deskripsi secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf pendek). TANPA metafora, TANPA diksi puitis, dan TANPA majas. Gunakan bahasa yang to-the-point.";
        } else if (targetField === 'dialogues') {
            targetEl = document.getElementById('newFamDialogues');
            btnId = 'btnAiDlg';
            aiFocusRule = "Buatkan 3 hingga 5 baris variasi kalimat dialog pendek (jika bisa bicara) ATAU contoh efek suara binatang/monster yang sesuai dengan sifatnya.";
            aiLengthRule = "OUTPUT WAJIB berupa baris-baris kalimat secara langsung (tiap dialog dipisahkan dengan Enter/Garis Baru). DILARANG KERAS memberikan nomor (1, 2, 3), bullet point, atau pengantar. Buat kalimat yang to-the-point dan faktual.";
        }

        if (!targetEl) return;
        const draftText = targetEl.value.trim();

        // Konstruksi Konteks Semesta (Volatile)
        const univId = document.getElementById('aiFamUniverse')?.value;
        const useDeepLore = document.getElementById('aiFamDeepLore')?.checked;
        let universeContext = "Semesta tidak ditentukan secara spesifik (General Fantasy).";
        let improviseInstruction = "";

        if (univId && typeof app !== 'undefined' && app.data?.universes) {
            const universe = app.data.universes.find(u => u.id === univId);
            if (universe) {
                universeContext = `Nama Latar/Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
                
                if (useDeepLore && universe.locations && universe.locations.length > 0) {
                    const locs = universe.locations.map(l => `${l.name} (${l.description || 'Tidak ada deskripsi'})`).join(', ');
                    universeContext += `\nDaftar Tempat/Lokasi di Semesta ini: ${locs}\n`;
                }

                improviseInstruction = `\nATURAN IMPROVISASI PENTING: Jika latar semesta atau tempat terasa tidak logis secara literal dengan wujud familiar, Anda diizinkan BERIMPROVISASI CERDAS KECUALI jika Draf Tambahan Pengguna sudah mengatur skenarionya secara spesifik. Utamakan draf pengguna jika ada.`;
            }
        }

        // Payload untuk AI
        const payload = {
            moduleName: `Familiar-${targetField.toUpperCase()}`,
            targetData: {
                namaFamiliar: nameInput,
                watakAtauSifat: checkedWataks.join(', '),
                informasiSemesta: universeContext,
                drafReferensiPengguna: draftText || "(Kosong. Buatkan ide cemerlang dari awal murni menggunakan Nama dan Watak yang ada.)"
            },
            additional_instruction: {
                focus: aiFocusRule + improviseInstruction,
                tone: "Faktual, ringkas, lugas, dan teknis/deskriptif. Tidak berbunga-bunga.",
                length: aiLengthRule
            }
        };

        // UI Loading
        btnEl = document.getElementById(btnId);
        if (btnEl) {
            btnEl.disabled = true;
            btnEl.classList.add('opacity-50', 'cursor-wait');
            originalBtnText = btnEl.innerHTML;
            btnEl.innerHTML = "✨ Memproses...";
        }

        try {
            if (typeof app !== 'undefined' && typeof app.requestEnchant === 'function') {
                const resultText = await app.requestEnchant(payload);
                
                if (targetField === 'dialogues') {
                    const cleanedDialogues = resultText.split('\n')
                        .map(line => line.replace(/^[\d\.\-\*\"\' ]+/, '').trim())
                        .filter(line => line.length > 0)
                        .map(line => `"${line}"`)
                        .join('\n');
                    targetEl.value = cleanedDialogues;
                } else {
                    targetEl.value = resultText;
                }

                if (typeof app.showAlert === 'function') app.showAlert(`Berhasil men-generate AI untuk ${targetField}!`, "success");
            } else {
                alert("Fungsi Enchanter AI (app.requestEnchant) tidak ditemukan.");
            }
        } catch (error) {
            alert("Gagal memanggil AI: " + error.message);
        } finally {
            if (btnEl) {
                btnEl.disabled = false;
                btnEl.classList.remove('opacity-50', 'cursor-wait');
                btnEl.innerHTML = originalBtnText;
            }
        }
    }
};