// Logika ekspor khusus Markdown untuk Info Dasar Novel

export const NovelBasicInfoExportMd = {
    // Fungsi khusus untuk pemicu ekspor info cerita ke format Markdown
    exportStoryInfoMarkdown() {
        const info = app.data?.storyInfo || {};
        const detailedCharacters = app.getDetailedCharacters ? app.getDetailedCharacters() : [];
        
        // Mengutamakan fungsi generator terpusat dari MdExportHelper / app jika tersedia
        const content = typeof app.generateStoryInfoMarkdown === 'function' 
            ? app.generateStoryInfoMarkdown(info, detailedCharacters)
            : this.generateStoryInfoMarkdown(info, detailedCharacters);

        // Sanitasi nama file dari karakter ilegal dan tambahkan timestamp
        const safeTitle = (info.title || 'informasi_dasar').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `info_dasar_${safeTitle}_${timestamp}.md`;
        
        // Memanggil helper pengunduhan file
        if (typeof app.saveMarkdownFile === 'function') {
            app.saveMarkdownFile(filename, content);
        } else if (typeof this.saveMarkdownFile === 'function') {
            this.saveMarkdownFile(filename, content);
        }

        // Notifikasi ke antarmuka pengguna
        if (typeof app.showAlert === 'function') {
            app.showAlert("Informasi dasar novel berhasil diekspor ke Markdown (.md).", "success");
        }
    },

    // Fallback generator jika belum terhubung langsung ke instance app
    generateStoryInfoMarkdown(info, detailedCharacters) {
        const md = [];
        const registry = typeof app.createRegistry === 'function' 
            ? app.createRegistry() 
            : { skills: new Map(), items: new Map(), familiars: new Map(), races: new Map() };

        // 1. Judul & Sinopsis
        md.push(`# Judul Novel: ${info.title || 'Tanpa Judul'}\n`);
        if (info.synopsis) {
            const cleanSynopsis = typeof app.cleanText === 'function' ? app.cleanText(info.synopsis) : info.synopsis;
            md.push(`## Sinopsis Utama`);
            md.push(`${cleanSynopsis}\n\n---`);
        }

        // 2. World Building
        if (info.worldBuilding) {
            const cleanWB = typeof app.cleanText === 'function' ? app.cleanText(info.worldBuilding) : info.worldBuilding;
            md.push(`## World Building / Aturan Dunia`);
            md.push(`${cleanWB}\n\n---`);
        }

        // 3. Daftar Karakter Utama
        if (detailedCharacters && detailedCharacters.length > 0) {
            md.push(`## Daftar Karakter Utama\n`);
            detailedCharacters.forEach(char => {
                if (!char) return;
                if (typeof app.renderEntity === 'function') {
                    md.push(app.renderEntity(char, registry, { headingLevel: '###' }));
                }
            });
            md.push('---');
        }

        // 4. Glosarium Terintegrasi
        if (typeof app.renderGlossary === 'function') {
            const glossaryText = app.renderGlossary(registry);
            if (glossaryText) md.push(glossaryText);
        }

        return md.join('\n');
    }
};