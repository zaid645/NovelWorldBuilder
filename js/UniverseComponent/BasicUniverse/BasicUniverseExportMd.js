// Logika bantuan export md

export const BasicUniverseExportMd = {
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
}