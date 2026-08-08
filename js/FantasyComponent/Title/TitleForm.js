export const TitleForm = {
    // ==========================================
    // --- KONTROL FORM UI ---
    // ==========================================

    openAddTitleForm() {
        this.editTitleId = null;
        const panel = document.getElementById('titleFormPanel');
        if (!panel) return;

        document.getElementById('titleFormHeader').innerText = "Buat Gelar Baru";
        document.getElementById('newTitleName').value = "";
        document.getElementById('newTitleDesc').value = "";
        document.getElementById('saveTitleBtn').innerText = "Simpan Gelar";

        panel.classList.remove('hidden');
        document.getElementById('newTitleName').focus();
    },

    openEditTitleForm(id) {
        const titles = this.data?.titles || app.data?.titles || [];
        const titleData = titles.find(t => t.id === id);
        if (!titleData) return;

        this.editTitleId = id;
        const panel = document.getElementById('titleFormPanel');
        if (!panel) return;

        document.getElementById('titleFormHeader').innerText = `Edit Gelar: ${titleData.name}`;
        document.getElementById('newTitleName').value = titleData.name;
        document.getElementById('newTitleDesc').value = titleData.description || "";
        document.getElementById('saveTitleBtn').innerText = "Update Gelar";

        panel.classList.remove('hidden');
        panel.scrollIntoView({ behavior: 'smooth' });
    },

    closeTitleForm() {
        this.editTitleId = null;
        const panel = document.getElementById('titleFormPanel');
        if (panel) panel.classList.add('hidden');
    },

    // ==========================================
    // --- LOGIKA CRUD ---
    // ==========================================

    saveTitle() {
        if (!this.data.titles) this.data.titles = [];

        const nameInput = document.getElementById('newTitleName');
        const descInput = document.getElementById('newTitleDesc');

        let name = nameInput ? nameInput.value.trim() : "";
        let description = descInput ? descInput.value.trim() : "";

        if (!name) {
            if (typeof this.showAlert === 'function') {
                this.showAlert("Nama gelar wajib diisi!", "error");
            } else {
                alert("Nama gelar wajib diisi!");
            }
            return;
        }

        // Kapitalisasi huruf pertama
        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (this.editTitleId) {
            const titleData = this.data.titles.find(t => t.id === this.editTitleId);
            if (titleData) {
                const isDuplicate = this.data.titles.some(t => t.id !== this.editTitleId && t.name.toLowerCase() === name.toLowerCase());
                if (isDuplicate) {
                    alert(`Gagal! Gelar dengan nama '${name}' sudah terdaftar.`);
                    return;
                }

                titleData.name = name;
                titleData.description = description;
                
                if (typeof this.showAlert === 'function') this.showAlert("Gelar berhasil di-update!", "success");
            }
        } else {
            const isDuplicate = this.data.titles.some(t => t.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                alert(`Gelar dengan nama '${name}' sudah terdaftar!`);
                return;
            }

            const newTitle = {
                id: typeof this.generateId === 'function' ? this.generateId('t') : 't_' + Date.now(),
                name: name,
                description: description
            };

            this.data.titles.push(newTitle);
            if (typeof this.showAlert === 'function') this.showAlert("Gelar baru berhasil disimpan!", "success");
        }

        // Urutkan alfabetis
        this.data.titles.sort((a, b) => a.name.localeCompare(b.name));

        if(typeof this.saveData === 'function') this.saveData(true);
        this.closeTitleForm();
        if(typeof this.refreshTitleUI === 'function') this.refreshTitleUI();
    },

    deleteTitle(id) {
        if (!this.data.titles) return;
        const titleData = this.data.titles.find(t => t.id === id);
        if (!titleData) return;

        if (confirm(`Apakah Anda yakin ingin menghapus gelar '${titleData.name}'?`)) {
            // 1. Hapus Gelar dari Master Data
            this.data.titles = this.data.titles.filter(t => t.id !== id);

            // 2. Bersihkan acuan titleId (opsional, jika diterapkan ke Entitas lain)
            if (typeof this.removeTitleId === 'function') {
                this.removeTitleId(id, this.data);
            } else if (typeof DataCleaner !== 'undefined' && DataCleaner.removeTitleId) {
                DataCleaner.removeTitleId(id, this.data);
            }

            if(typeof this.saveData === 'function') this.saveData(true);
            if(typeof app.closeTitleDetailFloating === 'function') app.closeTitleDetailFloating();
            if(typeof this.refreshTitleUI === 'function') this.refreshTitleUI();
            
            if (typeof this.showAlert === 'function') this.showAlert(`Gelar '${titleData.name}' berhasil dihapus.`, "success");
        }
    }
}