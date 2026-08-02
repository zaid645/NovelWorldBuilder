// Logika CRUD location

export const UniverseLocationForm = {
    // =========================================
    // --- FUNGSI UTAMA MANAJEMEN LOKASI ---
    // =========================================
    editLocationId: null,
    
    openEditLocation(univId, locId, parentId) {
        const universe = this.data.universes.find(u => u.id === univId);
        const loc = this.findLocationById(universe.locations, locId);
        if (!loc) return;
        this.editLocationId = locId;

        let targetFormId = "";

        if (parentId === null) {
            targetFormId = `addRootLoc_${univId}`;
            this.setPanelState(targetFormId, true);
            
            const formTitle = document.getElementById(`rootLocFormTitle_${univId}`);
            const formBtn = document.getElementById(`rootLocFormBtn_${univId}`);
            const nameInput = document.getElementById(`newLocName_${univId}`);
            const descInput = document.getElementById(`newLocDesc_${univId}`);
            const visInput = document.getElementById(`newLocVis_${univId}`);

            if (formTitle) formTitle.innerText = "Edit Tempat Utama";
            if (formBtn) formBtn.innerText = "Update Tempat";
            if (nameInput) nameInput.value = loc.name;
            if (descInput) descInput.value = loc.description || '';
            if (visInput) visInput.value = loc.visuals || '';
        } else {
            // Karena kita mengedit child, form yang digunakan adalah form addChildLoc milik Parent-nya
            targetFormId = `addChildLoc_${parentId}`;
            this.setPanelState(targetFormId, true);
            
            const formBtn = document.getElementById(`childLocFormBtn_${parentId}`);
            const nameInput = document.getElementById(`newLocName_${parentId}`);
            const descInput = document.getElementById(`newLocDesc_${parentId}`);
            const visInput = document.getElementById(`newLocVis_${parentId}`);

            if (formBtn) formBtn.innerText = "Update Child";
            if (nameInput) nameInput.value = loc.name;
            if (descInput) descInput.value = loc.description || '';
            if (visInput) visInput.value = loc.visuals || '';
        }

        // --- FITUR AUTO-SCROLL & SOROTAN VISUAL ---
        // Menunggu sebentar agar UI render selesai setelah state panel berubah menjadi terlihat (active)
        setTimeout(() => {
            const formElement = document.getElementById(targetFormId);
            if (formElement) {
                // Scroll ke posisi form secara mulus
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Tambahkan efek sorotan (pulsing outline/border) agar menarik perhatian pengguna
                formElement.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500');
                
                // Fokuskan kursor langsung ke input nama tempat agar siap diketik
                const nameInputField = parentId === null ? document.getElementById(`newLocName_${univId}`) : document.getElementById(`newLocName_${parentId}`);
                if (nameInputField) nameInputField.focus();

                // Hapus efek sorotan setelah 2 detik agar tidak permanen mengganggu estetika
                setTimeout(() => {
                    formElement.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-slate-900');
                }, 2000);
            }
        }, 100);
    },

    addLocation(univId) {
        const name = document.getElementById(`newLocName_${univId}`).value.trim();
        if (!name) return this.showAlert("Nama tempat wajib diisi", "error");

        const desc = document.getElementById(`newLocDesc_${univId}`).value.trim();
        const vis = document.getElementById(`newLocVis_${univId}`).value.trim();
        
        const universe = this.data.universes.find(u => u.id === univId);

        if (this.editLocationId) {
            const loc = this.findLocationById(universe.locations, this.editLocationId);
            if (loc) {
                loc.name = name; 
                loc.description = desc; 
                loc.visuals = vis;
            }
            this.editLocationId = null;
            this.showAlert("Tempat berhasil diupdate", "success");
        } else {
            universe.locations.push({
                id: this.generateId('l'),
                name, 
                description: desc, 
                visuals: vis, 
                children: []
            });
            this.showAlert("Tempat baru disimpan", "success");
        }
        this.saveData();
        this.switchView(univId);
        this.setPanelState(`addRootLoc_${univId}`, false);
    },

    addChildLocation(univId, parentId) {
        const name = document.getElementById(`newLocName_${parentId}`).value.trim();
        if (!name) return this.showAlert("Nama child tempat wajib diisi", "error");

        const desc = document.getElementById(`newLocDesc_${parentId}`).value.trim();
        const vis = document.getElementById(`newLocVis_${parentId}`).value.trim();

        const universe = this.data.universes.find(u => u.id === univId);
        
        if (this.editLocationId) {
            const loc = this.findLocationById(universe.locations, this.editLocationId);
            if (loc) {
                loc.name = name; 
                loc.description = desc; 
                loc.visuals = vis;
            }
            this.editLocationId = null;
            this.showAlert("Child tempat diupdate", "success");
        } else {
            const parentLoc = this.findLocationById(universe.locations, parentId);
            if (parentLoc) {
                if (!parentLoc.children) parentLoc.children = [];
                parentLoc.children.push({
                    id: this.generateId('l'),
                    name, 
                    description: desc, 
                    visuals: vis, 
                    children: []
                });
                this.showAlert("Child tempat disimpan", "success");
            }
        }

        this.setPanelState(`addChildLoc_${parentId}`, false);
        this.saveData();
        this.switchView(univId);
    },

    // --- LOGIKA KONTROL PANEL & FORM TEMPAT ---

    openAddLocation(univId) {
        this.editLocationId = null;
        document.getElementById(`rootLocFormTitle_${univId}`).innerText = "Buat Tempat Utama Baru";
        document.getElementById(`rootLocFormBtn_${univId}`).innerText = "Simpan Tempat";
        document.getElementById(`newLocName_${univId}`).value = '';
        document.getElementById(`newLocDesc_${univId}`).value = '';
        document.getElementById(`newLocVis_${univId}`).value = '';

        this.setPanelState(`locPanel_${univId}`, true);
        this.setPanelState(`addRootLoc_${univId}`, true);

        // Auto-scroll ke form baru agar user langsung melihatnya
        setTimeout(() => {
            const formElement = document.getElementById(`addRootLoc_${univId}`);
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                formElement.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500');
                const nameInput = document.getElementById(`newLocName_${univId}`);
                if (nameInput) nameInput.focus();
                
                setTimeout(() => {
                    formElement.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-slate-900');
                }, 2000);
            }
        }, 100);
    },

    cancelEditLocation(univId) {
        this.editLocationId = null;
        this.setPanelState(`addRootLoc_${univId}`, false);
    },

    openAddChildLocation(locId) {
        this.editLocationId = null;
        document.getElementById(`childLocFormBtn_${locId}`).innerText = "Simpan Child";
        document.getElementById(`newLocName_${locId}`).value = '';
        document.getElementById(`newLocDesc_${locId}`).value = '';
        document.getElementById(`newLocVis_${locId}`).value = '';
        
        this.setPanelState(`addChildLoc_${locId}`, true);
        this.setPanelState(`children-${locId}`, true);
        
        const toggleIcon = document.getElementById(`toggle-icon-${locId}`);
        if (toggleIcon) toggleIcon.classList.remove('-rotate-90');

        // Auto-scroll ke form sub-tempat baru agar fokus mata user langsung ke sana
        setTimeout(() => {
            const formElement = document.getElementById(`addChildLoc_${locId}`);
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                formElement.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all', 'duration-500');
                const nameInput = document.getElementById(`newLocName_${locId}`);
                if (nameInput) nameInput.focus();
                
                setTimeout(() => {
                    formElement.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-slate-900');
                }, 2000);
            }
        }, 100);
    },

    cancelEditChildLocation(locId) {
        this.editLocationId = null;
        this.setPanelState(`addChildLoc_${locId}`, false);
    },

    deleteLocation(univId, locId) {
        this.showCustomModal({
            title: "Hapus Tempat",
            content: "Yakin ingin menghapus tempat ini beserta semua sub-tempat di dalamnya? Tindakan ini tidak dapat dibatalkan.",
            confirmText: "Hapus Tempat",
            confirmColor: "bg-rose-600 hover:bg-rose-500",
            onConfirm: () => {
                const universe = this.data.universes.find(u => u.id === univId);
                
                const removeLoc = (locations) => {
                    for (let i = 0; i < locations.length; i++) {
                        if (locations[i].id === locId) {
                            locations.splice(i, 1);
                            return true;
                        }
                        if (locations[i].children && removeLoc(locations[i].children)) return true;
                    }
                    return false;
                };

                removeLoc(universe.locations);
                this.saveData();
                this.switchView(univId);
                this.showAlert("Tempat berhasil dihapus.", "warning");
            }
        });
    },

    // Helper untuk mencari parent array dari suatu ID tempat (bisa root maupun child mendalam)
    findParentArray(locations, targetId) {
        if (locations.some(loc => loc.id === targetId)) {
            return locations;
        }
        for (let loc of locations) {
            if (loc.children) {
                const found = this.findParentArray(loc.children, targetId);
                if (found) return found;
            }
        }
        return null;
    },

    // Helper baru untuk menghitung kedalaman tingkat (depth) suatu lokasi dari root
    getLocationDepth(locations, targetId, currentDepth = 1) {
        for (let loc of locations) {
            if (loc.id === targetId) return currentDepth;
            if (loc.children && loc.children.length > 0) {
                const foundDepth = this.getLocationDepth(loc.children, targetId, currentDepth + 1);
                if (foundDepth !== 0) return foundDepth;
            }
        }
        return 0;
    },

    // Memindahkan urutan tempat ke atas (geser naik) dalam array asalnya
    moveLocationUp(univId, locId) {
        const universe = this.data.universes.find(u => u.id === univId);
        if (!universe) return;

        const parentArray = this.findParentArray(universe.locations, locId);
        if (!parentArray) return;

        const index = parentArray.findIndex(loc => loc.id === locId);
        if (index > 0) {
            // Tukar posisi dengan elemen di atasnya
            const temp = parentArray[index - 1];
            parentArray[index - 1] = parentArray[index];
            parentArray[index] = temp;

            this.saveData(true);
            this.switchView(univId);
        }
    },

    findLocationById(locations, targetId) {
        for (let loc of locations) {
            if (loc.id === targetId) return loc;
            if (loc.children) {
                const found = this.findLocationById(loc.children, targetId);
                if (found) return found;
            }
        }
        return null;
    },

    toggleLocationChildren(locationId) {
        const panelId = `children-${locationId}`;
        const childrenContainer = document.getElementById(panelId);
        const toggleIcon = document.getElementById(`toggle-icon-${locationId}`);
        
        let willOpen = true;
        if (childrenContainer) {
            willOpen = childrenContainer.classList.contains('hidden');
        } else {
            willOpen = this.panelStates.get(panelId) !== 'open';
        }
        
        this.setPanelState(panelId, willOpen);
        
        if (toggleIcon) {
            if (!willOpen) {
                toggleIcon.classList.add('-rotate-90');
            } else {
                toggleIcon.classList.remove('-rotate-90');
            }
            toggleIcon.style.transform = ''; 
        }
    },
}