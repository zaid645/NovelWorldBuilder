// Logika render universe 

export const BasicUniverseShow = {
    // =========================================
    // --- FUNGSI RENDER VIEW ---
    // =========================================

    activeUniverseId: null,
    
    renderUniverseView(univ) {
        // Proteksi Null: Mencegah blank page jika objek semesta tidak ditemukan
        if (!univ) {
        return `
            <div class="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-700 rounded-xl"> 
            <svg class="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> 
            <h2 class="text-xl font-bold text-slate-400 mb-2">Semesta Tidak Ditemukan</h2> 
            <p class="text-slate-500 mb-4">Semesta ini mungkin telah dihapus atau datanya korup.</p> 
            <button onclick="app.switchView('story-info')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded transition shadow">Kembali ke Info Dasar</button> 
            </div>
        `;
        }
        
        // Sinkronisasi ID aktif
        this.activeUniverseId = univ.id;
        
        // Memanggil render dari modul Karakter dan Lokasi (Jika tersedia)
        // Kita gunakan validasi typeof agar tidak error jika modul belum termuat
        const loreAreaHTML = typeof this.renderLoreArea === 'function'
        ? this.renderLoreArea(univ)
        : `<div class="p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm italic">Modul Lore belum terhubung...</div>`;
        
        const charactersAreaHTML = typeof this.renderCharactersArea === 'function'
        ? this.renderCharactersArea(univ)
        : `<div class="p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm italic">Modul Karakter belum terhubung...</div>`;
        
        const monstersAreaHTML = typeof this.renderMonstersArea === 'function'
        ? this.renderMonstersArea(univ)
        : `<div class="p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm italic">Modul Monster belum terhubung...</div>`;

        const locationsAreaHTML = typeof this.renderLocationsArea === 'function'
        ? this.renderLocationsArea(univ)
        : `<div class="p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm italic">Modul Lokasi belum terhubung...</div>`;
        
        return `
        <!-- Header / Info Dasar Semesta -->
        <div class="mb-6 bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div class="flex-1 w-full">
                <label class="text-xs text-slate-400 font-bold uppercase mb-1 block">Deskripsi Semesta</label>
                <textarea id="univDesc_${univ.id}" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none" rows="12" oninput="app.updateUniverseDesc('${univ.id}', this.value)">${univ.description || ''}</textarea>
            </div>
            <div class="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                <button onclick="app.exportSpecificUniverse('${univ.id}')" class="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs text-indigo-300 border border-slate-600 transition flex items-center justify-center">
                <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Export
                </button>
                <button onclick="app.openEditUniverse('${univ.id}')" class="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs text-amber-400 border border-slate-600 transition flex items-center justify-center">
                <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Ubah Nama
                </button>
                <button onclick="app.deleteUniverse('${univ.id}')" class="flex-1 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded text-xs text-rose-400 border border-rose-900 transition flex items-center justify-center">
                <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Hapus
                </button>
            </div>
            </div>
        </div>

        <!-- NAVIGASI & PENCARIAN (Updated) -->
        <div class="mb-6 relative">
            <div class="flex gap-2 relative z-10">
            <div class="relative flex-1">
                <!-- Menjalankan event pencarian hanya ketika Enter ditekan -->
                <input type="text" id="searchInput" placeholder="Cari tokoh, tempat, arc di semesta ini..." 
                class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pl-10 text-slate-200 focus:border-indigo-500 focus:outline-none" 
                onkeydown="if(event.key === 'Enter') app.searchUniverse('${univ.id}')">
                <svg class="w-5 h-5 absolute left-3 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <!-- Tombol Pencarian -->
            <button onclick="event.stopPropagation(); app.searchUniverse('${univ.id}')" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-lg transition shadow font-medium">
                Cari
            </button>
            </div>

            <!-- Dropdown Hasil Pencarian -->
            <div id="searchResults" class="hidden absolute w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto p-2"></div>
        </div>

        <!-- AREA MODUL LORE (BARU) -->
        ${loreAreaHTML}

        <!-- AREA MODUL KARAKTER -->
        ${charactersAreaHTML}

        <!-- AREA MODUL MONSTER -->
        ${monstersAreaHTML}

        <!-- AREA MODUL LOKASI -->
        ${locationsAreaHTML}
        `;
    },

    updateUniverseDesc(id, newValue) {
        const uni = this.data.universes.find(u => u.id === id);
        if (!uni) return;
        uni.description = newValue;

        // Menyimpan data secara silent (tanpa pop-up alert sukses yang mengganggu saat mengetik/pindah fokus)
        this.saveData(true); 
    },

    
    // =========================================
    // --- MENCARI OBJECT DALAM SATU UNIVERSE ---
    // =========================================
    searchUniverse(univId) {
        const queryInput = document.getElementById('searchInput');
        const resultBox = document.getElementById('searchResults');
        if (!queryInput) return;
        
        const rawQuery = queryInput.value.trim();
        const query = rawQuery.toLowerCase();
        
        // Jika form kosong, sembunyikan kotak hasil
        if (query === '') {
        resultBox.classList.add('hidden');
        resultBox.innerHTML = '';
        return;
        }
        
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;
        let results = [];
        
        // 1. Search characters
        if (universe.characters) {
        for (let category in universe.characters) {
            universe.characters[category].forEach(c => {
            if (c.name.toLowerCase().includes(query) || (c.background && c.background.toLowerCase().includes(query))) {
                results.push({
                type: 'Tokoh',
                category: category,
                name: c.name,
                desc: c.background || 'Tidak ada deskripsi.'
                });
            }
            });
        }
        }
        
        // 2. Search locations (Recursive)
        if (universe.locations) {
        const searchLoc = (locs) => {
            locs.forEach(l => {
            if (l.name.toLowerCase().includes(query) || (l.description && l.description.toLowerCase().includes(query))) {
                results.push({
                type: 'Lokasi',
                category: 'Geografi',
                name: l.name,
                desc: l.description || 'Tidak ada deskripsi.'
                });
            }
            if (l.children && l.children.length > 0) searchLoc(l.children);
            });
        };
        searchLoc(universe.locations);
        }
        
        // Tampilkan kotak hasil
        resultBox.classList.remove('hidden');
        
        // Jika tidak ada data yang relevan
        if (results.length === 0) {
        resultBox.innerHTML = `
            <div class="p-4 text-center text-slate-400 text-sm"> 
            <svg class="w-8 h-8 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
            Tidak ada hasil yang cocok untuk "<b>${rawQuery}</b>" di Semesta ini. 
            </div>
        `;
        return;
        }
        
        // Render List Hasil
        resultBox.innerHTML = results.map(r => `
        <div class="p-3 border-b last:border-b-0 border-slate-700 hover:bg-slate-700/60 rounded transition cursor-pointer"> 
            <div class="flex items-center justify-between mb-1"> 
            <span class="font-bold text-indigo-300 text-sm">${r.name}</span> 
            <span class="text-[10px] uppercase bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-600 shadow-sm">${r.type} - ${r.category}</span> 
            </div> 
            <div class="text-xs text-slate-400 line-clamp-2">${r.desc}</div> 
        </div>
        `).join('');
    },


    // =========================================
    // --- UBAH URUTAN UNIVERSE ---
    // =========================================
    moveUniverseUp(index) {
        if (!this.data.universes || index <= 0) return;
        const temp = this.data.universes[index];
        this.data.universes[index] = this.data.universes[index - 1];
        this.data.universes[index - 1] = temp;
        this.saveData();
        this.renderSidebar();
        this.switchView(this.currentView);
    },

    moveUniverseDown(index) {
        if (!this.data.universes || index >= this.data.universes.length - 1) return;
        const temp = this.data.universes[index];
        this.data.universes[index] = this.data.universes[index + 1];
        this.data.universes[index + 1] = temp;
        this.saveData();
        this.renderSidebar();
        this.switchView(this.currentView);
    },


    // =========================================
    // --- FUNGSI CRUD ---
    // Dimasukkan karena id universe ada di sini.
    // =========================================
    openAddUniverse() {
        const name = prompt("Masukkan nama Semesta baru:");
        if (name && name.trim()) {
        const newId = this.generateId('u');
        this.data.universes.push({
            id: newId,
            name: name.trim(),
            description: "",
            characters: { "Main Character": [], "Villain": [] },
            monsters: {},
            locations: [],
            storylines: []
        });
        this.activeUniverseId = newId;
        this.saveData();
        this.renderSidebar();
        this.switchView(newId);
        this.showAlert("Semesta baru berhasil dibuat!", "success");
        }
    },

    openEditUniverse(id) {
        const uni = this.data.universes.find(u => u.id === id);
        if (!uni) return;
            const newName = prompt("Ubah nama semesta:", uni.name);
        if (newName && newName.trim()) {
            uni.name = newName.trim();
            const newDesc = prompt("Ubah deskripsi semesta (opsional):", uni.description || "");
        if (newDesc !== null) 
            {uni.description = newDesc.trim();}
            this.saveData();
            this.renderSidebar();
            this.switchView(id); 
            this.showAlert("Informasi Semesta diperbarui.", "success");
        }
    },

    deleteUniverse(id) {
        if (this.data.universes.length <= 1) {
            this.showAlert("Tidak dapat menghapus semesta terakhir. Harus ada minimal 1 semesta.", "error");
            return;
        }
        const uniName = this.data.universes.find(u => u.id === id)?.name || "ini";
        const confirmMsg = `PERINGATAN KERAS!\n\nApakah Anda yakin ingin menghapus semesta "${uniName}" beserta SELURUH karakter, lokasi, dan ceritanya?\n\nData ini tidak dapat dikembalikan!`;

        if (confirm(confirmMsg)) {
            this.data.universes = this.data.universes.filter(u => u.id !== id);

            // Jika yang dihapus adalah semesta yang sedang aktif, pindah ke semesta pertama
            if (this.currentView === id || this.activeUniverseId === id) {
                    this.activeUniverseId = this.data.universes[0].id;
                }

            this.saveData();
            this.renderSidebar();
            this.switchView(this.activeUniverseId);
            this.showAlert("Semesta telah dihapus.", "info");
        }
    }
}