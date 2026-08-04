// Logika CRUD Familiar dan integrasi AI

export const PetForm = {

    // ==========================================
    // --- LOGIKA FORM & CRUD PET ---
    // ==========================================
    openAddFamiliar() {
        this.editFamiliarId = null;
        document.getElementById('familiarFormTitle').innerText = "Buat Familiar Baru";
        
        document.getElementById('newFamiliarName').value = '';
        document.getElementById('newFamiliarAge').value = ''; // FIX: Reset Umur
        
        // FIX: Reset Kelamin ke 'Tidak Berlaku'
        const genderDefault = document.querySelector('input[name="famGender"][value="none"]');
        if (genderDefault) genderDefault.checked = true;

        document.getElementById('newFamiliarApp').value = '';
        document.getElementById('newFamBackground').value = ''; 
                
        // Reset Search Input & Render Watak, Ras, Skill, Item
        const famWatakSearch = document.getElementById('famWatakSearch');
        if (famWatakSearch) famWatakSearch.value = '';
        this.renderFamWatakCheckboxes(true);

        const famRaceSearch = document.getElementById('famRaceSearch');
        if (famRaceSearch) famRaceSearch.value = '';
        this.renderFamRaceRadioButtons(true);

        document.querySelectorAll('.familiarTagCheck').forEach(cb => cb.checked = false);
        
        const famSkillSearch = document.getElementById('famSkillSearch');
        if (famSkillSearch) famSkillSearch.value = app.currentSkillFilter || '';
        this.renderFamSkillCheckboxes(true);

        const famItemSearch = document.getElementById('famItemSearch');
        if (famItemSearch) famItemSearch.value = app.currentItemFilter || '';
        this.renderFamItemCheckboxes(true);
        
        this.setPanelState('addFamiliarForm', true);
        document.getElementById('saveFamiliarBtn').innerText = "Simpan Familiar";
        
        document.getElementById('aiFamUniverse').value = '';
        document.getElementById('aiFamDeepLore').checked = false;
        
        document.getElementById('addFamiliarForm').scrollIntoView({ behavior: 'smooth' });
    },

    openEditFamiliar(id) {
        const fam = this.data.familiars.find(f => f.id === id);
        if(!fam) return;
        
        this.editFamiliarId = id;
        document.getElementById('familiarFormTitle').innerText = `Edit Familiar: ${fam.name}`;
        
        document.getElementById('newFamiliarName').value = fam.name;
        document.getElementById('newFamiliarAge').value = fam.age || ''; // FIX: Load Umur
        
        // FIX: Load Kelamin
        const genderValue = fam.gender || 'none';
        const genderRadio = document.querySelector(`input[name="famGender"][value="${genderValue}"]`);
        if (genderRadio) genderRadio.checked = true;

        document.getElementById('newFamiliarApp').value = fam.appearance || '';
        document.getElementById('newFamBackground').value = fam.description || ''; 

        // FIX: Render & Centang Watak
        const famWatakSearch = document.getElementById('famWatakSearch');
        if (famWatakSearch) famWatakSearch.value = '';
        this.renderFamWatakCheckboxes(true);

        // FIX: Render & Pilih Ras
        const famRaceSearch = document.getElementById('famRaceSearch');
        if (famRaceSearch) famRaceSearch.value = '';
        this.renderFamRaceRadioButtons(true);

        document.querySelectorAll('.familiarTagCheck').forEach(cb => {
            cb.checked = (fam.tagIds || []).includes(cb.value);
        });
        
        const famSkillSearch = document.getElementById('famSkillSearch');
        if (famSkillSearch) famSkillSearch.value = app.currentSkillFilter || '';
        this.renderFamSkillCheckboxes(true);

        const famItemSearch = document.getElementById('famItemSearch');
        if (famItemSearch) famItemSearch.value = app.currentItemFilter || '';
        this.renderFamItemCheckboxes(true);

        document.getElementById('aiFamUniverse').value = '';
        document.getElementById('aiFamDeepLore').checked = false;

        this.setPanelState('addFamiliarForm', true);
        document.getElementById('saveFamiliarBtn').innerText = "Update Familiar";
        
        document.getElementById('addFamiliarForm').scrollIntoView({ behavior: 'smooth' });
    },

    saveFamiliar() {
        const name = document.getElementById('newFamiliarName').value.trim(); 
        const age = document.getElementById('newFamiliarAge').value.trim(); // FIX: Ambil Umur
        
        // FIX: Ambil Kelamin
        const selectedGender = document.querySelector('input[name="famGender"]:checked');
        const gender = selectedGender ? selectedGender.value : 'none';

        // FIX: Ambil Ras (Radio)
        const selectedRace = document.querySelector('input[name="famRace"]:checked');
        const raceId = selectedRace ? selectedRace.value : null;

        const appearance = document.getElementById('newFamiliarApp').value.trim();
        const description = document.getElementById('newFamBackground').value.trim(); 
        
        if (!name) return this.showAlert("Nama familiar wajib diisi", "error");

        const personality = Array.from(document.querySelectorAll('.famWatakCheck:checked')).map(cb => cb.value);
        const tagIds = Array.from(document.querySelectorAll('.familiarTagCheck:checked')).map(cb => cb.value);
        const skillIds = Array.from(document.querySelectorAll('.famSkillCheck:checked')).map(cb => cb.value);
        const itemIds = Array.from(document.querySelectorAll('.famItemCheck:checked')).map(cb => cb.value); 

        if (this.editFamiliarId) {
            const fam = this.data.familiars.find(f => f.id === this.editFamiliarId);
            if (fam) {
                fam.name = name;
                fam.age = age; // FIX: Update Umur
                fam.gender = gender; // FIX: Update Kelamin
                fam.raceId = raceId; // FIX: Update Ras
                fam.personality = personality;
                fam.appearance = appearance;
                fam.description = description;
                fam.tagIds = tagIds;
                fam.skillIds = skillIds;
                fam.itemIds = itemIds; 
            }
            this.editFamiliarId = null;
            this.showAlert("Familiar berhasil diupdate", "success");
        } else {
            this.data.familiars.push({
                id: this.generateId('f'),
                name,
                age, // FIX: Simpan Umur
                gender, // FIX: Simpan Kelamin
                raceId, // FIX: Simpan Ras
                personality,
                appearance,
                description,
                dialogues: [],
                notes: [],
                relations: [], // FIX: Inisialisasi Catatan Relasi
                tagIds,
                skillIds,
                itemIds
            });
            this.showAlert("Familiar baru disimpan", "success");
        }

        this.closeFamiliarDetailFloating();
        this.setPanelState('addFamiliarForm', false);
        this.saveData(true);
        this.switchView('familiars'); 
    },
    
    deleteFamiliar(id) {
        const fam = this.data.familiars.find(f => f.id === id);
        if (!fam) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus familiar <b class="text-fuchsia-400">"${fam.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tindakan ini tidak dapat dibatalkan dan familiar akan dihapus secara permanen dari daftar.</p>
            </div>
        `;

        this.showCustomModal({
            title: "Hapus Familiar",
            content: content,
            confirmText: "Hapus Familiar",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.data.familiars = this.data.familiars.filter(f => f.id !== id);
                this.removeFamiliarId(id, this.data);
                
                this.closeFamiliarDetailFloating();
                this.setPanelState('addFamiliarForm', false);
                this.saveData();
                this.switchView('familiars');
                this.showAlert(`Familiar "${fam.name}" berhasil dihapus.`, "success");
                return true;
            }
        });
    },

    // --- LOGIKA ARRAY DIALOG PET SECARA CEPAT DARI CARD/FLOATING ---
    addFamiliarDialogue(famId) {
        const inputEl = document.getElementById(`newFamDlg_${famId}`);
        let text = inputEl ? inputEl.value.trim() : "";
        
        if (text) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (!fam.dialogues) fam.dialogues = [];
            
            // Otomatis bungkus dengan petik dua jika belum ada di awal & akhir
            if (!text.includes('"')) {
                text = `"${text}"`;
            }
            
            fam.dialogues.push(text);
            
            this.saveData(true);
            this.renderFamiliarGrid();
            
            // Refresh jendela floating detail jika sedang terbuka
            if(this.activeFamId === famId) {
                this.showFamiliarDetailFloating(famId);
            }
        }
    },

    deleteFamiliarDialogue(famId, dlgIndex) {
        if (confirm("Hapus contoh dialog ini?")) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (fam && fam.dialogues) {
                fam.dialogues.splice(dlgIndex, 1);
                this.saveData(true);
                this.renderFamiliarGrid();
                
                // Refresh jendela floating detail jika sedang terbuka
                if(this.activeFamId === famId) {
                    this.showFamiliarDetailFloating(famId);
                }
            }
        }
    },

    addFamiliarNote(famId) {
        const inputEl = document.getElementById(`newFamNote_${famId}`);
        let text = inputEl ? inputEl.value.trim() : "";
        
        if (text) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (!fam.notes) fam.notes = [];
            
            fam.notes.push(text);
            
            this.saveData(true);
            this.renderFamiliarGrid();
            
            // Refresh panel mengambang agar catatan baru langsung muncul
            if (this.activeFamId === famId) {
                this.showFamiliarDetailFloating(famId);
            }
        }
    },

    editFamiliarNote(famId, noteIndex) {
        const fam = this.data.familiars.find(f => f.id === famId);
        if (!fam || !fam.notes || fam.notes[noteIndex] === undefined) return;
        
        const currentNote = fam.notes[noteIndex];
        // Menggunakan dialog popup prompt agar edit hanya terjadi di lapisan panel dialog
        const newNote = prompt("Ubah catatan familiar:", currentNote);
        
        if (newNote !== null && newNote.trim() !== "") {
            fam.notes[noteIndex] = newNote.trim();
            
            this.saveData(true);
            this.renderFamiliarGrid();
            
            if (this.activeFamId === famId) {
                this.showFamiliarDetailFloating(famId);
            }
        }
    },

    deleteFamiliarNote(famId, noteIndex) {
        if (confirm("Hapus catatan ini?")) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (fam && fam.notes) {
                fam.notes.splice(noteIndex, 1);
                
                this.saveData(true);
                this.renderFamiliarGrid();
                
                if (this.activeFamId === famId) {
                    this.showFamiliarDetailFloating(famId);
                }
            }
        }
    },

    addFamiliarRelation(famId) {
        const inputEl = document.getElementById(`newFamRel_${famId}`);
        let text = inputEl ? inputEl.value.trim() : "";
        
        if (text) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (!fam.relations) fam.relations = [];
            
            fam.relations.push(text);
            
            this.saveData(true);
            this.renderFamiliarGrid();
            
            if (this.activeFamId === famId) {
                this.showFamiliarDetailFloating(famId);
            }
        }
    },

    deleteFamiliarRelation(famId, relIndex) {
        if (confirm("Hapus catatan relasi ini?")) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (fam && fam.relations) {
                fam.relations.splice(relIndex, 1);
                this.saveData(true);
                this.renderFamiliarGrid();
                
                if (this.activeFamId === famId) {
                    this.showFamiliarDetailFloating(famId);
                }
            }
        }
    },

     // ==========================================
    // --- BANTUAN FILTER FAMILIAR ---
    // ==========================================

    // --- SKILL FILTER ---
    onFamSkillSearchInput(event) {
        app.currentSkillFilter = event.target.value;
        this.renderFamSkillCheckboxes();
    },

    // --- SKILL FILTER ---
    renderFamSkillCheckboxes(isInitial = false) {
        const container = document.getElementById('famSkillList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? this.data.familiars.find(f => f.id === this.editFamiliarId) : null;
            allCheckedIds = activeFam ? (activeFam.skillIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.famSkillCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentSkillFilter || '').toLowerCase();
        const allSkills = this.data.skills || [];
        const skillMasterTags = this.data.skillTags || []; // Ambil master tag skill

        // Filter berdasarkan nama skill ATAU nama tag
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
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${s.id}" class="famSkillCheck form-checkbox rounded text-indigo-500 bg-slate-700 border-slate-600 focus:ring-indigo-500"
                ${allCheckedIds.includes(s.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${s.name}">${s.name}</span>
            </label>
        `).join('');
    },

    // --- ITEM FILTER ---
    onFamItemSearchInput(event) {
        app.currentItemFilter = event.target.value;
        this.renderFamItemCheckboxes();
    },

    // --- ITEM FILTER ---
    renderFamItemCheckboxes(isInitial = false) {
        const container = document.getElementById('famItemList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeFam = this.editFamiliarId ? this.data.familiars.find(f => f.id === this.editFamiliarId) : null;
            allCheckedIds = activeFam ? (activeFam.itemIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.famItemCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentItemFilter || '').toLowerCase();
        const allItems = this.data.items || [];
        const itemMasterTags = this.data.itemTags || []; // Ambil master tag item

        // Filter berdasarkan nama item ATAU nama tag
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
            const activeFam = this.editFamiliarId ? this.data.familiars.find(f => f.id === this.editFamiliarId) : null;
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
        const allWataks = this.data.watakList || [];

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
            const activeFam = this.editFamiliarId ? this.data.familiars.find(f => f.id === this.editFamiliarId) : null;
            selectedRaceId = activeFam ? activeFam.raceId : null;
        } else {
            const currentSelected = document.querySelector('input[name="famRace"]:checked');
            selectedRaceId = currentSelected ? currentSelected.value : null;
        }

        const filterQuery = (document.getElementById('famRaceSearch')?.value || '').toLowerCase();
        const allRaces = this.data.races || [];

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
    // --- INTEGRASI AI ENCHANTER KHUSUS PET ---
    // ==========================================
    async generateFamAI(targetField) {
        const nameInput = document.getElementById('newFamiliarName').value.trim();
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

        const draftText = targetEl.value.trim();

        // ----------------------------------------
        // Konstruksi Konteks Semesta (Volatile)
        // ----------------------------------------
        const univId = document.getElementById('aiFamUniverse').value;
        const useDeepLore = document.getElementById('aiFamDeepLore').checked;
        let universeContext = "Semesta tidak ditentukan secara spesifik (General Fantasy).";
        let improviseInstruction = "";

        if (univId) {
            const universe = app.data.universes.find(u => u.id === univId);
            if (universe) {
                universeContext = `Nama Latar/Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
                
                if (useDeepLore && universe.locations && universe.locations.length > 0) {
                    const locs = universe.locations.map(l => `${l.name} (${l.description || 'Tidak ada deskripsi'})`).join(', ');
                    universeContext += `\nDaftar Tempat/Lokasi di Semesta ini: ${locs}\n`;
                }

                improviseInstruction = `\nATURAN IMPROVISASI PENTING: Jika latar semesta atau tempat (misal: Perkantoran Cyberpunk) terasa tidak logis secara literal dengan nama/wujud familiar (misal: Kambing Purba), Anda diizinkan untuk BERIMPROVISASI CERDAS mengenai perannya (misal: kambing mutan, maskot digital, atau hal lain yang nyambung) KECUALI jika Draf Tambahan Pengguna di bawah sudah mengatur skenarionya secara spesifik. Utamakan draf pengguna jika ada.`;
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
        btnEl.disabled = true;
        btnEl.classList.add('opacity-50', 'cursor-wait');
        originalBtnText = btnEl.innerHTML;
        btnEl.innerHTML = "✨ Memproses...";

        try {
            const resultText = await app.requestEnchant(payload);
            
            // Pembersihan ekstra khusus dialog untuk menghilangkan angka dan membungkus petik dua
            if (targetField === 'dialogues') {
                const cleanedDialogues = resultText.split('\n')
                    .map(line => line.replace(/^[\d\.\-\*\"\' ]+/, '').trim()) // Menghapus nomor/bullet point di awal
                    .filter(line => line.length > 0)
                    .map(line => `"${line}"`) // Memastikan terbungkus tanda petik dua
                    .join('\n');
                targetEl.value = cleanedDialogues;
            } else {
                targetEl.value = resultText;
            }

            app.showAlert(`Berhasil men-generate AI untuk ${targetField}!`, "success");
        } catch (error) {
            alert("Gagal memanggil AI: " + error.message);
        } finally {
            btnEl.disabled = false;
            btnEl.classList.remove('opacity-50', 'cursor-wait');
            btnEl.innerHTML = originalBtnText;
        }
    }
}