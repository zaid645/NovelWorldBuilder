
export const ItemView = {

    // ==========================================
    // --- RENDER VIEW UTAMA (ITEMS & TAGS) ---
    // ==========================================
    renderItemsView() {
        const daftarSemesta = app.data?.universes || [];
        
        // Ambil data skill dan urutkan berdasarkan abjad (A-Z)
        const sortedSkills = [...(this.data.skills || [])].sort((a, b) => 
            (a.name || '').localeCompare(b.name || '')
        );

        return `
            <div class="flex flex-col gap-6 relative">
                
                <!-- BAGIAN MANAJEMEN TAG ITEM -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <div class="bg-slate-700/50 p-3 flex justify-between items-center">
                            <h3 class="font-semibold text-slate-200">Daftar Tag Item <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.itemTags.length}</span></h3>
                        </div>
                        <div id="itemTagsPanel" class="p-4 space-y-4">
                            <div class="flex space-x-2 max-w-md">
                                <input type="text" id="newItemTagName" placeholder="Nama Tag Item Baru" class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-cyan-500 outline-none">
                                <button onclick="app.addItemTag()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-3 rounded font-bold transition">+</button>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="app.autoloadItemTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Autoload Tag dari Item
                                </button>
                                <button onclick="app.cleanInvalidItemTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600 transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Bersihkan Tag Invalid
                                </button>
                                <button onclick="app.exportItems()" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-2 px-3 rounded flex justify-center items-center font-medium shadow transition">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Export Data Item (.json)
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2 pt-2">
                                ${this.data.itemTags.length === 0 ? '<p class="text-xs text-slate-500 w-full text-center py-2">Belum ada tag item.</p>' : ''}
                                ${this.data.itemTags.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(t => `                                    <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center group">
                                        ${t.name}
                                        <button onclick="app.editItemTag('${t.id}')" class="ml-2 text-slate-400 hover:text-amber-400 hidden group-hover:block transition" title="Edit Tag">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onclick="app.deleteItemTag('${t.id}')" class="ml-1 text-slate-500 hover:text-rose-400 hidden group-hover:block transition" title="Hapus Tag">&times;</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BAGIAN MANAJEMEN LIST ITEM & FORM -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                        <div class="bg-slate-700/50 p-3 flex justify-between items-center">
                            <h3 class="font-semibold text-slate-200">Daftar Item <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.items.length}</span></h3>
                            <button onclick="event.stopPropagation(); app.openAddItem()" class="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded transition shadow-sm font-medium">
                                + Tambah Item
                            </button>
                        </div>
                        <div id="itemsPanel" class="p-4">
                            
                            <!-- Search Bar -->
                            <div class="mb-4 relative">
                                <input type="text" 
                                    id="searchItemInput" 
                                    value="${app.currentItemFilter || ''}" 
                                    placeholder="Cari nama item atau tag..." 
                                    class="bg-slate-900 border border-slate-700 rounded p-2.5 pl-9 text-sm w-full focus:border-cyan-500 focus:outline-none transition" 
                                    oninput="app.onSearchItemInput(event)">
                                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            
                            <!-- FORM TAMBAH/EDIT ITEM -->
                            <div id="addItemForm" class="hidden bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                <button onclick="app.togglePanel('addItemForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition text-lg">&times;</button>
                                <h4 id="itemFormTitle" class="text-sm font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Buat Item Baru</h4>
                                
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Item <span class="text-rose-400">*</span></label>
                                    <input type="text" id="newItemName" placeholder="Contoh: Pedang Excalibur / Potion Merah" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-cyan-500">
                                </div>

                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Tag Item:</label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-2 max-h-24 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        ${this.data.itemTags.length === 0 ? '<span class="text-xs text-slate-500 italic col-span-full">Belum ada tag item.</span>' : ''}
                                        ${this.data.itemTags.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(t => `
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" value="${t.id}" class="itemTagCheck form-checkbox rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500">
                                                <span class="truncate text-slate-300 hover:text-white transition">${t.name}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Checklist Skill Tertaut -->
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Skill Tertaut (Opsional):</label>
                                    <p class="text-[10px] text-slate-500 mb-2">Pilih skill yang akan diberikan atau dapat digunakan oleh pengguna item ini.</p>
                                    
                                    <!-- Input Search Skill -->
                                    <div class="mb-2 relative">
                                        <input type="text" 
                                            id="itemSkillSearch" 
                                            value="${app.currentSkillFilter || ''}"
                                            placeholder="Cari & Filter Skill..." 
                                            oninput="app.onItemSkillSearchInput(event)"
                                            class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full focus:border-cyan-500 outline-none text-slate-300">
                                    </div>

                                    <!-- Container Checkbox Skill Dinamis -->
                                    <div id="itemSkillList" class="bg-slate-800 border border-slate-600 rounded p-3 max-h-32 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-sm w-full">
                                        <!-- Dirender via app.renderItemSkillCheckboxes() -->
                                    </div>
                                </div>

                                <!-- Pengaturan Konteks AI (Volatile/Tidak disave) -->
                                <div class="bg-cyan-900/10 border border-cyan-500/20 rounded p-3 mb-4">
                                    <h5 class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <span>✨</span> Konteks AI Enchanter (Opsional)
                                    </h5>
                                    <div class="flex flex-col sm:flex-row gap-3">
                                        <select id="aiItemUniverse" class="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none transition">
                                            <option value="">-- Tanpa Referensi Semesta --</option>
                                            ${daftarSemesta.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                                        </select>
                                        <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                                            <input type="checkbox" id="aiItemDeepLore" class="rounded text-cyan-500 bg-slate-900 border-slate-600">
                                            <span>Sertakan Informasi Tempat (Mendalam)</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- Textareas with AI Buttons -->
                                <div class="mb-4">
                                    <div class="flex justify-between items-end mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Penampilan / Wujud Fisik Item</label>
                                        <button id="btnAiItemApp" onclick="app.generateItemAI('appearance')" class="text-[10px] bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                            ✨ Enchant Penampilan
                                        </button>
                                    </div>
                                    <textarea id="newItemApp" placeholder="Tuliskan draf singkat bentuk, warna, atau material, lalu gunakan AI untuk memperindahnya..." class="bg-slate-800 border border-slate-600 rounded p-2.5 text-sm w-full outline-none focus:border-cyan-500" rows="4"></textarea>
                                </div>

                                <div class="mb-4">
                                    <div class="flex justify-between items-end mb-1">
                                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efek / Deskripsi Item</label>
                                        <button id="btnAiItemDesc" onclick="app.generateItemAI('description')" class="text-[10px] bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                            ✨ Enchant Deskripsi
                                        </button>
                                    </div>
                                    <textarea id="newItemDesc" placeholder="Apa kegunaan item ini? Apa efek magis atau mekanismenya? Tulis draf untuk referensi AI..." class="bg-slate-800 border border-slate-600 rounded p-2.5 text-sm w-full outline-none focus:border-cyan-500" rows="4"></textarea>
                                </div>

                                <div class="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-700/60">
                                    <button onclick="app.setPanelState('addItemForm', false); app.editItemId = null;" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm transition">Batal</button>
                                    <button id="saveItemBtn" onclick="app.saveItem()" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded text-sm shadow transition">Simpan Item</button>
                                </div>
                            </div>

                            <!-- DAFTAR ITEM (KARTU KECIL BERJAJAR DALAM GRID) -->
                            <div id="itemGridContainer" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                <!-- Rendered via renderItemGrid() -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FLOATING DETAIL PANEL (MENGAMBANG SEPERTI WINDOWS) -->
                <div id="floatingItemDetail" class="hidden fixed bottom-6 right-6 w-96 max-w-[90vw] bg-slate-800 border-2 border-cyan-500/50 rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 shadow-cyan-900/20">
                    <!-- Header Jendela (Area Handle Drag) -->
                    <div onmousedown="app.startDragItem(event, 'floatingItemDetail')" class="bg-gradient-to-r from-cyan-700 to-cyan-900 px-4 py-3 flex justify-between items-center rounded-t-xl cursor-move border-b border-cyan-500/30 select-none">
                        <span id="floatingItemTitle" class="font-bold text-sm text-white truncate pr-4 pointer-events-none">Detail Item</span>
                        <button onclick="event.stopPropagation(); app.closeItemDetailFloating()" class="text-cyan-200 hover:text-white transition font-bold text-lg leading-none cursor-pointer" title="Tutup Jendela">&times;</button>
                    </div>
                    <!-- Konten Jendela -->
                    <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div>
                            <span class="font-semibold text-cyan-400 uppercase tracking-wider text-[10px] block mb-1.5">Tags Kategori:</span>
                            <div id="floatingItemTags" class="flex flex-wrap gap-1.5"></div>
                        </div>
                        <div class="pt-2 border-t border-slate-700/60">
                            <span class="font-semibold text-yellow-400 uppercase tracking-wider text-[10px] block mb-1.5">Skill Tertaut:</span>
                            <div id="floatingItemSkills" class="flex flex-wrap gap-1.5"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1.5">Rupa / Penampilan:</span>
                            <div id="floatingItemApp" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"></div>
                        </div>
                        <hr class="border-slate-700/60">
                        <div>
                            <span class="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1.5">Efek / Deskripsi:</span>
                            <div id="floatingItemDesc" class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"></div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    },

    // ==========================================
    // --- RENDER GRID KARTU (TAMPILAN RINGKAS) ---
    // ==========================================
    // Render daftar item dalam bentuk grid
    renderItemGrid() {
        const container = document.getElementById('itemGridContainer');
        if(!container) return;
        const query = (app.currentItemFilter || '').toLowerCase();

        const itemData = this.data.items.map(item => {
            const tagNames = (item.tagIds || []).map(id => {
                const t = this.data.itemTags.find(tag => tag.id === id);
                return (t && t.name) ? t.name.toLowerCase() : '';
            }).join(' ');
            
            // Pencarian juga berlaku untuk nama skill tertaut
            const skillNames = (item.skillIds || []).map(id => {
                const s = this.data.skills.find(sk => sk.id === id);
                return (s && s.name) ? s.name.toLowerCase() : '';
            }).join(' ');

            return { ...item, tagIds: item.tagIds || [], skillIds: item.skillIds || [], searchString: tagNames + ' ' + skillNames };
        });

        const filtered = itemData.filter(i => 
            (i.name || '').toLowerCase().includes(query) || i.searchString.includes(query)
        );

        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (filtered.length === 0) {
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8 bg-slate-800/50 rounded border border-dashed border-slate-700">Tidak ada item ditemukan.</p>`; 
            return;
        }
        
        container.innerHTML = filtered.map(i => this.renderItemCard(i)).join('');
    },

    // Render item dalam kartu
    renderItemCard(item) {
        // Mengambil maksimal 2 tag teratas
        const limitedTagIds = (item.tagIds || []).slice(0, 2);

        // Render komponen HTML untuk 2 tag teratas
        const itemTagsHtml = limitedTagIds.map(id => {
            const tag = this.data.itemTags.find(t => t.id === id);
            return tag ? `<span class="bg-cyan-900/60 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded border border-cyan-700/50 truncate max-w-[75px] block" title="${tag.name}">${tag.name}</span>` 
                        : `<span class="bg-rose-900/60 text-rose-300 text-[9px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join('');

        // Tampilkan indikator jika item memiliki skill tertaut
        const hasSkills = item.skillIds && item.skillIds.length > 0;
        const skillIndicator = hasSkills ? `<span class="bg-yellow-900/60 text-yellow-300 text-[9px] px-1.5 py-0.5 rounded border border-yellow-700/50 block" title="Memiliki Skill Tertaut">✨ Skill</span>` : '';

        return `
        <div onclick="app.showItemDetailFloating('${item.id}')" class="bg-slate-900 border border-slate-700 rounded-lg p-3 relative group shadow-md transition-all duration-300 hover:border-cyan-500/70 hover:shadow-cyan-900/20 cursor-pointer flex flex-col justify-between min-h-[95px] overflow-hidden">
            
            <div class="z-10">
                <h4 class="font-bold text-cyan-400 text-sm truncate mb-2 drop-shadow-md" title="${item.name}">${item.name}</h4>
                <div class="flex flex-wrap gap-1 overflow-hidden max-h-[40px]">
                    ${itemTagsHtml || '<span class="text-[9px] text-slate-600 italic bg-slate-800 px-1.5 py-0.5 rounded">No Tag</span>'}
                    ${skillIndicator}
                </div>
            </div>
            
            <!-- Icon Indikator Klik -->
            <div class="absolute bottom-2 right-2 opacity-10 group-hover:opacity-30 transition pointer-events-none">
                <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>

            <!-- Tombol Aksi Melayang (Kecil di Pojok Kanan Atas) -->
            <div class="absolute top-1.5 right-1.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-20 bg-slate-900/80 p-0.5 rounded backdrop-blur-sm">
                <button onclick="event.stopPropagation(); app.openEditItem('${item.id}')" class="text-slate-400 hover:text-amber-400 p-1 bg-slate-800 rounded border border-slate-700 transition" title="Edit Item">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="event.stopPropagation(); app.deleteItem('${item.id}')" class="text-slate-400 hover:text-rose-500 p-1 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Item">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
        `;
    },

    // ==========================================
    // --- BANTUAN FILTER SEARCH BAR ---
    // ==========================================
    onSearchItemInput(e) {
        app.currentItemFilter = e.target.value;
        this.renderItemGrid();
    }
}