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
            lore: u.lores || []
        }));

        // 2. Lokasi Data
        const allLocations = this.getAllLocations(db);
        // Gunakan ID Efektif (Parent + Seluruh Child) jika method tersedia
        const effectiveLocationIds = typeof this.getEffectiveSelectedLocationIds === 'function' 
            ? this.getEffectiveSelectedLocationIds(db) 
            : this.state.selectedLocationIds;

        const selectedLocations = this.resolveEntityIds(effectiveLocationIds, allLocations).map(l => ({
            id: l.id,
            name: l.name,
            description: l.description || '',
            visuals: l.visuals || ''
        }));

        // Helper Ekstraksi Entitas Karakter/Monster
        // Inisialisasi Glossary Registry
        const glossary = {
            races: new Map(),
            skills: new Map(),
            items: new Map(),
            familiars: new Map()
        };

        // Helper daftar item
        const registerItemToGlossary = (item) => {
            glossary.items.set(item.id || item.name, item);
            // Ekstraksi skill bawaan dari item ke glossary.skills
            if (Array.isArray(item.skillIds) && db.skills) {
                const itemSkills = this.resolveEntityIds(item.skillIds, db.skills);
                itemSkills.forEach(s => glossary.skills.set(s.id || s.name, s));
            }
        };
        
        const formatEntity = (entity) => {
            // Hapus ID, gunakan langsung name
            const result = { name: entity.name };

            if (attrs.basicInfo) {
                result.role = entity.role || entity.peran || null;
                result.age = entity.age || entity.umur || entity.usia || null;
                result.gender = entity.gender || entity.jenisKelamin || null;
                
                if (db.races && entity.raceId) {
                    const raceObj = this.resolveEntityIds([entity.raceId], db.races)[0];
                    if (raceObj) {
                        result.race = raceObj.name;
                        glossary.races.set(raceObj.id || raceObj.name, raceObj);
                    } else {
                        result.race = entity.raceId;
                    }
                } else {
                    result.race = entity.race || null;
                }
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
            // Resolusi & Daftarkan ke Glosarium
            if (attrs.skillIds && Array.isArray(entity.skillIds) && db.skills) {
                const resolvedSkills = this.resolveEntityIds(entity.skillIds, db.skills);
                result.skills = resolvedSkills.map(s => s.name);
                resolvedSkills.forEach(s => glossary.skills.set(s.id || s.name, s));
            }
            if (attrs.itemIds && Array.isArray(entity.itemIds) && db.items) {
                const resolvedItems = this.resolveEntityIds(entity.itemIds, db.items);
                result.items = resolvedItems.map(i => i.name);
                resolvedItems.forEach(i => registerItemToGlossary(i));
            }
            if (attrs.familiarIds && Array.isArray(entity.familiarIds) && (db.familiars || db.pets)) {
                const famList = db.familiars || db.pets || [];
                const resolvedFams = this.resolveEntityIds(entity.familiarIds, famList);
                result.familiars = resolvedFams.map(f => f.name);
                resolvedFams.forEach(f => {
                    glossary.familiars.set(f.id || f.name, f);
                    
                    // Ekstraksi sub-skill langsung milik Pet
                    if (Array.isArray(f.skillIds) && db.skills) {
                        const famSkills = this.resolveEntityIds(f.skillIds, db.skills);
                        famSkills.forEach(s => glossary.skills.set(s.id || s.name, s));
                    }
                    
                    // Ekstraksi sub-item milik Pet BESERTA skill bawaan item tersebut
                    if (Array.isArray(f.itemIds) && db.items) {
                        const famItems = this.resolveEntityIds(f.itemIds, db.items);
                        famItems.forEach(i => registerItemToGlossary(i)); // <-- Menggunakan helper
                    }
                });
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
        const fullPrompt = this.buildFullPromptString(
            db, 
            selectedUniverses, 
            selectedLocations, 
            selectedCharacters, 
            selectedMonsters, 
            glossary
        );

        // Mengembalikan payload tanpa duplikasi array JSON entitas
        return {
            mainInstruction: this.state.mainInstruction.trim(),
            generatePrompt: this.state.generatePrompt.trim(),
            referenceFiles: this.state.referenceFiles, // Key terpisah berisi { "filename.txt": "konten" }
            previousContext: this.state.outputContent.trim(),
            fullPromptContext: fullPrompt
        };
    },

    buildFullPromptString(db, universes, locations, characters, monsters, glossary = {}) {
        let payload = "";

        // Helper perubah objek karakter/monster ke Markdown bertingkat
        const renderEntityMarkdown = (entity) => {
            let md = `### ${entity.name}\n`;
            if (entity.role) md += `- **Peran**: ${entity.role}\n`;
            if (entity.age) md += `- **Umur**: ${entity.age}\n`;
            if (entity.gender) md += `- **Gender**: ${entity.gender}\n`;
            if (entity.race) md += `- **Ras**: ${entity.race}\n`;
            if (entity.personality) md += `- **Kepribadian**: ${entity.personality}\n`;
            if (entity.background) md += `- **Latar Belakang**: ${entity.background}\n`;
            if (entity.appearance) md += `- **Penampilan**: ${entity.appearance}\n`;
            if (entity.skills?.length) md += `- **Skill**: ${entity.skills.join(', ')}\n`;
            if (entity.items?.length) md += `- **Item**: ${entity.items.join(', ')}\n`;
            if (entity.familiars?.length) md += `- **Pet/Familiar**: ${entity.familiars.join(', ')}\n`;
            if (entity.dialogues?.length) md += `- **Gaya Dialog**: ${Array.isArray(entity.dialogues) ? entity.dialogues.join(' / ') : entity.dialogues}\n`;
            if (entity.notes) md += `- **Catatan**: ${entity.notes}\n`;
            return md;
        };

        // 1. Semesta + Lore
        if (universes.length > 0) {
            payload += `# SEMESTA TERPILIH (${universes.length})\n`;
            universes.forEach(u => {
                payload += `## SEMESTA: ${u.name}\n`;
                if (u.description) payload += `**Deskripsi**: ${u.description}\n`;
                
                const loreList = u.lore || u.lores || [];
                if (Array.isArray(loreList) && loreList.length > 0) {
                    payload += `**Lore Semesta**:\n`;
                    loreList.forEach(l => {
                        const title = typeof l === 'object' ? (l.title || l.name || '') : '';
                        const content = typeof l === 'object' ? (l.content || l.description || l.text || '') : l;
                        payload += `- ${title ? `*${title}*: ` : ''}${content}\n`;
                    });
                }
                payload += `\n`;
            });
            payload += `---\n\n`;
        }

        // 2. Lokasi Terlibat
        if (locations.length > 0) {
            payload += `## LOKASI TERLIBAT\n`;
            locations.forEach(l => {
                payload += `- **${l.name}**: ${l.description || ''} ${l.visuals || ''}\n`;
            });
            payload += "\n---\n\n";
        }

        // 3. Karakter Terlibat (Format Markdown)
        if (characters.length > 0) {
            payload += `## KARAKTER TERLIBAT\n`;
            characters.forEach(c => payload += renderEntityMarkdown(c) + "\n");
            payload += "---\n\n";
        }

        // 4. Monster Terlibat (Format Markdown)
        if (monsters.length > 0) {
            payload += `## MONSTER / MUSUH TERLIBAT\n`;
            monsters.forEach(m => payload += renderEntityMarkdown(m) + "\n");
            payload += "---\n\n";
        }

        // 5. Glosarium Entitas Terkait (Skill, Item, Pet/Familiar)
        if (glossary && (glossary.races?.size > 0 || glossary.skills?.size > 0 || glossary.items?.size > 0 || glossary.familiars?.size > 0)) {
            payload += `## GLOSARIUM DETAIL ENTITAS\n`;
            

            if (glossary.familiars?.size > 0) {
                payload += `### Pet & Familiar\n`;
                glossary.familiars.forEach(f => {
                    const details = [];

                    if (f.description) details.push(`Deskripsi: ${f.description}`);
                    if (f.appearance) details.push(`Penampilan: ${f.appearance}`);

                    // Personality (Array / String)
                    if (f.personality && f.personality.length) {
                        const pText = Array.isArray(f.personality) ? f.personality.join(', ') : f.personality;
                        details.push(`Kepribadian: ${pText}`);
                    }

                    // Resolusi skillIds -> Nama Skill
                    if (Array.isArray(f.skillIds) && db.skills) {
                        const fSkills = this.resolveEntityIds(f.skillIds, db.skills).map(s => s.name);
                        if (fSkills.length > 0) details.push(`Skill: ${fSkills.join(', ')}`);
                    }

                    // Resolusi itemIds -> Nama Item
                    if (Array.isArray(f.itemIds) && db.items) {
                        const fItems = this.resolveEntityIds(f.itemIds, db.items).map(i => i.name);
                        if (fItems.length > 0) details.push(`Item: ${fItems.join(', ')}`);
                    }

                    // Dialogues (Array)
                    if (f.dialogues && f.dialogues.length) {
                        const dText = Array.isArray(f.dialogues) ? f.dialogues.join(' / ') : f.dialogues;
                        details.push(`Gaya Dialog: ${dText}`);
                    }

                    // Notes (Array / String)
                    if (f.notes && f.notes.length) {
                        const nText = Array.isArray(f.notes) ? f.notes.join('; ') : f.notes;
                        details.push(`Catatan: ${nText}`);
                    }

                    // Relations (Array / String)
                    if (f.relations && f.relations.length) {
                        const rText = Array.isArray(f.relations) ? f.relations.join(', ') : f.relations;
                        details.push(`Relasi: ${rText}`);
                    }

                    const infoStr = details.length > 0 ? details.join(' | ') : 'Tidak ada deskripsi';
                    payload += `- **${f.name}**: ${infoStr}\n`;
                });
            }

            if (glossary.items?.size > 0) {
                payload += `### Item & Senjata\n`;
                glossary.items.forEach(i => {
                    let itemSkillsInfo = '';
                    if (Array.isArray(i.skillIds) && db.skills) {
                        const attachedSkills = this.resolveEntityIds(i.skillIds, db.skills).map(s => s.name);
                        if (attachedSkills.length > 0) {
                            itemSkillsInfo = ` | Skill Item: ${attachedSkills.join(', ')}`;
                        }
                    }
                    payload += `- **${i.name}**: ${i.description || i.effect || 'Tidak ada deskripsi'}${itemSkillsInfo}\n`;
                });
            }
            if (glossary.skills?.size > 0) {
                payload += `### Skill & Kemampuan\n`;
                glossary.skills.forEach(s => {
                    payload += `- **${s.name}**: ${s.description || s.effect || 'Tidak ada deskripsi'}\n`;
                });
            }

            if (glossary.races?.size > 0) {
                payload += `### Ras & Spesies\n`;
                glossary.races.forEach(r => {
                    payload += `- **${r.name}**: ${r.description || 'Tidak ada deskripsi'}\n`;
                });
            }
            payload += "\n---\n\n";
        }

        // 6. File Referensi
        if (Object.keys(this.state.referenceFiles).length > 0) {
            payload += `## DICTIONARY FILE REFERENSI\n`;
            Object.entries(this.state.referenceFiles).forEach(([fname, content]) => {
                payload += `### FILE: ${fname}\n${content.trim()}\n\n`;
            });
            payload += `---\n\n`;
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
                app.NovelWriterModule.updateWordCountUI(outputArea.value);
                app.NovelWriterModule.novelWriterSaveState();
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