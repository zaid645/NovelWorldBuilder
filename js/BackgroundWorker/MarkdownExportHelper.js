// Helper Terpadu untuk Rendering Export Markdown (.md)

export const MdExportHelper = {
    cleanText(text) {
        if (!text) return '';
        return String(text)
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
            .join('\n');
    },

    saveMarkdownFile(filename, content) {
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

    // ==========================================
    // --- RENDER ENTITAS KARAKTER (DAPATKAN METADATA LENGKAP) ---
    // ==========================================
    renderEntity(entity, registry, options = {}) {
        const md = [];
        const headingLevel = options.headingLevel || '####';
        
        md.push(`${headingLevel} ${entity.name || entity.nama || 'Tanpa Nama'}`);

        const meta = [];

        // 1. Peran / Role
        const role = entity.role || entity.peran;
        if (role) meta.push(`**Peran:** ${role}`);

        // 2. Kategori
        if (entity.category || entity.kategori) meta.push(`**Kategori:** ${entity.category || entity.kategori}`);

        // 3. Semesta
        if (entity.universeName || entity.universe) meta.push(`**Semesta:** ${entity.universeName || entity.universe}`);

        // 4. Faksi / Organisasi
        const faction = entity.faction || entity.faksi;
        if (faction) meta.push(`**Faksi:** ${faction}`);

        // 5. Status Tokoh
        if (entity.status) meta.push(`**Status:** ${entity.status}`);

        // 6. Penanganan Ras Fleksibel
        let raceName = '';
        if (entity.race && typeof entity.race === 'object' && entity.race.name) {
            raceName = entity.race.name;
            if (registry && entity.race.id) registry.races.set(entity.race.id, entity.race);
        } else if (entity.raceName) {
            raceName = entity.raceName;
        } else if (typeof entity.race === 'string' && entity.race.trim() !== '') {
            // Cek apakah entity.race adalah ID ras di app.data atau nama langsung
            const foundRace = (app.data?.races || []).find(r => r.id === entity.race || r.name === entity.race);
            if (foundRace) {
                raceName = foundRace.name;
                if (registry) registry.races.set(foundRace.id, foundRace);
            } else {
                raceName = entity.race;
            }
        } else if (entity.raceId) {
            const foundRace = (app.data?.races || []).find(r => r.id === entity.raceId);
            if (foundRace) {
                raceName = foundRace.name;
                if (registry) registry.races.set(foundRace.id, foundRace);
            }
        }
        if (raceName) meta.push(`**Ras:** ${raceName}`);

        // 7. Gender / Jenis Kelamin
        const genderRaw = entity.gender || entity.jenisKelamin;
        if (genderRaw && String(genderRaw).toLowerCase() !== 'none') {
            const gLower = String(genderRaw).toLowerCase();
            const genderText = (gLower === 'jantan' || gLower === 'laki-laki' || gLower === 'pria') 
                ? 'Laki-laki' 
                : (gLower === 'betina' || gLower === 'perempuan' || gLower === 'wanita') 
                ? 'Perempuan' 
                : genderRaw;
            meta.push(`**Gender:** ${genderText}`);
        }

        // 8. Umur / Usia (Menambahkan dukungan kunci 'umur')
        const age = entity.age || entity.usia || entity.umur;
        if (age !== undefined && age !== null && age !== '') meta.push(`**Umur:** ${age}`);

        // 9. Watak / Kepribadian
        const watakRaw = entity.watak || entity.personality || entity.sifat;
        if (watakRaw) {
            const formattedWatak = Array.isArray(watakRaw) 
                ? watakRaw.join(', ')
                : String(watakRaw).split(',').map(s => s.trim()).filter(Boolean).join(', ');
            if (formattedWatak) meta.push(`**Watak:** ${formattedWatak}`);
        }

        // Gabungkan seluruh metadata dalam satu baris ringkas
        if (meta.length > 0) md.push(meta.join(' | ') + '\n');

        // Tujuan & Motivasi
        const goalRaw = entity.goal || entity.motivation || entity.tujuan;
        if (goalRaw) {
            const cleanGoal = this.cleanText(goalRaw);
            if (cleanGoal) md.push(`**Tujuan & Motivasi:**\n${cleanGoal}\n`);
        }

        // Kelebihan & Kelemahan
        if (entity.strengths || entity.weaknesses || entity.flaws) {
            if (entity.strengths) md.push(`**Kelebihan:** ${this.cleanText(entity.strengths)}`);
            const flaws = entity.weaknesses || entity.flaws;
            if (flaws) md.push(`**Kelemahan / Flaws:** ${this.cleanText(flaws)}`);
            md.push('');
        }

        if (entity.appearance) {
            const cleanApp = this.cleanText(entity.appearance);
            if (cleanApp) md.push(`**Penampilan:**\n${cleanApp}\n`);
        }

        const bgRaw = entity.background || entity.description || entity.latarBelakang;
        if (bgRaw) {
            const cleanBg = this.cleanText(bgRaw);
            if (cleanBg) md.push(`**Latar Belakang:**\n${cleanBg}\n`);
        }

        // Skill
        const skills = entity.skills || (entity.skillIds || []).map(sId => (app.data?.skills || []).find(s => s.id === sId)).filter(Boolean);
        if (skills.length > 0) {
            md.push(`**Skill:**`);
            skills.forEach(sk => {
                if (registry) registry.skills.set(sk.id, sk);
                md.push(`- ${sk.name}`);
            });
            md.push('');
        }

        // Item
        const items = entity.items || (entity.itemIds || []).map(iId => (app.data?.items || []).find(i => i.id === iId)).filter(Boolean);
        if (items.length > 0) {
            md.push(`**Item:**`);
            items.forEach(it => {
                if (registry) {
                    registry.items.set(it.id, it);
                    const itemSkills = it.skills || (it.skillIds || []).map(sId => (app.data?.skills || []).find(s => s.id === sId)).filter(Boolean);
                    itemSkills.forEach(s => registry.skills.set(s.id, s));
                }
                md.push(`- ${it.name}`);
            });
            md.push('');
        }

        // Pet / Familiar
        const familiars = entity.familiars || (entity.familiarIds || []).map(fId => (app.data?.familiars || []).find(f => f.id === fId)).filter(Boolean);
        if (familiars.length > 0) {
            md.push(`**Pet / Familiar:**`);
            familiars.forEach(fam => {
                if (registry) {
                    registry.familiars.set(fam.id, fam);
                    if (fam.raceId) {
                        const famRace = (app.data?.races || []).find(r => r.id === fam.raceId);
                        if (famRace) registry.races.set(famRace.id, famRace);
                    }
                    const famSkills = fam.skills || (fam.skillIds || []).map(sId => (app.data?.skills || []).find(s => s.id === sId)).filter(Boolean);
                    famSkills.forEach(s => registry.skills.set(s.id, s));
                    
                    const famItems = fam.items || (fam.itemIds || []).map(iId => (app.data?.items || []).find(i => i.id === iId)).filter(Boolean);
                    famItems.forEach(i => registry.items.set(i.id, i));
                }
                md.push(`- ${fam.name}`);
            });
            md.push('');
        }

        // Relasi
        if (entity.relations && entity.relations.length > 0) {
            md.push(`**Relasi:**`);
            entity.relations.filter(Boolean).forEach(r => md.push(`- ${r}`));
            md.push('');
        }

        // Catatan
        if (entity.notes && entity.notes.length > 0) {
            md.push(`**Catatan:**`);
            entity.notes.filter(Boolean).forEach(n => md.push(`- ${n}`));
            md.push('');
        }

        // Dialog Khas
        if (entity.dialogues && entity.dialogues.length > 0) {
            md.push(`**Dialog Khas:**`);
            entity.dialogues.filter(Boolean).forEach(d => md.push(`- ${d}`));
            md.push('');
        }

        return md.join('\n');
    },

    createRegistry() {
        return {
            familiars: new Map(),
            items: new Map(),
            skills: new Map(),
            races: new Map()
        };
    },

    renderGlossary(registry) {
        const md = [];
        const hasData = registry.races.size > 0 || registry.familiars.size > 0 || registry.items.size > 0 || registry.skills.size > 0;

        if (!hasData) return '';

        md.push(`# Glosarium / Lampiran Ensiklopedia`);
        md.push(`*Daftar rincian detail seluruh Ras, Familiar, Item, dan Skill yang terikat pada entitas di atas.*\n`);

        if (registry.familiars.size > 0) {
            md.push(`## Daftar Familiar / Pet`);
            registry.familiars.forEach(fam => {
                md.push(`### ${fam.name}`);
                
                const details = [];
                let raceName = typeof fam.race === 'string' ? fam.race : (fam.race?.name || '');
                if (!raceName && fam.raceId) {
                    const r = (app.data?.races || []).find(rc => rc.id === fam.raceId);
                    if (r) raceName = r.name;
                }
                if (raceName) details.push(`**Ras:** ${raceName}`);

                const famGender = fam.gender || fam.jenisKelamin;
                if (famGender && famGender !== 'none') {
                    const gLower = String(famGender).toLowerCase();
                    const genderText = (gLower === 'jantan' || gLower === 'laki-laki' || gLower === 'pria') 
                        ? 'Jantan ♂' 
                        : (gLower === 'betina' || gLower === 'perempuan' || gLower === 'wanita') 
                        ? 'Betina ♀' 
                        : famGender;
                    details.push(`**Gender:** ${genderText}`);
                }
                
                const famAge = fam.age || fam.usia;
                if (famAge) details.push(`**Umur:** ${famAge}`);
                if (details.length > 0) md.push(details.join(' | '));

                const pStr = fam.personality || fam.watak || fam.sifat;
                if (pStr) {
                    const formatted = Array.isArray(pStr) ? pStr.join(', ') : pStr;
                    if (formatted) md.push(`**Kepribadian:** ${formatted}`);
                }

                if (fam.appearance) md.push(`**Penampilan:**\n${this.cleanText(fam.appearance)}`);
                if (fam.description) md.push(`**Deskripsi:**\n${this.cleanText(fam.description)}`);

                const famSkills = fam.skills || (fam.skillIds || []).map(sId => (app.data?.skills || []).find(s => s.id === sId)).filter(Boolean);
                if (famSkills.length > 0) {
                    md.push(`**Skill Bawaan:**`);
                    famSkills.forEach(s => md.push(`- ${s.name}`));
                }

                const famItems = fam.items || (fam.itemIds || []).map(iId => (app.data?.items || []).find(i => i.id === iId)).filter(Boolean);
                if (famItems.length > 0) {
                    md.push(`**Item Bawaan:**`);
                    famItems.forEach(i => md.push(`- ${i.name}`));
                }

                if (fam.relations && fam.relations.length > 0) {
                    md.push(`**Relasi:**`);
                    fam.relations.filter(Boolean).forEach(r => md.push(`- ${r}`));
                }

                if (fam.notes && fam.notes.length > 0) {
                    md.push(`**Catatan:**`);
                    fam.notes.filter(Boolean).forEach(n => md.push(`- ${n}`));
                }

                if (fam.dialogues && fam.dialogues.length > 0) {
                    md.push(`**Dialog Khas:**`);
                    fam.dialogues.filter(Boolean).forEach(d => md.push(`- ${d}`));
                }

                md.push('');
            });
            md.push('---');
        }

        if (registry.items.size > 0) {
            md.push(`## Daftar Item`);
            registry.items.forEach(it => {
                md.push(`### ${it.name}`);
                const details = [];
                if (it.type) details.push(`**Tipe:** ${it.type}`);
                if (it.rarity) details.push(`**Kelangkaan:** ${it.rarity}`);
                if (details.length > 0) md.push(details.join(' | '));

                if (it.appearance) md.push(`**Penampilan:**\n${this.cleanText(it.appearance)}`);
                
                const itemDesc = this.cleanText(it.description || it.effect);
                if (itemDesc) md.push(`**Efek / Deskripsi:**\n${itemDesc}`);

                const itemSkills = it.skills || (it.skillIds || []).map(sId => (app.data?.skills || []).find(s => s.id === sId)).filter(Boolean);
                if (itemSkills.length > 0) {
                    md.push(`**Skill Bawaan Item:**`);
                    itemSkills.forEach(s => md.push(`- ${s.name}`));
                }

                md.push('');
            });
            md.push('---');
        }

        if (registry.skills.size > 0) {
            md.push(`## Daftar Skill`);
            registry.skills.forEach(sk => {
                md.push(`### ${sk.name}`);
                if (sk.background) md.push(`**Latar Belakang:**\n${this.cleanText(sk.background)}`);
                if (sk.description) md.push(`**Efek / Deskripsi:**\n${this.cleanText(sk.description)}`);
                md.push('');
            });
            md.push('---');
        }

        if (registry.races.size > 0) {
            md.push(`## Daftar Ras`);
            registry.races.forEach(race => {
                md.push(`### ${race.name}`);
                if (race.description) md.push(`**Deskripsi Ras:**\n${this.cleanText(race.description)}`);
                if (race.traits) md.push(`**Karakteristik/Trait:**\n${this.cleanText(race.traits)}`);
                md.push('');
            });
            md.push('---');
        }

        return md.join('\n');
    },

    renderLocationRecursive(loc, depth = 3, mdArray = []) {
        const heading = '#'.repeat(depth);
        mdArray.push(`${heading} ${loc.name || 'Lokasi Tanpa Nama'}`);
        if (loc.type) mdArray.push(`**Tipe:** ${loc.type}`);
        if (loc.description) mdArray.push(`**Deskripsi:**\n${this.cleanText(loc.description)}`);
        if (loc.visuals) mdArray.push(`**Visual:**\n${this.cleanText(loc.visuals)}`);
        mdArray.push('');

        if (loc.children && loc.children.length > 0) {
            loc.children.forEach(child => this.renderLocationRecursive(child, depth + 1, mdArray));
        }

        return mdArray.join('\n');
    },

    generateUniverseMarkdown(universes = []) {
        const md = [];
        md.push(`# Lore Semesta\n`);

        universes.forEach(u => {
            md.push(`## Semesta: ${u.name || 'Tanpa Nama'}`);
            if (u.description) md.push(`**Deskripsi Semesta:**\n${this.cleanText(u.description)}\n`);

            if (u.locations && u.locations.length > 0) {
                md.push(`### Lokasi & Wilayah`);
                u.locations.forEach(loc => {
                    const locArr = [];
                    this.renderLocationRecursive(loc, 4, locArr);
                    md.push(locArr.join('\n'));
                });
            }
            md.push('---\n');
        });

        return md.join('\n');
    },

    generateStoryInfoMarkdown(info = {}, characters = []) {
        const md = [];
        md.push(`# Informasi Dasar Novel\n`);

        md.push(`## ${info.title || 'Tanpa Judul'}`);
        
        const storyMeta = [];
        if (info.genre) storyMeta.push(`**Genre:** ${info.genre}`);
        if (info.theme) storyMeta.push(`**Tema:** ${info.theme}`);
        if (info.pov) storyMeta.push(`**POV:** ${info.pov}`);
        if (info.targetAudience) storyMeta.push(`**Target Pembaca:** ${info.targetAudience}`);
        if (info.status) storyMeta.push(`**Status:** ${info.status}`);

        if (storyMeta.length > 0) {
            md.push(storyMeta.join(' | ') + '\n');
        }

        if (info.synopsis) md.push(`### Sinopsis\n${this.cleanText(info.synopsis)}\n`);
        if (info.worldBuilding) md.push(`### Konsep Dunia (World Building)\n${this.cleanText(info.worldBuilding)}\n`);

        if (characters && characters.length > 0) {
            const registry = this.createRegistry();
            md.push(`## Karakter Utama & Penting\n`);
            characters.forEach(char => {
                md.push(this.renderEntity(char, registry, { headingLevel: '###' }));
                md.push('---\n');
            });

            const glossaryMd = this.renderGlossary(registry);
            if (glossaryMd) md.push(glossaryMd);
        }

        return md.join('\n');
    }
};