// Logika CRUD skill

export const SkillForm = {
    // ==========================================
    // --- LOGIKA FORM SKILL (CRUD) ---
    // ==========================================
    openAddSkill() {
        this.editSkillId = null;
        document.getElementById('skillFormTitle').innerText = "Buat Skill Baru";
        document.getElementById('newSkillName').value = '';
        document.getElementById('newSkillBg').value = '';
        document.getElementById('newSkillDesc').value = '';
        document.querySelectorAll('.tagCheck').forEach(cb => cb.checked = false);
        
        const aiUniverse = document.getElementById('aiSkillUniverse');
        if(aiUniverse) aiUniverse.value = '';
        const aiDeepLore = document.getElementById('aiSkillDeepLore');
        if(aiDeepLore) aiDeepLore.checked = false;

        this.setPanelState('addSkillForm', true);
        document.getElementById('saveSkillBtn').innerText = "Simpan Skill";
        document.getElementById('addSkillForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    openEditSkill(id) {
        const skill = this.data.skills.find(s => s.id === id);
        if(!skill) return;

        this.editSkillId = id;
        document.getElementById('skillFormTitle').innerText = `Edit Skill: ${skill.name}`;
        document.getElementById('newSkillName').value = skill.name;
        document.getElementById('newSkillBg').value = skill.background || '';
        document.getElementById('newSkillDesc').value = skill.description || '';

        document.querySelectorAll('.tagCheck').forEach(cb => {
            cb.checked = skill.tagIds.includes(cb.value);
        });

        const aiUniverse = document.getElementById('aiSkillUniverse');
        if(aiUniverse) aiUniverse.value = '';
        const aiDeepLore = document.getElementById('aiSkillDeepLore');
        if(aiDeepLore) aiDeepLore.checked = false;

        this.setPanelState('addSkillForm', true);
        document.getElementById('saveSkillBtn').innerText = "Update Skill";
        document.getElementById('addSkillForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    saveSkill() {
        const name = document.getElementById('newSkillName').value.trim();
        if (!name) return this.showAlert("Nama skill wajib diisi", "error");

        const background = document.getElementById('newSkillBg').value.trim();
        const description = document.getElementById('newSkillDesc').value.trim();
        
        const tagCheckboxes = document.querySelectorAll('.tagCheck:checked');
        const tagIds = Array.from(tagCheckboxes).map(cb => cb.value);

        if (this.editSkillId) {
            const skill = this.data.skills.find(s => s.id === this.editSkillId);
            if(skill) {
                skill.name = name; 
                skill.background = background; 
                skill.description = description; 
                skill.tagIds = tagIds;
            }
            this.editSkillId = null;
            this.showAlert("Skill berhasil diupdate", "success");
        } else {
            this.data.skills.push({
                id: this.generateId('sk'),
                name, background, description, tagIds
            });
            this.showAlert("Skill baru disimpan", "success");
        }

        this.setPanelState('addSkillForm', false);
        this.saveData(true);
        this.switchView('skills');
    },

    deleteSkill(id) {
        const skill = this.data.skills.find(s => s.id === id);
        if (!skill) return;

        const content = `
            <div class="space-y-2 text-left">
                <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus skill <b class="text-yellow-400">"${skill.name}"</b>?</p>
                <p class="text-xs text-rose-400/80 italic">Semua tokoh yang menggunakan skill ini akan kehilangan skill</p>
            </div>
        `;

        this.showCustomModal({
            title: "Hapus Skill",
            content: content,
            confirmText: "Hapus Skill",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.data.skills = this.data.skills.filter(s => s.id !== id);
                this.removeSkillId(id, this.data);
                
                this.closeSkillDetailFloating();
                this.setPanelState('addSkillForm', false);
                this.editSkillId = null;
                this.saveData();
                this.switchView('skills');
                this.showAlert(`Skill "${skill.name}" berhasil dihapus.`, "success");
                return true;
            }
        });
    },


    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS SKILL ---
    // ==========================================
    async generateSkillAI(targetField) {
        const nameInput = document.getElementById('newSkillName').value.trim();

        if (!nameInput) {
            return alert("GAGAL: 'Nama Skill' wajib diisi agar AI memiliki panduan subjek yang jelas.");
        }

        let targetEl, btnEl, btnId, originalBtnText;
        let aiFocusRule = "";
        
        const aiLengthRule = "Hasilkan deskripsi secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf pendek). TANPA metafora, TANPA diksi puitis, dan TANPA majas. Gunakan bahasa yang langsung pada intinya (to-the-point).";

        const currentBg = document.getElementById('newSkillBg').value.trim();
        const currentDesc = document.getElementById('newSkillDesc').value.trim();
        let crossContext = "";

        if (targetField === 'background') {
            targetEl = document.getElementById('newSkillBg');
            btnId = 'btnAiSkillBg';
            aiFocusRule = "Kembangkan latar belakang, asal usul, siapa penciptanya, atau bagaimana skill/kemampuan ini pertama kali ditemukan atau dilatih. Fokus murni pada CERITA/LORE.";
            if (currentDesc) crossContext = `\n[REFERENSI EFEK SKILL UNTUK PENYESUAIAN CERITA]: ${currentDesc}`;
        } else if (targetField === 'description') {
            targetEl = document.getElementById('newSkillDesc');
            btnId = 'btnAiSkillDesc';
            aiFocusRule = "Kembangkan apa fungsi/efek dari skill ini saat digunakan, bentuk perwujudannya (visual), jumlah kerusakan (damage), atau utilitas/mekanismenya. Fokus murni pada FUNGSI/EFEK.";
            if (currentBg) crossContext = `\n[REFERENSI ASAL USUL SKILL UNTUK PENYESUAIAN MEKANISME]: ${currentBg}`;
        }

        const draftText = targetEl.value.trim();

        const univId = document.getElementById('aiSkillUniverse')?.value;
        const useDeepLore = document.getElementById('aiSkillDeepLore')?.checked;
        let universeContext = "Semesta tidak ditentukan secara spesifik (General Fantasy/Sci-Fi).";

        if (univId) {
            const universe = app.data.universes.find(u => u.id === univId);
            if (universe) {
                universeContext = `Nama Latar/Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
                
                if (useDeepLore && universe.locations && universe.locations.length > 0) {
                    const locs = universe.locations.map(l => `${l.name} (${l.description || 'Tidak ada deskripsi'})`).join(', ');
                    universeContext += `\nDaftar Tempat/Lokasi di Semesta ini: ${locs}\n`;
                }
            }
        }

        const payload = {
            moduleName: `Skill-${targetField.toUpperCase()}`,
            targetData: {
                namaSkill: nameInput,
                informasiSemesta: universeContext,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan dari field lain)",
                drafReferensiPengguna: draftText || "(Kosong. Buatkan ide cemerlang murni dari Nama Skill yang ada.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, ringkas, dan teknis/deskriptif. Sesuai dengan gaya dokumentasi kemampuan RPG/game namun menggunakan bahasa yang lugas dan tidak berbunga-bunga.",
                length: aiLengthRule
            }
        };

        btnEl = document.getElementById(btnId);
        btnEl.disabled = true;
        btnEl.classList.add('opacity-50', 'cursor-wait');
        originalBtnText = btnEl.innerHTML;
        btnEl.innerHTML = "✨ Memproses...";

        try {
            const resultText = await app.requestEnchant(payload);
            targetEl.value = resultText;
            app.showAlert(`Berhasil men-generate AI untuk ${targetField === 'background' ? 'Asal Usul' : 'Efek Skill'}!`, "success");
        } catch (error) {
            alert("Gagal memanggil AI: " + error.message);
        } finally {
            btnEl.disabled = false;
            btnEl.classList.remove('opacity-50', 'cursor-wait');
            btnEl.innerHTML = originalBtnText;
        }
    }
}