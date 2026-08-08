// Tampilan panel mengambang pet / familiar dengan Manajemen State Cerita dan Badge Class & Title

export const PetFloating = {

    // ==========================================
    // --- LOGIKA TAMPILAN FLOATING PANEL ---
    // ==========================================
    activeFamId: null,

    showFamiliarDetailFloating(id, options = {}) {
        const familiars = (this.data && this.data.familiars) || (typeof app !== 'undefined' && app.data && app.data.familiars) || [];
        const fam = familiars.find(f => f.id === id);
        if (!fam) return;
        this.activeFamId = id;

        // Simpan posisi scroll saat ini sebelum DOM diperbarui
        const scrollContainer = document.getElementById('floatingFamDetail')?.querySelector('.overflow-y-auto');
        const currentScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

        // Set Judul Familiar
        const titleEl = document.getElementById('floatingFamTitle');
        if (titleEl) {
            titleEl.innerText = `🐾 ${fam.name}`;
        }

        // --- BADGES INFO UTAMA (Ras, Kelamin, Umur) ---
        const races = (this.data && this.data.races) || (typeof app !== 'undefined' && app.data && app.data.races) || [];
        const race = races.find(r => r.id === fam.raceId);
        const raceBadge = race ? `<span class="bg-amber-900/60 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-700/50 font-medium">🧬 Ras: ${race.name}</span>` : '';
        
        let genderBadge = '';
        if (fam.gender === 'jantan') {
            genderBadge = '<span class="bg-blue-900/60 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700/50 font-medium">♂ Jantan</span>';
        } else if (fam.gender === 'betina') {
            genderBadge = '<span class="bg-pink-900/60 text-pink-300 text-[10px] px-2 py-0.5 rounded border border-pink-700/50 font-medium">♀ Betina</span>';
        }
        
        const ageBadge = fam.age ? `<span class="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-600 font-medium">⏳ ${fam.age}</span>` : '';

        // --- BADGES CLASS (Kelas / Peran) ---
        const classes = (this.data && this.data.classes) || (typeof app !== 'undefined' && app.data && app.data.classes) || [];
        const classBadges = (fam.classIds || [])
            .map(cId => classes.find(c => c.id === cId))
            .filter(Boolean)
            .map(c => `<span class="bg-emerald-900/60 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-700/50 font-medium">🛡️ ${c.name}</span>`)
            .join('');

        // --- BADGES TITLE (Gelar / Kehormatan) ---
        const titles = (this.data && this.data.titles) || (typeof app !== 'undefined' && app.data && app.data.titles) || [];
        const titleBadges = (fam.titleIds || [])
            .map(tId => titles.find(t => t.id === tId))
            .filter(Boolean)
            .map(t => `<span class="bg-yellow-900/60 text-yellow-300 text-[10px] px-2 py-0.5 rounded border border-yellow-700/50 font-medium">👑 ${t.name}</span>`)
            .join('');

        // Dedicated element for Class badges if exists
        const famClassesEl = document.getElementById('floatingFamClasses');
        if (famClassesEl) {
            famClassesEl.innerHTML = classBadges || '<span class="text-[10px] text-slate-500 italic">Tanpa Class</span>';
        }

        // Dedicated element for Title badges if exists
        const famTitlesEl = document.getElementById('floatingFamTitles');
        if (famTitlesEl) {
            famTitlesEl.innerHTML = titleBadges || '<span class="text-[10px] text-slate-500 italic">Tanpa Title</span>';
        }

        // Set Penampilan & Deskripsi Latar Belakang
        const appEl = document.getElementById('floatingFamApp');
        if (appEl) appEl.innerHTML = fam.appearance || '<span class="italic text-slate-500">Tidak ada informasi penampilan.</span>';

        const descEl = document.getElementById('floatingFamDesc');
        if (descEl) descEl.innerHTML = fam.description || fam.background || '<span class="italic text-slate-500">Tidak ada deskripsi latar belakang.</span>';

        // Set Tag Kategori (Gabungkan dengan Badge Ras, Kelamin, Umur, Class, Title jika ada)
        const familiarTags = (this.data && this.data.familiarTags) || (typeof app !== 'undefined' && app.data && app.data.familiarTags) || [];
        const resolvedTags = (fam.tagIds || [])
            .map(tagId => familiarTags.find(t => t.id === tagId))
            .filter(tag => tag !== undefined);

        resolvedTags.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        const tagHtml = resolvedTags.map(tag => {
            return `<span class="bg-fuchsia-900/60 text-fuchsia-300 text-[10px] px-2 py-0.5 rounded border border-fuchsia-700/50">${tag.name}</span>`;
        }).join('');

        const combinedTags = [raceBadge, genderBadge, ageBadge, classBadges, titleBadges, tagHtml].filter(Boolean).join('');
        const tagsEl = document.getElementById('floatingFamTags');
        if (tagsEl) {
            tagsEl.innerHTML = combinedTags || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded">Tanpa Tag / Info</span>';
        }

        // Set Watak / Kepribadian
        const masterWatakList = (typeof app !== 'undefined' && app.data && app.data.watakList) || (this.data && this.data.watakList) || [];
        let parsedWataks = [];
        if (Array.isArray(fam.personality)) parsedWataks = fam.personality;
        else if (typeof fam.personality === 'string' && fam.personality.trim() !== '') parsedWataks = fam.personality.split(',').map(s => s.trim());
        
        const watakHtml = parsedWataks.map(w => {
            const isValid = masterWatakList.some(master => master.toLowerCase() === w.toLowerCase());
            return isValid 
                ? `<span class="bg-purple-900/60 text-purple-300 text-[10px] px-2 py-0.5 rounded border border-purple-700/50 font-medium">🎭 ${w}</span>`
                : `<span class="bg-rose-900/60 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 font-medium line-through">Invalid</span>`;
        }).join('');
        
        const wataksEl = document.getElementById('floatingFamWataks');
        if (wataksEl) {
            wataksEl.innerHTML = watakHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded">Tanpa Watak</span>';
        }

        // Set Skills
        const allSkills = (this.data && this.data.skills) || (typeof app !== 'undefined' && app.data && app.data.skills) || [];
        const skillHtml = (fam.skillIds || []).map(sId => {
            const skill = allSkills.find(s => s.id === sId);
            return skill ? `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700/50">✨ ${skill.name}</span>` : '';
        }).join('');
        
        const skillsEl = document.getElementById('floatingFamSkills');
        if (skillsEl) {
            skillsEl.innerHTML = skillHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-700/50">Tidak ada skill</span>';
        }

        // Set Items
        const allItems = (this.data && this.data.items) || (typeof app !== 'undefined' && app.data && app.data.items) || [];
        const itemHtml = (fam.itemIds || []).map(iId => {
            const item = allItems.find(i => i.id === iId);
            return item ? `<span class="bg-cyan-900/60 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700/50">🎒 ${item.name}</span>` : '';
        }).join('');
        
        const itemsEl = document.getElementById('floatingFamItems');
        if (itemsEl) {
            itemsEl.innerHTML = itemHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-700/50">Tidak ada item</span>';
        }

        // --- MANAJEMEN STATE / SNAPSHOT CERITA PET ---
        const stateContainer = document.getElementById('floatingFamStateContainer');
        if (stateContainer) {
            const states = fam.states || [];
            const activeState = states.find(s => s.id === fam.activeStateId) || states[0];
            const activeStateId = activeState ? activeState.id : '';

            const stateOptionsHtml = states.map(s => `
                <option value="${s.id}" ${s.id === activeStateId ? 'selected' : ''}>
                    ${s.name} ${s.id === activeStateId ? ' (Aktif)' : ''}
                </option>
            `).join('');

            stateContainer.innerHTML = `
                <div class="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 mb-3 shadow-inner">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-1.5">
                            <span class="text-xs font-semibold text-amber-400 flex items-center gap-1">
                                📖 State Cerita
                            </span>
                            <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">${states.length} State</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <button onclick="app.promptRenameFamiliarState('${fam.id}', '${activeStateId}')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-0.5 rounded transition flex items-center gap-1" title="Ganti nama state aktif">
                                ✏️ Edit Nama
                            </button>
                            <button onclick="app.promptAddFamiliarState('${fam.id}')" class="text-[10px] bg-amber-600/90 hover:bg-amber-500 text-white font-medium px-2 py-0.5 rounded transition shadow-sm flex items-center gap-1" title="Buat state cerita baru">
                                + State Baru
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1.5">
                        <select onchange="app.onSwitchFamiliarState('${fam.id}', this.value)" class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer transition">
                            ${stateOptionsHtml || '<option value="">(Belum Ada State)</option>'}
                        </select>
                    </div>
                </div>
            `;
        }

        // --- Set Catatan Khusus Pet / Notes ---
        const notesHtml = (fam.notes || []).map((note, index) => `
            <li class="flex justify-between items-start text-[11px] text-slate-300 border-l-2 border-amber-500/50 pl-2 py-1 group/note bg-slate-800/30 rounded-r mb-1">
                <span class="flex-1 leading-relaxed whitespace-pre-wrap">${note}</span>
                <div class="opacity-0 group-hover/note:opacity-100 flex items-center space-x-1 ml-1.5 transition">
                    <button onclick="app.deleteFamiliarNote('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs px-1" title="Hapus Catatan">&times;</button>
                </div>
            </li>
        `).join('');
        
        const notesEl = document.getElementById('floatingFamNotes');
        if (notesEl) {
            notesEl.innerHTML = notesHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada catatan.</li>';
        }

        // --- Render Input Box untuk Catatan Baru ---
        const noteInputContainer = document.getElementById('floatingFamNoteInputContainer');
        if (noteInputContainer) {
            noteInputContainer.innerHTML = `
                <div class="flex items-center space-x-1.5 pt-1">
                    <input type="text" id="newFamNote_${fam.id}" placeholder="Ketik catatan baru..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500 transition" onkeydown="if(event.key === 'Enter') app.addFamiliarNote('${fam.id}')">
                    <button onclick="app.addFamiliarNote('${fam.id}')" class="bg-amber-600/80 hover:bg-amber-500 text-white px-2 py-1.5 rounded text-[10px] font-medium transition shadow-sm">+</button>
                </div>
            `;
        }

        // Set Dialogues
        const dialoguesHtml = (fam.dialogues || []).map((dlg, index) => `
            <li class="flex justify-between items-start text-[11px] italic text-slate-300 border-l-2 border-blue-500/50 pl-2 py-1 group/dlg bg-slate-800/30 rounded-r mb-1">
                <span class="flex-1 leading-relaxed">${dlg}</span>
                <button onclick="app.deleteFamiliarDialogue('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/dlg:opacity-100 ml-1.5 transition px-1" title="Hapus baris ini">&times;</button>
            </li>
        `).join('');
        
        const dlgEl = document.getElementById('floatingFamDialogues');
        if (dlgEl) {
            dlgEl.innerHTML = dialoguesHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada dialog.</li>';
        }
        
        // Render Input Box for Dialogue
        const dlgInputContainer = document.getElementById('floatingFamDlgInputContainer');
        if (dlgInputContainer) {
            dlgInputContainer.innerHTML = `
                <div class="flex items-center space-x-1.5 pt-1">
                    <input type="text" id="newFamDlg_${fam.id}" placeholder="Ketik kalimat/suara..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 transition" onkeydown="if(event.key === 'Enter') app.addFamiliarDialogue('${fam.id}')">
                    <button onclick="app.addFamiliarDialogue('${fam.id}')" class="bg-blue-600/80 hover:bg-fuchsia-500 text-white px-2 py-1.5 rounded text-[10px] font-medium transition shadow-sm">+</button>
                </div>
            `;
        }

        // --- Set Catatan Relasi ---
        const relationsHtml = (fam.relations || []).map((rel, index) => `
            <li class="flex justify-between items-start text-[11px] text-slate-300 border-l-2 border-rose-500/50 pl-2 py-1 group/rel bg-slate-800/30 rounded-r mb-1">
                <span class="flex-1 leading-relaxed whitespace-pre-wrap">${rel}</span>
                <button onclick="app.deleteFamiliarRelation('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/rel:opacity-100 ml-1.5 transition px-1" title="Hapus relasi ini">&times;</button>
            </li>
        `).join('');
        
        const relEl = document.getElementById('floatingFamRelations');
        if (relEl) relEl.innerHTML = relationsHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada catatan relasi.</li>';

        const relInputEl = document.getElementById('floatingFamRelInputContainer');
        if (relInputEl) {
            relInputEl.innerHTML = `
                <div class="flex items-start space-x-1.5 pt-1">
                    <textarea id="newFamRel_${fam.id}" placeholder="Ketik relasi pet ini... (Tekan Enter)" rows="1" class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-rose-500 transition resize-none" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); app.addFamiliarRelation('${fam.id}'); }"></textarea>
                    <button onclick="app.addFamiliarRelation('${fam.id}')" class="bg-rose-600/80 hover:bg-rose-500 text-white px-2 py-1.5 rounded text-[10px] font-medium transition shadow-sm h-[34px] flex items-center">+</button>
                </div>
            `;
        }

        // Tampilkan panel
        const floatingDetail = document.getElementById('floatingFamDetail');
        if (floatingDetail) {
            floatingDetail.classList.remove('hidden');
        }

        // Pulihkan posisi scroll pengguna
        const updatedScrollContainer = document.getElementById('floatingFamDetail')?.querySelector('.overflow-y-auto');
        if (updatedScrollContainer) {
            if (options.preserveScroll) {
                updatedScrollContainer.scrollTop = currentScrollTop;
            } else if (options.isInitialOpen) {
                updatedScrollContainer.scrollTop = 0; // Scroll ke paling atas saat pertama kali dibuka
            } else {
                updatedScrollContainer.scrollTop = currentScrollTop;
            }
        }

        // Kembalikan fokus ke input yang sedang digunakan (jika ada)
        if (options.focusInputId) {
            const targetInput = document.getElementById(options.focusInputId);
            if (targetInput) targetInput.focus();
        }
    },

    closeFamiliarDetailFloating() {
        const floatingDetail = document.getElementById('floatingFamDetail');
        if (floatingDetail) floatingDetail.classList.add('hidden');
        this.activeFamId = null;
    },

    // ==========================================
    // --- HELPER DUKUNGAN STATE CERITA PET ---
    // ==========================================
    onSwitchFamiliarState(famId, targetStateId) {
        if (!targetStateId) return;
        
        if (typeof this.switchFamiliarState === 'function') {
            this.switchFamiliarState(famId, targetStateId);
        } else if (typeof app !== 'undefined' && typeof app.switchFamiliarState === 'function') {
            app.switchFamiliarState(famId, targetStateId);
        }

        if (this.activeFamId === famId) {
            this.showFamiliarDetailFloating(famId, { preserveScroll: true });
        }
    },

    promptAddFamiliarState(famId) {
        const familiars = (this.data && this.data.familiars) || (typeof app !== 'undefined' && app.data && app.data.familiars) || [];
        const fam = familiars.find(f => f.id === famId);
        if (!fam) return;

        const showModal = typeof this.showCustomModal === 'function' ? this.showCustomModal.bind(this) : (typeof app !== 'undefined' && typeof app.showCustomModal === 'function' ? app.showCustomModal.bind(app) : null);

        if (showModal) {
            const modalContent = `
                <div class="space-y-3 text-left">
                    <p class="text-xs text-slate-300">Buat snapshot/state versi cerita baru untuk familiar <b class="text-amber-400">${fam.name}</b>. Atribut saat ini akan disimpan sebagai titik acuan state baru.</p>
                    <div>
                        <label class="block text-[11px] font-medium text-slate-400 mb-1">Nama State Baru:</label>
                        <input type="text" id="modalNewStateName" placeholder="Contoh: Bab 2 - Setelah Evolusi" class="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500">
                    </div>
                </div>
            `;

            showModal({
                title: "Tambah State Cerita Baru",
                content: modalContent,
                confirmText: "Buat State",
                confirmColor: "bg-amber-600 hover:bg-amber-500 text-white",
                onConfirm: () => {
                    const input = document.getElementById('modalNewStateName');
                    const stateName = input ? input.value.trim() : '';
                    if (!stateName) {
                        const alertFn = typeof this.showAlert === 'function' ? this.showAlert.bind(this) : (typeof app !== 'undefined' ? app.showAlert : null);
                        if (alertFn) alertFn("Nama state tidak boleh kosong", "error");
                        return false;
                    }

                    if (typeof this.addFamiliarState === 'function') {
                        this.addFamiliarState(famId, stateName);
                    } else if (typeof app !== 'undefined' && typeof app.addFamiliarState === 'function') {
                        app.addFamiliarState(famId, stateName);
                    }

                    if (this.activeFamId === famId) {
                        this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                    }
                    
                    const alertFn = typeof this.showAlert === 'function' ? this.showAlert.bind(this) : (typeof app !== 'undefined' ? app.showAlert : null);
                    if (alertFn) alertFn(`State "${stateName}" berhasil dibuat!`, "success");
                    return true;
                }
            });
        } else {
            const stateName = prompt(`Masukkan nama state cerita baru untuk ${fam.name}:`);
            if (stateName && stateName.trim()) {
                if (typeof this.addFamiliarState === 'function') {
                    this.addFamiliarState(famId, stateName.trim());
                } else if (typeof app !== 'undefined' && typeof app.addFamiliarState === 'function') {
                    app.addFamiliarState(famId, stateName.trim());
                }

                if (this.activeFamId === famId) {
                    this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                }
            }
        }
    },

    promptRenameFamiliarState(famId, stateId) {
        const familiars = (this.data && this.data.familiars) || (typeof app !== 'undefined' && app.data && app.data.familiars) || [];
        const fam = familiars.find(f => f.id === famId);
        if (!fam || !fam.states) return;

        const stateObj = fam.states.find(s => s.id === stateId);
        if (!stateObj) return;

        const showModal = typeof this.showCustomModal === 'function' ? this.showCustomModal.bind(this) : (typeof app !== 'undefined' && typeof app.showCustomModal === 'function' ? app.showCustomModal.bind(app) : null);

        if (showModal) {
            const modalContent = `
                <div class="space-y-3 text-left">
                    <p class="text-xs text-slate-300">Ubah nama state cerita untuk <b class="text-amber-400">${fam.name}</b>.</p>
                    <div>
                        <label class="block text-[11px] font-medium text-slate-400 mb-1">Nama State saat ini:</label>
                        <input type="text" id="modalRenameStateInput" value="${stateObj.name || ''}" class="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500">
                    </div>
                </div>
            `;

            showModal({
                title: "Ganti Nama State Cerita",
                content: modalContent,
                confirmText: "Simpan Nama",
                confirmColor: "bg-blue-600 hover:bg-blue-500 text-white",
                onConfirm: () => {
                    const input = document.getElementById('modalRenameStateInput');
                    const newName = input ? input.value.trim() : '';
                    if (!newName) {
                        const alertFn = typeof this.showAlert === 'function' ? this.showAlert.bind(this) : (typeof app !== 'undefined' ? app.showAlert : null);
                        if (alertFn) alertFn("Nama state tidak boleh kosong", "error");
                        return false;
                    }

                    stateObj.name = newName;
                    
                    const saveFn = typeof this.saveData === 'function' ? this.saveData.bind(this) : (typeof app !== 'undefined' ? app.saveData : null);
                    if (saveFn) saveFn(true);

                    if (this.activeFamId === famId) {
                        this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                    }

                    const alertFn = typeof this.showAlert === 'function' ? this.showAlert.bind(this) : (typeof app !== 'undefined' ? app.showAlert : null);
                    if (alertFn) alertFn(`Nama state berhasil diubah menjadi "${newName}"!`, "success");
                    return true;
                }
            });
        } else {
            const newName = prompt("Ganti nama state cerita:", stateObj.name);
            if (newName && newName.trim()) {
                stateObj.name = newName.trim();
                const saveFn = typeof this.saveData === 'function' ? this.saveData.bind(this) : (typeof app !== 'undefined' ? app.saveData : null);
                if (saveFn) saveFn(true);

                if (this.activeFamId === famId) {
                    this.showFamiliarDetailFloating(famId, { preserveScroll: true });
                }
            }
        }
    },

    // ==========================================
    // --- LOGIKA DRAG & DROP FLOATING PANEL ---
    // ==========================================
    dragStateFam: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    startDragFam(e, elementId) {
        if (e.button !== 0) return; // Abaikan klik kanan
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateFam.isDragging = true;
        this.dragStateFam.el = el;
        this.dragStateFam.startX = e.clientX;
        this.dragStateFam.startY = e.clientY;

        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            el.classList.remove('bottom-6', 'right-6'); 
        }

        el.style.transition = 'none';

        const stopFn = typeof this.stopDragFam === 'function' ? this.stopDragFam.bind(this) : (typeof app !== 'undefined' ? app.stopDragFam : null);
        const dragFn = typeof this.dragFam === 'function' ? this.dragFam.bind(this) : (typeof app !== 'undefined' ? app.dragFam : null);

        document.onmouseup = stopFn;
        document.onmousemove = dragFn;
    },

    dragFam(e) {
        if (!this.dragStateFam.isDragging || !this.dragStateFam.el) return;
        e.preventDefault();

        const el = this.dragStateFam.el;

        const dx = e.clientX - this.dragStateFam.startX;
        const dy = e.clientY - this.dragStateFam.startY;

        this.dragStateFam.startX = e.clientX;
        this.dragStateFam.startY = e.clientY;

        let newLeft = el.offsetLeft + dx;
        let newTop = el.offsetTop + dy;

        if (newLeft < 0) newLeft = 0;
        const maxLeft = window.innerWidth - el.offsetWidth;
        if (newLeft > maxLeft) newLeft = maxLeft;
        
        const topOffset = 0; 
        if (newTop < topOffset) newTop = topOffset;
        const maxTop = window.innerHeight - el.offsetHeight;
        if (newTop > maxTop) newTop = maxTop;

        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
    },

    stopDragFam() {
        if (this.dragStateFam.el) {
            this.dragStateFam.el.style.transition = '';
        }
        this.dragStateFam.isDragging = false;
        this.dragStateFam.el = null;
        
        document.onmouseup = null;
        document.onmousemove = null;
    }
};