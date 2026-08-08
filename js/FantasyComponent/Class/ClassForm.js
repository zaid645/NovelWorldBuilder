export const ClassForm = {
    // ==========================================
    // --- KONTROL FORM UI ---
    // ==========================================

    openAddClassForm() {
        this.editClassId = null;
        const panel = document.getElementById('classFormPanel');
        if (!panel) return;

        document.getElementById('classFormTitle').innerText = "Buat Class Baru";
        document.getElementById('newClassName').value = "";
        document.getElementById('newClassDesc').value = "";
        document.getElementById('saveClassBtn').innerText = "Simpan Class";

        // Reset filter & render skill checkboxes
        const skillSearchInput = document.getElementById('classSkillSearch');
        if (skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderClassSkillCheckboxes(true);

        panel.classList.remove('hidden');
        document.getElementById('newClassName').focus();
    },

    openEditClassForm(id) {
        const classes = this.data?.classes || app.data?.classes || [];
        const cls = classes.find(c => c.id === id);
        if (!cls) return;

        this.editClassId = id;
        const panel = document.getElementById('classFormPanel');
        if (!panel) return;

        document.getElementById('classFormTitle').innerText = `Edit Class: ${cls.name}`;
        document.getElementById('newClassName').value = cls.name;
        document.getElementById('newClassDesc').value = cls.description || "";
        document.getElementById('saveClassBtn').innerText = "Update Class";

        // Render skill yang sudah dipilih sebelumnya
        const skillSearchInput = document.getElementById('classSkillSearch');
        if (skillSearchInput) skillSearchInput.value = app.currentSkillFilter || '';
        this.renderClassSkillCheckboxes(true);

        panel.classList.remove('hidden');
        panel.scrollIntoView({ behavior: 'smooth' });
    },

    closeClassForm() {
        this.editClassId = null;
        const panel = document.getElementById('classFormPanel');
        if (panel) panel.classList.add('hidden');
    },

    // ==========================================
    // --- LOGIKA CRUD ---
    // ==========================================

    saveClass() {
        if (!this.data.classes) this.data.classes = [];

        const nameInput = document.getElementById('newClassName');
        const descInput = document.getElementById('newClassDesc');
        
        let name = nameInput ? nameInput.value.trim() : "";
        let description = descInput ? descInput.value.trim() : "";
        const skillIds = Array.from(document.querySelectorAll('.classSkillCheck:checked')).map(cb => cb.value);

        if (!name) {
            if (typeof this.showAlert === 'function') {
                this.showAlert("Nama class wajib diisi!", "error");
            } else {
                alert("Nama class wajib diisi!");
            }
            return;
        }

        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (this.editClassId) {
            const cls = this.data.classes.find(c => c.id === this.editClassId);
            if (cls) {
                const isDuplicate = this.data.classes.some(c => c.id !== this.editClassId && c.name.toLowerCase() === name.toLowerCase());
                if (isDuplicate) {
                    alert(`Gagal! Class dengan nama '${name}' sudah terdaftar.`);
                    return;
                }

                cls.name = name;
                cls.description = description;
                cls.skillIds = skillIds;
                
                if (typeof this.showAlert === 'function') this.showAlert("Class berhasil di-update!", "success");
            }
        } else {
            const isDuplicate = this.data.classes.some(c => c.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                alert(`Class dengan nama '${name}' sudah terdaftar!`);
                return;
            }

            const newClass = {
                id: typeof this.generateId === 'function' ? this.generateId('c') : 'c_' + Date.now(),
                name: name,
                description: description,
                skillIds: skillIds
            };

            this.data.classes.push(newClass);
            if (typeof this.showAlert === 'function') this.showAlert("Class baru berhasil disimpan!", "success");
        }

        // Urutkan alfabetis
        this.data.classes.sort((a, b) => a.name.localeCompare(b.name));

        if(typeof this.saveData === 'function') this.saveData(true);
        this.closeClassForm();
        if(typeof this.refreshClassUI === 'function') this.refreshClassUI();
    },

    deleteClass(id) {
        if (!this.data.classes) return;
        const cls = this.data.classes.find(c => c.id === id);
        if (!cls) return;

        if (confirm(`Apakah Anda yakin ingin menghapus class '${cls.name}'?`)) {
            // Hapus Class dari Master Data
            this.data.classes = this.data.classes.filter(c => c.id !== id);

            // Bersihkan relasi ID (Bila ada implementasi DataCleaner)
            if (typeof this.removeClassId === 'function') {
                this.removeClassId(id, this.data);
            } else if (typeof DataCleaner !== 'undefined' && DataCleaner.removeClassId) {
                DataCleaner.removeClassId(id, this.data);
            }

            if(typeof this.saveData === 'function') this.saveData(true);
            if(typeof app.closeClassDetailFloating === 'function') app.closeClassDetailFloating();
            if(typeof this.refreshClassUI === 'function') this.refreshClassUI();
            
            if (typeof this.showAlert === 'function') this.showAlert(`Class '${cls.name}' berhasil dihapus.`, "success");
        }
    },

    // ==========================================
    // --- KHUSUS CHECKBOX SKILL PADA CLASS ---
    // ==========================================
    
    onClassSkillSearchInput(event) {
        app.currentSkillFilter = event.target.value;
        app.renderClassSkillCheckboxes();
    },

    renderClassSkillCheckboxes(isInitial = false) {
        const container = document.getElementById('classSkillList');
        if (!container) return;

        let allCheckedIds = [];

        if (isInitial) {
            const activeClass = this.editClassId ? this.data.classes.find(c => c.id === this.editClassId) : null;
            allCheckedIds = activeClass ? (activeClass.skillIds || []) : [];
        } else {
            const currentCheckedNodes = document.querySelectorAll('.classSkillCheck:checked');
            allCheckedIds = Array.from(currentCheckedNodes).map(cb => cb.value);
        }

        const filterQuery = (app.currentSkillFilter || '').toLowerCase();
        const allSkills = this.data?.skills || app.data?.skills || [];
        const allSkillTags = this.data?.skillTags || app.data?.skillTags || [];
        
        const filteredSkills = allSkills.filter(s => {
            if (!filterQuery) return true;
            const nameMatch = (s.name || '').toLowerCase().includes(filterQuery);
            const tagNames = (s.tagIds || []).map(id => {
                const tag = allSkillTags.find(t => t.id === id);
                return tag ? tag.name.toLowerCase() : '';
            }).join(' ');

            return nameMatch || tagNames.includes(filterQuery);
        });

        const skillMap = new Map();
        filteredSkills.forEach(s => skillMap.set(s.id, s));

        // Pertahankan skill yang SEDANG DICENTANG agar tidak tersembunyi
        allCheckedIds.forEach(id => {
            if (!skillMap.has(id)) {
                const originalSkill = allSkills.find(s => s.id === id);
                if (originalSkill) skillMap.set(originalSkill.id, originalSkill);
            }
        });

        const displaySkills = Array.from(skillMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (displaySkills.length === 0) {
            container.innerHTML = '<span class="text-xs text-slate-500 italic col-span-full">Tidak ada skill yang ditemukan.</span>';
            return;
        }

        container.innerHTML = displaySkills.map(s => `
            <label class="flex items-center space-x-2 cursor-pointer w-full">
                <input type="checkbox" value="${s.id}" class="classSkillCheck form-checkbox rounded text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-500"
                ${allCheckedIds.includes(s.id) ? 'checked' : ''}>
                <span class="truncate text-slate-300 hover:text-white transition" title="${s.name}">${s.name}</span>
            </label>
        `).join('');
    }
}