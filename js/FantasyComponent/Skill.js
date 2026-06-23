/**
 * SkillModule
 * Mengurus semua logika tampilan dan manipulasi data untuk Skill dan Tag-nya.
 */
export const SkillModule = {

    // ==========================================
    // --- RENDER VIEW UTAMA (SKILLS & TAGS) ---
    // ==========================================
    renderSkillsView() {
        return `
            <div class="flex flex-col gap-6">
                
                <!-- BAGIAN MANAJEMEN TAG -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                        <div class="bg-slate-700/50 p-3 flex justify-between">
                            <h3 class="font-semibold text-slate-200">Daftar Tag <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.skillTags.length}</span></h3>
                            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                        <div id="tagsPanel" class="p-4 space-y-4 ${this.getPanelClass('tagsPanel', '')}">
                            <div class="flex space-x-2 max-w-md"> 
                                <input type="text" id="newSkillTagName" placeholder="Nama Tag Baru" class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <button onclick="app.addSkillTag()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded font-bold transition">+</button>
                            </div>
                            <div class="flex flex-wrap gap-2"> 
                                <button onclick="app.autoloadTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Autoload Tag dari Skill
                                </button>
                                <button onclick="app.cleanInvalidTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
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
                                ${this.data.skillTags.map(t => `
                                    <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center group">
                                        ${t.name}
                                        <button onclick="app.editTag('${t.id}')" class="ml-2 text-slate-400 hover:text-amber-400 hidden group-hover:block" title="Edit Tag">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onclick="app.deleteTag('${t.id}')" class="ml-1 text-slate-500 hover:text-rose-400 hidden group-hover:block" title="Hapus Tag">&times;</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BAGIAN MANAJEMEN SKILL -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                        <div class="bg-slate-700/50 p-3 flex justify-between">
                            <h3 class="font-semibold text-slate-200">Daftar Skill <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.skills.length}</span></h3>
                            <button onclick="event.stopPropagation(); app.openAddSkill()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition shadow-sm">
                                + Tambah Skill
                            </button>
                        </div>
                        <div id="skillsPanel" class="p-4 ${this.getPanelClass('skillsPanel', '')}">
                            
                            <!-- Search Bar -->
                            <div class="mb-4 relative">
                                <input type="text" id="searchSkillInput" placeholder="Cari skill atau filter berdasarkan tag..." class="bg-slate-900 border border-slate-700 rounded p-2 pl-9 text-sm w-full focus:border-indigo-500 focus:outline-none" oninput="app.renderSkillGrid()">
                                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            
                            <!-- FORM TAMBAH / EDIT SKILL (Hidden by default) -->
                            <div id="addSkillForm" class="${this.getPanelClass('addSkillForm')} bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                <button onclick="app.togglePanel('addSkillForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition">&times;</button>
                                <h4 id="skillFormTitle" class="text-sm font-bold text-indigo-400 mb-3">Buat Skill Baru</h4>
                                
                                <input type="text" id="newSkillName" placeholder="Nama Skill (Cth: Bola Api)" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 focus:border-indigo-500 focus:outline-none">
                                
                                <div class="mb-3">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Tag:</label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-3 max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                                        ${this.data.skillTags.map(t => `
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" value="${t.id}" class="tagCheck rounded text-indigo-600 bg-slate-900 border-slate-600 focus:ring-indigo-500">
                                                <span class="truncate text-slate-300 hover:text-white transition">${t.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <textarea id="newSkillBg" placeholder="Latar Belakang / Asal Usul (Opsional)" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 focus:border-indigo-500 focus:outline-none" rows="3"></textarea>
                                <textarea id="newSkillDesc" placeholder="Deskripsi / Efek Skill secara detail" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 focus:border-indigo-500 focus:outline-none" rows="4"></textarea>
                                
                                <div class="flex justify-end space-x-2">
                                    <button onclick="app.setPanelState('addSkillForm', false); app.editSkillId = null;" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm transition">Batal</button>
                                    <button id="saveSkillBtn" onclick="app.saveSkill()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition shadow-sm">Simpan Skill</button>
                                </div>
                            </div>

                            <!-- GRID DAFTAR SKILL -->
                            <div id="skillGridContainer" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                                <!-- Rendered via renderSkillGrid() -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // --- LOGIKA TAG SKILL ---
    // ==========================================
    
    addSkillTag() {
        const input = document.getElementById('newSkillTagName');
        const name = input.value.trim();
        if (name) {
            this.data.skillTags.push({ id: this.generateId('t'), name });
            this.saveData();
            this.switchView('skills');
        }
    },

    editTag(id) {
        const tag = this.data.skillTags.find(t => t.id === id);
        if (!tag) return;
        const newName = prompt("Ubah nama tag:", tag.name);
        if (newName && newName.trim()) {
            tag.name = newName.trim();
            this.saveData();
            this.switchView('skills');
        }
    },

    deleteTag(id) {
        if(confirm("Hapus tag ini? (Skill yang memakainya akan kehilangan referensi tag ini)")) {
            this.data.skillTags = this.data.skillTags.filter(t => t.id !== id);
            this.saveData();
            this.switchView('skills');
        }
    },

    autoloadTags() {
        const tagIds = this.data.skillTags.map(t => t.id);
        let addedCount = 0;
        
        this.data.skills.forEach(skill => {
            skill.tagIds.forEach(id => {
                if (!tagIds.includes(id)) {
                    this.data.skillTags.push({ id: id, name: `AutoTag_${id}` });
                    tagIds.push(id);
                    addedCount++;
                }
            });
        });

        if (addedCount > 0) {
            this.saveData();
            this.switchView('skills');
            this.showAlert(`${addedCount} Tag otomatis ditambahkan.`, "success");
        } else {
            this.showAlert("Semua tag sudah valid.", "info");
        }
    },

    cleanInvalidTags() {
        const validTagIds = this.data.skillTags.map(t => t.id);
        let cleanedCount = 0;
        
        this.data.skills.forEach(skill => {
            const originalLength = skill.tagIds.length;
            // Filter tagId agar hanya menyisakan yang valid
            skill.tagIds = skill.tagIds.filter(id => validTagIds.includes(id));
            if (skill.tagIds.length !== originalLength) {
                cleanedCount++;
            }
        });
        
        if (cleanedCount > 0) {
            this.saveData();
            this.switchView('skills');
            this.showAlert(`Berhasil membersihkan tag invalid dari ${cleanedCount} skill.`, "success");
        } else {
            this.showAlert("Semua tag pada skill sudah valid.", "info");
        }
    },

    // ==========================================
    // --- LOGIKA FORM SKILL (CRUD) ---
    // ==========================================

    openAddSkill() {
        this.editSkillId = null;
        document.getElementById('skillFormTitle').innerText = "Buat Skill Baru";
        document.getElementById('newSkillName').value = '';
        document.getElementById('newSkillBg').value = '';
        document.getElementById('newSkillDesc').value = '';
        
        // Hapus centang semua tag
        document.querySelectorAll('.tagCheck').forEach(cb => cb.checked = false);
        
        this.setPanelState('addSkillForm', true);
        document.getElementById('saveSkillBtn').innerText = "Simpan Skill";
    },

    openEditSkill(id) {
        const skill = this.data.skills.find(s => s.id === id);
        if(!skill) return;

        this.editSkillId = id;
        document.getElementById('skillFormTitle').innerText = `Edit Skill: ${skill.name}`;
        document.getElementById('newSkillName').value = skill.name;
        document.getElementById('newSkillBg').value = skill.background || '';
        document.getElementById('newSkillDesc').value = skill.description || '';

        // Centang tag sesuai dengan skill yang diedit
        document.querySelectorAll('.tagCheck').forEach(cb => {
            cb.checked = skill.tagIds.includes(cb.value);
        });

        this.setPanelState('addSkillForm', true);
        document.getElementById('saveSkillBtn').innerText = "Update Skill";
        document.getElementById('newSkillName').focus();
    },

    saveSkill() {
        const name = document.getElementById('newSkillName').value.trim();
        if (!name) return this.showAlert("Nama skill wajib diisi", "error");

        const background = document.getElementById('newSkillBg').value.trim();
        const description = document.getElementById('newSkillDesc').value.trim();
        
        const tagCheckboxes = document.querySelectorAll('.tagCheck:checked');
        const tagIds = Array.from(tagCheckboxes).map(cb => cb.value);

        if (this.editSkillId) {
            // Mode Edit
            const skill = this.data.skills.find(s => s.id === this.editSkillId);
            if(skill) {
                skill.name = name; 
                skill.background = background; 
                skill.description = description; 
                skill.tagIds = tagIds;
            }
            this.editSkillId = null;
            this.showAlert("Skill berhasil diupdate", "success");
        } else {
            // Mode Tambah Baru
            this.data.skills.push({
                id: this.generateId('sk'),
                name, background, description, tagIds
            });
            this.showAlert("Skill baru disimpan", "success");
        }

        this.setPanelState('addSkillForm', false);
        this.saveData(true);
        this.switchView('skills');
    },

    deleteSkill(id) {
        if(confirm("Yakin ingin menghapus skill ini? Tokoh di seluruh semesta yang menggunakannya akan mendapatkan peringatan hilang (Invalid).")) {
            this.data.skills = this.data.skills.filter(s => s.id !== id);
            this.saveData();
            this.switchView('skills');
        }
    },

    exportSkills() {
        // Karena fungsi downloadJSON ada di MainScript, kita bisa memanggilnya via "this" berkat Object.assign
        this.downloadJSON("data_skills.json", { skillTags: this.data.skillTags, skills: this.data.skills });
    },

    // ==========================================
    // --- RENDER GRID & CARD SKILL ---
    // ==========================================

    renderSkillGrid() {
        const container = document.getElementById('skillGridContainer');
        if(!container) return;

        const query = (document.getElementById('searchSkillInput')?.value || '').toLowerCase();

        const skillsWithTags = this.data.skills.map(skill => {
            // Cari nama tag untuk keperluan filtering text pencarian
            const tagNames = (skill.tagIds || []).map(id => {
                const t = this.data.skillTags.find(tag => tag.id === id);
                return (t && t.name) ? t.name.toLowerCase() : '';
            }).join(' ');
            return { ...skill, tagIds: skill.tagIds || [], tagNames };
        });

        // Filter berdasarkan nama skill atau nama tag yang dimilikinya
        const filtered = skillsWithTags.filter(s => 
            (s.name || '').toLowerCase().includes(query) || s.tagNames.includes(query)
        );

        // Sortir item yang sudah difilter berdasarkan nama skill
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (filtered.length === 0) {
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8 bg-slate-800/50 rounded border border-dashed border-slate-700">Tidak ada skill yang ditemukan.</p>`;
            return;
        }

        container.innerHTML = filtered.map(s => this.renderSkillCard(s)).join('');
    },

    renderSkillCard(skill) {
        const skillTags = skill.tagIds.map(id => {
            const tag = this.data.skillTags.find(t => t.id === id);
            return tag ? `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-700 font-medium">${tag.name}</span>` 
                       : `<span class="bg-rose-900/60 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-700 font-medium line-through" title="Tag sudah dihapus">Invalid</span>`;
        }).join(' ');

        return `
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 relative group transition-all duration-300 hover:border-indigo-500 hover:shadow-md">
            <!-- Tombol Aksi (Tampil saat di-hover) -->
            <div class="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition duration-200 z-10 bg-slate-900 pl-2 rounded-bl">
                <button onclick="app.openEditSkill('${skill.id}')" class="text-slate-400 hover:text-amber-400 p-1 bg-slate-800 rounded transition" title="Edit Skill">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="app.deleteSkill('${skill.id}')" class="text-slate-400 hover:text-rose-500 p-1 bg-slate-800 rounded transition" title="Hapus Skill">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            
            <div class="flex flex-col pr-10 mb-2">
                <h4 class="font-bold text-yellow-400 text-sm md:text-base line-clamp-1 group-hover:line-clamp-none transition-all">${skill.name}</h4>
            </div>
            
            <div class="flex flex-wrap gap-1 mb-3">
                ${skillTags || '<span class="text-[10px] text-slate-500 italic bg-slate-800 px-1.5 py-0.5 rounded">Tanpa Tag</span>'}
            </div>
            
            <div class="space-y-1.5">
                <div class="text-xs text-slate-300 line-clamp-2 group-hover:line-clamp-none transition-all">
                    <span class="font-semibold text-slate-400">Asal Usul:</span> ${skill.background || '<span class="text-slate-500 italic">-</span>'}
                </div>
                <div class="text-xs text-slate-300 line-clamp-3 group-hover:line-clamp-none transition-all">
                    <span class="font-semibold text-slate-400">Efek:</span> ${skill.description || '<span class="text-slate-500 italic">-</span>'}
                </div>
            </div>
        </div>
        `;
    }
};