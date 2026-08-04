import { ArcInfoFormContext } from './ArcInfoFormContext.js';

// Modul UI Arc & Konteks Arc (Terintegrasi dalam MainScript.js)
export const ArcInfoShow = {
    // State internal untuk manajemen penulisan/pengeditan data
    editArcId: null,
    editSubarcId: null,
    
    // State internal untuk Panel Konteks Arc
    activeArcContextId: null, 
    activeContextTab: 'character', // 'character' | 'location' | 'universe'
    charSearchQuery: '',
    locSearchQuery: '',

    // State tambahan untuk konfirmasi hapus
    deleteArcIdConfirm: null,
    deleteSubarcIdConfirm: null,

    /**
     * Memanggil fungsi notifikasi/alert terpusat melalui app
     */
    showNotification(title, message, type = 'info', onConfirmCallback = null) {
        if (typeof app !== 'undefined') {
            // Cek agar app.showNotification tidak memanggil fungsi ini secara berulang
            if (typeof app.showNotification === 'function' && 
                app.showNotification !== this.showNotification && 
                app.showNotification !== ArcInfoShow.showNotification) {
                
                app.showNotification(title, message, type, onConfirmCallback);
                return;
            } 
            
            if (typeof app.showAlert === 'function') {
                app.showAlert(message, type);
                return;
            }
        }

        // Fallback bawaan browser jika modul UI notifikasi tidak ditemukan
        alert(`${title ? title + ': ' : ''}${message}`);
    },

    // Memastikan data pada ArcInfoFormContext selalu sinkron
    syncContextData() {
        if (typeof ArcInfoFormContext !== 'undefined') {
            ArcInfoFormContext.data = this.data;
        }
    },

    // =========================================
    // --- RENDER VIEW UTAMA (VIEW LAYOUT) ---
    // =========================================
    renderArcsView() {
        if (!this.data.arcs) this.data.arcs = [];
        this.syncContextData();

        if (!this.activeArcContextId && this.data.arcs.length > 0) {
            this.activeArcContextId = this.data.arcs[0].id;
        }

        return `
            <div class="flex flex-col gap-6">
                <!-- BAR PENCARIAN UTAMA & EXPORT -->
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row gap-3 shadow-md justify-between items-center">
                    <div class="relative w-full md:w-3/4">
                        <input type="text" id="arcSearchInput" placeholder="Cari arc atau sub-arc..." 
                            class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 pl-10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            oninput="app.refreshArcList()">
                        <svg class="w-4 h-4 absolute left-3 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    
                    <button onclick="app.exportArcsData()" class="w-full md:w-auto bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 px-4 py-2.5 rounded text-xs transition font-medium flex items-center justify-center gap-2 whitespace-nowrap">
                        <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Export Data Arc
                    </button>
                </div>

                <!-- PANEL PENGATURAN KONTEKS AI -->
                ${this.renderContextPanel()}

                <!-- FORM TAMBAH ARC BARU -->
                <div id="addArcForm" class="hidden bg-slate-800 border border-slate-700 p-4 rounded-lg space-y-3 shadow-lg">
                    <div class="flex justify-between items-center mb-1">
                        <h3 id="arcFormTitle" class="text-sm font-bold text-slate-200">Buat Arc Cerita Baru</h3>
                        <button id="btnEnchantArc" onclick="app.enchantArcForm()" class="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ Enchant Sinopsis
                        </button>
                    </div>
                    
                    <div class="flex gap-2 mb-1">
                        <input type="text" id="newArcName" placeholder="Nama Arc Cerita (cth: Arc Invasi Semesta)" class="bg-slate-900 border border-slate-700 rounded p-2 text-sm w-2/3 text-slate-200 focus:outline-none focus:border-indigo-500">
                        <input type="number" id="newArcTarget" placeholder="Target Sub-arc" class="w-1/3 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" min="1" title="Target Jumlah Total Sub-arc">
                    </div>

                    <textarea id="newArcSyn" placeholder="Sinopsis Singkat Arc..." class="bg-slate-900 border border-slate-700 rounded p-2 text-sm w-full focus:outline-none focus:border-indigo-500" rows="5"></textarea>
                    
                    <div class="flex justify-end space-x-2 mt-2">
                        <button onclick="app.setPanelState('addArcForm', false)" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition">Batal</button>
                        <button id="saveArcBtn" onclick="app.saveArc()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition">Simpan Arc</button>
                    </div>
                </div>

                <!-- DAFTAR ARC -->
                <div id="arcListContainer" class="space-y-4">
                    ${this.renderArcList('')}
                </div>
            </div>
        `;
    },

    // =========================================================================
    // --- RENDER PANEL KONTEKS ---
    // =========================================================================

    renderContextPanel() {
        this.syncContextData();

        if (!this.data || !this.data.arcs || this.data.arcs.length === 0) {
            return `
                <div id="arcContextPanel" class="bg-slate-800/60 border border-slate-700/80 p-4 rounded-lg text-center text-xs text-slate-400 italic">
                    Buat Arc cerita terlebih dahulu untuk mulai memilih Tokoh, Lokasi, dan Semesta secara dinamis.
                </div>
            `;
        }

        const activeArc = this.data.arcs.find(a => a.id === this.activeArcContextId) || this.data.arcs[0];
        if (activeArc && this.activeArcContextId !== activeArc.id) {
            this.activeArcContextId = activeArc.id;
        }

        const arcId = activeArc.id;
        const selectedDetails = ArcInfoFormContext.getSelectedContextDetails(arcId);
        
        // Cek status toggle panel (apakah disembunyikan/ditampilkan)
        const panelClass = this.getPanelClass ? this.getPanelClass('arcContextPanelContent', 'hidden') : '';

        return `
            <div id="arcContextPanel" class="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                <!-- Header Panel (Klik untuk Hide/Show) -->
                <div class="bg-slate-700/40 p-3 border-b border-slate-700 flex justify-between items-center cursor-pointer select-none hover:bg-slate-700/60 transition"
                     onclick="app.togglePanel('arcContextPanelContent')">
                    
                    <div class="flex items-center gap-2" onclick="event.stopPropagation()">
                        <span class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                            🎯 Pilihan Konteks Dinamis:
                        </span>
                        <select onchange="app.setActiveArcContext(this.value)" class="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:border-indigo-500">
                            ${this.data.arcs.map(a => `<option value="${a.id}" ${a.id === arcId ? 'selected' : ''}>${a.name}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Tombol / Icon Panah Toggle -->
                    <div class="flex items-center gap-1 text-slate-400 hover:text-slate-200">
                        <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                <!-- Pembungkus Konten Panel yang Dapat Disembunyikan -->
                <div id="arcContextPanelContent" class="${panelClass}">
                    <!-- Navigasi Tab Sub-Panel -->
                    <div class="flex border-b border-slate-700 bg-slate-900/50">
                        <button onclick="app.setContextTab('character')" class="flex-1 py-2 text-xs font-semibold transition border-b-2 flex justify-center items-center gap-1.5 ${this.activeContextTab === 'character' ? 'border-indigo-500 text-indigo-400 bg-slate-800/80' : 'border-transparent text-slate-400 hover:text-slate-200'}">
                            👤 Karakter & Monster
                        </button>
                        <button onclick="app.setContextTab('location')" class="flex-1 py-2 text-xs font-semibold transition border-b-2 flex justify-center items-center gap-1.5 ${this.activeContextTab === 'location' ? 'border-emerald-500 text-emerald-400 bg-slate-800/80' : 'border-transparent text-slate-400 hover:text-slate-200'}">
                            📍 Lokasi (Individu)
                        </button>
                        <button onclick="app.setContextTab('universe')" class="flex-1 py-2 text-xs font-semibold transition border-b-2 flex justify-center items-center gap-1.5 ${this.activeContextTab === 'universe' ? 'border-purple-500 text-purple-400 bg-slate-800/80' : 'border-transparent text-slate-400 hover:text-slate-200'}">
                            🌌 Semesta & Lore
                        </button>
                    </div>

                    <!-- Konten Sub-Panel Sesuai Tab Aktif -->
                    <div id="contextSubPanelContent" class="p-3">
                        ${this.renderActiveSubPanel(arcId, selectedDetails)}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderActiveSubPanel(arcId, selectedDetails) {
        if (this.activeContextTab === 'character') {
            return this.renderCharacterSubPanel(arcId, selectedDetails.characters || []);
        } else if (this.activeContextTab === 'location') {
            return this.renderLocationSubPanel(arcId, selectedDetails.locations || []);
        } else {
            return this.renderUniverseSubPanel(arcId, selectedDetails.universes || []);
        }
    },

    // SUB-PANEL 1: KARAKTER
    renderCharacterSubPanel(arcId, selectedChars) {
        this.syncContextData();
        const searchResults = ArcInfoFormContext.searchCharacters(this.charSearchQuery);
        const selectedIds = selectedChars.map(c => c.id);

        return `
            <div class="space-y-3">
                <div class="relative">
                    <input type="text" id="charSearchInput" placeholder="Cari nama tokoh/monster..." value="${this.charSearchQuery}"
                        oninput="app.onCharSearchInput(this.value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded p-2 pl-8 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
                    <svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="bg-slate-900/80 border border-slate-700/60 rounded p-2 max-h-48 overflow-y-auto space-y-1.5">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Opsi Hasil Pencarian (${searchResults.length}):</span>
                        ${searchResults.length === 0 ? '<p class="text-[11px] text-slate-500 italic p-1">Tidak ada karakter ditemukan.</p>' : searchResults.map(char => `
                            <label class="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition text-xs select-none">
                                <input type="checkbox" ${selectedIds.includes(char.id) ? 'checked' : ''} 
                                    onchange="app.toggleContextCheck('${arcId}', 'character', '${char.id}')"
                                    class="rounded bg-slate-800 border-slate-600 text-indigo-600 focus:ring-0">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-slate-200 truncate">${char.name} <span class="text-[9px] text-slate-500">(${char.universeName || 'Semesta'})</span></div>
                                </div>
                            </label>
                        `).join('')}
                    </div>

                    <div class="bg-slate-900/80 border border-slate-700/60 rounded p-2 max-h-48 overflow-y-auto space-y-1.5">
                        <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Daftar Terpilih (${selectedChars.length}):</span>
                        ${selectedChars.length === 0 ? '<p class="text-[11px] text-slate-500 italic p-1">Belum ada karakter yang dicentang.</p>' : selectedChars.map(char => `
                            <div class="bg-slate-800/90 border border-slate-700 p-2 rounded text-[11px] flex justify-between items-start gap-2">
                                <div class="min-w-0">
                                    <div class="font-bold text-indigo-300 truncate">${char.name} <span class="text-[9px] text-slate-500 font-normal">(${char.universeName || 'Semesta'})</span></div>
                                    <div class="text-[9px] text-slate-400 truncate">${char.personality || char.background || 'Tanpa deskripsi'}</div>
                                </div>
                                <button onclick="app.toggleContextCheck('${arcId}', 'character', '${char.id}', false)" class="text-slate-500 hover:text-rose-400 text-xs font-bold">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // SUB-PANEL 2: LOKASI
    renderLocationSubPanel(arcId, selectedLocs) {
        this.syncContextData();
        const searchResults = ArcInfoFormContext.searchLocations(this.locSearchQuery);
        const selectedIds = selectedLocs.map(l => l.id);

        return `
            <div class="space-y-3">
                <div class="relative">
                    <input type="text" id="locSearchInput" placeholder="Cari nama lokasi individu..." value="${this.locSearchQuery}"
                        oninput="app.onLocSearchInput(this.value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded p-2 pl-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
                    <svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="bg-slate-900/80 border border-slate-700/60 rounded p-2 max-h-48 overflow-y-auto space-y-1.5">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Opsi Hasil Pencarian (${searchResults.length}):</span>
                        ${searchResults.length === 0 ? '<p class="text-[11px] text-slate-500 italic p-1">Tidak ada lokasi ditemukan.</p>' : searchResults.map(loc => `
                            <label class="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition text-xs select-none">
                                <input type="checkbox" ${selectedIds.includes(loc.id) ? 'checked' : ''} 
                                    onchange="app.toggleContextCheck('${arcId}', 'location', '${loc.id}')"
                                    class="rounded bg-slate-800 border-slate-600 text-emerald-600 focus:ring-0">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-slate-200 truncate">${loc.name}</div>
                                    <div class="text-[9px] text-slate-500 truncate">${loc.path}</div>
                                </div>
                            </label>
                        `).join('')}
                    </div>

                    <div class="bg-slate-900/80 border border-slate-700/60 rounded p-2 max-h-48 overflow-y-auto space-y-1.5">
                        <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Daftar Terpilih (${selectedLocs.length}):</span>
                        ${selectedLocs.length === 0 ? '<p class="text-[11px] text-slate-500 italic p-1">Belum ada lokasi yang dicentang.</p>' : selectedLocs.map(loc => `
                            <div class="bg-slate-800/90 border border-slate-700 p-2 rounded text-[11px] flex justify-between items-start gap-2">
                                <div class="min-w-0">
                                    <div class="font-bold text-emerald-300 truncate">${loc.name}</div>
                                    <div class="text-[9px] text-slate-400 truncate">${loc.path}</div>
                                </div>
                                <button onclick="app.toggleContextCheck('${arcId}', 'location', '${loc.id}', false)" class="text-slate-500 hover:text-rose-400 text-xs font-bold">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // SUB-PANEL 3: SEMESTA
    renderUniverseSubPanel(arcId, selectedUnivs) {
        this.syncContextData();
        const allUnivs = ArcInfoFormContext.getNormalizedUniverses();
        const selectedIds = selectedUnivs.map(u => u.id);

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-slate-900/80 border border-slate-700/60 rounded p-2 max-h-48 overflow-y-auto space-y-1.5">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Daftar Semesta Cerita (${allUnivs.length}):</span>
                    ${allUnivs.length === 0 ? '<p class="text-[11px] text-slate-500 italic p-1">Belum ada semesta terdaftar.</p>' : allUnivs.map(univ => `
                        <label class="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer transition text-xs select-none">
                            <input type="checkbox" ${selectedIds.includes(univ.id) ? 'checked' : ''} 
                                onchange="app.toggleContextCheck('${arcId}', 'universe', '${univ.id}')"
                                class="rounded bg-slate-800 border-slate-600 text-purple-600 focus:ring-0">
                            <span class="font-medium text-slate-200">${univ.name}</span>
                        </label>
                    `).join('')}
                </div>

                <div class="bg-slate-900/80 border border-slate-700/60 rounded p-2 max-h-48 overflow-y-auto space-y-2">
                    <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">Lore Diterapkan Ke AI (${selectedUnivs.length}):</span>
                    ${selectedUnivs.length === 0 ? '<p class="text-[11px] text-slate-500 italic p-1">Centang semesta untuk menyertakan lorenya.</p>' : selectedUnivs.map(univ => `
                        <div class="bg-slate-800/90 border border-slate-700 p-2 rounded text-[11px] space-y-1 relative">
                            <button onclick="app.toggleContextCheck('${arcId}', 'universe', '${univ.id}', false)" class="absolute top-1 right-1.5 text-slate-500 hover:text-rose-400 text-xs font-bold">&times;</button>
                            <div class="font-bold text-purple-300 pr-4">${univ.name}</div>
                            <p class="text-slate-400 text-[10px] leading-relaxed line-clamp-2">${univ.description || 'Tanpa deskripsi'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // =========================================
    // --- RENDER DAFTAR KARTU DATA ARC ---
    // =========================================
    renderArcList(query = '') {
        if (!this.data.arcs) this.data.arcs = [];
        const q = query.toLowerCase().trim();

        const filteredArcs = this.data.arcs.filter(arc => {
            const matchArc = arc.name.toLowerCase().includes(q) || (arc.synopsis || '').toLowerCase().includes(q);
            const matchSub = arc.subarcs && arc.subarcs.some(sub => sub.name.toLowerCase().includes(q) || (sub.description || '').toLowerCase().includes(q));
            return matchArc || matchSub;
        });

        if (filteredArcs.length === 0) {
            return `
                <p class="text-sm text-slate-500 italic text-center py-8 bg-slate-800/30 rounded-lg border border-slate-800">Tidak ada data arc cerita yang ditemukan.</p>
                <button onclick="app.openAddArc()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition mt-3 flex items-center justify-center gap-1 shadow-md">
                    + Tambah Arc Baru
                </button>
            `;
        }

        let html = filteredArcs.map((arc, index) => {
            const arcNumber = index + 1;
            const panelClass = this.getPanelClass ? this.getPanelClass(`arcContent_${arc.id}`, 'hidden') : 'hidden';

            const subarcsHTML = (!arc.subarcs || arc.subarcs.length === 0) 
                ? '<p class="text-xs text-slate-500 italic p-1">Belum ada data sub-arc di arc ini.</p>' 
                : arc.subarcs.map((sub, sIndex) => {
                    const isFirst = sIndex === 0;
                    const isLast = sIndex === arc.subarcs.length - 1;

                    if (this.editSubarcId === sub.id) {
                        return `
                            <div class="bg-slate-900 border-l-2 border-amber-500 p-3 rounded space-y-3 shadow-inner my-2">
                                <div class="flex justify-between items-center pb-1.5 border-b border-slate-800">
                                    <h5 class="text-xs font-bold text-amber-400 flex items-center gap-1">✏️ Edit Sub-arc #${sIndex + 1}</h5>
                                    <button id="btnEnchantSubarc_inline_${arc.id}_${sub.id}" onclick="app.enchantSubarcFormInline('${arc.id}', '${sub.id}')" 
                                        class="text-[9px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-0.5 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                        ✨ Enchant / Tulis AI
                                    </button>
                                </div>
                                <div class="space-y-2">
                                    <input type="text" id="editSubarcName_${arc.id}_${sub.id}" value="${sub.name}" placeholder="Judul Sub-arc" 
                                        class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500">
                                    <textarea id="editSubarcDesc_${arc.id}_${sub.id}" placeholder="Ketik rincian alur kejadian..." 
                                        class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500" rows="15">${sub.description || ''}</textarea>
                                </div>
                                <div class="flex justify-end space-x-1.5 pt-1">
                                    <button onclick="app.cancelEditSubarc()" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition">Batal</button>
                                    <button onclick="app.saveSubarcInline('${arc.id}', '${sub.id}')" class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] transition font-medium">Simpan Perubahan</button>
                                </div>
                            </div>
                        `;
                    }

                    return `
                        <div class="bg-slate-900 border-l-2 border-amber-500 p-2.5 pl-3 relative group/sub rounded">
                            <div class="absolute top-2.5 right-2 flex space-x-1 opacity-0 group-hover/sub:opacity-100 transition items-center bg-slate-900/90 px-1 py-0.5 rounded backdrop-blur-sm border border-slate-800">
                                ${!isFirst ? `<button onclick="app.moveSubarcUp('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400 p-0.5 transition" title="Naikkan"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button>` : ''}
                                ${!isLast ? `<button onclick="app.moveSubarcDown('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400 p-0.5 transition" title="Turunkan"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>` : ''}
                                <button onclick="app.openEditSubarc('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400 p-0.5 transition" title="Edit"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                <button onclick="app.deleteSubarc('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-rose-500 text-sm font-bold leading-none p-0.5 transition" title="Hapus">&times;</button>
                            </div>
                            <h5 class="text-xs font-bold text-amber-400 mb-1 flex items-center flex-wrap gap-1 pr-16">
                                ${sIndex + 1}. ${sub.name}
                            </h5>
                            <p class="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">${sub.description || '-'}</p>
                        </div>
                    `;
                }).join('');

            return `
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-md">
                    <div class="p-3 bg-slate-700/30 flex justify-between items-center cursor-pointer select-none hover:bg-slate-700/50 transition" 
                         onclick="app.togglePanel('arcContent_${arc.id}')">
                        <div class="flex items-center space-x-2.5">
                            <span class="bg-indigo-950 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded border border-indigo-800/80">#${arcNumber}</span>
                            <h4 class="font-bold text-slate-200 text-sm md:text-base">${arc.name}</h4>
                        </div>
                        <!-- BARIS TOMBOL -->
                        <div class="flex items-center space-x-3" onclick="event.stopPropagation()">
                            <button onclick="app.exportSingleArc('${arc.id}', 'json')" class="text-slate-400 hover:text-amber-400 transition" title="Export JSON"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>
                            <button onclick="app.exportSingleArc('${arc.id}', 'md')" class="text-slate-400 hover:text-emerald-400 transition" title="Export Markdown"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></button>
                            <button onclick="app.openEditArc('${arc.id}')" class="text-slate-400 hover:text-indigo-400 transition" title="Edit"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                            <button onclick="app.deleteArc('${arc.id}')" class="text-slate-400 hover:text-rose-500 transition" title="Hapus Arc"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                            <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div id="arcContent_${arc.id}" class="p-4 space-y-4 border-t border-slate-700/60 ${panelClass}">
                        <div>
                            <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Sinopsis Global Arc:</span>
                            <p class="text-xs text-slate-300 whitespace-pre-wrap bg-slate-900/40 p-2.5 rounded border border-slate-700/40">${arc.synopsis || '<span class="italic text-slate-600">Belum ada ringkasan sinopsis untuk lini cerita ini.</span>'}</p>
                        </div>

                        <div class="border-t border-slate-700/60 pt-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Daftar Plot Detail (${arc.subarcs ? arc.subarcs.length : 0} / ${arc.targetSubarcCount || '?'}):</span>
                            </div>

                            <div class="space-y-2 mb-3">${subarcsHTML}</div>

                            <button onclick="app.openAddSubarc('${arc.id}')" class="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded text-xs font-semibold transition mt-2 mb-3 flex items-center justify-center gap-1 shadow border border-amber-700/50">
                                + Tambah Sub-arc
                            </button>

                            <div id="subarcForm_${arc.id}" class="hidden bg-slate-900 p-3 rounded border border-slate-700 mt-2 space-y-3 shadow-inner">
                                <h5 id="subarcFormTitle_${arc.id}" class="text-xs font-bold text-slate-300 border-b border-slate-700/50 pb-1.5 mb-2">Tambah Sub-arc</h5>
                                <input type="text" id="newSubarcName_${arc.id}" placeholder="Judul Sub-arc" class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500">
                                
                                <div class="flex justify-between items-end pb-1 border-b border-slate-700/40 mt-1">
                                    <span class="text-[10px] text-slate-500">Rincian Narasi/Kejadian:</span>
                                    <button id="btnEnchantSubarc_${arc.id}" onclick="app.enchantSubarcForm('${arc.id}')" class="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                        ✨ Auto-Tulis / Enchant Sub-arc
                                    </button>
                                </div>

                                <textarea id="newSubarcDesc_${arc.id}" placeholder="Ketik rincian alur kejadian secara manual..." class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500" rows="15"></textarea>
                                
                                <div class="flex justify-end space-x-1.5">
                                    <button onclick="app.setPanelState('subarcForm_${arc.id}', false)" class="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-300 transition">Batal</button>
                                    <button id="saveSubarcBtn_${arc.id}" onclick="app.saveSubarc('${arc.id}')" class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] transition font-medium">Simpan Data Sub-arc</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        html += `
            <button onclick="app.openAddArc()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition mt-2 flex items-center justify-center gap-1.5 shadow-lg border border-indigo-700/50">
                + Tambah Arc Baru
            </button>
        `;

        return html;
    },

    // =========================================
    // --- HANDLER EVENT & RE-RENDER PARSIAL ---
    // =========================================
    
    refreshArcMenuView() {
        const container = document.getElementById('content') || document.getElementById('viewContainer') || document.getElementById('mainContent');
        if (container) {
            container.innerHTML = this.renderArcsView();
        } else if (typeof app !== 'undefined' && typeof app.render === 'function') {
            app.render();
        }
    },

    /**
     * Memperbarui seluruh panel konteks (termasuk tab navigasi & dropdown) tanpa menyentuh bagian lain
     */
    refreshContextPanel() {
        const panel = document.getElementById('arcContextPanel');
        if (panel) {
            panel.outerHTML = this.renderContextPanel();
        } else {
            this.refreshArcMenuView();
        }
    },

    /**
     * Memperbarui hanya isi dari sub-panel konteks (area daftar pencarian & item terpilih)
     */
    refreshContextSubPanelOnly() {
        const subPanelContainer = document.getElementById('contextSubPanelContent');
        if (subPanelContainer && this.activeArcContextId) {
            this.syncContextData();
            const activeArc = this.data.arcs.find(a => a.id === this.activeArcContextId) || this.data.arcs[0];
            const selectedDetails = ArcInfoFormContext.getSelectedContextDetails(activeArc.id);

            subPanelContainer.innerHTML = this.renderActiveSubPanel(activeArc.id, selectedDetails);
        } else {
            this.refreshContextPanel();
        }
    },

    setContextTab(tabName) {
        if (this.activeContextTab === tabName) return;
        this.activeContextTab = tabName;
        this.refreshContextPanel();
    },

    setActiveArcContext(arcId) {
        this.activeArcContextId = arcId;
        
        // Reset query pencarian agar tidak menyaring hasil di Arc baru
        this.charSearchQuery = '';
        this.locSearchQuery = '';

        this.refreshContextPanel();
    },

    onCharSearchInput(query) {
        this.charSearchQuery = query;
        this.refreshContextSubPanelOnly();
        
        const input = document.getElementById('charSearchInput');
        if (input) {
            input.focus();
            input.setSelectionRange(query.length, query.length);
        }
    },

    onLocSearchInput(query) {
        this.locSearchQuery = query;
        this.refreshContextSubPanelOnly();
        
        const input = document.getElementById('locSearchInput');
        if (input) {
            input.focus();
            input.setSelectionRange(query.length, query.length);
        }
    },

    toggleContextCheck(arcId, type, itemId, forceState = null) {
        this.syncContextData();
        ArcInfoFormContext.toggleContextItem(arcId, type, itemId, forceState);
        this.refreshContextSubPanelOnly();
    },

    deleteArc(arcId) {
        if (typeof app !== 'undefined' && typeof app.confirmDeleteArc === 'function') {
            app.confirmDeleteArc(arcId);
        } else {
            this.showNotification(
                'Hapus Arc',
                'Apakah Anda yakin ingin menghapus Arc cerita ini?',
                'error',
                () => {
                    this.data.arcs = this.data.arcs.filter(a => a.id !== arcId);
                    if (typeof this.saveData === 'function') this.saveData();
                    this.refreshArcMenuView();
                }
            );
        }
    },

    deleteSubarc(arcId, subarcId) {
        if (typeof app !== 'undefined' && typeof app.confirmDeleteSubarc === 'function') {
            app.confirmDeleteSubarc(arcId, subarcId);
        } else {
            this.showNotification(
                'Hapus Sub-arc',
                'Apakah Anda yakin ingin menghapus sub-arc ini?',
                'error',
                () => {
                    const arc = this.data.arcs.find(a => a.id === arcId);
                    if (arc && arc.subarcs) {
                        arc.subarcs = arc.subarcs.filter(s => s.id !== subarcId);
                        if (typeof this.saveData === 'function') this.saveData();
                        this.refreshArcMenuView();
                    }
                }
            );
        }
    }
};