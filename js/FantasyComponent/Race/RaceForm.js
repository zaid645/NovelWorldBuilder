export const RaceForm = {
    // State untuk mode edit (null jika sedang buat ras baru)
    editRaceId: null,

    // ==========================================
    // --- KONTROL FORM UI ---
    // ==========================================

    openAddRaceForm() {
        this.editRaceId = null;
        const panel = document.getElementById('raceFormPanel');
        if (!panel) return;

        document.getElementById('raceFormTitle').innerText = "Buat Ras Baru";
        document.getElementById('newRaceName').value = "";
        document.getElementById('newRaceDesc').value = "";
        document.getElementById('saveRaceBtn').innerText = "Simpan Ras";

        panel.classList.remove('hidden');
        document.getElementById('newRaceName').focus();
    },

    openEditRaceForm(id) {
        const races = this.data?.races || app.data?.races || [];
        const race = races.find(r => r.id === id);
        if (!race) return;

        this.editRaceId = id;
        const panel = document.getElementById('raceFormPanel');
        if (!panel) return;

        document.getElementById('raceFormTitle').innerText = `Edit Ras: ${race.name}`;
        document.getElementById('newRaceName').value = race.name;
        document.getElementById('newRaceDesc').value = race.description || "";
        document.getElementById('saveRaceBtn').innerText = "Update Ras";

        panel.classList.remove('hidden');
        panel.scrollIntoView({ behavior: 'smooth' });
    },

    closeRaceForm() {
        this.editRaceId = null;
        const panel = document.getElementById('raceFormPanel');
        if (panel) panel.classList.add('hidden');
    },

    // ==========================================
    // --- LOGIKA CRUD ---
    // ==========================================

    saveRace() {
        if (!this.data.races) this.data.races = [];

        const nameInput = document.getElementById('newRaceName');
        const descInput = document.getElementById('newRaceDesc');

        let name = nameInput ? nameInput.value.trim() : "";
        let description = descInput ? descInput.value.trim() : "";

        if (!name) {
            if (typeof this.showAlert === 'function') {
                this.showAlert("Nama ras wajib diisi!", "error");
            } else {
                alert("Nama ras wajib diisi!");
            }
            return;
        }

        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (this.editRaceId) {
            const race = this.data.races.find(r => r.id === this.editRaceId);
            if (race) {
                const isDuplicate = this.data.races.some(r => r.id !== this.editRaceId && r.name.toLowerCase() === name.toLowerCase());
                if (isDuplicate) {
                    alert(`Gagal! Ras dengan nama '${name}' sudah terdaftar.`);
                    return;
                }

                race.name = name;
                race.description = description;
                
                if (typeof this.showAlert === 'function') this.showAlert("Ras berhasil di-update!", "success");
            }
        } else {
            const isDuplicate = this.data.races.some(r => r.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                alert(`Ras dengan nama '${name}' sudah terdaftar!`);
                return;
            }

            const newRace = {
                id: typeof this.generateId === 'function' ? this.generateId('r') : 'r_' + Date.now(),
                name: name,
                description: description
            };

            this.data.races.push(newRace);
            if (typeof this.showAlert === 'function') this.showAlert("Ras baru berhasil disimpan!", "success");
        }

        // Urutkan alfabetis
        this.data.races.sort((a, b) => a.name.localeCompare(b.name));

        this.saveData(true);
        this.closeRaceForm();
        this.refreshRaceUI();
    },

    deleteRace(id) {
        if (!this.data.races) return;
        const race = this.data.races.find(r => r.id === id);
        if (!race) return;

        if (confirm(`Apakah Anda yakin ingin menghapus ras '${race.name}'?`)) {
            // 1. Hapus Ras dari Master Data
            this.data.races = this.data.races.filter(r => r.id !== id);

            // 2. Bersihkan acuan raceId pada Karakter & Familiar (Setara dengan SkillForm)
            if (typeof this.removeRaceId === 'function') {
                this.removeRaceId(id, this.data);
            } else if (typeof DataCleaner !== 'undefined' && DataCleaner.removeRaceId) {
                DataCleaner.removeRaceId(id, this.data);
            }

            this.saveData(true);
            this.closeRaceDetailFloating();
            this.refreshRaceUI();
            
            if (typeof this.showAlert === 'function') this.showAlert(`Ras '${race.name}' berhasil dihapus.`, "success");
        }
    }
}