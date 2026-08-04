// Logika CRUD utama karakter

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
        document.getElementById(`newAge_${safeCat}`).value = '';
        document.getElementById(`newGender_${safeCat}`).value = '';
        document.getElementById(`newBg_${safeCat}`).value = '';
        document.getElementById(`newApp_${safeCat}`).value = '';

        // Reset Filter Search Input
        const raceSearchInput = document.getElementById(`charRaceSearch_${safeCat}`);
        if(raceSearchInput) raceSearchInput.value = app.currentCharRaceFilter || '';
        this.renderCharRaceRadioButtons(univId, category, true);

        const watakSearchInput = document.getElementById(`charWatakSearch_${safeCat}`);
        if(watakSearchInput) watakSearchInput.value = app.currentWatakFilter || '';
        this.renderCharWatakCheckboxes(univId, category, true);

        const skillSearchInput = document.getElementById(`charSkillSearch_${safeCat}`);
        if(skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderCharSkillCheckboxes(univId, category, true); 
        
        const itemSearchInput = document.getElementById(`charItemSearch_${safeCat}`);
        if(itemSearchInput) itemSearchInput.value = app.currentItemFilter || '';
        this.renderCharItemCheckboxes(univId, category, true); 

        const familiarSearchInput = document.getElementById(`charFamiliarSearch_${safeCat}`);
        if(familiarSearchInput) familiarSearchInput.value = app.currentFamiliarFilter || '';
        this.renderCharFamiliarCheckboxes(univId, category, true);

        const genderSelect = document.getElementById(`newGender_${safeCat}`);
        if (genderSelect) {
            genderSelect.value = "Laki-laki";
        }

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
        
        document.getElementById(`newName_${safeCat}`).value = char.name || '';
        document.getElementById(`newAge_${safeCat}`).value = char.age !== undefined && char.age !== null ? char.age : '';
        document.getElementById(`newGender_${safeCat}`).value = char.gender || '';
        document.getElementById(`newBg_${safeCat}`).value = char.background || '';
        document.getElementById(`newApp_${safeCat}`).value = char.appearance || '';
        
        const raceSearchInput = document.getElementById(`charRaceSearch_${safeCat}`);
        if(raceSearchInput) raceSearchInput.value = app.currentCharRaceFilter || '';
        this.renderCharRaceRadioButtons(univId, category, true);

        const watakSearchInput = document.getElementById(`charWatakSearch_${safeCat}`);
        if(watakSearchInput) watakSearchInput.value = app.currentWatakFilter || '';
        this.renderCharWatakCheckboxes(univId, category, true);

        const skillSearchInput = document.getElementById(`charSkillSearch_${safeCat}`);
        if(skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderCharSkillCheckboxes(univId, category, true);

        const itemSearchInput = document.getElementById(`charItemSearch_${safeCat}`);
        if(itemSearchInput) itemSearchInput.value = app.currentItemFilter || '';
        this.renderCharItemCheckboxes(univId, category, true);

        const familiarSearchInput = document.getElementById(`charFamiliarSearch_${safeCat}`);
        if(familiarSearchInput) familiarSearchInput.value = app.currentFamiliarFilter || '';
        this.renderCharFamiliarCheckboxes(univId, category, true);

        const genderVal = char.gender || 'Laki-laki';
        const genderSelect = document.getElementById(`newGender_${safeCat}`);
        if (genderSelect) {
            genderSelect.value = genderVal;
        }

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

        const ageInput = document.getElementById(`newAge_${safeCat}`).value.trim();
        const age = ageInput !== "" ? parseInt(ageInput, 10) : null;
        const gender = document.getElementById(`newGender_${safeCat}`).value;

        // Ambil ID Ras terpilih dari Radio Button
        const selectedRaceNode = document.querySelector(`input[name="charRaceRadio_${safeCat}"]:checked`);
        const raceId = selectedRaceNode ? selectedRaceNode.value : "";

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
                char.age = age;
                char.gender = gender;
                char.raceId = raceId;
                char.personality = personality; 
                char.background = background;
                char.appearance = appearance;
                char.skillIds = skillIds; 
                char.itemIds = itemIds;
                char.familiarIds = familiarIds; 
            }
            this.editCharId = null;
            this.showAlert("Tokoh berhasil diupdate", "success");
        } else {
            universe.characters[category].push({
                id: this.generateId('c'), 
                name, 
                age,
                gender,
                raceId,
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

        if (index > 0) {
            const temp = charArray[index - 1];
            charArray[index - 1] = charArray[index];
            charArray[index] = temp;

            this.saveData(true); 
            this.switchView(univId);
        }
    }
};