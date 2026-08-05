export const NovelWriterAi = {
    getAIConfig() {
        if (typeof window !== 'undefined' && window.app && window.app.AIEnchanterForm && typeof window.app.AIEnchanterForm.getAIConfig === 'function') {
            return window.app.AIEnchanterForm.getAIConfig();
        }
        if (typeof window !== 'undefined' && window.app && typeof window.app.getAIConfig === 'function') {
            return window.app.getAIConfig();
        }
        const config = localStorage.getItem('ai_enchanter_config');
        const defaultConfig = {
            apiKey: '',
            model: 'gemini-3.1-flash-lite',
            maxOutputTokens: 2048,
            downloadPromptOnly: false,
            outputRules: []
        };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    },

    updateAIConfigField(field, value) {
        const cfg = this.getAIConfig();
        cfg[field] = field === 'maxOutputTokens' ? Number(value) || 2048 : value;

        if (typeof window !== 'undefined' && window.app && window.app.AIEnchanterForm && typeof window.app.AIEnchanterForm.saveAIConfig === 'function') {
            window.app.AIEnchanterForm.saveAIConfig(cfg.apiKey, cfg.model, cfg.outputRules, cfg.maxOutputTokens, cfg.downloadPromptOnly);
        } else if (typeof window !== 'undefined' && window.app && typeof window.app.saveAIConfig === 'function') {
            window.app.saveAIConfig(cfg.apiKey, cfg.model, cfg.outputRules, cfg.maxOutputTokens, cfg.downloadPromptOnly);
        } else {
            localStorage.setItem('ai_enchanter_config', JSON.stringify(cfg));
        }
    },

    appendAIResponse(responseText) {
        if (!responseText) return;
        if (this.state.outputContent.trim().length > 0) {
            this.state.outputContent += "\n\n===\n\n" + responseText.trim();
        } else {
            this.state.outputContent = responseText.trim();
        }
    },

    // =========================================================================
    // GENERATOR PROMPT & PAYLOAD TERSTRUKTUR (TERPISAH)
    // =========================================================================
    buildStructuredPayload(providedDb = null) {
        const db = this.getDatabase(providedDb);
        const attrs = this.state.globalAttributes;

        // 1. Semesta Data
        const selectedUniverses = (db.universes || []).filter(u => this.state.selectedUniverseIds.includes(u.id)).map(u => ({
            id: u.id,
            name: u.name,
            description: u.description || '',
            lore: u.lores || u.lore || []
        }));

        // 2. Lokasi Data
        const allLocations = this.getAllLocations(db);
        const selectedLocations = this.resolveEntityIds(this.state.selectedLocationIds, allLocations).map(l => ({
            id: l.id,
            name: l.name,
            path: l.path || '',
            description: l.description || l.notes || ''
        }));

        // Helper Ekstraksi Entitas Karakter/Monster
        const formatEntity = (entity) => {
            const result = { id: entity.id, name: entity.name };

            if (attrs.basicInfo) {
                result.role = entity.role || entity.peran || null;
                result.age = entity.age || entity.umur || entity.usia || null;
                result.gender = entity.gender || entity.jenisKelamin || null;
            }
            if (attrs.personality && (entity.personality || entity.watak)) {
                result.personality = entity.personality || entity.watak;
            }
            if (attrs.background && (entity.background || entity.description || entity.latarBelakang)) {
                result.background = entity.background || entity.description || entity.latarBelakang;
            }
            if (attrs.appearance && entity.appearance) {
                result.appearance = entity.appearance;
            }
            if (attrs.skillIds && Array.isArray(entity.skillIds) && db.skills) {
                result.skills = this.resolveEntityIds(entity.skillIds, db.skills).map(s => s.name);
            }
            if (attrs.itemIds && Array.isArray(entity.itemIds) && db.items) {
                result.items = this.resolveEntityIds(entity.itemIds, db.items).map(i => i.name);
            }
            if (attrs.dialogues && Array.isArray(entity.dialogues)) {
                result.dialogues = entity.dialogues;
            }
            if (attrs.notes && entity.notes) {
                result.notes = entity.notes;
            }
            return result;
        };

        const allCharacters = this.getAllCharacters(db);
        const allMonsters = this.getAllMonsters(db);

        const selectedCharacters = this.resolveEntityIds(this.state.selectedCharacterIds, allCharacters).map(formatEntity);
        const selectedMonsters = this.resolveEntityIds(this.state.selectedMonsterIds, allMonsters).map(formatEntity);

        // Buat String Markdown fullPromptContext untuk Kompatibilitas AI
        const fullPrompt = this.buildFullPromptString(db, selectedUniverses, selectedLocations, selectedCharacters, selectedMonsters);

        // Mengembalikan payload tanpa duplikasi array JSON entitas
        return {
            mainInstruction: this.state.mainInstruction.trim(),
            generatePrompt: this.state.generatePrompt.trim(),
            referenceFiles: this.state.referenceFiles, // Key terpisah berisi { "filename.txt": "konten" }
            previousContext: this.state.outputContent.trim(),
            fullPromptContext: fullPrompt
        };
    },

    buildFullPromptString(db, universes, locations, characters, monsters) {
        let payload = "";

        if (universes.length > 0) {
            payload += `# SEMESTA TERPILIH (${universes.length})\n`;
            universes.forEach(u => {
                payload += `## SEMESTA: ${u.name}\n${u.description ? 'Deskripsi: ' + u.description + '\n' : ''}\n`;
            });
            payload += `---\n\n`;
        }

        if (locations.length > 0) {
            payload += `## LOKASI TERLIBAT\n`;
            locations.forEach(l => payload += `- **${l.name}** (${l.path}): ${l.description}\n`);
            payload += "\n---\n\n";
        }

        if (characters.length > 0) {
            payload += `## KARAKTER TERLIBAT\n`;
            characters.forEach(c => payload += `- **${c.name}**: ${JSON.stringify(c)}\n`);
            payload += "\n---\n\n";
        }

        if (monsters.length > 0) {
            payload += `## MONSTER / MUSUH TERLIBAT\n`;
            monsters.forEach(m => payload += `- **${m.name}**: ${JSON.stringify(m)}\n`);
            payload += "\n---\n\n";
        }

        if (Object.keys(this.state.referenceFiles).length > 0) {
            payload += `## DICTIONARY FILE REFERENSI\n`;
            Object.entries(this.state.referenceFiles).forEach(([fname, content]) => {
                payload += `### FILE: ${fname}\n${content.trim()}\n\n`;
            });
            payload += `---\n\n`;
        }

        if (this.state.mainInstruction.trim()) {
            payload += `## INSTRUKSI UTAMA PENULISAN\n${this.state.mainInstruction.trim()}\n\n---\n\n`;
        }

        if (this.state.generatePrompt.trim()) {
            payload += `## ADEGAN / SCENE CERITA YANG DIKEMBANGKAN SEKARANG\n${this.state.generatePrompt.trim()}\n\n---\n\n`;
        }

        if (this.state.outputContent.trim()) {
            payload += `## KONTEKS NARASI SEBELUMNYA\n${this.state.outputContent.trim()}\n\n`;
        }

        return payload;
    },

    // =========================================================================
    // INTEGRASI PEMANGGILAN AI
    // =========================================================================
    async generateNovelWithAI(providedDb = null) {
        const btn = document.getElementById('btnGenerateNovel');
        const db = this.getDatabase(providedDb);
        const structuredData = this.buildStructuredPayload(db);

        if (!structuredData.generatePrompt && !structuredData.mainInstruction && !structuredData.fullPromptContext) {
            return this.showNotification("Tulis instruksi/adegan atau pilih entitas terlebih dahulu!", "error");
        }

        const payload = {
            moduleName: "NovelWriterModule",
            targetData: structuredData, // Payload data terstruktur lengkap
            hasPreviousText: Boolean(structuredData.previousContext),
            hasReferenceFiles: Object.keys(this.state.referenceFiles).length > 0,
            additional_instruction: {
                focus: "Tulis narasi/prosa novel secara utuh, imersif, kaya deskripsi panca indera. Lanjutkan adegan secara mulus jika ada teks sebelumnya.",
                mainInstruction: structuredData.mainInstruction,
                sceneToDevelop: structuredData.generatePrompt
            }
        };

        if (btn) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> ✨ AI Sedang Menulis Novel...
            `;
        }

        try {
            if (typeof window.app === 'undefined' || typeof window.app.requestEnchant !== 'function') {
                throw new Error("Fungsi window.app.requestEnchant() tidak ditemukan di lingkungan aplikasi.");
            }

            const result = await window.app.requestEnchant(payload);
            
            this.appendAIResponse(result);

            const outputArea = document.getElementById('novel-output-area');
            if (outputArea) {
                outputArea.value = this.state.outputContent;
                outputArea.scrollTop = outputArea.scrollHeight;
            }

            this.showNotification("Narasi novel berhasil dibuat oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal memanggil AI: " + error.message, "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                btn.innerHTML = "✨ Tulis / Lanjutkan Narasi Novel dengan AI";
            }
        }
    }
}