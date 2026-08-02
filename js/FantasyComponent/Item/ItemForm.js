// Logika Form, CRUD Item, & Integrasi AI

export const ItemForm = {

    editItemId: null,

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
        
        // Reset filter & render list skill awal
        const skillSearchInput = document.getElementById('itemSkillSearch');
        if (skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderItemSkillCheckboxes(true);
        
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

        // Reset filter & render list skill awal
        const skillSearchInput = document.getElementById('itemSkillSearch');
        if (skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderItemSkillCheckboxes(true);

        // Reset pengaturan AI
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
        // Ambil data skill tertaut
        const skillIds = Array.from(document.querySelectorAll('.itemSkillCheck:checked')).map(cb => cb.value);

        if (this.editItemId) {
            const item = this.data.items.find(i => i.id === this.editItemId);
            if(item) { 
                item.name = name; 
                item.appearance = appearance; 
                item.description = description; 
                item.tagIds = tagIds; 
                item.skillIds = skillIds;
            }
            this.editItemId = null;
            this.showAlert("Item berhasil diupdate", "success");
        } else {
            this.data.items.push({ 
                id: this.generateId('i'), 
                name, appearance, description, tagIds, 
                skillIds 
            });
            this.showAlert("Item baru disimpan", "success");
        }

        this.setPanelState('addItemForm', false);
        this.saveData(true); this.switchView('items');
    },
    deleteItem(id) {
        const item = this.data.items.find(i => i.id === id);
        if (!item) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus item <b class="text-cyan-400">"${item.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tindakan ini tidak dapat dibatalkan dan item akan dihapus secara permanen dari daftar.</p>
            </div>
        `;

        this.showCustomModal({
            title: "Hapus Item",
            content: content,
            confirmText: "Hapus Item",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.data.items = this.data.items.filter(i => i.id !== id);
                
                this.closeItemDetailFloating();
                this.setPanelState('addItemForm', false);
                this.saveData();
                this.switchView('items');
                this.showAlert(`Item "${item.name}" berhasil dihapus.`, "success");
                return true;
            }
        });
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
        
        const aiLengthRule = "Hasilkan deskripsi secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf pendek). TANPA metafora, TANPA diksi puitis, dan TANPA majas. Gunakan bahasa yang langsung pada intinya (to-the-point).";

        const currentApp = document.getElementById('newItemApp').value.trim();
        const currentDesc = document.getElementById('newItemDesc').value.trim();
        
        const linkedSkillNames = Array.from(document.querySelectorAll('.itemSkillCheck:checked')).map(cb => cb.nextElementSibling.innerText).join(', ');
        const skillContext = linkedSkillNames ? `\n[CATATAN: Item ini memungkinkan pengguna untuk mengeluarkan skill: ${linkedSkillNames}. Pertimbangkan ini dalam merancang fungsinya.]` : "";

        let crossContext = "";

        if (targetField === 'appearance') {
            targetEl = document.getElementById('newItemApp');
            btnId = 'btnAiItemApp';
            aiFocusRule = "Kembangkan wujud fisik, bentuk, ukuran, material/tekstur, warna, dan aura cahaya/kegelapan yang dipancarkan dari item ini. Fokus murni pada VISUAL.";
            if (currentDesc) crossContext = `\n[REFERENSI FUNGSI/EFEK ITEM UNTUK PENYESUAIAN VISUAL]: ${currentDesc}${skillContext}`;
        } else if (targetField === 'description') {
            targetEl = document.getElementById('newItemDesc');
            btnId = 'btnAiItemDesc';
            aiFocusRule = "Kembangkan apa kegunaan/fungsi item ini, efek magis atau mekanismenya, atau sedikit latar belakang sejarah tentang bagaimana item ini bekerja. Fokus murni pada FUNGSI/CERITA.";
            if (currentApp) crossContext = `\n[REFERENSI WUJUD FISIK ITEM UNTUK PENYESUAIAN CERITA]: ${currentApp}${skillContext}`;
        }

        const draftText = targetEl.value.trim();

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
    // --- KHUSUS CHECKBOX SKILL PADA ITEM ---
    // ==========================================
    onItemSkillSearchInput(event) {
        app.currentSkillFilter = event.target.value;
        app.renderItemSkillCheckboxes();
    },

    renderItemSkillCheckboxes(isInitial = false) {
        const container = document.getElementById('itemSkillList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            // Jika form baru dibuka (Add/Edit), ambil dari item yang sedang di-edit
            const activeItem = this.editItemId ? this.data.items.find(i => i.id === this.editItemId) : null;
            allCheckedIds = activeItem ? (activeItem.skillIds || []) : [];
        } else {
            // Jika sedang mengetik/mencari, baca status checkbox yang tercentang di layar
            const currentCheckedNodes = document.querySelectorAll('.itemSkillCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        // Ambil kata kunci filter
        const filterQuery = (app.currentSkillFilter || '').toLowerCase();
        const allSkills = this.data.skills || [];
        const allSkillTags = this.data.skillTags || []; // Ambil data tag skill
        
        // Filter skill berdasarkan NAMA atau TAG SKILL
        const filteredSkills = allSkills.filter(s => {
            if (!filterQuery) return true;

            // 1. Pencarian berdasarkan nama skill
            const nameMatch = (s.name || '').toLowerCase().includes(filterQuery);

            // 2. Pencarian berdasarkan nama-nama tag skill
            const tagNames = (s.tagIds || []).map(id => {
                const tag = allSkillTags.find(t => t.id === id);
                return tag ? tag.name.toLowerCase() : '';
            }).join(' ');

            const tagMatch = tagNames.includes(filterQuery);

            return nameMatch || tagMatch;
        });

        const skillMap = new Map();
        filteredSkills.forEach(s => skillMap.set(s.id, s));

        // FITUR UTAMA TETAP DIPERTAHANKAN:
        // Pertahankan skill yang SEDANG DICENTANG agar tidak tersembunyi saat terkena filter pencarian
        allCheckedIds.forEach(id => {
            if (!skillMap.has(id)) {
                const originalSkill = allSkills.find(s => s.id === id);
                if (originalSkill) skillMap.set(originalSkill.id, originalSkill);
            }
        });

        // Urutkan alfabetis
        const displaySkills = Array.from(skillMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displaySkills.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada skill yang ditemukan.</span>';
            return;
        }

        // Render ulang list checkbox
        container.innerHTML = displaySkills.map(s => `
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${s.id}" class="itemSkillCheck form-checkbox rounded text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-500"
                ${allCheckedIds.includes(s.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${s.name}">${s.name}</span>
            </label>
        `).join('');
    }
}