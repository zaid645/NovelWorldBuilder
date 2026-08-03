// Logika export atau import utama

export const ManagerExportImportBasic = {

    // --- IMPORT / EXPORT UTAMA ---
    async importMaster(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        // Jadikan async agar bisa menunggu saveData
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json.metadata || !json.metadata.version) {
                    throw new Error("Format tidak valid (Metadata hilang).");
                }
                this.data = json;
                
                this.ensureStructure(this.data, this.defaultData);
                
                // Simpan langsung ke IndexedDB dengan menimpa data lama
                await this.saveData();
                
                this.switchView('story-info'); 
                this.renderSidebar();
                
                this.showAlert("Data Master berhasil dimuat ke Database!", "success");
            } catch (err) {
                this.showAlert("Gagal memuat file: " + err.message, "error");
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    },

    downloadJSON(filename, dataObj) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", filename);
        dlAnchorElem.click();
    },

    exportMaster() {
        this.downloadJSON("NovelLore_Master.json", this.data);
    }
}