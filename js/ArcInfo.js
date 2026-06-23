/**
 * UniverseArcModule
 * Mengelola informasi lini cerita (Arc) dan sub-bab secara global 
 * di halaman tersendiri, setingkat dengan Skill, Item, dan Familiar.
 */
export const UniverseArcModule = {
    // State internal untuk manajemen penulisan/pengeditan data
    editArcId: null,
    editSubarcId: null,

    // =========================================
    // --- RENDER VIEW UTAMA (VIEW LAYOUT) ---
    // =========================================
    renderArcsView() {
        if (!this.data.arcs) this.data.arcs = [];

        return `
            <div class="flex flex-col gap-6">
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col gap-3 shadow-md">
                    <div class="relative w-full">
                        <input type="text" id="arcSearchInput" placeholder="Cari arc atau subarc..." 
                            class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 pl-10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            oninput="app.refreshArcList()">
                        <svg class="w-4 h-4 absolute left-3 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    
                    <div class="flex justify-start">
                        <button onclick="app.exportArcsData()" class="w-full md:w-auto bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 px-4 py-2 rounded text-xs transition font-medium flex items-center justify-center gap-2">
                            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Export Data Lini Cerita (Arc)
                        </button>
                    </div>
                </div>

                <div id="addArcForm" class="hidden bg-slate-800 border border-slate-700 p-4 rounded-lg space-y-3 shadow-lg">
                    <h3 id="arcFormTitle" class="text-sm font-bold text-slate-200">Buat Arc Cerita Baru</h3>
                    <input type="text" id="newArcName" placeholder="Nama Arc Cerita" class="bg-slate-900 border border-slate-700 rounded p-2 text-sm w-full focus:outline-none focus:border-indigo-500">
                    <textarea id="newArcSyn" placeholder="Sinopsis Singkat Arc" class="bg-slate-900 border border-slate-700 rounded p-2 text-sm w-full focus:outline-none focus:border-indigo-500" rows="3"></textarea>
                    <div class="flex justify-end space-x-2">
                        <button onclick="app.setPanelState('addArcForm', false)" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition">Batal</button>
                        <button id="saveArcBtn" onclick="app.saveArc()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition">Simpan Arc</button>
                    </div>
                </div>

                <div id="arcListContainer" class="space-y-4">
                    ${this.renderArcList('')}
                </div>
            </div>
        `;
    },

    // =========================================
    // --- RENDER DAFTAR KARTU DATA ARC ---
    // =========================================
    renderArcList(query = '') {
        if (!this.data.arcs) this.data.arcs = [];
        const q = query.toLowerCase().trim();

        // Penyaringan berdasarkan pencarian input
        const filteredArcs = this.data.arcs.filter(arc => {
            const matchArc = arc.name.toLowerCase().includes(q) || (arc.synopsis || '').toLowerCase().includes(q);
            const matchSub = arc.subarcs && arc.subarcs.some(sub => sub.name.toLowerCase().includes(q) || (sub.description || '').toLowerCase().includes(q));
            return matchArc || matchSub;
        });

        if (filteredArcs.length === 0) {
            return `
                <p class="text-sm text-slate-500 italic text-center py-8 bg-slate-800/30 rounded-lg border border-slate-800">Tidak ada data arc cerita yang ditemukan.</p>
                <button onclick="app.openAddArc()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition mt-3 flex items-center justify-center gap-1 shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    + Tambah Arc Baru
                </button>
            `;
        }

        // Render struktur list berdasarkan kalkulasi array
        let html = filteredArcs.map((arc, index) => {
            // Pembuatan Nomor Urut Berdasarkan Posisi Array Saat Load (Mulai dari 1)
            const arcNumber = index + 1;
            const panelClass = this.getPanelClass(`arcContent_${arc.id}`, 'hidden');

            const subarcsHTML = (!arc.subarcs || arc.subarcs.length === 0) 
                ? '<p class="text-xs text-slate-500 italic p-1">Belum ada data sub-bab di arc ini.</p>' 
                : arc.subarcs.map((sub, sIndex) => `
                    <div class="bg-slate-900 border-l-2 border-amber-500 p-2.5 pl-3 relative group/sub rounded">
                        <div class="absolute top-2.5 right-2 flex space-x-1 opacity-0 group-hover/sub:opacity-100 transition">
                            <button onclick="app.openEditSubarc('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400" title="Edit Subarc">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onclick="app.deleteSubarc('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-rose-500 text-sm font-bold leading-none px-1" title="Hapus Subarc">
                                &times;
                            </button>
                        </div>
                        <h5 class="text-xs font-bold text-amber-400 mb-0.5">${sIndex + 1}. ${sub.name}</h5>
                        <p class="text-[11px] text-slate-300 whitespace-pre-wrap">${sub.description || '-'}</p>
                    </div>
                `).join('');

            return `
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-md">
                    <div class="p-3 bg-slate-700/30 flex justify-between items-center cursor-pointer select-none hover:bg-slate-700/50 transition" 
                         onclick="app.togglePanel('arcContent_${arc.id}')">
                        <div class="flex items-center space-x-2.5">
                            <span class="bg-indigo-950 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded border border-indigo-800/80">#${arcNumber}</span>
                            <h4 class="font-bold text-slate-200 text-sm md:text-base">${arc.name}</h4>
                        </div>
                        <div class="flex items-center space-x-3" onclick="event.stopPropagation()">
                            <button onclick="app.openEditArc('${arc.id}')" class="text-slate-400 hover:text-indigo-400 transition" title="Edit Judul/Sinopsis Arc">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onclick="app.deleteArc('${arc.id}')" class="text-slate-400 hover:text-rose-500 transition" title="Hapus Keseluruhan Arc">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" onclick="app.togglePanel('arcContent_${arc.id}')">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>

                    <div id="arcContent_${arc.id}" class="p-4 space-y-4 border-t border-slate-700/60 ${panelClass}">
                        <div>
                            <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Sinopsis Global Arc:</span>
                            <p class="text-xs text-slate-300 whitespace-pre-wrap bg-slate-900/40 p-2.5 rounded border border-slate-700/40">${arc.synopsis || '<span class="italic text-slate-600">Belum ada ringkasan sinopsis untuk lini cerita ini.</span>'}</p>
                        </div>

                        <div class="border-t border-slate-700/60 pt-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Daftar Sub-Bab / Plot Detail (${arc.subarcs ? arc.subarcs.length : 0}):</span>
                                <button onclick="app.openAddSubarc('${arc.id}')" class="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 shadow">
                                    + Tambah Subarc
                                </button>
                            </div>

                            <div id="subarcForm_${arc.id}" class="hidden bg-slate-900 p-3 rounded border border-slate-700 mb-3 space-y-2 shadow-inner">
                                <h5 id="subarcFormTitle_${arc.id}" class="text-xs font-bold text-slate-300">Tambah Sub-Bab</h5>
                                <input type="text" id="newSubarcName_${arc.id}" placeholder="Nama Sub-Bab (cth: 'Pertemuan Pertama')" class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full focus:outline-none focus:border-amber-500">
                                <textarea id="newSubarcDesc_${arc.id}" placeholder="Rincian alur runtutan kejadian..." class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full focus:outline-none focus:border-amber-500" rows="3"></textarea>
                                <div class="flex justify-end space-x-1.5">
                                    <button onclick="app.setPanelState('subarcForm_${arc.id}', false)" class="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] transition">Batal</button>
                                    <button id="saveSubarcBtn_${arc.id}" onclick="app.saveSubarc('${arc.id}')" class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] transition">Simpan</button>
                                </div>
                            </div>

                            <div class="space-y-2">
                                ${subarcsHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // MODIFIKASI: Tombol tambah Arc diposisikan paling bawah, berukuran penuh memanjang lebar layar (w-full)
        html += `
            <button onclick="app.openAddArc()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition mt-2 flex items-center justify-center gap-1.5 shadow-lg border border-indigo-700/50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                + Tambah Arc Baru
            </button>
        `;

        return html;
    },

    // =========================================
    // --- MANAJEMEN DATA OPERASI ARC (CRUD) ---
    // =========================================
    openAddArc() {
        this.editArcId = null;
        this.setPanelState('addArcForm', true);
        document.getElementById('arcFormTitle').innerText = "Buat Arc Cerita Baru";
        document.getElementById('saveArcBtn').innerText = "Simpan Arc";
        document.getElementById('newArcName').value = '';
        document.getElementById('newArcSyn').value = '';
        
        document.getElementById('addArcForm').scrollIntoView({ behavior: 'smooth' });
    },

    openEditArc(arcId) {
        if (!this.data.arcs) return;
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) return;

        this.editArcId = arcId;
        this.setPanelState('addArcForm', true);
        document.getElementById('arcFormTitle').innerText = `Edit Arc: ${arc.name}`;
        document.getElementById('saveArcBtn').innerText = "Update Arc";

        document.getElementById('newArcName').value = arc.name;
        document.getElementById('newArcSyn').value = arc.synopsis || '';
        
        document.getElementById('addArcForm').scrollIntoView({ behavior: 'smooth' });
    },

    saveArc() {
        if (!this.data.arcs) this.data.arcs = [];
        
        const name = document.getElementById('newArcName').value.trim();
        if (!name) return alert("Nama Arc tidak boleh dibiarkan kosong.");
        
        const synopsis = document.getElementById('newArcSyn').value.trim();

        if (this.editArcId === null) {
            const newArc = {
                id: this.generateId('arc'),
                name: name,
                synopsis: synopsis,
                subarcs: []
            };
            this.data.arcs.push(newArc);
        } else {
            const arc = this.data.arcs.find(a => a.id === this.editArcId);
            if (arc) {
                arc.name = name;
                arc.synopsis = synopsis;
            }
        }

        this.saveData();
        this.setPanelState('addArcForm', false);
        this.refreshArcList();
    },

    deleteArc(arcId) {
        if (!confirm("Apakah Anda yakin ingin menghapus Arc ini beserta seluruh sub-bab di dalamnya?")) return;
        this.data.arcs = this.data.arcs.filter(a => a.id !== arcId);
        this.saveData();
        this.refreshArcList();
    },

    // =========================================
    // --- MANAJEMEN SUB-BAB / SUBARC ---
    // =========================================
    openAddSubarc(arcId) {
        this.editSubarcId = null;
        this.setPanelState(`subarcForm_${arcId}`, true);
        document.getElementById(`subarcFormTitle_${arcId}`).innerText = "Tambah Sub-Bab";
        document.getElementById(`saveSubarcBtn_${arcId}`).innerText = "Simpan";
        document.getElementById(`newSubarcName_${arcId}`).value = '';
        document.getElementById(`newSubarcDesc_${arcId}`).value = '';
    },

    openEditSubarc(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;
        const sub = arc.subarcs.find(s => s.id === subarcId);
        if (!sub) return;

        this.editSubarcId = subarcId;
        this.setPanelState(`subarcForm_${arcId}`, true);
        document.getElementById(`subarcFormTitle_${arcId}`).innerText = "Edit Sub-Bab";
        document.getElementById(`saveSubarcBtn_${arcId}`).innerText = "Update";
        document.getElementById(`newSubarcName_${arcId}`).value = sub.name;
        document.getElementById(`newSubarcDesc_${arcId}`).value = sub.description || '';
    },

    saveSubarc(arcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) return;
        if (!arc.subarcs) arc.subarcs = [];

        const name = document.getElementById(`newSubarcName_${arcId}`).value.trim();
        if (!name) return alert("Nama sub-bab wajib diisi.");
        const description = document.getElementById(`newSubarcDesc_${arcId}`).value.trim();

        if (this.editSubarcId === null) {
            const newSub = {
                id: this.generateId('sub'),
                name: name,
                description: description
            };
            arc.subarcs.push(newSub);
        } else {
            const sub = arc.subarcs.find(s => s.id === this.editSubarcId);
            if (sub) {
                sub.name = name;
                sub.description = description;
            }
        }

        this.saveData();
        this.setPanelState(`subarcForm_${arcId}`, false);
        this.refreshArcList();
    },

    deleteSubarc(arcId, subarcId) {
        if (!confirm("Hapus sub-bab ini?")) return;
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (arc && arc.subarcs) {
            arc.subarcs = arc.subarcs.filter(s => s.id !== subarcId);
            this.saveData();
            this.refreshArcList();
        }
    },

    // SINKRONISASI DINAMIS SISI KLIEN
    refreshArcList() {
        const container = document.getElementById('arcListContainer');
        const searchInput = document.getElementById('arcSearchInput');
        const query = searchInput ? searchInput.value : '';
        if (container) {
            container.innerHTML = this.renderArcList(query);
        }
    },

    exportArcsData() {
        if (!this.data.arcs || this.data.arcs.length === 0) {
            return alert("Tidak ada data arc cerita yang dapat diexport.");
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data.arcs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `arcs_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
};