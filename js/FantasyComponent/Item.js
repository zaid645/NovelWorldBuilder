/**
 * ItemModule
 * Mengurus semua logika tampilan dan manipulasi data untuk Item dan Tag-nya.
 * Terintegrasi dengan AI Enchanter untuk Generate Penampilan dan Deskripsi Item.
 */

export const ItemModule = {

    // ==========================================
    // --- RENDER VIEW UTAMA (ITEMS & TAGS) ---
    // ==========================================
    renderItemsView() {
        const daftarSemesta = app.data?.universes || [];

        return `
            <div class="flex flex-col gap-6">
                
                <!-- BAGIAN MANAJEMEN TAG ITEM -->
                <div>
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <div class="bg-slate-700/50 p-3 flex justify-between items-center">
                            <h3 class="font-semibold text-slate-200">Daftar Tag Item <span class="text-xs bg-slate-600 px-2 py-0.5 rounded-full ml-1">${this.data.itemTags.length}</span></h3>
                            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
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
                                ${this.data.itemTags.map(t => `
                                    <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center group">
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
                            <div class="mb-4">
                                <input type="text" id="searchItemInput" placeholder="Cari nama item atau tag..." class="bg-slate-900 border border-slate-700 rounded p-2.5 text-sm w-full focus:border-cyan-500 focus:outline-none transition" oninput="app.renderItemGrid()">
                            </div>
                            
                            <!-- FORM TAMBAH/EDIT ITEM -->
                            <div id="addItemForm" class="hidden bg-slate-900 border border-slate-600 p-4 rounded-lg mb-6 shadow-inner relative">
                                <button onclick="app.togglePanel('addItemForm')" class="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition">&times;</button>
                                <h4 id="itemFormTitle" class="text-sm font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Buat Item Baru</h4>
                                
                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Item <span class="text-rose-400">*</span></label>
                                    <input type="text" id="newItemName" placeholder="Contoh: Pedang Excalibur / Potion Merah" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-cyan-500">
                                </div>

                                <div class="mb-4">
                                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Tag Item:</label>
                                    <div class="bg-slate-800 border border-slate-600 rounded p-2 max-h-24 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        ${this.data.itemTags.length === 0 ? '<span class="text-xs text-slate-500 italic col-span-full">Belum ada tag item.</span>' : ''}
                                        ${this.data.itemTags.map(t => `
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" value="${t.id}" class="itemTagCheck form-checkbox rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500">
                                                <span class="truncate text-slate-300 hover:text-white transition">${t.name}</span>
                                            </label>
                                        `).join('')}
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

                            <!-- DAFTAR ITEM (FULL WIDTH LIST & COLLAPSIBLE) -->
                            <div id="itemGridContainer" class="flex flex-col gap-4"></div>
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
        
        // Reset pengaturan AI
        const aiUniverse = document.getElementById('aiItemUniverse');
        if(aiUniverse) aiUniverse.value = '';
        const aiDeepLore = document.getElementById('aiItemDeepLore');
        if(aiDeepLore) aiDeepLore.checked = false;

        this.setPanelState('addItemForm', true);
        document.getElementById('saveItemBtn').innerText = "Simpan Item";
        document.getElementById('addItemForm').scrollIntoView({ behavior: 'smooth' });
    },
    openEditItem(id) {
        const item = this.data.items.find(i => i.id === id);
        if(!item) return;
        this.editItemId = id;
        document.getElementById('itemFormTitle').innerText = `Edit Item: ${item.name}`;
        document.getElementById('newItemName').value = item.name;
        document.getElementById('newItemApp').value = item.appearance || '';
        document.getElementById('newItemDesc').value = item.description || '';
        document.querySelectorAll('.itemTagCheck').forEach(cb => cb.checked = item.tagIds.includes(cb.value));
        
        // Reset pengaturan AI setiap kali membuka form edit
        const aiUniverse = document.getElementById('aiItemUniverse');
        if(aiUniverse) aiUniverse.value = '';
        const aiDeepLore = document.getElementById('aiItemDeepLore');
        if(aiDeepLore) aiDeepLore.checked = false;

        this.setPanelState('addItemForm', true);
        document.getElementById('saveItemBtn').innerText = "Update Item";
        document.getElementById('addItemForm').scrollIntoView({ behavior: 'smooth' });
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
    // --- INTEGRASI AI ENCHANTER KHUSUS ITEM ---
    // ==========================================
    async generateItemAI(targetField) {
        const nameInput = document.getElementById('newItemName').value.trim();

        if (!nameInput) {
            return alert("GAGAL: 'Nama Item' wajib diisi agar AI memiliki panduan subjek yang jelas.");
        }

        let targetEl, btnEl, btnId, originalBtnText;
        let aiFocusRule = "";
        
        // Perubahan Aturan AI: Sangat Ringkas, Kalimat Efektif, Tanpa Metafora/Puitis
        const aiLengthRule = "Hasilkan deskripsi secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf pendek). TANPA metafora, TANPA diksi puitis, dan TANPA majas. Gunakan bahasa yang langsung pada intinya (to-the-point).";

        // Mengambil teks yang sudah ada untuk diberikan sebagai konteks silang
        const currentApp = document.getElementById('newItemApp').value.trim();
        const currentDesc = document.getElementById('newItemDesc').value.trim();
        let crossContext = "";

        if (targetField === 'appearance') {
            targetEl = document.getElementById('newItemApp');
            btnId = 'btnAiItemApp';
            aiFocusRule = "Kembangkan wujud fisik, bentuk, ukuran, material/tekstur, warna, dan aura cahaya/kegelapan yang dipancarkan dari item ini. Fokus murni pada VISUAL.";
            if (currentDesc) crossContext = `\n[REFERENSI FUNGSI/EFEK ITEM UNTUK PENYESUAIAN VISUAL]: ${currentDesc}`;
        } else if (targetField === 'description') {
            targetEl = document.getElementById('newItemDesc');
            btnId = 'btnAiItemDesc';
            aiFocusRule = "Kembangkan apa kegunaan/fungsi item ini, efek magis atau mekanismenya, atau sedikit latar belakang sejarah tentang bagaimana item ini bekerja. Fokus murni pada FUNGSI/CERITA.";
            if (currentApp) crossContext = `\n[REFERENSI WUJUD FISIK ITEM UNTUK PENYESUAIAN CERITA]: ${currentApp}`;
        }

        const draftText = targetEl.value.trim();

        // ----------------------------------------
        // Konstruksi Konteks Semesta (Volatile)
        // ----------------------------------------
        const univId = document.getElementById('aiItemUniverse')?.value;
        const useDeepLore = document.getElementById('aiItemDeepLore')?.checked;
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
            moduleName: `Item-${targetField.toUpperCase()}`,
            targetData: {
                namaItem: nameInput,
                informasiSemesta: universeContext,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan dari field lain)",
                drafReferensiPengguna: draftText || "(Kosong. Buatkan ide dari awal murni menggunakan Nama Item yang ada.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, ringkas, dan jelas. Sesuai dengan genre fantasi/sci-fi namun menggunakan bahasa deskriptif yang lugas tanpa kata-kata kiasan atau berbunga-bunga.",
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
            app.showAlert(`Berhasil men-generate AI untuk ${targetField === 'appearance' ? 'Penampilan' : 'Deskripsi'}!`, "success");
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
    renderItemGrid() {
        const container = document.getElementById('itemGridContainer');
        if(!container) return;
        const query = (document.getElementById('searchItemInput')?.value || '').toLowerCase();

        const itemData = this.data.items.map(item => {
            const tagNames = (item.tagIds || []).map(id => {
                const t = this.data.itemTags.find(tag => tag.id === id);
                return (t && t.name) ? t.name.toLowerCase() : '';
            }).join(' ');
            return { ...item, tagIds: item.tagIds || [], tagNames };
        });

        const filtered = itemData.filter(i => 
            (i.name || '').toLowerCase().includes(query) || i.tagNames.includes(query)
        );

        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (filtered.length === 0) {
            container.innerHTML = `<p class="col-span-full text-sm text-slate-500 italic text-center py-8 bg-slate-800/30 rounded border border-dashed border-slate-700">Tidak ada item ditemukan.</p>`; 
            return;
        }
        container.innerHTML = filtered.map(i => this.renderItemCard(i)).join('');
    },

    renderItemCard(item) {
        const itemTags = item.tagIds.map(id => {
            const tag = this.data.itemTags.find(t => t.id === id);
            return tag ? `<span class="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700/50">${tag.name}</span>` 
                        : `<span class="bg-rose-900/50 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 line-through">Invalid</span>`;
        }).join(' ');

        // Panel ID dinamis per Item
        const panelId = `itemDetails_${item.id}`;
        // Ambil status apakah dihide atau tidak (Default: hidden)
        const hiddenClass = (this.getPanelClass) ? this.getPanelClass(panelId) : 'hidden';

        return `
        <div class="bg-slate-900 border border-slate-700 rounded-lg relative group shadow-md transition-colors duration-300 hover:border-cyan-500/50 flex flex-col">
            
            <!-- HEADER (Bisa Diklik untuk Menyembunyikan / Menampilkan Detail) -->
            <div class="p-4 flex justify-between items-center cursor-pointer rounded-t-lg hover:bg-slate-800/50 transition" onclick="app.togglePanel('${panelId}')">
                <h4 class="font-bold text-cyan-400 text-lg truncate pr-4">${item.name}</h4>
                
                <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition z-10">
                        <button onclick="event.stopPropagation(); app.openEditItem('${item.id}')" class="text-slate-400 hover:text-amber-400 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Edit Item">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onclick="event.stopPropagation(); app.deleteItem('${item.id}')" class="text-slate-400 hover:text-rose-500 p-1.5 bg-slate-800 rounded border border-slate-700 transition" title="Hapus Item">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                    <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            <!-- DETAIL KONTEN ITEM (Tersembunyi secara Default) -->
            <div id="${panelId}" class="${hiddenClass}">
                <div class="p-4 pt-0 border-t border-slate-700/50 flex flex-col md:flex-row gap-6 mt-2">
                    
                    <!-- Konten Utama (Kiri) -->
                    <div class="flex-1 space-y-3 pr-0 md:pr-14">
                        <div class="grid grid-cols-1 gap-3">
                            <div class="text-[13px] text-slate-300">
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Rupa / Penampilan:</span> 
                                <div class="leading-relaxed whitespace-pre-wrap">${item.appearance || '<span class="italic text-slate-500">-</span>'}</div>
                            </div>
                            <div class="text-[13px] text-slate-300 pt-2 border-t border-slate-800">
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Efek / Deskripsi:</span> 
                                <div class="leading-relaxed whitespace-pre-wrap">${item.description || '<span class="italic text-slate-500">-</span>'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Panel Samping (Kanan) -->
                    <div class="w-full md:w-1/4 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <div>
                            <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1.5">Tag Kategori Item:</span>
                            <div class="flex flex-wrap gap-1">${itemTags || '<span class="text-[10px] text-slate-600 italic bg-slate-800 px-2 py-0.5 rounded">Tanpa Tag</span>'}</div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
        `;
    }
};