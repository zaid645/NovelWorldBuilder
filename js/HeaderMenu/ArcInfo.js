/**
 * UniverseArcModule
 * Mengelola informasi lini cerita (Arc) secara global dengan penambahan dan 
 * pengeditan sub-arc inline yang intuitif di bagian bawah, lengkap dengan integrasi AI Enchanter.
 */
export const UniverseArcModule = {
    // State internal untuk manajemen penulisan/pengeditan data
    editArcId: null,
    editSubarcId: null,
    
    // State tambahan untuk konfirmasi hapus interaktif (menghindari confirm() bawaan)
    deleteArcIdConfirm: null,
    deleteSubarcIdConfirm: null,

    // Helper untuk menampilkan notifikasi toast kustom yang elegan (menggantikan alert())
    showNotification(message, type = 'error') {
        if (typeof app !== 'undefined' && typeof app.showAlert === 'function') {
            app.showAlert(message, type);
        } else {
            // Fallback UI Notification Toast jika app.showAlert belum siap
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-10 opacity-0 ${
                type === 'success' 
                    ? 'bg-emerald-900/95 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/95 border-rose-500/50 text-rose-200'
            }`;
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
    // --- RENDER VIEW UTAMA (VIEW LAYOUT) ---
    // =========================================
    renderArcsView() {
        if (!this.data.arcs) this.data.arcs = [];

        return `
            <div class="flex flex-col gap-6">
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col gap-3 shadow-md">
                    <div class="relative w-full">
                        <input type="text" id="arcSearchInput" placeholder="Cari arc atau sub-arc..." 
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
                    <div class="flex justify-between items-center mb-1">
                        <h3 id="arcFormTitle" class="text-sm font-bold text-slate-200">Buat Arc Cerita Baru</h3>
                        <button id="btnEnchantArc" onclick="app.enchantArcForm()" class="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                            ✨ Enchant Sinopsis
                        </button>
                    </div>
                    
                    <div class="flex gap-2 mb-1">
                        <select id="newArcUniverse" class="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                            <option value="">-- Pilih Latar Semesta --</option>
                            ${this.data.universes ? this.data.universes.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : ''}
                        </select>
                        <input type="number" id="newArcTarget" placeholder="Target Sub-arc" class="w-1/3 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" min="1" title="Target Jumlah Total Sub-arc">
                    </div>

                    <input type="text" id="newArcName" placeholder="Nama Arc Cerita" class="bg-slate-900 border border-slate-700 rounded p-2 text-sm w-full focus:outline-none focus:border-indigo-500">
                    <textarea id="newArcSyn" placeholder="Sinopsis Singkat Arc" class="bg-slate-900 border border-slate-700 rounded p-2 text-sm w-full focus:outline-none focus:border-indigo-500" rows="7"></textarea>
                    
                    <div class="flex justify-end space-x-2 mt-2">
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

    // Helper: Mendapatkan Nama Universe untuk Badge
    getUniverseName(universeId) {
        if (!this.data.universes || !universeId) return 'Tanpa Latar';
        const u = this.data.universes.find(u => u.id === universeId);
        return u ? u.name : 'Unknown';
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
                    + Tambah Arc Baru
                </button>
            `;
        }

        // Render struktur list berdasarkan kalkulasi array
        let html = filteredArcs.map((arc, index) => {
            const arcNumber = index + 1;
            const panelClass = this.getPanelClass(`arcContent_${arc.id}`, 'hidden');

            const subarcsHTML = (!arc.subarcs || arc.subarcs.length === 0) 
                ? '<p class="text-xs text-slate-500 italic p-1">Belum ada data sub-arc di arc ini.</p>' 
                : arc.subarcs.map((sub, sIndex) => {
                    const subarcPacing = `<span class="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded ml-1 border border-slate-600">Sub-arc ${sIndex + 1}/${arc.targetSubarcCount || '?'}</span>`;
                    const isFirst = sIndex === 0;
                    const isLast = sIndex === arc.subarcs.length - 1;

                    // Jika sedang dalam mode edit sub-arc, langsung tampilkan Editor Inline di posisinya
                    if (this.editSubarcId === sub.id) {
                        return `
                            <div class="bg-slate-900 border-l-2 border-amber-500 p-3 rounded space-y-3 shadow-inner my-2">
                                <div class="flex justify-between items-center pb-1.5 border-b border-slate-800">
                                    <h5 class="text-xs font-bold text-amber-400 flex items-center gap-1">
                                        ✏️ Edit Sub-arc #${sIndex + 1}
                                    </h5>
                                    <button id="btnEnchantSubarc_inline_${arc.id}_${sub.id}" onclick="app.enchantSubarcFormInline('${arc.id}', '${sub.id}')" 
                                        class="text-[9px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-0.5 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                        ✨ Enchant / Tulis AI
                                    </button>
                                </div>
                                
                                <div class="space-y-2">
                                    <input type="text" id="editSubarcName_${arc.id}_${sub.id}" value="${sub.name}" placeholder="Judul Sub-arc" 
                                        class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500">
                                    
                                    <textarea id="editSubarcDesc_${arc.id}_${sub.id}" placeholder="Ketik rincian alur kejadian secara manual atau gunakan fitur AI di atas..." 
                                        class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500" rows="20">${sub.description || ''}</textarea>
                                </div>
                                
                                <div class="flex justify-end space-x-1.5 pt-1">
                                    <button onclick="app.cancelEditSubarc()" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition">Batal</button>
                                    <button onclick="app.saveSubarcInline('${arc.id}', '${sub.id}')" class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] transition font-medium">Simpan Perubahan</button>
                                </div>
                            </div>
                        `;
                    }

                    // Tampilan default untuk item sub-arc dengan aksi Naik, Turun, Edit & Hapus
                    return `
                        <div class="bg-slate-900 border-l-2 border-amber-500 p-2.5 pl-3 relative group/sub rounded">
                            <div class="absolute top-2.5 right-2 flex space-x-1 opacity-0 group-hover/sub:opacity-100 transition items-center bg-slate-900/90 px-1 py-0.5 rounded backdrop-blur-sm border border-slate-800">
                                ${this.deleteSubarcIdConfirm === sub.id ? `
                                    <span class="text-[9px] text-rose-400 font-semibold mr-1">Hapus?</span>
                                    <button onclick="app.deleteSubarc('${arc.id}', '${sub.id}', true)" class="bg-rose-600 hover:bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded transition">
                                        Ya
                                    </button>
                                    <button onclick="app.cancelDeleteSubarc()" class="text-slate-400 hover:text-slate-200 text-[10px] px-1">
                                        Batal
                                    </button>
                                ` : `
                                    ${!isFirst ? `
                                        <button onclick="app.moveSubarcUp('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400 p-0.5 transition" title="Naikkan Urutan Sub-arc">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                                        </button>
                                    ` : ''}
                                    ${!isLast ? `
                                        <button onclick="app.moveSubarcDown('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400 p-0.5 transition" title="Turunkan Urutan Sub-arc">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                    ` : ''}
                                    <button onclick="app.openEditSubarc('${arc.id}', '${sub.id}')" class="text-slate-400 hover:text-amber-400 p-0.5 transition" title="Edit Sub-arc">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button onclick="app.deleteSubarc('${arc.id}', '${sub.id}', false)" class="text-slate-400 hover:text-rose-500 text-sm font-bold leading-none p-0.5 transition" title="Hapus Sub-arc">
                                        &times;
                                    </button>
                                `}
                            </div>
                            <h5 class="text-xs font-bold text-amber-400 mb-1 flex items-center flex-wrap gap-1 pr-16">
                                ${sIndex + 1}. ${sub.name}
                                ${subarcPacing}
                            </h5>
                            <p class="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">${sub.description || '-'}</p>
                        </div>
                    `;
                }).join('');

            const univBadge = arc.universeId ? `<span class="hidden sm:inline-block text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/50 ml-2 font-normal">🌌 ${this.getUniverseName(arc.universeId)}</span>` : '';

            return `
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-md">
                    <div class="p-3 bg-slate-700/30 flex justify-between items-center cursor-pointer select-none hover:bg-slate-700/50 transition" 
                         onclick="app.togglePanel('arcContent_${arc.id}')">
                        <div class="flex items-center space-x-2.5">
                            <span class="bg-indigo-950 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded border border-indigo-800/80">#${arcNumber}</span>
                            <h4 class="font-bold text-slate-200 text-sm md:text-base">${arc.name} ${univBadge}</h4>
                        </div>
                        <div class="flex items-center space-x-3" onclick="event.stopPropagation()">
                            <button onclick="app.exportSingleArc('${arc.id}')" class="text-slate-400 hover:text-amber-400 transition" title="Export Arc Ini saja (.json)">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                            </button>
                            <button onclick="app.openEditArc('${arc.id}')" class="text-slate-400 hover:text-indigo-400 transition" title="Edit Pengaturan Arc">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            
                            ${this.deleteArcIdConfirm === arc.id ? `
                                <div class="flex items-center gap-1.5">
                                    <button onclick="app.deleteArc('${arc.id}', true)" class="bg-rose-600 hover:bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-medium transition">
                                        Ya, Hapus
                                    </button>
                                    <button onclick="app.cancelDeleteArc()" class="text-slate-300 hover:text-white text-[10px] px-1 font-medium">
                                        Batal
                                    </button>
                                </div>
                            ` : `
                                <button onclick="app.deleteArc('${arc.id}', false)" class="text-slate-400 hover:text-rose-500 transition" title="Hapus Keseluruhan Arc">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            `}

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
                                <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Daftar Plot Detail (${arc.subarcs ? arc.subarcs.length : 0} / ${arc.targetSubarcCount || '?'}):</span>
                            </div>

                            <!-- DAFTAR SUB-ARC DI ATAS -->
                            <div class="space-y-2 mb-3">
                                ${subarcsHTML}
                            </div>

                            <!-- TOMBOL TAMBAH SUB-ARC LEBAR PENUH -->
                            <button onclick="app.openAddSubarc('${arc.id}')" class="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded text-xs font-semibold transition mt-2 mb-3 flex items-center justify-center gap-1 shadow border border-amber-700/50">
                                + Tambah Sub-arc
                            </button>

                            <!-- FORM EDIT/TAMBAH SUBARC (Kini dipindahkan di bagian BAWAH daftar plot) -->
                            <div id="subarcForm_${arc.id}" class="hidden bg-slate-900 p-3 rounded border border-slate-700 mt-2 space-y-3 shadow-inner">
                                <h5 id="subarcFormTitle_${arc.id}" class="text-xs font-bold text-slate-300 border-b border-slate-700/50 pb-1.5 mb-2">Tambah Sub-arc</h5>
                                
                                <input type="text" id="newSubarcName_${arc.id}" placeholder="Judul Sub-arc (cth: 'Pertemuan di Kuil')" class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500">
                                
                                <div class="flex justify-between items-end pb-1 border-b border-slate-700/40 mt-1">
                                    <span class="text-[10px] text-slate-500">Rincian Narasi/Kejadian:</span>
                                    <button id="btnEnchantSubarc_${arc.id}" onclick="app.enchantSubarcForm('${arc.id}')" class="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 px-2 py-1 rounded transition font-medium flex items-center gap-1 shadow-sm">
                                        ✨ Auto-Tulis / Enchant Sub-arc
                                    </button>
                                </div>

                                <textarea id="newSubarcDesc_${arc.id}" placeholder="Ketik rincian alur runtutan kejadian secara manual atau gunakan fitur AI di atas..." class="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs w-full text-slate-200 focus:outline-none focus:border-amber-500" rows="20"></textarea>
                                
                                <div class="flex justify-end space-x-1.5">
                                    <button onclick="app.setPanelState('subarcForm_${arc.id}', false)" class="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-300 transition">Batal</button>
                                    <button id="saveSubarcBtn_${arc.id}" onclick="app.saveSubarc('${arc.id}')" class="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] transition font-medium">Simpan Data Sub-arc</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;
        }).join('');

        html += `
            <button onclick="app.openAddArc()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition mt-2 flex items-center justify-center gap-1.5 shadow-lg border border-indigo-700/50">
                + Tambah Arc Baru
            </button>
        `;

        return html;
    },

    // =========================================
    // --- INTEGRASI PANGGILAN AI ENCHANTER ----
    // =========================================

    // A. Enchant Untuk Sinopsis Arc
    async enchantArcForm() {
        const titleEl = document.getElementById('newArcName');
        const synEl = document.getElementById('newArcSyn');
        const btn = document.getElementById('btnEnchantArc');

        if (!titleEl.value.trim()) {
            return this.showNotification("Isi 'Nama Arc' terlebih dahulu agar AI dapat memahami ide pokok narasi yang ingin dibuat.", "error");
        }

        const payload = {
            moduleName: "Arc-Synopsis",
            targetData: {
                arcTitle: titleEl.value.trim(),
                draftSynopsis: synEl.value.trim() || "Kosong (Buatkan dari awal berdasarkan judul Arc)"
            },
            additional_instruction: {
                focus: "Kembangkan ringkasan cerita (sinopsis) global untuk Arc (Lini Cerita) ini.",
                tone: "Epik, memancing rasa penasaran, menggunakan sudut pandang narator/penulis",
                length: "2 hingga 3 paragraf naratif"
            }
        };

        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Memproses AI...";

        try {
            const result = await app.requestEnchant(payload);
            synEl.value = result;
            this.showNotification("Sinopsis Arc berhasil dibuat oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal memanggil AI: " + error.message, "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    // B. Enchant Untuk Isi Narasi Sub-arc (Form Tambah Bawah)
    async enchantSubarcForm(arcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        
        // Validasi Ketersediaan Konteks Arc
        if (!arc || !arc.name || !arc.synopsis) {
            return this.showNotification("GAGAL: Judul dan Deskripsi Arc harus sudah diisi dan 'disimpan' terlebih dahulu agar AI memahami konteks cerita utamanya.", "error");
        }

        // Validasi Aturan Semesta (Universe)
        const universeId = arc.universeId;
        if (!universeId) {
            return this.showNotification("GAGAL: Arc ini belum memiliki Latar Semesta. Silakan klik tombol 'Edit' pada Arc ini dan pilih Semesta terlebih dahulu.", "error");
        }
        
        const universe = this.data.universes.find(u => u.id === universeId);
        if (!universe) {
            return this.showNotification("GAGAL: ID Semesta pada Arc ini tidak valid atau telah dihapus. Silakan edit Arc dan pilih semesta yang tersedia.", "error");
        }

        // Ambil Target
        const targetCount = arc.targetSubarcCount || 10;
        
        // Ambil Nilai dari Form Sub-arc
        const subarcName = document.getElementById(`newSubarcName_${arcId}`).value.trim();
        const subarcDescEl = document.getElementById(`newSubarcDesc_${arcId}`);
        const subarcDesc = subarcDescEl.value.trim();
        const btn = document.getElementById(`btnEnchantSubarc_${arcId}`);

        // Menentukan urutan Sub-arc secara dinamis
        let currentIndex = (arc.subarcs ? arc.subarcs.length : 0) + 1;

        // Penyesuaian Instruksi Pacing
        let pacingFocus = `Sub-arc ini adalah urutan ke-${currentIndex} dari rencana total ${targetCount} sub-arc dalam Arc ini.`;
        if (currentIndex > targetCount) {
            pacingFocus = `PENTING: Sub-arc ini berada di urutan ke-${currentIndex}, MELEBIHI target awal ${targetCount} sub-arc! Rancang logika alur baru (ekstensi) berdasarkan kelanjutan sub-arc sebelumnya.`;
        }

        // Konstruksi Payload Kompleks (Memberikan Full Context Semesta & Arc)
        const payload = {
            moduleName: "Sub-arc (Episode Arc)",
            targetData: {
                arcTitle: arc.name,
                arcSynopsis: arc.synopsis,
                subarcCurrentSequence: currentIndex,
                targetTotalSubarcs: targetCount,
                subarcTitle: subarcName || "Sub-arc Baru (Tanpa Judul)",
                draftDescription: subarcDesc || "Belum ada rincian. Buatkan ide masalah/kejadian spesifik dari awal berdasarkan urutan sub-arc ini.",
                historyPreviousSubarcs: arc.subarcs || [],
                universeLore: universe 
            },
            additional_instruction: {
                focus: `Jabarkan kerangka plot (outline) atau kejadian spesifik untuk sub-arc ini (contoh: munculnya konflik kecil, tokoh ditipu/tersesat, rintangan, atau penemuan penting). Ini adalah dokumen teknis untuk panduan penulis, BUKAN cerita pendek! Langsung tunjukkan apa masalah atau tindakan yang terjadi di sub-arc ini yang selaras dengan tujuan Arc utama. ${pacingFocus} PENTING: Gunakan informasi world-building, tokoh, dan tempat dari 'universeLore'.`,
                tone: "Teknis, ringkas, efektif, to-the-point pada konflik, TANPA bahasa puitis/berbunga-bunga layaknya novel",
                length: "Sangat singkat, 1 hingga 2 paragraf padat"
            }
        };

        // UI Loading State
        btn.disabled = true;
        btn.classList.add('opacity-50');
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Menulis... Mohon Tunggu...";
        
        try {
            const result = await app.requestEnchant(payload);
            subarcDescEl.value = result;
            this.showNotification("Kerangka Sub-arc berhasil diperluas/ditulis oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal menggunakan AI: " + error.message, "error");
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.innerHTML = originalText;
        }
    },

    // C. Enchant Untuk Isi Narasi Sub-arc (Form Edit Inline)
    async enchantSubarcFormInline(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        
        if (!arc || !arc.name || !arc.synopsis) {
            return this.showNotification("GAGAL: Judul dan Deskripsi Arc harus sudah diisi dan disimpan agar AI memahami konteks cerita utamanya.", "error");
        }

        const universeId = arc.universeId;
        if (!universeId) {
            return this.showNotification("GAGAL: Arc ini belum memiliki Latar Semesta. Edit Arc dan tentukan Semestanya terlebih dahulu.", "error");
        }
        
        const universe = this.data.universes.find(u => u.id === universeId);
        if (!universe) {
            return this.showNotification("GAGAL: Referensi Semesta tidak valid.", "error");
        }

        const targetCount = arc.targetSubarcCount || 10;
        
        const subarcName = document.getElementById(`editSubarcName_${arcId}_${subarcId}`).value.trim();
        const subarcDescEl = document.getElementById(`editSubarcDesc_${arcId}_${subarcId}`);
        const subarcDesc = subarcDescEl.value.trim();
        const btn = document.getElementById(`btnEnchantSubarc_inline_${arcId}_${subarcId}`);

        // Cari urutan berdasarkan letak indexnya
        const index = arc.subarcs.findIndex(s => s.id === subarcId);
        const currentIndex = index !== -1 ? index + 1 : 1;

        let pacingFocus = `Sub-arc ini adalah urutan ke-${currentIndex} dari rencana total ${targetCount} sub-arc dalam Arc ini.`;

        const payload = {
            moduleName: "Sub-arc (Episode Arc)",
            targetData: {
                arcTitle: arc.name,
                arcSynopsis: arc.synopsis,
                subarcCurrentSequence: currentIndex,
                targetTotalSubarcs: targetCount,
                subarcTitle: subarcName || "Sub-arc",
                draftDescription: subarcDesc || "Kembangkan plot sub-arc spesifik di posisi ini.",
                historyPreviousSubarcs: arc.subarcs || [],
                universeLore: universe 
            },
            additional_instruction: {
                focus: `Sempurnakan kerangka alur plot untuk sub-arc ini selaras dengan posisi runtutan ke-${currentIndex}. Fokuskan pada kejadian penting, pergerakan karakter, rintangan, atau penemuan strategis. Ini adalah dokumentasi struktur plot (BUKAN fiksi pendek/prosa). ${pacingFocus}`,
                tone: "Teknis, taktis, detail konflik yang tegas, tanpa bunga bahasa novel",
                length: "Singkat dan padat, 1 hingga 2 paragraf deskriptif"
            }
        };

        btn.disabled = true;
        btn.classList.add('opacity-50');
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Menulis...";
        
        try {
            const result = await app.requestEnchant(payload);
            subarcDescEl.value = result;
            this.showNotification("Kerangka Sub-arc berhasil disempurnakan oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal memanggil AI: " + error.message, "error");
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.innerHTML = originalText;
        }
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
        document.getElementById('newArcUniverse').value = '';
        document.getElementById('newArcTarget').value = 10;
        
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
        document.getElementById('newArcUniverse').value = arc.universeId || '';
        document.getElementById('newArcTarget').value = arc.targetSubarcCount || 10;
        
        document.getElementById('addArcForm').scrollIntoView({ behavior: 'smooth' });
    },

    saveArc() {
        if (!this.data.arcs) this.data.arcs = [];
        
        const name = document.getElementById('newArcName').value.trim();
        if (!name) return this.showNotification("Nama Arc tidak boleh dibiarkan kosong.", "error");
        
        const synopsis = document.getElementById('newArcSyn').value.trim();
        const universeId = document.getElementById('newArcUniverse').value;
        const targetCount = parseInt(document.getElementById('newArcTarget').value) || 10;

        if (this.editArcId === null) {
            const newArc = {
                id: this.generateId('arc'),
                name: name,
                synopsis: synopsis,
                universeId: universeId,
                targetSubarcCount: targetCount,
                subarcs: []
            };
            this.data.arcs.push(newArc);
            this.showNotification("Arc berhasil ditambahkan!", "success");
        } else {
            const arc = this.data.arcs.find(a => a.id === this.editArcId);
            if (arc) {
                arc.name = name;
                arc.synopsis = synopsis;
                arc.universeId = universeId;
                arc.targetSubarcCount = targetCount;
                this.showNotification("Pengaturan Arc berhasil diperbarui!", "success");
            }
        }

        this.saveData();
        this.setPanelState('addArcForm', false);
        this.refreshArcList();
    },

    deleteArc(arcId, confirmed = false) {
        if (!confirmed) {
            this.deleteArcIdConfirm = arcId;
            this.refreshArcList();
            return;
        }
        
        this.data.arcs = this.data.arcs.filter(a => a.id !== arcId);
        this.deleteArcIdConfirm = null;
        this.saveData();
        this.refreshArcList();
        this.showNotification("Arc cerita beserta seluruh sub-arc di dalamnya telah dihapus.", "success");
    },

    cancelDeleteArc() {
        this.deleteArcIdConfirm = null;
        this.refreshArcList();
    },

    // =========================================
    // --- MANAJEMEN SUB-ARC ---
    // =========================================
    openAddSubarc(arcId) {
        this.editSubarcId = null; // Menutup editor inline jika ada yang sedang aktif
        this.refreshArcList();

        // Munculkan Form Tambah di bagian bawah (di bawah subarcs list)
        this.setPanelState(`subarcForm_${arcId}`, true);
        
        document.getElementById(`subarcFormTitle_${arcId}`).innerText = "Tambah Sub-arc";
        document.getElementById(`saveSubarcBtn_${arcId}`).innerText = "Simpan Data Sub-arc";
        document.getElementById(`newSubarcName_${arcId}`).value = '';
        document.getElementById(`newSubarcDesc_${arcId}`).value = '';

        // Otomatis scroll halus mengarah ke Form Tambah yang berada di bagian bawah list
        setTimeout(() => {
            const targetForm = document.getElementById(`subarcForm_${arcId}`);
            if (targetForm) {
                targetForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    },

    openEditSubarc(arcId, subarcId) {
        // Matikan Form tambah sub-arc agar fokus berpindah ke form inline di bawah
        this.setPanelState(`subarcForm_${arcId}`, false);
        
        this.editSubarcId = subarcId;
        this.refreshArcList();
    },

    cancelEditSubarc() {
        this.editSubarcId = null;
        this.refreshArcList();
    },

    saveSubarcInline(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;
        const sub = arc.subarcs.find(s => s.id === subarcId);
        if (!sub) return;

        const name = document.getElementById(`editSubarcName_${arcId}_${subarcId}`).value.trim();
        const description = document.getElementById(`editSubarcDesc_${arcId}_${subarcId}`).value.trim();

        if (!name) return this.showNotification("Judul sub-arc wajib diisi.", "error");

        sub.name = name;
        sub.description = description;

        this.saveData();
        this.editSubarcId = null;
        this.refreshArcList();
        this.showNotification("Perubahan sub-arc berhasil disimpan langsung!", "success");
    },

    saveSubarc(arcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) return;
        if (!arc.subarcs) arc.subarcs = [];

        const name = document.getElementById(`newSubarcName_${arcId}`).value.trim();
        const description = document.getElementById(`newSubarcDesc_${arcId}`).value.trim();

        if (!name) return this.showNotification("Judul sub-arc wajib diisi.", "error");

        const newSub = {
            id: this.generateId('sub'),
            name: name,
            description: description
        };
        arc.subarcs.push(newSub);

        this.saveData();
        this.setPanelState(`subarcForm_${arcId}`, false);
        this.refreshArcList();
        this.showNotification("Sub-arc baru berhasil ditambahkan!", "success");
    },

    deleteSubarc(arcId, subarcId, confirmed = false) {
        if (!confirmed) {
            this.deleteSubarcIdConfirm = subarcId;
            this.refreshArcList();
            return;
        }

        const arc = this.data.arcs.find(a => a.id === arcId);
        if (arc && arc.subarcs) {
            arc.subarcs = arc.subarcs.filter(s => s.id !== subarcId);
            if (this.editSubarcId === subarcId) {
                this.editSubarcId = null;
            }
            this.deleteSubarcIdConfirm = null;
            this.saveData();
            this.refreshArcList();
            this.showNotification("Sub-arc berhasil dihapus.", "success");
        }
    },

    cancelDeleteSubarc() {
        this.deleteSubarcIdConfirm = null;
        this.refreshArcList();
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

    // =========================================
    // --- MANAJEMEN URUTAN SUB-ARC ---
    // =========================================
    moveSubarcUp(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;

        const index = arc.subarcs.findIndex(s => s.id === subarcId);
        if (index > 0) {
            // Tukar posisi dengan elemen sebelumnya (Naik)
            const temp = arc.subarcs[index];
            arc.subarcs[index] = arc.subarcs[index - 1];
            arc.subarcs[index - 1] = temp;

            this.saveData();
            this.refreshArcList();
        }
    },

    moveSubarcDown(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc || !arc.subarcs) return;

        const index = arc.subarcs.findIndex(s => s.id === subarcId);
        if (index !== -1 && index < arc.subarcs.length - 1) {
            // Tukar posisi dengan elemen setelahnya (Turun)
            const temp = arc.subarcs[index];
            arc.subarcs[index] = arc.subarcs[index + 1];
            arc.subarcs[index + 1] = temp;

            this.saveData();
            this.refreshArcList();
        }
    },

    exportArcsData() {
        if (!this.data.arcs || this.data.arcs.length === 0) {
            return this.showNotification("Tidak ada data arc cerita yang dapat diexport.", "error");
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data.arcs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `arcs_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    exportSingleArc(arcId) {
        if (!this.data.arcs) return;
        
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) {
            return this.showNotification("Data arc tidak ditemukan.", "error");
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arc, null, 2));
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        
        const safeArcName = arc.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        downloadAnchor.setAttribute("download", `arc_export_${safeArcName}_${new Date().toISOString().slice(0,10)}.json`);
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
};