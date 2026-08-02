// Logika CRUD utama karakter yang memunculkan panel editor

export const UniverseCharacterFormMain = {
    // =========================================
    // --- FUNGSI DATA TOKOH (CRUD) ---
    // =========================================

    openAddCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        this.editCharId = null; 
        document.getElementById(`charFormTitle_${safeCat}`).innerText = `Buat Tokoh Baru di ${category}`;
        document.getElementById(`charFormBtn_${safeCat}`).innerText = "Simpan Tokoh";
        
        document.getElementById(`newName_${safeCat}`).value = '';
        document.getElementById(`newBg_${safeCat}`).value = '';
        document.getElementById(`newApp_${safeCat}`).value = '';
        
        document.querySelectorAll(`.charWatakCheck_${safeCat}`).forEach(cb => cb.checked = false);

        const skillSearchInput = document.getElementById(`charSkillSearch_${safeCat}`);
        if(skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderCharSkillCheckboxes(univId, category, true); 
        
        const itemSearchInput = document.getElementById(`charItemSearch_${safeCat}`);
        if(itemSearchInput) itemSearchInput.value = app.currentItemFilter || '';
        this.renderCharItemCheckboxes(univId, category, true); 

        const familiarSearchInput = document.getElementById(`charFamiliarSearch_${safeCat}`);
        if(familiarSearchInput) familiarSearchInput.value = app.currentFamiliarFilter || '';
        this.renderCharFamiliarCheckboxes(univId, category, true);

        this.setPanelState(`cat_${safeCat}`, true);
        this.setPanelState(`addChar_${safeCat}`, true);
    },

    openEditCharacter(univId, category, charId) {
        const safeCat = category.replace(/\s/g, '');
        const universe = this.data.universes.find(u => u.id === univId);
        const char = universe.characters[category].find(c => c.id === charId);
        if (!char) return;

        this.editCharId = charId;
        this.setPanelState(`cat_${safeCat}`, true);
        this.setPanelState(`addChar_${safeCat}`, true);

        document.getElementById(`charFormTitle_${safeCat}`).innerText = `Edit Tokoh: ${char.name}`;
        document.getElementById(`charFormBtn_${safeCat}`).innerText = "Update Tokoh";
        
        document.getElementById(`newName_${safeCat}`).value = char.name;
        document.getElementById(`newBg_${safeCat}`).value = char.background || '';
        document.getElementById(`newApp_${safeCat}`).value = char.appearance || '';
        
        // Migrasi & Centang Data Watak
        let watakArray = [];
        if (Array.isArray(char.personality)) {
            watakArray = char.personality;
        } else if (typeof char.personality === 'string' && char.personality.trim() !== '') {
            watakArray = char.personality.split(',').map(s => s.trim());
        }
        document.querySelectorAll(`.charWatakCheck_${safeCat}`).forEach(cb => {
            cb.checked = watakArray.includes(cb.value);
        });

        const skillSearchInput = document.getElementById(`charSkillSearch_${safeCat}`);
        if(skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderCharSkillCheckboxes(univId, category, true);

        const itemSearchInput = document.getElementById(`charItemSearch_${safeCat}`);
        if(itemSearchInput) itemSearchInput.value = app.currentItemFilter || '';
        this.renderCharItemCheckboxes(univId, category, true);

        const familiarSearchInput = document.getElementById(`charFamiliarSearch_${safeCat}`);
        if(familiarSearchInput) familiarSearchInput.value = app.currentFamiliarFilter || '';
        this.renderCharFamiliarCheckboxes(univId, category, true);

        // Fitur: Auto-scroll ke lokasi panel editor setelah inisialisasi state
        setTimeout(() => {
            const editorPanel = document.getElementById(`addChar_${safeCat}`);
            if (editorPanel) {
                editorPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                editorPanel.classList.add('ring-2', 'ring-indigo-500', 'transition-all', 'duration-500');
                setTimeout(() => editorPanel.classList.remove('ring-2', 'ring-indigo-500'), 1500);
            }
        }, 150);
    },

    addCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        const name = document.getElementById(`newName_${safeCat}`).value.trim();
        if (!name) return this.showAlert("Nama tokoh tidak boleh kosong", "error");

        const background = document.getElementById(`newBg_${safeCat}`).value.trim();
        const appearance = document.getElementById(`newApp_${safeCat}`).value.trim();
        
        const personality = Array.from(document.querySelectorAll(`.charWatakCheck_${safeCat}:checked`)).map(cb => cb.value);
        const skillIds = Array.from(document.querySelectorAll(`.skillCheck_${safeCat}:checked`)).map(cb => cb.value);
        const itemIds = Array.from(document.querySelectorAll(`.itemCheck_${safeCat}:checked`)).map(cb => cb.value);
        const familiarIds = Array.from(document.querySelectorAll(`.familiarCheck_${safeCat}:checked`)).map(cb => cb.value);

        const universe = this.data.universes.find(u => u.id === univId);

        if (this.editCharId) {
            const char = universe.characters[category].find(c => c.id === this.editCharId);
            if (char) {
                char.name = name; 
                char.personality = personality; 
                char.background = background;
                char.appearance = appearance;
                char.skillIds = skillIds; 
                char.itemIds = itemIds;
                char.familiarIds = familiarIds; 
                // Notes & Dialogues tidak di-overwrite agar tidak hilang
            }
            this.editCharId = null;
            this.showAlert("Tokoh berhasil diupdate", "success");
        } else {
            universe.characters[category].push({
                id: this.generateId('c'), 
                name, 
                personality, 
                background, 
                appearance, 
                skillIds, 
                itemIds, 
                familiarIds,
                notes: [],
                dialogues: []
            });
            this.showAlert("Tokoh berhasil ditambahkan", "success");
        }
        
        this.setPanelState(`addChar_${safeCat}`, false);
        this.saveData();
        this.switchView(univId);
    },

    cancelEditCharacter(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        this.editCharId = null;
        
        const titleEl = document.getElementById(`charFormTitle_${safeCat}`);
        const btnEl = document.getElementById(`charFormBtn_${safeCat}`);
        if (titleEl) titleEl.innerText = `Buat Tokoh Baru di ${category}`;
        if (btnEl) btnEl.innerText = "Simpan Tokoh";
        
        this.setPanelState(`addChar_${safeCat}`, false);
    },

    deleteCharacter(univId, category, charId) {
        this.showCustomModal({
            title: "Hapus Karakter",
            content: "Anda yakin ingin menghapus karakter ini secara permanen?",
            confirmText: "Hapus Karakter",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                universe.characters[category] = universe.characters[category].filter(c => c.id !== charId);
                this.saveData();
                this.switchView(univId);
                this.showAlert("Karakter berhasil dihapus.", "info");
            }
        });
    },

    moveCharacterUp(univId, category, charId) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe || !universe.characters[category]) return;

        const charArray = universe.characters[category];
        const index = charArray.findIndex(c => c.id === charId);

        // Hanya jalankan jika karakter ditemukan dan posisinya bukan yang paling atas (index > 0)
        if (index > 0) {
            // Tukar posisi dengan elemen di atasnya
            const temp = charArray[index - 1];
            charArray[index - 1] = charArray[index];
            charArray[index] = temp;

            this.saveData(true); 
            this.switchView(univId);
        }
    }
}