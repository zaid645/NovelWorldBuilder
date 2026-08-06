// Logika CRUD untuk sub-arc

export const ArcInfoFormSub = {
    // =========================================
    // --- MANAJEMEN SUB-ARC ---
    // =========================================
    openAddSubarc(arcId) {
        this.editSubarcId = null; // Menutup editor inline jika ada yang sedang aktif
        this.refreshArcList();

        // Munculkan Form Tambah di bagian bawah (di bawah subarcs list)
        this.setPanelState(`subarcForm_${arcId}`, true);
        
        document.getElementById(`subarcFormTitle_${arcId}`).innerText = "Tambah Sub-arc";
        document.getElementById(`saveSubarcBtn_${arcId}`).innerText = "Simpan Data Sub-arc";
        document.getElementById(`newSubarcName_${arcId}`).value = '';
        document.getElementById(`newSubarcDesc_${arcId}`).value = '';

        // Otomatis scroll halus mengarah ke Form Tambah yang berada di bagian bawah list
        setTimeout(() => {
            const targetForm = document.getElementById(`subarcForm_${arcId}`);
            if (targetForm) {
                targetForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    },

    openEditSubarc(arcId, subarcId) {
        // Matikan Form tambah sub-arc agar fokus berpindah ke form inline di bawah
        this.setPanelState(`subarcForm_${arcId}`, false);
        
        this.editSubarcId = subarcId;
        this.refreshArcList();
    },

    cancelEditSubarc() {
        this.editSubarcId = null;
        this.refreshArcList();
    },

    saveSubarcInline(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;
        const sub = arc.subarcs.find(s => s.id === subarcId);
        if (!sub) return;

        const name = document.getElementById(`editSubarcName_${arcId}_${subarcId}`).value.trim();
        const description = document.getElementById(`editSubarcDesc_${arcId}_${subarcId}`).value.trim();

        if (!name) return this.showNotification("Judul sub-arc wajib diisi.", "error");

        sub.name = name;
        sub.description = description;

        this.saveData();
        this.editSubarcId = null;
        this.refreshArcList();
        this.showNotification("Perubahan sub-arc berhasil disimpan langsung!", "success");
    },

    saveSubarc(arcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) return;
        if (!arc.subarcs) arc.subarcs = [];

        const name = document.getElementById(`newSubarcName_${arcId}`).value.trim();
        const description = document.getElementById(`newSubarcDesc_${arcId}`).value.trim();

        if (!name) return this.showNotification("Judul sub-arc wajib diisi.", "error");

        const newSub = {
            id: this.generateId('sub'),
            name: name,
            description: description
        };
        arc.subarcs.push(newSub);

        this.saveData();
        this.setPanelState(`subarcForm_${arcId}`, false);
        this.refreshArcList();
        this.showNotification("Sub-arc baru berhasil ditambahkan!", "success");
    },

    deleteSubarc(arcId, subarcId, confirmed = false) {
        // Jika belum dikonfirmasi, minta konfirmasi via browser/modal
        if (!confirmed) {
            if (confirm("Apakah Anda yakin ingin menghapus sub-arc ini?")) {
                confirmed = true;
            } else {
                return;
            }
        }

        const arc = this.data.arcs.find(a => a.id === arcId);
        if (arc && arc.subarcs) {
            arc.subarcs = arc.subarcs.filter(s => s.id !== subarcId);
            if (this.editSubarcId === subarcId) {
                this.editSubarcId = null;
            }
            this.deleteSubarcIdConfirm = null;
            this.saveData();
            this.refreshArcList();
            this.showNotification("Sub-arc berhasil dihapus.", "success");
        }
    },

    cancelDeleteSubarc() {
        this.deleteSubarcIdConfirm = null;
        this.refreshArcList();
    },


    // =========================================
    // --- MANAJEMEN URUTAN SUB-ARC ---
    // =========================================
    moveSubarcUp(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;

        const index = arc.subarcs.findIndex(s => s.id === subarcId);
        if (index > 0) {
            // Tukar posisi dengan elemen sebelumnya (Naik)
            const temp = arc.subarcs[index];
            arc.subarcs[index] = arc.subarcs[index - 1];
            arc.subarcs[index - 1] = temp;

            this.saveData();
            this.refreshArcList();
        }
    },

    moveSubarcDown(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;

        const index = arc.subarcs.findIndex(s => s.id === subarcId);
        if (index !== -1 && index < arc.subarcs.length - 1) {
            // Tukar posisi dengan elemen setelahnya (Turun)
            const temp = arc.subarcs[index];
            arc.subarcs[index] = arc.subarcs[index + 1];
            arc.subarcs[index + 1] = temp;

            this.saveData();
            this.refreshArcList();
        }
    }
}