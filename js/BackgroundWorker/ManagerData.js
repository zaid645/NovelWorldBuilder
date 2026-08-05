// Save dan load data utama

// ==========================================
// --- INISIALISASI INDEXED DB ---
// ==========================================

import { Dexie } from 'https://unpkg.com/dexie@latest/dist/modern/dexie.mjs';

const db = new Dexie('NovelLoreDB');

// Naikkan versi ke 2 untuk memperbarui skema
db.version(3).stores({
    keyval: 'key', 
    
    // Tambahkan index 'order' di samping 'id'
    universes: 'id, order',
    arcs: 'id, order',
    races: 'id, order',
    skills: 'id, order',
    items: 'id, order',
    familiars: 'id, order'
});

export const ManagerData = {
    // --- FETCH DATA JSON EKSTERNAL ---
    async loadDefaultData() {
        try {
            const jsonUrl = new URL('./DefaultData.json', import.meta.url);
            const response = await fetch(jsonUrl);
            
            if (!response.ok) throw new Error("Gagal mengambil file JSON");
            this.defaultData = await response.json();
        } catch (error) {
            console.error("Gagal memuat DefaultData.json.", error);
            this.defaultData = { metadata: { version: "1.0.0" } };
        }
    },

    // --- FUNGSI RESET DATA ---
    async resetData() {
        if (confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini akan menghapus data yang tersimpan dan mengembalikannya ke pengaturan awal.")) {
            // Mengembalikan data ke kondisi default
            this.data = JSON.parse(JSON.stringify(this.defaultData));
            
            // Menyimpan perubahan ke database dengan metode clear
            await this.saveData(true);
            
            this.switchView('story-info');
            this.renderSidebar();
            
            this.showAlert("Data berhasil direset ke pengaturan awal.", "success");
        }
    },

    // --- LOGIKA PENGECEKAN STRUKTUR OTOMATIS ---
    ensureStructure(target, template) {
        if (!template) return;
        for (const key in template) {
            if (target[key] === undefined) {
                const templateValue = template[key];
                if (Array.isArray(templateValue)) {
                    target[key] = [];
                } else if (typeof templateValue === 'object' && templateValue !== null) {
                    target[key] = {};
                    this.ensureStructure(target[key], templateValue);
                } else if (typeof templateValue === 'string') {
                    target[key] = '';
                } else if (typeof templateValue === 'number') {
                    target[key] = 0;
                } else if (typeof templateValue === 'boolean') {
                    target[key] = false;
                } else {
                    target[key] = templateValue;
                }
            } else if (typeof template[key] === 'object' && template[key] !== null && !Array.isArray(template[key])) {
                this.ensureStructure(target[key], template[key]);
            }
        }
    },

    // --- DATA MANAGEMENT (IndexedDB & Migration) ---
    async loadData() {
        try {
            // Hitung data untuk melihat apakah IndexedDB kosong
            const universesCount = await db.universes.count();
            const keysCount = await db.keyval.count();

            if (universesCount === 0 && keysCount === 0) {
                // ---------------------------------------------------------
                // FASE 1: INDEXED DB KOSONG (Cari LocalStorage untuk Migrasi)
                // ---------------------------------------------------------
                const saved = localStorage.getItem('novelLoreData');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (parsed.metadata && parsed.metadata.version) {
                            this.data = parsed;
                            this.ensureStructure(this.data, this.defaultData);

                            // --- MIGRASI LAMA & KUSTOM (Dipertahankan) ---
                            if (!this.data.races) this.data.races = [];

                            if (!this.data.watakList || this.data.watakList.length === 0) {
                                const oldWatak = localStorage.getItem('novel_watak_list_data');
                                if (oldWatak) {
                                    try { this.data.watakList = JSON.parse(oldWatak); } 
                                    catch (e) { this.data.watakList = [...(this.defaultData.watakList || [])]; }
                                }
                            }
                            
                            if (this.data.universes) {
                                this.data.universes.forEach(u => {
                                    if (u.storylines && u.storylines.length > 0) {
                                        u.storylines.forEach(arc => this.data.arcs.push(arc));
                                        u.storylines = []; 
                                    }
                                });
                            }

                            if (this.data.arcs) {
                                this.data.arcs.forEach(arc => {
                                    if (typeof arc.targetSubarcCount === 'undefined') {
                                        arc.targetSubarcCount = (arc.subarcs && arc.subarcs.length > 0 && arc.subarcs[0].targetSubarcCount) 
                                            ? arc.subarcs[0].targetSubarcCount : 10;
                                    }
                                    if (typeof arc.universeId === 'undefined') {
                                        arc.universeId = (arc.subarcs && arc.subarcs.length > 0 && arc.subarcs[0].universeId) 
                                            ? arc.subarcs[0].universeId : '';
                                    }
                                    if (arc.subarcs) {
                                        arc.subarcs.forEach(sub => {
                                            delete sub.targetSubarcCount;
                                            delete sub.universeId;
                                        });
                                    }
                                });
                            }

                            if (this.data.familiars) {
                                this.data.familiars.forEach(fam => {
                                    if (fam.personality === undefined) fam.personality = ''; 
                                    if (!fam.dialogues) fam.dialogues = []; 
                                });
                            }

                            if (this.data.universes) {
                                this.data.universes.forEach(u => {
                                    if (typeof u.description === 'undefined') u.description = "";
                                    if (u.characters) {
                                        for (let category in u.characters) {
                                            if (Array.isArray(u.characters[category])) {
                                                u.characters[category].forEach(c => {
                                                    if (!c.dialogues) c.dialogues = [];
                                                });
                                            }
                                        }
                                    }
                                });
                            }

                            // Migrasi selesai, Simpan Permanen ke IndexedDB
                            await this.saveData(true);
                            // Opsional: hapus localstorage lama jika ingin bersih
                            // localStorage.removeItem('novelLoreData');
                            
                            this.updateLastSavedUI();
                            return;
                        }
                    } catch (e) { console.error("Format save lokal korup.", e); }
                }
                
                // Jika tidak ada data lama, gunakan DefaultData
                this.data = JSON.parse(JSON.stringify(this.defaultData));
                await this.saveData(true);
                this.updateLastSavedUI();

            } else {
                // ---------------------------------------------------------
                // FASE 2: INDEXED DB TERISI (Load dan Satukan menjadi `this.data`)
                // ---------------------------------------------------------
                
                // Ambil Data Tunggal/Tag dari KeyVal Store
                const kvMetadata = await db.keyval.get('metadata');
                const kvStoryInfo = await db.keyval.get('storyInfo');
                const kvWatakList = await db.keyval.get('watakList');
                const kvSkillTags = await db.keyval.get('skillTags');
                const kvItemTags = await db.keyval.get('itemTags');
                const kvFamiliarTags = await db.keyval.get('familiarTags');
                const kvWriterForm = await db.keyval.get('writerFormState');

                // Aggregate semua tabel menjadi 1 objek
                this.data = {
                    metadata: kvMetadata ? kvMetadata.value : this.defaultData.metadata,
                    storyInfo: kvStoryInfo ? kvStoryInfo.value : this.defaultData.storyInfo,
                    watakList: kvWatakList ? kvWatakList.value : this.defaultData.watakList,
                    skillTags: kvSkillTags ? kvSkillTags.value : this.defaultData.skillTags,
                    itemTags: kvItemTags ? kvItemTags.value : this.defaultData.itemTags,
                    familiarTags: kvFamiliarTags ? kvFamiliarTags.value : this.defaultData.familiarTags,
                    writerFormState: kvWriterForm ? kvWriterForm.value : null,
                    
                    // Ambil data yang sudah terurut berdasarkan indeks 'order'
                    universes: await db.universes.orderBy('order').toArray(),
                    arcs:      await db.arcs.orderBy('order').toArray(),
                    races:     await db.races.orderBy('order').toArray(),
                    skills:    await db.skills.orderBy('order').toArray(),
                    items:     await db.items.orderBy('order').toArray(),
                    familiars: await db.familiars.orderBy('order').toArray()
                };

                this.ensureStructure(this.data, this.defaultData);
                this.updateLastSavedUI();
            }

        } catch(e) {
            console.error("Gagal memuat dari IndexedDB:", e);
            this.showAlert("Gagal membaca database! Lihat konsole.", "error");
        }
    },

    async saveData(silent = false) {
        this.data.metadata.lastSaved = new Date().toISOString();

        try {
            await db.transaction('rw', [db.keyval, db.universes, db.arcs, db.skills, db.items, db.familiars, db.races], async () => {
                
                // 1. Simpan KeyVal Items
                await db.keyval.put({ key: 'metadata', value: this.data.metadata });
                await db.keyval.put({ key: 'storyInfo', value: this.data.storyInfo });
                await db.keyval.put({ key: 'watakList', value: this.data.watakList });
                await db.keyval.put({ key: 'skillTags', value: this.data.skillTags });
                await db.keyval.put({ key: 'itemTags', value: this.data.itemTags });
                await db.keyval.put({ key: 'familiarTags', value: this.data.familiarTags });
                if (this.data.writerFormState) {
                    await db.keyval.put({ key: 'writerFormState', value: this.data.writerFormState });
                }

                // Helper untuk menambahkan properti 'order' sesuai urutan Array saat ini
                const mapWithOrder = (arr) => (arr || []).map((item, index) => ({ ...item, order: index }));

                // 2. Simpan Array Kompleks beserta posisi urutannya
                await db.universes.clear(); await db.universes.bulkAdd(mapWithOrder(this.data.universes));
                await db.arcs.clear();      await db.arcs.bulkAdd(mapWithOrder(this.data.arcs));
                await db.skills.clear();    await db.skills.bulkAdd(mapWithOrder(this.data.skills));
                await db.items.clear();     await db.items.bulkAdd(mapWithOrder(this.data.items));
                await db.familiars.clear(); await db.familiars.bulkAdd(mapWithOrder(this.data.familiars));
                await db.races.clear();     await db.races.bulkAdd(mapWithOrder(this.data.races));
            });

            this.updateLastSavedUI();
            if (!silent) this.showAlert("Data berhasil disimpan.", "success");
            
        } catch (error) {
            console.error("Gagal menyimpan ke IndexedDB:", error);
            this.showAlert("Gagal menyimpan data!", "error");
        }
    },

    setupAutoSave() {
        // Karena proses async cepat, setInterval berjalan normal
        setInterval(() => this.saveData(true), 2 * 60 * 1000);
    },

    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveData();
            }
        });
    },

    generateId(prefix = 'id') {
        return prefix + '_' + Math.random().toString(36).substr(2, 9);
    },

    updateLastSavedUI() {
        const date = new Date(this.data.metadata.lastSaved);
        document.getElementById('lastSavedText').innerText = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
}