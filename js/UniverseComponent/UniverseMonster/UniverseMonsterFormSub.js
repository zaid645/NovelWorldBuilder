// Editor monster tanpa harus membuka panel editor

export const UniverseMonsterFormSub = {
    addMonsterDialogue(univId, category, monsterId) {
        const inputEl = document.getElementById(`newMonsterDlg_${monsterId}`);
        let text = inputEl.value.trim();
        
        if (text) {
            const universe = this.data.universes.find(u => u.id === univId);
            const monster = universe.monsters[category].find(m => m.id === monsterId);
            
            if (!monster.dialogues) monster.dialogues = [];
            if (!text.includes('"')) {
                text = `"${text}"`;
            }
            
            monster.dialogues.push(text);
            this.saveData(true); 
            this.switchView(univId); 
            
            setTimeout(() => {
                const newInput = document.getElementById(`newMonsterDlg_${monsterId}`);
                if (newInput) newInput.focus();
            }, 50);
        }
    },

    deleteMonsterDialogue(univId, category, monsterId, dlgIndex) {
        this.showCustomModal({
            title: "Hapus Kutipan/Suara",
            content: "Hapus contoh kutipan/suara ini dari rekaman?",
            confirmText: "Hapus",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                const monster = universe.monsters[category].find(m => m.id === monsterId);
                
                if (monster && monster.dialogues) {
                    monster.dialogues.splice(dlgIndex, 1);
                    this.saveData(true);
                    this.switchView(univId);
                }
            }
        });
    },

    addMonsterNote(univId, category, monsterId) {
        const inputEl = document.getElementById(`newMonsterNote_${monsterId}`);
        const text = inputEl.value.trim();
        
        if (text) {
            const universe = this.data.universes.find(u => u.id === univId);
            const monster = universe.monsters[category].find(m => m.id === monsterId);
            
            if (!monster.notes) monster.notes = [];
            monster.notes.push(text);
            
            this.saveData(true); 
            this.switchView(univId); 
            
            setTimeout(() => {
                const newInput = document.getElementById(`newMonsterNote_${monsterId}`);
                if (newInput) newInput.focus();
            }, 50);
        }
    },

    deleteMonsterNote(univId, category, monsterId, noteIndex) {
        this.showCustomModal({
            title: "Hapus Catatan",
            content: "Hapus catatan ini dari rekaman monster?",
            confirmText: "Hapus",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                const monster = universe.monsters[category].find(m => m.id === monsterId);
                
                if (monster && monster.notes) {
                    monster.notes.splice(noteIndex, 1);
                    this.saveData(true);
                    this.switchView(univId);
                }
            }
        });
    }
}