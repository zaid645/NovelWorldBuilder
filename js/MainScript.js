// --- DEFAULT TEMPLATE ---
const defaultData = {
    metadata: { version: "1.0.0", lastSaved: new Date().toISOString() },
    skillTags: [],
    skills: [],
    itemTags: [],
    items: [],
    familiarTags: [],
    familiars: [],
    arcs: [], // <--- Tambahan state global baru untuk Arc
    universes: [
        {
            id: "u1",
            name: "Bumi Alternate",
            description: "Bumi dengan sihir.",
            characters: {
                "Main Character": [
                    { id: "c1", name: "Budi", personality: "Pemberani", skillIds: ["sk1"], background: "Anak petani.", appearance: "Rambut hitam, mata coklat." }
                ],
                "Villain": []
            },
            locations: [
                { id: "l1", name: "Ibu Kota", description: "Pusat pemerintahan.", visuals: "Gedung-gedung tinggi bercahaya.", children: [] }
            ],
            // storylines lama masih dipertahankan di default hanya untuk referensi jika dibutuhkan, tapi kita gunakan 'arcs' global sekarang.
            storylines: [] 
        }
    ],
    storyInfo: {
        title: "",
        synopsis: "",
        worldBuilding: "",
        mainCharacters: []
    }
};

// ==========================================
// --- IMPORT MODUL KOMPONEN ---
// ==========================================

import { NovelBasicInfoModule } from './NovelBasicInfo.js';
import { SkillModule } from './FantasyComponent/Skill.js';
import { ItemModule } from './FantasyComponent/Item.js';
import { PetModule } from './FantasyComponent/Pet.js';
import { UniverseBasicModule } from './UniverseComponent/BasicUniverse.js';
import { UniverseCharacterModule } from './UniverseComponent/UniverseCharacter.js';
import { UniverseLocationModule } from './UniverseComponent/UniverseLocation.js';
import { UniverseArcModule } from './ArcInfo.js'; // <--- Modul Arc Diaktifkan

// ==========================================
// --- CORE APPLICATION LOGIC ---
// ==========================================
const coreApp = {
    // Data utama yang akan diolah
    data: null,

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

    init() {
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

    // --- DATA MANAGEMENT ---
    loadData() {
        const saved = localStorage.getItem('novelLoreData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.metadata && parsed.metadata.version) {
                    this.data = parsed;

                    // === MIGRASI DATA UNTUK VERSI BARU ===
                    if (!this.data.storyInfo) this.data.storyInfo = { title: "", synopsis: "", mainCharacters: [], worldBuilding: "" };
                    if (!this.data.storyInfo.title) this.data.storyInfo.title = "";
                    if (!this.data.storyInfo.synopsis) this.data.storyInfo.synopsis = "";
                    if (!this.data.storyInfo.mainCharacters) this.data.storyInfo.mainCharacters = [];
                    if (typeof this.data.storyInfo.worldBuilding === 'undefined') this.data.storyInfo.worldBuilding = "";

                    if (!this.data.skillTags || this.data.skillTags.length === 0) this.data.skillTags = this.data.tags || [];
                    if (!this.data.skills) this.data.skills = [];
                    if (!this.data.itemTags) this.data.itemTags = [];
                    if (!this.data.items) this.data.items = [];
                    if (!this.data.familiarTags) this.data.familiarTags = [];
                    if (!this.data.familiars) this.data.familiars = [];
                    
                    // --- MIGRASI ARC (Lini Cerita Global) ---
                    if (!this.data.arcs) {
                        this.data.arcs = [];
                        
                        // Migrasi otomatis: Jika ada save lama yang arc/storylines-nya masih terjebak di dalam semesta
                        if (this.data.universes) {
                            this.data.universes.forEach(u => {
                                if (u.storylines && u.storylines.length > 0) {
                                    // Pindahkan semua storyline ke array arcs global
                                    u.storylines.forEach(arc => {
                                        this.data.arcs.push(arc);
                                    });
                                    // Kosongkan dari semesta agar tidak double saat di-save ulang
                                    u.storylines = []; 
                                }
                            });
                        }
                    }

                    // === TAMBAHAN MIGRASI: Inisialisasi Array Dialog Karakter ===
                    if (this.data.universes) {
                        this.data.universes.forEach(u => {
                            if (u.characters) {
                                for (let category in u.characters) {
                                    if (Array.isArray(u.characters[category])) {
                                        u.characters[category].forEach(c => {
                                            // Jika file save lama belum punya array dialogues, buat baru
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
            } catch (e) { console.error("Format save lokal korup."); }
        }
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.saveData();
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

    // Router Utama - Meneruskan tugas render ke modul-modul lain yang digabungkan
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
            titleEl.innerText = "Manajemen Skill & Kategori";
            if (typeof this.renderSkillsView === 'function') {
                contentArea.innerHTML = this.renderSkillsView();
                this.renderSkillGrid(); 
            }
        } else if (viewId === 'items') {
            titleEl.innerText = "Manajemen Item & Tag Item";
            if (typeof this.renderItemsView === 'function') {
                contentArea.innerHTML = this.renderItemsView();
                this.renderItemGrid(); 
            }
        } else if (viewId === 'familiars') { 
            titleEl.innerText = "Manajemen Familiar & Pet";
            if (typeof this.renderFamiliarsView === 'function') {
                contentArea.innerHTML = this.renderFamiliarsView();
                this.renderFamiliarGrid(); 
            }
        } else if (viewId === 'arcs') {
            titleEl.innerText = "Manajemen Lini Cerita (Arc)";
            if (typeof this.renderArcsView === 'function') {
                contentArea.innerHTML = this.renderArcsView();
                this.renderArcGrid(); 
            }
        } else { 
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
                if (!this.data.storyInfo) {
                    this.data.storyInfo = { title: "", synopsis: "", mainCharacters: [] };
                }
                this.saveData();
                this.init();
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
        `;

        const fantasyMenuList = document.getElementById('fantasyMenuList');
        fantasyMenuList.innerHTML = `
            <button onclick="app.switchView('skills')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'skills' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Skills & Tags
            </button>
            <button onclick="app.switchView('items')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'items' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Manajemen Item
            </button>
            <button onclick="app.switchView('familiars')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'familiars' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                <svg class="w-4 h-4 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                Familiar & Pet
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
    
    SkillModule,
    ItemModule,
    PetModule,
    UniverseBasicModule,
    UniverseCharacterModule,
    UniverseLocationModule,
    UniverseArcModule // <--- Modul Arc digabungkan di sini
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