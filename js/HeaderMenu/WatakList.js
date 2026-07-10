/**
 * WatakListModule
 * Mengelola daftar watak (sifat karakter) berupa array of strings.
 * Disimpan secara independen dan terpisah dari data master (JSON utama).
 */

const LOCAL_STORAGE_KEY = 'novel_watak_list_data';
const DEFAULT_WATAK = [
    'Ramah', 'Tenang', 'Pemarah', 'Ceria', 'Dingin', 
    'Licik', 'Naif', 'Pemberani', 'Pengecut', 'Bijaksana'
];

export const WatakListModule = {
    // State internal penyimpan array string watak
    watakData: [],

    // ==========================================
    // --- INISIALISASI & PENYIMPANAN DATA ---
    // ==========================================
    
    initWatakData() {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                this.watakData = JSON.parse(stored);
            } catch (e) {
                console.error("Gagal parsing data watak, memuat default.", e);
                this.watakData = [...DEFAULT_WATAK];
            }
        } else {
            // Jika belum ada data sama sekali, muat default
            this.watakData = [...DEFAULT_WATAK];
            this.saveWatakData();
        }
        
        // Urutkan alfabet saat inisialisasi
        this.watakData.sort((a, b) => a.localeCompare(b));
    },

    saveWatakData() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.watakData));
    },

    // ==========================================
    // --- RENDER VIEW UTAMA ---
    // ==========================================
    
    renderWatakView() {
        // Pastikan data dimuat sebelum dirender
        if (this.watakData.length === 0) {
            this.initWatakData();
        }

        return `
            <div class="flex flex-col gap-6">
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                    
                    <!-- Header Panel -->
                    <div class="bg-slate-700/50 p-4 flex justify-between items-center border-b border-slate-700">
                        <div>
                            <h3 class="font-bold text-slate-200 text-lg flex items-center gap-2">
                                🎭 Master Daftar Watak Karakter
                                <span class="text-xs bg-indigo-600 px-2 py-0.5 rounded-full text-white">${this.watakData.length}</span>
                            </h3>
                            <p class="text-xs text-slate-400 mt-1">Gunakan tag watak ini nantinya untuk mendeskripsikan tokoh di semesta Anda.</p>
                        </div>
                    </div>

                    <!-- Panel Kontrol (Tambah & AI) -->
                    <div class="p-4 space-y-4 bg-slate-800/80">
                        <div class="flex flex-col sm:flex-row gap-2 max-w-2xl"> 
                            <div class="flex-1 flex gap-2">
                                <input type="text" id="newWatakInput" placeholder="Ketik watak baru (Cth: Ambisius)" 
                                    class="flex-1 bg-slate-900 border border-slate-600 rounded p-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none shadow-inner"
                                    onkeypress="if(event.key === 'Enter') app.addWatak()">
                                <button onclick="app.addWatak()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded font-bold transition shadow">
                                    Tambah
                                </button>
                            </div>
                            
                            <button id="btnAiWatak" onclick="app.generateWatakAI()" class="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 px-4 py-2.5 rounded text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                                ✨ Auto-Generate via AI
                            </button>
                        </div>
                    </div>

                    <!-- Area Render Badge Watak -->
                    <div class="p-5 border-t border-slate-700/50">
                        <div id="watakBadgeContainer" class="flex flex-wrap gap-2.5">
                            ${this.renderWatakBadges()}
                        </div>
                    </div>

                </div>
            </div>
        `;
    },

    renderWatakBadges() {
        if (this.watakData.length === 0) {
            return `<p class="text-sm text-slate-500 italic w-full text-center py-4">Belum ada watak yang terdaftar.</p>`;
        }

        return this.watakData.map(watak => `
            <span class="bg-slate-900 text-slate-300 text-sm px-3 py-1.5 rounded-md border border-slate-600 flex items-center group hover:border-indigo-500 transition-colors shadow-sm">
                ${watak}
                <div class="ml-3 flex items-center border-l border-slate-700 pl-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1.5">
                    <button onclick="app.editWatak('${watak}')" class="text-slate-400 hover:text-amber-400" title="Edit Watak">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="app.deleteWatak('${watak}')" class="text-slate-400 hover:text-rose-400" title="Hapus Watak">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </span>
        `).join('');
    },

    refreshWatakUI() {
        const container = document.getElementById('watakBadgeContainer');
        if (container) {
            container.innerHTML = this.renderWatakBadges();
        }
        // Jika ada fungsi render ulang view global di app Anda, Anda bisa memanggilnya
        // app.switchView('watak'); // Opsional, agar angka count di header terupdate
    },

    // ==========================================
    // --- LOGIKA CRUD & VALIDASI ---
    // ==========================================

    addWatak() {
        const input = document.getElementById('newWatakInput');
        if (!input) return;

        let val = input.value.trim();
        if (!val) return;

        // Standarisasi: Huruf pertama kapital
        val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();

        // Validasi Duplikasi (Case-Insensitive)
        const isDuplicate = this.watakData.some(w => w.toLowerCase() === val.toLowerCase());
        
        if (isDuplicate) {
            alert(`Watak '${val}' sudah ada di dalam daftar!`);
            return;
        }

        this.watakData.push(val);
        this.watakData.sort((a, b) => a.localeCompare(b));
        this.saveWatakData();
        
        input.value = '';
        this.refreshWatakUI();
        
        // Asumsi app.switchView atau sejenisnya ada untuk render ulang penuh agar angka di header update
        if(typeof app.switchView === 'function') app.switchView('watak');
    },

    editWatak(oldVal) {
        let newVal = prompt(`Ubah nama watak '${oldVal}':`, oldVal);
        if (newVal !== null && newVal.trim() !== "") {
            newVal = newVal.trim();
            newVal = newVal.charAt(0).toUpperCase() + newVal.slice(1).toLowerCase();

            // Validasi Duplikasi jika namanya berubah
            if (newVal.toLowerCase() !== oldVal.toLowerCase()) {
                const isDuplicate = this.watakData.some(w => w.toLowerCase() === newVal.toLowerCase());
                if (isDuplicate) {
                    alert(`Gagal merubah! Watak '${newVal}' sudah ada di dalam daftar.`);
                    return;
                }
            }

            const index = this.watakData.indexOf(oldVal);
            if (index > -1) {
                this.watakData[index] = newVal;
                this.watakData.sort((a, b) => a.localeCompare(b));
                this.saveWatakData();
                this.refreshWatakUI();
            }
        }
    },

    deleteWatak(val) {
        if (confirm(`Apakah Anda yakin ingin menghapus watak '${val}' dari master daftar?`)) {
            this.watakData = this.watakData.filter(w => w !== val);
            this.saveWatakData();
            this.refreshWatakUI();
            
            if(typeof app.switchView === 'function') app.switchView('watak');
        }
    },

    // ==========================================
    // --- INTEGRASI AI ENCHANTER ---
    // ==========================================

    async generateWatakAI() {
        const btn = document.getElementById('btnAiWatak');
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✨ Meminta saran AI...';

        // Merangkai string daftar watak eksisting agar AI tahu apa yang tidak boleh diulang
        const existingString = this.watakData.join(', ');

        const payload = {
            moduleName: "Watak-Generator",
            targetData: {
                daftarWatakSaatIni: existingString
            },
            additional_instruction: {
                focus: "Buatkan 7 watak/sifat kepribadian manusia yang BERBEDA dan BELUM ADA di 'daftarWatakSaatIni'. Berikan variasi sifat positif, negatif, atau netral.",
                tone: "Karakteristik Psikologis",
                // Sangat penting untuk memaksa output hanya comma-separated
                length: "HANYA BERIKAN teks yang dipisahkan dengan koma. Contoh: Ambisius, Pesimis, Idealis. JANGAN berikan kalimat pembuka/penutup."
            }
        };

        try {
            // Asumsi method requestEnchant sudah tersedia di global 'app' sesuai struktur file Anda
            const resultText = await app.requestEnchant(payload);
            
            // Parsing hasil dari AI
            const rawNewWataks = resultText.split(',').map(s => s.trim().replace(/['"]/g, '')).filter(s => s.length > 0);
            
            let addedCount = 0;
            let duplicateCount = 0;

            rawNewWataks.forEach(w => {
                // Formatting
                const cleanStr = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                
                // Validasi Manual Lapis Kedua: Pastikan AI benar-benar tidak memberikan yang duplikat
                const exists = this.watakData.some(existing => existing.toLowerCase() === cleanStr.toLowerCase());
                
                if (!exists) {
                    this.watakData.push(cleanStr);
                    addedCount++;
                } else {
                    duplicateCount++;
                }
            });

            if (addedCount > 0) {
                this.watakData.sort((a, b) => a.localeCompare(b));
                this.saveWatakData();
                this.refreshWatakUI();
                if(typeof app.switchView === 'function') app.switchView('watak');
                
                let msg = `Berhasil! AI menambahkan ${addedCount} watak baru.`;
                if (duplicateCount > 0) msg += ` (${duplicateCount} saran diabaikan karena sudah ada di daftar Anda).`;
                
                // Gunakan fungsi alert kustom jika ada, atau alert bawaan
                if (typeof app.showAlert === 'function') {
                    app.showAlert(msg, "success");
                } else {
                    alert(msg);
                }
            } else {
                alert("AI memberikan saran watak, tetapi setelah divalidasi semuanya sudah ada di dalam daftar Anda. Coba lagi.");
            }

        } catch (error) {
            alert("Gagal menggunakan AI Enchanter: " + error.message);
        } finally {
            // Reset Button
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.innerHTML = originalText;
        }
    }
};