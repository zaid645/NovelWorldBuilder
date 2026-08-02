// Logika render halaman karakter

export const UniverseCharacterShow = {
    // =========================================
    // --- RENDERING TAMPILAN KARAKTER ---
    // =========================================
    toggleCharCard(charId) {
        // Simpan state secara global agar tidak hilang saat re-render
        app.collapsedCharCards = app.collapsedCharCards || {};
        const isCurrentlyCollapsed = app.collapsedCharCards[charId];
        
        // Balikkan state
        app.collapsedCharCards[charId] = !isCurrentlyCollapsed;
        
        // Manipulasi DOM instan tanpa re-render keseluruhan panel
        const bodyEl = document.getElementById(`charBody_${charId}`);
        const watakEl = document.getElementById(`charWatak_${charId}`);
        const toggleIcon = document.getElementById(`charToggleIcon_${charId}`);
        
        if (app.collapsedCharCards[charId]) {
            // Closed (Collapse)
            if(bodyEl) { bodyEl.classList.add('hidden'); bodyEl.classList.remove('flex'); }
            if(watakEl) watakEl.classList.add('watak-collapsed');
            if(toggleIcon) toggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>`;
        } else {
            // Open (Expand)
            if(bodyEl) { bodyEl.classList.remove('hidden'); bodyEl.classList.add('flex'); }
            if(watakEl) watakEl.classList.remove('watak-collapsed');
            if(toggleIcon) toggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>`;
        }
    },

    renderCharactersArea(universe) {
        const daftarWatak = app.data.watakList || [];
        const catDescriptions = universe.charactersCategoryDescriptions || {};

        let html = `
        <style>
            /* Limit traits display when character card is collapsed (Max 3 items shown) */
            .watak-collapsed > span:nth-child(n+4) { display: none !important; }
        </style>
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
            const desc = catDescriptions[category] || "";
            
            html += `
                <div class="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-sm">
                    <div class="bg-slate-800 p-3 flex flex-col cursor-pointer hover:bg-slate-750 transition-colors" onclick="app.togglePanel('cat_${safeCat}')">
                        <div class="flex justify-between items-center">
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
                        ${desc ? `<p class="text-[11px] text-slate-400 mt-2 pl-6 leading-relaxed italic border-l-2 border-slate-600/50 ml-1">${desc}</p>` : ''}
                    </div>

                    <div id="cat_${safeCat}" class="p-3 space-y-4 ${this.getPanelClass('cat_' + safeCat)}">                                
                        
                        <!-- Panel Editor (Notes dan Dialog telah dipindahkan) -->
                        <div id="addChar_${safeCat}" class="${this.getPanelClass('addChar_' + safeCat)} bg-slate-800 border border-slate-600 p-4 rounded-lg mb-4 shadow-inner">
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
                                <div class="bg-slate-900 border border-slate-600 rounded p-2 max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
                                <textarea id="newBg_${safeCat}" placeholder="Ketik draf latar belakang..." class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500" rows="8"></textarea>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between items-end mb-1">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Penampilan</label>
                                    <button id="btnAiApp_${safeCat}" onclick="app.generateCharAI('${universe.id}', '${safeCat}', 'appearance')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1">✨ AI Generatif</button>
                                </div>
                                <textarea id="newApp_${safeCat}" placeholder="Ketik draf rupa/pakaian..." class="bg-slate-900 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500" rows="8"></textarea>
                            </div>

                            <div class="space-y-4 mb-4">
                            
                                <!-- Skill Khusus -->
                                <div>
                                    <div class="flex justify-between items-center mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Skill Khusus</label>
                                    </div>
                                    <!-- Kotak Pencarian Skill di dalam Form Karakter -->
                                    <div class="mb-2 relative">
                                        <input type="text" 
                                            id="charSkillSearch_${safeCat}" 
                                            value="${app.currentSkillFilter || ''}"
                                            placeholder="Cari & Filter Skill..." 
                                            oninput="app.onCharSkillSearchInput(event, '${universe.id}', '${category}')"
                                            class="bg-slate-950 border border-slate-700 rounded p-2 text-xs w-full focus:border-indigo-500 outline-none text-slate-300">
                                    </div>
                                    
                                    <!-- Container yang akan dirender otomatis oleh JavaScript -->
                                    <div id="charSkillList_${safeCat}" class="bg-slate-900 border border-slate-600 rounded p-2 max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <!-- Dirender via app.renderCharSkillCheckboxes() -->
                                    </div>
                                </div>

                                <!-- Item Bawaan -->
                                <div>
                                    <div class="flex justify-between items-center mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Item Bawaan</label>
                                    </div>
                                    <!-- Input Search Item -->
                                    <div class="mb-2 relative">
                                        <input type="text" 
                                            id="charItemSearch_${safeCat}" 
                                            value="${app.currentItemFilter || ''}"
                                            placeholder="Cari & Filter Item..." 
                                            oninput="app.onCharItemSearchInput(event, '${universe.id}', '${category}')"
                                            class="bg-slate-950 border border-slate-700 rounded p-2 text-xs w-full focus:border-cyan-500 outline-none text-slate-300">
                                    </div>
                                    
                                    <!-- Container Checkbox Item -->
                                    <div id="charItemList_${safeCat}" class="bg-slate-900 border border-slate-600 rounded p-2 max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <!-- Dirender via app.renderCharItemCheckboxes() -->
                                    </div>
                                </div>

                                <!-- Familiar / Pet -->
                                <div>
                                    <div class="flex justify-between items-center mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Familiar / Pet</label>
                                    </div>
                                    <!-- Input Search Familiar -->
                                    <div class="mb-2 relative">
                                        <input type="text" 
                                            id="charFamiliarSearch_${safeCat}" 
                                            value="${app.currentFamiliarFilter || ''}"
                                            placeholder="Cari & Filter Familiar/Pet..." 
                                            oninput="app.onCharFamiliarSearchInput(event, '${universe.id}', '${category}')"
                                            class="bg-slate-950 border border-slate-700 rounded p-2 text-xs w-full focus:border-fuchsia-500 outline-none text-slate-300">
                                    </div>
                                    
                                    <!-- Container Checkbox Familiar -->
                                    <div id="charFamiliarList_${safeCat}" class="bg-slate-900 border border-slate-600 rounded p-2 max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <!-- Dirender via app.renderCharFamiliarCheckboxes() -->
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
                            ${universe.characters[category].map((c, index) => this.renderCharacterCard(c, category, index)).join('')}
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

    renderCharacterCard(char, category, index) {
        // Cek Status Collapse Global
        app.collapsedCharCards = app.collapsedCharCards || {};
        if (app.collapsedCharCards[char.id] === undefined) {
            app.collapsedCharCards[char.id] = true;
        }
        const isCollapsed = app.collapsedCharCards[char.id] === true;

        const masterWatakList = app.data.watakList || [];
        let parsedWataks = [];
        
        if (Array.isArray(char.personality)) {
            parsedWataks = char.personality;
        } else if (typeof char.personality === 'string' && char.personality.trim() !== '') {
            parsedWataks = char.personality.split(',').map(s => s.trim());
        }

        const charWataks = parsedWataks.map(w => {
            const isValid = masterWatakList.some(master => master.toLowerCase() === w.toLowerCase());
            return isValid 
                ? `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700/50 font-medium whitespace-nowrap mb-1">${w}</span>`
                : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 font-medium line-through mb-1" title="Watak dihapus dari Master">Invalid</span>`;
        }).join(' ');

        // Relasi Skill, Item, Familiar
        const charSkills = (char.skillIds || []).map(id => {
            const skill = this.data.skills.find(s => s.id === id);
            return skill ? `<span class="bg-indigo-900/50 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700 font-medium">${skill.name}</span>` : '';
        }).join(' ');
        
        const charItems = (char.itemIds || []).map(id => {
            const item = this.data.items.find(i => i.id === id);
            return item ? `<span class="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700 font-medium">${item.name}</span>` : '';
        }).join(' ');
        
        const charFamiliars = (char.familiarIds || []).map(id => {
            const fam = this.data.familiars.find(f => f.id === id);
            return fam ? `<span class="bg-fuchsia-900/50 text-fuchsia-300 text-[10px] px-2 py-0.5 rounded border border-fuchsia-700 font-medium">${fam.name}</span>` : '';
        }).join('');

        // Map Catatan 
        const notesHtml = (char.notes || []).map((note, index) => `
            <li class="flex justify-between items-start text-xs text-slate-300 border-l-2 border-amber-500/50 pl-2 py-1 group/note bg-slate-800/30 rounded-r">
                <span class="flex-1 leading-relaxed whitespace-pre-wrap">${note}</span>
                <button onclick="app.deleteNote('${this.currentView}', '${category}', '${char.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/note:opacity-100 ml-2 px-1 transition" title="Hapus catatan ini">
                    &times;
                </button>
            </li>
        `).join('');

        // Map Dialog
        const dialoguesHtml = (char.dialogues || []).map((dlg, index) => `
            <li class="flex justify-between items-start text-xs italic text-slate-300 border-l-2 border-indigo-500/50 pl-2 py-1 group/dlg bg-slate-800/30 rounded-r">
                <span class="flex-1 leading-relaxed">${dlg}</span>
                <button onclick="app.deleteDialogue('${this.currentView}', '${category}', '${char.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/dlg:opacity-100 ml-2 px-1 transition" title="Hapus dialog ini">
                    &times;
                </button>
            </li>
        `).join('');

        return `
        <div id="charCard_${char.id}" class="bg-slate-900 border border-slate-700 rounded-lg p-4 relative group flex flex-col hover:border-indigo-500/50 transition-colors shadow-md">
            
                <div class="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition bg-slate-900 pl-2 rounded shadow-sm z-10">
                    ${index > 0 ? `
                    <button onclick="app.moveCharacterUp('${this.currentView}', '${category}', '${char.id}')" class="text-slate-400 hover:text-indigo-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Naikkan Urutan">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="app.toggleCharCard('${char.id}')" class="text-slate-400 hover:text-white p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Toggle Tampilan">
                    <svg id="charToggleIcon_${char.id}" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${isCollapsed ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>'}
                    </svg>
                </button>
                <button onclick="app.openEditCharacter('${this.currentView}', '${category}', '${char.id}')" class="text-slate-400 hover:text-amber-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Edit Info Utama Tokoh">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="app.deleteCharacter('${this.currentView}', '${category}', '${char.id}')" class="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Tokoh">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <button onclick="app.moveCharacterToCategory('${this.currentView}', '${category}', '${char.id}')" class="text-slate-400 hover:text-indigo-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Pindahkan Kategori">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                </button>
            </div>

            <!-- HEADER KLIKABLE UNTUK TOGGLE SHOW/CLOSED -->
            <div class="border-b border-slate-700/50 pb-2 mb-2 cursor-pointer" onclick="app.toggleCharCard('${char.id}')">
                <h4 class="font-bold text-indigo-400 text-lg mb-1 pr-24">${char.name}</h4>
                <div id="charWatak_${char.id}" class="flex flex-wrap gap-1 ${isCollapsed ? 'watak-collapsed' : ''}">${charWataks || '<span class="text-[10px] text-slate-500 italic bg-slate-800 px-2 py-0.5 rounded">Belum ada Watak</span>'}</div>
            </div>

            <!-- BODY COLLAPSIBLE -->
            <div id="charBody_${char.id}" class="${isCollapsed ? 'hidden' : 'flex flex-col md:flex-row gap-6'}">
                <div class="flex-1 space-y-3 pr-0 md:pr-4">
                    <div class="grid grid-cols-1 gap-2">
                        <div class="text-[13px] text-slate-300"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Latar Belakang:</span> <span class="leading-relaxed whitespace-pre-wrap">${char.background || '-'}</span></div>
                        <div class="text-[13px] text-slate-300 pt-1.5"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Rupa / Penampilan:</span> <span class="leading-relaxed whitespace-pre-wrap">${char.appearance || '-'}</span></div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-800/80">
                        <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">Catatan Karakter:</span>
                        <ul class="space-y-1 mb-2">
                            ${notesHtml || '<li class="text-[11px] text-slate-500 italic">Belum ada catatan.</li>'}
                        </ul>
                        
                        <div class="flex items-start space-x-1.5 pt-1">
                            <textarea id="newNote_${char.id}" placeholder="Ketik catatan tambahan... (Tekan Enter)" rows="2" class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500 transition resize-none" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); app.addNote('${this.currentView}', '${category}', '${char.id}'); }"></textarea>
                            <button onclick="app.addNote('${this.currentView}', '${category}', '${char.id}')" class="bg-amber-600/80 hover:bg-amber-500 text-white px-2.5 py-1.5 rounded text-[11px] transition shadow-sm h-[34px] flex items-center font-bold">+</button>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-800/80">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">Contoh Dialog / Kutipan:</span>
                            <button id="btnAiDlgCard_${char.id}" onclick="app.generateCharDialogueAI('${this.currentView}', '${category}', '${char.id}')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1">✨ AI Dialog</button>
                        </div>
                        <ul class="space-y-1 mb-2">
                            ${dialoguesHtml || '<li class="text-[11px] text-slate-500 italic">Belum ada dialog.</li>'}
                        </ul>
                        
                        <div class="flex items-center space-x-1.5 pt-1">
                            <input type="text" id="newDlg_${char.id}" placeholder="Ketik contoh kutipan... (Tekan Enter)" class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 transition" onkeydown="if(event.key === 'Enter') app.addDialogue('${this.currentView}', '${category}', '${char.id}')">
                            <button onclick="app.addDialogue('${this.currentView}', '${category}', '${char.id}')" class="bg-indigo-600/80 hover:bg-indigo-500 text-white px-2 py-1.5 rounded text-[10px] transition shadow-sm h-[34px] flex items-center font-bold">+</button>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-1/3 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <div>
                        <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Skill Dimiliki:</span>
                        <div class="flex flex-wrap gap-1">${charSkills || '<span class="text-[10px] text-slate-600 italic">Kosong</span>'}</div>
                    </div>
                    <div class="pt-2 border-t border-slate-800/50">
                        <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Item Bawaan:</span>
                        <div class="flex flex-wrap gap-1">${charItems || '<span class="text-[10px] text-slate-600 italic">Kosong</span>'}</div>
                    </div>
                    <div class="pt-2 border-t border-slate-800/50">
                        <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Familiar / Pet:</span>
                        <div class="flex flex-wrap gap-1">${charFamiliars || '<span class="text-[10px] text-slate-600 italic">Kosong</span>'}</div>
                    </div>
                </div>
            </div>

        </div>
        `;
    }
}