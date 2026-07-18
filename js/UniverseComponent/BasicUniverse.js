/*
UniverseBasicModule
Mengelola informasi dasar semesta (Nama & Deskripsi),
manajemen daftarnya, serta tampilan dashboard utama untuk suatu Semesta.
*/
export const UniverseBasicModule = {
  // Menyimpan ID semesta yang sedang aktif diedit atau dilihat
  activeUniverseId: null,

  // =========================================
  // --- FUNGSI AKSI SEMESTA (DI ATAS) ---
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

  openAddUniverse() {
    const name = prompt("Masukkan nama Semesta baru:");
    if (name && name.trim()) {
      const newId = this.generateId('u');
      this.data.universes.push({
        id: newId,
        name: name.trim(),
        description: "",
        characters: { "Main Character": [], "Villain": [] },
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
      if (newDesc !== null) {
        uni.description = newDesc.trim();
      }
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
  },

  /*
  Helper untuk memproses dan melengkapi data semesta (populating)
  Mengubah array referensi ID (Skill, Item, Familiar) menjadi objek data master utuh.
  */
  populateUniverse(universe) {
    // Kloning data karakter agar modifikasi tidak mengubah state aplikasi utama
    const populatedCharacters = JSON.parse(JSON.stringify(universe.characters || {}));
    
    // Mengubah array ID menjadi objek utuh untuk Skill, Item, dan Familiar
    for (let category in populatedCharacters) {
      if (Array.isArray(populatedCharacters[category])) {
        populatedCharacters[category].forEach(char => {
          // Populate Skills (mencari dari skillIds)
          if (char.skillIds && Array.isArray(char.skillIds) && this.data.skills) {
            char.skills = char.skillIds.map(skillId => {
              const fullSkill = this.data.skills.find(s => s.id === skillId);
              return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
            });
            delete char.skillIds; // Hapus array ID agar rapi
          }
          
          // Populate Items milik Karakter + Skill di dalamnya
          if (char.itemIds && Array.isArray(char.itemIds) && this.data.items) {
            char.items = char.itemIds.map(itemId => {
              const masterItem = this.data.items.find(i => i.id === itemId);

              if (masterItem) {
                // Clone item agar data master tidak ikut termodifikasi
                const fullItem = JSON.parse(JSON.stringify(masterItem));

                // Populate Skill milik Item tersebut
                if (fullItem.skillIds && Array.isArray(fullItem.skillIds) && this.data.skills) {
                  fullItem.skills = fullItem.skillIds.map(skillId => {
                    const fullSkill = this.data.skills.find(s => s.id === skillId);
                    return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                  });
                  delete fullItem.skillIds;
                }
                return fullItem;
              }
              return { id: itemId, note: "Item tidak ditemukan di data master" };
            });
            delete char.itemIds;
          }

          // Populate Familiars (mencari dari familiarIds)
          if (char.familiarIds && Array.isArray(char.familiarIds) && this.data.familiars) {
            char.familiars = char.familiarIds.map(famId => {
              const masterFamiliar = this.data.familiars.find(f => f.id === famId);

              if (masterFamiliar) {
                // Clone (duplikat) familiar agar data utama master tidak ikut termodifikasi!
                const fullFamiliar = JSON.parse(JSON.stringify(masterFamiliar));

                // Populate Skill milik Familiar
                if (fullFamiliar.skillIds && Array.isArray(fullFamiliar.skillIds) && this.data.skills) {
                  fullFamiliar.skills = fullFamiliar.skillIds.map(skillId => {
                    const fullSkill = this.data.skills.find(s => s.id === skillId);
                    return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                  });
                  delete fullFamiliar.skillIds;
                }

                // Populate Item milik Familiar + Skill di dalamnya
                if (fullFamiliar.itemIds && Array.isArray(fullFamiliar.itemIds) && this.data.items) {
                  fullFamiliar.items = fullFamiliar.itemIds.map(itemId => {
                    const masterItem = this.data.items.find(i => i.id === itemId);

                    if (masterItem) {
                      const fullItem = JSON.parse(JSON.stringify(masterItem));

                      // Populate Skill di dalam Item milik Familiar
                      if (fullItem.skillIds && Array.isArray(fullItem.skillIds) && this.data.skills) {
                        fullItem.skills = fullItem.skillIds.map(skillId => {
                          const fullSkill = this.data.skills.find(s => s.id === skillId);
                          return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                        });
                        delete fullItem.skillIds;
                      }
                      return fullItem;
                    }
                    return { id: itemId, note: "Item tidak ditemukan di data master" };
                  });
                  delete fullFamiliar.itemIds;
                }

                return fullFamiliar;
              }

              return { id: famId, note: "Familiar tidak ditemukan di data master" };
            });
            delete char.familiarIds;
          }
        });
      }
    }
    return {
      id: universe.id,
      name: universe.name,
      description: universe.description,
      lores: universe.lores || [],
      characters: populatedCharacters,
      locations: universe.locations || []
    };
  },

  exportSpecificUniverse(id) {
    const universe = this.data.universes.find(u => u.id === id);
    if (!universe) return;
    
    // Menggunakan helper populateUniverse
    const populatedUniverse = this.populateUniverse(universe);

    // Ekspor data spesifik dengan karakter yang sudah dilengkapi (populated)
    const exportedData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        sourceApp: "Novel Lore Manager - Modular"
      },
      universe: populatedUniverse
    };

    const filename = `semesta_${universe.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_lore.json`;
    this.downloadJSON(filename, exportedData); 
    this.showAlert("Data Semesta berhasil di-eksport secara lengkap.", "success");
  },

  /*
  Memunculkan panel pilihan ekspor multi-semesta ke dalam satu file berkas JSON gabungan.
  Secara bawaan (default), seluruh semesta terpilih (true).
  */
  exportMultiUniverse() {
    if (!app.data.universes || app.data.universes.length === 0) {
      app.showAlert("Tidak ada data semesta untuk diekspor.", "error");
      return;
    }
    
    // Hapus instans modal lama jika ada di DOM
    const oldModal = document.getElementById('export-multi-modal');
    if (oldModal) oldModal.remove();
    
    // Buat elemen pembungkus modal overlay
    const modal = document.createElement('div');
    modal.id = 'export-multi-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
    
    // Bangun daftar opsi pilihan semesta
    const listHTML = app.data.universes.map(u => `
      <label class="flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-700/50 rounded-lg cursor-pointer transition select-none border border-slate-700/50"> 
        <input type="checkbox" name="universeExportSelect" value="${u.id}" checked class="w-4.5 h-4.5 rounded border-slate-650 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2"> 
        <div class="flex-1 min-w-0"> 
          <span class="text-sm font-semibold text-slate-100 block truncate">${u.name}</span> 
          <span class="text-xs text-slate-400 block truncate">${u.description || 'Tidak ada deskripsi semesta.'}</span> 
        </div> 
      </label>
    `).join('');

    modal.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-4 bg-slate-850 border-b border-slate-700 flex justify-between items-center">
          <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">Ekspor Multi Semesta</h3>
          <button id="export-multi-close" class="text-slate-400 hover:text-slate-200 transition">×</button>
        </div>
        
        <!-- Body -->
        <div class="p-4 flex-1 overflow-y-auto space-y-4">
          <p class="text-xs text-slate-400">Pilih semesta mana saja yang ingin digabungkan ke dalam satu berkas ekspor.</p>

          <!-- Kontrol Cepat -->
          <div class="flex gap-4 border-b border-slate-700/60 pb-3">
            <button id="export-multi-select-all" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">Pilih Semua</button>
            <button id="export-multi-deselect-all" class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition">Kosongkan</button>
          </div>

          <!-- List Checkbox -->
          <div class="space-y-2 max-h-[40vh] overflow-y-auto pr-1" id="export-multi-list">
            ${listHTML}
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-850 border-t border-slate-700 flex justify-end gap-2">
          <button id="export-multi-cancel" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold transition">
            Batal
          </button>
          <button id="export-multi-submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Ekspor Gabungan
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // -- Event Handlers --
    const destroyModal = () => modal.remove();
    document.getElementById('export-multi-close').onclick = destroyModal;
    document.getElementById('export-multi-cancel').onclick = destroyModal;
    
    const checkboxes = modal.querySelectorAll('input[name="universeExportSelect"]');
    
    // Pilih semua semesta
    document.getElementById('export-multi-select-all').onclick = () => {
      checkboxes.forEach(cb => cb.checked = true);
    };
    
    // Kosongkan pilihan semesta
    document.getElementById('export-multi-deselect-all').onclick = () => {
      checkboxes.forEach(cb => cb.checked = false);
    };
    
    // Proses Ekspor
    document.getElementById('export-multi-submit').onclick = () => {
      const selectedIds = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
        
      if (selectedIds.length === 0) {
        this.showAlert("Pilihlah setidaknya satu semesta untuk diekspor!", "error");
        return;
      }

      // Memproses pengumpulan dan populasi data semesta yang terpilih
      const exportedUniverses = selectedIds.map(id => {
        const universe = this.data.universes.find(u => u.id === id);
        return universe ? this.populateUniverse(universe) : null;
      }).filter(Boolean);

      const exportedData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          sourceApp: "Novel Lore Manager - Modular",
          totalUniverses: exportedUniverses.length
        },
        universes: exportedUniverses
      };

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `multi_semesta_lore_${timestamp}.json`;

      // Download file JSON gabungan
      this.downloadJSON(filename, exportedData);
      this.showAlert(`${exportedUniverses.length} Semesta berhasil diekspor bersamaan!`, "success");

      destroyModal();
    };
  },

  /*
  Fitur pencarian modular untuk semesta aktif.
  Menggunakan click button / enter key agar tidak berat diproses
  saat data sudah banyak (menghindari oninput event).
  */
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
  // --- FUNGSI RENDER VIEW ---
  // =========================================
  /*
  Merender tampilan utama manajemen Semesta (Universe).
  Parameter univ dikirim langsung dari MainScript.js (switchView).
  */
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
};