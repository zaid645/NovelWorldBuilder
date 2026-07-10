/**
 * UniverseCharacterModule / CharacterBasicModule
 * Mengelola informasi dasar karakter (Nama, Watak, Rupa & Latar Belakang),
 * manajemen daftar kategorinya, keterkaitan Skill/Item/Familiar, 
 * serta fitur AI Enchanter untuk Generate Profil & Dialog.
 */
export const UniverseCharacterModule = {
    
    // =========================================
    // --- FUNGSI KATEGORI TOKOH ---
    // =========================================

    addCharacterCategory(univId) {
        const name = prompt("Nama Kategori Tokoh Baru (misal: 'Ksatria', 'Side Character'):");
        if (name && name.trim()) {
            const universe = this.data.universes.find(u => u.id === univId);
            if (!universe.characters[name]) {
                universe.characters[name] = [];
                this.saveData();
                this.switchView(univId);
            }
        }
    },

    moveCharacterCategoryUp(univId, categoryName) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;

        const keys = Object.keys(universe.characters);
        const index = keys.indexOf(categoryName);

        if (index > 0) {
            const temp = keys[index - 1];
            keys[index - 1] = keys[index];
            keys[index] = temp;

            const updatedCharacters = {};
            keys.forEach(key => {
                updatedCharacters[key] = universe.characters[key];
            });

            universe.characters = updatedCharacters;
            this.saveData(true); 
            this.switchView(univId);
        }
    },

    renameCharacterCategory(univId, oldCategoryName) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;

        const newCategoryName = prompt("Masukkan nama baru untuk kategori tokoh ini:", oldCategoryName);
        if (!newCategoryName || newCategoryName.trim() === "" || newCategoryName.trim() === oldCategoryName) return;

        const cleanNewName = newCategoryName.trim();
        if (universe.characters[cleanNewName]) {
            this.showAlert(`Kategori "${cleanNewName}" sudah ada!`, "error");
            return;
        }

        const updatedCharacters = {};
        for (let key in universe.characters) {
            if (key === oldCategoryName) {
                updatedCharacters[cleanNewName] = universe.characters[key];
            } else {
                updatedCharacters[key] = universe.characters[key];
            }
        }

        universe.characters = updatedCharacters;
        this.saveData();
        this.switchView(univId);
        this.showAlert(`Kategori diubah menjadi "${cleanNewName}".`, "success");
    },

    deleteCategory(univId, category) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;
        
        if (confirm(`Yakin ingin menghapus kategori tokoh "${category}"?\nPERINGATAN: Seluruh tokoh di dalam kategori ini akan ikut terhapus secara permanen!`)) {
            delete universe.characters[category];
            this.saveData();
            this.switchView(univId);
            this.showAlert(`Kategori "${category}" berhasil dihapus.`, "warning");
        }
    },

    // =========================================
    // --- FUNGSI DATA TOKOH (CRUD) ---
    // =========================================

    openAddCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        this.editCharId = null; 
        document.getElementById(`charFormTitle_${safeCat}`).innerText = `Buat Tokoh Baru di ${category}`;
        document.getElementById(`charFormBtn_${safeCat}`).innerText = "Simpan Tokoh";
        
        document.getElementById(`newName_${safeCat}`).value = '';
        document.getElementById(`newBg_${safeCat}`).value = '';
        document.getElementById(`newApp_${safeCat}`).value = '';

        const dlgInput = document.getElementById(`newDialogues_${safeCat}`);
        if(dlgInput) dlgInput.value = '';
        
        document.querySelectorAll(`.charWatakCheck_${safeCat}`).forEach(cb => cb.checked = false);
        document.querySelectorAll(`.skillCheck_${safeCat}`).forEach(cb => cb.checked = false);
        document.querySelectorAll(`.itemCheck_${safeCat}`).forEach(cb => cb.checked = false);
        document.querySelectorAll(`.familiarCheck_${safeCat}`).forEach(cb => cb.checked = false);

        this.setPanelState(`cat_${safeCat}`, true);
        this.setPanelState(`addChar_${safeCat}`, true);
    },

    openEditCharacter(univId, category, charId) {
        const safeCat = category.replace(/\s/g, '');
        const universe = this.data.universes.find(u => u.id === univId);
        const char = universe.characters[category].find(c => c.id === charId);
        if (!char) return;

        this.editCharId = charId;
        this.setPanelState(`cat_${safeCat}`, true);
        this.setPanelState(`addChar_${safeCat}`, true);

        document.getElementById(`charFormTitle_${safeCat}`).innerText = `Edit Tokoh di ${category}`;
        document.getElementById(`charFormBtn_${safeCat}`).innerText = "Update Tokoh";
        
        document.getElementById(`newName_${safeCat}`).value = char.name;
        document.getElementById(`newBg_${safeCat}`).value = char.background || '';
        document.getElementById(`newApp_${safeCat}`).value = char.appearance || '';

        const dlgInput = document.getElementById(`newDialogues_${safeCat}`);
        if(dlgInput) {
            dlgInput.value = (char.dialogues || []).join('\n');
        }
        
        // Migrasi & Centang Data Watak
        let watakArray = [];
        if (Array.isArray(char.personality)) {
            watakArray = char.personality;
        } else if (typeof char.personality === 'string' && char.personality.trim() !== '') {
            watakArray = char.personality.split(',').map(s => s.trim());
        }
        document.querySelectorAll(`.charWatakCheck_${safeCat}`).forEach(cb => {
            cb.checked = watakArray.includes(cb.value);
        });

        document.querySelectorAll(`.skillCheck_${safeCat}`).forEach(cb => cb.checked = char.skillIds.includes(cb.value));
        document.querySelectorAll(`.itemCheck_${safeCat}`).forEach(cb => cb.checked = (char.itemIds || []).includes(cb.value));
        document.querySelectorAll(`.familiarCheck_${safeCat}`).forEach(cb => cb.checked = (char.familiarIds || []).includes(cb.value));
    },

    addCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        const name = document.getElementById(`newName_${safeCat}`).value.trim();
        if (!name) return this.showAlert("Nama tokoh tidak boleh kosong", "error");

        const background = document.getElementById(`newBg_${safeCat}`).value.trim();
        const appearance = document.getElementById(`newApp_${safeCat}`).value.trim();

        let dialogues = [];
        const dlgInput = document.getElementById(`newDialogues_${safeCat}`);
        if (dlgInput) {
            dialogues = dlgInput.value.split('\n').map(d => d.trim()).filter(d => d !== '');
        }
        
        const personality = Array.from(document.querySelectorAll(`.charWatakCheck_${safeCat}:checked`)).map(cb => cb.value);
        const skillIds = Array.from(document.querySelectorAll(`.skillCheck_${safeCat}:checked`)).map(cb => cb.value);
        const itemIds = Array.from(document.querySelectorAll(`.itemCheck_${safeCat}:checked`)).map(cb => cb.value);
        const familiarIds = Array.from(document.querySelectorAll(`.familiarCheck_${safeCat}:checked`)).map(cb => cb.value);

        const universe = this.data.universes.find(u => u.id === univId);

        if (this.editCharId) {
            const char = universe.characters[category].find(c => c.id === this.editCharId);
            if (char) {
                char.name = name; 
                char.personality = personality; 
                char.background = background;
                char.appearance = appearance;
                char.dialogues = dialogues;
                char.skillIds = skillIds; 
                char.itemIds = itemIds;
                char.familiarIds = familiarIds; 
            }
            this.editCharId = null;
            this.showAlert("Tokoh berhasil diupdate", "success");
        } else {
            universe.characters[category].push({
                id: this.generateId('c'), 
                name, 
                personality, 
                background, 
                appearance, 
                skillIds, 
                itemIds, 
                familiarIds,
                dialogues
            });
            this.showAlert("Tokoh berhasil ditambahkan", "success");
        }
        
        this.setPanelState(`addChar_${safeCat}`, false);
        this.saveData();
        this.switchView(univId);
    },

    cancelEditCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        this.editCharId = null;
        
        const titleEl = document.getElementById(`charFormTitle_${safeCat}`);
        const btnEl = document.getElementById(`charFormBtn_${safeCat}`);
        if (titleEl) titleEl.innerText = `Buat Tokoh Baru di ${category}`;
        if (btnEl) btnEl.innerText = "Simpan Tokoh";
        
        this.setPanelState(`addChar_${safeCat}`, false);
    },

    deleteCharacter(univId, category, charId) {
        if(confirm("Yakin ingin menghapus tokoh ini?")) {
            const universe = this.data.universes.find(u => u.id === univId);
            universe.characters[category] = universe.characters[category].filter(c => c.id !== charId);
            this.saveData();
            this.switchView(univId);
            this.showAlert("Tokoh dihapus.", "info");
        }
    },

    // --- FUNGSI ARRAY DIALOG ---
    addDialogue(univId, category, charId) {
        const inputEl = document.getElementById(`newDlg_${charId}`);
        const text = inputEl.value.trim();
        
        if (text) {
            const universe = this.data.universes.find(u => u.id === univId);
            const char = universe.characters[category].find(c => c.id === charId);
            
            if (!char.dialogues) char.dialogues = [];
            char.dialogues.push(text);
            
            this.saveData(true); 
            this.switchView(univId); 
        }
    },

    deleteDialogue(univId, category, charId, dlgIndex) {
        if (confirm("Hapus contoh dialog ini?")) {
            const universe = this.data.universes.find(u => u.id === univId);
            const char = universe.characters[category].find(c => c.id === charId);
            
            if (char && char.dialogues) {
                char.dialogues.splice(dlgIndex, 1);
                this.saveData(true);
                this.switchView(univId);
            }
        }
    },

    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS TOKOH ---
    // ==========================================
    async generateCharAI(univId, safeCat, targetField) {
        const nameInput = document.getElementById(`newName_${safeCat}`).value.trim();
        const checkedWataks = Array.from(document.querySelectorAll(`.charWatakCheck_${safeCat}:checked`)).map(cb => cb.value);

        // Validasi Pre-requisite
        if (!nameInput) {
            return alert("GAGAL: 'Nama Tokoh' wajib diisi agar AI memiliki subjek yang jelas.");
        }
        
        if (targetField === 'dialogues' && checkedWataks.length === 0) {
            return alert("GAGAL: Untuk membuat variasi dialog, Anda wajib memilih minimal 1 Watak/Kepribadian karakter.");
        }

        // Ambil elemen target & setup status
        let targetEl, btnId, originalBtnText;
        let aiFocusRule = "";
        const aiLengthRule = "Hasilkan secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf). TANPA metafora, TANPA diksi puitis. Gunakan bahasa yang lugas dan to-the-point.";

        const currentApp = document.getElementById(`newApp_${safeCat}`).value.trim();
        const currentBg = document.getElementById(`newBg_${safeCat}`).value.trim();
        let crossContext = "";

        if (targetField === 'appearance') {
            targetEl = document.getElementById(`newApp_${safeCat}`);
            btnId = `btnAiApp_${safeCat}`;
            aiFocusRule = "Sebutkan wujud fisik karakter ini, mulai dari wajah, ras, bentuk tubuh, hingga pakaian dominan yang dikenakan secara faktual.";
            if (currentBg) crossContext = `\n[REFERENSI LATAR BELAKANG UNTUK PENYESUAIAN WUJUD/PAKAIAN]: ${currentBg}`;
        } else if (targetField === 'background') {
            targetEl = document.getElementById(`newBg_${safeCat}`);
            btnId = `btnAiBg_${safeCat}`;
            aiFocusRule = "Kembangkan latar belakang ringkas, masa lalu, atau motivasi tujuan karakter ini secara faktual.";
            if (currentApp) crossContext = `\n[REFERENSI PENAMPILAN UNTUK PENYESUAIAN CERITA/GELAR]: ${currentApp}`;
        } else if (targetField === 'dialogues') {
            targetEl = document.getElementById(`newDialogues_${safeCat}`);
            btnId = `btnAiDlg_${safeCat}`;
            aiFocusRule = `Buatkan 3 hingga 5 baris variasi kalimat kutipan dialog yang sangat mencerminkan sifatnya. Watak Karakter: ${checkedWataks.join(', ')}`;
            // Aturan spesifik agar pemisahan \n lancar
            crossContext = `\nOUTPUT WAJIB berupa kalimat langsung dipisah Enter. DILARANG memberikan angka (1, 2, 3), bullet point, atau deskripsi narator. Hanya tulisan dialog saja.`;
        }

        const draftText = targetEl.value.trim();

        // ----------------------------------------
        // Konstruksi Konteks Semesta
        // ----------------------------------------
        const universe = app.data.universes.find(u => u.id === univId);
        let universeContext = "Semesta tidak ditentukan.";
        if (universe) {
            universeContext = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        }

        // Payload untuk AI
        const payload = {
            moduleName: `Character-${targetField.toUpperCase()}`,
            targetData: {
                namaKarakter: nameInput,
                informasiSemesta: universeContext,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan)",
                drafReferensiPengguna: draftText || "(Kosong. Buat murni berdasarkan nama, watak, dan semesta.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, ringkas, lugas, dan teknis/deskriptif. Tidak berbunga-bunga.",
                length: targetField === 'dialogues' ? crossContext : aiLengthRule
            }
        };

        // UI Loading
        const btnEl = document.getElementById(btnId);
        if(btnEl) {
            btnEl.disabled = true;
            btnEl.classList.add('opacity-50', 'cursor-wait');
            originalBtnText = btnEl.innerHTML;
            btnEl.innerHTML = "✨ Memproses...";
        }

        try {
            const resultText = await app.requestEnchant(payload);
            
            if (targetField === 'dialogues') {
                const cleanedDialogues = resultText.split('\n')
                    .map(line => line.replace(/^[\d\.\-\*\"\' ]+/, '').trim()) 
                    .filter(line => line.length > 0)
                    .join('\n');
                targetEl.value = cleanedDialogues;
            } else {
                targetEl.value = resultText;
            }
            app.showAlert(`Berhasil men-generate AI untuk ${targetField}!`, "success");
        } catch (error) {
            alert("Gagal memanggil AI: " + error.message);
        } finally {
            if(btnEl) {
                btnEl.disabled = false;
                btnEl.classList.remove('opacity-50', 'cursor-wait');
                btnEl.innerHTML = originalBtnText;
            }
        }
    },


    // =========================================
    // --- RENDERING TAMPILAN KARAKTER ---
    // =========================================

    renderCharactersArea(universe) {
        const daftarWatak = app.watakData || [];

        let html = `
        <div class="mb-4 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mt-6">
            <div class="bg-slate-700/50 p-3 flex justify-between items-center cursor-pointer border-b border-slate-700" onclick="app.togglePanel('charsPanel_${universe.id}')">
                <h3 class="font-semibold text-indigo-400 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Daftar Kategori Tokoh <span class="ml-2 bg-slate-600 text-xs px-2 py-0.5 rounded-full text-white">${Object.keys(universe.characters).length} Kategori</span>
                </h3>
            </div>
            <div id="charsPanel_${universe.id}" class="p-3 space-y-4 ${this.getPanelClass('charsPanel_' + universe.id)}">
        `;

        for (let category in universe.characters) {
            const safeCat = category.replace(/\s/g, ''); 
            
            html += `
                <div class="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-sm">
                    <div class="bg-slate-800 p-3 flex justify-between items-center cursor-pointer" onclick="app.togglePanel('cat_${safeCat}')">
                        <h4 class="font-medium text-slate-200 flex items-center text-sm">
                            <svg class="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            ${category} <span class="ml-2 bg-slate-700 text-xs px-2 py-0.5 rounded-full">${universe.characters[category].length}</span>
                        </h4>
                        <div class="flex space-x-2">
                            <button onclick="event.stopPropagation(); app.deleteCategory('${universe.id}', '${category}')" class="text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900 px-2 py-1 rounded transition" title="Hapus Kategori">Hapus</button>
                            <button onclick="event.stopPropagation(); app.renameCharacterCategory('${universe.id}', '${category}')" class="text-xs bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-900 px-2 py-1 rounded transition" title="Ubah Nama Kategori">Edit</button>
                            <button onclick="event.stopPropagation(); app.openAddCharacter('${universe.id}', '${category}')" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition">+ Tokoh</button>
                            <button onclick="event.stopPropagation(); app.moveCharacterCategoryUp('${universe.id}', '${category}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded transition flex items-center" title="Naikkan Urutan"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button>
                        </div>
                    </div>

                    <div id="cat_${safeCat}" class="p-3 space-y-4 ${this.getPanelClass('cat_' + safeCat)}">                                
                        <div id="addChar_${safeCat}" class="${this.getPanelClass('addChar_' + safeCat)} bg-slate-800 border border-slate-600 p-4 rounded-lg mb-4">
                            <h4 id="charFormTitle_${safeCat}" class="text-sm font-bold text-indigo-400 mb-4 border-b border-slate-700 pb-2">Buat Tokoh Baru di ${category}</h4>
                            
                            <div class="mb-4">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Tokoh <span class="text-rose-400">*</span></label>
                                <input type="text" id="newName_${safeCat}" placeholder="Nama Tokoh" class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500">
                            </div>

                            <div class="mb-4">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                                    <span>Watak / Kepribadian</span>
                                    <span class="text-[10px] font-normal text-slate-500 normal-case">(Pilih min 1 untuk AI Dialog)</span>
                                </label>
                                <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-32 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    ${daftarWatak.length === 0 ? '<span class="text-xs text-slate-500 italic col-span-full">Belum ada watak di Master Watak.</span>' : ''}
                                    ${daftarWatak.map(w => `
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" value="${w}" class="charWatakCheck_${safeCat} form-checkbox rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-indigo-500">
                                            <span class="truncate text-slate-300 hover:text-white transition">${w}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between items-end mb-1">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latar Belakang</label>
                                    <button id="btnAiBg_${safeCat}" onclick="app.generateCharAI('${universe.id}', '${safeCat}', 'background')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1">✨ AI Generatif</button>
                                </div>
                                <textarea id="newBg_${safeCat}" placeholder="Ketik draf latar belakang..." class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500" rows="3"></textarea>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between items-end mb-1">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Penampilan</label>
                                    <button id="btnAiApp_${safeCat}" onclick="app.generateCharAI('${universe.id}', '${safeCat}', 'appearance')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1">✨ AI Generatif</button>
                                </div>
                                <textarea id="newApp_${safeCat}" placeholder="Ketik draf rupa/pakaian..." class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500" rows="3"></textarea>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between items-end mb-1">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contoh Dialog</label>
                                    <button id="btnAiDlg_${safeCat}" onclick="app.generateCharAI('${universe.id}', '${safeCat}', 'dialogues')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1">✨ AI Dialog</button>
                                </div>
                                <textarea id="newDialogues_${safeCat}" placeholder="Pisahkan tiap baris dialog dengan Enter..." class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500" rows="4"></textarea>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Skill Khusus:</label>
                                    <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-32 overflow-y-auto flex flex-col gap-1 text-xs">
                                        ${this.data.skills.map(s => `<label class="flex items-center space-x-2"><input type="checkbox" value="${s.id}" class="skillCheck_${safeCat} rounded text-indigo-500 bg-slate-800 border-slate-600"><span class="truncate text-slate-300 hover:text-white">${s.name}</span></label>`).join('')}
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Item Bawaan:</label>
                                    <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-32 overflow-y-auto flex flex-col gap-1 text-xs">
                                        ${this.data.items.map(i => `<label class="flex items-center space-x-2"><input type="checkbox" value="${i.id}" class="itemCheck_${safeCat} rounded text-cyan-500 bg-slate-800 border-slate-600"><span class="truncate text-slate-300 hover:text-white">${i.name}</span></label>`).join('')}
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Familiar / Pet:</label>
                                    <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-32 overflow-y-auto flex flex-col gap-1 text-xs">
                                        ${this.data.familiars.map(f => `<label class="flex items-center space-x-2"><input type="checkbox" value="${f.id}" class="familiarCheck_${safeCat} rounded text-fuchsia-500 bg-slate-800 border-slate-600"><span class="truncate text-slate-300 hover:text-white">${f.name}</span></label>`).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-700/60">
                                <button onclick="app.cancelEditCharacter('${universe.id}', '${category}')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition">Batal</button>
                                <button id="charFormBtn_${safeCat}" onclick="app.addCharacter('${universe.id}', '${category}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-sm shadow transition">Simpan Tokoh</button>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            ${universe.characters[category].length === 0 ? '<p class="text-sm text-slate-500 italic col-span-full text-center py-4 bg-slate-800/40 rounded border border-dashed border-slate-700">Belum ada tokoh.</p>' : ''}
                            ${universe.characters[category].map(c => this.renderCharacterCard(c, category)).join('')}
                        </div>
                    </div>
                </div>`;
        }

        html += `
                <button onclick="app.addCharacterCategory('${universe.id}')" class="w-full py-3 border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:text-indigo-400 rounded-lg text-slate-400 font-medium transition flex justify-center items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Tambah Kategori Baru
                </button>
            </div>
        </div>`;

        return html;
    },

    renderCharacterCard(char, category) {
        // Validasi Dinamis untuk Watak String Array (Cek terhadap Master Watak)
        const masterWatakList = app.watakData || [];
        let parsedWataks = [];
        
        if (Array.isArray(char.personality)) {
            parsedWataks = char.personality;
        } else if (typeof char.personality === 'string' && char.personality.trim() !== '') {
            parsedWataks = char.personality.split(',').map(s => s.trim());
        }

        const charWataks = parsedWataks.map(w => {
            const isValid = masterWatakList.some(master => master.toLowerCase() === w.toLowerCase());
            return isValid 
                ? `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700/50 font-medium">${w}</span>`
                : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 font-medium line-through" title="Watak dihapus dari Master">Invalid</span>`;
        }).join(' ');

        // Relasi Skill, Item, Familiar
        const charSkills = (char.skillIds || []).map(id => {
            const skill = this.data.skills.find(s => s.id === id);
            return skill ? `<span class="bg-indigo-900/50 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700 font-medium">${skill.name}</span>` 
                            : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 line-through">Skill ${id}</span>`;
        }).join(' ');
        
        const charItems = (char.itemIds || []).map(id => {
            const item = this.data.items.find(i => i.id === id);
            return item ? `<span class="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700 font-medium">${item.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 line-through">Item ${id}</span>`;
        }).join(' ');
        
        const charFamiliars = (char.familiarIds || []).map(id => {
            const fam = this.data.familiars.find(f => f.id === id);
            return fam ? `<span class="bg-fuchsia-900/50 text-fuchsia-300 text-[10px] px-2 py-0.5 rounded border border-fuchsia-700 font-medium">${fam.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 line-through">Familiar ${id}</span>`;
        }).join('');

        // Merender list contoh dialog
        const dialoguesHtml = (char.dialogues || []).map((dlg, index) => `
            <li class="flex justify-between items-start text-xs italic text-slate-300 border-l-2 border-indigo-500/50 pl-2 py-1 group/dlg bg-slate-800/30 rounded-r">
                <span class="flex-1 leading-relaxed">"${dlg}"</span>
                <button onclick="app.deleteDialogue('${this.currentView}', '${category}', '${char.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/dlg:opacity-100 ml-2 px-1 transition" title="Hapus dialog ini">
                    &times;
                </button>
            </li>
        `).join('');

        return `
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 relative group flex flex-col md:flex-row gap-6 hover:border-indigo-500/50 transition-colors shadow-md">
            
            <div class="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition bg-slate-900 pl-2 rounded">
                <button onclick="app.openEditCharacter('${this.currentView}', '${category}', '${char.id}')" class="text-slate-400 hover:text-amber-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Edit Tokoh">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="app.deleteCharacter('${this.currentView}', '${category}', '${char.id}')" class="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Tokoh">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>

            <div class="flex-1 space-y-3 pr-0 md:pr-14">
                <div class="border-b border-slate-700/50 pb-2 mb-2">
                    <h4 class="font-bold text-indigo-400 text-lg mb-1">${char.name}</h4>
                    <div class="flex flex-wrap gap-1">${charWataks || '<span class="text-[10px] text-slate-500 italic bg-slate-800 px-2 py-0.5 rounded">Belum ada Watak</span>'}</div>
                </div>
                
                <div class="grid grid-cols-1 gap-2">
                    <div class="text-[13px] text-slate-300"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Latar Belakang:</span> <span class="leading-relaxed whitespace-pre-wrap">${char.background || '-'}</span></div>
                    <div class="text-[13px] text-slate-300 pt-1.5"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Rupa / Penampilan:</span> <span class="leading-relaxed whitespace-pre-wrap">${char.appearance || '-'}</span></div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800/80">
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">Contoh Dialog / Kutipan:</span>
                    <ul class="space-y-1 mb-2 max-h-32 overflow-y-auto pr-1">
                        ${dialoguesHtml || '<li class="text-[11px] text-slate-500 italic">Belum ada dialog yang ditambahkan.</li>'}
                    </ul>
                    
                    <div class="flex items-center space-x-1.5 pt-1">
                        <input type="text" id="newDlg_${char.id}" placeholder="Ketik contoh kutipan dialog..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 transition" onkeydown="if(event.key === 'Enter') app.addDialogue('${this.currentView}', '${category}', '${char.id}')">
                        <button onclick="app.addDialogue('${this.currentView}', '${category}', '${char.id}')" class="bg-indigo-600/80 hover:bg-indigo-500 text-white px-2 py-1.5 rounded text-[10px] transition shadow-sm">+</button>
                    </div>
                </div>
            </div>

            <div class="w-full md:w-1/3 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div>
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Skill Dimiliki:</span>
                    <div class="flex flex-wrap gap-1">${charSkills || '<span class="text-[10px] text-slate-600 italic bg-slate-800 px-2 py-0.5 rounded">Kosong</span>'}</div>
                </div>
                <div class="pt-2 border-t border-slate-800/50">
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Item Bawaan:</span>
                    <div class="flex flex-wrap gap-1">${charItems || '<span class="text-[10px] text-slate-600 italic bg-slate-800 px-2 py-0.5 rounded">Kosong</span>'}</div>
                </div>
                <div class="pt-2 border-t border-slate-800/50">
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Familiar / Pet:</span>
                    <div class="flex flex-wrap gap-1">${charFamiliars || '<span class="text-[10px] text-slate-600 italic bg-slate-800 px-2 py-0.5 rounded">Kosong</span>'}</div>
                </div>
            </div>

        </div>
        `;
    }
}

// Alias agar kompatibel
export const CharacterBasicModule = UniverseCharacterModule;