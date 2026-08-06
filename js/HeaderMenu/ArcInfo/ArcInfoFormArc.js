// Logika CRUD arc

export const ArcInfoFormArc = {
    // =========================================
    // --- MANAJEMEN DATA OPERASI ARC (CRUD) ---
    // =========================================
    openAddArc() {
        this.editArcId = null;
        this.setPanelState('addArcForm', true);
        document.getElementById('arcFormTitle').innerText = "Buat Arc Cerita Baru";
        document.getElementById('saveArcBtn').innerText = "Simpan Arc";
        
        document.getElementById('newArcName').value = '';
        document.getElementById('newArcSyn').value = '';
        document.getElementById('newArcTarget').value = 10;
        
        document.getElementById('addArcForm').scrollIntoView({ behavior: 'smooth' });
    },

    openEditArc(arcId) {
        if (!this.data.arcs) return;
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) return;

        this.editArcId = arcId;
        this.setPanelState('addArcForm', true);
        document.getElementById('arcFormTitle').innerText = `Edit Arc: ${arc.name}`;
        document.getElementById('saveArcBtn').innerText = "Update Arc";

        document.getElementById('newArcName').value = arc.name;
        document.getElementById('newArcSyn').value = arc.synopsis || '';
        document.getElementById('newArcTarget').value = arc.targetSubarcCount || 10;
        
        document.getElementById('addArcForm').scrollIntoView({ behavior: 'smooth' });
    },

    saveArc() {
        if (!this.data.arcs) this.data.arcs = [];
        
        const name = document.getElementById('newArcName').value.trim();
        if (!name) return this.showNotification("Nama Arc tidak boleh dibiarkan kosong.", "error");
        
        const synopsis = document.getElementById('newArcSyn').value.trim();
        const targetCount = parseInt(document.getElementById('newArcTarget').value) || 10;

        if (this.editArcId === null) {
            const newArc = {
                id: this.generateId('arc'),
                name: name,
                synopsis: synopsis,
                targetSubarcCount: targetCount,
                subarcs: []
            };
            this.data.arcs.push(newArc);
            // Otomatis arahkan konteks aktif ke Arc yang baru dibuat
            this.activeArcContextId = newArc.id;
            this.showNotification("Arc berhasil ditambahkan!", "success");
        } else {
            const arc = this.data.arcs.find(a => a.id === this.editArcId);
            if (arc) {
                arc.name = name;
                arc.synopsis = synopsis;
                arc.targetSubarcCount = targetCount;
                this.showNotification("Pengaturan Arc berhasil diperbarui!", "success");
            }
        }

        this.saveData();
        this.setPanelState('addArcForm', false);
        this.refreshArcList();
    },

    refreshArcList() {
        const container = document.getElementById('arcListContainer');
        const searchInput = document.getElementById('arcSearchInput');
        const query = searchInput ? searchInput.value : '';
        if (container) {
            container.innerHTML = this.renderArcList(query);
        }

        // Panggil re-render panel konteks dinamis secara otomatis
        if (typeof this.refreshContextPanel === 'function') {
            this.refreshContextPanel();
        }
    },

    deleteArc(arcId, confirmed = false) {
        if (!confirmed) {
            this.deleteArcIdConfirm = arcId;
            this.refreshArcList();
            return;
        }
        
        this.data.arcs = this.data.arcs.filter(a => a.id !== arcId);
        this.deleteArcIdConfirm = null;
        this.saveData();
        this.refreshArcList();
        this.showNotification("Arc cerita beserta seluruh sub-arc di dalamnya telah dihapus.", "success");
    },

    cancelDeleteArc() {
        this.deleteArcIdConfirm = null;
        this.refreshArcList();
    }
}