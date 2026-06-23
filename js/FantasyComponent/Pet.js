/**
 * PetModule
 * Mengurus semua logika tampilan dan manipulasi data untuk Pet dan Tag-nya.
 * Termasuk penambahan data Watak dan Contoh Dialog.
 */
export const PetModule = {

    // ==========================================
    // --- RENDER VIEW UTAMA (PETS & TAGS) ---
    // ==========================================
    renderFamiliarsView() {
                return `
                    <div class="flex flex-col gap-6">
                        
                        <div>
                            <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                <div class="bg-slate-700/50 p-3 flex justify-between items-center">
                                    <h3 class="font-semibold text-slate-200">Daftar Tag Familiar <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.familiarTags.length}</span></h3>
                                </div>
                                <div id="familiarTagsPanel" class="p-4 space-y-4">
                                    <div class="flex space-x-2 max-w-md">
                                        <input type="text" id="newFamiliarTagName" placeholder="Nama Tag Familiar Baru" class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-fuchsia-500 outline-none">
                                        <button onclick="app.addFamiliarTag()" class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 rounded font-bold">+</button>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button onclick="app.autoloadFamiliarTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600">
                                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                            Autoload Tag dari Familiar
                                        </button>
                                        <button onclick="app.cleanInvalidFamiliarTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600">
                                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            Bersihkan Tag Invalid
                                        </button>
                                        <button onclick="app.exportFamiliarsOnly()" class="bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-xs py-2 px-3 rounded flex justify-center items-center font-medium shadow">
                                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Export Data Familiar (.json)
                                        </button>
                                    </div>
                                    <div class="flex flex-wrap gap-2 pt-2">
                                        ${this.data.familiarTags.length === 0 ? '<p class="text-xs text-slate-500 w-full text-center py-2">Belum ada tag familiar.</p>' : ''}
                                        ${this.data.familiarTags.map(t => `
                                            <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center group">
                                                ${t.name}
                                                <button onclick="app.editFamiliarTag('${t.id}')" class="ml-2 text-slate-400 hover:text-amber-400 hidden group-hover:block" title="Edit Tag">
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </button>
                                                <button onclick="app.deleteFamiliarTag('${t.id}')" class="ml-1 text-slate-500 hover:text-rose-400 hidden group-hover:block" title="Hapus Tag">&times;</button>
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                <div class="bg-slate-700/50 p-3 flex justify-between">
                                    <h3 class="font-semibold text-slate-200">Daftar Familiar <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.familiars.length}</span></h3>
                                    <button onclick="event.stopPropagation(); app.openAddFamiliar()" class="text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-1 rounded transition">
                                        + Tambah Familiar
                                    </button>
                                </div>
                                <div id="familiarsPanel" class="p-4">
                                    <div class="mb-4">
                                        <input type="text" id="searchFamiliarInput" placeholder="Cari nama familiar atau tag..." class="bg-slate-900 border border-slate-700 rounded p-2 pl-3 text-sm w-full focus:border-fuchsia-500 focus:outline-none" oninput="app.renderFamiliarGrid()">
                                    </div>
                                    
                                    <div id="addFamiliarForm" class="hidden bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                        <button onclick="app.togglePanel('addFamiliarForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300">&times;</button>
                                        <h4 id="familiarFormTitle" class="text-sm font-bold text-fuchsia-400 mb-3">Buat Familiar Baru</h4>
                                        
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                            <input type="text" id="newFamiliarName" placeholder="Nama Familiar" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-fuchsia-500">
                                            <input type="text" id="newFamPersonality" placeholder="Watak Peliharaan" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-fuchsia-500">
                                        </div>

                                        <div class="mb-3">
                                            <label class="text-xs text-slate-400 mb-1 block">Pilih Tag Familiar:</label>
                                            <div class="bg-slate-800 border border-slate-600 rounded p-2 max-h-24 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                                ${this.data.familiarTags.map(t => `<label class="flex items-center space-x-2"><input type="checkbox" value="${t.id}" class="familiarTagCheck form-checkbox rounded text-fuchsia-500 bg-slate-700 border-slate-600"><span class="truncate">${t.name}</span></label>`).join('')}
                                            </div>
                                        </div>
                                        
                                        <textarea id="newFamiliarApp" placeholder="Wujud Fisik / Penampilan Peliharaan" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-fuchsia-500" rows="5"></textarea>
                                        <textarea id="newFamBackground" placeholder="Latar belakang familiar ini..." class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-fuchsia-500" rows="5"></textarea>
                                        
                                        <textarea id="newFamDialogues" placeholder="Contoh Dialog / Suara Hewan (Pisahkan tiap dialog dengan Enter / Baris baru)" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-fuchsia-500" rows="4"></textarea>
                                        
                                        <div class="mb-3">
                                            <label class="text-xs text-slate-400 mb-1 block">Pilih Skill (Multi):</label>
                                            <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-72 overflow-y-auto grid grid-cols-6 gap-2 text-sm">
                                                ${this.data.skills.map(s => `
                                                    <label class="flex items-center space-x-2">
                                                        <input type="checkbox" value="${s.id}" class="famSkillCheck form-checkbox rounded text-indigo-500 bg-slate-700 border-slate-600">
                                                        <span class="truncate">${s.name}</span>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="text-xs text-slate-400 mb-1 block">Pilih Item (Multi):</label>
                                            <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-72 overflow-y-auto grid grid-cols-6 gap-2 text-sm">
                                                ${this.data.items.map(i => `
                                                    <label class="flex items-center space-x-2">
                                                        <input type="checkbox" value="${i.id}" class="famItemCheck form-checkbox rounded text-cyan-500 bg-slate-700 border-slate-600">
                                                        <span class="truncate">${i.name}</span>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="flex justify-end space-x-2 mt-4">
                                            <button onclick="app.setPanelState('addFamiliarForm', false); app.editFamiliarId = null;" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">Batal</button>
                                            <button id="saveFamiliarBtn" onclick="app.saveFamiliar()" class="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-sm shadow">Simpan Familiar</button>
                                        </div>
                                    </div>

                                    <div id="familiarGridContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-start"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },

    // ==========================================
    // --- LOGIKA TAG PET ---
    // ==========================================
    addFamiliarTag() {
        const name = document.getElementById('newFamiliarTagName').value.trim();
        if (name) {
            this.data.familiarTags.push({ id: this.generateId('ft'), name });
            this.saveData(); this.switchView('familiars');
        }
    },
    editFamiliarTag(id) {
        const tag = this.data.familiarTags.find(t => t.id === id);
        if (!tag) return;
        const newName = prompt("Ubah nama tag familiar:", tag.name);
        if (newName && newName.trim()) {
            tag.name = newName.trim();
            this.saveData(); this.switchView('familiars');
        }
    },
    deleteFamiliarTag(id) {
        if(confirm("Hapus tag familiar ini?")) {
            this.data.familiarTags = this.data.familiarTags.filter(t => t.id !== id);
            this.saveData(); this.switchView('familiars');
        }
    },
    autoloadFamiliarTags() {
        const validIds = this.data.familiarTags.map(t => t.id);
        let added = 0;
        this.data.familiars.forEach(fam => {
            fam.tagIds.forEach(id => {
                if (!validIds.includes(id)) {
                    this.data.familiarTags.push({ id, name: `AutoTag_${id}` });
                    validIds.push(id); added++;
                }
            });
        });
        if (added > 0) { this.saveData(); this.switchView('familiars'); this.showAlert(`${added} Tag familiar dimuat.`, "success"); }
    },
    cleanInvalidFamiliarTags() {
        const validIds = this.data.familiarTags.map(t => t.id);
        let cleaned = 0;
        this.data.familiars.forEach(fam => {
            const len = fam.tagIds.length;
            fam.tagIds = fam.tagIds.filter(id => validIds.includes(id));
            if (fam.tagIds.length !== len) cleaned++;
        });
        if (cleaned > 0) { this.saveData(); this.switchView('familiars'); this.showAlert(`Tag invalid dihapus dari ${cleaned} familiar.`, "success"); }
    },

    // ==========================================
    // --- LOGIKA FORM & CRUD PET ---
    // ==========================================
    openAddFamiliar() {
        this.editFamiliarId = null;
        document.getElementById('familiarFormTitle').innerText = "Buat Familiar Baru";
        document.getElementById('newFamiliarName').value = '';
        document.getElementById('newFamPersonality').value = ''; 
        document.getElementById('newFamiliarApp').value = '';
        document.getElementById('newFamBackground').value = ''; 
        
        const dlgInput = document.getElementById('newFamDialogues');
        if(dlgInput) dlgInput.value = '';
        
        document.querySelectorAll('.familiarTagCheck').forEach(cb => cb.checked = false);
        document.querySelectorAll('.famSkillCheck').forEach(cb => cb.checked = false);
        document.querySelectorAll('.famItemCheck').forEach(cb => cb.checked = false);
        
        this.setPanelState('addFamiliarForm', true);
        document.getElementById('saveFamiliarBtn').innerText = "Simpan Familiar";
    },

    openEditFamiliar(id) {
        const fam = this.data.familiars.find(f => f.id === id);
        if(!fam) return;
        
        this.editFamiliarId = id;
        document.getElementById('familiarFormTitle').innerText = `Edit Familiar: ${fam.name}`;
        document.getElementById('newFamiliarName').value = fam.name;
        document.getElementById('newFamPersonality').value = fam.personality || ''; 
        document.getElementById('newFamiliarApp').value = fam.appearance || '';
        document.getElementById('newFamBackground').value = fam.description || ''; 
        
        const dlgInput = document.getElementById('newFamDialogues');
        if(dlgInput) {
            dlgInput.value = (fam.dialogues || []).join('\n');
        }
        
        document.querySelectorAll('.familiarTagCheck').forEach(cb => {
            cb.checked = (fam.tagIds || []).includes(cb.value);
        });
        document.querySelectorAll('.famSkillCheck').forEach(cb => {
            cb.checked = (fam.skillIds || []).includes(cb.value);
        });
        document.querySelectorAll('.famItemCheck').forEach(cb => {
            cb.checked = (fam.itemIds || []).includes(cb.value);
        });

        this.setPanelState('addFamiliarForm', true);
        document.getElementById('saveFamiliarBtn').innerText = "Update Familiar";
        document.getElementById('newFamiliarName').focus();
    },

    saveFamiliar() {
        const name = document.getElementById('newFamiliarName').value.trim(); 
        const personality = document.getElementById('newFamPersonality').value.trim();
        const appearance = document.getElementById('newFamiliarApp').value.trim();
        const description = document.getElementById('newFamBackground').value.trim(); 
        
        let dialogues = [];
        const dlgInput = document.getElementById('newFamDialogues');
        if (dlgInput) {
            dialogues = dlgInput.value.split('\n').map(d => d.trim()).filter(d => d !== '');
        }
        
        const tagIds = Array.from(document.querySelectorAll('.familiarTagCheck:checked')).map(cb => cb.value);
        const skillIds = Array.from(document.querySelectorAll('.famSkillCheck:checked')).map(cb => cb.value);
        const itemIds = Array.from(document.querySelectorAll('.famItemCheck:checked')).map(cb => cb.value); 

        if (!name) return this.showAlert("Nama familiar tidak boleh kosong", "error");

        if (this.editFamiliarId) {
            const fam = this.data.familiars.find(f => f.id === this.editFamiliarId);
            if (fam) {
                fam.name = name;
                fam.personality = personality;
                fam.appearance = appearance;
                fam.description = description; 
                fam.dialogues = dialogues;
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
                personality,
                appearance,
                description,
                dialogues,
                tagIds,
                skillIds,
                itemIds
            });
            this.showAlert("Familiar baru disimpan", "success");
        }

        this.setPanelState('addFamiliarForm', false);
        this.saveData(true);
        this.switchView('familiars'); 
    },
    
    deleteFamiliar(id) {
        if(confirm("Yakin ingin menghapus familiar ini?")) {
            this.data.familiars = this.data.familiars.filter(f => f.id !== id);
            this.setPanelState('addFamiliarForm', false);
            this.saveData(); this.switchView('familiars');
        }
    },

    // --- LOGIKA ARRAY DIALOG PET ---
    addFamiliarDialogue(famId) {
        const inputEl = document.getElementById(`newFamDlg_${famId}`);
        const text = inputEl.value.trim();
        
        if (text) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (!fam.dialogues) fam.dialogues = [];
            fam.dialogues.push(text);
            
            this.saveData(true);
            this.switchView('familiars'); 
        }
    },

    deleteFamiliarDialogue(famId, dlgIndex) {
        if (confirm("Hapus contoh dialog ini?")) {
            const fam = this.data.familiars.find(f => f.id === famId);
            if (fam && fam.dialogues) {
                fam.dialogues.splice(dlgIndex, 1);
                this.saveData(true);
                this.switchView('familiars');
            }
        }
    },

    exportFamiliarsOnly() {
        if (this.data.familiars.length === 0) {
            return this.showAlert("Tidak ada data familiar untuk diexport.", "error");
        }
        const payload = {
            familiarTags: this.data.familiarTags,
            familiars: this.data.familiars
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `data_familiars.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        this.showAlert("Data familiar berhasil diexport!", "success");
    },

    // ==========================================
    // --- RENDER GRID & CARD PET ---
    // ==========================================
    renderFamiliarGrid() {
        const container = document.getElementById('familiarGridContainer');
        if(!container) return;
        const query = (document.getElementById('searchFamiliarInput')?.value || '').toLowerCase();

        const famData = this.data.familiars.map(fam => {
            const tagNames = (fam.tagIds || []).map(id => {
                const t = this.data.familiarTags.find(tag => tag.id === id);
                return (t && t.name) ? t.name.toLowerCase() : '';
            }).join(' ');
            return { 
                ...fam, 
                tagIds: fam.tagIds || [],
                skillIds: fam.skillIds || [],
                itemIds: fam.itemIds || [],
                tagNames 
            };
        });

        let filtered = famData.filter(f => 
            (f.name || '').toLowerCase().includes(query) || f.tagNames.includes(query)
        );

        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (filtered.length === 0) {
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8">Tidak ada familiar ditemukan.</p>`; return;
        }
        container.innerHTML = filtered.map(f => this.renderFamiliarCard(f)).join('');
    },

    renderFamiliarCard(fam) {
        const famTags = (fam.tagIds || []).map(id => {
            const tag = this.data.familiarTags.find(t => t.id === id);
            return tag ? `<span class="bg-fuchsia-900/50 text-fuchsia-300 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-700">${tag.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join(' ');

        const famSkills = (fam.skillIds || []).map(id => {
            const skill = this.data.skills.find(s => s.id === id);
            return skill ? `<span class="bg-indigo-900/50 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-700">${skill.name}</span>` 
                            : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join(' ');

        const famItems = (fam.itemIds || []).map(id => {
            const item = this.data.items.find(i => i.id === id);
            return item ? `<span class="bg-cyan-900/50 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded border border-cyan-700">${item.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join(' ');

        // Membangun daftar dialog dengan scrollable area
        const dialoguesHtml = (fam.dialogues || []).map((dlg, index) => `
            <li class="flex justify-between items-start text-xs italic text-slate-300 border-l-2 border-fuchsia-500/50 pl-2 py-1 group/dlg bg-slate-800/30 rounded-r">
                <span class="flex-1">"${dlg}"</span>
                <button onclick="app.deleteFamiliarDialogue('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/dlg:opacity-100 ml-1.5 transition">
                    &times;
                </button>
            </li>
        `).join('');

        return `
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-3 relative group transition-all duration-300 flex flex-col justify-between hover:border-fuchsia-500/50">
            <div>
                <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-10 bg-slate-900 pl-2 rounded">
                    <button onclick="app.openEditFamiliar('${fam.id}')" class="text-slate-500 hover:text-fuchsia-400 p-1 rounded" title="Edit Familiar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="app.deleteFamiliar('${fam.id}')" class="text-slate-500 hover:text-rose-500 p-1 rounded" title="Hapus Familiar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                
                <div class="flex flex-col pr-14 mb-2">
                    <h4 class="font-bold text-fuchsia-400 text-sm md:text-base line-clamp-1 group-hover:line-clamp-none transition-all">${fam.name}</h4>
                    <p class="text-[11px] text-slate-400"><span class="font-semibold uppercase tracking-wider text-[10px]">Watak:</span> ${fam.personality || '-'}</p>
                </div>
                
                <div class="flex flex-wrap gap-1 mb-3">${famTags || '<span class="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Tanpa Tag</span>'}</div>
                
                <div class="space-y-1.5">
                    <div class="text-xs text-slate-300 line-clamp-1 group-hover:line-clamp-none transition-all"><span class="font-semibold text-slate-400">Wujud:</span> ${fam.appearance || '-'}</div>
                    <div class="text-xs text-slate-300 line-clamp-2 group-hover:line-clamp-none transition-all"><span class="font-semibold text-slate-400">Latar Belakang:</span> ${fam.description || fam.background || '-'}</div>
                </div>
                
                <div class="text-xs text-slate-300 flex items-start gap-1 mt-3">
                    <span class="font-semibold text-slate-400 mt-0.5">Skill:</span> 
                    <div class="flex flex-wrap gap-1">${famSkills || '<span class="text-[10px] text-slate-500 italic mt-0.5">Tidak ada</span>'}</div>
                </div>

                <div class="text-xs text-slate-300 flex items-start gap-1 mt-1.5 mb-2">
                    <span class="font-semibold text-slate-400 mt-0.5">Item:</span> 
                    <div class="flex flex-wrap gap-1">${famItems || '<span class="text-[10px] text-slate-500 italic mt-0.5">Tidak ada</span>'}</div>
                </div>
            </div>

            <div class="mt-2 pt-3 border-t border-slate-700/60">
                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Contoh Suara / Dialog:</span>
                <ul class="space-y-1 mb-2 max-h-24 overflow-y-auto pr-1">
                    ${dialoguesHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada dialog.</li>'}
                </ul>
                <div class="flex items-center space-x-1.5">
                    <input type="text" id="newFamDlg_${fam.id}" placeholder="Ketik dialog..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-fuchsia-500" onkeydown="if(event.key === 'Enter') app.addFamiliarDialogue('${fam.id}')">
                    <button onclick="app.addFamiliarDialogue('${fam.id}')" class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-2 py-1 rounded text-[10px] font-medium transition shadow-sm">Tambah</button>
                </div>
            </div>
        </div>
        `;
    }
};