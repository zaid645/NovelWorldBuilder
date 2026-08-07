export const AIEnchanterCore = {
    isRequesting: false,

    async requestEnchant(payload) {
        const config = this.getAIConfig();
        const apiKey = config.apiKey || "";
        const model = config.model || "gemini-3.1-flash-lite";

        const { moduleName, targetData, additional_instruction } = payload;

        // 1. Ambil Role dan Opsi Sertakan Nama Modul (bisa dari payload atau config default)
        const systemRole = payload.systemRole || config.systemRole || "Asisten Novelis Pro";
        const includeModuleName = payload.includeModuleName ?? config.includeModuleName ?? false;
        
        // 2. Konstruksi Prompt Dinamis (Tidak ada data tersembunyi)
        let prompt = `Anda adalah ${systemRole}.\n`;
        
        // Opsi untuk menyertakan nama modul (Default: false)
        if (includeModuleName && moduleName) {
            prompt += `Tugas Anda saat ini adalah mengembangkan draf atau informasi dari modul: ${moduleName}.\n\n`;
        } else {
            prompt += `Tugas Anda saat ini adalah mengembangkan draf atau informasi yang diberikan.\n\n`;
        }
        
        prompt += `--- DATA UTAMA ---\n`;
        prompt += `${JSON.stringify(targetData, null, 2)}\n\n`;
        
        prompt += `--- PETUNJUK UTAMA PENGEMBANGAN ---\n`;
        if (typeof additional_instruction === 'string') {
            prompt += `${additional_instruction}\n\n`;
        } else {
            prompt += `- Fokus Utama: ${additional_instruction?.focus || "Tulis narasi detail"}\n`;
            prompt += `- Nada / Gaya Bahasa: ${additional_instruction?.tone || "Sesuai konteks cerita"}\n`;
            prompt += `- Panjang Teks: ${additional_instruction?.length || "Disesuaikan"}\n\n`;
        }
        
        prompt += `--- ATURAN OUTPUT & KEAMANAN (WAJIB DIPATUHI) ---\n`;
        prompt += `- Dilarang keras menghasilkan konten yang mengandung unsur sensual/porno, rokok, alkohol, perjudian, serta kekerasan berlebihan/detail.\n`;
        prompt += `- Jika permintaan pengguna atau konteks data mengandung salah satu dari materi terlarang tersebut, JANGAN memproses cerita/draf, melainkan LANGSUNG kembalikan teks persis: "Maaf, saya tidak bisa membantu permintaan ini karena melanggar kebijakan konten."\n`;
        const outputRules = payload.outputRules || config.outputRules || [];
        outputRules.forEach((rule, idx) => {
            prompt += `${idx + 1}. ${rule}\n`;
        });

        // OPSI: Jika mode download prompt aktif
        if (config.downloadPromptOnly || payload.downloadPromptOnly) {
            const filename = `prompt_${moduleName || 'custom'}_${Date.now()}.txt`;
            this.downloadPromptAsTxt(prompt, filename);
            this.addLog('Success', moduleName || 'Core', 'Download Prompt', `Prompt berhasil diunduh sebagai berkas '${filename}'.`);
            return `[PROMPT DOWNLOADED] Prompt telah diunduh sebagai file '${filename}'.`;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        this.isRequesting = true;
        const beforeUnloadHandler = (e) => {
            e.preventDefault();
            e.returnValue = 'Proses pengembangan AI sedang berlangsung. Apakah Anda yakin ingin membatalkan dan meninggalkan halaman?';
            return e.returnValue;
        };
        window.addEventListener('beforeunload', beforeUnloadHandler);

        let attempts = 0;
        let delay = 1000;
        let response;
        let lastError = null;

        // --- FITUR THINKING PROCESS ---
        // Deteksi apakah model mendukung thinking (model varian 'lite' biasanya tidak mendukung)
        const isLiteModel = model.toLowerCase().includes('lite');
        const supportsThinking = !isLiteModel && (config.enableThinking ?? true);

        const generationConfig = {
            maxOutputTokens: Number(config.maxOutputTokens) || 2048,
            temperature: Number(payload.temperature ?? config.temperature ?? 0.7)
        };

        // Tambahkan konfigurasi thinking jika model mendukung
        if (supportsThinking) {
            generationConfig.thinkingConfig = {
                thinkingBudget: -1 // -1 mengaktifkan Dynamic Thinking
            };
        }

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig
        };

        while (attempts < 3) {
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) break;

                const errData = await response.json().catch(() => ({}));
                lastError = new Error(errData.error?.message || `HTTP error ${response.status}`);
            } catch (err) {
                lastError = err;
            }

            attempts++;
            if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }

        window.removeEventListener('beforeunload', beforeUnloadHandler);
        this.isRequesting = false;

        if (!response || !response.ok) {
            const errorMsg = lastError ? lastError.message : "Gagal terhubung ke API.";
            this.addLog('Failed', moduleName || 'Core', `Enchant (${attempts} Percobaan)`, errorMsg);
            throw new Error(`Koneksi AI gagal setelah beberapa kali percobaan: ${errorMsg}`);
        }

        try {
            const data = await response.json();
            
            // Mengambil teks respon dengan mengabaikan part 'thought' (jika ada)
            const candidate = data.candidates?.[0];

            if (!candidate) {
                throw new Error("API tidak mengembalikan kandidat jawaban.");
            }

            if (candidate.finishReason && candidate.finishReason !== "STOP") {
                if (candidate.finishReason === "SAFETY") {
                    throw new Error("Respon diblokir oleh filter keamanan API Gemini.");
                }
                throw new Error(`Proses terhenti dengan alasan: ${candidate.finishReason}`);
            }

            const parts = candidate.content?.parts || [];
            const answerPart = parts.find(part => !part.thought) || parts[parts.length - 1];
            const generatedText = answerPart?.text;

            if (!generatedText) {
                throw new Error("API merespon sukses tetapi teks kosong.");
            }

            this.addLog('Success', moduleName || 'Core', `Enchant (${attempts + 1} Percobaan)`, `Berhasil mengembangkan data.`);
            return generatedText.trim();

        } catch (parseError) {
            this.addLog('Failed', moduleName || 'Core', 'Parsing Respon', parseError.message);
            throw parseError;
        }
    }
};