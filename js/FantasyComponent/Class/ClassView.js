export const ClassView = {
    // ==========================================
    // --- RENDER VIEW UTAMA ---
    // ==========================================
    
    renderClassView() {
        const classList = this.data?.classes || [];

        return `
            <div class="flex flex-col gap-6 relative">
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                    
                    <!-- Header Panel -->
                    <div class="bg-slate-700/50 p-4 flex justify-between items-center border-b border-slate-700">
                        <div>
                            <h3 class="font-bold text-slate-200 text-lg flex items-center gap-2">
                                ⚔️ Master Daftar Class / Profesi
                                <span class="text-xs bg-indigo-600 px-2 py-0.5 rounded-full text-white">${classList.length}</span>
                            </h3>
                            <p class="text-xs text-slate-400 mt-1">Kelola data class atau profesi untuk dikaitkan dengan karakter Anda.</p>
                        </div>
                        <button onclick="app.openAddClassForm()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 shadow">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Tambah Class Baru
                        </button>
                    </div>

                    <!-- Form Input / Edit Class (Collapsible) -->
                    <div id="classFormPanel" class="hidden p-4 bg-slate-800/90 border-b border-slate-700 space-y-4">
                        <div class="flex justify-between items-center border-b border-slate-700/60 pb-2">
                            <h4 id="classFormTitle" class="text-sm font-bold text-indigo-400">Buat Class Baru</h4>
                            <button onclick="app.closeClassForm()" class="text-xs text-slate-400 hover:text-white">&times; Tutup</button>
                        </div>

                        <div class="space-y-4 max-w-xl">
                            <div>
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Class <span class="text-rose-400">*</span></label>
                                <input type="text" id="newClassName" placeholder="Contoh: Warrior, Mage, Assassin" 
                                    class="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none shadow-inner">
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Deskripsi Class</label>
                                <textarea id="newClassDesc" rows="3" placeholder="Tulis deskripsi profesi, keunggulan stat, atau peran class ini..." 
                                    class="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none shadow-inner resize-y"></textarea>
                            </div>

                            <!-- Panel Penautan Skill -->
                            <div class="bg-slate-900/50 p-3 rounded border border-slate-700">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                    Tautkan Skill Class (Opsional)
                                </label>
                                <input type="text" id="classSkillSearch" placeholder="Cari skill berdasarkan nama/tag..." 
                                    class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-slate-200 mb-2 focus:border-indigo-500 focus:outline-none"
                                    oninput="app.onClassSkillSearchInput(event)">
                                <div id="classSkillList" class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                    <!-- Checkbox skill dirender di sini via JS -->
                                </div>
                            </div>

                            <div class="flex justify-end gap-2 pt-2">
                                <button onclick="app.closeClassForm()" class="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-300 transition">
                                    Batal
                                </button>
                                <button id="saveClassBtn" onclick="app.saveClass()" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition shadow">
                                    Simpan Class
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Search Bar Panel -->
                    <div class="p-4 bg-slate-800/50 border-b border-slate-700/80">
                        <div class="relative max-w-md">
                            <input type="text" id="searchClassInput" value="${app.currentClassFilter || ''}" placeholder="Cari class berdasarkan nama atau deskripsi..." 
                                class="bg-slate-900 border border-slate-700 rounded p-2.5 pl-9 text-sm w-full focus:border-indigo-500 focus:outline-none transition" 
                                oninput="app.onSearchClassInput(event)">
                            <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    <!-- List Kartu Class -->
                    <div class="p-5">
                        <div id="classCardsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${this.renderClassCards()}
                        </div>
                    </div>

                </div>

                <!-- FLOATING DETAIL PANEL (DRAGGABLE WINDOW) -->
                <div id="floatingClassDetail" 
                    class="hidden fixed bottom-6 right-6 w-96 max-w-[90vw] max-h-[80vh] bg-slate-800 border-2 border-indigo-500/50 rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 shadow-indigo-900/20">
                    
                    <!-- Header Jendela -->
                    <div onmousedown="app.startDragClass(event, 'floatingClassDetail')" 
                        class="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 py-3 flex justify-between items-center rounded-t-xl cursor-move border-b border-indigo-500/30 select-none shrink-0">
                        <span id="floatingClassTitle" class="font-bold text-sm text-white truncate pr-4 pointer-events-none">Detail Class</span>
                        <button onclick="event.stopPropagation(); app.closeClassDetailFloating()" class="text-indigo-200 hover:text-white transition font-bold text-lg leading-none cursor-pointer" title="Tutup Jendela">&times;</button>
                    </div>

                    <!-- Area Konten -->
                    <div class="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        <div>
                            <span class="font-semibold text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">Deskripsi & Peran:</span>
                            <div id="floatingClassDesc" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words w-full"></div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    },

    // ==========================================
    // --- LOGIKA SEARCH & FILTERING ---
    // ==========================================

    onSearchClassInput(event) {
        app.currentClassFilter = event.target.value;
        this.refreshClassUI();
    },

    getFilteredClasses() {
        const keyword = (app.currentClassFilter || '').toLowerCase().trim();
        const allClasses = this.data?.classes || app.data?.classes || [];

        let filtered = allClasses;
        if (keyword) {
            filtered = allClasses.filter(cls => 
                cls.name.toLowerCase().includes(keyword) || 
                (cls.description && cls.description.toLowerCase().includes(keyword))
            );
        }

        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    },

    // ==========================================
    // --- RENDER CARD GRID ---
    // ==========================================

    renderClassCards() {
        const classList = this.getFilteredClasses();

        if (classList.length === 0) {
            return `<p class="text-sm text-slate-500 italic col-span-full text-center py-6 border border-dashed border-slate-700 rounded-lg">Tidak ada class yang ditemukan.</p>`;
        }

        return classList.map(cls => {
            const skillCount = cls.skillIds ? cls.skillIds.length : 0;
            
            return `
            <div onclick="app.showClassDetailFloating('${cls.id}')" 
                class="bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 transition rounded-lg p-4 flex flex-col justify-between shadow-md group cursor-pointer h-full min-h-[110px] relative overflow-hidden">
                
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-slate-200 text-base group-hover:text-indigo-400 transition-colors truncate pr-2" title="${cls.name}">${cls.name}</h4>
                        
                        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onclick="event.stopPropagation(); app.openEditClassForm('${cls.id}')" class="p-1 text-slate-400 hover:text-amber-400 transition bg-slate-800 rounded border border-slate-700" title="Edit Class">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onclick="event.stopPropagation(); app.deleteClass('${cls.id}')" class="p-1 text-slate-400 hover:text-rose-400 transition bg-slate-800 rounded border border-slate-700" title="Hapus Class">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>

                    <p class="text-xs text-slate-400 leading-relaxed line-clamp-3 overflow-hidden text-ellipsis mb-2">
                        ${cls.description || '<span class="italic text-slate-600">Tidak ada deskripsi.</span>'}
                    </p>
                    
                    ${skillCount > 0 ? `<div class="mt-2 text-[10px] text-yellow-500/80 font-medium bg-yellow-900/30 inline-block px-2 py-0.5 rounded border border-yellow-700/50">✦ ${skillCount} Skill Tertaut</div>` : ''}
                </div>

                <div class="mt-3 flex justify-between items-center pt-2 border-t border-slate-800/80 text-[10px] text-indigo-400 font-medium">
                    <span>Klik untuk detail lengkap</span>
                    <svg class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
        `}).join('');
    },

    refreshClassUI() {
        const container = document.getElementById('classCardsContainer');
        if (container) {
            container.innerHTML = this.renderClassCards();
        }
    }
}