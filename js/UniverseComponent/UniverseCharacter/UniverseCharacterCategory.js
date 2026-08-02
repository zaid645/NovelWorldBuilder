// Logika CRUD kategori dan urutan karakter

export const UniverseCharacterCategory = {
    addCharacterCategory(univId) {
        const content = `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Nama Kategori <span class="text-rose-400">*</span></label>
                    <input type="text" id="newCatName" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="Misal: Karakter Utama, Ksatria, dll">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Deskripsi Kategori</label>
                    <textarea id="newCatDesc" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="Penjelasan singkat mengenai kategori ini..."></textarea>
                </div>
            </div>
        `;
        
        this.showCustomModal({
            title: "Tambah Kategori Tokoh Baru",
            content: content,
            confirmText: "Tambah Kategori",
            onConfirm: () => {
                const name = document.getElementById('newCatName').value.trim();
                const desc = document.getElementById('newCatDesc').value.trim();
                
                if (!name) {
                    this.showAlert("Nama kategori tidak boleh kosong!", "error");
                    return false;
                }
                
                const universe = this.data.universes.find(u => u.id === univId);
                if (universe.characters[name]) {
                    this.showAlert(`Kategori "${name}" sudah ada!`, "error");
                    return false;
                }

                universe.characters[name] = [];
                universe.charactersCategoryDescriptions = universe.charactersCategoryDescriptions || {};
                universe.charactersCategoryDescriptions[name] = desc;
                
                this.saveData();
                this.switchView(univId);
                return true;
            }
        });
    },

    moveCharacterCategoryUp(univId, categoryName) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;

        const keys = Object.keys(universe.characters);
        const index = keys.indexOf(categoryName);

        if (index > 0) {
            const temp = keys[index - 1];
            keys[index - 1] = keys[index];
            keys[index] = temp;

            const updatedCharacters = {};
            keys.forEach(key => {
                updatedCharacters[key] = universe.characters[key];
            });

            universe.characters = updatedCharacters;
            this.saveData(true); 
            this.switchView(univId);
        }
    },

    renameCharacterCategory(univId, oldCategoryName) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;

        const oldDesc = (universe.charactersCategoryDescriptions && universe.charactersCategoryDescriptions[oldCategoryName]) || "";

        const content = `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Ubah Nama Kategori</label>
                    <input type="text" id="editCatName" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none" value="${oldCategoryName}">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Ubah Deskripsi Kategori</label>
                    <textarea id="editCatDesc" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none">${oldDesc}</textarea>
                </div>
            </div>
        `;

        this.showCustomModal({
            title: "Edit Kategori Tokoh",
            content: content,
            confirmText: "Simpan Perubahan",
            confirmColor: "bg-amber-600 hover:bg-amber-500",
            onConfirm: () => {
                const newCategoryName = document.getElementById('editCatName').value.trim();
                const newDesc = document.getElementById('editCatDesc').value.trim();

                if (!newCategoryName) {
                    this.showAlert("Nama kategori tidak boleh kosong!", "error");
                    return false;
                }

                if (newCategoryName !== oldCategoryName && universe.characters[newCategoryName]) {
                    this.showAlert(`Kategori "${newCategoryName}" sudah ada!`, "error");
                    return false;
                }

                const updatedCharacters = {};
                for (let key in universe.characters) {
                    if (key === oldCategoryName) {
                        updatedCharacters[newCategoryName] = universe.characters[key];
                    } else {
                        updatedCharacters[key] = universe.characters[key];
                    }
                }

                universe.characters = updatedCharacters;
                universe.charactersCategoryDescriptions = universe.charactersCategoryDescriptions || {};
                
                if (newCategoryName !== oldCategoryName) {
                    delete universe.charactersCategoryDescriptions[oldCategoryName];
                }
                universe.charactersCategoryDescriptions[newCategoryName] = newDesc;

                this.saveData();
                this.switchView(univId);
                this.showAlert(`Kategori berhasil diperbarui.`, "success");
                return true;
            }
        });
    },

    deleteCategory(univId, category) {
        this.showCustomModal({
            title: "Hapus Kategori",
            content: `Apakah Anda yakin ingin menghapus kategori tokoh <b>"${category}"</b>?<br><br><span class="text-rose-400 text-xs font-medium px-2 py-1 bg-rose-950/50 rounded block border border-rose-900/50">PERINGATAN: Seluruh tokoh di dalam kategori ini akan ikut terhapus secara permanen!</span>`,
            confirmText: "Hapus Permanen",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                if (!universe) return;
                
                delete universe.characters[category];
                if (universe.charactersCategoryDescriptions) delete universe.charactersCategoryDescriptions[category];
                
                this.saveData();
                this.switchView(univId);
                this.showAlert(`Kategori "${category}" berhasil dihapus.`, "warning");
            }
        });
    },

    moveCharacterToCategory(univId, currentCategory, charId) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;

        // Ambil daftar kategori lain selain kategori saat ini
        const availableCategories = Object.keys(universe.characters).filter(cat => cat !== currentCategory);

        if (availableCategories.length === 0) {
            return this.showAlert("Tidak ada kategori lain untuk memindahkan karakter ini.", "warning");
        }

        const char = universe.characters[currentCategory].find(c => c.id === charId);
        if (!char) return;

        const optionsHtml = availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        const content = `
            <div class="space-y-3 text-left">
                <p class="text-xs text-slate-300">Pilih kategori tujuan untuk tokoh <b class="text-indigo-400">${char.name}</b>:</p>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Kategori Tujuan</label>
                    <select id="targetCategorySelect" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none transition">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;

        this.showCustomModal({
            title: "Pindahkan Karakter",
            content: content,
            confirmText: "Pindahkan",
            confirmColor: "bg-indigo-600 hover:bg-indigo-500",
            onConfirm: () => {
                const targetCategory = document.getElementById('targetCategorySelect').value;
                if (!targetCategory) return false;

                // 1. Hapus dari kategori saat ini
                universe.characters[currentCategory] = universe.characters[currentCategory].filter(c => c.id !== charId);

                // 2. Tambahkan ke kategori tujuan
                if (!universe.characters[targetCategory]) {
                    universe.characters[targetCategory] = [];
                }
                universe.characters[targetCategory].push(char);

                // 3. Simpan dan perbarui tampilan
                this.saveData();
                this.switchView(univId);
                this.showAlert(`Tokoh "${char.name}" berhasil dipindahkan ke kategori "${targetCategory}".`, "success");
                return true;
            }
        });
    }
}