export const NovelWriterShow = {
    // =========================================================================
    // RENDERER PANEL
    // =========================================================================
    refreshUI() {
        const container = document.getElementById('novelWriterModuleContainer');
        if (container) {
            container.innerHTML = this.renderNovelWriter();
        }
    },

    updateWordCountUI(text) {
        const wordCountSpan = document.getElementById('nw-word-count');
        if (wordCountSpan) {
            const trimmed = text.trim();
            const count = trimmed ? trimmed.split(/\s+/).length : 0;
            wordCountSpan.innerText = `${count} kata`;
        }
    },

    renderNovelWriter(providedDb = null) {
        const db = this.getDatabase(providedDb);
        const refFileKeys = Object.keys(this.state.referenceFiles);
        const aiConfig = this.getAIConfig();

        return `
            <div id="novelWriterModuleContainer" class="space-y-5 text-slate-200 font-sans">
                <!-- HEADER STUDIO -->
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
                    <div>
                        <h2 class="text-base font-bold text-indigo-400 flex items-center gap-2">
                            📖 Novel Writer Studio
                        </h2>
                        <p class="text-xs text-slate-400">Pilih semesta, karakter, monster, dan lokasi, lalu kembangkan adegan cerita dengan AI.</p>
                    </div>

                    <div class="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs w-full sm:w-auto">
                        <button onclick="app.NovelWriterModule.state.activeTab = 'selection'; app.NovelWriterModule.refreshUI(); app.NovelWriterModule.novelWriterSaveState();" 
                            class="flex-1 sm:flex-none px-3 py-1.5 rounded transition ${this.state.activeTab === 'selection' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}">
                            🎯 Seleksi Konteks
                        </button>
                        <button onclick="app.NovelWriterModule.state.activeTab = 'attributes'; app.NovelWriterModule.refreshUI(); app.NovelWriterModule.novelWriterSaveState();" 
                            class="flex-1 sm:flex-none px-3 py-1.5 rounded transition ${this.state.activeTab === 'attributes' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}">
                            ⚙️ Filter Atribut
                        </button>
                    </div>
                </div>

                <!-- TOP PANEL 1: MAIN INSTRUCTION (SEALED AT TOP OF STUDIO) -->
                <div class="bg-slate-800 p-4 rounded-lg border border-indigo-500/40 shadow-md space-y-2">
                    <div class="flex justify-between items-center border-b border-slate-700 pb-2">
                        <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                            📜 Main Instruction (Instruksi Utama Penulisan)
                        </h3>
                        <span class="text-[10px] text-slate-400 italic">Dipergunakan terus-menerus di semua generasi AI</span>
                    </div>
                    
                    <textarea 
                        rows="2"
                        placeholder="Instruksi utama penulisan (contoh: Gunakan POV Orang Ketiga, gaya bahasa puitis dan gelap, fokus pada dialog emosional...)"
                        class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-y"
                        oninput="
                            app.NovelWriterModule.state.mainInstruction = this.value;
                            app.NovelWriterModule.novelWriterSaveState();
                        "
                    >${this.state.mainInstruction}</textarea>

                    <!-- PRESET QUICK BUTTONS -->
                    <div class="flex flex-wrap items-center gap-1.5 pt-1">
                        <span class="text-[10px] text-slate-400 font-semibold">Preset Cepat:</span>
                        <button onclick="app.NovelWriterModule.state.mainInstruction = 'Gunakan POV Orang Ketiga Serba Tahu dengan alur yang mencekam dan kaya sensasi panca indera.'; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.refreshUI();" class="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300">👁️ POV 3 Deskriptif</button>
                        <button onclick="app.NovelWriterModule.state.mainInstruction = 'Gunakan POV Orang Pertama (Aku), fokus pada monolog dalam diri dan emosi mendalam.'; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.refreshUI();" class="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300">👤 POV 1 Introspektif</button>
                        <button onclick="app.NovelWriterModule.state.mainInstruction = 'Gunakan gaya penulisan fantasi epik, tempo cepat saat pertarungan, dan dialog tegas.'; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.refreshUI();" class="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300">⚔️ Fantasi Epik</button>
                    </div>
                </div>

                <!-- DYNAMIC TAB CONTENT -->
                ${this.state.activeTab === 'selection' ? this.renderSelectionPanel(db) : ''}
                ${this.state.activeTab === 'attributes' ? this.renderAttributeFilterUI() : ''}

                <!-- PANEL CONFIG & FILE REFERENSI -->
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-4 shadow-md">
                    <div class="flex justify-between items-center border-b border-slate-700 pb-2">
                        <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                            🎬 Konfigurasi & File Referensi
                        </h3>
                    </div>

                    <!-- AI CONFIG SELECTOR BAR (MODEL & MAX TOKENS) -->
                    <div class="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                            <label class="block text-[11px] font-semibold text-indigo-300 mb-1">🤖 Model AI</label>
                            <select 
                                onchange="app.NovelWriterModule.updateAIConfigField('model', this.value)"
                                class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="gemini-3.1-flash-lite" ${aiConfig.model === 'gemini-3.1-flash-lite' ? 'selected' : ''}>Gemini 3.1 Flash Lite</option>
                                <option value="gemini-3-flash" ${aiConfig.model === 'gemini-3-flash' ? 'selected' : ''}>Gemini 3 Flash</option>
                                <option value="gemini-3.5-flash-lite" ${aiConfig.model === 'gemini-3.5-flash-lite' ? 'selected' : ''}>Gemini 3.5 Flash Lite</option>
                                <option value="gemini-3.5-flash" ${aiConfig.model === 'gemini-3.5-flash' ? 'selected' : ''}>Gemini 3.5 Flash</option>
                                <option value="gemini-3.6-flash" ${aiConfig.model === 'gemini-3.6-flash' ? 'selected' : ''}>Gemini 3.6 Flash</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-indigo-300 mb-1">🔢 Max Output Tokens</label>
                            <select 
                                onchange="app.NovelWriterModule.updateAIConfigField('maxOutputTokens', this.value)"
                                class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="1024" ${Number(aiConfig.maxOutputTokens) === 1024 ? 'selected' : ''}>1,024 Token (~750 kata)</option>
                                <option value="2048" ${Number(aiConfig.maxOutputTokens) === 2048 ? 'selected' : ''}>2,048 Token (~1,500 kata)</option>
                                <option value="4096" ${Number(aiConfig.maxOutputTokens) === 4096 ? 'selected' : ''}>4,096 Token (~3,000 kata)</option>
                                <option value="8192" ${Number(aiConfig.maxOutputTokens) === 8192 ? 'selected' : ''}>8,192 Token (~6,000 kata)</option>
                            </select>
                        </div>
                    </div>

                    <!-- KELOLA FILE REFERENSI (.TXT DICTIONARY) -->
                    <div class="border-t border-slate-700/80 pt-3 space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label class="block text-[11px] font-semibold text-slate-300">📁 Dictionary File Referensi (.txt)</label>
                            <input 
                                type="file" 
                                accept=".txt"
                                multiple
                                class="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                                onchange="app.NovelWriterModule.handleFileUploads(this.files);"
                            />
                        </div>

                        ${refFileKeys.length > 0 ? `
                            <div class="flex flex-wrap gap-2 pt-1">
                                ${refFileKeys.map(fileName => `
                                    <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 text-xs px-2.5 py-1 rounded-full text-indigo-300">
                                        <span>📄 ${fileName}</span>
                                        <span class="text-[10px] text-slate-500">(${this.state.referenceFiles[fileName].length} kar)</span>
                                        <button 
                                            onclick="app.NovelWriterModule.removeReferenceFile('${fileName.replace(/'/g, "\\'")}')"
                                            class="text-rose-400 hover:text-rose-300 font-bold ml-1"
                                            title="Hapus file"
                                        >✕</button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-[11px] text-slate-500 italic">Belum ada file .txt yang diunggah ke dictionary referensi.</p>
                        `}
                    </div>
                </div>

                <!-- INTEGRATED PANEL: SHORTCUTS & INPUT PROMPT -->
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-4 shadow-md">
                    
                    <!-- CONTAINER KHUSUS SUB-PANEL SHORTCUT -->
                    <div id="nw-shortcuts-list-container">
                        ${this.renderShortcutPanel(db)}
                    </div>

                    <!-- PROMPT SCENE TEXTAREA (Aman tersimpan otomatis) -->
                    <div class="space-y-1.5 border-t border-slate-700/60 pt-3">
                        <label class="block text-xs font-bold text-indigo-300 uppercase tracking-wide">
                            📝 Text Prompt Scene / Instruksi Adegan
                        </label>
                        <textarea 
                            rows="6"
                            placeholder="Contoh: Tokoh utama memasuki perpustakaan terlarang di malam hari. Tiba-tiba ia mendengar langkah kaki misterius di balik rak buku..."
                            class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                            oninput="
                                app.NovelWriterModule.state.generatePrompt = this.value;
                                app.NovelWriterModule.novelWriterSaveState();
                            "
                        >${this.state.generatePrompt}</textarea>
                    </div>

                    <!-- TOMBOL UTAMA AI GENERATOR -->
                    <div class="pt-1">
                        <button 
                            id="btnGenerateNovel"
                            onclick="app.NovelWriterModule.generateNovelWithAI()"
                            class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                        >
                            ✨ Tulis / Lanjutkan Narasi Novel dengan AI
                        </button>
                    </div>
                </div>

                <!-- OUTPUT STUDIO NOVEL EDITOR -->
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3 shadow-md">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700 pb-2">
                        <div class="flex items-center gap-2">
                            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                                📖 Output Naskah Novel
                            </h3>
                            <span id="nw-word-count" class="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                                ${this.state.outputContent.trim() ? this.state.outputContent.trim().split(/\s+/).length : 0} kata
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-1.5 text-xs">
                            <button 
                                onclick="app.NovelWriterModule.clearOutput();"
                                class="bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded transition text-[11px]"
                            >🗑️ Bersihkan</button>
                            <button 
                                onclick="app.NovelWriterModule.copyOutputToClipboard()"
                                class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded transition text-[11px]"
                            >📋 Salin Teks</button>
                            <button 
                                onclick="app.NovelWriterModule.downloadOutputAsTxt()"
                                class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition text-[11px] font-semibold shadow"
                            >💾 Download .txt</button>
                        </div>
                    </div>

                    <textarea 
                        id="novel-output-area"
                        rows="16"
                        placeholder="Hasil generasi novel dari AI akan ditampilkan di sini..."
                        style="line-height: 1.8; word-spacing: 0.05em;"
                        class="w-full bg-slate-900 border border-slate-700 rounded p-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-serif leading-relaxed"
                        oninput="
                            app.NovelWriterModule.state.outputContent = this.value;
                            app.NovelWriterModule.updateWordCountUI(this.value);
                            app.NovelWriterModule.novelWriterSaveState();
                        "
                    >${this.state.outputContent}</textarea>
                </div>
            </div>
        `;
    },

    // SUB-PANEL: SHORTCUTS BAR
    renderShortcutPanel(providedDb = null) {
        const topChars = this.getTopEntities('characters', 10);
        const hiddenLocIds = this.getImplicitHiddenLocationIds(providedDb);
        const topLocs = this.getTopEntities('locations', 10)
                            .filter(l => !hiddenLocIds.has(l.id))
                            .slice(0, 5);

        return `
            <div class="bg-slate-900/60 p-3 rounded-lg border border-slate-700/80 space-y-2 text-xs">
                <div class="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                    <span class="font-bold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                        ⚡ Shortcuts Paling Sering Digunakan
                    </span>
                    <span class="text-[10px] text-slate-400 italic">Klik badge untuk memilih/membatalkan dengan cepat</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- Top 10 Karakter -->
                    <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-1">👤 Top 10 Karakter Sering Digunakan:</span>
                        <div class="flex flex-wrap gap-1">
                            ${topChars.length === 0 ? '<span class="text-[10px] text-slate-500 italic">Belum ada data karakter.</span>' : topChars.map(c => {
                                const isSelected = this.state.selectedCharacterIds.includes(c.id);
                                return `
                                    <button 
                                        onclick="app.NovelWriterModule.toggleCharacterSelection('${c.id}')"
                                        class="px-2 py-0.5 rounded text-[11px] border transition flex items-center gap-1 ${isSelected ? 'bg-indigo-600 border-indigo-400 text-white font-semibold' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}"
                                    >
                                        <span>${c.name}</span>
                                        ${isSelected ? '✓' : ''}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Top 5 Lokasi -->
                    <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-1">📍 Top 5 Tempat Sering Digunakan:</span>
                        <div class="flex flex-wrap gap-1">
                            ${topLocs.length === 0 ? '<span class="text-[10px] text-slate-500 italic">Belum ada data lokasi.</span>' : topLocs.map(l => {
                                const isSelected = this.state.selectedLocationIds.includes(l.id);
                                return `
                                    <button 
                                        onclick="app.NovelWriterModule.toggleLocationSelection('${l.id}')"
                                        class="px-2 py-0.5 rounded text-[11px] border transition flex items-center gap-1 ${isSelected ? 'bg-emerald-600 border-emerald-400 text-white font-semibold' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}"
                                    >
                                        <span>${l.name}</span>
                                        ${isSelected ? '✓' : ''}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // FUNGSI PEMBANTU UNTUK FORMAT PARAGRAF NOVEL
    formatAIOutput(rawText) {
        if (!rawText) return '';
        return rawText
            .replace(/\r\n/g, '\n')
            .split(/\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .join('\n\n');
    },

    // SUB-PANEL: SELEKSI KONTEKS ENTITAS (4 BOX GRID)
    renderSelectionPanel(db) {
        return `
            <div class="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <!-- 1. SEMESTA -->
                    <div class="bg-slate-900/90 p-3 rounded border border-slate-700 flex flex-col h-64">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-amber-300 flex items-center gap-1">
                                🌌 Semesta <span id="nw-universe-count">(${this.state.selectedUniverseIds.length})</span>
                            </span>
                            <button onclick="app.NovelWriterModule.state.selectedUniverseIds = []; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.updateListUI('universe');" class="text-[10px] text-slate-500 hover:text-rose-400">Reset</button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari semesta..." 
                            value="${this.state.universeSearchQuery}"
                            class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-[11px] mb-2 text-slate-200 focus:outline-none focus:border-amber-500"
                            oninput="app.NovelWriterModule.state.universeSearchQuery = this.value; app.NovelWriterModule.updateListUI('universe');"
                        />
                        <div id="nw-universe-list-items" class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            ${this.renderUniverseItems(db)}
                        </div>
                    </div>

                    <!-- 2. KARAKTER -->
                    <div class="bg-slate-900/90 p-3 rounded border border-slate-700 flex flex-col h-64">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-indigo-300 flex items-center gap-1">
                                👤 Karakter <span id="nw-character-count">(${this.state.selectedCharacterIds.length})</span>
                            </span>
                            <button onclick="app.NovelWriterModule.state.selectedCharacterIds = []; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.updateListUI('character'); app.NovelWriterModule.updateShortcutUI();" class="text-[10px] text-slate-500 hover:text-rose-400">Reset</button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari karakter..." 
                            value="${this.state.charSearchQuery}"
                            class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-[11px] mb-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                            oninput="app.NovelWriterModule.state.charSearchQuery = this.value; app.NovelWriterModule.updateListUI('character');"
                        />
                        <div id="nw-character-list-items" class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            ${this.renderCharacterItems(db)}
                        </div>
                    </div>

                    <!-- 3. MONSTER -->
                    <div class="bg-slate-900/90 p-3 rounded border border-slate-700 flex flex-col h-64">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-rose-300 flex items-center gap-1">
                                🐉 Monster/Musuh <span id="nw-monster-count">(${this.state.selectedMonsterIds.length})</span>
                            </span>
                            <button onclick="app.NovelWriterModule.state.selectedMonsterIds = []; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.updateListUI('monster');" class="text-[10px] text-slate-500 hover:text-rose-400">Reset</button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari monster..." 
                            value="${this.state.monsterSearchQuery}"
                            class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-[11px] mb-2 text-slate-200 focus:outline-none focus:border-rose-500"
                            oninput="app.NovelWriterModule.state.monsterSearchQuery = this.value; app.NovelWriterModule.updateListUI('monster');"
                        />
                        <div id="nw-monster-list-items" class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            ${this.renderMonsterItems(db)}
                        </div>
                    </div>

                    <!-- 4. LOKASI -->
                    <div class="bg-slate-900/90 p-3 rounded border border-slate-700 flex flex-col h-64">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-emerald-300 flex items-center gap-1">
                                📍 Lokasi Terlibat <span id="nw-location-count">(${this.state.selectedLocationIds.length})</span>
                            </span>
                            <button onclick="app.NovelWriterModule.state.selectedLocationIds = []; app.NovelWriterModule.novelWriterSaveState(); app.NovelWriterModule.updateListUI('location'); app.NovelWriterModule.updateShortcutUI();" class="text-[10px] text-slate-500 hover:text-rose-400">Reset</button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari lokasi..." 
                            value="${this.state.locSearchQuery}"
                            class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-[11px] mb-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                            oninput="app.NovelWriterModule.state.locSearchQuery = this.value; app.NovelWriterModule.updateListUI('location');"
                        />
                        <div id="nw-location-list-items" class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            ${this.renderLocationItems(db)}
                        </div>
                    </div>

                </div>
            </div>
        `;
    },

    // ITEM RENDERERS (DENGAN FEATURE PIN ITEM TERPILIH DI PALING ATAS & SELALU TAMPIL)
    renderUniverseItems(providedDb = null) {
        const universes = this.getAllUniverses(providedDb);
        const q = this.state.universeSearchQuery.toLowerCase().trim();
        const selected = this.state.selectedUniverseIds;

        // Filter: Selalu sertakan yang tercentang OR yang cocok dengan kata kunci
        const filtered = universes.filter(u => {
            const isSelected = selected.includes(u.id);
            if (isSelected) return true;
            if (!q) return true;
            return (u.name && u.name.toLowerCase().includes(q)) ||
                   (u.description && u.description.toLowerCase().includes(q));
        });

        // Urutkan: Yang tercentang muncul paling atas
        filtered.sort((a, b) => {
            const aSel = selected.includes(a.id) ? 1 : 0;
            const bSel = selected.includes(b.id) ? 1 : 0;
            return bSel - aSel;
        });

        if (filtered.length === 0) return '<p class="text-[10px] text-slate-500 italic p-1">Semesta tidak ditemukan.</p>';

        return filtered.map(u => {
            const isChecked = selected.includes(u.id);
            return `
                <label class="flex items-center gap-2 p-1 hover:bg-slate-800 rounded cursor-pointer select-none text-[11px]">
                    <input 
                        type="checkbox" 
                        ${isChecked ? 'checked' : ''} 
                        onchange="app.NovelWriterModule.toggleUniverseSelection('${u.id}', this.checked)"
                        class="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0"
                    />
                    <span class="truncate ${isChecked ? 'text-amber-300 font-semibold' : 'text-slate-300'}">${u.name}</span>
                </label>
            `;
        }).join('');
    },

    renderCharacterItems(providedDb = null) {
        const characters = this.getAllCharacters(providedDb);
        const q = this.state.charSearchQuery.toLowerCase().trim();
        const selected = this.state.selectedCharacterIds;

        // Filter: Selalu sertakan yang tercentang OR yang cocok dengan kata kunci
        const filtered = characters.filter(c => {
            const isSelected = selected.includes(c.id);
            if (isSelected) return true;
            if (!q) return true;
            return (c.name && c.name.toLowerCase().includes(q)) ||
                   (c.universeName && c.universeName.toLowerCase().includes(q));
        });

        // Urutkan: Yang tercentang muncul paling atas
        filtered.sort((a, b) => {
            const aSel = selected.includes(a.id) ? 1 : 0;
            const bSel = selected.includes(b.id) ? 1 : 0;
            return bSel - aSel;
        });

        if (filtered.length === 0) return '<p class="text-[10px] text-slate-500 italic p-1">Karakter tidak ditemukan.</p>';

        return filtered.map(c => {
            const isChecked = selected.includes(c.id);
            return `
                <label class="flex items-center gap-2 p-1 hover:bg-slate-800 rounded cursor-pointer select-none text-[11px]">
                    <input 
                        type="checkbox" 
                        ${isChecked ? 'checked' : ''} 
                        onchange="app.NovelWriterModule.toggleCharacterSelection('${c.id}', this.checked)"
                        class="rounded bg-slate-800 border-slate-600 text-indigo-600 focus:ring-0"
                    />
                    <span class="truncate ${isChecked ? 'text-indigo-300 font-semibold' : 'text-slate-300'}">${c.name}</span>
                </label>
            `;
        }).join('');
    },

    renderMonsterItems(providedDb = null) {
        const monsters = this.getAllMonsters(providedDb);
        const q = this.state.monsterSearchQuery.toLowerCase().trim();
        const selected = this.state.selectedMonsterIds;

        // Filter: Selalu sertakan yang tercentang OR yang cocok dengan kata kunci
        const filtered = monsters.filter(m => {
            const isSelected = selected.includes(m.id);
            if (isSelected) return true;
            if (!q) return true;
            return (m.name && m.name.toLowerCase().includes(q)) ||
                   (m.universeName && m.universeName.toLowerCase().includes(q));
        });

        // Urutkan: Yang tercentang muncul paling atas
        filtered.sort((a, b) => {
            const aSel = selected.includes(a.id) ? 1 : 0;
            const bSel = selected.includes(b.id) ? 1 : 0;
            return bSel - aSel;
        });

        if (filtered.length === 0) return '<p class="text-[10px] text-slate-500 italic p-1">Monster tidak ditemukan.</p>';

        return filtered.map(m => {
            const isChecked = selected.includes(m.id);
            return `
                <label class="flex items-center gap-2 p-1 hover:bg-slate-800 rounded cursor-pointer select-none text-[11px]">
                    <input 
                        type="checkbox" 
                        ${isChecked ? 'checked' : ''} 
                        onchange="app.NovelWriterModule.toggleMonsterSelection('${m.id}', this.checked)"
                        class="rounded bg-slate-800 border-slate-600 text-rose-600 focus:ring-0"
                    />
                    <span class="truncate ${isChecked ? 'text-rose-300 font-semibold' : 'text-slate-300'}">${m.name}</span>
                </label>
            `;
        }).join('');
    },

    renderLocationItems(providedDb = null) {
        const locations = this.getAllLocations(providedDb);
        const q = this.state.locSearchQuery.toLowerCase().trim();
        const selected = this.state.selectedLocationIds;

        // Dapatkan semua ID child yang otomatis diwakili oleh parent-nya
        const hiddenLocationIds = this.getImplicitHiddenLocationIds(providedDb);

        const filtered = locations.filter(l => {
            // Sembunyikan child dari antarmuka jika parent-nya sudah dicentang
            if (hiddenLocationIds.has(l.id)) return false;

            const isSelected = selected.includes(l.id);
            if (isSelected) return true;
            if (!q) return true;
            return (l.name && l.name.toLowerCase().includes(q)) ||
                (l.path && l.path.toLowerCase().includes(q));
        });

        // Urutkan: Yang tercentang muncul paling atas
        filtered.sort((a, b) => {
            const aSel = selected.includes(a.id) ? 1 : 0;
            const bSel = selected.includes(b.id) ? 1 : 0;
            return bSel - aSel;
        });

        if (filtered.length === 0) return '<p class="text-[10px] text-slate-500 italic p-1">Lokasi tidak ditemukan.</p>';

        return filtered.map(l => {
            const isChecked = selected.includes(l.id);
            return `
                <label class="flex items-center gap-2 p-1 hover:bg-slate-800 rounded cursor-pointer select-none text-[11px]">
                    <input 
                        type="checkbox" 
                        ${isChecked ? 'checked' : ''} 
                        onchange="app.NovelWriterModule.toggleLocationSelection('${l.id}', this.checked)"
                        class="rounded bg-slate-800 border-slate-600 text-emerald-600 focus:ring-0"
                    />
                    <span class="truncate ${isChecked ? 'text-emerald-300 font-semibold' : 'text-slate-300'}">${l.name}</span>
                </label>
            `;
        }).join('');
    },

    // SUB-PANEL: FILTER ATRIBUT GLOBAL
    renderAttributeFilterUI() {
        const attrs = this.state.globalAttributes;
        return `
            <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
                <div class="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">⚙️ Filter Atribut Karakter & Monster</h4>
                    <span class="text-[10px] text-slate-400 italic">* Centang atribut yang ingin dimasukkan ke dalam konteks AI</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs text-slate-300">
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 opacity-75 cursor-not-allowed select-none" title="Info Dasar selalu diikutsertakan">
                        <input type="checkbox" checked disabled class="rounded bg-slate-800 border-slate-600 text-indigo-500 cursor-not-allowed">
                        <span class="font-semibold text-indigo-300">Info Dasar (Wajib)</span>
                    </label><label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 opacity-75 cursor-not-allowed select-none" title="Kepribadian selalu diikutsertakan">
                        <input type="checkbox" checked disabled class="rounded bg-slate-800 border-slate-600 text-indigo-500 cursor-not-allowed">
                        <span class="font-semibold text-indigo-300">Kepribadian (Wajib)</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.background ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('background', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Latar Belakang</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.appearance ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('appearance', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Penampilan</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.skillIds ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('skillIds', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Skill / Jurus</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.itemIds ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('itemIds', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Item / Senjata</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.familiarIds ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('familiarIds', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Familiar / Servant</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.dialogues ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('dialogues', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Gaya Dialog</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.notes ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('notes', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Catatan</span>
                    </label>
                    <label class="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-700/60 hover:bg-slate-900 cursor-pointer select-none">
                        <input type="checkbox" ${attrs.relations ? 'checked' : ''} onchange="app.NovelWriterModule.setAttribute('relations', this.checked)" class="rounded bg-slate-800 border-slate-600 text-indigo-500">
                        <span>Hubungan/Relasi</span>
                    </label>
                </div>
            </div>
        `;
    }
};