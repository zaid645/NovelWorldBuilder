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

    exportSingleArc(arcId) {
        if (!this.data.arcs) return;
        
        const arc = this.data.arcs.find(a => a.id === arcId);
        if (!arc) {
            return this.showNotification("Data arc tidak ditemukan.", "error");
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arc, null, 2));
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        
        const safeArcName = arc.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        downloadAnchor.setAttribute("download", `arc_export_${safeArcName}_${new Date().toISOString().slice(0,10)}.json`);
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
}