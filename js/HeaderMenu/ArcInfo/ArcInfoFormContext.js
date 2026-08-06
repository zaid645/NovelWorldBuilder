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
            if (index === -1) {
                targetArray.push(itemId);
                isSelected = true;
            } else {
                targetArray.splice(index, 1);
                isSelected = false;
            }
        }

        // Pembersihan descendant lokasi dipindah ke bawah setelah `isSelected` ditentukan
        if (type === 'location' && isSelected) {
            const descendantIds = new Set(this.getDescendantLocationIds(itemId));
            context.locationIds = context.locationIds.filter(id => !descendantIds.has(id));
        }

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
        const effectiveLocIds = new Set(this.getEffectiveSelectedLocationIds(arcId));

        // 1. Karakter (Blacklist 'id')
        const charactersPayload = selected.characters.map(({ id, universeId, ...rest }) => rest);

        // 2. Lokasi (Blacklist 'id', hapus 'description' default, ubah ke struktur Tree)
        const locationsPayload = [];
        if (this.data && Array.isArray(this.data.universes)) {
            this.data.universes.forEach(univ => {
                if (univ.locations) {
                    const tree = this.buildCleanLocationTree(univ.locations, effectiveLocIds);
                    if (tree.length > 0) {
                        locationsPayload.push(...tree);
                    }
                }
            });
        }

        // 3. Semesta (Blacklist 'id')
        const universesPayload = selected.universes.map(({ id, ...rest }) => rest);

        return {
            charactersInvolved: charactersPayload,
            locationsInvolved: locationsPayload,
            multiverseLore: universesPayload
        };
    },

    // Helper Build Lokasi
    buildCleanLocationTree(nodes, effectiveLocIds) {
        if (!Array.isArray(nodes)) return [];

        return nodes
            .map(node => {
                const rawChildren = node.children || node.subLocations;
                const childTree = this.buildCleanLocationTree(rawChildren, effectiveLocIds);
                const isNodeSelected = effectiveLocIds.has(node.id);

                // Sertakan node HANYA jika node tersebut terpilih ATAU memiliki anak yang terpilih
                if (!isNodeSelected && childTree.length === 0) {
                    return null;
                }

                // Blacklist ID: Buat objek lokasi bersih
                const cleanedNode = {
                    name: node.name || 'Tanpa Nama Lokasi'
                };

                // Blacklist Description: Hapus jika kosong atau bernilai default
                const desc = (node.description || node.notes || '').trim();
                if (desc && desc !== 'Tidak ada deskripsi') {
                    cleanedNode.description = desc;
                }

                // Masukkan anak dalam bentuk hirarki/tree jika ada
                if (childTree.length > 0) {
                    cleanedNode.subLocations = childTree;
                }

                return cleanedNode;
            })
            .filter(Boolean); // Filter elemen null
    },
    getDescendantLocationIds(locId) {
        const allLocs = this.getFlattenedLocations();
        const descendantIds = new Set();
        const visited = new Set([locId]);

        const collectChildren = (parentId) => {
            if (!this.data || !this.data.universes) return;
            
            const findAndCollect = (nodeList) => {
                if (!Array.isArray(nodeList)) return;
                nodeList.forEach(node => {
                    if (node.id === parentId) {
                        const children = [...(node.children || []), ...(node.subLocations || [])];
                        children.forEach(child => {
                            if (child && child.id && !visited.has(child.id)) {
                                visited.add(child.id);
                                descendantIds.add(child.id);
                                collectChildren(child.id);
                            }
                        });
                    } else {
                        if (node.children) findAndCollect(node.children);
                        if (node.subLocations) findAndCollect(node.subLocations);
                    }
                });
            };

            this.data.universes.forEach(univ => {
                if (univ.locations) findAndCollect(univ.locations);
            });
        };

        collectChildren(locId);
        return Array.from(descendantIds);
    },

    getImplicitHiddenLocationIds(arcId) {
        const context = this.ensureArcContextSelection(arcId);
        if (!context) return new Set();

        const hiddenSet = new Set();
        context.locationIds.forEach(selectedId => {
            const descendants = this.getDescendantLocationIds(selectedId);
            descendants.forEach(id => hiddenSet.add(id));
        });
        return hiddenSet;
    },

    getEffectiveSelectedLocationIds(arcId) {
        const context = this.ensureArcContextSelection(arcId);
        if (!context) return [];

        const effectiveSet = new Set(context.locationIds);
        context.locationIds.forEach(selectedId => {
            const descendants = this.getDescendantLocationIds(selectedId);
            descendants.forEach(id => effectiveSet.add(id));
        });
        return Array.from(effectiveSet);
    },
};