export const BasicUniverseExportMd = {
    // Fungsi khusus untuk pemicu ekspor semesta
    exportUniverseMarkdown(universesInput) {
        const content = this.generateUniverseMarkdown(universesInput);
        const filename = `Export_Semesta.md`;
        app.saveMarkdownFile(filename, content);
    },

    generateUniverseMarkdown(universesInput) {
        const universes = Array.isArray(universesInput) ? universesInput : [universesInput];
        const registry = app.createRegistry();
        const md = [];

        universes.forEach((universe, uIndex) => {
            md.push(`# Semesta: ${universe.name || 'Tanpa Nama'}`);
            if (universe.description) md.push(app.cleanText(universe.description));
            md.push('');

            // 1. Lore & Pengetahuan Semesta
            if (universe.lores && universe.lores.length > 0) {
                md.push(`## Lore & Pengetahuan Semesta`);
                universe.lores.forEach(lore => {
                    const content = typeof lore === 'string' ? lore : (lore.content || lore.text || '');
                    if (content) md.push(`- ${content}`);
                });
                md.push('\n---');
            }

            // Pre-register seluruh Class dan Title semesta ke registry agar Glosarium memiliki data lengkap
            const classList = app.data?.classes || [];
            classList.forEach(cls => {
                const fullClass = JSON.parse(JSON.stringify(cls));
                if (fullClass.skillIds && Array.isArray(fullClass.skillIds) && app.data?.skills) {
                    fullClass.skills = fullClass.skillIds
                        .map(sId => app.data.skills.find(s => s.id === sId))
                        .filter(Boolean);
                    fullClass.skills.forEach(s => registry.skills.set(s.id, s));
                }
                registry.classes.set(fullClass.id, fullClass);
            });

            // Deklarasikan titleList sebelum melakukan perulangan
            const titleList = app.data?.titles || [];
            titleList.forEach(title => {
                if (title && title.id) {
                    registry.titles.set(title.id, title);
                }
            });

            // 2. Karakter (Karakter menampilkan nama class & title, lalu mendaftarkannya ke registry)
            if (universe.characters && Object.keys(universe.characters).length > 0) {
                md.push(`## Daftar Tokoh / Karakter`);
                for (const [catName, charList] of Object.entries(universe.characters)) {
                    if (!Array.isArray(charList) || charList.length === 0) continue;
                    md.push(`### Kategori: ${catName}`);
                    if (universe.charactersCategoryDescriptions?.[catName]) {
                        md.push(`*${universe.charactersCategoryDescriptions[catName]}*\n`);
                    }
                    
                    charList.forEach(char => {
                        // Klon entitas karakter agar dapat diisi data class & title tanpa merusak state utama
                        const charToRender = JSON.parse(JSON.stringify(char));

                        // Populate & mendaftarkan Class milik Karakter
                        if (charToRender.classIds && Array.isArray(charToRender.classIds)) {
                            charToRender.classes = charToRender.classIds
                                .map(cId => classList.find(c => c.id === cId))
                                .filter(Boolean)
                                .map(cls => {
                                    const fullClass = JSON.parse(JSON.stringify(cls));
                                    if (fullClass.skillIds && Array.isArray(fullClass.skillIds) && app.data?.skills) {
                                        fullClass.skills = fullClass.skillIds
                                            .map(sId => app.data.skills.find(s => s.id === sId))
                                            .filter(Boolean);
                                        fullClass.skills.forEach(s => registry.addSkill?.(s));
                                    }
                                    registry.addClass?.(fullClass);
                                    return fullClass;
                                });
                        }

                        // Populate & mendaftarkan Title milik Karakter
                        if (charToRender.titleIds && Array.isArray(charToRender.titleIds)) {
                            charToRender.titles = charToRender.titleIds
                                .map(tId => titleList.find(t => t.id === tId))
                                .filter(Boolean)
                                .map(title => {
                                    registry.addTitle?.(title);
                                    return title;
                                });
                        }

                        // Render karakter (nama class & title akan muncul ringkas di sini)
                        md.push(app.renderEntity(charToRender, registry));
                    });
                }
                md.push('---');
            }

            // 3. Monster
            if (universe.monsters && Object.keys(universe.monsters).length > 0) {
                md.push(`## Daftar Monster / Makhluk`);
                for (const [catName, monsterList] of Object.entries(universe.monsters)) {
                    if (!Array.isArray(monsterList) || monsterList.length === 0) continue;
                    md.push(`### Kategori: ${catName}`);
                    if (universe.monstersCategoryDescriptions?.[catName]) {
                        md.push(`*${universe.monstersCategoryDescriptions[catName]}*\n`);
                    }
                    monsterList.forEach(m => md.push(app.renderEntity(m, registry)));
                }
                md.push('---');
            }

            // 4. Lokasi
            if (universe.locations && universe.locations.length > 0) {
                md.push(`## Daftar Lokasi`);
                universe.locations.forEach(loc => {
                    const locMd = [];
                    app.renderLocationRecursive(loc, 3, locMd);
                    md.push(locMd.join('\n'));
                });
                md.push('---');
            }

            if (uIndex < universes.length - 1) {
                md.push('\n==================================================\n');
            }
        });

        // 5. Glosarium Terintegrasi
        // Di sini seluruh Class (dengan deskripsi & daftar skill-nya) serta Title akan dirinci secara lengkap
        md.push(app.renderGlossary(registry));

        return md.join('\n');
    }
};