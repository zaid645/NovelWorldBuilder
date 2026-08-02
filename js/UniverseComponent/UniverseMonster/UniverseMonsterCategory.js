// Logika CRUD kategori dan urutan monster

export const UniverseMonsterCategory = {
    addMonsterCategory(univId) {
        const content = `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Nama Kategori <span class="text-rose-400">*</span></label>
                    <input type="text" id="newMonsterCatName" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition" placeholder="Misal: Boss, Undead, Binatang Buas">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Deskripsi Kategori</label>
                    <textarea id="newMonsterCatDesc" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition" placeholder="Penjelasan singkat mengenai kategori monster ini..."></textarea>
                </div>
            </div>
        `;
        
        this.showCustomModal({
            title: "Tambah Kategori Monster Baru",
            content: content,
            confirmText: "Tambah Kategori",
            confirmColor: "bg-red-600 hover:bg-red-500",
            onConfirm: () => {
                const name = document.getElementById('newMonsterCatName').value.trim();
                const desc = document.getElementById('newMonsterCatDesc').value.trim();
                
                if (!name) {
                    this.showAlert("Nama kategori tidak boleh kosong!", "error");
                    return false;
                }
                
                const universe = this.data.universes.find(u => u.id === univId);
                universe.monsters = universe.monsters || {};
                
                if (universe.monsters[name]) {
                    this.showAlert(`Kategori "${name}" sudah ada!`, "error");
                    return false;
                }

                universe.monsters[name] = [];
                universe.monstersCategoryDescriptions = universe.monstersCategoryDescriptions || {};
                universe.monstersCategoryDescriptions[name] = desc;
                
                this.saveData();
                this.switchView(univId);
                return true;
            }
        });
    },

    moveMonsterCategoryUp(univId, categoryName) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe || !universe.monsters) return;

        const keys = Object.keys(universe.monsters);
        const index = keys.indexOf(categoryName);

        if (index > 0) {
            const temp = keys[index - 1];
            keys[index - 1] = keys[index];
            keys[index] = temp;

            const updatedMonsters = {};
            keys.forEach(key => {
                updatedMonsters[key] = universe.monsters[key];
            });

            universe.monsters = updatedMonsters;
            this.saveData(true); 
            this.switchView(univId);
        }
    },

    renameMonsterCategory(univId, oldCategoryName) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe || !universe.monsters) return;

        const oldDesc = (universe.monstersCategoryDescriptions && universe.monstersCategoryDescriptions[oldCategoryName]) || "";

        const content = `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Ubah Nama Kategori</label>
                    <input type="text" id="editMonsterCatName" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none" value="${oldCategoryName}">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Ubah Deskripsi Kategori</label>
                    <textarea id="editMonsterCatDesc" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none">${oldDesc}</textarea>
                </div>
            </div>
        `;

        this.showCustomModal({
            title: "Edit Kategori Monster",
            content: content,
            confirmText: "Simpan Perubahan",
            confirmColor: "bg-amber-600 hover:bg-amber-500",
            onConfirm: () => {
                const newCategoryName = document.getElementById('editMonsterCatName').value.trim();
                const newDesc = document.getElementById('editMonsterCatDesc').value.trim();

                if (!newCategoryName) {
                    this.showAlert("Nama kategori tidak boleh kosong!", "error");
                    return false;
                }

                if (newCategoryName !== oldCategoryName && universe.monsters[newCategoryName]) {
                    this.showAlert(`Kategori "${newCategoryName}" sudah ada!`, "error");
                    return false;
                }

                const updatedMonsters = {};
                for (let key in universe.monsters) {
                    if (key === oldCategoryName) {
                        updatedMonsters[newCategoryName] = universe.monsters[key];
                    } else {
                        updatedMonsters[key] = universe.monsters[key];
                    }
                }

                universe.monsters = updatedMonsters;
                universe.monstersCategoryDescriptions = universe.monstersCategoryDescriptions || {};
                
                if (newCategoryName !== oldCategoryName) {
                    delete universe.monstersCategoryDescriptions[oldCategoryName];
                }
                universe.monstersCategoryDescriptions[newCategoryName] = newDesc;

                this.saveData();
                this.switchView(univId);
                this.showAlert(`Kategori berhasil diperbarui.`, "success");
                return true;
            }
        });
    },

    deleteMonsterCategory(univId, category) {
        this.showCustomModal({
            title: "Hapus Kategori Monster",
            content: `Apakah Anda yakin ingin menghapus kategori monster <b>"${category}"</b>?<br><br><span class="text-rose-400 text-xs font-medium px-2 py-1 bg-rose-950/50 rounded block border border-rose-900/50">PERINGATAN: Seluruh monster di dalam kategori ini akan ikut terhapus secara permanen!</span>`,
            confirmText: "Hapus Permanen",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                if (!universe) return;
                
                delete universe.monsters[category];
                if (universe.monstersCategoryDescriptions) delete universe.monstersCategoryDescriptions[category];
                
                this.saveData();
                this.switchView(univId);
                this.showAlert(`Kategori "${category}" berhasil dihapus.`, "warning");
            }
        });
    },

    moveMonsterToCategory(univId, currentCategory, monsterId) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe || !universe.monsters) return;

        // Ambil daftar kategori lain selain kategori saat ini
        const availableCategories = Object.keys(universe.monsters).filter(cat => cat !== currentCategory);

        if (availableCategories.length === 0) {
            return this.showAlert("Tidak ada kategori lain untuk memindahkan monster ini.", "warning");
        }

        const monster = universe.monsters[currentCategory].find(m => m.id === monsterId);
        if (!monster) return;

        const optionsHtml = availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        const content = `
            <div class="space-y-3 text-left">
                <p class="text-xs text-slate-300">Pilih kategori tujuan untuk monster <b class="text-red-400">${monster.name}</b>:</p>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Kategori Tujuan</label>
                    <select id="targetMonsterCategorySelect" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-red-500 outline-none transition">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;

        this.showCustomModal({
            title: "Pindahkan Monster",
            content: content,
            confirmText: "Pindahkan",
            confirmColor: "bg-red-600 hover:bg-red-500",
            onConfirm: () => {
                const targetCategory = document.getElementById('targetMonsterCategorySelect').value;
                if (!targetCategory) return false;

                // 1. Hapus dari kategori saat ini
                universe.monsters[currentCategory] = universe.monsters[currentCategory].filter(m => m.id !== monsterId);

                // 2. Tambahkan ke kategori tujuan
                if (!universe.monsters[targetCategory]) {
                    universe.monsters[targetCategory] = [];
                }
                universe.monsters[targetCategory].push(monster);

                // 3. Buka otomatis accordion/panel kategori tujuan secara visual
                const targetSafeCat = targetCategory.replace(/\s/g, '');
                this.setPanelState(`monsterCat_${targetSafeCat}`, true);

                // 4. Simpan dan render ulang tampilan
                this.saveData();
                this.switchView(univId);
                this.showAlert(`Monster "${monster.name}" berhasil dipindahkan ke kategori "${targetCategory}".`, "success");
                return true;
            }
        });
    }
}