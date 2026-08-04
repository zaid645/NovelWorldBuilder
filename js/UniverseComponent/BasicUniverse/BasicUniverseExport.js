// Logika ekspor universe (JSON & Markdown)

export const BasicUniverseExport = {
    // --- EXPERT SPECIFIC UNIVERSE ---
    exportSpecificUniverse(id, format = 'json') {
        const universe = app.data.universes.find(u => u.id === id);
        if (!universe) {
            app.showAlert("Semesta tidak ditemukan.", "error");
            return;
        }

        const cleanName = universe.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (format === 'md') {
            const markdownContent = this.generateUniverseMarkdown([universe]);
            const filename = `semesta_${cleanName}_lore.md`;
            
            // Menggunakan helper unduh yang nama fungsinya sudah diperbarui
            this.saveMarkdownFile(filename, markdownContent);
            
            app.showAlert("Data Semesta berhasil diekspor ke format Markdown (.md).", "success");
        } else {
            const populatedUniverse = this.populateUniverse(universe);
            const exportedData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    sourceApp: "Novel Lore Manager - Modular"
                },
                universe: populatedUniverse
            };

            const filename = `semesta_${cleanName}_lore.json`;
            app.downloadJSON(filename, exportedData); 
            app.showAlert("Data Semesta berhasil diekspor secara lengkap (JSON).", "success");
        }
    },

    // --- EXPORT MULTI UNIVERSE ---
    exportMultiUniverse() {
        if (!app.data.universes || app.data.universes.length === 0) {
            app.showAlert("Tidak ada data semesta untuk diekspor.", "error");
            return;
        }
        
        const oldModal = document.getElementById('export-multi-modal');
        if (oldModal) oldModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'export-multi-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
        
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
            <div class="p-4 bg-slate-850 border-b border-slate-700 flex justify-between items-center">
                <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">Ekspor Multi Semesta</h3>
                <button id="export-multi-close" class="text-slate-400 hover:text-slate-200 transition text-lg font-bold">×</button>
            </div>
            
            <div class="p-4 flex-1 overflow-y-auto space-y-4">
                <p class="text-xs text-slate-400">Pilih semesta mana saja yang ingin digabungkan ke dalam satu berkas ekspor.</p>

                <div class="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 space-y-2">
                    <span class="text-xs font-semibold text-slate-300 block">Format Berkas Ekspor:</span>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input type="radio" name="exportFormatRadio" value="json" class="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700">
                            JSON (Lengkap + ID)
                        </label>
                        <label class="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input type="radio" name="exportFormatRadio" value="md" checked class="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700">
                            Markdown (.md Rapi & Ringkas)
                        </label>
                    </div>
                </div>

                <div class="flex gap-4 border-b border-slate-700/60 pb-2">
                    <button id="export-multi-select-all" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">Pilih Semua</button>
                    <button id="export-multi-deselect-all" class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition">Kosongkan</button>
                </div>

                <div class="space-y-2 max-h-[35vh] overflow-y-auto pr-1" id="export-multi-list">
                    ${listHTML}
                </div>
            </div>

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
        
        const destroyModal = () => modal.remove();
        document.getElementById('export-multi-close').onclick = destroyModal;
        document.getElementById('export-multi-cancel').onclick = destroyModal;
        
        const checkboxes = modal.querySelectorAll('input[name="universeExportSelect"]');
        
        document.getElementById('export-multi-select-all').onclick = () => checkboxes.forEach(cb => cb.checked = true);
        document.getElementById('export-multi-deselect-all').onclick = () => checkboxes.forEach(cb => cb.checked = false);
        
        document.getElementById('export-multi-submit').onclick = () => {
            const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            const format = modal.querySelector('input[name="exportFormatRadio"]:checked')?.value || 'json';
                
            if (selectedIds.length === 0) {
                app.showAlert("Pilihlah setidaknya satu semesta untuk diekspor!", "error");
                return;
            }

            const targetUniverses = selectedIds
                .map(id => app.data.universes.find(u => u.id === id))
                .filter(Boolean);

            const timestamp = new Date().toISOString().slice(0, 10);

            if (format === 'md') {
                const markdownContent = this.generateUniverseMarkdown(targetUniverses);
                const filename = `multi_semesta_lore_${timestamp}.md`;
                
                // Menggunakan helper unduh yang nama fungsinya sudah diperbarui
                this.saveMarkdownFile(filename, markdownContent);
                
                app.showAlert(`${targetUniverses.length} Semesta berhasil diekspor ke Markdown!`, "success");
            } else {
                const exportedUniverses = targetUniverses.map(u => this.populateUniverse(u));
                const exportedData = {
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        sourceApp: "Novel Lore Manager - Modular",
                        totalUniverses: exportedUniverses.length
                    },
                    universes: exportedUniverses
                };
                const filename = `multi_semesta_lore_${timestamp}.json`;
                app.downloadJSON(filename, exportedData);
                app.showAlert(`${exportedUniverses.length} Semesta berhasil diekspor ke JSON!`, "success");
            }

            destroyModal();
        };
    }
};