// Logika export arc

export const ArcInfoExport = {

    exportArcsData() {
        if (!this.data.arcs || this.data.arcs.length === 0) {
            return this.showNotification("Tidak ada data arc cerita yang dapat diexport.", "error");
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data.arcs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `arcs_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    exportSingleArc(arcId, format = 'json') {
        if (!this.data.arcs) return;
        
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) {
            return this.showNotification("Data arc tidak ditemukan.", "error");
        }

        const safeArcName = (arc.name || 'arc').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const timestamp = new Date().toISOString().slice(0, 10);

        if (format === 'md') {
            const markdownContent = this.generateArcMarkdown(arc);
            const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", url);
            downloadAnchor.setAttribute("download", `arc_export_${safeArcName}_${timestamp}.md`);
            
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            URL.revokeObjectURL(url);

            if (typeof this.showNotification === 'function') {
                this.showNotification("Arc berhasil diekspor ke format Markdown (.md).", "success");
            }
        } else {
            // Format JSON
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arc, null, 2));
            
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `arc_export_${safeArcName}_${timestamp}.json`);
            
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            if (typeof this.showNotification === 'function') {
                this.showNotification("Arc berhasil diekspor ke format JSON.", "success");
            }
        }
    },

    generateArcMarkdown(arc) {
        const md = [];

        // --- LEVEL 1: ARC HEADER ---
        md.push(`# Arc: ${arc.name || 'Tanpa Nama'}\n`);

        // Sinopsis Arc (Gabungkan baris baru menjadi 1 Paragraf Tunggal)
        if (arc.synopsis) {
            const cleanSynopsis = String(arc.synopsis).replace(/\n+/g, ' ').trim();
            if (cleanSynopsis) {
                md.push(`**Sinopsis:** ${cleanSynopsis}\n`);
            }
        }

        md.push('---');

        // --- LEVEL 2: SUBARCS ---
        const subarcs = Array.isArray(arc.subarcs) ? arc.subarcs : [];
        if (subarcs.length > 0) {
            md.push(`## Daftar Sub-Arc / Bab\n`);

            subarcs.forEach((sub, index) => {
                const subName = sub.name || `Sub-arc ${index + 1}`;
                md.push(`### ${index + 1}. ${subName}`);

                // Deskripsi Sub-Arc
                if (sub.description) {
                    // Memisah per baris, membersihkan spasi, dan membuang baris kosong
                    const lines = String(sub.description)
                        .split(/\r?\n/)
                        .map(line => line.trim())
                        .filter(line => line.length > 0);

                    if (lines.length > 0) {
                        md.push(`**Deskripsi** \n${lines.join('\n')}`);
                    }
                }

                md.push(''); // Spasi antar sub-arc
            });
        }

        return md.join('\n');
    }
}