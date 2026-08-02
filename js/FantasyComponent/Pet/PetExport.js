// Logika Export Pet

export const PetExport = {
    exportFamiliarsOnly() {
        if (this.data.familiars.length === 0) {
            return this.showAlert("Tidak ada data familiar untuk diexport.", "error");
        }
        const payload = {
            familiarTags: this.data.familiarTags,
            familiars: this.data.familiars
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `data_familiars.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        this.showAlert("Data familiar berhasil diexport!", "success");
    }
}