// Logika export utama Novel Basic Info (termasuk json)

export const NovelBasicInfoExport = {
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
    }
}
