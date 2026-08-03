// Logika export khusus md

export const NovelBasicInfoExportMd = {
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
}