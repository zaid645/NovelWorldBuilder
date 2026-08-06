// Manipulasi UI basic

export const ManagerUiBasic = {

    // --- RENDER MENU UTAMA (Layouting Core) ---
    renderSidebar() {
        const mainMenuList = document.getElementById('mainMenuList');
        if (mainMenuList) {
            mainMenuList.innerHTML = `
                <!-- Informasi Dasar -->
                <button onclick="app.switchView('story-info')" class="w-full text-left px-3 py-2 rounded text-sm flex items-center space-x-2 transition mb-1 ${this.currentView === 'story-info' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>Informasi Dasar</span>
                </button>
            `;
        }

        const writeMenuList = document.getElementById('writeMenuList');
        if (writeMenuList) {
            writeMenuList.innerHTML = `
                <!-- Manajemen Arc Cerita -->
                <button onclick="app.switchView('arcs')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center mb-1 ${this.currentView === 'arcs' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>Manajemen Arc Cerita</span>
                </button>

                <!-- Manajemen Outline Cerita -->
                <button onclick="app.switchView('chapter-outline')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center mb-1 ${this.currentView === 'chapter-outline' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>Outline</span>
                </button>

                <!-- Tulis Novel AI (Pena/Pensil - Hijau) -->
                <button onclick="app.switchView('write-novel')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center mb-1 ${this.currentView === 'write-novel' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Tulis Novel AI</span>
                </button>
            `;
        }
        
        const settingMenuList = document.getElementById('settingMenuList');
        if (settingMenuList) {
            settingMenuList.innerHTML = `
                <!-- Master Watak (SVG Pengganti Emoji) -->
                <button onclick="app.switchView('watak')" id="menu-watak" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'watak' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Master Watak</span>
                </button>
                
                <!-- AI Novel Enchanter -->
                <button onclick="app.switchView('ai-enchanter')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center mb-1 ${this.currentView === 'ai-enchanter' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4M4 19h4m12-7v4m-2-2h4m-5.5-5.5l-3 3m0 0l-3-3m3 3v6m0-6h6"></path>
                    </svg>
                    <span>AI Novel Enchanter</span>
                </button>

                <!-- Kirim / Terima Data (SVG Pengganti Emoji) -->
                <button onclick="app.switchView('sharing')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center mb-1 ${this.currentView === 'sharing' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                    <span>Kirim / Terima Data</span>
                </button>
            `;
        }

        const fantasyMenuList = document.getElementById('fantasyMenuList');
        if (fantasyMenuList) {
            fantasyMenuList.innerHTML = `
                <!-- Ras (SVG Pengganti Emoji) -->
                <button onclick="app.switchView('races')" id="menu-races" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'races' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <span>Ras</span>
                </button>

                <!-- Skills -->
                <button onclick="app.switchView('skills')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'skills' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span>Skills</span>
                </button>

                <!-- Item -->
                <button onclick="app.switchView('items')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'items' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>Item</span>
                </button>

                <!-- Familiar -->
                <button onclick="app.switchView('familiars')" class="w-full text-left px-3 py-2 rounded transition text-sm flex items-center ${this.currentView === 'familiars' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}">
                    <svg class="w-4 h-4 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                    </svg>
                    <span>Familiar</span>
                </button>
            `;
        }

        const list = document.getElementById('universeList');
        if (list && this.data && Array.isArray(this.data.universes)) {
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
    },

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

    // --- UI CONTROLS ---
    toggleSidebar(forceState) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (!sidebar || !overlay) return;

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
        
        if (!titleEl || !contentArea) return;

        if (viewId === 'story-info') {
            titleEl.innerText = "Informasi Dasar Cerita";
            if (typeof this.renderStoryInfo === 'function') {
                contentArea.innerHTML = this.renderStoryInfo();
            }
        } else if (viewId === 'races') {
            titleEl.innerText = "Master Daftar Ras / Spesies";
            if (typeof this.renderRaceView === 'function') {
                contentArea.innerHTML = this.renderRaceView();
            }
        } else if (viewId === 'skills') {
            titleEl.innerText = "Manajemen Skill";
            if (typeof this.renderSkillsView === 'function') {
                contentArea.innerHTML = this.renderSkillsView();
                if (typeof this.renderSkillGrid === 'function') this.renderSkillGrid(); 
            }
        } else if (viewId === 'items') {
            titleEl.innerText = "Manajemen Item";
            if (typeof this.renderItemsView === 'function') {
                contentArea.innerHTML = this.renderItemsView();
                if (typeof this.renderItemGrid === 'function') this.renderItemGrid(); 
            }
        } else if (viewId === 'familiars') { 
            titleEl.innerText = "Manajemen Familiar";
            if (typeof this.renderFamiliarsView === 'function') {
                contentArea.innerHTML = this.renderFamiliarsView();
                if (typeof this.renderFamiliarGrid === 'function') this.renderFamiliarGrid(); 
            }
        } else if (viewId === 'arcs') {
            titleEl.innerText = "Manajemen Lini Cerita (Arc)";
            if (typeof this.renderArcsView === 'function') {
                contentArea.innerHTML = this.renderArcsView();
            }
        } else if (viewId === 'chapter-outline') {
            titleEl.innerText = "Outline Chapter";
            if (typeof this.renderArcsView === 'function') {
                contentArea.innerHTML = this.renderChapterOutline();
            }
        } else if (viewId === 'write-novel') {
            titleEl.innerText = "Tulis Novel";
            if (typeof this.renderNovelWriter === 'function') {
                contentArea.innerHTML = this.renderNovelWriter();
                window.app.initNovelWriter();
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
        } else { 
            if (this.data && Array.isArray(this.data.universes)) {
                const univ = this.data.universes.find(u => u.id === viewId);
                if (univ) {
                    titleEl.innerText = `Semesta: ${univ.name}`;
                    if (typeof this.renderUniverseView === 'function') {
                        contentArea.innerHTML = this.renderUniverseView(univ); 
                    }
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
        if (!banner) return;
        banner.innerText = msg;
        banner.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg transition-opacity duration-300 z-50 ${type === 'error' ? 'bg-rose-600' : (type === 'warning' ? 'bg-yellow-600' : 'bg-emerald-600')} text-white`;
        banner.classList.remove('opacity-0');
        
        setTimeout(() => {
            banner.classList.add('opacity-0');
        }, 3000);
    }
};