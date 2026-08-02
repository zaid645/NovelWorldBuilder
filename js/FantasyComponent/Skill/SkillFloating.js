// Logika panel mengambang skill

export const SkillFloating = {
    // ==========================================
    // --- LOGIKA TAMPILAN FLOATING PANEL ---
    // ==========================================
    showSkillDetailFloating(id) {
        const skill = this.data.skills.find(s => s.id === id);
        if (!skill) return;

        // Set judul dan deskripsi
        document.getElementById('floatingSkillTitle').innerText = `✨ ${skill.name}`;
        document.getElementById('floatingSkillBg').innerHTML = skill.background || '<span class="italic text-slate-500">Tidak ada informasi latar belakang.</span>';
        document.getElementById('floatingSkillDesc').innerHTML = skill.description || '<span class="italic text-slate-500">Tidak ada deskripsi efek.</span>';

        // Set Tag
        const resolvedTags = skill.tagIds
            .map(id => this.data.skillTags.find(t => t.id === id))
            .filter(tag => tag !== undefined); // Saring tag yang valid saja

        resolvedTags.sort((a, b) => a.name.localeCompare(b.name));

        const tagHtml = resolvedTags.map(tag => {
            return `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700/50">${tag.name}</span>`;
        }).join('');
        document.getElementById('floatingSkillTags').innerHTML = tagHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded">Tanpa Tag</span>';

        // Tampilkan panel
        document.getElementById('floatingSkillDetail').classList.remove('hidden');
    },

    closeSkillDetailFloating() {
        document.getElementById('floatingSkillDetail').classList.add('hidden');
    },

    // ==========================================
    // --- LOGIKA DRAG & DROP FLOATING PANEL ---
    // ==========================================
    dragStateSkill: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    startDragSkill(e, elementId) {
        // Abaikan klik kanan
        if (e.button !== 0) return; 
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateSkill.isDragging = true;
        this.dragStateSkill.el = el;
        this.dragStateSkill.startX = e.clientX;
        this.dragStateSkill.startY = e.clientY;

        // Mengubah posisi dari fixed bottom-right menjadi koordinat absolut kiri-atas (X, Y)
        // Ini memastikan jendela tidak melompat saat pertama kali digeser
        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            // Hapus class tailwind yang mengunci posisi
            el.classList.remove('bottom-6', 'right-6'); 
        }

        // Matikan efek transisi (animasi) sementara agar jendela mengikuti mouse tanpa lag/delay
        el.style.transition = 'none';

        // Daftarkan event mouse ke seluruh dokumen
        document.onmouseup = () => app.stopDragSkill();
        document.onmousemove = (e) => app.dragSkill(e);
    },

    dragSkill(e) {
        if (!this.dragStateSkill.isDragging || !this.dragStateSkill.el) return;
        e.preventDefault();

        const el = this.dragStateSkill.el;

        // Hitung jarak pergeseran kursor dari frame sebelumnya
        const dx = e.clientX - this.dragStateSkill.startX;
        const dy = e.clientY - this.dragStateSkill.startY;

        // Update titik awal untuk kalkulasi frame selanjutnya
        this.dragStateSkill.startX = e.clientX;
        this.dragStateSkill.startY = e.clientY;

        // Hitung target posisi baru
        let newLeft = el.offsetLeft + dx;
        let newTop = el.offsetTop + dy;

        // ==========================================
        // --- PEMBATASAN AREA (VIEWPORT BOUNDARY) ---
        // ==========================================
        
        // 1. Batas Kiri
        if (newLeft < 0) {
            newLeft = 0;
        }

        // 2. Batas Kanan (Lebar Jendela Layar dikurangi Lebar Panel)
        const maxLeft = window.innerWidth - el.offsetWidth;
        if (newLeft > maxLeft) {
            newLeft = maxLeft;
        }

        // 3. Batas Atas (Jika ada Navbar, ubah 0 menjadi tinggi navbar, misal: 60)
        const topOffset = 0; 
        if (newTop < topOffset) {
            newTop = topOffset;
        }

        // 4. Batas Bawah (Tinggi Jendela Layar dikurangi Tinggi Panel)
        const maxTop = window.innerHeight - el.offsetHeight;
        if (newTop > maxTop) {
            newTop = maxTop;
        }

        // Terapkan posisi baru yang sudah aman (di dalam batas)
        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
    },

    stopDragSkill() {
        if (this.dragStateSkill.el) {
            // Nyalakan kembali transisi (meskipun kosong, ini menghapus override inline 'none')
            this.dragStateSkill.el.style.transition = '';
        }
        this.dragStateSkill.isDragging = false;
        this.dragStateSkill.el = null;
        
        // Bersihkan event listener dari dokumen
        document.onmouseup = null;
        document.onmousemove = null;
    }
}