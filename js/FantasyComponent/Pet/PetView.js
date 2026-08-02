// Render tampilan utama pet

export const PetView = {

    // ==========================================
    // --- RENDER VIEW UTAMA (PETS & TAGS) ---
    // ==========================================
    renderFamiliarsView() {
        const daftarWatak = app.data.watakList || [];
        const daftarSemesta = app.data.universes || [];

        return `
            <div class="flex flex-col gap-6 relative">
                
                <!-- BAGIAN MANAJEMEN TAG FAMILIAR -->
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
                                <button onclick="app.autoloadFamiliarTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Autoload Tag
                                </button>
                                <button onclick="app.cleanInvalidFamiliarTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Bersihkan Tag Invalid
                                </button>
                                <button onclick="app.exportFamiliarsOnly()" class="bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-xs py-2 px-3 rounded flex justify-center items-center font-medium shadow transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Export (.json)
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2 pt-2">
                                ${this.data.familiarTags.length === 0 ? '<p class="text-xs text-slate-500 w-full text-center py-2">Belum ada tag familiar.</p>' : ''}
                                ${this.data.familiarTags.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(t => `
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

                <!-- BAGIAN MANAJEMEN LIST PET & FORM -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                        <div class="bg-slate-700/50 p-3 flex justify-between items-center">
                            <h3 class="font-semibold text-slate-200">Daftar Familiar <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.familiars.length}</span></h3>
                            <button onclick="event.stopPropagation(); app.openAddFamiliar()" class="text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-1.5 rounded transition shadow-sm font-medium">
                                + Tambah Familiar
                            </button>
                        </div>
                        <div id="familiarsPanel" class="p-4">
                            
                            <!-- Search Bar -->
                            <div class="mb-4 relative">
                                <input type="text" 
                                    id="searchFamiliarInput" 
                                    value="${app.currentFamiliarFilter || ''}" 
                                    placeholder="Cari nama familiar atau tag..." 
                                    class="bg-slate-900 border border-slate-700 rounded p-2.5 pl-9 text-sm w-full focus:border-fuchsia-500 focus:outline-none transition" 
                                    oninput="app.onSearchFamiliarInput(event)">
                                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            
                            <!-- FORM TAMBAH/EDIT FAMILIAR -->
                            <div id="addFamiliarForm" class="hidden bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                <button onclick="app.togglePanel('addFamiliarForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition text-lg">&times;</button>
                                <h4 id="familiarFormTitle" class="text-sm font-bold text-fuchsia-400 mb-4 border-b border-slate-700 pb-2">Buat Familiar Baru</h4>
                                
                                <!-- Kebutuhan Dasar & Watak -->
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Familiar <span class="text-rose-400">*</span></label>
                                    <input type="text" id="newFamiliarName" placeholder="Contoh: Fenrir / Kucing Hitam" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-fuchsia-500">
                                </div>

                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                                        <span>Kepribadian / Watak <span class="text-rose-400">*</span></span>
                                        <span class="text-[10px] font-normal text-slate-500 normal-case">(Pilih minimal 1 untuk rujukan AI)</span>
                                    </label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-2 max-h-32 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        ${daftarWatak.length === 0 ? '<span class="text-xs text-slate-500 italic col-span-full">Belum ada watak di Master Watak.</span>' : ''}
                                        ${daftarWatak.map(w => `
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" value="${w}" class="famWatakCheck form-checkbox rounded text-fuchsia-500 bg-slate-900 border-slate-600 focus:ring-fuchsia-500">
                                                <span class="truncate text-slate-300 hover:text-white transition">${w}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Pengaturan Konteks AI (Volatile/Tidak disave ke pet) -->
                                <div class="bg-purple-900/10 border border-purple-500/20 rounded p-3 mb-4">
                                    <h5 class="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <span>✨</span> Konteks AI Enchanter (Opsional)
                                    </h5>
                                    <div class="flex flex-col sm:flex-row gap-3">
                                        <select id="aiFamUniverse" class="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-300 focus:border-fuchsia-500 outline-none">
                                            <option value="">-- Tanpa Referensi Semesta --</option>
                                            ${daftarSemesta.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                                        </select>
                                        <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                                            <input type="checkbox" id="aiFamDeepLore" class="rounded text-purple-500 bg-slate-900 border-slate-600">
                                            <span>Sertakan Informasi Tempat (Mendalam)</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Textareas with AI Buttons -->
                                <div class="mb-4">
                                    <div class="flex justify-between items-end mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wujud Fisik / Penampilan</label>
                                        <button id="btnAiApp" onclick="app.generateFamAI('appearance')" class="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                            ✨ Enchant Penampilan
                                        </button>
                                    </div>
                                    <textarea id="newFamiliarApp" placeholder="Tuliskan draf singkat, lalu gunakan AI untuk memperindahnya..." class="bg-slate-800 border border-slate-600 rounded p-2.5 text-sm w-full outline-none focus:border-fuchsia-500" rows="3"></textarea>
                                </div>

                                <div class="mb-4">
                                    <div class="flex justify-between items-end mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latar Belakang / Deskripsi</label>
                                        <button id="btnAiDesc" onclick="app.generateFamAI('description')" class="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                            ✨ Enchant Latar Belakang
                                        </button>
                                    </div>
                                    <textarea id="newFamBackground" placeholder="Dari mana ia berasal? Kenapa ia ikut dengan masternya? Tulis draf untuk referensi AI..." class="bg-slate-800 border border-slate-600 rounded p-2.5 text-sm w-full outline-none focus:border-fuchsia-500" rows="3"></textarea>
                                </div>
                                
                                <!-- Integrasi Komponen Lain -->
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <!-- Filter & Checklist Skill -->
                                    <div>
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Skill Khusus:</label>
                                        <div class="mb-2 relative">
                                            <input type="text" 
                                                id="famSkillSearch" 
                                                value="${app.currentSkillFilter || ''}"
                                                placeholder="Cari Skill..." 
                                                oninput="app.onFamSkillSearchInput(event)"
                                                class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full focus:border-indigo-500 outline-none text-slate-300">
                                        </div>
                                        <div id="famSkillList" class="bg-slate-900 border border-slate-600 rounded p-2 max-h-40 overflow-y-auto grid grid-cols-2 gap-2 text-xs">
                                            <!-- Dirender via app.renderFamSkillCheckboxes() -->
                                        </div>
                                    </div>

                                    <!-- Filter & Checklist Item -->
                                    <div>
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Item Bawaan:</label>
                                        <div class="mb-2 relative">
                                            <input type="text" 
                                                id="famItemSearch" 
                                                value="${app.currentItemFilter || ''}"
                                                placeholder="Cari Item..." 
                                                oninput="app.onFamItemSearchInput(event)"
                                                class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full focus:border-cyan-500 outline-none text-slate-300">
                                        </div>
                                        <div id="famItemList" class="bg-slate-900 border border-slate-600 rounded p-2 max-h-40 overflow-y-auto grid grid-cols-2 gap-2 text-xs">
                                            <!-- Dirender via app.renderFamItemCheckboxes() -->
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Tag Familiar:</label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-2 max-h-24 overflow-y-auto flex flex-wrap gap-2 text-sm">
                                        ${this.data.familiarTags.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(t => `
                                            <label class="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-700 cursor-pointer">
                                                <input type="checkbox" value="${t.id}" class="familiarTagCheck form-checkbox rounded text-fuchsia-500 bg-slate-700 border-slate-600">
                                                <span class="truncate text-slate-300 text-xs">${t.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-700/60">
                                    <button onclick="app.setPanelState('addFamiliarForm', false); app.editFamiliarId = null;" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm transition">Batal</button>
                                    <button id="saveFamiliarBtn" onclick="app.saveFamiliar()" class="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-medium rounded text-sm shadow transition">Simpan Familiar</button>
                                </div>
                            </div>

                            <!-- DAFTAR FAMILIAR (KARTU KECIL BERJAJAR DALAM GRID) -->
                            <div id="familiarGridContainer" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full">
                                <!-- Rendered via renderFamiliarGrid() -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FLOATING DETAIL PANEL (MENGAMBANG SEPERTI WINDOWS) -->
                <div id="floatingFamDetail" class="hidden fixed bottom-6 right-6 w-96 max-w-[90vw] bg-slate-800 border-2 border-fuchsia-500/50 rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 shadow-fuchsia-900/20">
                    <!-- Header Jendela (Area Handle Drag) -->
                    <div onmousedown="app.startDragFam(event, 'floatingFamDetail')" class="bg-gradient-to-r from-fuchsia-700 to-fuchsia-900 px-4 py-3 flex justify-between items-center rounded-t-xl cursor-move border-b border-fuchsia-500/30 select-none">
                        <span id="floatingFamTitle" class="font-bold text-sm text-white truncate pr-4 pointer-events-none">Detail Familiar</span>
                        <button onclick="event.stopPropagation(); app.closeFamiliarDetailFloating()" class="text-fuchsia-200 hover:text-white transition font-bold text-lg leading-none cursor-pointer" title="Tutup Jendela">&times;</button>
                    </div>
                    <!-- Konten Jendela -->
                    <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div>
                            <span class="font-semibold text-fuchsia-400 uppercase tracking-wider text-[10px] block mb-1.5">Tags Kategori & Watak:</span>
                            <div id="floatingFamTags" class="flex flex-wrap gap-1.5 mb-1.5"></div>
                            <div id="floatingFamWataks" class="flex flex-wrap gap-1.5"></div>
                        </div>
                        <div class="pt-2 border-t border-slate-700/60 flex flex-col gap-2">
                            <div>
                                <span class="font-semibold text-indigo-400 uppercase tracking-wider text-[10px] block mb-1.5">Skill Tambahan:</span>
                                <div id="floatingFamSkills" class="flex flex-wrap gap-1.5"></div>
                            </div>
                            <div>
                                <span class="font-semibold text-cyan-400 uppercase tracking-wider text-[10px] block mb-1.5">Item Bawaan:</span>
                                <div id="floatingFamItems" class="flex flex-wrap gap-1.5"></div>
                            </div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1.5">Wujud / Penampilan:</span>
                            <div id="floatingFamApp" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1.5">Latar Belakang:</span>
                            <div id="floatingFamDesc" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-yellow-400 uppercase tracking-wider text-[10px] block mb-1.5">Contoh Suara / Dialog:</span>
                            <ul id="floatingFamDialogues" class="space-y-1 mb-2"></ul>
                            <div id="floatingFamDlgInputContainer"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-amber-400 uppercase tracking-wider text-[10px] block mb-1.5">Catatan Khusus Pet:</span>
                            <ul id="floatingFamNotes" class="space-y-1 mb-2"></ul>
                            <div id="floatingFamNoteInputContainer"></div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    },

    // ==========================================
    // --- RENDER GRID & CARD PET ---
    // ==========================================
    renderFamiliarGrid() {
        const container = document.getElementById('familiarGridContainer');
        if(!container) return;
        const query = (app.currentFamiliarFilter || '').toLowerCase();

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
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8 bg-slate-800/30 rounded border border-dashed border-slate-700">Tidak ada familiar ditemukan.</p>`; return;
        }
        container.innerHTML = filtered.map(f => this.renderFamiliarCard(f)).join('');
    },

    renderFamiliarCard(fam) {
        // Validasi Dinamis untuk Watak String Array
        const masterWatakList = app.data.watakList || [];
        let parsedWataks = [];
        
        if (Array.isArray(fam.personality)) {
            parsedWataks = fam.personality;
        } else if (typeof fam.personality === 'string' && fam.personality.trim() !== '') {
            parsedWataks = fam.personality.split(',').map(s => s.trim());
        }

        // Tampilkan maks 2 watak dan KINI MASKIMAL 3 tag di Card kecil
        const famWataks = parsedWataks.slice(0, 2).map(w => {
            const isValid = masterWatakList.some(master => master.toLowerCase() === w.toLowerCase());
            return isValid 
                ? `<span class="bg-purple-900/60 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-700/60 truncate max-w-[65px] block" title="${w}">${w}</span>`
                : `<span class="bg-rose-900/50 text-rose-300 text-[9px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join('');

        const famTags = (fam.tagIds || []).slice(0, 3).map(id => { // Diubah dari .slice(0, 2) menjadi .slice(0, 3)
            const tag = this.data.familiarTags.find(t => t.id === id);
            return tag ? `<span class="bg-fuchsia-900/60 text-fuchsia-300 text-[9px] px-1.5 py-0.5 rounded border border-fuchsia-700/50 truncate max-w-[65px] block" title="${tag.name}">${tag.name}</span>` 
                        : '';
        }).join('');

        // Cek Indikator Ekstra (Kalkulasi dikurangi 3 untuk tag)
        const extraWatakCount = Math.max(0, parsedWataks.length - 2);
        const extraTagCount = Math.max(0, (fam.tagIds || []).length - 3); // Diubah dari - 2 menjadi - 3
        const hasExtra = (extraWatakCount + extraTagCount) > 0;
        
        const hasSkills = fam.skillIds && fam.skillIds.length > 0;
        const hasItems = fam.itemIds && fam.itemIds.length > 0;
        const hasDialogues = fam.dialogues && fam.dialogues.length > 0;
        const hasNotes = fam.notes && fam.notes.length > 0;

        return `
        <div onclick="app.showFamiliarDetailFloating('${fam.id}')" class="bg-slate-900 border border-slate-700 rounded-lg p-3 relative group shadow-md transition-all duration-300 hover:border-fuchsia-500/70 hover:shadow-fuchsia-900/20 cursor-pointer flex flex-col justify-between min-h-[95px] overflow-hidden">
            
            <div class="z-10">
                <h4 class="font-bold text-fuchsia-400 text-sm truncate mb-1.5 drop-shadow-md" title="${fam.name}">${fam.name}</h4>
                <div class="flex flex-wrap gap-1 overflow-hidden max-h-[40px]">
                    ${famWataks || ''}
                    ${famTags || ''}
                    ${hasExtra ? `<span class="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-700/50 block">+${extraWatakCount + extraTagCount}</span>` : ''}
                    ${(!famWataks && !famTags) ? '<span class="text-[9px] text-slate-600 italic bg-slate-800 px-1.5 py-0.5 rounded">Tanpa Label</span>' : ''}
                </div>
                
                <!-- Indikator Ekstra -->
                <div class="flex gap-1 mt-1">
                    ${hasSkills ? '<span class="text-[9px] text-indigo-400" title="Memiliki Skill">✨</span>' : ''}
                    ${hasItems ? '<span class="text-[9px] text-cyan-400" title="Memiliki Item">🎒</span>' : ''}
                    ${hasDialogues ? '<span class="text-[9px] text-yellow-400" title="Memiliki Dialog">💬</span>' : ''}
                    ${hasNotes ? '<span class="text-[9px] text-amber-400" title="Memiliki Catatan">📝</span>' : ''}
                </div>
            </div>
            
            <!-- Icon Indikator Klik -->
            <div class="absolute bottom-2 right-2 opacity-10 group-hover:opacity-30 transition pointer-events-none">
                <svg class="w-8 h-8 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
            </div>

            <!-- Tombol Aksi Melayang (Kecil di Pojok Kanan Atas) -->
            <div class="absolute top-1.5 right-1.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-20 bg-slate-900/80 p-0.5 rounded backdrop-blur-sm">
                <button onclick="event.stopPropagation(); app.openEditFamiliar('${fam.id}')" class="text-slate-400 hover:text-amber-400 p-1 bg-slate-800 rounded border border-slate-700 transition" title="Edit Familiar">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="event.stopPropagation(); app.deleteFamiliar('${fam.id}')" class="text-slate-400 hover:text-rose-500 p-1 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Familiar">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
        `;
    },


    // ==========================================
    // --- BANTUAN PENCARIAN FAMILIAR ---    
    // ==========================================
    onSearchFamiliarInput(e) {
        app.currentFamiliarFilter = e.target.value;
        this.renderFamiliarGrid();
    },

}