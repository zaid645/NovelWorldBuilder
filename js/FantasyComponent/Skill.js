/**
 * SkillModule
 * Mengurus semua logika tampilan dan manipulasi data untuk Skill dan Tag-nya.
 * Terintegrasi dengan AI Enchanter untuk Generate Asal Usul dan Efek Skill.
 */
export const SkillModule = {

    // ==========================================
    // --- RENDER VIEW UTAMA (SKILLS & TAGS) ---
    // ==========================================
    renderSkillsView() {
        const daftarSemesta = app.data?.universes || [];

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
                                        <button onclick="app.editTag('${t.id}')" class="ml-2 text-slate-400 hover:text-amber-400 hidden group-hover:block transition" title="Edit Tag">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onclick="app.deleteTag('${t.id}')" class="ml-1 text-slate-500 hover:text-rose-400 hidden group-hover:block transition" title="Hapus Tag">&times;</button>
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
                            <button onclick="event.stopPropagation(); app.openAddSkill()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition shadow-sm font-medium">
                                + Tambah Skill
                            </button>
                        </div>
                        <div id="skillsPanel" class="p-4 ${this.getPanelClass('skillsPanel', '')}">
                            
                            <!-- Search Bar -->
                            <div class="mb-4 relative">
                                <input type="text" id="searchSkillInput" placeholder="Cari skill atau filter berdasarkan tag..." class="bg-slate-900 border border-slate-700 rounded p-2.5 pl-9 text-sm w-full focus:border-indigo-500 focus:outline-none transition" oninput="app.renderSkillGrid()">
                                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            
                            <!-- FORM TAMBAH / EDIT SKILL (Hidden by default) -->
                            <div id="addSkillForm" class="${this.getPanelClass('addSkillForm')} bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                <button onclick="app.togglePanel('addSkillForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition">&times;</button>
                                <h4 id="skillFormTitle" class="text-sm font-bold text-indigo-400 mb-4 border-b border-slate-700 pb-2">Buat Skill Baru</h4>
                                
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Skill <span class="text-rose-400">*</span></label>
                                    <input type="text" id="newSkillName" placeholder="Contoh: Bola Api / Shadow Step" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-indigo-500">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Tag Skill:</label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-3 max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                                        ${this.data.skillTags.length === 0 ? '<span class="text-xs text-slate-500 italic col-span-full">Belum ada tag skill.</span>' : ''}
                                        ${this.data.skillTags.map(t => `
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" value="${t.id}" class="tagCheck rounded text-indigo-600 bg-slate-900 border-slate-600 focus:ring-indigo-500">
                                                <span class="truncate text-slate-300 hover:text-white transition">${t.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Pengaturan Konteks AI (Volatile/Tidak disave) -->
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
                                
                                <!-- Textareas with AI Buttons -->
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

                            <!-- DAFTAR SKILL (FULL WIDTH LIST & COLLAPSIBLE) -->
                            <div id="skillGridContainer" class="flex flex-col gap-4">
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
        document.querySelectorAll('.tagCheck').forEach(cb => cb.checked = false);
        
        // Reset pengaturan AI
        const aiUniverse = document.getElementById('aiSkillUniverse');
        if(aiUniverse) aiUniverse.value = '';
        const aiDeepLore = document.getElementById('aiSkillDeepLore');
        if(aiDeepLore) aiDeepLore.checked = false;

        this.setPanelState('addSkillForm', true);
        document.getElementById('saveSkillBtn').innerText = "Simpan Skill";
        document.getElementById('addSkillForm').scrollIntoView({ behavior: 'smooth' });
    },

    openEditSkill(id) {
        const skill = this.data.skills.find(s => s.id === id);
        if(!skill) return;

        this.editSkillId = id;
        document.getElementById('skillFormTitle').innerText = `Edit Skill: ${skill.name}`;
        document.getElementById('newSkillName').value = skill.name;
        document.getElementById('newSkillBg').value = skill.background || '';
        document.getElementById('newSkillDesc').value = skill.description || '';

        document.querySelectorAll('.tagCheck').forEach(cb => {
            cb.checked = skill.tagIds.includes(cb.value);
        });

        // Reset pengaturan AI
        const aiUniverse = document.getElementById('aiSkillUniverse');
        if(aiUniverse) aiUniverse.value = '';
        const aiDeepLore = document.getElementById('aiSkillDeepLore');
        if(aiDeepLore) aiDeepLore.checked = false;

        this.setPanelState('addSkillForm', true);
        document.getElementById('saveSkillBtn').innerText = "Update Skill";
        document.getElementById('addSkillForm').scrollIntoView({ behavior: 'smooth' });
    },

    saveSkill() {
        const name = document.getElementById('newSkillName').value.trim();
        if (!name) return this.showAlert("Nama skill wajib diisi", "error");

        const background = document.getElementById('newSkillBg').value.trim();
        const description = document.getElementById('newSkillDesc').value.trim();
        
        const tagCheckboxes = document.querySelectorAll('.tagCheck:checked');
        const tagIds = Array.from(tagCheckboxes).map(cb => cb.value);

        if (this.editSkillId) {
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
        this.downloadJSON("data_skills.json", { skillTags: this.data.skillTags, skills: this.data.skills });
    },

    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS SKILL ---
    // ==========================================
    async generateSkillAI(targetField) {
        const nameInput = document.getElementById('newSkillName').value.trim();

        if (!nameInput) {
            return alert("GAGAL: 'Nama Skill' wajib diisi agar AI memiliki panduan subjek yang jelas.");
        }

        let targetEl, btnEl, btnId, originalBtnText;
        let aiFocusRule = "";
        
        // Aturan AI: Sangat Ringkas, Kalimat Efektif, Tanpa Metafora/Puitis
        const aiLengthRule = "Hasilkan deskripsi secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf pendek). TANPA metafora, TANPA diksi puitis, dan TANPA majas. Gunakan bahasa yang langsung pada intinya (to-the-point).";

        const currentBg = document.getElementById('newSkillBg').value.trim();
        const currentDesc = document.getElementById('newSkillDesc').value.trim();
        let crossContext = "";

        if (targetField === 'background') {
            targetEl = document.getElementById('newSkillBg');
            btnId = 'btnAiSkillBg';
            aiFocusRule = "Kembangkan latar belakang, asal usul, siapa penciptanya, atau bagaimana skill/kemampuan ini pertama kali ditemukan atau dilatih. Fokus murni pada CERITA/LORE.";
            if (currentDesc) crossContext = `\n[REFERENSI EFEK SKILL UNTUK PENYESUAIAN CERITA]: ${currentDesc}`;
        } else if (targetField === 'description') {
            targetEl = document.getElementById('newSkillDesc');
            btnId = 'btnAiSkillDesc';
            aiFocusRule = "Kembangkan apa fungsi/efek dari skill ini saat digunakan, bentuk perwujudannya (visual), jumlah kerusakan (damage), atau utilitas/mekanismenya. Fokus murni pada FUNGSI/EFEK.";
            if (currentBg) crossContext = `\n[REFERENSI ASAL USUL SKILL UNTUK PENYESUAIAN MEKANISME]: ${currentBg}`;
        }

        const draftText = targetEl.value.trim();

        // Konstruksi Konteks Semesta (Volatile)
        const univId = document.getElementById('aiSkillUniverse')?.value;
        const useDeepLore = document.getElementById('aiSkillDeepLore')?.checked;
        let universeContext = "Semesta tidak ditentukan secara spesifik (General Fantasy/Sci-Fi).";

        if (univId) {
            const universe = app.data.universes.find(u => u.id === univId);
            if (universe) {
                universeContext = `Nama Latar/Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
                
                if (useDeepLore && universe.locations && universe.locations.length > 0) {
                    const locs = universe.locations.map(l => `${l.name} (${l.description || 'Tidak ada deskripsi'})`).join(', ');
                    universeContext += `\nDaftar Tempat/Lokasi di Semesta ini: ${locs}\n`;
                }
            }
        }

        // Payload untuk AI
        const payload = {
            moduleName: `Skill-${targetField.toUpperCase()}`,
            targetData: {
                namaSkill: nameInput,
                informasiSemesta: universeContext,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan dari field lain)",
                drafReferensiPengguna: draftText || "(Kosong. Buatkan ide cemerlang murni dari Nama Skill yang ada.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, ringkas, dan teknis/deskriptif. Sesuai dengan gaya dokumentasi kemampuan RPG/game namun menggunakan bahasa yang lugas dan tidak berbunga-bunga.",
                length: aiLengthRule
            }
        };

        // UI Loading
        btnEl = document.getElementById(btnId);
        btnEl.disabled = true;
        btnEl.classList.add('opacity-50', 'cursor-wait');
        originalBtnText = btnEl.innerHTML;
        btnEl.innerHTML = "✨ Memproses...";

        try {
            const resultText = await app.requestEnchant(payload);
            targetEl.value = resultText;
            app.showAlert(`Berhasil men-generate AI untuk ${targetField === 'background' ? 'Asal Usul' : 'Efek Skill'}!`, "success");
        } catch (error) {
            alert("Gagal memanggil AI: " + error.message);
        } finally {
            btnEl.disabled = false;
            btnEl.classList.remove('opacity-50', 'cursor-wait');
            btnEl.innerHTML = originalBtnText;
        }
    },

    // ==========================================
    // --- RENDER FULL-WIDTH CARD LIST ---
    // ==========================================

    renderSkillGrid() {
        const container = document.getElementById('skillGridContainer');
        if(!container) return;

        const query = (document.getElementById('searchSkillInput')?.value || '').toLowerCase();

        const skillsWithTags = this.data.skills.map(skill => {
            const tagNames = (skill.tagIds || []).map(id => {
                const t = this.data.skillTags.find(tag => tag.id === id);
                return (t && t.name) ? t.name.toLowerCase() : '';
            }).join(' ');
            return { ...skill, tagIds: skill.tagIds || [], tagNames };
        });

        const filtered = skillsWithTags.filter(s => 
            (s.name || '').toLowerCase().includes(query) || s.tagNames.includes(query)
        );

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
            return tag ? `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700/50 font-medium">${tag.name}</span>` 
                       : `<span class="bg-rose-900/60 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 font-medium line-through" title="Tag sudah dihapus">Invalid</span>`;
        }).join(' ');

        // Panel ID dinamis per Skill untuk Collapsible/Toggle
        const panelId = `skillDetails_${skill.id}`;
        // Ambil status apakah disembunyikan atau tidak (Default: hidden)
        const hiddenClass = (this.getPanelClass) ? this.getPanelClass(panelId) : 'hidden';

        return `
        <div class="bg-slate-900 border border-slate-700 rounded-lg relative group shadow-md transition-colors duration-300 hover:border-indigo-500/50 flex flex-col">
            
            <!-- HEADER (Bisa Diklik untuk Menyembunyikan / Menampilkan Detail) -->
            <div class="p-4 flex justify-between items-center cursor-pointer rounded-t-lg hover:bg-slate-800/50 transition" onclick="app.togglePanel('${panelId}')">
                <h4 class="font-bold text-yellow-400 text-lg truncate pr-4">${skill.name}</h4>
                
                <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition z-10">
                        <button onclick="event.stopPropagation(); app.openEditSkill('${skill.id}')" class="text-slate-400 hover:text-amber-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Edit Skill">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onclick="event.stopPropagation(); app.deleteSkill('${skill.id}')" class="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Skill">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                    <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            <!-- DETAIL KONTEN SKILL (Tersembunyi secara Default) -->
            <div id="${panelId}" class="${hiddenClass}">
                <div class="p-4 pt-0 border-t border-slate-700/50 flex flex-col md:flex-row gap-6 mt-2">
                    
                    <!-- Konten Utama (Kiri) -->
                    <div class="flex-1 space-y-3 pr-0 md:pr-14">
                        <div class="grid grid-cols-1 gap-3">
                            <div class="text-[13px] text-slate-300">
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Latar Belakang / Asal Usul:</span> 
                                <div class="leading-relaxed whitespace-pre-wrap">${skill.background || '<span class="italic text-slate-500">-</span>'}</div>
                            </div>
                            <div class="text-[13px] text-slate-300 pt-2 border-t border-slate-800">
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Deskripsi / Efek Skill:</span> 
                                <div class="leading-relaxed whitespace-pre-wrap">${skill.description || '<span class="italic text-slate-500">-</span>'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Panel Samping (Kanan) -->
                    <div class="w-full md:w-1/4 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <div>
                            <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Tag Kategori Skill:</span>
                            <div class="flex flex-wrap gap-1">${skillTags || '<span class="text-[10px] text-slate-600 italic bg-slate-800 px-2 py-0.5 rounded">Tanpa Tag</span>'}</div>
                        </div>
                    </div>

                </div>
            </div>
            
        </div>
        `;
    }
};