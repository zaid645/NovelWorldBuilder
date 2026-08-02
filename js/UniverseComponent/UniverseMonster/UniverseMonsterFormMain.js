// Editor utama monster yang memunculkan panel editor

export const UniverseMonsterFormMain = {
    openAddMonster(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        this.editMonsterId = null; 
        document.getElementById(`monsterFormTitle_${safeCat}`).innerText = `Buat Monster Baru di ${category}`;
        document.getElementById(`monsterFormBtn_${safeCat}`).innerText = "Simpan Monster";
        
        document.getElementById(`newMonsterName_${safeCat}`).value = '';
        document.getElementById(`newMonsterBg_${safeCat}`).value = '';
        document.getElementById(`newMonsterApp_${safeCat}`).value = '';
        
        document.querySelectorAll(`.monsterWatakCheck_${safeCat}`).forEach(cb => cb.checked = false);
        
        // Render filter-based checkboxes untuk Form Tambah Monster
        const skillSearchInput = document.getElementById(`monsterSkillSearch_${safeCat}`);
        if(skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderMonsterSkillCheckboxes(univId, category, true); 
        
        const itemSearchInput = document.getElementById(`monsterItemSearch_${safeCat}`);
        if(itemSearchInput) itemSearchInput.value = app.currentItemFilter || '';
        this.renderMonsterItemCheckboxes(univId, category, true); 

        const familiarSearchInput = document.getElementById(`monsterFamiliarSearch_${safeCat}`);
        if(familiarSearchInput) familiarSearchInput.value = app.currentFamiliarFilter || '';
        this.renderMonsterFamiliarCheckboxes(univId, category, true);

        this.setPanelState(`monsterCat_${safeCat}`, true);
        this.setPanelState(`addMonster_${safeCat}`, true);
    },

    openEditMonster(univId, category, monsterId) {
        const safeCat = category.replace(/\s/g, '');
        const universe = this.data.universes.find(u => u.id === univId);
        const monster = universe.monsters[category].find(m => m.id === monsterId);
        if (!monster) return;

        this.editMonsterId = monsterId;
        this.setPanelState(`monsterCat_${safeCat}`, true);
        this.setPanelState(`addMonster_${safeCat}`, true);

        document.getElementById(`monsterFormTitle_${safeCat}`).innerText = `Edit Monster: ${monster.name}`;
        document.getElementById(`monsterFormBtn_${safeCat}`).innerText = "Update Monster";
        
        document.getElementById(`newMonsterName_${safeCat}`).value = monster.name;
        document.getElementById(`newMonsterBg_${safeCat}`).value = monster.background || '';
        document.getElementById(`newMonsterApp_${safeCat}`).value = monster.appearance || '';
        
        // Migrasi & Centang Data Watak/Sifat
        let watakArray = [];
        if (Array.isArray(monster.personality)) {
            watakArray = monster.personality;
        } else if (typeof monster.personality === 'string' && monster.personality.trim() !== '') {
            watakArray = monster.personality.split(',').map(s => s.trim());
        }
        document.querySelectorAll(`.monsterWatakCheck_${safeCat}`).forEach(cb => {
            cb.checked = watakArray.includes(cb.value);
        });

        // Render filter-based checkboxes untuk Form Edit Monster (Is Initial = true)
        const skillSearchInput = document.getElementById(`monsterSkillSearch_${safeCat}`);
        if(skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderMonsterSkillCheckboxes(univId, category, true);

        const itemSearchInput = document.getElementById(`monsterItemSearch_${safeCat}`);
        if(itemSearchInput) itemSearchInput.value = app.currentItemFilter || '';
        this.renderMonsterItemCheckboxes(univId, category, true);

        const familiarSearchInput = document.getElementById(`monsterFamiliarSearch_${safeCat}`);
        if(familiarSearchInput) familiarSearchInput.value = app.currentFamiliarFilter || '';
        this.renderMonsterFamiliarCheckboxes(univId, category, true);

        // Auto-scroll ke lokasi panel editor
        setTimeout(() => {
            const editorPanel = document.getElementById(`addMonster_${safeCat}`);
            if (editorPanel) {
                editorPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                editorPanel.classList.add('ring-2', 'ring-red-500', 'transition-all', 'duration-500');
                setTimeout(() => editorPanel.classList.remove('ring-2', 'ring-red-500'), 1500);
            }
        }, 150);
    },

    addMonster(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        const name = document.getElementById(`newMonsterName_${safeCat}`).value.trim();
        if (!name) return this.showAlert("Nama monster tidak boleh kosong", "error");

        const background = document.getElementById(`newMonsterBg_${safeCat}`).value.trim();
        const appearance = document.getElementById(`newMonsterApp_${safeCat}`).value.trim();
        
        const personality = Array.from(document.querySelectorAll(`.monsterWatakCheck_${safeCat}:checked`)).map(cb => cb.value);
        const skillIds = Array.from(document.querySelectorAll(`.monsterSkillCheck_${safeCat}:checked`)).map(cb => cb.value);
        const itemIds = Array.from(document.querySelectorAll(`.monsterItemCheck_${safeCat}:checked`)).map(cb => cb.value);
        const familiarIds = Array.from(document.querySelectorAll(`.monsterFamiliarCheck_${safeCat}:checked`)).map(cb => cb.value);

        const universe = this.data.universes.find(u => u.id === univId);

        if (this.editMonsterId) {
            const monster = universe.monsters[category].find(m => m.id === this.editMonsterId);
            if (monster) {
                monster.name = name; 
                monster.personality = personality; 
                monster.background = background;
                monster.appearance = appearance;
                monster.skillIds = skillIds; 
                monster.itemIds = itemIds;
                monster.familiarIds = familiarIds; 
            }
            this.editMonsterId = null;
            this.showAlert("Monster berhasil diupdate", "success");
        } else {
            universe.monsters[category].push({
                id: this.generateId('m'), 
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
            this.showAlert("Monster berhasil ditambahkan", "success");
        }
        
        this.setPanelState(`addMonster_${safeCat}`, false);
        this.saveData();
        this.switchView(univId);
    },

    cancelEditMonster(univId, category) {
        const safeCat = category.replace(/\s/g, '');
        this.editMonsterId = null;
        
        const titleEl = document.getElementById(`monsterFormTitle_${safeCat}`);
        const btnEl = document.getElementById(`monsterFormBtn_${safeCat}`);
        if (titleEl) titleEl.innerText = `Buat Monster Baru di ${category}`;
        if (btnEl) btnEl.innerText = "Simpan Monster";
        
        this.setPanelState(`addMonster_${safeCat}`, false);
    },

    deleteMonster(univId, category, monsterId) {
        this.showCustomModal({
            title: "Hapus Monster",
            content: "Anda yakin ingin menghapus monster ini secara permanen?",
            confirmText: "Hapus Monster",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                universe.monsters[category] = universe.monsters[category].filter(m => m.id !== monsterId);
                this.saveData();
                this.switchView(univId);
                this.showAlert("Monster berhasil dihapus.", "info");
            }
        });
    },

    moveMonsterUp(univId, category, monsterId) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe || !universe.monsters[category]) return;

        const monsterArray = universe.monsters[category];
        const index = monsterArray.findIndex(m => m.id === monsterId);

        if (index > 0) {
            const temp = monsterArray[index - 1];
            monsterArray[index - 1] = monsterArray[index];
            monsterArray[index] = temp;

            this.saveData(true); 
            this.switchView(univId);
        }
    },
}