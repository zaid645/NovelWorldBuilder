// Logika CRUD tanpa perlu menambahkan panel editor

export const UniverseCharacterFormSub = {
    addDialogue(univId, category, charId) {
        const inputEl = document.getElementById(`newDlg_${charId}`);
        let text = inputEl.value.trim();
        
        if (text) {
            const universe = this.data.universes.find(u => u.id === univId);
            const char = universe.characters[category].find(c => c.id === charId);
            
            if (!char.dialogues) char.dialogues = [];

            // Jika belum ada karakter petik dua sama sekali, barulah otomatis dibungkus
            if (!text.includes('"')) {
                text = `"${text}"`;
            }
            
            char.dialogues.push(text);
            
            this.saveData(true); 
            this.switchView(univId); 
            
            // Fitur: Auto-focus kembali ke input dialog
            setTimeout(() => {
                const newInput = document.getElementById(`newDlg_${charId}`);
                if (newInput) newInput.focus();
            }, 50);
        }
    },

    deleteDialogue(univId, category, charId, dlgIndex) {
        this.showCustomModal({
            title: "Hapus Dialog",
            content: "Hapus contoh kutipan dialog ini dari rekaman?",
            confirmText: "Hapus",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                const char = universe.characters[category].find(c => c.id === charId);
                
                if (char && char.dialogues) {
                    char.dialogues.splice(dlgIndex, 1);
                    this.saveData(true);
                    this.switchView(univId);
                }
            }
        });
    },

    // --- FUNGSI ARRAY CATATAN ---
    addNote(univId, category, charId) {
        const inputEl = document.getElementById(`newNote_${charId}`);
        const text = inputEl.value.trim();
        
        if (text) {
            const universe = this.data.universes.find(u => u.id === univId);
            const char = universe.characters[category].find(c => c.id === charId);
            
            if (!char.notes) char.notes = [];
            char.notes.push(text);
            
            this.saveData(true); 
            this.switchView(univId); 
            
            // Fitur: Auto-focus kembali ke input catatan
            setTimeout(() => {
                const newInput = document.getElementById(`newNote_${charId}`);
                if (newInput) newInput.focus();
            }, 50);
        }
    },

    deleteNote(univId, category, charId, noteIndex) {
        this.showCustomModal({
            title: "Hapus Catatan",
            content: "Hapus catatan ini dari rekaman karakter?",
            confirmText: "Hapus",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                const char = universe.characters[category].find(c => c.id === charId);
                
                if (char && char.notes) {
                    char.notes.splice(noteIndex, 1);
                    this.saveData(true);
                    this.switchView(univId);
                }
            }
        });
    },
}