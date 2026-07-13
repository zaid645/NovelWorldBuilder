/**
 * UniverseLoreModule
 * Mengelola informasi tambahan (Lore) berupa catatan panjang untuk suatu Semesta.
 * Disimpan dalam array string sederhana: ["Catatan 1", "Catatan 2"]
 */
export const UniverseLoreModule = {
    
    // =========================================
    // --- FUNGSI CRUD LORE ---
    // =========================================

    openAddLoreBox(univId) {
        document.getElementById(`addLoreBox_${univId}`).classList.remove('hidden');
        document.getElementById(`newLoreInput_${univId}`).focus();
    },

    closeAddLoreBox(univId) {
        document.getElementById(`addLoreBox_${univId}`).classList.add('hidden');
        document.getElementById(`newLoreInput_${univId}`).value = '';
    },

    saveNewUniverseLore(univId) {
        const inputEl = document.getElementById(`newLoreInput_${univId}`);
        const text = inputEl.value.trim();
        
        if (text) {
            const universe = this.data.universes.find(u => u.id === univId);
            if (!universe.lores) universe.lores = [];
            
            universe.lores.push(text);
            this.saveData();
            this.switchView(univId);
            this.showAlert("Catatan Lore berhasil ditambahkan.", "success");
        } else {
            this.showAlert("Catatan tidak boleh kosong.", "warning");
        }
    },

    editUniverseLore(univId, index) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe || !universe.lores || universe.lores.length <= index) return;
        
        const currentText = universe.lores[index];
        // Menggunakan prompt bawaan browser untuk kemudahan edit cepat
        const newText = prompt("Ubah catatan lore:", currentText);
        
        if (newText !== null && newText.trim() !== "") {
            universe.lores[index] = newText.trim();
            this.saveData();
            this.switchView(univId);
            this.showAlert("Catatan Lore berhasil diperbarui.", "success");
        } else if (newText !== null && newText.trim() === "") {
            this.showAlert("Catatan tidak boleh kosong. Gunakan tombol hapus jika ingin menghilangkan lore.", "warning");
        }
    },

    deleteUniverseLore(univId, index) {
        if (confirm("Yakin ingin menghapus catatan lore ini?")) {
            const universe = this.data.universes.find(u => u.id === univId);
            if (universe && universe.lores) {
                universe.lores.splice(index, 1);
                this.saveData();
                this.switchView(univId);
                this.showAlert("Catatan Lore dihapus.", "info");
            }
        }
    },

    moveUniverseLoreUp(univId, index) {
        if (index <= 0) return;
        const universe = this.data.universes.find(u => u.id === univId);
        if (universe && universe.lores) {
            const temp = universe.lores[index];
            universe.lores[index] = universe.lores[index - 1];
            universe.lores[index - 1] = temp;
            this.saveData(true);
            this.switchView(univId);
        }
    },

    moveUniverseLoreDown(univId, index) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (universe && universe.lores && index < universe.lores.length - 1) {
            const temp = universe.lores[index];
            universe.lores[index] = universe.lores[index + 1];
            universe.lores[index + 1] = temp;
            this.saveData(true);
            this.switchView(univId);
        }
    },

    // =========================================
    // --- FUNGSI RENDER VIEW ---
    // =========================================

    renderLoreArea(universe) {
        const lores = universe.lores || [];

        let html = `
        <div class="mb-4 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mt-6 shadow-sm">
            <div class="bg-slate-700/50 p-3 flex justify-between items-center cursor-pointer border-b border-slate-700" onclick="app.togglePanel('lorePanel_${universe.id}')">
                <h3 class="font-semibold text-amber-400 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Catatan Lore Semesta <span class="ml-2 bg-slate-600 text-xs px-2 py-0.5 rounded-full text-white">${lores.length} Catatan</span>
                </h3>
            </div>
            
            <div id="lorePanel_${universe.id}" class="p-3 space-y-3 ${this.getPanelClass('lorePanel_' + universe.id, 'open')}">
        `;

        if (lores.length === 0) {
            html += `<p class="text-sm text-slate-500 italic text-center py-4 bg-slate-800/40 rounded border border-dashed border-slate-700">Belum ada catatan lore khusus. Tambahkan untuk memperkaya dunia Anda.</p>`;
        } else {
            html += `<div class="space-y-3">`;
            lores.forEach((lore, index) => {
                html += `
                <div class="bg-slate-900 border border-slate-700 rounded p-4 relative group hover:border-amber-500/50 transition">
                    <div class="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition bg-slate-900 pl-2 rounded shadow-sm">
                        <button onclick="app.moveUniverseLoreUp('${universe.id}', ${index})" class="text-slate-400 hover:text-indigo-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Naikkan"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button>
                        <button onclick="app.moveUniverseLoreDown('${universe.id}', ${index})" class="text-slate-400 hover:text-indigo-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Turunkan"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                        <button onclick="app.editUniverseLore('${universe.id}', ${index})" class="text-slate-400 hover:text-amber-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Edit Lore"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                        <button onclick="app.deleteUniverseLore('${universe.id}', ${index})" class="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Lore"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                    <!-- Teks Lore -->
                    <div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed pr-24 border-l-2 border-amber-500/50 pl-3">${lore}</div>
                </div>`;
            });
            html += `</div>`;
        }

        // Form Inline Tambah Lore
        html += `
                <div class="pt-2">
                    <div id="addLoreBox_${universe.id}" class="hidden bg-slate-900 border border-slate-700 rounded p-3 mb-2 shadow-inner">
                        <textarea id="newLoreInput_${universe.id}" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none mb-2" rows="4" placeholder="Ketik catatan lore, sejarah, atau fakta menarik tentang semesta ini..."></textarea>
                        <div class="flex justify-end gap-2">
                            <button onclick="app.closeAddLoreBox('${universe.id}')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition border border-slate-600">Batal</button>
                            <button onclick="app.saveNewUniverseLore('${universe.id}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition shadow font-medium">Simpan Catatan</button>
                        </div>
                    </div>
                    
                    <button onclick="app.openAddLoreBox('${universe.id}')" class="w-full py-2.5 border-2 border-dashed border-slate-700 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg text-slate-400 text-sm font-medium transition flex justify-center items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Catatan Lore Baru
                    </button>
                </div>
            </div>
        </div>`;

        return html;
    }
};