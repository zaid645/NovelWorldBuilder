// Logika Export Item

export const ItemExport = {
    exportItems() {
        this.downloadJSON("data_items.json", { itemTags: this.data.itemTags, items: this.data.items });
    }
}