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
                    <button onclick="app.exportStoryInfo()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow text-sm flex items-center transition">
                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Export Info Dasar (Detail)
                    </button>
                </div>

                <div class="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Judul Cerita / Novel</label>
                            <input type="text" id="storyTitle" value="${info.title || ''}" oninput="app.saveStoryInfo()" placeholder="Masukkan judul novel..." class="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sinopsis Utama</label>
                            <textarea id="storySynopsis" oninput="app.saveStoryInfo()" rows="6" placeholder="Tuliskan sinopsis cerita di sini..." class="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500">${info.synopsis || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">World Building / Aturan Dunia</label>
                            <textarea id="storyWorld" oninput="app.saveStoryInfo()" rows="5" placeholder="Tuliskan aturan dunia, sistem sihir, geografi, atau sejarah penting semesta di sini..." class="w-full bg-slate-900 text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500">${info.worldBuilding || ''}</textarea>
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

    // --- LOGIKA EXPORT MENDETAIL ---
    
    exportStoryInfo() {
        const info = this.data.storyInfo;
        
        // 1. Petakan array ID karakter menjadi objek informasi yang sangat lengkap
        const detailedCharacters = (info.mainCharacters || []).map(charId => {
            let foundChar = null;
            
            // Cari data karakter di setiap semesta dan setiap kategori
            for (let univ of this.data.universes) {
                for (let category in univ.characters) {
                    const match = univ.characters[category].find(c => c.id === charId);
                    if (match) {
                        foundChar = { 
                            id: match.id,
                            name: match.name,
                            personality: match.personality,
                            background: match.background,
                            appearance: match.appearance,
                            dialogues: match.dialogues || [],
                            category: category, 
                            universeName: univ.name 
                        };
                        
                        // Populate Skills
                        foundChar.skills = (match.skillIds || []).map(skillId => {
                            const skillMatch = this.data.skills.find(s => s.id === skillId);
                            return skillMatch ? { ...skillMatch } : { id: skillId, name: "Skill tidak valid" };
                        });

                        // Populate Items
                        foundChar.items = (match.itemIds || []).map(itemId => {
                            const itemMatch = this.data.items.find(i => i.id === itemId);
                            return itemMatch ? { ...itemMatch } : { id: itemId, name: "Item tidak valid" };
                        });

                        // Populate Familiars beserta nested skills & items-nya
                        foundChar.familiars = (match.familiarIds || []).map(familiarId => {
                        const familiarMatch = this.data.familiars.find(f => f.id === familiarId);
                        
                        if (familiarMatch) {
                            const detailedFamiliar = { ...familiarMatch };
                            
                            // ============================================================
                            // PERUBAHAN DI SINI: Proteksi data watak & dialog familiar
                            // ============================================================
                            detailedFamiliar.personality = familiarMatch.personality || '';
                            detailedFamiliar.dialogues = familiarMatch.dialogues || [];
                            // ============================================================
                            
                            // Populate Nested Skills untuk Familiar
                            detailedFamiliar.skills = (familiarMatch.skillIds || []).map(skillId => {
                                const skill = this.data.skills.find(s => s.id === skillId);
                                return skill ? { ...skill } : { id: skillId, name: "Skill tidak valid" };
                            });
                            delete detailedFamiliar.skillIds; 
                            
                            // Populate Nested Items untuk Familiar
                            detailedFamiliar.items = (familiarMatch.itemIds || []).map(itemId => {
                                const item = this.data.items.find(i => i.id === itemId);
                                return item ? { ...item } : { id: itemId, name: "Item tidak valid" };
                            });
                            delete detailedFamiliar.itemIds; 

                            // Populate Tags untuk Familiar
                            detailedFamiliar.tags = (familiarMatch.tagIds || []).map(tagId => {
                                const tag = this.data.familiarTags.find(t => t.id === tagId);
                                return tag ? { ...tag } : { id: tagId, name: "Tag tidak valid" };
                            });
                            delete detailedFamiliar.tagIds; 
                            
                            return detailedFamiliar;
                        } else {
                            return { id: angularId, name: "Familiar tidak valid" };
                        }
                    });
                    break;
                    }
                }
            if (foundChar) break;
            }
            return foundChar || { id: charId, name: "Karakter telah dihapus dari semesta" };
        });

        // 2. Buat struktur payload JSON
        const exportPayload = {
            title: info.title || "Tanpa Judul",
            synopsis: info.synopsis || "",
            worldBuilding: info.worldBuilding || "",
            mainCharacters: detailedCharacters
        };

        // 3. Download (Pastikan app utama Anda memiliki fungsi downloadJSON)
        // Memanggil app.downloadJSON karena asumsinya file ini akan di-merge/dijadikan mixin ke dalam object 'app'
        app.downloadJSON("novel_information_detailed.json", exportPayload);
    }
};