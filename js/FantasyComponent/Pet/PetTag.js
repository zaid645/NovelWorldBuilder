// Logika CRUD Tags Familiar

export const PetTag = {
    // ==========================================
    // --- LOGIKA TAG PET ---
    // ==========================================
    addFamiliarTag() {
        const name = document.getElementById('newFamiliarTagName').value.trim();
        if (name) {
            this.data.familiarTags.push({ id: this.generateId('ft'), name });
            this.saveData(); this.switchView('familiars');
        }
    },
    editFamiliarTag(id) {
        const tag = this.data.familiarTags.find(t => t.id === id);
        if (!tag) return;
        const newName = prompt("Ubah nama tag familiar:", tag.name);
        if (newName && newName.trim()) {
            tag.name = newName.trim();
            this.saveData(); this.switchView('familiars');
        }
    },
    deleteFamiliarTag(id) {
        const tag = this.data.familiarTags.find(t => t.id === id);
        if (!tag) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus tag familiar <b class="text-fuchsia-400">"${tag.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Tag ini akan dihapus dari daftar tag familiar yang tersedia.</p>
            </div>
        `;

        this.showCustomModal({
            title: "Hapus Tag Familiar",
            content: content,
            confirmText: "Hapus Tag",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.data.familiarTags = this.data.familiarTags.filter(t => t.id !== id);
                this.saveData();
                this.switchView('familiars');
                this.showAlert(`Tag "${tag.name}" berhasil dihapus.`, "success");
                return true;
            }
        });
    },
    autoloadFamiliarTags() {
        const validIds = this.data.familiarTags.map(t => t.id);
        let added = 0;
        this.data.familiars.forEach(fam => {
            fam.tagIds.forEach(id => {
                if (!validIds.includes(id)) {
                    this.data.familiarTags.push({ id, name: `AutoTag_${id}` });
                    validIds.push(id); added++;
                }
            });
        });
        if (added > 0) { this.saveData(); this.switchView('familiars'); this.showAlert(`${added} Tag familiar dimuat.`, "success"); }
    },
    cleanInvalidFamiliarTags() {
        const validIds = this.data.familiarTags.map(t => t.id);
        let cleaned = 0;
        this.data.familiars.forEach(fam => {
            const len = fam.tagIds.length;
            fam.tagIds = fam.tagIds.filter(id => validIds.includes(id));
            if (fam.tagIds.length !== len) cleaned++;
        });
        if (cleaned > 0) { this.saveData(); this.switchView('familiars'); this.showAlert(`Tag invalid dihapus dari ${cleaned} familiar.`, "success"); }
    }
}