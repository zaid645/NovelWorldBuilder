/**
 * UniverseLocationModule / LocationBasicModule
 * Mengelola informasi lokasi (geografi semesta), tempat utama (root),
 * struktur tempat bersarang (child locations/sub-tempat), serta integrasi
 * AI Enchanter untuk pembuatan dan deskripsi tempat otomatis.
 */
export const UniverseLocationModule = {
    // Menyimpan ID tempat yang sedang dalam proses penyuntingan
    editLocationId: null,

    // Helper untuk menampilkan dialog konfirmasi kustom yang elegan (menggantikan confirm() bawaan)
    showCustomModal(options) {
        const modalId = 'customModal_' + Date.now();
        const modalHtml = `
        <div id="${modalId}" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 transform scale-95 transition-transform duration-300">
                <h3 class="text-lg font-bold text-slate-100 mb-2">${options.title}</h3>
                <div class="mb-5 text-sm text-slate-300">${options.content}</div>
                <div class="flex justify-end space-x-3 pt-2">
                    <button id="${modalId}_cancel" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm transition text-white">Batal</button>
                    <button id="${modalId}_confirm" class="px-4 py-2 ${options.confirmColor || 'bg-emerald-600 hover:bg-emerald-500'} text-white font-medium rounded text-sm transition shadow-lg">${options.confirmText || 'Simpan'}</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalEl = document.getElementById(modalId);
        const btnCancel = document.getElementById(`${modalId}_cancel`);
        const btnConfirm = document.getElementById(`${modalId}_confirm`);

        // Animasi masuk
        setTimeout(() => {
            modalEl.classList.remove('opacity-0');
            modalEl.children[0].classList.remove('scale-95');
        }, 10);

        const close = () => {
            modalEl.classList.add('opacity-0');
            modalEl.children[0].classList.add('scale-95');
            setTimeout(() => modalEl.remove(), 300);
        };

        btnCancel.onclick = () => { close(); if (options.onCancel) options.onCancel(); };
        btnConfirm.onclick = () => {
            if (options.onConfirm) {
                const shouldClose = options.onConfirm();
                if (shouldClose !== false) close();
            } else {
                close();
            }
        };
    },

    // Helper untuk menampilkan notifikasi toast kustom yang elegan (menggantikan alert() bawaan)
    showAlert(message, type = 'error') {
        if (
            typeof app !== 'undefined' && 
            typeof app.showAlert === 'function' && 
            app.showAlert !== this.showAlert && 
            app.showAlert !== UniverseLocationModule.showAlert
        ) {
            app.showAlert(message, type);
        } else {
            // 1. Bersihkan toast fallback lama yang masih aktif agar tidak bertumpuk berantakan
            const existingToast = document.querySelector('.custom-fallback-toast');
            if (existingToast) {
                existingToast.remove();
            }

            // 2. Buat elemen toast baru
            const toast = document.createElement('div');
            
            // Tentukan kelas warna berdasarkan tipe pesan (Success, Warning, Info, atau Error)
            let colorClasses = '';
            if (type === 'success') {
                colorClasses = 'bg-emerald-900/95 border-emerald-500/50 text-emerald-200';
            } else if (type === 'warning') {
                colorClasses = 'bg-amber-900/95 border-amber-500/50 text-amber-200';
            } else if (type === 'info') {
                colorClasses = 'bg-slate-900/95 border-slate-500/50 text-slate-200'; // Biru/Abu Netral untuk Info
            } else {
                colorClasses = 'bg-rose-950/95 border-rose-500/50 text-rose-200'; // Default Merah untuk Error
            }

            toast.className = `custom-fallback-toast fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-10 opacity-0 ${colorClasses}`;
            toast.innerText = message;
            document.body.appendChild(toast);
            
            // Memicu animasi transisi masuk
            setTimeout(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
            }, 50);
            
            // Auto dismiss setelah beberapa detik
            setTimeout(() => {
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }
    },

    // =========================================
    // --- FUNGSI UTAMA MANAJEMEN LOKASI ---
    // =========================================

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

    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS LOKASI ---
    // ==========================================

    async generateLocationAI(univId, formId, isRoot, targetField) {
        const nameInput = document.getElementById(`newLocName_${formId}`).value.trim();
        if (!nameInput) {
            return this.showAlert("GAGAL: 'Nama Tempat' wajib diisi terlebih dahulu agar AI memiliki panduan subjek lokasi.", "error");
        }

        let targetEl, btnId, originalBtnText;
        let aiFocusRule = "";
        const aiLengthRule = "SANGAT RINGKAS, to the point, dan WAJIB HANYA 1 (satu) kalimat saja. TANPA metafora atau bahasa puitis berlebihan.";

        const currentDesc = document.getElementById(`newLocDesc_${formId}`).value.trim();
        const currentVis = document.getElementById(`newLocVis_${formId}`).value.trim();
        let crossContext = "";

        if (targetField === 'description') {
            targetEl = document.getElementById(`newLocDesc_${formId}`);
            btnId = `btnAiLocDesc_${formId}`;
            aiFocusRule = "Kembangkan deskripsi tempat ini, fokus HANYA pada sejarah, latar belakang, atau kegunaan (fungsi) tempat tersebut.";
            if (currentVis) crossContext = `\n[REFERENSI VISUAL]: ${currentVis}`;
        } else if (targetField === 'visuals') {
            targetEl = document.getElementById(`newLocVis_${formId}`);
            btnId = `btnAiLocVis_${formId}`;
            aiFocusRule = "Kembangkan visual tempat ini, fokus HANYA pada penggambaran fisik, arsitektur, estetika, lanskap, atau atmosfer sekitarnya.";
            if (currentDesc) crossContext = `\n[REFERENSI SEJARAH/KEGUNAAN]: ${currentDesc}`;
        }

        const universe = app.data.universes.find(u => u.id === univId);
        let contextStr = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        
        if (!isRoot) {
            // formId adalah parentId untuk sub-lokasi
            const parentLoc = this.findLocationById(universe.locations, formId);
            if (parentLoc) {
                contextStr += `Lokasi Induk (Tempat bernaung): ${parentLoc.name}\nDeskripsi Induk: ${parentLoc.description || '-'}\n`;
            }
        }

        const payload = {
            moduleName: `Location-${targetField.toUpperCase()}`,
            targetData: {
                namaTempat: nameInput,
                informasiSemesta: contextStr,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan)",
                drafReferensiPengguna: targetEl.value.trim() || "(Kosong. Buatkan murni berdasarkan Nama Tempat dan Konteks.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, deskriptif, world-building dokumenter.",
                length: aiLengthRule
            }
        };

        const btnEl = document.getElementById(btnId);
        if (btnEl) {
            btnEl.disabled = true;
            btnEl.classList.add('opacity-50', 'cursor-wait');
            originalBtnText = btnEl.innerHTML;
            btnEl.innerHTML = "✨ Memproses...";
        }

        try {
            const resultText = await app.requestEnchant(payload);
            targetEl.value = resultText;
            app.showAlert(`Berhasil men-generate AI untuk ${targetField === 'description' ? 'Deskripsi' : 'Visual'}!`, "success");
        } catch (error) {
            this.showAlert("Gagal memanggil AI: " + error.message, "error");
        } finally {
            if (btnEl) {
                btnEl.disabled = false;
                btnEl.classList.remove('opacity-50', 'cursor-wait');
                btnEl.innerHTML = originalBtnText;
            }
        }
    },

    async autoGenerateChildLocation(univId, parentId) {
        const universe = app.data.universes.find(u => u.id === univId);
        const parentLoc = this.findLocationById(universe.locations, parentId);
        
        if (!parentLoc) return;

        const btnId = `btnAutoChild_${parentId}`;
        const btnEl = document.getElementById(btnId);
        const originalText = btnEl.innerHTML;
        
        btnEl.disabled = true;
        btnEl.classList.add('opacity-50', 'cursor-wait');
        btnEl.innerHTML = "✨ Generating...";

        const contextStr = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\nLokasi Induk: ${parentLoc.name}\nDeskripsi Induk: ${parentLoc.description || '-'}`;

        const payload = {
            moduleName: "Location-AutoChild",
            targetData: {
                informasiSemesta: contextStr,
            },
            additional_instruction: {
                focus: "Buat HANYA 1 (satu) sub-lokasi / tempat spesifik baru yang logis berada di dalam 'Lokasi Induk' (contoh: jika induk 'Kota', buat 'Toko Senjata' atau 'Kuil'). Hasikan Nama, Deskripsi (fokus sejarah/kegunaan), dan Visual (fokus penampilan).",
                tone: "Faktual, deskriptif logis",
                length: "WAJIB KEMBALIKAN HANYA FORMAT INI TANPA TEKS LAIN:\nNama: [Nama Tempat]\nDeskripsi: [Tepat 1 kalimat ringkas to-the-point]\nVisual: [Tepat 1 kalimat ringkas to-the-point]"
            }
        };

        try {
            const result = await app.requestEnchant(payload);
            
            // Proses Parsing Format Output AI
            let name = "", desc = "", vis = "";
            
            // Regex parsing (lebih tangguh jika AI memberikan formatting seperti **Nama:**)
            const nameMatch = result.match(/Nama:\s*(.*)/i) || result.match(/\*\*Nama:\*\*\s*(.*)/i);
            const descMatch = result.match(/Deskripsi:\s*(.*)/i) || result.match(/\*\*Deskripsi:\*\*\s*(.*)/i);
            const visMatch = result.match(/Visual:\s*(.*)/i) || result.match(/\*\*Visual:\*\*\s*(.*)/i);
            
            if (nameMatch) name = nameMatch[1].trim().replace(/[*_]/g, '');
            if (descMatch) desc = descMatch[1].trim().replace(/[*_]/g, '');
            if (visMatch) vis = visMatch[1].trim().replace(/[*_]/g, '');

            if (!name) throw new Error("Format balasan AI tidak sesuai (Gagal mengekstrak nama tempat).");

            if (!parentLoc.children) parentLoc.children = [];
            parentLoc.children.push({
                id: this.generateId('l'),
                name: name,
                description: desc,
                visuals: vis,
                children: []
            });

            this.saveData(true);
            this.switchView(univId);
            
            // Otomatis membuka hierarki parent agar user bisa melihat hasilnya
            this.setPanelState(`children-${parentId}`, true);
            app.showAlert(`Sub-tempat "${name}" berhasil ditambahkan AI!`, "success");

        } catch (err) {
            this.showAlert("Gagal Auto-Child: " + err.message, "error");
        } finally {
            if (document.getElementById(btnId)) {
                const resetBtn = document.getElementById(btnId);
                resetBtn.disabled = false;
                resetBtn.classList.remove('opacity-50', 'cursor-wait');
                resetBtn.innerHTML = originalText;
            }
        }
    },


    // =========================================
    // --- RENDERING TAMPILAN GEOGRAFIS ---
    // =========================================

    renderLocationsArea(universe) {
        return `
        <div class="mb-4 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mt-6">
            <div class="bg-slate-700/50 p-3 flex justify-between items-center cursor-pointer border-b border-slate-700" onclick="app.togglePanel('locPanel_${universe.id}')">
                <h3 class="font-semibold text-emerald-400 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Kategori Tempat <span class="ml-2 bg-slate-600 text-xs px-2 py-0.5 rounded-full text-white">${universe.locations.length} Root</span>
                </h3>
                <button onclick="event.stopPropagation(); app.openAddLocation('${universe.id}')" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition">
                    + Tempat Baru
                </button>
            </div>

            <div id="locPanel_${universe.id}" class="p-3 space-y-3 ${this.getPanelClass('locPanel_' + universe.id)}">
                
                <!-- ROOT LOCATION FORM -->
                <div id="addRootLoc_${universe.id}" class="${this.getPanelClass('addRootLoc_' + universe.id)} bg-slate-900 border border-slate-700 p-4 rounded-lg mb-4 transition-all duration-300">
                    <h4 id="rootLocFormTitle_${universe.id}" class="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2">Buat Tempat Utama Baru</h4>
                    
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block mt-2">Nama Tempat Utama <span class="text-rose-400">*</span></label>
                    <input type="text" id="newLocName_${universe.id}" placeholder="Nama Tempat Utama" class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500">
                    
                    <div class="flex justify-between items-end mb-1">
                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deskripsi (Sejarah/Fungsi)</label>
                        <button id="btnAiLocDesc_${universe.id}" onclick="app.generateLocationAI('${universe.id}', '${universe.id}', true, 'description')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ AI Deskripsi
                        </button>
                    </div>
                    <textarea id="newLocDesc_${universe.id}" placeholder="Deskripsi tempat..." class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500" rows="3"></textarea>
                    
                    <div class="flex justify-between items-end mb-1">
                        <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visual / Penggambaran</label>
                        <button id="btnAiLocVis_${universe.id}" onclick="app.generateLocationAI('${universe.id}', '${universe.id}', true, 'visuals')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ AI Visual
                        </button>
                    </div>
                    <textarea id="newLocVis_${universe.id}" placeholder="Penggambaran tempat..." class="bg-slate-800 border border-slate-600 rounded p-2 text-sm w-full mb-3 outline-none focus:border-emerald-500" rows="3"></textarea>
                    
                    <div class="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-700/60">
                        <button onclick="app.cancelEditLocation('${universe.id}')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition">Batal</button>
                        <button id="rootLocFormBtn_${universe.id}" onclick="app.addLocation('${universe.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm shadow transition font-medium">Simpan Tempat</button>
                    </div>
                </div>

                <div class="space-y-2">
                    ${universe.locations.length === 0 ? '<p class="text-sm text-slate-500 italic text-center py-4 bg-slate-800/40 rounded border border-dashed border-slate-700">Belum ada tempat.</p>' : this.renderLocationTree(universe.locations, universe.id, 0, null)}
                </div>
            </div>
        </div>`;
    },

    renderLocationTree(locations, univId, depth = 0, parentId = null) {
        if (!locations || locations.length === 0) return '';
        const indentClass = depth > 0 ? 'ml-4 sm:ml-6 pl-4 border-l-2 border-slate-700 mt-2' : '';
        
        return `<div class="${indentClass} space-y-3">` + locations.map((loc, index) => {
            const hasChildren = loc.children && loc.children.length > 0;
            
            const panelId = `children-${loc.id}`;
            const panelClass = this.getPanelClass(panelId, 'hidden');
            const isHidden = panelClass.includes('hidden');
            
            // Tombol SVG sebagai hiasan interaktif, transisi rotasi didasarkan pada collapse state
            const toggleBtn = hasChildren 
                ? `<span class="mr-2 text-slate-400 group-hover/header:text-emerald-400 transition-transform flex items-center justify-center">
                        <svg id="toggle-icon-${loc.id}" class="w-4 h-4 transform transition-transform duration-200 ${isHidden ? '-rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </span>`
                : `<span class="w-6 inline-block"></span>`;
            
            let childrenHTML = '';
            if (hasChildren) {
                childrenHTML = `
                    <div id="${panelId}" class="${panelClass}">
                        ${this.renderLocationTree(loc.children, univId, depth + 1, loc.id)}
                    </div>
                `;
            }

            return `
            <div class="bg-slate-900 border border-slate-700 rounded p-3 relative group shadow-sm hover:border-emerald-500/40 transition-colors">
                <!-- PANEL AKSI MELAYANG DI SIKU KANAN ATAS -->
                <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-10 bg-slate-900 pl-2 rounded">
                    <!-- Tombol Geser Naik Berdasarkan Abjad / Urutan Indeks Posisi -->
                    ${index > 0 ? `
                    <button onclick="event.stopPropagation(); app.moveLocationUp('${univId}', '${loc.id}')" class="text-slate-400 hover:text-emerald-400 p-1 bg-slate-800 rounded transition border border-slate-700" title="Naikkan Urutan Tempat">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="event.stopPropagation(); app.openEditLocation('${univId}', '${loc.id}', ${parentId ? `'${parentId}'` : 'null'})" class="text-slate-400 hover:text-amber-400 p-1 bg-slate-800 rounded transition border border-slate-700" title="Edit Lokasi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="event.stopPropagation(); app.deleteLocation('${univId}', '${loc.id}')" class="text-slate-400 hover:text-rose-500 p-1 bg-slate-800 rounded transition border border-slate-700" title="Hapus Lokasi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                
                <!-- HEADER BARIS JUDUL SEKARANG CLIKABLE PENUH (LEBAR PENUH) -->
                <div class="flex items-center mb-2 pb-1 border-b border-slate-800 ${hasChildren ? 'cursor-pointer select-none group/header' : ''}"
                     ${hasChildren ? `onclick="app.toggleLocationChildren('${loc.id}')"` : ''}>
                    ${toggleBtn}
                    <h4 class="font-bold text-emerald-400 text-sm md:text-base flex-1 line-clamp-1 group-hover/header:text-emerald-300 transition-all">
                        ${loc.name} 
                        ${hasChildren ? `<span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-normal ml-2 border border-slate-700">${loc.children.length} sub-tempat</span>` : ''}
                    </h4>
                </div>
                
                <!-- DETAIL PANEL INFORMASI DAN DESKRIPSI -->
                <div class="pl-6 space-y-1.5">
                    <div class="text-xs text-slate-300"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Deskripsi (Sejarah/Fungsi):</span> <span class="leading-relaxed">${loc.description || '-'}</span></div>
                    <div class="text-xs text-slate-300 mb-2"><span class="font-semibold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Visual (Penggambaran):</span> <span class="leading-relaxed">${loc.visuals || '-'}</span></div>
                    
                    <div class="flex items-center space-x-2 mt-3 mb-2 pt-2 border-t border-slate-800/80">
                        <button onclick="app.openAddChildLocation('${loc.id}')" class="text-xs text-slate-400 hover:text-emerald-400 flex items-center bg-slate-800 px-2 py-1 rounded transition border border-slate-700">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Tambah Sub-Tempat
                        </button>
                        <button id="btnAutoChild_${loc.id}" onclick="app.autoGenerateChildLocation('${univId}', '${loc.id}')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ AI Auto-Child
                        </button>
                    </div>

                    <!-- CHILD LOCATION FORM -->
                    <div id="addChildLoc_${loc.id}" class="${this.getPanelClass('addChildLoc_' + loc.id)} bg-slate-800 border border-slate-700 p-3 rounded mt-2 mb-3 shadow-inner transition-all duration-300">
                        <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Nama Sub-Tempat <span class="text-rose-400">*</span></label>
                        <input type="text" id="newLocName_${loc.id}" placeholder="Nama Sub-Tempat" class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2 outline-none focus:border-emerald-500">
                        
                        <div class="flex justify-between items-end mb-1 mt-2">
                            <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deskripsi (Sejarah/Fungsi)</label>
                            <button id="btnAiLocDesc_${loc.id}" onclick="app.generateLocationAI('${univId}', '${loc.id}', false, 'description')" class="text-[9px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-1.5 py-0.5 rounded transition font-medium shadow-sm">✨ AI Deskripsi</button>
                        </div>
                        <textarea id="newLocDesc_${loc.id}" placeholder="Deskripsi ringkas..." class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-2 outline-none focus:border-emerald-500" rows="3"></textarea>
                        
                        <div class="flex justify-between items-end mb-1 mt-2">
                            <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Visual (Penggambaran)</label>
                            <button id="btnAiLocVis_${loc.id}" onclick="app.generateLocationAI('${univId}', '${loc.id}', false, 'visuals')" class="text-[9px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 px-1.5 py-0.5 rounded transition font-medium shadow-sm">✨ AI Visual</button>
                        </div>
                        <textarea id="newLocVis_${loc.id}" placeholder="Penggambaran ringkas..." class="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full mb-3 outline-none focus:border-emerald-500" rows="3"></textarea>
                        
                        <div class="flex justify-end space-x-2 pt-2 border-t border-slate-700/60">
                            <button onclick="app.cancelEditChildLocation('${loc.id}')" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition">Batal</button>
                            <button id="childLocFormBtn_${loc.id}" onclick="app.addChildLocation('${univId}', '${loc.id}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs transition shadow-sm">Simpan Child</button>
                        </div>
                    </div>
                </div>

                ${childrenHTML}
            </div>
            `;
        }).join('') + `</div>`;
    }
};

// Ekspor alias cadangan untuk menjamin kompatibilitas import pada berkas-berkas lama
export const LocationBasicModule = UniverseLocationModule;