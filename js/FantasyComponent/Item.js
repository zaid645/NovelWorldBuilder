/**
 * ItemModule
 * Mengurus semua logika tampilan dan manipulasi data untuk Item dan Tag-nya.
 */

export const ItemModule = {

    // ==========================================
    // --- RENDER VIEW UTAMA (ITEMS & TAGS) ---
    // ==========================================
    renderItemsView() {
                    return `
                        <div class="flex flex-col gap-6">
                            
                            <div>
                                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                    <div class="bg-slate-700/50 p-3 flex justify-between">
                                        <h3 class="font-semibold text-slate-200">Daftar Tag Item <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.itemTags.length}</span></h3>
                                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                    <div id="itemTagsPanel" class="p-4 space-y-4">
                                        <div class="flex space-x-2 max-w-md">
                                            <input type="text" id="newItemTagName" placeholder="Nama Tag Item Baru" class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-cyan-500 outline-none">
                                            <button onclick="app.addItemTag()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-3 rounded font-bold">+</button>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="app.autoloadItemTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600">
                                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                Autoload Tag dari Item
                                            </button>
                                            <button onclick="app.cleanInvalidItemTags()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-2 px-3 rounded flex justify-center items-center border border-slate-600">
                                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                Bersihkan Tag Invalid
                                            </button>
                                            <button onclick="app.exportItems()" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-2 px-3 rounded flex justify-center items-center font-medium shadow">
                                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                Export Data Item (.json)
                                            </button>
                                        </div>
                                        <div class="flex flex-wrap gap-2 pt-2">
                                            ${this.data.itemTags.length === 0 ? '<p class="text-xs text-slate-500 w-full text-center py-2">Belum ada tag item.</p>' : ''}
                                            ${this.data.itemTags.map(t => `
                                                <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center group">
                                                    ${t.name}
                                                    <button onclick="app.editItemTag('${t.id}')" class="ml-2 text-slate-400 hover:text-amber-400 hidden group-hover:block" title="Edit Tag">
                                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>
                                                    <button onclick="app.deleteItemTag('${t.id}')" class="ml-1 text-slate-500 hover:text-rose-400 hidden group-hover:block" title="Hapus Tag">&times;</button>
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                    <div class="bg-slate-700/50 p-3 flex justify-between">
                                        <h3 class="font-semibold text-slate-200">Daftar Item <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.items.length}</span></h3>
                                        <button onclick="event.stopPropagation(); app.openAddItem()" class="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded transition">
                                            + Tambah Item
                                        </button>
                                    </div>
                                    <div id="itemsPanel" class="p-4">
                                        <div class="mb-4">
                                            <input type="text" id="searchItemInput" placeholder="Cari nama item atau tag..." class="bg-slate-900 border border-slate-700 rounded p-2 pl-3 text-sm w-full focus:border-cyan-500 focus:outline-none" oninput="app.renderItemGrid()">
                                        </div>
                                        
                                        <div id="addItemForm" class="hidden bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                            <button onclick="app.togglePanel('addItemForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300">&times;</button>
                                            <h4 id="itemFormTitle" class="text-sm font-bold text-cyan-400 mb-3">Buat Item Baru</h4>
                                            <input type="text" id="newItemName" placeholder="Nama Item" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-cyan-500">
                                            <div class="mb-3">
                                                <label class="text-xs text-slate-400 mb-1 block">Pilih Tag Item:</label>
                                                <div class="bg-slate-800 border border-slate-600 rounded p-2 max-h-24 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                                    ${this.data.itemTags.map(t => `<label class="flex items-center space-x-2"><input type="checkbox" value="${t.id}" class="itemTagCheck form-checkbox rounded text-cyan-500 bg-slate-700 border-slate-600"><span class="truncate">${t.name}</span></label>`).join('')}
                                                </div>
                                            </div>
                                            <textarea id="newItemApp" placeholder="Penampilan / Wujud Fisik Item" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-cyan-500" rows="7"></textarea>
                                            <textarea id="newItemDesc" placeholder="Efek / Deskripsi Item" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-cyan-500" rows="7"></textarea>
                                            <div class="flex justify-end space-x-2">
                                                <button onclick="app.setPanelState('addItemForm', false); app.editItemId = null;" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">Batal</button>
                                                <button id="saveItemBtn" onclick="app.saveItem()" class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm">Simpan Item</button>
                                            </div>
                                        </div>

                                        <div id="itemGridContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 items-start"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                },

    // ==========================================
    // --- LOGIKA TAG ITEM ---
    // ==========================================
     addItemTag() {
        const name = document.getElementById('newItemTagName').value.trim();
        if (name) {
            this.data.itemTags.push({ id: this.generateId('it'), name });
            this.saveData(); this.switchView('items');
        }
    },
    editItemTag(id) {
        const tag = this.data.itemTags.find(t => t.id === id);
        if (!tag) return;
        const newName = prompt("Ubah nama tag item:", tag.name);
        if (newName && newName.trim()) {
            tag.name = newName.trim();
            this.saveData(); this.switchView('items');
        }
    },
    deleteItemTag(id) {
        if(confirm("Hapus tag item ini?")) {
            this.data.itemTags = this.data.itemTags.filter(t => t.id !== id);
            this.saveData(); this.switchView('items');
        }
    },
    autoloadItemTags() {
        const validIds = this.data.itemTags.map(t => t.id);
        let added = 0;
        this.data.items.forEach(item => {
            item.tagIds.forEach(id => {
                if (!validIds.includes(id)) {
                    this.data.itemTags.push({ id, name: `AutoTag_${id}` });
                    validIds.push(id); added++;
                }
            });
        });
        if (added > 0) { this.saveData(); this.switchView('items'); this.showAlert(`${added} Tag item dimuat.`, "success"); }
    },
    cleanInvalidItemTags() {
        const validIds = this.data.itemTags.map(t => t.id);
        let cleaned = 0;
        this.data.items.forEach(item => {
            const len = item.tagIds.length;
            item.tagIds = item.tagIds.filter(id => validIds.includes(id));
            if (item.tagIds.length !== len) cleaned++;
        });
        if (cleaned > 0) { this.saveData(); this.switchView('items'); this.showAlert(`Tag invalid dihapus dari ${cleaned} item.`, "success"); }
    },

    // ==========================================
    // --- LOGIKA FORM ITEM (CRUD) ---
    // ==========================================
    openAddItem() {
        this.editItemId = null;
        document.getElementById('itemFormTitle').innerText = "Buat Item Baru";
        document.getElementById('newItemName').value = '';
        document.getElementById('newItemApp').value = '';
        document.getElementById('newItemDesc').value = '';
        document.querySelectorAll('.itemTagCheck').forEach(cb => cb.checked = false);
        this.setPanelState('addItemForm', true);
        document.getElementById('saveItemBtn').innerText = "Simpan Item";
    },
    openEditItem(id) {
        const item = this.data.items.find(i => i.id === id);
        if(!item) return;
        this.editItemId = id;
        document.getElementById('itemFormTitle').innerText = `Edit Item: ${item.name}`;
        document.getElementById('newItemName').value = item.name;
        document.getElementById('newItemApp').value = item.appearance;
        document.getElementById('newItemDesc').value = item.description;
        document.querySelectorAll('.itemTagCheck').forEach(cb => cb.checked = item.tagIds.includes(cb.value));
        this.setPanelState('addItemForm', true);
        document.getElementById('saveItemBtn').innerText = "Update Item";
        document.getElementById('newItemName').focus();
    },
    saveItem() {
        const name = document.getElementById('newItemName').value.trim();
        if (!name) return this.showAlert("Nama item wajib diisi", "error");
        const appearance = document.getElementById('newItemApp').value.trim();
        const description = document.getElementById('newItemDesc').value.trim();
        const tagIds = Array.from(document.querySelectorAll('.itemTagCheck:checked')).map(cb => cb.value);

        if (this.editItemId) {
            const item = this.data.items.find(i => i.id === this.editItemId);
            if(item) { item.name = name; item.appearance = appearance; item.description = description; item.tagIds = tagIds; }
            this.editItemId = null;
            this.showAlert("Item berhasil diupdate", "success");
        } else {
            this.data.items.push({ id: this.generateId('i'), name, appearance, description, tagIds });
            this.showAlert("Item baru disimpan", "success");
        }

        this.setPanelState('addItemForm', false);
        this.saveData(true); this.switchView('items');
    },
    deleteItem(id) {
        if(confirm("Yakin ingin menghapus item ini?")) {
            this.data.items = this.data.items.filter(i => i.id !== id);

            this.setPanelState('addItemForm', false);
            this.saveData(); this.switchView('items');
        }
    },

    // ==========================================
    // --- RENDER GRID & CARD ITEM ---
    // ==========================================
    renderItemGrid() {
        const container = document.getElementById('itemGridContainer');
        if(!container) return;
        const query = (document.getElementById('searchItemInput')?.value || '').toLowerCase();

        const itemData = this.data.items.map(item => {
            // Tambahkan fallback (item.tagIds || [])
            const tagNames = (item.tagIds || []).map(id => {
                const t = this.data.itemTags.find(tag => tag.id === id);
                return (t && t.name) ? t.name.toLowerCase() : '';
            }).join(' ');
            return { ...item, tagIds: item.tagIds || [], tagNames };
        });

        // Tambahkan fallback (i.name || '')
        const filtered = itemData.filter(i => 
            (i.name || '').toLowerCase().includes(query) || i.tagNames.includes(query)
        );

        // Sortir daftar yang sudah difilter berdasarkan nama skill
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (filtered.length === 0) {
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8">Tidak ada item ditemukan.</p>`; return;
        }
        container.innerHTML = filtered.map(i => this.renderItemCard(i)).join('');
    },

    renderItemCard(item) {
        const itemTags = item.tagIds.map(id => {
            const tag = this.data.itemTags.find(t => t.id === id);
            return tag ? `<span class="bg-cyan-900/50 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded border border-cyan-700">${tag.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join(' ');

        return `
        <div class="bg-slate-900 border border-slate-700 rounded p-3 relative group transition-all duration-300">
            <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-10 bg-slate-900 pl-2">
                <button onclick="app.openEditItem('${item.id}')" class="text-slate-500 hover:text-cyan-400" title="Edit Item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="app.deleteItem('${item.id}')" class="text-slate-500 hover:text-rose-500" title="Hapus Item">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            
            <div class="flex flex-col pr-10 mb-2">
                <h4 class="font-bold text-cyan-400 text-sm line-clamp-1 group-hover:line-clamp-none transition-all">${item.name}</h4>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">${itemTags || '<span class="text-[10px] text-slate-500">Tanpa Tag</span>'}</div>
            
            <div class="text-xs text-slate-300 mb-1 line-clamp-1 group-hover:line-clamp-none transition-all"><span class="font-semibold text-slate-400">Tampilan:</span> ${item.appearance || '-'}</div>
            <div class="text-xs text-slate-300 line-clamp-2 group-hover:line-clamp-none transition-all"><span class="font-semibold text-slate-400">Efek:</span> ${item.description || '-'}</div>
        </div>
        `;
    }
};