/**
 * NovelBasicInfoModule
 * Mengurus semua logika tampilan, manipulasi data, dan Export mendetail 
 * untuk Informasi Dasar Cerita/Novel.
 */
export const NovelBasicInfoModule = {
    
    // --- RENDER VIEW UTAMA ---
    renderStoryInfo() {
        const info = this.data.storyInfo;

        // 1. Kumpulkan semua karakter dari kategori "Main Character" / "Karakter Utama" di semua semesta
        let allCharacters = [];
        this.data.universes.forEach(univ => {
            if (univ.characters) {
                for (let category in univ.characters) {
                    if (category.toLowerCase() === 'main character' || category.toLowerCase() === 'karakter utama') {
                        univ.characters[category].forEach(char => {
                            allCharacters.push({ id: char.id, name: char.name, universeName: univ.name });
                        });
                    }
                }
            }
        });

        // 2. Buat HTML untuk Checkbox pilihan karakter utama
        let charOptionsHtml = allCharacters.map(char => {
            const isChecked = (info.mainCharacters || []).includes(char.id) ? 'checked' : '';
            return `
                <label class="flex items-center space-x-2 bg-slate-900 p-2 rounded border border-slate-700 hover:border-slate-600 cursor-pointer text-sm">
                    <input type="checkbox" value="${char.id}" ${isChecked} onchange="app.toggleMainCharacter('${char.id}')" class="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700">
                    <span class="text-slate-200">${char.name} <span class="text-slate-500 text-xs">(${char.universeName})</span></span>
                </label>
            `;
        }).join('');
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center border-b border-slate-700 pb-4">
                    <div>
                        <h2 class="text-xl font-bold text-slate-100">Informasi Dasar Cerita</h2>
                        <p class="text-xs text-slate-400">Pengaturan meta-data utama untuk novel Anda</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="app.exportStoryInfo('json')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded shadow text-sm flex items-center transition">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            Export JSON
                        </button>
                        <button onclick="app.exportStoryInfo('md')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow text-sm flex items-center transition">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            Export Markdown (.md)
                        </button>
                    </div>
                </div>

                <div class="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Judul Cerita / Novel</label>
                            <input type="text" id="storyTitle" value="${info.title || ''}" oninput="app.saveStoryInfo()" placeholder="Masukkan judul novel..." class="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sinopsis Utama</label>
                            <textarea id="storySynopsis" oninput="app.saveStoryInfo()" rows="12" placeholder="Tuliskan sinopsis cerita di sini..." class="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500">${info.synopsis || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">World Building / Aturan Dunia</label>
                            <textarea id="storyWorld" oninput="app.saveStoryInfo()" rows="12" placeholder="Tuliskan aturan dunia, sistem sihir, geografi, atau sejarah penting semesta di sini..." class="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500">${info.worldBuilding || ''}</textarea>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
                    <h3 class="text-lg font-bold text-indigo-400 mb-2 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Pilih Karakter Utama
                    </h3>
                    <p class="text-xs text-slate-400 mb-4">Pilih karakter yang menjadi sorotan utama dari berbagai semesta. Karakter diambil dari kategori "Main Character".</p>
                    
                    ${allCharacters.length === 0 ? 
                        `<div class="text-sm text-slate-500 bg-slate-900 p-4 rounded border border-dashed border-slate-700 text-center">Belum ada karakter di kategori "Main Character" pada semesta manapun. Buat karakter terlebih dahulu.</div>` : 
                        `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">${charOptionsHtml}</div>`
                    }
                </div>
            </div>
        `;
    },

    // --- LOGIKA AKSI DAN EVENT ---

    saveStoryInfo() {
        const titleVal = document.getElementById('storyTitle').value;
        const synopsisVal = document.getElementById('storySynopsis').value;
        const worldVal = document.getElementById('storyWorld').value;

        this.data.storyInfo.title = titleVal;
        this.data.storyInfo.synopsis = synopsisVal;
        this.data.storyInfo.worldBuilding = worldVal;

        this.saveData(true); 
    },

    toggleMainCharacter(charId) {
        if (!this.data.storyInfo.mainCharacters) {
            this.data.storyInfo.mainCharacters = [];
        }
        
        const index = this.data.storyInfo.mainCharacters.indexOf(charId);
        if (index === -1) {
            this.data.storyInfo.mainCharacters.push(charId); // Centang (Tambah)
        } else {
            this.data.storyInfo.mainCharacters.splice(index, 1); // Hapus centang
        }
        this.saveData(true);
    },

    // --- HELPER POPULATE CHARACTER DATA ---
    getDetailedCharacters() {
        const info = this.data.storyInfo;

        const populateSkills = (skillIds) => {
            if (!Array.isArray(skillIds)) return [];
            return skillIds.map(skillId => {
                const skillMatch = this.data.skills?.find(s => s.id === skillId);
                return skillMatch ? { ...skillMatch } : { id: skillId, note: "Skill tidak ditemukan di data master" };
            });
        };

        const populateItems = (itemIds) => {
            if (!Array.isArray(itemIds)) return [];
            return itemIds.map(itemId => {
                const itemMatch = this.data.items?.find(i => i.id === itemId);
                if (itemMatch) {
                    const fullItem = JSON.parse(JSON.stringify(itemMatch));
                    if (fullItem.skillIds && Array.isArray(fullItem.skillIds)) {
                        fullItem.skills = populateSkills(fullItem.skillIds);
                        delete fullItem.skillIds;
                    }
                    return fullItem;
                }
                return { id: itemId, note: "Item tidak ditemukan di data master" };
            });
        };

        const populateFamiliars = (familiarIds) => {
            if (!Array.isArray(familiarIds)) return [];
            return familiarIds.map(famId => {
                const familiarMatch = this.data.familiars?.find(f => f.id === famId);
                if (familiarMatch) {
                    const detailedFamiliar = JSON.parse(JSON.stringify(familiarMatch));
                    
                    detailedFamiliar.personality = familiarMatch.personality || '';
                    detailedFamiliar.dialogues = familiarMatch.dialogues || [];
                    
                    if (detailedFamiliar.skillIds) {
                        detailedFamiliar.skills = populateSkills(detailedFamiliar.skillIds);
                        delete detailedFamiliar.skillIds;
                    }
                    
                    if (detailedFamiliar.itemIds) {
                        detailedFamiliar.items = populateItems(detailedFamiliar.itemIds);
                        delete detailedFamiliar.itemIds;
                    }

                    if (detailedFamiliar.tagIds) {
                        detailedFamiliar.tags = (detailedFamiliar.tagIds || []).map(tagId => {
                            const tag = this.data.familiarTags?.find(t => t.id === tagId);
                            return tag ? { ...tag } : { id: tagId, note: "Tag tidak ditemukan di data master" };
                        });
                        delete detailedFamiliar.tagIds;
                    }
                    
                    return detailedFamiliar;
                }
                return { id: famId, note: "Familiar tidak ditemukan di data master" };
            });
        };

        return (info.mainCharacters || []).map(charId => {
            let foundChar = null;
            
            for (let univ of (this.data.universes || [])) {
                for (let category in univ.characters) {
                    const match = univ.characters[category].find(c => c.id === charId);
                    if (match) {
                        const charCopy = JSON.parse(JSON.stringify(match));

                        foundChar = { 
                            id: charCopy.id,
                            name: charCopy.name,
                            personality: charCopy.personality || '',
                            background: charCopy.background || '',
                            appearance: charCopy.appearance || '',
                            notes: charCopy.notes || [],
                            dialogues: charCopy.dialogues || [],
                            category: category, 
                            universeName: univ.name,
                            skills: populateSkills(charCopy.skillIds),
                            items: populateItems(charCopy.itemIds),
                            familiars: populateFamiliars(charCopy.familiarIds)
                        };

                        break;
                    }
                }
                if (foundChar) break;
            }
            return foundChar || { id: charId, note: "Karakter telah dihapus dari semesta" };
        });
    },

    // --- HELPER UNTUK UNDUH FILE MARKDOWN ---

    downloadMarkdown(filename, content) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", url);
        dlAnchorElem.setAttribute("download", filename);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        dlAnchorElem.remove();
        URL.revokeObjectURL(url);
    },

    // --- LOGIKA EXPORT MENDETAIL (JSON & MARKDOWN) ---
    
    exportStoryInfo(format = 'json') {
        const info = this.data.storyInfo;
        const detailedCharacters = this.getDetailedCharacters();
        const safeTitle = (info.title || 'novel').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const timestamp = new Date().toISOString().slice(0, 10);

        if (format === 'md') {
            const markdownContent = this.generateStoryInfoMarkdown(info, detailedCharacters);
            const filename = `info_dasar_${safeTitle}_${timestamp}.md`;
            this.downloadMarkdown(filename, markdownContent);
            if (typeof this.showAlert === 'function') {
                this.showAlert("Informasi dasar novel berhasil diekspor ke Markdown (.md).", "success");
            }
        } else {
            // Format JSON
            const exportPayload = {
                title: info.title || "Tanpa Judul",
                synopsis: info.synopsis || "",
                worldBuilding: info.worldBuilding || "",
                mainCharacters: detailedCharacters
            };

            const filename = `novel_information_detailed_${timestamp}.json`;
            if (typeof app !== 'undefined' && app.downloadJSON) {
                app.downloadJSON(filename, exportPayload);
            } else {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", filename);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            }

            if (typeof this.showAlert === 'function') {
                this.showAlert("Informasi dasar novel berhasil diekspor ke JSON.", "success");
            }
        }
    },

    // --- GENERATOR MARKDOWN (.MD) ---
generateStoryInfoMarkdown(info, detailedCharacters) {
        const md = [];
        const referencedSkillIds = new Map();
        const referencedItemIds = new Map();
        const referencedFamiliarIds = new Map();

        // 1. JUDUL NOVEL & SINOPSIS UTAMA
        md.push(`# Judul Novel: ${info.title || 'Tanpa Judul'}\n`);

        if (info.synopsis) {
            const cleanSynopsis = String(info.synopsis)
                .split('\n')
                .map(line => line.trim())
                .filter(line => line !== '')
                .join('\n');

            if (cleanSynopsis) {
                md.push(`## Sinopsis Utama`);
                md.push(`${cleanSynopsis}\n`);
                md.push('---');
            }
        }

        // 2. WORLD BUILDING
        if (info.worldBuilding) {
            const cleanWorld = String(info.worldBuilding)
                .split('\n')
                .map(line => line.trim())
                .filter(line => line !== '')
                .join('\n');

            if (cleanWorld) {
                md.push(`## World Building / Aturan Dunia`);
                md.push(`${cleanWorld}\n`);
                md.push('---');
            }
        }

        // 3. DAFTAR KARAKTER UTAMA
        if (detailedCharacters && detailedCharacters.length > 0) {
            md.push(`## Daftar Karakter Utama\n`);

            detailedCharacters.forEach(char => {
                if (!char || char.note) return; // Skip karakter yang telah dihapus

                md.push(`### ${char.name || 'Tanpa Nama'}`);

                const meta = [];
                if (char.category) meta.push(`**Kategori:** ${char.category}`);
                if (char.universeName) meta.push(`**Semesta:** ${char.universeName}`);
                if (char.personality) {
                    const pStr = Array.isArray(char.personality) ? char.personality.join(', ') : char.personality;
                    if (pStr) meta.push(`**Watak/Sifat:** ${pStr}`);
                }
                if (meta.length > 0) md.push(meta.join(' | ') + '\n');

                if (char.appearance) {
                    const cleanAppearance = cleanMultilineText(char.appearance);
                    if (cleanAppearance) md.push(`**Penampilan:** \n${cleanAppearance}\n`);
                }

                if (char.background) {
                    const cleanBg = cleanMultilineText(char.background)
                    if (cleanBg) md.push(`**Latar Belakang:** \n${cleanBg}\n`);
                }

                // Skill (Format Ringkas - Nama Saja & Kumpulkan ke Map untuk Glosarium)
                if (char.skills && char.skills.length > 0) {
                    const validSkills = char.skills.filter(s => s && s.name);
                    if (validSkills.length > 0) {
                        md.push(`**Skill:**`);
                        validSkills.forEach(sk => {
                            referencedSkillIds.set(sk.id, sk);
                            md.push(`- ${sk.name}`);
                        });
                        md.push('');
                    }
                }

                // Item (Format Ringkas - Nama Saja & Kumpulkan ke Map untuk Glosarium)
                if (char.items && char.items.length > 0) {
                    const validItems = char.items.filter(i => i && i.name);
                    if (validItems.length > 0) {
                        md.push(`**Item:**`);
                        validItems.forEach(it => {
                            referencedItemIds.set(it.id, it);
                            if (it.skills) {
                                it.skills.forEach(s => s && s.id && referencedSkillIds.set(s.id, s));
                            }
                            md.push(`- ${it.name}`);
                        });
                        md.push('');
                    }
                }

                // Pet / Familiar (Format Ringkas - Nama Saja & Kumpulkan ke Map untuk Glosarium)
                if (char.familiars && char.familiars.length > 0) {
                    const validFams = char.familiars.filter(f => f && f.name);
                    if (validFams.length > 0) {
                        md.push(`**Pet/Familiar:**`);
                        validFams.forEach(fam => {
                            referencedFamiliarIds.set(fam.id, fam);
                            if (fam.skills) {
                                fam.skills.forEach(s => s && s.id && referencedSkillIds.set(s.id, s));
                            }
                            if (fam.items) {
                                fam.items.forEach(i => i && i.id && referencedItemIds.set(i.id, i));
                            }
                            md.push(`- ${fam.name}`);
                        });
                        md.push('');
                    }
                }

                // Catatan
                if (char.notes && char.notes.length > 0) {
                    md.push(`**Catatan:**`);
                    char.notes.forEach(n => md.push(`- ${n}`));
                    md.push('');
                }

                // Dialog Khas
                if (char.dialogues && char.dialogues.length > 0) {
                    md.push(`**Dialog Khas:**`);
                    char.dialogues.forEach(d => md.push(`- ${d}`));
                    md.push('');
                }

                md.push('');
            });

            md.push('---');
        }

        // 4. GLOSARIUM / LAMPIRAN ENSIKLOPEDIA DI BAGIAN BAWAH
        if (referencedSkillIds.size > 0 || referencedItemIds.size > 0 || referencedFamiliarIds.size > 0) {
            md.push(`# Glosarium / Lampiran Ensiklopedia`);
            md.push(`*Daftar rincian detail seluruh Skill, Item, dan Familiar yang digunakan oleh karakter utama di atas.*\n`);

            if (referencedSkillIds.size > 0) {
                md.push(`## Daftar Skill`);
                referencedSkillIds.forEach(sk => {
                    md.push(`### ${sk.name}`);
                    const details = [];
                    if (details.length > 0) md.push(details.join(' | '));

                    if (sk.background) {
                        const cleanBg = String(sk.background)
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line !== '')
                            .join('\n');
                        if (cleanBg) md.push(`**Latar Belakang:**\n${cleanBg}`);
                    }

                    if (sk.description) {
                        const cleanDesc = String(sk.description)
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line !== '')
                            .join('\n');
                        if (cleanDesc) md.push(`**Efek**\n${cleanDesc}`);
                    }
                    md.push('');
                });
                md.push('---');
            }

            if (referencedItemIds.size > 0) {
                md.push(`## Daftar Item`);
                referencedItemIds.forEach(it => {
                    md.push(`### ${it.name}`);
                    const details = [];
                    if (it.appearance) {
                        const cleanApp = cleanMultilineText(it.appearance)
                        if (cleanApp) md.push(`**Penampilan:** \n${cleanApp}\n`);
                    }
                    const itemDesc = cleanMultilineText(it.description || it.effect);
                    if (itemDesc) {
                        md.push(`**Efek**\n${itemDesc}\n`);
                    }
                    if (it.skills && it.skills.length > 0) {
                        const validSkills = it.skills.filter(s => s && s.name);
                        if (validSkills.length > 0) {
                            md.push(`**Skill:**`);
                            validSkills.forEach(sk => md.push(`- ${sk.name}`));
                        }
                    }
                    md.push('');
                });
                md.push('---');
            }

            if (referencedFamiliarIds.size > 0) {
                md.push(`## Daftar Familiar / Pet`);
                referencedFamiliarIds.forEach(fam => {
                    md.push(`### ${fam.name}`);
                    const details = [];
                    if (fam.personality) {
                        const pStr = Array.isArray(fam.personality) ? fam.personality.join(', ') : fam.personality;
                        if (pStr) md.push(`**Kepribadian:** ${pStr}`);
                    }
                    if (fam.appearance) {
                        const cleanApp = cleanMultilineText(fam.appearance)
                        if (cleanApp) md.push(`**Penampilan:** \n${cleanApp}`);
                    }
                    if (fam.description) {
                        const cleanDesc = cleanMultilineText(fam.description);
                        if (cleanDesc) md.push(`**Deskripsi**\n${cleanDesc}`);
                    }
                    if (fam.skills && fam.skills.length > 0) {
                        const validSkills = fam.skills.filter(s => s && s.name);
                        if (validSkills.length > 0) {
                            md.push(`**Skill:**`);
                            validSkills.forEach(sk => md.push(`- ${sk.name}`));
                        }
                    }
                    if (fam.items && fam.items.length > 0) {
                        const validItems = fam.items.filter(i => i && i.name);
                        if (validItems.length > 0) {
                            md.push(`**Item:**`);
                            validItems.forEach(it => md.push(`- ${it.name}`));
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
            );
            }
        }

        return md.join('\n');
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