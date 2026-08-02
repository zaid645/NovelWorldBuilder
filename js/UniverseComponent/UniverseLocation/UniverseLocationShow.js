// Logika render lokasi

export const UniverseLocationShow = {
    // =========================================
    // --- RENDERING TAMPILAN GEOGRAFIS ---
    // =========================================
    renderLocationsArea(universe) {
        return `
        <div class="mb-4 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mt-6">
            <div class="bg-slate-700/50 p-3 flex justify-between items-center cursor-pointer border-b border-slate-700" onclick="app.togglePanel('locPanel_${universe.id}')">
                <h3 class="font-semibold text-emerald-400 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Kategori Tempat <span class="ml-2 bg-slate-600 text-xs px-2 py-0.5 rounded-full text-white">${universe.locations.length} Root</span>
                </h3>
                <button onclick="event.stopPropagation(); app.openAddLocation('${universe.id}')" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition">
                    + Tempat Baru
                </button>
            </div>

            <div id="locPanel_${universe.id}" class="p-3 space-y-3 ${this.getPanelClass('locPanel_' + universe.id)}">
                
                <!-- ROOT LOCATION FORM -->
                <div id="addRootLoc_${universe.id}" class="${this.getPanelClass('addRootLoc_' + universe.id)} bg-slate-900 border border-slate-700 p-4 rounded-lg mb-4 transition-all duration-300">
                    <h4 id="rootLocFormTitle_${universe.id}" class="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2">Buat Tempat Utama Baru</h4>
                    
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block mt-2">Nama Tempat Utama <span class="text-rose-400">*</span></label>
                    <input type="text" id="newLocName_${universe.id}" placeholder="Nama Tempat Utama" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500">
                    
                    <div class="flex justify-between items-end mb-1">
                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deskripsi (Sejarah/Fungsi)</label>
                        <button id="btnAiLocDesc_${universe.id}" onclick="app.generateLocationAI('${universe.id}', '${universe.id}', true, 'description')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ AI Deskripsi
                        </button>
                    </div>
                    <textarea id="newLocDesc_${universe.id}" placeholder="Deskripsi tempat..." class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500" rows="3"></textarea>
                    
                    <div class="flex justify-between items-end mb-1">
                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visual / Penggambaran</label>
                        <button id="btnAiLocVis_${universe.id}" onclick="app.generateLocationAI('${universe.id}', '${universe.id}', true, 'visuals')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ AI Visual
                        </button>
                    </div>
                    <textarea id="newLocVis_${universe.id}" placeholder="Penggambaran tempat..." class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500" rows="3"></textarea>
                    
                    <div class="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-700/60">
                        <button onclick="app.cancelEditLocation('${universe.id}')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition">Batal</button>
                        <button id="rootLocFormBtn_${universe.id}" onclick="app.addLocation('${universe.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm shadow transition font-medium">Simpan Tempat</button>
                    </div>
                </div>

                <div class="space-y-2">
                    ${universe.locations.length === 0 ? '<p class="text-sm text-slate-500 italic text-center py-4 bg-slate-800/40 rounded border border-dashed border-slate-700">Belum ada tempat.</p>' : this.renderLocationTree(universe.locations, universe.id, 0, null)}
                </div>
            </div>
        </div>`;
    },

    renderLocationTree(locations, univId, depth = 0, parentId = null) {
        if (!locations || locations.length === 0) return '';
        const indentClass = depth > 0 ? 'ml-4 sm:ml-6 pl-4 border-l-2 border-slate-700 mt-2' : '';
        
        // Dapatkan data semesta utuh untuk hitung depth dari root
        const universe = this.data.universes.find(u => u.id === univId);
        const rootLocations = universe ? universe.locations : [];

        return `<div class="${indentClass} space-y-3">` + locations.map((loc, index) => {
            const hasChildren = loc.children && loc.children.length > 0;
            
            const panelId = `children-${loc.id}`;
            const panelClass = this.getPanelClass(panelId, 'hidden');
            const isHidden = panelClass.includes('hidden');
            
            // Hitung level kedalaman lokasi saat ini secara absolut dari root semesta
            const absoluteDepth = this.getLocationDepth(rootLocations, loc.id);
            const reachMaxDepth = absoluteDepth >= 10; // Cek batasan jalur parent ke-10

            // Tombol SVG sebagai hiasan interaktif
            const toggleBtn = hasChildren 
                ? `<span class="mr-2 text-slate-400 group-hover/header:text-emerald-400 transition-transform flex items-center justify-center">
                        <svg id="toggle-icon-${loc.id}" class="w-4 h-4 transform transition-transform duration-200 ${isHidden ? '-rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </span>`
                : `<span class="w-6 inline-block"></span>`;
            
            let childrenHTML = '';
            if (hasChildren) {
                childrenHTML = `
                    <div id="${panelId}" class="${panelClass}">
                        ${this.renderLocationTree(loc.children, univId, depth + 1, loc.id)}
                    </div>
                `;
            }

            return `
            <div class="bg-slate-900 border border-slate-700 rounded p-3 relative group shadow-sm hover:border-emerald-500/40 transition-colors">
                <!-- PANEL AKSI MELAYANG DI SIKU KANAN ATAS -->
                <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-10 bg-slate-900 pl-2 rounded">
                    ${index > 0 ? `
                    <button onclick="event.stopPropagation(); app.moveLocationUp('${univId}', '${loc.id}')" class="text-slate-400 hover:text-emerald-400 p-1 bg-slate-800 rounded transition border border-slate-700" title="Naikkan Urutan Tempat">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="event.stopPropagation(); app.openEditLocation('${univId}', '${loc.id}', ${parentId ? `'${parentId}'` : 'null'})" class="text-slate-400 hover:text-amber-400 p-1 bg-slate-800 rounded transition border border-slate-700" title="Edit Lokasi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="event.stopPropagation(); app.deleteLocation('${univId}', '${loc.id}')" class="text-slate-400 hover:text-rose-500 p-1 bg-slate-800 rounded transition border border-slate-700" title="Hapus Lokasi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                
                <!-- HEADER BARIS JUDUL -->
                <div class="flex items-center mb-2 pb-1 border-b border-slate-800 ${hasChildren ? 'cursor-pointer select-none group/header' : ''}"
                     ${hasChildren ? `onclick="app.toggleLocationChildren('${loc.id}')"` : ''}>
                    ${toggleBtn}
                    <h4 class="font-bold text-emerald-400 text-sm md:text-base flex-1 line-clamp-1 group-hover/header:text-emerald-300 transition-all">
                        ${loc.name} 
                        ${hasChildren ? `<span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-normal ml-2 border border-slate-700">${loc.children.length} sub-tempat</span>` : ''}
                        <span class="text-[9px] text-slate-500 font-normal ml-1">Lvl ${absoluteDepth}</span>
                    </h4>
                </div>
                
                <!-- DETAIL PANEL INFORMASI DAN DESKRIPSI -->
                <div class="pl-6 space-y-1.5">
                    <div class="text-xs text-slate-300"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Deskripsi (Sejarah/Fungsi):</span> <span class="leading-relaxed">${loc.description || '-'}</span></div>
                    <div class="text-xs text-slate-300 mb-2"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Visual (Penggambaran):</span> <span class="leading-relaxed">${loc.visuals || '-'}</span></div>
                    
                    <!-- KONDISIONAL: HANYA MUNCUL JIKA BELUM MENCAPAI TINGKAT 10 -->
                    ${!reachMaxDepth ? `
                    <div class="flex items-center space-x-2 mt-3 mb-2 pt-2 border-t border-slate-800/80">
                        <button onclick="app.openAddChildLocation('${loc.id}')" class="text-xs text-slate-400 hover:text-emerald-400 flex items-center bg-slate-800 px-2 py-1 rounded transition border border-slate-700">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Tambah Sub-Tempat
                        </button>
                        <button id="btnAutoChild_${loc.id}" onclick="app.autoGenerateChildLocation('${univId}', '${loc.id}')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ AI Auto-Child
                        </button>
                    </div>
                    ` : `<div class="text-[10px] text-amber-500/70 italic mt-2 pt-2 border-t border-slate-800/80">⚠️ Kedalaman struktur tempat mencapai batas maksimum (Maks. 10 tingkat parent).</div>`}

                    <!-- CHILD LOCATION FORM -->
                    <div id="addChildLoc_${loc.id}" class="${this.getPanelClass('addChildLoc_' + loc.id)} bg-slate-800 border border-slate-700 p-3 rounded mt-2 mb-3 shadow-inner transition-all duration-300">
                        <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Sub-Tempat <span class="text-rose-400">*</span></label>
                        <input type="text" id="newLocName_${loc.id}" placeholder="Nama Sub-Tempat" class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2 outline-none focus:border-emerald-500">
                        
                        <div class="flex justify-between items-end mb-1 mt-2">
                            <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deskripsi (Sejarah/Fungsi)</label>
                            <button id="btnAiLocDesc_${loc.id}" onclick="app.generateLocationAI('${univId}', '${loc.id}', false, 'description')" class="text-[9px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-1.5 py-0.5 rounded transition font-medium shadow-sm">✨ AI Deskripsi</button>
                        </div>
                        <textarea id="newLocDesc_${loc.id}" placeholder="Deskripsi ringkas..." class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2 outline-none focus:border-emerald-500" rows="3"></textarea>
                        
                        <div class="flex justify-between items-end mb-1 mt-2">
                            <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Visual (Penggambaran)</label>
                            <button id="btnAiLocVis_${loc.id}" onclick="app.generateLocationAI('${univId}', '${loc.id}', false, 'visuals')" class="text-[9px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-1.5 py-0.5 rounded transition font-medium shadow-sm">✨ AI Visual</button>
                        </div>
                        <textarea id="newLocVis_${loc.id}" placeholder="Penggambaran ringkas..." class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-3 outline-none focus:border-emerald-500" rows="3"></textarea>
                        
                        <div class="flex justify-end space-x-2 pt-2 border-t border-slate-700/60">
                            <button onclick="app.cancelEditChildLocation('${loc.id}')" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition">Batal</button>
                            <button id="childLocFormBtn_${loc.id}" onclick="app.addChildLocation('${univId}', '${loc.id}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs transition shadow-sm">Simpan Child</button>
                        </div>
                    </div>
                </div>

                ${childrenHTML}
            </div>
            `;
        }).join('') + `</div>`;
    }
}