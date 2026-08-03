// ==========================================
// --- IMPORT MODUL KOMPONEN ---
// ==========================================

import { Dexie } from 'https://unpkg.com/dexie@latest/dist/modern/dexie.mjs';

import { NovelBasicInfoModule } from './HeaderMenu/NovelBasicInfo.js';
import { ArcInfoModule } from './HeaderMenu/ArcInfo/ArcInfo.js';
import { DataSharingModule } from './HeaderMenu/DataSharing.js';
import { AIEnchanterModule } from './HeaderMenu/AIEnchanter.js';
import { WatakListModule } from './HeaderMenu/WatakList.js';
import { SkillModule } from './FantasyComponent/Skill/Skill.js';
import { ItemModule } from './FantasyComponent/Item/Item.js';
import { PetModule } from './FantasyComponent/Pet/Pet.js';
import { UniverseBasicModule } from './UniverseComponent/BasicUniverse/BasicUniverse.js';
import { UniverseLoreModule } from './UniverseComponent/UniverseLore.js';
import { UniverseCharacterModule } from './UniverseComponent/UniverseCharacter/UniverseCharacter.js';
import { UniverseMonsterModule } from './UniverseComponent/UniverseMonster/UniverseMonster.js';
import { UniverseLocationModule } from './UniverseComponent/UniverseLocation/UniverseLocation.js';
import { CustomModal } from './CustomModal.js';

// ==========================================
// --- INISIALISASI INDEXED DB ---
// ==========================================
const db = new Dexie('NovelLoreDB');

// Naikkan versi ke 2 untuk memperbarui skema
db.version(2).stores({
    keyval: 'key', 
    
    // Tambahkan index 'order' di samping 'id'
    universes: 'id, order',
    arcs: 'id, order',
    skills: 'id, order',
    items: 'id, order',
    familiars: 'id, order'
});

// ==========================================
// --- CORE APPLICATION LOGIC ---
// ==========================================
const coreApp = {
    // Data utama yang akan diolah
    data: null,
    defaultData: null, // Data default dari DefaultData.json

    // State edit yang sedang aktif (untuk modal atau panel edit)
    editCharId: null,
    editSkillId: null,
    currentSkillFilter: null,
    editItemId: null,
    currentItemFilter: null,
    editFamiliarId: null,
    currentFamiliarFilter: null,
    editArcId: null,       
    editSubArcId: null,

    // State halaman yang sedang ditampilkan
    currentView: 'story-info', 

    // State panel yang terbuka/tertutup
    panelStates: new Map(),
    
    getPanelClass(panelId, defaultState = 'hidden') {
        const state = this.panelStates.get(panelId);
        if (state === 'open') return '';
        if (state === 'closed') return 'hidden';
        return defaultState === 'hidden' ? 'hidden' : '';
    },

    setPanelState(panelId, isOpen) {
        this.panelStates.set(panelId, isOpen ? 'open' : 'closed');
        const el = document.getElementById(panelId);
        if (el) {
            if (isOpen) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    },

    async init() {
        // Tahan render sampai default data berhasil diambil
        await this.loadDefaultData();
        
        // Memuat database (Migrasi atau Load reguler)
        await this.loadData();
        
        this.setupAutoSave();
        this.renderSidebar();
        
        // Langsung arahkan tampilan pertama ke Informasi Dasar
        this.switchView('story-info'); 
        
        // Memastikan sidebar terbuka rapi pada resolusi komputer saat awal muat
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth >= 640) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.style.marginLeft = '0px';
        }
        
        // Tombol penutup sidebar khusus mode mobile
        document.getElementById('closeSidebarBtn').addEventListener('click', () => this.toggleSidebar(false));
        
        this.setupShortcuts();
    },

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

                // Aggregate semua tabel menjadi 1 objek
                this.data = {
                    metadata: kvMetadata ? kvMetadata.value : this.defaultData.metadata,
                    storyInfo: kvStoryInfo ? kvStoryInfo.value : this.defaultData.storyInfo,
                    watakList: kvWatakList ? kvWatakList.value : this.defaultData.watakList,
                    skillTags: kvSkillTags ? kvSkillTags.value : this.defaultData.skillTags,
                    itemTags: kvItemTags ? kvItemTags.value : this.defaultData.itemTags,
                    familiarTags: kvFamiliarTags ? kvFamiliarTags.value : this.defaultData.familiarTags,
                    
                    // Ambil data yang sudah terurut berdasarkan indeks 'order'
                    universes: await db.universes.orderBy('order').toArray(),
                    arcs:      await db.arcs.orderBy('order').toArray(),
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
            await db.transaction('rw', [db.keyval, db.universes, db.arcs, db.skills, db.items, db.familiars], async () => {
                
                // 1. Simpan KeyVal Items
                await db.keyval.put({ key: 'metadata', value: this.data.metadata });
                await db.keyval.put({ key: 'storyInfo', value: this.data.storyInfo });
                await db.keyval.put({ key: 'watakList', value: this.data.watakList });
                await db.keyval.put({ key: 'skillTags', value: this.data.skillTags });
                await db.keyval.put({ key: 'itemTags', value: this.data.itemTags });
                await db.keyval.put({ key: 'familiarTags', value: this.data.familiarTags });

                // Helper untuk menambahkan properti 'order' sesuai urutan Array saat ini
                const mapWithOrder = (arr) => (arr || []).map((item, index) => ({ ...item, order: index }));

                // 2. Simpan Array Kompleks beserta posisi urutannya
                await db.universes.clear(); await db.universes.bulkAdd(mapWithOrder(this.data.universes));
                await db.arcs.clear();      await db.arcs.bulkAdd(mapWithOrder(this.data.arcs));
                await db.skills.clear();    await db.skills.bulkAdd(mapWithOrder(this.data.skills));
                await db.items.clear();     await db.items.bulkAdd(mapWithOrder(this.data.items));
                await db.familiars.clear(); await db.familiars.bulkAdd(mapWithOrder(this.data.familiars));
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
    },

    // --- UI CONTROLS ---
    toggleSidebar(forceState) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const isMobile = window.innerWidth < 640;

        sidebar.style.transition = 'margin-left 0.3s ease-in-out, transform 0.3s ease-in-out';

        if (isMobile) {
            sidebar.style.marginLeft = '0px';
            const isHidden = sidebar.classList.contains('-translate-x-full');
            const toShow = forceState !== undefined ? forceState : isHidden;

            if (toShow) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        } else {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.add('hidden');
            const isCollapsed = sidebar.style.marginLeft === '-16rem';
            const toShow = forceState !== undefined ? forceState : isCollapsed;

            if (toShow) {
                sidebar.style.marginLeft = '0px'; 
            } else {
                sidebar.style.marginLeft = '-16rem'; 
            }
        }
    },

    // Router Utama
    switchView(viewId) {
        if (this.currentView !== viewId) {
            this.panelStates.clear();
        }
        
        this.currentView = viewId; 
        this.renderSidebar();  
        const titleEl = document.getElementById('currentViewTitle');
        const contentArea = document.getElementById('contentArea'); 
        
        if (viewId === 'story-info') {
            titleEl.innerText = "Informasi Dasar Cerita";
            if (typeof this.renderStoryInfo === 'function') {
                contentArea.innerHTML = this.renderStoryInfo();
            }
        } else if (viewId === 'skills') {
            titleEl.innerText = "Manajemen Skill";
            if (typeof this.renderSkillsView === 'function') {
                contentArea.innerHTML = this.renderSkillsView();
                this.renderSkillGrid(); 
            }
        } else if (viewId === 'items') {
            titleEl.innerText = "Manajemen Item";
            if (typeof this.renderItemsView === 'function') {
                contentArea.innerHTML = this.renderItemsView();
                this.renderItemGrid(); 
            }
        } else if (viewId === 'familiars') { 
            titleEl.innerText = "Manajemen Familiar";
            if (typeof this.renderFamiliarsView === 'function') {
                contentArea.innerHTML = this.renderFamiliarsView();
                this.renderFamiliarGrid(); 
            }
        } else if (viewId === 'arcs') {
            titleEl.innerText = "Manajemen Lini Cerita (Arc)";
            if (typeof this.renderArcsView === 'function') {
                contentArea.innerHTML = this.renderArcsView();
            }
        } else if (viewId === 'ai-enchanter') {
            titleEl.innerText = "Integrasi AI Novel Enchanter & Settings";
            if (typeof this.renderAIEnchanterView === 'function') {
                contentArea.innerHTML = this.renderAIEnchanterView();
            }
        } else if (viewId === 'watak') {
            titleEl.innerText = "Master Daftar Watak Karakter";
            if (typeof this.renderWatakView === 'function') {
                contentArea.innerHTML = this.renderWatakView();
            }
        } else if (viewId === 'sharing') {
            titleEl.innerText = "Kirim / Terima Data Lokal P2P";
            if (typeof this.renderSharingView === 'function') {
                contentArea.innerHTML = this.renderSharingView();
            }
        }
        else { 
            const univ = this.data.universes.find(u => u.id === viewId);
            if (univ) {
                titleEl.innerText = `Semesta: ${univ.name}`;
                if (typeof this.renderUniverseView === 'function') {
                    contentArea.innerHTML = this.renderUniverseView(univ); 
                }
            }
        }
        
        if (window.innerWidth < 640) {
            this.toggleSidebar(false);
        }
    },

    togglePanel(panelId) {
        const el = document.getElementById(panelId);
        if (!el) return;
        const willOpen = el.classList.contains('hidden');
        this.setPanelState(panelId, willOpen);
    },

    showAlert(msg, type = 'info') {
        const banner = document.getElementById('alertBanner');
        banner.innerText = msg;
        banner.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg transition-opacity duration-300 z-50 ${type === 'error' ? 'bg-rose-600' : (type === 'warning' ? 'bg-yellow-600' : 'bg-emerald-600')} text-white`;
        banner.classList.remove('opacity-0');
        
        setTimeout(() => {
            banner.classList.add('opacity-0');
        }, 3000);
    },

    // --- IMPORT / EXPORT UTAMA ---
    async importMaster(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        // Jadikan async agar bisa menunggu saveData
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json.metadata || !json.metadata.version) {
                    throw new Error("Format tidak valid (Metadata hilang).");
                }
                this.data = json;
                
                this.ensureStructure(this.data, this.defaultData);
                
                // Simpan langsung ke IndexedDB dengan menimpa data lama
                await this.saveData();
                
                this.switchView('story-info'); 
                this.renderSidebar();
                
                this.showAlert("Data Master berhasil dimuat ke Database!", "success");
            } catch (err) {
                this.showAlert("Gagal memuat file: " + err.message, "error");
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    },

    downloadJSON(filename, dataObj) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", filename);
        dlAnchorElem.click();
    },

    exportMaster() {
        this.downloadJSON("NovelLore_Master.json", this.data);
    },

    exportUniverseInfo() {
        const info = this.data.universes.map(u => ({ id: u.id, name: u.name, description: u.description }));
        this.downloadJSON("Semesta_Info.json", { universes: info });
    },

    // --- RENDER MENU UTAMA (Layouting Core) ---
    renderSidebar() {
        const mainMenuList = document.getElementById('mainMenuList');
        mainMenuList.innerHTML = `
            <button onclick="app.switchView('story-info')" class="w-full text-left px-3 py-2 rounded text-sm flex items-center space-x-2 transition mb-1 ${this.currentView === 'story-info' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                <span>Informasi Dasar</span>
            </button>
            <button onclick="app.switchView('arcs')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'arcs' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                Manajemen Arc Cerita
            </button>
            <button onclick="app.switchView('ai-enchanter')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'ai-enchanter' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4M4 19h4m12-7v4m-2-2h4m-5.5-5.5l-3 3m0 0l-3-3m3 3v6m0-6h6"></path>
                </svg>
                AI Novel Enchanter
            </button>
            <button onclick="app.switchView('sharing')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'sharing' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <span>📡</span>&nbsp;&nbsp;Kirim / Terima Data
            </button>
            <button onclick="app.switchView('watak')" id="menu-watak" class="w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🎭</span> Master Watak
            </button>
        `;

        const fantasyMenuList = document.getElementById('fantasyMenuList');
        fantasyMenuList.innerHTML = `
            <button onclick="app.switchView('skills')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'skills' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Skills
            </button>
            <button onclick="app.switchView('items')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'items' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Item
            </button>
            <button onclick="app.switchView('familiars')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'familiars' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                Familiar
            </button>
        `;

        const list = document.getElementById('universeList');
        list.innerHTML = this.data.universes.map((u, index) => `
            <div class="flex items-center w-full rounded transition text-sm ${this.currentView === u.id ? 'bg-indigo-600 text-white font-medium' : 'hover:bg-slate-700 text-slate-300'}">
                <button onclick="app.switchView('${u.id}')" class="flex-1 text-left px-3 py-2 truncate">
                    ${u.name}
                </button>
                ${index > 0 ? `
                <button onclick="app.moveUniverseUp(${index})" class="px-2 py-2 text-slate-400 hover:text-white" title="Naikkan Urutan">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                </button>
                ` : '<div class="w-8"></div>'}
            </div>
        `).join('');
    }
};

// ==========================================
// --- MERGE / PENGGABUNGAN ---
// ==========================================
window.app = Object.assign(
    {}, 
    coreApp,
    CustomModal,

    NovelBasicInfoModule,
    ArcInfoModule,
    AIEnchanterModule,
    WatakListModule,
    DataSharingModule,
    
    SkillModule,
    ItemModule,
    PetModule,
    UniverseBasicModule,
    UniverseLoreModule,
    UniverseCharacterModule,
    UniverseMonsterModule,
    UniverseLocationModule
);

// Event Listeners Global
document.addEventListener('click', (e) => {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.add('hidden');
    }
});

// Initialize App saat DOM siap
window.onload = async () => {
    await window.app.init();
};
