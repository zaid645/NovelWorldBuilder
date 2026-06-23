/**
 * UniverseLocationModule / LocationBasicModule
 * Mengelola informasi lokasi (geografi semesta), tempat utama (root),
 * struktur tempat bersarang (child locations/sub-tempat), serta rendering hierarkisnya.
 */
export const UniverseLocationModule = {
    // Menyimpan ID tempat yang sedang dalam proses penyuntingan
    editLocationId: null,

    // =========================================
    // --- FUNGSI UTAMA MANAJEMEN LOKASI ---
    // =========================================

    /**
     * Mempersiapkan form untuk menyunting lokasi (baik tempat utama maupun sub-tempat)
     */
    openEditLocation(univId, locId, parentId) {
        const universe = this.data.universes.find(u => u.id === univId);
        const loc = this.findLocationById(universe.locations, locId);
        if (!loc) return;
        this.editLocationId = locId;

        if (parentId === null) {
            this.setPanelState(`addRootLoc_${univId}`, true);
            document.getElementById(`rootLocFormTitle_${univId}`).innerText = "Edit Tempat Utama";
            document.getElementById(`rootLocFormBtn_${univId}`).innerText = "Update Tempat";
            document.getElementById(`newLocName_${univId}`).value = loc.name;
            document.getElementById(`newLocDesc_${univId}`).value = loc.description || '';
            document.getElementById(`newLocVis_${univId}`).value = loc.visuals || '';
        } else {
            this.setPanelState(`addChildLoc_${parentId}`, true);
            document.getElementById(`childLocFormBtn_${parentId}`).innerText = "Update Child";
            document.getElementById(`newLocName_${parentId}`).value = loc.name;
            document.getElementById(`newLocDesc_${parentId}`).value = loc.description || '';
            document.getElementById(`newLocVis_${parentId}`).value = loc.visuals || '';
        }
    },

    /**
     * Menyimpan lokasi baru atau memperbarui lokasi tingkat utama (root) yang sedang diedit
     */
    addLocation(univId) {
        const name = document.getElementById(`newLocName_${univId}`).value.trim();
        if (!name) return this.showAlert("Nama tempat wajib diisi", "error");

        const desc = document.getElementById(`newLocDesc_${univId}`).value.trim();
        const vis = document.getElementById(`newLocVis_${univId}`).value.trim();
        
        const universe = this.data.universes.find(u => u.id === univId);

        if (this.editLocationId) {
            const loc = this.findLocationById(universe.locations, this.editLocationId);
            if (loc) {
                loc.name = name; 
                loc.description = desc; 
                loc.visuals = vis;
            }
            this.editLocationId = null;
            this.showAlert("Tempat berhasil diupdate", "success");
        } else {
            universe.locations.push({
                id: this.generateId('l'),
                name, 
                description: desc, 
                visuals: vis, 
                children: []
            });
            this.showAlert("Tempat baru disimpan", "success");
        }
        this.saveData();
        this.switchView(univId);
        this.setPanelState(`addRootLoc_${univId}`, false);
    },

    /**
     * Menyimpan sub-lokasi (child) baru atau memperbarui sub-lokasi yang sedang diedit
     */
    addChildLocation(univId, parentId) {
        const name = document.getElementById(`newLocName_${parentId}`).value.trim();
        if (!name) return this.showAlert("Nama child tempat wajib diisi", "error");

        const desc = document.getElementById(`newLocDesc_${parentId}`).value.trim();
        const vis = document.getElementById(`newLocVis_${parentId}`).value.trim();

        const universe = this.data.universes.find(u => u.id === univId);
        
        if (this.editLocationId) {
            const loc = this.findLocationById(universe.locations, this.editLocationId);
            if (loc) {
                loc.name = name; 
                loc.description = desc; 
                loc.visuals = vis;
            }
            this.editLocationId = null;
            this.showAlert("Child tempat diupdate", "success");
        } else {
            const parentLoc = this.findLocationById(universe.locations, parentId);
            if (parentLoc) {
                if (!parentLoc.children) parentLoc.children = [];
                parentLoc.children.push({
                    id: this.generateId('l'),
                    name, 
                    description: desc, 
                    visuals: vis, 
                    children: []
                });
                this.showAlert("Child tempat disimpan", "success");
            }
        }

        this.setPanelState(`addChildLoc_${parentId}`, false);
        this.saveData();
        this.switchView(univId);
    },

    // --- LOGIKA KONTROL PANEL & FORM TEMPAT ---

    /**
     * Membuka form pembuatan tempat utama kosong
     */
    openAddLocation(univId) {
        this.editLocationId = null;
        document.getElementById(`rootLocFormTitle_${univId}`).innerText = "Buat Tempat Utama Baru";
        document.getElementById(`rootLocFormBtn_${univId}`).innerText = "Simpan Tempat";
        document.getElementById(`newLocName_${univId}`).value = '';
        document.getElementById(`newLocDesc_${univId}`).value = '';
        document.getElementById(`newLocVis_${univId}`).value = '';

        this.setPanelState(`locPanel_${univId}`, true);
        this.setPanelState(`addRootLoc_${univId}`, true);
    },

    cancelEditLocation(univId) {
        this.editLocationId = null;
        this.setPanelState(`addRootLoc_${univId}`, false);
    },

    /**
     * Membuka form pembuatan sub-tempat (child) kosong di bawah lokasi tertentu
     */
    openAddChildLocation(locId) {
        this.editLocationId = null;
        document.getElementById(`childLocFormBtn_${locId}`).innerText = "Simpan Child";
        document.getElementById(`newLocName_${locId}`).value = '';
        document.getElementById(`newLocDesc_${locId}`).value = '';
        document.getElementById(`newLocVis_${locId}`).value = '';
        
        this.setPanelState(`addChildLoc_${locId}`, true);
        // === TAMBAHAN: Paksa hierarki kontainer anak terbuka agar form kelihatan ===
        this.setPanelState(`children-${locId}`, true);
        
        // Memastikan ikon rotasi panah indikator sinkron (menghapus kelas -rotate-90)
        const toggleIcon = document.getElementById(`toggle-icon-${locId}`);
        if (toggleIcon) toggleIcon.classList.remove('-rotate-90');
    },

    cancelEditChildLocation(locId) {
        this.editLocationId = null;
        this.setPanelState(`addChildLoc_${locId}`, false);
    },

    /**
     * Menghapus lokasi beserta seluruh sub-lokasi yang berada di bawahnya secara rekursif
     */
    deleteLocation(univId, locId) {
        if (confirm("Yakin ingin menghapus tempat ini beserta semua sub-tempat di dalamnya?")) {
            const universe = this.data.universes.find(u => u.id === univId);
            
            const removeLoc = (locations) => {
                for (let i = 0; i < locations.length; i++) {
                    if (locations[i].id === locId) {
                        locations.splice(i, 1);
                        return true;
                    }
                    if (locations[i].children && removeLoc(locations[i].children)) return true;
                }
                return false;
            };

            removeLoc(universe.locations);
            this.saveData();
            this.switchView(univId);
        }
    },

    /**
     * Mencari objek lokasi berdasarkan ID secara rekursif dalam pohon data lokasi
     */
    findLocationById(locations, targetId) {
        for (let loc of locations) {
            if (loc.id === targetId) return loc;
            if (loc.children) {
                const found = this.findLocationById(loc.children, targetId);
                if (found) return found;
            }
        }
        return null;
    },

    /**
     * Membuka atau menutup daftar sub-tempat (rekursif) dengan rotasi ikon indikator
     */
    toggleLocationChildren(locationId) {
        const panelId = `children-${locationId}`;
        const childrenContainer = document.getElementById(panelId);
        const toggleIcon = document.getElementById(`toggle-icon-${locationId}`);
        
        let willOpen = true;
        if (childrenContainer) {
            willOpen = childrenContainer.classList.contains('hidden');
        } else {
            willOpen = this.panelStates.get(panelId) !== 'open';
        }
        
        this.setPanelState(panelId, willOpen);
        
        if (toggleIcon) {
            if (!willOpen) {
                toggleIcon.classList.add('-rotate-90');
            } else {
                toggleIcon.classList.remove('-rotate-90');
            }
            toggleIcon.style.transform = ''; 
        }
    },

    // =========================================
    // --- RENDERING TAMPILAN GEOGRAFIS ---
    // =========================================

    /**
     * Menghasilkan HTML area panel pembungkus daftar tempat semesta
     */
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
                <div id="addRootLoc_${universe.id}" class="${this.getPanelClass('addRootLoc_' + universe.id)} bg-slate-900 border border-slate-700 p-4 rounded-lg mb-4">
                    <h4 id="rootLocFormTitle_${universe.id}" class="text-sm font-bold text-emerald-400 mb-3">Buat Tempat Utama Baru</h4>
                    <input type="text" id="newLocName_${universe.id}" placeholder="Nama Tempat" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-2">
                    <textarea id="newLocDesc_${universe.id}" placeholder="Deskripsi" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-2" rows="7"></textarea>
                    <textarea id="newLocVis_${universe.id}" placeholder="Penggambaran / Visual" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3" rows="7"></textarea>
                    <div class="flex justify-end space-x-2">
                        <button onclick="app.cancelEditLocation('${universe.id}')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">Batal</button>
                        <button id="rootLocFormBtn_${universe.id}" onclick="app.addLocation('${universe.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm">Simpan Tempat</button>
                    </div>
                </div>

                <div class="space-y-2">
                    ${universe.locations.length === 0 ? '<p class="text-sm text-slate-500 italic">Belum ada tempat.</p>' : this.renderLocationTree(universe.locations, universe.id, 0, null)}
                </div>
            </div>
        </div>`;
    },

    /**
     * Menghasilkan HTML pohon hierarki lokasi bercabang secara rekursif
     */
    renderLocationTree(locations, univId, depth = 0, parentId = null) {
        if (!locations || locations.length === 0) return '';
        const indentClass = depth > 0 ? 'ml-4 sm:ml-6 pl-4 border-l-2 border-slate-700 mt-2' : '';
        
        return `<div class="${indentClass} space-y-3">` + locations.map(loc => {
            const hasChildren = loc.children && loc.children.length > 0;
            
            // Mengambil status panel dari memori aplikasi
            const panelId = `children-${loc.id}`;
            const panelClass = this.getPanelClass(panelId, 'hidden');
            const isHidden = panelClass.includes('hidden');
            
            // Setel rotasi ikon indikator berdasarkan status visibilitas
            const toggleBtn = hasChildren 
                ? `<button onclick="app.toggleLocationChildren('${loc.id}')" class="mr-2 text-slate-400 hover:text-emerald-400 transition-transform focus:outline-none">
                        <svg id="toggle-icon-${loc.id}" class="w-4 h-4 transform transition-transform duration-200 ${isHidden ? '-rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>`
                : `<span class="w-6 inline-block"></span>`;
            
            // Rekursi untuk merender anak-anak sub-tempat
            let childrenHTML = '';
            if (hasChildren) {
                childrenHTML = `
                    <div id="${panelId}" class="${panelClass}">
                        ${this.renderLocationTree(loc.children, univId, depth + 1, loc.id)}
                    </div>
                `;
            }

            return `
            <div class="bg-slate-900 border border-slate-700 rounded p-3 relative group">
                <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-10 bg-slate-900 pl-2">
                    <button onclick="app.openEditLocation('${univId}', '${loc.id}', ${parentId ? `'${parentId}'` : 'null'})" class="text-slate-500 hover:text-emerald-400" title="Edit Lokasi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="app.deleteLocation('${univId}', '${loc.id}')" class="text-slate-500 hover:text-rose-500" title="Hapus Lokasi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                
                <div class="flex items-center mb-1">
                    ${toggleBtn}
                    <h4 class="font-bold text-emerald-400 text-base flex-1">
                        ${loc.name} 
                        ${hasChildren ? `<span class="text-xs text-slate-500 font-normal ml-2">(${loc.children.length} sub-tempat)</span>` : ''}
                    </h4>
                </div>
                
                <div class="pl-6">
                    <div class="text-xs text-slate-300 mb-1"><span class="font-semibold text-slate-400">Deskripsi:</span> ${loc.description || '-'}</div>
                    <div class="text-xs text-slate-300 mb-3"><span class="font-semibold text-slate-400">Visual:</span> ${loc.visuals || '-'}</div>
                    
                    <button onclick="app.openAddChildLocation('${loc.id}')" class="text-xs text-emerald-400 hover:text-emerald-300 flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Tambah Child Tempat
                    </button>

                    <div id="addChildLoc_${loc.id}" class="${this.getPanelClass('addChildLoc_' + loc.id)} bg-slate-800 border border-slate-700 p-3 rounded mt-2 mb-2">
                        <input type="text" id="newLocName_${loc.id}" placeholder="Nama Child Tempat" class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2">
                        <textarea id="newLocDesc_${loc.id}" placeholder="Deskripsi" class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2" rows="7"></textarea>
                        <textarea id="newLocVis_${loc.id}" placeholder="Penggambaran" class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2" rows="7"></textarea>
                        <div class="flex justify-end space-x-2">
                            <button onclick="app.cancelEditChildLocation('${loc.id}')" class="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Batal</button>
                            <button id="childLocFormBtn_${loc.id}" onclick="app.addChildLocation('${univId}', '${loc.id}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs">Simpan Child</button>
                        </div>
                    </div>
                </div>

                ${childrenHTML}
            </div>
            `;
        }).join('') + `</div>`;
    }
};

// Ekspor alias cadangan untuk menjamin kompatibilitas import pada berkas-berkas lama
export const LocationBasicModule = UniverseLocationModule;