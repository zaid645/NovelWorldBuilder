// Modul Pengelolaan Konteks Arc & AI Context Selection

export const ArcInfoFormContext = {
    // ===================================================
    // 1. EXTRACTION & FLATTENING DATA (Normalisasi Data)
    // ===================================================

    /**
     * Mengambil seluruh karakter dan monster dari semua semesta.
     * Mengembalikan array datar dengan atribut yang sudah disaring (Nama, Watak, Latar).
     */
    getNormalizedCharacters() {
        const characters = [];
        if (!this.data || !this.data.universes) return characters;

        this.data.universes.forEach(univ => {
            if (!univ.characters) return;

            // Iterasi berdasarkan kategori (Main Character, Villain, Monster, NPC, dll)
            Object.keys(univ.characters).forEach(category => {
                const list = univ.characters[category];
                if (Array.isArray(list)) {
                    list.forEach(char => {
                        characters.push({
                            id: char.id,
                            name: char.name || 'Tanpa Nama',
                            category: category,
                            universeId: univ.id,
                            universeName: univ.name,
                            personality: char.personality || char.watak || '',
                            background: char.background || char.latarBelakang || ''
                        });
                    });
                }
            });
        });

        return characters;
    },

    /**
     * Menghancurkan struktur Tree Lokasi menjadi Flat Array (Daftar Individu).
     * Memudahkan pencarian langsung tanpa hirarki folder.
     */
    getFlattenedLocations() {
        const locations = [];
        if (!this.data || !this.data.universes) return locations;

        // Fungsi rekursif untuk membongkar cabang/tree lokasi
        const extractNodes = (nodeList, univId, univName, parentPath = '') => {
            if (!Array.isArray(nodeList)) return;

            nodeList.forEach(loc => {
                const currentPath = parentPath ? `${parentPath} > ${loc.name}` : loc.name;
                
                locations.push({
                    id: loc.id,
                    name: loc.name || 'Tanpa Nama Lokasi',
                    description: loc.description || loc.notes || '',
                    universeId: univId,
                    universeName: univName,
                    path: currentPath // Menyimpan jejak lokasi (cth: "Kuil Kuno > Ruang Rahasia")
                });

                // Rekursi jika ada sub-lokasi / children
                if (loc.children && Array.isArray(loc.children)) {
                    extractNodes(loc.children, univId, univName, currentPath);
                }
                if (loc.subLocations && Array.isArray(loc.subLocations)) {
                    extractNodes(loc.subLocations, univId, univName, currentPath);
                }
            });
        };

        this.data.universes.forEach(univ => {
            if (univ.locations) {
                extractNodes(univ.locations, univ.id, univ.name);
            }
        });

        return locations;
    },

    /**
     * Mengambil daftar seluruh semesta beserta deskripsi & lore dasarnya.
     */
    getNormalizedUniverses() {
        if (!this.data || !this.data.universes) return [];

        return this.data.universes.map(univ => ({
            id: univ.id,
            name: univ.name || 'Tanpa Nama Semesta',
            description: univ.description || '',
            lores: univ.lores || []
        }));
    },

    // ===================================================
    // 2. LOGIKA SEARCH & FILTER
    // ===================================================
    searchCharacters(query = '') {
        const allChars = this.getNormalizedCharacters();
        const q = String(query || '').toLowerCase().trim();
        if (!q) return allChars;

        return allChars.filter(c => 
            String(c.name || '').toLowerCase().includes(q) || 
            String(c.category || '').toLowerCase().includes(q) ||
            String(c.personality || '').toLowerCase().includes(q)
        );
    },

    searchLocations(query = '') {
        const allLocs = this.getFlattenedLocations();
        const q = String(query || '').toLowerCase().trim();
        if (!q) return allLocs;

        return allLocs.filter(l => 
            String(l.name || '').toLowerCase().includes(q) || 
            String(l.path || '').toLowerCase().includes(q) ||
            String(l.description || '').toLowerCase().includes(q)
        );
    },

    // ===================================================
    // 3. LOGIKA MUTASI CHECKLIST & PENYIMPANAN DATA
    // ===================================================

    /**
     * Memastikan struktur `contextSelection` ada pada objek Arc target.
     */
    ensureArcContextSelection(arcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) return null;

        if (!arc.contextSelection) {
            arc.contextSelection = {
                characterIds: [],
                locationIds: [],
                universeIds: []
            };
        }

        // Memastikan tipe properti selalu Array
        if (!Array.isArray(arc.contextSelection.characterIds)) arc.contextSelection.characterIds = [];
        if (!Array.isArray(arc.contextSelection.locationIds)) arc.contextSelection.locationIds = [];
        if (!Array.isArray(arc.contextSelection.universeIds)) arc.contextSelection.universeIds = [];

        return arc.contextSelection;
    },

    /**
     * FUNGSI UTAMA: Menambah/menghapus item checklist (Character, Location, Universe).
     * Otomatis menyimpan data ke storage.
     * 
     * @param {string} arcId - ID Arc yang sedang aktif
     * @param {'character'|'location'|'universe'} type - Kategori yang diperbarui
     * @param {string} itemId - ID item yang dicentang/dilepas
     * @param {boolean} [forceState] - Paksa true (centang) atau false (uncheck)
     * @returns {boolean} Status akhir item (true jika terpilih, false jika tidak)
     */
    toggleContextItem(arcId, type, itemId, forceState = null) {
        const context = this.ensureArcContextSelection(arcId);
        if (!context) return false;

        const keyMap = {
            character: 'characterIds',
            location: 'locationIds',
            universe: 'universeIds'
        };

        const key = keyMap[type];
        if (!key) return false;

        const targetArray = context[key];
        const index = targetArray.indexOf(itemId);

        let isSelected = false;

        if (forceState !== null) {
            if (forceState && index === -1) {
                targetArray.push(itemId);
                isSelected = true;
            } else if (!forceState && index !== -1) {
                targetArray.splice(index, 1);
                isSelected = false;
            } else {
                isSelected = index !== -1;
            }
        } else {
            // Toggle biasa
            if (index === -1) {
                targetArray.push(itemId);
                isSelected = true;
            } else {
                targetArray.splice(index, 1);
                isSelected = false;
            }
        }

        // SIMPAN DATA OTOMATIS
        if (typeof this.saveData === 'function') {
            this.saveData();
        }

        return isSelected;
    },

    /**
     * Menghapus seluruh item terpilih dalam satu kategori konteks.
     */
    clearContextCategory(arcId, type) {
        const context = this.ensureArcContextSelection(arcId);
        if (!context) return;

        if (type === 'character') context.characterIds = [];
        if (type === 'location') context.locationIds = [];
        if (type === 'universe') context.universeIds = [];

        if (typeof this.saveData === 'function') {
            this.saveData();
        }
    },

    /**
     * Mengambil data LENGKAP dari item-item yang dicentang
     * (Digunakan untuk menampilkan "Daftar Terpilih" di UI).
     */
    getSelectedContextDetails(arcId) {
        const context = this.ensureArcContextSelection(arcId);
        if (!context) return { characters: [], locations: [], universes: [] };

        const allChars = this.getNormalizedCharacters();
        const allLocs = this.getFlattenedLocations();
        const allUnivs = this.getNormalizedUniverses();

        return {
            characters: allChars.filter(c => context.characterIds.includes(c.id)),
            locations: allLocs.filter(l => context.locationIds.includes(l.id)),
            universes: allUnivs.filter(u => context.universeIds.includes(u.id))
        };
    },

    // ===================================================
    // 4. PERAKITAN PAYLOAD EFISIEN UNTUK AI ENCHANTER
    // ===================================================

    /**
     * Menghasilkan objek konteks yang HANYA berisi atribut penting
     * untuk dikirimkan ke AI (Diintegrasikan di ArcInfoFormAi.js).
     */
    buildAiContextPayload(arcId) {
        const selected = this.getSelectedContextDetails(arcId);

        // 1. Karakter: HANYA Nama, Watak, dan Latar Belakang
        const charactersPayload = selected.characters.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category,
            personality: c.personality || 'Tidak dijelaskan',
            background: c.background || 'Tidak ada latar belakang'
        }));

        // 2. Lokasi: HANYA Nama, Path, dan Deskripsi
        const locationsPayload = selected.locations.map(l => ({
            id: l.id,
            name: l.name,
            path: l.path,
            description: l.description || 'Tidak ada deskripsi'
        }));

        // 3. Semesta: Deskripsi dan Lore
        const universesPayload = selected.universes.map(u => ({
            id: u.id,
            name: u.name,
            description: u.description,
            lores: u.lores
        }));

        return {
            charactersInvolved: charactersPayload,
            locationsInvolved: locationsPayload,
            multiverseLore: universesPayload
        };
    }
};