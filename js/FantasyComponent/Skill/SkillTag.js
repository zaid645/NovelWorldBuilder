// Logika CRUD tag skill

export const SkillTag = {
    // ==========================================
    // --- LOGIKA TAG SKILL ---
    // ==========================================
    addSkillTag() {
        const input = document.getElementById('newSkillTagName');
        const name = input.value.trim();
        if (name) {
            this.data.skillTags.push({ id: this.generateId('t'), name });
            this.saveData();
            this.switchView('skills');
        }
    },

    editSkillTag(id) {
        const tag = this.data.skillTags.find(t => t.id === id);
        if (!tag) return;
        const newName = prompt("Ubah nama tag:", tag.name);
        if (newName && newName.trim()) {
            tag.name = newName.trim();
            this.saveData();
            this.switchView('skills');
        }
    },

    deleteSkillTag(id) {
        const tag = this.data.skillTags.find(t => t.id === id);
        if (!tag) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus tag skill <b class="text-indigo-400">"${tag.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">*Skill yang menggunakan tag ini akan kehilangan referensinya.</p>
            </div>
        `;

        this.showCustomModal({
            title: "Hapus Tag Skill",
            content: content,
            confirmText: "Hapus Tag",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.data.skillTags = this.data.skillTags.filter(t => t.id !== id);
                this.saveData();
                this.switchView('skills');
                this.showAlert(`Tag "${tag.name}" berhasil dihapus.`, "success");
                return true;
            }
        });
    },

    autoloadSkillTags() {
        const tagIds = this.data.skillTags.map(t => t.id);
        let addedCount = 0;
        
        this.data.skills.forEach(skill => {
            skill.tagIds.forEach(id => {
                if (!tagIds.includes(id)) {
                    this.data.skillTags.push({ id: id, name: `AutoTag_${id}` });
                    tagIds.push(id);
                    addedCount++;
                }
            });
        });

        if (addedCount > 0) {
            this.saveData();
            this.switchView('skills');
            this.showAlert(`${addedCount} Tag otomatis ditambahkan.`, "success");
        } else {
            this.showAlert("Semua tag sudah valid.", "info");
        }
    },

    cleanInvalidSkillTags() {
        const validTagIds = this.data.skillTags.map(t => t.id);
        let cleanedCount = 0;
        
        this.data.skills.forEach(skill => {
            const originalLength = skill.tagIds.length;
            skill.tagIds = skill.tagIds.filter(id => validTagIds.includes(id));
            if (skill.tagIds.length !== originalLength) {
                cleanedCount++;
            }
        });
        
        if (cleanedCount > 0) {
            this.saveData();
            this.switchView('skills');
            this.showAlert(`Berhasil membersihkan tag invalid dari ${cleanedCount} skill.`, "success");
        } else {
            this.showAlert("Semua tag pada skill sudah valid.", "info");
        }
    }
}