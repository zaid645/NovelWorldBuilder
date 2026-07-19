// ==========================================
// --- IMPORT MODUL KOMPONEN ---
// ==========================================

import { NovelBasicInfoModule } from './HeaderMenu/NovelBasicInfo.js';
import { UniverseArcModule } from './HeaderMenu/ArcInfo.js';
import { DataSharingModule } from './HeaderMenu/DataSharing.js';
import { AIEnchanterModule } from './HeaderMenu/AIEnchanter.js';
import { WatakListModule } from './HeaderMenu/WatakList.js';
import { SkillModule } from './FantasyComponent/Skill.js';
import { ItemModule } from './FantasyComponent/Item.js';
import { PetModule } from './FantasyComponent/Pet.js';
import { UniverseBasicModule } from './UniverseComponent/BasicUniverse.js';
import { UniverseLoreModule } from './UniverseComponent/UniverseLore.js';
import { UniverseCharacterModule } from './UniverseComponent/UniverseCharacter.js';
import { UniverseMonsterModule } from './UniverseComponent/UniverseMonster.js';
import { UniverseLocationModule } from './UniverseComponent/UniverseLocation.js';

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
    editItemId: null,
    editFamiliarId: null,
    editLocationId: null,  
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
        
        this.loadData();
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
            // Menggunakan import.meta.url agar path-nya selalu relatif terhadap letak MainScript.js ini
            const jsonUrl = new URL('./DefaultData.json', import.meta.url);
            const response = await fetch(jsonUrl);
            
            if (!response.ok) throw new Error("Gagal mengambil file JSON");
            this.defaultData = await response.json();
        } catch (error) {
            console.error("Gagal memuat DefaultData.json. Pastikan Anda menjalankan aplikasi via lokal server (misal: Live Server) dan file json ada di folder yang sama.", error);
            // Fallback minimal agar aplikasi tidak hancur lebur
            this.defaultData = { metadata: { version: "1.0.0" } };
        }
    },

    // --- FUNGSI RESET DATA ---
    resetData() {
        if (confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini akan menghapus data yang tersimpan dan mengembalikannya ke pengaturan awal.")) {
            // Mengembalikan data ke kondisi default menggunakan deep copy dari defaultData
            this.data = JSON.parse(JSON.stringify(this.defaultData));
            
            // Menyimpan perubahan ke localStorage
            this.saveData(true);
            
            // Memperbarui antarmuka dan mengarahkan kembali ke halaman utama
            this.switchView('story-info');
            this.renderSidebar();
            
            this.showAlert("Data berhasil direset ke pengaturan awal.", "success");
        }
    },

    // --- LOGIKA PENGECEKAN STRUKTUR OTOMATIS ---
    // Deep check & inject: Jika kunci data belum ada di target (dari localStorage), 
    // ia akan disalin dari template (DefaultData.json).
    ensureStructure(target, template) {
        if (!template) return;
        
        for (const key in template) {
            // Jika cabang belum ada di data user
            if (target[key] === undefined) {
                const templateValue = template[key];
                
                // 1. Cek jika tipe datanya Array
                if (Array.isArray(templateValue)) {
                    target[key] = [];
                }
                // 2. Cek jika tipe datanya Objek murni (bukan null)
                else if (typeof templateValue === 'object' && templateValue !== null) {
                    target[key] = {};
                    this.ensureStructure(target[key], templateValue);
                }
                // 3. Cek jika tipe datanya String
                else if (typeof templateValue === 'string') {
                    target[key] = '';
                }
                // 4. Cek jika tipe datanya Number
                else if (typeof templateValue === 'number') {
                    target[key] = 0;
                }
                // 5. Cek jika tipe datanya Boolean
                else if (typeof templateValue === 'boolean') {
                    target[key] = false;
                }
                // Fallback untuk tipe data lainnya (null, dll)
                else {
                    target[key] = templateValue;
                }
            } 
            // Jika cabang sudah ada dan berupa Objek murni, masuk lebih dalam
            else if (typeof template[key] === 'object' && template[key] !== null && !Array.isArray(template[key])) {
                this.ensureStructure(target[key], template[key]);
            }
        }
    },

    // --- DATA MANAGEMENT ---
    loadData() {
        const saved = localStorage.getItem('novelLoreData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.metadata && parsed.metadata.version) {
                    this.data = parsed;

                    // ==============================================================
                    // MAGISNYA DI SINI: Pengecekan struktur cabang secara otomatis!
                    // Sekarang Anda bisa menambahkan variabel dan object sebanyak apapun
                    // di DefaultData.json, dan itu akan otomatis termigrasi tanpa membuat If baru.
                    // ==============================================================
                    this.ensureStructure(this.data, this.defaultData);

                    // --- MIGRASI KUSTOM & SPESIFIK (DIPERTAHANKAN) ---
                    // Logika spesifik untuk objek di dalam array dan perpindahan data
                    // tetap ditulis manual karena ensureStructure hanya mengurus cabang dasar.

                    // Migrasi Watak List dari local storage versi kuno
                    if (!this.data.watakList || this.data.watakList.length === 0) {
                        const oldWatak = localStorage.getItem('novel_watak_list_data');
                        if (oldWatak) {
                            try { this.data.watakList = JSON.parse(oldWatak); } 
                            catch (e) { this.data.watakList = [...(this.defaultData.watakList || [])]; }
                        }
                    }
                    
                    // Migrasi Arc Cerita (Lini Cerita yang keluar dari Universe)
                    if (this.data.universes) {
                        this.data.universes.forEach(u => {
                            if (u.storylines && u.storylines.length > 0) {
                                u.storylines.forEach(arc => this.data.arcs.push(arc));
                                u.storylines = []; 
                            }
                        });
                    }

                    // Injeksi/Pembersihan Properti Arc yang ada di Sub-Arc
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

                    // Injeksi array kosong untuk variabel di dalam Familiars dan Characters lama
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

                    this.updateLastSavedUI();
                    return;
                }
            } catch (e) { console.error("Format save lokal korup.", e); }
        }
        
        // Jika belum ada file save di local (pengguna pertama kali)
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.saveData(true);
    },

    saveData(silent = false) {
        this.data.metadata.lastSaved = new Date().toISOString();
        localStorage.setItem('novelLoreData', JSON.stringify(this.data));
        this.updateLastSavedUI();
        if (!silent) this.showAlert("Data berhasil disimpan.", "success");
    },

    setupAutoSave() {
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
    importMaster(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json.metadata || !json.metadata.version) {
                    throw new Error("Format tidak valid (Metadata hilang).");
                }
                this.data = json;
                
                // Pastikan struktur import langsung divalidasi juga
                this.ensureStructure(this.data, this.defaultData);
                
                this.saveData();
                
                // Refresh interface setelah import
                this.switchView('story-info'); 
                this.renderSidebar();
                
                this.showAlert("Data Master berhasil dimuat!", "success");
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
// Object.assign akan menyatukan `coreApp` dengan semua fitur dari file komponen
// menjadi satu objek besar yang disimpan di window.app
window.app = Object.assign(
    {}, 
    coreApp,
    NovelBasicInfoModule,
    UniverseArcModule,
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
window.onload = () => {
    window.app.init();
};