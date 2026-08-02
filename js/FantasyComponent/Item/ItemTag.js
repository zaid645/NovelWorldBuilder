// Logika CRUD Tag Item (Add, Edit, Clean, Autoload)
export const ItemTag = {

    // ==========================================
    // --- LOGIKA TAG ITEM ---
    // ==========================================
    addItemTag() {
        const name = document.getElementById('newItemTagName').value.trim();
        if (name) {
            this.data.itemTags.push({ id: this.generateId('it'), name });
            this.saveData(); this.switchView('items');
        }
    },
    editItemTag(id) {
        const tag = this.data.itemTags.find(t => t.id === id);
        if (!tag) return;
        const newName = prompt("Ubah nama tag item:", tag.name);
        if (newName && newName.trim()) {
            tag.name = newName.trim();
            this.saveData(); this.switchView('items');
        }
    },

    deleteItemTag(id) {
        const tag = this.data.itemTags.find(t => t.id === id);
        if (!tag) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus tag item <b class="text-cyan-400">"${tag.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tag ini akan dihapus dari daftar tag item yang tersedia.</p>
            </div>
        `;

        this.showCustomModal({
            title: "Hapus Tag Item",
            content: content,
            confirmText: "Hapus Tag",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.data.itemTags = this.data.itemTags.filter(t => t.id !== id);
                this.saveData();
                this.switchView('items');
                this.showAlert(`Tag "${tag.name}" berhasil dihapus.`, "success");
                return true;
            }
        });
    },

    autoloadItemTags() {
        const validIds = this.data.itemTags.map(t => t.id);
        let added = 0;
        this.data.items.forEach(item => {
            item.tagIds.forEach(id => {
                if (!validIds.includes(id)) {
                    this.data.itemTags.push({ id, name: `AutoTag_${id}` });
                    validIds.push(id); added++;
                }
            });
        });
        if (added > 0) { this.saveData(); this.switchView('items'); this.showAlert(`${added} Tag item dimuat.`, "success"); }
    },
    cleanInvalidItemTags() {
        const validIds = this.data.itemTags.map(t => t.id);
        let cleaned = 0;
        this.data.items.forEach(item => {
            const len = item.tagIds.length;
            item.tagIds = item.tagIds.filter(id => validIds.includes(id));
            if (item.tagIds.length !== len) cleaned++;
        });
        if (cleaned > 0) { this.saveData(); this.switchView('items'); this.showAlert(`Tag invalid dihapus dari ${cleaned} item.`, "success"); }
    }
}