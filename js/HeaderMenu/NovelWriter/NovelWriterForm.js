export const NovelWriterForm = {
    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================
    state: {
        // UI Navigation State
        activeTab: 'selection', // 'selection' | 'attributes' | 'instructions'

        // Filter Atribut Global (Karakter & Monster)
        globalAttributes: {
            basicInfo: true,
            personality: true,
            background: true,
            appearance: true,
            skillIds: true,
            classIds: true,
            itemIds: true,
            familiarIds: true,
            dialogues: true,
            notes: false,
            relations: false
        },

        // Seleksi Entitas & Konteks Cerita
        selectedUniverseIds: [],
        selectedLocationIds: [],
        selectedCharacterIds: [],
        selectedMonsterIds: [],

        // Pelacak Statistik Penggunaan untuk Shortcut (ID: Jumlah Digunakan)
        usageStats: {
            characters: {},
            locations: {}
        },

        // Search Queries UI
        universeSearchQuery: '',
        charSearchQuery: '',
        monsterSearchQuery: '',
        locSearchQuery: '',

        // Input & File Modul
        mainInstruction: "Tulis narasi novel yang emosional, kaya deskripsi panca indera, mengalir, dan konsisten dengan karakterisasi.", // Instruksi utama/global
        generatePrompt: "",      // Scene cerita / adegan spesifik yang akan dikembangkan
        referenceFiles: {},      // Dictionary: { "filename.txt": "content text..." }

        // Output Modul
        outputContent: "",        // Teks naskah novel (konteks lanjutan)
        savedContexts: []         // Simpanan konteks output AI (maksimal 3 item
    },

    // =========================================================================
    // MANAGEMENT SAVED CONTEXTS
    // =========================================================================
    saveOutputAsContext() {
        const text = this.state.outputContent ? this.state.outputContent.trim() : '';
        if (!text) {
            if (typeof this.showNotification === 'function') {
                this.showNotification("Output naskah kosong, tidak ada teks untuk disimpan!", "warning");
            }
            return;
        }

        // Batasi maksimal 3 konteks: hapus item tertua (index 0) jika sudah mencapai limit
        if (this.state.savedContexts.length >= 3) {
            this.state.savedContexts.shift();
        }

        // Tambahkan konteks baru
        this.state.savedContexts.push(text);

        // Bersihkan output utama
        this.state.outputContent = "";
        
        this.novelWriterSaveState();
        this.refreshUI();

        if (typeof this.showNotification === 'function') {
            this.showNotification("Konteks berhasil disimpan dan dipindahkan!", "success");
        }
    },

    removeSavedContext(index) {
        if (index >= 0 && index < this.state.savedContexts.length) {
            this.state.savedContexts.splice(index, 1);
            this.novelWriterSaveState();
            this.refreshUI();
            if (typeof this.showNotification === 'function') {
                this.showNotification("Konteks simpanan dihapus.", "info");
            }
        }
    },

    copySavedContextToClipboard(index = null) {
        let textToCopy = "";
        if (index !== null) {
            textToCopy = this.state.savedContexts[index] || "";
        } else {
            textToCopy = this.state.savedContexts.join("\n\n---\n\n");
        }

        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            if (typeof this.showNotification === 'function') {
                this.showNotification("Konteks berhasil disalin ke clipboard!", "success");
            }
        });
    },

    downloadSavedContextAsTxt(index = null) {
        let content = "";
        let filename = "";

        if (index !== null) {
            content = this.state.savedContexts[index] || "";
            filename = `konteks_simpanan_${index + 1}.txt`;
        } else {
            content = this.state.savedContexts.join("\n\n====================\n\n");
            filename = `semua_konteks_simpanan.txt`;
        }

        if (!content) return;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Helper untuk mengambil seluruh konteks simpanan saat menyusun prompt AI
    getFormattedSavedContexts() {
        if (!this.state.savedContexts || this.state.savedContexts.length === 0) return "";
        return this.state.savedContexts.map((ctx, idx) => `[Konteks Simpanan ${idx + 1}]:\n${ctx}`).join("\n\n");
    },

    // =========================================================================
    // DATA NORMALIZATION & RESOLUTION HELPERS
    // =========================================================================
    novelWriteSanitizeSelectedIds() {
        const db = this.getDatabase();

        // 1. Buat Set dari ID yang valid di database
        const validUniverseIds = new Set(this.getAllUniverses(db).map(u => u.id));
        const validCharacterIds = new Set(this.getAllCharacters(db).map(c => c.id));
        const validMonsterIds = new Set(this.getAllMonsters(db).map(m => m.id));
        const validLocationIds = new Set(this.getAllLocations(db).map(l => l.id));

        // 2. Filter array terpilih di state
        this.state.selectedUniverseIds = this.state.selectedUniverseIds.filter(id => validUniverseIds.has(id));
        this.state.selectedCharacterIds = this.state.selectedCharacterIds.filter(id => validCharacterIds.has(id));
        this.state.selectedMonsterIds = this.state.selectedMonsterIds.filter(id => validMonsterIds.has(id));
        this.state.selectedLocationIds = this.state.selectedLocationIds.filter(id => validLocationIds.has(id));

        // 3. Bersihkan juga statistik penggunaan jika ID-nya sudah tidak ada
        if (this.state.usageStats.characters) {
            Object.keys(this.state.usageStats.characters).forEach(id => {
                if (!validCharacterIds.has(id)) delete this.state.usageStats.characters[id];
            });
        }
        if (this.state.usageStats.locations) {
            Object.keys(this.state.usageStats.locations).forEach(id => {
                if (!validLocationIds.has(id)) delete this.state.usageStats.locations[id];
            });
        }
    },

    novelWriterLoadState() {
    const db = this.getDatabase();
        if (db && db.writerFormState) {
            // Gunakan Object.assign agar referensi memori this.state tetap sama
            Object.assign(this.state, db.writerFormState);
        }
        // Pastikan Info Dasar dan Watak selalu true setelah data dimuat
        this.state.globalAttributes.basicInfo = true;
        this.state.globalAttributes.personality = true;
        
        this.novelWriteSanitizeSelectedIds();
    },

    novelWriterSaveState(silent = true) {
        const db = this.getDatabase();
        if (db) {
            // Salin state saat ini ke properti writerFormState di ManagerData
            db.writerFormState = JSON.parse(JSON.stringify(this.state));

            // Panggil saveData bawaan ManagerData jika tersedia di global/app
            if (typeof window !== 'undefined' && window.app && typeof window.app.saveData === 'function') {
                window.app.saveData(silent);
            }
        }
    },
    
    getDatabase(providedDb = null) {
        if (providedDb && Object.keys(providedDb).length > 0) return providedDb;
        if (typeof window !== 'undefined' && window.app && window.app.data) return window.app.data;
        if (typeof window !== 'undefined' && window.app && window.app.db) return window.app.db;
        return {};
    },

    getAllUniverses(db) {
        const sourceDb = db || this.getDatabase();
        if (Array.isArray(sourceDb.universes)) return sourceDb.universes;
        return [];
    },

    getAllCharacters(db) {
        const list = [];
        const sourceDb = db || this.getDatabase();

        if (Array.isArray(sourceDb.characters)) {
            sourceDb.characters.forEach(c => list.push(c));
        }

        if (Array.isArray(sourceDb.universes)) {
            sourceDb.universes.forEach(u => {
                if (u.characters) {
                    if (Array.isArray(u.characters)) {
                        u.characters.forEach(c => list.push({ ...c, universeName: u.name }));
                    } else if (typeof u.characters === 'object') {
                        Object.keys(u.characters).forEach(cat => {
                            if (cat.toLowerCase().includes('monster')) return;
                            if (Array.isArray(u.characters[cat])) {
                                u.characters[cat].forEach(c => list.push({ ...c, category: cat, universeName: u.name }));
                            }
                        });
                    }
                }
            });
        }

        const uniqueMap = new Map();
        list.forEach(item => { if (item && item.id) uniqueMap.set(item.id, item); });
        return Array.from(uniqueMap.values());
    },

    getAllMonsters(db) {
        const list = [];
        const sourceDb = db || this.getDatabase();

        if (Array.isArray(sourceDb.monsters)) {
            sourceDb.monsters.forEach(m => list.push(m));
        }

        if (Array.isArray(sourceDb.universes)) {
            sourceDb.universes.forEach(u => {
                if (u.characters && typeof u.characters === 'object') {
                    Object.keys(u.characters).forEach(cat => {
                        if (cat.toLowerCase().includes('monster') && Array.isArray(u.characters[cat])) {
                            u.characters[cat].forEach(m => list.push({ ...m, category: 'Monster', universeName: u.name }));
                        }
                    });
                }
            });
        }

        const uniqueMap = new Map();
        list.forEach(item => { if (item && item.id) uniqueMap.set(item.id, item); });
        return Array.from(uniqueMap.values());
    },

    getAllLocations(db) {
        const list = [];
        const sourceDb = db || this.getDatabase();

        if (Array.isArray(sourceDb.locations)) {
            sourceDb.locations.forEach(l => list.push(l));
        }

        const visitedIds = new Set();

        const extractRecursive = (nodeList, uName = '') => {
            if (!Array.isArray(nodeList)) return;
            nodeList.forEach(loc => {
                if (loc.id && visitedIds.has(loc.id)) return;
                if (loc.id) visitedIds.add(loc.id);

                list.push({ ...loc, universeName: uName });
                
                if (loc.children) extractRecursive(loc.children, uName);
                if (loc.subLocations) extractRecursive(loc.subLocations, uName);
            });
        };

        if (Array.isArray(sourceDb.universes)) {
            sourceDb.universes.forEach(u => {
                if (u.locations) extractRecursive(u.locations, u.name);
            });
        }

        const uniqueMap = new Map();
        list.forEach(item => { if (item && item.id) uniqueMap.set(item.id, item); });
        return Array.from(uniqueMap.values());
    },

    resolveEntityIds(idList = [], collection = []) {
        if (!Array.isArray(idList) || !Array.isArray(collection)) return [];
        return idList.map(id => collection.find(item => item.id === id)).filter(Boolean);
    },

    // Stat / Shortcut Helpers
    recordUsage(type, id) {
        if (!this.state.usageStats[type]) this.state.usageStats[type] = {};
        this.state.usageStats[type][id] = (this.state.usageStats[type][id] || 0) + 1;
    },

    getTopEntities(type, limit = 10) {
        const db = this.getDatabase();
        let all = [];

        if (type === 'characters') all = this.getAllCharacters(db);
        else if (type === 'monsters') all = this.getAllMonsters(db);
        else if (type === 'locations') all = this.getAllLocations(db);

        const stats = (this.state.usageStats && this.state.usageStats[type]) || {};

        return [...all].sort((a, b) => {
            const countA = stats[a.id] || 0;
            const countB = stats[b.id] || 0;
            return countB - countA;
        }).slice(0, limit);
    },

    // =========================================================================
    // EVENT HANDLERS & MUTATIONS
    // =========================================================================
    setAttribute(key, value) {
        if (key === 'basicInfo' || key === 'personality') {
            this.state.globalAttributes[key] = true;
            return;
        }
        
        if (key in this.state.globalAttributes) {
            this.state.globalAttributes[key] = Boolean(value);
            this.novelWriterSaveState();
        }
    },

    toggleUniverseSelection(universeId, forceState = null) {
        const index = this.state.selectedUniverseIds.indexOf(universeId);
        if (forceState === true && index === -1) {
            this.state.selectedUniverseIds.push(universeId);
        } else if (forceState === false && index !== -1) {
            this.state.selectedUniverseIds.splice(index, 1);
        } else if (forceState === null) {
            if (index === -1) this.state.selectedUniverseIds.push(universeId);
            else this.state.selectedUniverseIds.splice(index, 1);
        }
        this.novelWriterSaveState();
        this.updateListUI('universe');
        this.updateShortcutUI();
    },

    toggleCharacterSelection(charId, forceState = null) {
        const index = this.state.selectedCharacterIds.indexOf(charId);
        const willSelect = forceState !== null ? forceState : (index === -1);

        if (willSelect) {
            if (index === -1) this.state.selectedCharacterIds.push(charId);
            this.recordUsage('characters', charId);
        } else {
            if (index !== -1) this.state.selectedCharacterIds.splice(index, 1);
        }
        this.novelWriterSaveState();
        this.updateListUI('character');
        this.updateShortcutUI();
    },

    toggleMonsterSelection(monsterId, forceState = null) {
        const index = this.state.selectedMonsterIds.indexOf(monsterId);
        if (forceState === true && index === -1) {
            this.state.selectedMonsterIds.push(monsterId);
        } else if (forceState === false && index !== -1) {
            this.state.selectedMonsterIds.splice(index, 1);
        } else if (forceState === null) {
            if (index === -1) this.state.selectedMonsterIds.push(monsterId);
            else this.state.selectedMonsterIds.splice(index, 1);
        }
        this.novelWriterSaveState();
        this.updateListUI('monster');
    },

    toggleLocationSelection(locId, forceState = null) {
        const index = this.state.selectedLocationIds.indexOf(locId);
        const willSelect = forceState !== null ? forceState : (index === -1);

        if (willSelect) {
            if (index === -1) this.state.selectedLocationIds.push(locId);
            this.recordUsage('locations', locId);

            // Saring & hapus child lokasi dari seleksi eksplisit karena sudah diwakili oleh parent
            const descendantIds = new Set(this.getDescendantLocationIds(locId));
            this.state.selectedLocationIds = this.state.selectedLocationIds.filter(id => !descendantIds.has(id));
        } else {
            if (index !== -1) this.state.selectedLocationIds.splice(index, 1);
        }
        this.novelWriterSaveState();
        this.updateListUI('location');
        this.updateShortcutUI();
    },

    // Memperbarui hanya sub-container daftar item agar tidak merusak fokus input pencarian
    updateListUI(type) {
        const db = this.getDatabase();
        if (type === 'universe' && typeof this.renderUniverseItems === 'function') {
            const el = document.getElementById('nw-universe-list-items');
            if (el) el.innerHTML = this.renderUniverseItems(db);
            const counter = document.getElementById('nw-universe-count');
            if (counter) counter.innerText = `(${this.state.selectedUniverseIds.length})`;
        } else if (type === 'character' && typeof this.renderCharacterItems === 'function') {
            const el = document.getElementById('nw-character-list-items');
            if (el) el.innerHTML = this.renderCharacterItems(db);
            const counter = document.getElementById('nw-character-count');
            if (counter) counter.innerText = `(${this.state.selectedCharacterIds.length})`;
        } else if (type === 'monster' && typeof this.renderMonsterItems === 'function') {
            const el = document.getElementById('nw-monster-list-items');
            if (el) el.innerHTML = this.renderMonsterItems(db);
            const counter = document.getElementById('nw-monster-count');
            if (counter) counter.innerText = `(${this.state.selectedMonsterIds.length})`;
        } else if (type === 'location' && typeof this.renderLocationItems === 'function') {
            const el = document.getElementById('nw-location-list-items');
            if (el) el.innerHTML = this.renderLocationItems(db);
            const counter = document.getElementById('nw-location-count');
            if (counter) counter.innerText = `(${this.state.selectedLocationIds.length})`;
        }
    },

    updateShortcutUI() {
        const container = document.getElementById('nw-shortcuts-list-container');
        if (container && typeof this.renderShortcutPanel === 'function') {
            container.innerHTML = this.renderShortcutPanel();
        }
    },

    handleFileUploads(files) {
        if (!files || files.length === 0) return;

        let filesRead = 0;
        const totalFiles = files.length;

        Array.from(files).forEach(file => {
            if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
                this.showNotification(`File "${file.name}" diabaikan karena bukan format .txt!`, "error");
                filesRead++;
                if (filesRead === totalFiles) this.refreshUI();
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.state.referenceFiles[file.name] = e.target.result;
                filesRead++;
                if (filesRead === totalFiles) {
                    this.novelWriterSaveState();
                    this.showNotification(`Berhasil memuat file referensi!`, "success");
                    this.refreshUI();
                }
            };
            reader.onerror = () => {
                filesRead++;
                if (filesRead === totalFiles) this.refreshUI();
            };
            reader.readAsText(file);
        });
    },

    removeReferenceFile(fileName) {
        if (fileName in this.state.referenceFiles) {
            delete this.state.referenceFiles[fileName];
            this.novelWriterSaveState();
            this.showNotification(`File "${fileName}" telah dihapus.`, "info");
            this.refreshUI();
        }
    },

    // =========================================================================
    // HELPER HIRARKI LOKASI (PARENT-CHILD)
    // =========================================================================

    // 1. Mengambil semua ID turunan (children & subLocations) dari suatu location ID secara rekursif
    getDescendantLocationIds(locId, providedDb = null) {
        const db = providedDb || this.getDatabase();
        const allLocs = this.getAllLocations(db);
        const findNodeById = (id) => allLocs.find(l => l.id === id);
        
        const descendantIds = new Set();
        // Tandai rootId sebagai node yang sudah dikunjungi agar tidak ikut terdaftar sebagai descendant
        const visitedNodes = new Set([locId]); 

        const collectChildren = (node) => {
            if (!node) return;
            const childrenList = [...(node.children || []), ...(node.subLocations || [])];
            childrenList.forEach(child => {
                if (child && child.id && !visitedNodes.has(child.id)) {
                    visitedNodes.add(child.id);
                    descendantIds.add(child.id);
                    const fullChildNode = findNodeById(child.id) || child;
                    collectChildren(fullChildNode);
                }
            });
        };

        const rootNode = findNodeById(locId);
        if (rootNode) collectChildren(rootNode);
        return Array.from(descendantIds);
    },

    // 2. Mendapatkan Set ID child yang harus DISEMBUNYIKAN dari UI (karena parent-nya sudah dipilih)
    getImplicitHiddenLocationIds(providedDb = null) {
        const hiddenSet = new Set();
        this.state.selectedLocationIds.forEach(selectedId => {
            const descendantIds = this.getDescendantLocationIds(selectedId, providedDb);
            descendantIds.forEach(id => hiddenSet.add(id));
        });
        return hiddenSet;
    },

    // 3. Mendapatkan seluruh ID lokasi efektif (Parent + semua Child-nya) untuk dikirimkan ke AI
    getEffectiveSelectedLocationIds(providedDb = null) {
        const effectiveSet = new Set(this.state.selectedLocationIds);
        this.state.selectedLocationIds.forEach(selectedId => {
            const descendantIds = this.getDescendantLocationIds(selectedId, providedDb);
            descendantIds.forEach(id => effectiveSet.add(id));
        });
        return Array.from(effectiveSet);
    },
};