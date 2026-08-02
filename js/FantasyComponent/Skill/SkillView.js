// Logika render skill

export const SkillView = {
    // ==========================================
    // --- RENDER VIEW UTAMA (SKILLS & TAGS) ---
    // ==========================================
    renderSkillsView() {
        const daftarSemesta = app.data?.universes || [];

        return `
            <div class="flex flex-col gap-6 relative">
                
                <!-- BAGIAN MANAJEMEN TAG -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                        <div class="bg-slate-700/50 p-3 flex justify-between">
                            <h3 class="font-semibold text-slate-200">Daftar Tag Skill <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.skillTags.length}</span></h3>
                        </div>
                        <div id="tagsPanel" class="p-4 space-y-4 ${this.getPanelClass('tagsPanel', '')}">
                            <div class="flex space-x-2 max-w-md"> 
                                <input type="text" id="newSkillTagName" placeholder="Nama Tag Baru" class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <button onclick="app.addSkillTag()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded font-bold transition">+</button>
                            </div>
                            <div class="flex flex-wrap gap-2"> 
                                <button onclick="app.autoloadSkillTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Autoload Tag dari Skill
                                </button>
                                <button onclick="app.cleanInvalidSkillTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Bersihkan Tag Invalid
                                </button>
                                <button onclick="app.exportSkills()" class="bg-amber-600 hover:bg-amber-500 text-white text-xs py-2 px-3 rounded flex justify-center items-center font-medium shadow transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Export Data Skill (.json)
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2 pt-2">
                                ${this.data.skillTags.length === 0 ? '<p class="text-xs text-slate-500 w-full text-center py-2">Belum ada tag.</p>' : ''}
                                ${this.data.skillTags.slice().sort((a, b) => a.name.localeCompare(b.name)).map(t => `
                                    <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center group">
                                        ${t.name}
                                        <button onclick="app.editSkillTag('${t.id}')" class="ml-2 text-slate-400 hover:text-amber-400 hidden group-hover:block transition" title="Edit Tag">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onclick="app.deleteSkillTag('${t.id}')" class="ml-1 text-slate-500 hover:text-rose-400 hidden group-hover:block transition" title="Hapus Tag">&times;</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BAGIAN MANAJEMEN SKILL -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                        <div class="bg-slate-700/50 p-3 flex justify-between items-center">
                            <h3 class="font-semibold text-slate-200">Daftar Skill <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.skills.length}</span></h3>
                            <button onclick="event.stopPropagation(); app.openAddSkill()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition shadow-sm font-medium flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                Tambah Skill
                            </button>
                        </div>
                        <div id="skillsPanel" class="p-4 ${this.getPanelClass('skillsPanel', '')}">
                            
                            <!-- Search Bar -->
                            <div class="mb-4 relative">
                                <input type="text" id="searchSkillInput" value="${app.currentSkillFilter || ''}" placeholder="Cari skill atau filter berdasarkan tag..." class="bg-slate-900 border border-slate-700 rounded p-2.5 pl-9 text-sm w-full focus:border-indigo-500 focus:outline-none transition" oninput="app.onSearchSkillInput(event)">                                
                                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            
                            <!-- FORM TAMBAH / EDIT SKILL (Hidden by default) -->
                            <div id="addSkillForm" class="${this.getPanelClass('addSkillForm')} bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                <button onclick="app.setPanelState('addSkillForm', false); app.editSkillId = null;" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition text-lg">&times;</button>
                                <h4 id="skillFormTitle" class="text-sm font-bold text-indigo-400 mb-4 border-b border-slate-700 pb-2">Buat Skill Baru</h4>
                                
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Skill <span class="text-rose-400">*</span></label>
                                    <input type="text" id="newSkillName" placeholder="Contoh: Bola Api / Shadow Step" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Tag Skill:</label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-3 max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                                        ${this.data.skillTags.length === 0 ? '<span class="text-xs text-slate-500 italic col-span-full">Belum ada tag skill.</span>' : ''}
                                        ${this.data.skillTags.slice().sort((a, b) => a.name.localeCompare(b.name)).map(t => `
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" value="${t.id}" class="tagCheck rounded text-indigo-600 bg-slate-900 border-slate-600 focus:ring-indigo-500">
                                                <span class="truncate text-slate-300 hover:text-white transition">${t.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Pengaturan Konteks AI (Volatile) -->
                                <div class="bg-indigo-900/10 border border-indigo-500/20 rounded p-3 mb-4">
                                    <h5 class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <span>✨</span> Konteks AI Enchanter (Opsional)
                                    </h5>
                                    <div class="flex flex-col sm:flex-row gap-3">
                                        <select id="aiSkillUniverse" class="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-300 focus:border-indigo-500 outline-none transition">
                                            <option value="">-- Tanpa Referensi Semesta --</option>
                                            ${daftarSemesta.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                                        </select>
                                        <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                                            <input type="checkbox" id="aiSkillDeepLore" class="rounded text-indigo-500 bg-slate-900 border-slate-600">
                                            <span>Sertakan Informasi Tempat (Mendalam)</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <div class="flex justify-between items-end mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latar Belakang / Asal Usul Skill</label>
                                        <button id="btnAiSkillBg" onclick="app.generateSkillAI('background')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                            ✨ Enchant Asal Usul
                                        </button>
                                    </div>
                                    <textarea id="newSkillBg" placeholder="Dari mana skill ini berasal? Siapa yang menciptakannya? Tulis draf untuk AI..." class="bg-slate-800 border border-slate-600 rounded p-2.5 text-sm w-full outline-none focus:border-indigo-500" rows="3"></textarea>
                                </div>

                                <div class="mb-4">
                                    <div class="flex justify-between items-end mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deskripsi / Efek Skill</label>
                                        <button id="btnAiSkillDesc" onclick="app.generateSkillAI('description')" class="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                            ✨ Enchant Efek
                                        </button>
                                    </div>
                                    <textarea id="newSkillDesc" placeholder="Apa efek dari skill ini? Berapa kerusakannya atau fungsinya? Tulis draf untuk AI..." class="bg-slate-800 border border-slate-600 rounded p-2.5 text-sm w-full outline-none focus:border-indigo-500" rows="4"></textarea>
                                </div>
                                
                                <div class="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-700/60">
                                    <button onclick="app.setPanelState('addSkillForm', false); app.editSkillId = null;" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm transition">Batal</button>
                                    <button id="saveSkillBtn" onclick="app.saveSkill()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition shadow-sm">Simpan Skill</button>
                                </div>
                            </div>

                            <!-- DAFTAR SKILL (KARTU KECIL BERJAJAR DALAM GRID) -->
                <div id="skillGridContainer" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <!-- Rendered via renderSkillGrid() -->
                </div>
            </div>
        </div>
    </div>

    <!-- FLOATING DETAIL PANEL (MENGAMBANG SEPERTI WINDOWS) -->
    <div id="floatingSkillDetail" class="hidden fixed bottom-6 right-6 w-96 max-w-[90vw] bg-slate-800 border-2 border-indigo-500/50 rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 shadow-indigo-900/20">
        <!-- Header Jendela (Area Handle Drag) -->
        <div onmousedown="app.startDragSkill(event, 'floatingSkillDetail')" class="bg-gradient-to-r from-indigo-700 to-indigo-900 px-4 py-3 flex justify-between items-center rounded-t-xl cursor-move border-b border-indigo-500/30 select-none">
            <span id="floatingSkillTitle" class="font-bold text-sm text-white truncate pr-4 pointer-events-none">Detail Skill</span>
            <button onclick="event.stopPropagation(); app.closeSkillDetailFloating()" class="text-indigo-200 hover:text-white transition font-bold text-lg leading-none cursor-pointer" title="Tutup Jendela">&times;</button>
        </div>
        <!-- Konten Jendela -->
        <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div>
                            <span class="font-semibold text-indigo-400 uppercase tracking-wider text-[10px] block mb-1.5">Tags Kategori:</span>
                            <div id="floatingSkillTags" class="flex flex-wrap gap-1.5"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-yellow-500 uppercase tracking-wider text-[10px] block mb-1.5">Latar Belakang / Asal Usul:</span>
                            <div id="floatingSkillBg" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1.5">Deskripsi / Efek:</span>
                            <div id="floatingSkillDesc" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"></div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    },

    
    // ==========================================
    // --- RENDER GRID DAN CARD ---
    // ==========================================
    renderSkillGrid() {
        const container = document.getElementById('skillGridContainer');
        if(!container) return;

        // Gunakan fungsi helper global filter skill
        const filtered = this.getFilteredSkills();

        if (filtered.length === 0) {
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8 bg-slate-800/50 rounded border border-dashed border-slate-700">Tidak ada skill yang ditemukan.</p>`;
            return;
        }

        container.innerHTML = filtered.map(s => this.renderSkillCard(s)).join('');
    },

    renderSkillCard(skill) {
        // Mengambil maks 2 tag teratas
        const limitedTagIds = (skill.tagIds || []).slice(0, 2);
        
        // Menghitung jumlah tag yang tersembunyi/tidak ditampilkan
        const extraTagCount = Math.max(0, (skill.tagIds || []).length - 2);

        // Render komponen HTML untuk 2 tag teratas
        const skillTagsHtml = limitedTagIds.map(id => {
            const tag = this.data.skillTags.find(t => t.id === id);
            return tag ? `<span class="bg-indigo-900/60 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded border border-indigo-700/50 truncate max-w-[75px] block" title="${tag.name}">${tag.name}</span>` 
                       : `<span class="bg-rose-900/60 text-rose-300 text-[9px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join('');

        // Jika ada sisa tag, tambahkan lencana "+X" di akhir tag
        const extraTagBadge = extraTagCount > 0 
            ? `<span class="bg-slate-700 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-600 font-medium" title="Dan ${extraTagCount} tag lainnya...">+${extraTagCount}</span>` 
            : '';

        return `
        <div onclick="app.showSkillDetailFloating('${skill.id}')" class="bg-slate-900 border border-slate-700 rounded-lg p-3 relative group shadow-md transition-all duration-300 hover:border-indigo-500/70 hover:shadow-indigo-900/20 cursor-pointer flex flex-col justify-between min-h-[95px] overflow-hidden">
            
            <div class="z-10">
                <h4 class="font-bold text-yellow-400 text-sm truncate mb-2 drop-shadow-md" title="${skill.name}">${skill.name}</h4>
                <div class="flex flex-wrap gap-1 overflow-hidden max-h-[40px]">
                    ${skillTagsHtml ? (skillTagsHtml + extraTagBadge) : '<span class="text-[9px] text-slate-600 italic bg-slate-800 px-1.5 py-0.5 rounded">No Tag</span>'}
                </div>
            </div>
            
            <!-- Icon Indikator Klik -->
            <div class="absolute bottom-2 right-2 opacity-10 group-hover:opacity-30 transition pointer-events-none">
                <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>

            <!-- Tombol Aksi Melayang (Kecil di Pojok Kanan Atas) -->
            <div class="absolute top-1.5 right-1.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-20 bg-slate-900/80 p-0.5 rounded backdrop-blur-sm">
                <button onclick="event.stopPropagation(); app.openEditSkill('${skill.id}')" class="text-slate-400 hover:text-amber-400 p-1 bg-slate-800 rounded border border-slate-700 transition" title="Edit Skill">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="event.stopPropagation(); app.deleteSkill('${skill.id}')" class="text-slate-400 hover:text-rose-500 p-1 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Skill">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
        `;
    },


    // ==========================================
    // --- BANTUAN PENCARIAN ---
    // ==========================================
    onSearchSkillInput(event) {
        const keyword = event.target.value;
        app.currentSkillFilter = keyword; // Simpan di MainScript
        app.renderSkillGrid(); 
    },

    // 2. Logika Pembantu: Mengembalikan daftar skill yang sudah difilter
    getFilteredSkills() {
        const keyword = (app.currentSkillFilter || '').toLowerCase().trim();
        const allSkills = app.data?.skills || []; 
        const allTags = this.data?.skillTags || app.data?.skillTags || [];

        if (!keyword) return allSkills; 

        return allSkills.filter(skill => {
            // 1. Cek kecocokan pada Nama Skill
            const matchesName = skill.name.toLowerCase().includes(keyword);

            // 2. Cek kecocokan pada Tag yang dimiliki Skill
            const matchesTag = (skill.tagIds || []).some(tagId => {
                const tag = allTags.find(t => t.id === tagId);
                return tag && tag.name.toLowerCase().includes(keyword);
            });

            return matchesName || matchesTag;
        });
    },
}