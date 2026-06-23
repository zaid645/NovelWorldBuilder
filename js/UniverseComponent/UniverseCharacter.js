/**
 * UniverseCharacterModule / CharacterBasicModule
 * Mengelola informasi dasar karakter (Nama, Watak, Rupa & Latar Belakang),
 * manajemen daftar kategorinya, keterkaitan Skill/Item/Familiar, 
 * serta tampilan satu baris penuh dengan fitur Contoh Dialog.
 */
export const UniverseCharacterModule = {
    
    // =========================================
    // --- FUNGSI KATEGORI TOKOH ---
    // (Tidak ada perubahan, tetap sama persis)
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
        document.getElementById(`newPersonality_${safeCat}`).value = '';
        document.getElementById(`newBg_${safeCat}`).value = '';
        document.getElementById(`newApp_${safeCat}`).value = '';

        const dlgInput = document.getElementById(`newDialogues_${safeCat}`);
        if(dlgInput) dlgInput.value = '';
        
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
        document.getElementById(`newPersonality_${safeCat}`).value = char.personality || '';
        document.getElementById(`newBg_${safeCat}`).value = char.background || '';
        document.getElementById(`newApp_${safeCat}`).value = char.appearance || '';

        const dlgInput = document.getElementById(`newDialogues_${safeCat}`);
        if(dlgInput) {
            dlgInput.value = (char.dialogues || []).join('\n');
        }
        
        document.querySelectorAll(`.skillCheck_${safeCat}`).forEach(cb => cb.checked = char.skillIds.includes(cb.value));
        document.querySelectorAll(`.itemCheck_${safeCat}`).forEach(cb => cb.checked = (char.itemIds || []).includes(cb.value));
        document.querySelectorAll(`.familiarCheck_${safeCat}`).forEach(cb => cb.checked = (char.familiarIds || []).includes(cb.value));
    },

    addCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        const name = document.getElementById(`newName_${safeCat}`).value.trim();
        if (!name) return this.showAlert("Nama tokoh tidak boleh kosong", "error");

        const personality = document.getElementById(`newPersonality_${safeCat}`).value.trim();
        const background = document.getElementById(`newBg_${safeCat}`).value.trim();
        const appearance = document.getElementById(`newApp_${safeCat}`).value.trim();

        let dialogues = [];
        const dlgInput = document.getElementById(`newDialogues_${safeCat}`);
        if (dlgInput) {
            dialogues = dlgInput.value.split('\n').map(d => d.trim()).filter(d => d !== '');
        }
        
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
                // PERHATIAN: Tidak menyentuh char.dialogues agar dialog yang sudah ada tidak hilang saat di-update
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
                dialogues  // Inisialisasi array kosong saat karakter baru dibuat
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
            
            this.saveData(true); // silent save
            this.switchView(univId); // refresh tampilan
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

    // =========================================
    // --- RENDERING TAMPILAN KARAKTER ---
    // =========================================

    renderCharactersArea(universe) {
        // ... (Kode pembungkus renderCharactersArea di sini tidak saya ubah isinya, 
        // hanya menyambung persis seperti kode asli Anda untuk memastikan konsistensi ID dan Class)
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
                <div class="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
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

                    <div id="cat_${safeCat}" class="p-3 space-y-3 ${this.getPanelClass('cat_' + safeCat)}">                                
                        <div id="addChar_${safeCat}" class="${this.getPanelClass('addChar_' + safeCat)} bg-slate-800 border border-slate-600 p-4 rounded-lg mb-4">
                            <h4 id="charFormTitle_${safeCat}" class="text-sm font-bold text-indigo-400 mb-3">Buat Tokoh Baru di ${category}</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <input type="text" id="newName_${safeCat}" placeholder="Nama Tokoh" class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full">
                                <input type="text" id="newPersonality_${safeCat}" placeholder="Watak" class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full">
                            </div>
                            <textarea id="newBg_${safeCat}" placeholder="Latar Belakang" class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full mb-3" rows="7"></textarea>
                            <textarea id="newApp_${safeCat}" placeholder="Penampilan" class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full mb-3" rows="7"></textarea>
                            <textarea id="newDialogues_${safeCat}" placeholder="Contoh Dialog (Pisahkan tiap dialog dengan Enter / Baris baru)" class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full mb-3" rows="4"></textarea>

                            <div class="mb-3">
                                <label class="text-xs text-slate-400 mb-1 block">Pilih Skill (Multi):</label>
                                <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-6 gap-2 text-sm">
                                    ${this.data.skills.map(s => `<label class="flex items-center space-x-2"><input type="checkbox" value="${s.id}" class="skillCheck_${safeCat} form-checkbox rounded text-indigo-500 bg-slate-700 border-slate-600"><span class="truncate">${s.name}</span></label>`).join('')}
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="text-xs text-slate-400 mb-1 block">Pilih Item (Multi):</label>
                                <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-6 gap-2 text-sm">
                                    ${this.data.items.map(i => `<label class="flex items-center space-x-2"><input type="checkbox" value="${i.id}" class="itemCheck_${safeCat} form-checkbox rounded text-cyan-500 bg-slate-700 border-slate-600"><span class="truncate">${i.name}</span></label>`).join('')}
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="text-xs text-slate-400 mb-1 block">Familiar / Pet:</label>
                                <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-6 gap-2 text-sm">
                                    ${this.data.familiars.map(f => `<label class="flex items-center space-x-2"><input type="checkbox" value="${f.id}" class="familiarCheck_${safeCat} form-checkbox rounded text-fuchsia-500 bg-slate-700 border-slate-600"><span class="truncate">${f.name}</span></label>`).join('')}
                                </div>
                            </div>

                            <div class="flex justify-end space-x-2 mt-4">
                                <button onclick="app.cancelEditCharacter('${universe.id}', '${category}')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">Batal</button>
                                <button id="charFormBtn_${safeCat}" onclick="app.addCharacter('${universe.id}', '${category}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm">Simpan Tokoh</button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4">
                            ${universe.characters[category].length === 0 ? '<p class="text-sm text-slate-500 italic col-span-full">Belum ada tokoh.</p>' : ''}
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

    // PERUBAHAN BESAR: Desain Row Full Width & Fitur Dialog
    renderCharacterCard(char, category) {
        const charSkills = (char.skillIds || []).map(id => {
            const skill = this.data.skills.find(s => s.id === id);
            return skill ? `<span class="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-0.5 rounded border border-indigo-700">${skill.name}</span>` 
                            : `<span class="bg-rose-900/50 text-rose-300 text-xs px-2 py-0.5 rounded border border-rose-700 line-through">Skill ${id}</span>`;
        }).join(' ');
        
        const charItems = (char.itemIds || []).map(id => {
            const item = this.data.items.find(i => i.id === id);
            return item ? `<span class="bg-cyan-900/50 text-cyan-300 text-xs px-2 py-0.5 rounded border border-cyan-700">${item.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-xs px-2 py-0.5 rounded border border-rose-700 line-through">Item ${id}</span>`;
        }).join(' ');
        
        const charFamiliars = (char.familiarIds || []).map(id => {
            const fam = this.data.familiars.find(f => f.id === id);
            return fam ? `<span class="bg-fuchsia-900/40 text-fuchsia-300 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-700/50">${fam.name}</span>` : '';
        }).join('');

        // Merender list contoh dialog
        const dialoguesHtml = (char.dialogues || []).map((dlg, index) => `
            <li class="flex justify-between items-start text-sm italic text-slate-300 border-l-2 border-indigo-500/50 pl-3 py-1 group/dlg bg-slate-800/30 rounded-r">
                <span class="flex-1">"${dlg}"</span>
                <button onclick="app.deleteDialogue('${this.currentView}', '${category}', '${char.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/dlg:opacity-100 ml-2 transition">
                    &times; Hapus
                </button>
            </li>
        `).join('');

        // Menerapkan flex-col untuk mobile, md:flex-row untuk desktop agar berbaris rapi
        return `
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 relative group flex flex-col md:flex-row gap-6 hover:border-slate-500 transition-colors">
            
            <div class="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition bg-slate-900 pl-2 rounded">
                <button onclick="app.openEditCharacter('${this.currentView}', '${category}', '${char.id}')" class="text-slate-500 hover:text-amber-400 p-1 bg-slate-800 rounded border border-slate-700" title="Edit Tokoh">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="app.deleteCharacter('${this.currentView}', '${category}', '${char.id}')" class="text-slate-500 hover:text-rose-500 p-1 bg-slate-800 rounded border border-slate-700" title="Hapus Tokoh">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>

            <div class="flex-1 space-y-3 pr-0 md:pr-14">
                <div>
                    <h4 class="font-bold text-indigo-400 text-lg mb-0.5">${char.name}</h4>
                    <p class="text-xs text-slate-400"><span class="font-semibold uppercase tracking-wider text-[10px]">Watak:</span> ${char.personality || '-'}</p>
                </div>
                
                <div class="grid grid-cols-1 gap-2">
                    <div class="text-sm text-slate-300"><span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Latar Belakang:</span> ${char.background || '-'}</div>
                    <div class="text-sm text-slate-300"><span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Rupa / Penampilan:</span> ${char.appearance || '-'}</div>
                </div>

                

                <div class="mt-4 pt-3 border-t border-slate-800/80">
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">Contoh Dialog / Kutipan:</span>
                    <ul class="space-y-1.5 mb-3">
                        ${dialoguesHtml || '<li class="text-xs text-slate-500 italic">Belum ada dialog yang ditambahkan.</li>'}
                    </ul>
                    
                    <div class="flex items-center space-x-2">
                        <input type="text" id="newDlg_${char.id}" placeholder="Ketik contoh kutipan dialog..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" onkeydown="if(event.key === 'Enter') app.addDialogue('${this.currentView}', '${category}', '${char.id}')">
                        <button onclick="app.addDialogue('${this.currentView}', '${category}', '${char.id}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs transition">Tambah</button>
                    </div>
                </div>
            </div>

            <div class="w-full md:w-1/3 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div>
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Skill Dimiliki:</span>
                    <div class="flex flex-wrap gap-1">${charSkills || '<span class="text-xs text-slate-600 italic">Tidak ada</span>'}</div>
                </div>
                <div>
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Item Bawaan:</span>
                    <div class="flex flex-wrap gap-1">${charItems || '<span class="text-xs text-slate-600 italic">Tidak ada</span>'}</div>
                </div>
                <div>
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Familiar / Pet:</span>
                    <div class="flex flex-wrap gap-1">${charFamiliars || '<span class="text-xs text-slate-600 italic">Tidak ada</span>'}</div>
                </div>
            </div>

        </div>
        `;
    }
}

// Alias agar kompatibel
export const CharacterBasicModule = UniverseCharacterModule;