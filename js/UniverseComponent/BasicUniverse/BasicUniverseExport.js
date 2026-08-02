// Logika export univer

export const BasicUniverseExport = {
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

  // HELPER untuk populated universe
    populateUniverse(universe) {
        // Kloning data karakter dan monster agar modifikasi tidak mengubah state aplikasi utama
        const populatedCharacters = JSON.parse(JSON.stringify(universe.characters || {}));
        const populatedMonsters = JSON.parse(JSON.stringify(universe.monsters || {})); // <-- TAMBAHKAN INI
        
        // =========================================================
        // 1. POPULATE DATA KARAKTER (Bawaan)
        // =========================================================
        for (let category in populatedCharacters) {
        if (Array.isArray(populatedCharacters[category])) {
            populatedCharacters[category].forEach(char => {
            // Populate Skills
            if (char.skillIds && Array.isArray(char.skillIds) && this.data.skills) {
                char.skills = char.skillIds.map(skillId => {
                const fullSkill = this.data.skills.find(s => s.id === skillId);
                return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                });
                delete char.skillIds;
            }
            
            // Populate Items
            if (char.itemIds && Array.isArray(char.itemIds) && this.data.items) {
                char.items = char.itemIds.map(itemId => {
                const masterItem = this.data.items.find(i => i.id === itemId);
                if (masterItem) {
                    const fullItem = JSON.parse(JSON.stringify(masterItem));
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

            // Populate Familiars
            if (char.familiarIds && Array.isArray(char.familiarIds) && this.data.familiars) {
                char.familiars = char.familiarIds.map(famId => {
                const masterFamiliar = this.data.familiars.find(f => f.id === famId);
                if (masterFamiliar) {
                    const fullFamiliar = JSON.parse(JSON.stringify(masterFamiliar));
                    if (fullFamiliar.skillIds && Array.isArray(fullFamiliar.skillIds) && this.data.skills) {
                    fullFamiliar.skills = fullFamiliar.skillIds.map(skillId => {
                        const fullSkill = this.data.skills.find(s => s.id === skillId);
                        return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                    });
                    delete fullFamiliar.skillIds;
                    }
                    if (fullFamiliar.itemIds && Array.isArray(fullFamiliar.itemIds) && this.data.items) {
                    fullFamiliar.items = fullFamiliar.itemIds.map(itemId => {
                        const masterItem = this.data.items.find(i => i.id === itemId);
                        if (masterItem) {
                        const fullItem = JSON.parse(JSON.stringify(masterItem));
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

        // =========================================================
        // 2. POPULATE DATA MONSTER
        // =========================================================
        for (let category in populatedMonsters) {
        if (Array.isArray(populatedMonsters[category])) {
            populatedMonsters[category].forEach(monster => {
            // Populate Skills milik Monster
            if (monster.skillIds && Array.isArray(monster.skillIds) && this.data.skills) {
                monster.skills = monster.skillIds.map(skillId => {
                const fullSkill = this.data.skills.find(s => s.id === skillId);
                return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                });
                delete monster.skillIds;
            }
            
            // Populate Items milik Monster
            if (monster.itemIds && Array.isArray(monster.itemIds) && this.data.items) {
                monster.items = monster.itemIds.map(itemId => {
                const masterItem = this.data.items.find(i => i.id === itemId);
                if (masterItem) {
                    const fullItem = JSON.parse(JSON.stringify(masterItem));
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
                delete monster.itemIds;
            }

            // Populate Familiars milik Monster
            if (monster.familiarIds && Array.isArray(monster.familiarIds) && this.data.familiars) {
                monster.familiars = monster.familiarIds.map(famId => {
                const masterFamiliar = this.data.familiars.find(f => f.id === famId);
                if (masterFamiliar) {
                    const fullFamiliar = JSON.parse(JSON.stringify(masterFamiliar));
                    if (fullFamiliar.skillIds && Array.isArray(fullFamiliar.skillIds) && this.data.skills) {
                    fullFamiliar.skills = fullFamiliar.skillIds.map(skillId => {
                        const fullSkill = this.data.skills.find(s => s.id === skillId);
                        return fullSkill ? fullSkill : { id: skillId, note: "Skill tidak ditemukan di data master" };
                    });
                    delete fullFamiliar.skillIds;
                    }
                    return fullFamiliar;
                }
                return { id: famId, note: "Familiar tidak ditemukan di data master" };
                });
                delete monster.familiarIds;
            }
            });
            }
        }

        // =========================================================
        // 3. RETURN DATA
        // =========================================================
        return {
            id: universe.id,
            name: universe.name,
            description: universe.description,
            lores: universe.lores || [],
            charactersCategoryDescriptions: universe.charactersCategoryDescriptions || {},
            characters: populatedCharacters,
            monstersCategoryDescriptions: universe.monstersCategoryDescriptions || {}, // <-- TAMBAHKAN INI
            monsters: populatedMonsters,                                             // <-- TAMBAHKAN INI
            locations: universe.locations || []
    };
  }
}