// Logika ekspor universe (JSON & Markdown)

export const BasicUniverseExport = {
    // --- HELPER UNTUK UNDUH FILE MARKDOWN ---
    downloadMarkdown(filename, content) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", url);
        dlAnchorElem.setAttribute("download", filename);
        dlAnchorElem.click();
        URL.revokeObjectURL(url);
    },

    // --- EXPERT SPECIFIC UNIVERSE ---
    exportSpecificUniverse(id, format = 'json') {
        const universe = app.data.universes.find(u => u.id === id);
        if (!universe) {
            app.showAlert("Semesta tidak ditemukan.", "error");
            return;
        }

        const cleanName = universe.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (format === 'md') {
            const markdownContent = this.generateUniverseMarkdown([universe]);
            const filename = `semesta_${cleanName}_lore.md`;
            this.downloadMarkdown(filename, markdownContent);
            app.showAlert("Data Semesta berhasil diekspor ke format Markdown (.md).", "success");
        } else {
            const populatedUniverse = this.populateUniverse(universe);
            const exportedData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    sourceApp: "Novel Lore Manager - Modular"
                },
                universe: populatedUniverse
            };

            const filename = `semesta_${cleanName}_lore.json`;
            app.downloadJSON(filename, exportedData); 
            app.showAlert("Data Semesta berhasil diekspor secara lengkap (JSON).", "success");
        }
    },

    // --- EXPORT MULTI UNIVERSE ---
    exportMultiUniverse() {
        if (!app.data.universes || app.data.universes.length === 0) {
            app.showAlert("Tidak ada data semesta untuk diekspor.", "error");
            return;
        }
        
        const oldModal = document.getElementById('export-multi-modal');
        if (oldModal) oldModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'export-multi-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
        
        const listHTML = app.data.universes.map(u => `
        <label class="flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-700/50 rounded-lg cursor-pointer transition select-none border border-slate-700/50"> 
            <input type="checkbox" name="universeExportSelect" value="${u.id}" checked class="w-4.5 h-4.5 rounded border-slate-650 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2"> 
            <div class="flex-1 min-w-0"> 
                <span class="text-sm font-semibold text-slate-100 block truncate">${u.name}</span> 
                <span class="text-xs text-slate-400 block truncate">${u.description || 'Tidak ada deskripsi semesta.'}</span> 
            </div> 
        </label>
        `).join('');

        modal.innerHTML = `
        <div class="bg-slate-800 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div class="p-4 bg-slate-850 border-b border-slate-700 flex justify-between items-center">
                <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">Ekspor Multi Semesta</h3>
                <button id="export-multi-close" class="text-slate-400 hover:text-slate-200 transition text-lg font-bold">×</button>
            </div>
            
            <div class="p-4 flex-1 overflow-y-auto space-y-4">
                <p class="text-xs text-slate-400">Pilih semesta mana saja yang ingin digabungkan ke dalam satu berkas ekspor.</p>

                <div class="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 space-y-2">
                    <span class="text-xs font-semibold text-slate-300 block">Format Berkas Ekspor:</span>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input type="radio" name="exportFormatRadio" value="json" class="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700">
                            JSON (Lengkap + ID)
                        </label>
                        <label class="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input type="radio" name="exportFormatRadio" value="md" checked class="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700">
                            Markdown (.md Rapi & Ringkas)
                        </label>
                    </div>
                </div>

                <div class="flex gap-4 border-b border-slate-700/60 pb-2">
                    <button id="export-multi-select-all" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">Pilih Semua</button>
                    <button id="export-multi-deselect-all" class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition">Kosongkan</button>
                </div>

                <div class="space-y-2 max-h-[35vh] overflow-y-auto pr-1" id="export-multi-list">
                    ${listHTML}
                </div>
            </div>

            <div class="p-4 bg-slate-850 border-t border-slate-700 flex justify-end gap-2">
                <button id="export-multi-cancel" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold transition">
                    Batal
                </button>
                <button id="export-multi-submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow transition flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Ekspor Gabungan
                </button>
            </div>
        </div>
        `;
        
        document.body.appendChild(modal);
        
        const destroyModal = () => modal.remove();
        document.getElementById('export-multi-close').onclick = destroyModal;
        document.getElementById('export-multi-cancel').onclick = destroyModal;
        
        const checkboxes = modal.querySelectorAll('input[name="universeExportSelect"]');
        
        document.getElementById('export-multi-select-all').onclick = () => checkboxes.forEach(cb => cb.checked = true);
        document.getElementById('export-multi-deselect-all').onclick = () => checkboxes.forEach(cb => cb.checked = false);
        
        document.getElementById('export-multi-submit').onclick = () => {
            const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            const format = modal.querySelector('input[name="exportFormatRadio"]:checked')?.value || 'json';
                
            if (selectedIds.length === 0) {
                app.showAlert("Pilihlah setidaknya satu semesta untuk diekspor!", "error");
                return;
            }

            const targetUniverses = selectedIds
                .map(id => app.data.universes.find(u => u.id === id))
                .filter(Boolean);

            const timestamp = new Date().toISOString().slice(0, 10);

            if (format === 'md') {
                const markdownContent = this.generateUniverseMarkdown(targetUniverses);
                const filename = `multi_semesta_lore_${timestamp}.md`;
                this.downloadMarkdown(filename, markdownContent);
                app.showAlert(`${targetUniverses.length} Semesta berhasil diekspor ke Markdown!`, "success");
            } else {
                const exportedUniverses = targetUniverses.map(u => this.populateUniverse(u));
                const exportedData = {
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        sourceApp: "Novel Lore Manager - Modular",
                        totalUniverses: exportedUniverses.length
                    },
                    universes: exportedUniverses
                };
                const filename = `multi_semesta_lore_${timestamp}.json`;
                app.downloadJSON(filename, exportedData);
                app.showAlert(`${exportedUniverses.length} Semesta berhasil diekspor ke JSON!`, "success");
            }

            destroyModal();
        };
    },

    // --- GENERATOR FORMAT MARKDOWN (.MD) ---
    generateUniverseMarkdown(universesInput) {
        const universes = Array.isArray(universesInput) ? universesInput : [universesInput];
        
        const referencedSkillIds = new Set();
        const referencedItemIds = new Set();
        const referencedFamiliarIds = new Set();

        const md = [];

        universes.forEach((universe, uIndex) => {
            md.push(`# Semesta: ${universe.name || 'Tanpa Nama'}`);
            
            if (universe.description) {
                const cleanDesc = universe.description.replace(/\n+/g, ' ').trim();
                md.push(cleanDesc);
            }
            md.push('');

            // 1. LORE
            if (universe.lores && universe.lores.length > 0) {
                md.push(`## Lore & Pengetahuan Semesta`);
                universe.lores.forEach(lore => {
                    const content = typeof lore === 'string' ? lore : (lore.content || lore.text || '');
                    if (content) md.push(`- ${content}`);
                });
                md.push('');
                md.push('---');
            }

            // Helper terpadu untuk merender Tokoh & Monster
            const renderEntity = (entity) => {
                md.push(`#### ${entity.name || 'Tanpa Nama'}`);
                
                const meta = [];
                const watakRaw = entity.watak || entity.personality;
                if (watakRaw) {
                    const formattedWatak = Array.isArray(watakRaw) 
                        ? watakRaw.join(', ')
                        : String(watakRaw).split(',').map(s => s.trim()).filter(Boolean).join(', ');
                    if (formattedWatak) meta.push(`**Watak/Sifat:** ${formattedWatak}`);
                }
                if (meta.length > 0) md.push(meta.join(' | ') + '\n');

                if (entity.appearance) {
                    const cleanAppearance = String(entity.appearance).replace(/\n+/g, ' ').trim();
                    if (cleanAppearance) md.push(`**Penampilan:** ${cleanAppearance}\n`);
                }

                const bgRaw = entity.background || entity.description;
                if (bgRaw) {
                    const cleanBg = String(bgRaw).replace(/\n+/g, ' ').trim();
                    if (cleanBg) md.push(`**Latar Belakang:** ${cleanBg}\n`);
                }

                // Skill (Kumpulkan ID ke Set)
                if (entity.skillIds && entity.skillIds.length > 0) {
                    const validSkills = entity.skillIds
                        .map(sId => (app.data.skills || []).find(s => s.id === sId))
                        .filter(Boolean);

                    if (validSkills.length > 0) {
                        md.push(`**Skill:**`);
                        validSkills.forEach(sk => {
                            referencedSkillIds.add(sk.id);
                            md.push(`- ${sk.name}`);
                        });
                        md.push('');
                    }
                }

                // Item (Kumpulkan ID & Skill bawaan Item ke Set)
                if (entity.itemIds && entity.itemIds.length > 0) {
                    const validItems = entity.itemIds
                        .map(iId => (app.data.items || []).find(i => i.id === iId))
                        .filter(Boolean);

                    if (validItems.length > 0) {
                        md.push(`**Item:**`);
                        validItems.forEach(it => {
                            referencedItemIds.add(it.id);
                            if (it.skillIds) it.skillIds.forEach(id => referencedSkillIds.add(id));
                            md.push(`- ${it.name}`);
                        });
                        md.push('');
                    }
                }

                // Pet / Familiar (Kumpulkan ID, Skill, & Item bawaan Pet ke Set)
                if (entity.familiarIds && entity.familiarIds.length > 0) {
                    const validFams = entity.familiarIds
                        .map(fId => (app.data.familiars || []).find(f => f.id === fId))
                        .filter(Boolean);

                    if (validFams.length > 0) {
                        md.push(`**Pet/Familiar:**`);
                        validFams.forEach(fam => {
                            referencedFamiliarIds.add(fam.id);
                            if (fam.skillIds) fam.skillIds.forEach(id => referencedSkillIds.add(id));
                            if (fam.itemIds) fam.itemIds.forEach(id => referencedItemIds.add(id));
                            md.push(`- ${fam.name}`);
                        });
                        md.push('');
                    }
                }

                // Catatan / Notes
                if (entity.notes && entity.notes.length > 0) {
                    md.push(`**Catatan:**`);
                    entity.notes.forEach(n => md.push(`- ${n}`));
                    md.push('');
                }

                // Dialog Khas
                if (entity.dialogues && entity.dialogues.length > 0) {
                    md.push(`**Dialog Khas:**`);
                    entity.dialogues.forEach(d => md.push(`- ${d}`));
                    md.push('');
                }

                md.push('');
            };

            // 2. TOKOH / KARAKTER
            if (universe.characters && Object.keys(universe.characters).length > 0) {
                md.push(`## Daftar Tokoh / Karakter`);
                for (const [catName, charList] of Object.entries(universe.characters)) {
                    if (!Array.isArray(charList) || charList.length === 0) continue;
                    
                    md.push(`### Kategori: ${catName}`);
                    if (universe.charactersCategoryDescriptions?.[catName]) {
                        md.push(`*${universe.charactersCategoryDescriptions[catName]}*\n`);
                    }

                    charList.forEach(char => renderEntity(char));
                }
                md.push('---');
            }

            // 3. MONSTER / MAKHLUK
            if (universe.monsters && Object.keys(universe.monsters).length > 0) {
                md.push(`## Daftar Monster / Makhluk`);
                for (const [catName, monsterList] of Object.entries(universe.monsters)) {
                    if (!Array.isArray(monsterList) || monsterList.length === 0) continue;

                    md.push(`### Kategori: ${catName}`);
                    if (universe.monstersCategoryDescriptions?.[catName]) {
                        md.push(`*${universe.monstersCategoryDescriptions[catName]}*\n`);
                    }

                    monsterList.forEach(m => renderEntity(m));
                }
                md.push('---');
            }

            // 4. LOKASI
            if (universe.locations && universe.locations.length > 0) {
                md.push(`## Daftar Lokasi`);
                universe.locations.forEach(loc => this.renderLocationRecursive(loc, 3, md));
                md.push('---');
            }

            if (uIndex < universes.length - 1) {
                md.push('\n==================================================\n');
            }
        });

        // 5. LAMPIRAN ENSIKLOPEDIA FANTASI
        md.push(`# Lampiran Ensiklopedia Fantasi`);
        md.push(`*Daftar rincian detail seluruh Skill, Item, dan Familiar yang digunakan oleh tokoh/monster di atas.*\n`);


        // --- A. FAMILIAR / PET ---
        if (referencedFamiliarIds.size > 0) {
            md.push(`## Daftar Familiar / Pet`);
            referencedFamiliarIds.forEach(fId => {
                const fam = (app.data.familiars || []).find(f => f.id === fId);
                if (fam) {
                    md.push(`### ${fam.name}`);
                    const details = [];
                    if (fam.species || fam.type) details.push(`**Spesies/Tipe:** ${fam.species || fam.type}`);
                    if (fam.status) details.push(`**Status:** ${fam.status}`);
                    if (details.length > 0) md.push(details.join(' | '));

                    if (fam.personality) {
                        const pStr = Array.isArray(fam.personality) ? fam.personality.join(', ') : fam.personality;
                        if (pStr) md.push(`**Kepribadian:** ${pStr}`);
                    }

                    if (fam.appearance) {
                        const cleanApp = cleanMultilineText(fam.appearance);
                        if (cleanApp) md.push(`**Penampilan:**\n${cleanApp}`);
                    }

                    if (fam.description) {
                        const cleanDesc = cleanMultilineText(fam.description);
                        if (cleanDesc) md.push(`**Deskripsi**\n${cleanDesc}`);
                    }

                    // Render daftar Skill yang dimiliki Pet / Familiar
                    const skillList = (fam.skills || (fam.skillIds || []).map(sId => (app.data.skills || []).find(s => s.id === sId))).filter(Boolean);
                    if (skillList.length > 0) {
                        const validSkills = skillList.filter(s => s && s.name);
                        if (validSkills.length > 0) {
                            md.push(`**Skill:**`);
                            validSkills.forEach(sk => md.push(`- ${sk.name}`));
                        }
                    }

                    // Render daftar Item yang dimiliki Pet / Familiar
                    const itemList = (fam.items || (fam.itemIds || []).map(iId => (app.data.items || []).find(i => i.id === iId))).filter(Boolean);
                    if (itemList.length > 0) {
                        const validItems = itemList.filter(i => i && i.name);
                        if (validItems.length > 0) {
                            md.push(`**Item:**`);
                            validItems.forEach(i => md.push(`- ${i.name}`));
                        }
                    }

                    if (fam.notes && fam.notes.length > 0) {
                        const validNotes = fam.notes.filter(Boolean);
                        if (validNotes.length > 0) {
                            md.push(`**Catatan:**`);
                            validNotes.forEach(n => md.push(`- ${n}`));
                        }
                    }

                    if (fam.dialogues && fam.dialogues.length > 0) {
                        const validDialogues = fam.dialogues.filter(Boolean);
                        if (validDialogues.length > 0) {
                            md.push(`**Dialog Khas:**`);
                            validDialogues.forEach(d => md.push(`- ${d}`));
                        }
                    }

                    md.push('');
                }
            });
        }


        // --- B. ITEM ---
        if (referencedItemIds.size > 0) {
            md.push(`## Daftar Item`);
            referencedItemIds.forEach(iId => {
                const it = (app.data.items || []).find(i => i.id === iId);
                if (it) {
                    md.push(`### ${it.name}`);
                    const details = [];
                    if (it.type) details.push(`**Tipe:** ${it.type}`);
                    if (it.rarity) details.push(`**Kelangkaan:** ${it.rarity}`);
                    if (details.length > 0) md.push(details.join(' | '));

                    if (it.appearance) {
                        const cleanApp = cleanMultilineText(it.appearance);
                        if (cleanApp) md.push(`**Penampilan:**\n${cleanApp}`);
                    }

                    const itemDesc = cleanMultilineText(it.description || it.effect);
                    if (itemDesc) md.push(`**Efek**\n${itemDesc}`);

                    // Render daftar Skill yang melekat pada Item
                    const skillList = (it.skills || (it.skillIds || []).map(sId => (app.data.skills || []).find(s => s.id === sId))).filter(Boolean);
                    if (skillList.length > 0) {
                        const validSkills = skillList.filter(s => s && s.name);
                        if (validSkills.length > 0) {
                            md.push(`**Skill:**`);
                            validSkills.forEach(sk => md.push(`- ${sk.name}`));
                        }
                    }

                    md.push('');
                }
            });
            md.push('---');
        }

        // --- C. SKILL ---
        if (referencedSkillIds.size > 0) {
            md.push(`## Daftar Skill`);
            referencedSkillIds.forEach(sId => {
                const sk = (app.data.skills || []).find(s => s.id === sId);
                if (sk) {
                    md.push(`### ${sk.name}`);
                    if (sk.background) md.push(`**Latar Belakang**\n${cleanMultilineText(sk.background)}`); 
                    if (sk.description) md.push(`**Efek**\n${cleanMultilineText(sk.description)}`); 
                    md.push('');
                }
            });
            md.push('---');
        }
        return md.join('\n');
    },

    // --- HELPER UNTUK POPULATED UNIVERSE (JSON) REVISED ---
    populateUniverse(universe) {
        const populatedCharacters = JSON.parse(JSON.stringify(universe.characters || {}));
        const populatedMonsters = JSON.parse(JSON.stringify(universe.monsters || {}));
        
        // 1. POPULATE KARAKTER (Abaikan ID yang terhapus)
        for (let category in populatedCharacters) {
            if (Array.isArray(populatedCharacters[category])) {
                populatedCharacters[category].forEach(char => {
                    if (char.skillIds && Array.isArray(char.skillIds) && app.data.skills) {
                        char.skills = char.skillIds
                            .map(sId => app.data.skills.find(s => s.id === sId))
                            .filter(Boolean);
                        delete char.skillIds;
                    }
                    
                    if (char.itemIds && Array.isArray(char.itemIds) && app.data.items) {
                        char.items = char.itemIds
                            .map(itemId => {
                                const masterItem = app.data.items.find(i => i.id === itemId);
                                if (masterItem) {
                                    const fullItem = JSON.parse(JSON.stringify(masterItem));
                                    if (fullItem.skillIds && Array.isArray(fullItem.skillIds) && app.data.skills) {
                                        fullItem.skills = fullItem.skillIds
                                            .map(sId => app.data.skills.find(s => s.id === sId))
                                            .filter(Boolean);
                                        delete fullItem.skillIds;
                                    }
                                    return fullItem;
                                }
                                return null;
                            })
                            .filter(Boolean);
                        delete char.itemIds;
                    }

                    if (char.familiarIds && Array.isArray(char.familiarIds) && app.data.familiars) {
                        char.familiars = char.familiarIds
                            .map(famId => {
                                const masterFam = app.data.familiars.find(f => f.id === famId);
                                if (masterFam) {
                                    const fullFam = JSON.parse(JSON.stringify(masterFam));
                                    if (fullFam.skillIds && Array.isArray(fullFam.skillIds) && app.data.skills) {
                                        fullFam.skills = fullFam.skillIds
                                            .map(sId => app.data.skills.find(s => s.id === sId))
                                            .filter(Boolean);
                                        delete fullFam.skillIds;
                                    }
                                    return fullFam;
                                }
                                return null;
                            })
                            .filter(Boolean);
                        delete char.familiarIds;
                    }
                });
            }
        }

        // 2. POPULATE MONSTER (Abaikan ID yang terhapus)
        for (let category in populatedMonsters) {
            if (Array.isArray(populatedMonsters[category])) {
                populatedMonsters[category].forEach(monster => {
                    if (monster.skillIds && Array.isArray(monster.skillIds) && app.data.skills) {
                        monster.skills = monster.skillIds
                            .map(sId => app.data.skills.find(s => s.id === sId))
                            .filter(Boolean);
                        delete monster.skillIds;
                    }
                    if (monster.itemIds && Array.isArray(monster.itemIds) && app.data.items) {
                        monster.items = monster.itemIds
                            .map(iId => app.data.items.find(i => i.id === iId))
                            .filter(Boolean);
                        delete monster.itemIds;
                    }
                    if (monster.familiarIds && Array.isArray(monster.familiarIds) && app.data.familiars) {
                        monster.familiars = monster.familiarIds
                            .map(fId => app.data.familiars.find(f => f.id === fId))
                            .filter(Boolean);
                        delete monster.familiarIds;
                    }
                });
            }
        }

        return {
            id: universe.id,
            name: universe.name,
            description: universe.description,
            lores: universe.lores || [],
            charactersCategoryDescriptions: universe.charactersCategoryDescriptions || {},
            characters: populatedCharacters,
            monstersCategoryDescriptions: universe.monstersCategoryDescriptions || {},
            monsters: populatedMonsters,
            locations: universe.locations || []
        };
    },

    renderLocationRecursive(loc, depth, mdArray) {
        const heading = '#'.repeat(depth);
        mdArray.push(`${heading} ${loc.name || 'Lokasi Tanpa Nama'}`);
        if (loc.type) mdArray.push(`**Tipe:** ${loc.type}`);
        if (loc.description) mdArray.push(`**Deskripsi** \ncleanMultilineText(${loc.description})`);
        if (loc.visuals) mdArray.push(`**Visual:** \ncleanMultilineText(${loc.visuals})`);
        mdArray.push('');

        // Rekursi untuk children
        if (loc.children && loc.children.length > 0) {
            loc.children.forEach(child => this.renderLocationRecursive(child, depth + 1, mdArray));
        }
    }
};


const cleanMultilineText = (text) => {
    if (!text) return '';
    return String(text)
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .join('\n');
};