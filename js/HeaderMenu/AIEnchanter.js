/**
 * AIEnchanterModule
 * Mengelola konfigurasi kecerdasan buatan (Gemini API), pengiriman request,
 * aturan output, log riwayat panggilan, dan antarmuka pengujian terintegrasi.
 */
export const AIEnchanterModule = {
    // State internal memori jangka pendek (akan hilang jika halaman di-refresh)
    aiLogs: [],
    isRequesting: false, // Flag untuk mendeteksi status pemanggilan aktif

    // ==========================================
    // --- MANAJEMEN PENYIMPANAN KONFIGURASI ---
    // ==========================================
    getAIConfig() {
        const config = localStorage.getItem('ai_enchanter_config');
        return config ? JSON.parse(config) : {
            apiKey: '',
            model: 'gemini-3.1-flash-lite', // Menjadikan gemini-3.1-flash-lite sebagai default
            outputRules: [
                "HANYA kembalikan teks hasil pengembangan langsung.",
                "JANGAN memberikan kata pengantar atau penutup seperti 'Berikut hasilnya:', 'Tentu, ini...', atau tanda kutip.",
                "Hindari format Markdown yang merusak estetika UI, gunakan paragraf biasa.",
                "Gunakan Bahasa Indonesia yang kaya, sinematik, mengalir, dan sesuai dengan tone yang diminta."
            ]
        };
    },

    saveAIConfig(apiKey, model, outputRules) {
        const config = { apiKey, model, outputRules };
        localStorage.setItem('ai_enchanter_config', JSON.stringify(config));
        this.addLog('Success', 'Config', 'Menyimpan Konfigurasi', 'Konfigurasi AI berhasil diperbarui.');
    },

    // ==========================================
    // --- LOG TRANSAKSI JANGKA PENDEK ---------
    // ==========================================
    addLog(status, module, action, message) {
        const newLog = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString('id-ID'),
            status, // 'Success' atau 'Failed'
            module,
            action,
            message
        };
        this.aiLogs.unshift(newLog); // Log terbaru ditaruh paling atas
        this.refreshAILogsPanel();
    },

    clearLogs() {
        this.aiLogs = [];
        this.refreshAILogsPanel();
    },

    // ==========================================
    // --- INTI ENCHANTER: PANGGILAN GEMINI API -
    // ==========================================
    async requestEnchant(payload) {
        const config = this.getAIConfig();
        const apiKey = config.apiKey || "";
        const model = config.model || "gemini-3.1-flash-lite"; // Menggunakan gemini-3.1-flash-lite sebagai fallback default

        const { moduleName, targetData, additional_instruction } = payload;
        
        // 1. Konstruksi Prompt Terstruktur (Sesuai Konsep JSON Bercabang)
        let prompt = `Anda adalah Asisten Novelis Pro.\n`;
        prompt += `Tugas Anda saat ini adalah mengembangkan draf atau informasi dari modul: ${moduleName}.\n\n`;
        
        prompt += `--- DATA UTAMA ---\n`;
        prompt += `${JSON.stringify(targetData, null, 2)}\n\n`;
        
        prompt += `--- PETUNJUK UTAMA PENGEMBANGAN ---\n`;
        prompt += `- Fokus Utama: ${additional_instruction.focus || "Tulis narasi detail"}\n`;
        prompt += `- Nada / Gaya Bahasa: ${additional_instruction.tone || "Sesuai konteks cerita"}\n`;
        prompt += `- Panjang Teks: ${additional_instruction.length || "Disesuaikan"}\n\n`;
        
        prompt += `--- ATURAN OUTPUT (WAJIB DIPATUHI) ---\n`;
        config.outputRules.forEach((rule, idx) => {
            prompt += `${idx + 1}. ${rule}\n`;
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Handler untuk mencegah hilangnya proses akibat ketidaksengajaan refresh halaman saat AI sedang memproses
        this.isRequesting = true;
        const beforeUnloadHandler = (e) => {
            e.preventDefault();
            e.returnValue = 'Proses pengembangan AI sedang berlangsung. Apakah Anda yakin ingin membatalkan dan meninggalkan halaman?';
            return e.returnValue;
        };
        window.addEventListener('beforeunload', beforeUnloadHandler);

        // 2. Jalankan Fetch dengan Aturan Exponential Backoff (Maksimal 3 Kali)
        let attempts = 0;
        let delay = 1000; // Mulai dengan delay 1 detik
        let response;
        let lastError = null;

        while (attempts < 3) {
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (response.ok) {
                    break; // Berhasil, keluar dari loop retry
                }

                const errData = await response.json().catch(() => ({}));
                lastError = new Error(errData.error?.message || `HTTP error ${response.status}`);
            } catch (err) {
                lastError = err;
            }

            attempts++;
            if (attempts < 3) {
                // Tunggu berdasarkan skema exponential backoff: 1s, 2s
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }

        // Hapus proteksi refresh karena proses transaksi HTTP selesai
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        this.isRequesting = false;

        if (!response || !response.ok) {
            const errorMsg = lastError ? lastError.message : "Gagal terhubung ke API.";
            this.addLog('Failed', moduleName, `Enchant (${attempts} Percobaan)`, errorMsg);
            throw new Error(`Koneksi AI gagal setelah beberapa kali percobaan: ${errorMsg}`);
        }

        try {
            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!generatedText) {
                throw new Error("API merespon sukses tetapi teks kosong.");
            }

            this.addLog('Success', moduleName, `Enchant (${attempts + 1} Percobaan)`, `Berhasil mengembangkan data untuk '${targetData.name || targetData.title || "Konten"}'`);
            return generatedText.trim();

        } catch (parseError) {
            this.addLog('Failed', moduleName, 'Parsing Respon', parseError.message);
            throw parseError;
        }
    },

    // ==========================================
    // --- ANTARMUKA PENGATURAN & SANDBOX (UI) --
    // ==========================================
    renderAIEnchanterView() {
        const config = this.getAIConfig();
        const models = [
            'gemini-3.5-flash',
            'gemini-3.1-flash-lite',
            'gemini-3.0-flash',
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite'
        ];

        return `
            <div class="flex flex-col gap-6">
                <!-- Panel Utama Pengaturan AI -->
                <div class="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-md">
                    <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
                            <span>✨</span> AI Novel Enchanter & Settings
                        </h3>
                        <span class="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full">
                            API-Driven Decoupled Module
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Kolom Kiri: Kredensial & Model -->
                        <div class="flex flex-col gap-3">
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 mb-1.5">Gemini API Key</label>
                                <div class="relative">
                                    <input type="password" id="aiApiKey" value="${config.apiKey}" placeholder="Masukkan apiKey Anda..." 
                                        class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 pr-10">
                                    <button onclick="app.toggleApiKeyVisibility()" class="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none">
                                        <svg id="eyeIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-400 mb-1.5">Pilih Model AI</label>
                                <select id="aiModel" class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                                    ${models.map(m => `<option value="${m}" ${config.model === m ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>

                            <div class="mt-2">
                                <button onclick="app.handleSaveAIConfig()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded text-sm transition">
                                    Simpan Pengaturan AI
                                </button>
                            </div>
                        </div>

                        <!-- Kolom Kanan: Aturan Output Baku -->
                        <div class="flex flex-col">
                            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Aturan Output AI Baku (Wajib)</label>
                            <textarea id="aiOutputRules" rows="5" class="w-full flex-1 bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500" placeholder="Satu baris untuk satu aturan...">${config.outputRules.join('\n')}</textarea>
                            <span class="text-[10px] text-slate-500 mt-1 italic">*Aturan ini disisipkan di setiap instruksi agar format hasil selalu konsisten.</span>
                        </div>
                    </div>
                </div>

                <!-- Sandbox Pengujian Pengguna -->
                <div class="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-md">
                    <h3 class="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        <span>🧪</span> Sandbox Pengujian Mandiri
                    </h3>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1 flex flex-col gap-3">
                            <div>
                                <label class="block text-xs text-slate-400 mb-1">Draf Deskripsi Pendek (Input Uji)</label>
                                <textarea id="testInputPrompt" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Ketik draf cerita pendek di sini..."></textarea>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="app.testAIEnchant()" id="btnTestAI" class="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded text-xs transition">
                                    ✨ Eksekusi Test AI
                                </button>
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col">
                            <label class="block text-xs text-slate-400 mb-1">Hasil Output AI Sandbox</label>
                            <div id="testOutputArea" class="w-full flex-1 min-h-[100px] bg-slate-950 border border-slate-700 rounded p-3 text-xs text-slate-300 font-serif overflow-y-auto max-h-[160px] whitespace-pre-line leading-relaxed italic">
                                Hasil pengujian AI akan muncul di sini...
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel Log Aktivitas Berjalan (Volatile / Menghilang saat Refresh) -->
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-md">
                    <div class="bg-slate-750 p-3 px-4 flex justify-between items-center border-b border-slate-700">
                        <div class="flex items-center gap-2">
                            <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <h3 class="font-bold text-slate-200 text-xs tracking-wide uppercase">AI Enchanter Logs (Sesi Aktif)</h3>
                        </div>
                        <button onclick="app.clearLogs()" class="text-[10px] text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 px-2 py-0.5 rounded transition">
                            Bersihkan Log
                        </button>
                    </div>
                    <div id="aiLogsContainer" class="p-4 max-h-[200px] overflow-y-auto divide-y divide-slate-700/50 text-xs">
                        ${this.renderAILogsList()}
                    </div>
                </div>
            </div>
        `;
    },

    renderAILogsList() {
        if (this.aiLogs.length === 0) {
            return `<div class="text-center py-4 text-slate-500 italic">Belum ada transaksi log pada sesi ini.</div>`;
        }

        return this.aiLogs.map(log => {
            const statusColor = log.status === 'Success' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-900';
            const badgeText = log.status === 'Success' ? 'SUKSES' : 'GAGAL';

            return `
                <div class="py-2 flex flex-col gap-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] bg-slate-900 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-800">${log.timestamp}</span>
                            <span class="text-[10px] px-2 py-0.5 rounded font-bold border ${statusColor}">${badgeText}</span>
                            <span class="font-bold text-indigo-400">${log.module}</span>
                            <span class="text-slate-400">➔</span>
                            <span class="text-slate-300 font-medium">${log.action}</span>
                        </div>
                    </div>
                    <div class="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded mt-0.5 border border-slate-800/40">
                        ${log.message}
                    </div>
                </div>
            `;
        }).join('');
    },

    refreshAILogsPanel() {
        const container = document.getElementById('aiLogsContainer');
        if (container) {
            container.innerHTML = this.renderAILogsList();
        }
    },

    // ==========================================
    // --- EVENT CONTROLLERS (LOGIKA TOMBOL) ----
    // ==========================================
    handleSaveAIConfig() {
        const apiKey = document.getElementById('aiApiKey').value.trim();
        const model = document.getElementById('aiModel').value;
        const rulesText = document.getElementById('aiOutputRules').value;

        // Pisahkan teks menjadi array baris demi baris, hilangkan spasi kosong
        const outputRules = rulesText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        this.saveAIConfig(apiKey, model, outputRules);
        alert("Konfigurasi AI berhasil disimpan!");
    },

    toggleApiKeyVisibility() {
        const input = document.getElementById('aiApiKey');
        if (!input) return;
        
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    },

    async testAIEnchant() {
        const testInput = document.getElementById('testInputPrompt');
        const outputArea = document.getElementById('testOutputArea');
        const btn = document.getElementById('btnTestAI');

        if (!testInput || !testInput.value.trim()) {
            return alert("Ketikkan teks uji coba terlebih dahulu.");
        }

        const promptText = testInput.value.trim();
        outputArea.innerHTML = "Menghubungi AI... Mohon tunggu...";
        btn.disabled = true;
        btn.classList.add('opacity-50');

        const testPayload = {
            moduleName: "Sandbox-Test",
            targetData: {
                name: "Uji Sandbox",
                originalText: promptText
            },
            additional_instruction: {
                focus: "Kembangkan teks uji coba dengan memperindah pilihan diksi narasi",
                tone: "Melankolis dramatis",
                length: "1 paragraf pendek"
            }
        };

        try {
            const result = await this.requestEnchant(testPayload);
            outputArea.innerText = result;
        } catch (error) {
            outputArea.innerHTML = `<span class="text-rose-500 font-bold">Error: ${error.message}</span>`;
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
        }
    }
};