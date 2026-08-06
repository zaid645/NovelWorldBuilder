// Tampilan panel mengambang pet

export const PetFloating = {

    // ==========================================
    // --- LOGIKA TAMPILAN FLOATING PANEL ---
    // ==========================================
    activeFamId: null,

    showFamiliarDetailFloating(id, options = {}) {
        const fam = this.data.familiars.find(f => f.id === id);
        if (!fam) return;
        this.activeFamId = id;

        // Simpan posisi scroll saat ini sebelum DOM diperbarui
        const scrollContainer = document.getElementById('floatingFamDetail')?.querySelector('.overflow-y-auto');
        const currentScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

        // Set Judul
        document.getElementById('floatingFamTitle').innerText = `🐾 ${fam.name}`;

        // --- BADGES INFO TAMBAHAN (Ras, Kelamin, Umur) ---
        const race = (this.data.races || []).find(r => r.id === fam.raceId);
        const raceBadge = race ? `<span class="bg-amber-900/60 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-700/50 font-medium">🧬 Ras: ${race.name}</span>` : '';
        
        let genderBadge = '';
        if (fam.gender === 'jantan') {
            genderBadge = '<span class="bg-blue-900/60 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700/50 font-medium">♂ Jantan</span>';
        } else if (fam.gender === 'betina') {
            genderBadge = '<span class="bg-pink-900/60 text-pink-300 text-[10px] px-2 py-0.5 rounded border border-pink-700/50 font-medium">♀ Betina</span>';
        }
        
        const ageBadge = fam.age ? `<span class="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-600 font-medium">⏳ ${fam.age}</span>` : '';

        // Set Penampilan & Deskripsi Latar Belakang
        document.getElementById('floatingFamApp').innerHTML = fam.appearance || '<span class="italic text-slate-500">Tidak ada informasi penampilan.</span>';
        document.getElementById('floatingFamDesc').innerHTML = fam.description || fam.background || '<span class="italic text-slate-500">Tidak ada deskripsi latar belakang.</span>';

        // Set Tag Kategori (Gabungkan dengan Badge Ras/Kelamin/Umur jika ada)
        const resolvedTags = (fam.tagIds || [])
            .map(tagId => this.data.familiarTags.find(t => t.id === tagId))
            .filter(tag => tag !== undefined);

        resolvedTags.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        const tagHtml = resolvedTags.map(tag => {
            return `<span class="bg-fuchsia-900/60 text-fuchsia-300 text-[10px] px-2 py-0.5 rounded border border-fuchsia-700/50">${tag.name}</span>`;
        }).join('');

        const combinedTags = [raceBadge, genderBadge, ageBadge, tagHtml].filter(Boolean).join('');
        document.getElementById('floatingFamTags').innerHTML = combinedTags || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded">Tanpa Tag / Info</span>';
        
        // Set Watak / Kepribadian
        const masterWatakList = app.data.watakList || [];
        let parsedWataks = [];
        if (Array.isArray(fam.personality)) parsedWataks = fam.personality;
        else if (typeof fam.personality === 'string' && fam.personality.trim() !== '') parsedWataks = fam.personality.split(',').map(s => s.trim());
        
        const watakHtml = parsedWataks.map(w => {
            const isValid = masterWatakList.some(master => master.toLowerCase() === w.toLowerCase());
            return isValid 
                ? `<span class="bg-purple-900/60 text-purple-300 text-[10px] px-2 py-0.5 rounded border border-purple-700/50 font-medium">🎭 ${w}</span>`
                : `<span class="bg-rose-900/60 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-700 font-medium line-through">Invalid</span>`;
        }).join('');
        document.getElementById('floatingFamWataks').innerHTML = watakHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded">Tanpa Watak</span>';

        // Set Skills
        const skillHtml = (fam.skillIds || []).map(sId => {
            const skill = this.data.skills.find(s => s.id === sId);
            return skill ? `<span class="bg-indigo-900/60 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-700/50">✨ ${skill.name}</span>` : '';
        }).join('');
        document.getElementById('floatingFamSkills').innerHTML = skillHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-700/50">Tidak ada skill</span>';

        // Set Items
        const itemHtml = (fam.itemIds || []).map(iId => {
            const item = this.data.items.find(i => i.id === iId);
            return item ? `<span class="bg-cyan-900/60 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700/50">🎒 ${item.name}</span>` : '';
        }).join('');
        document.getElementById('floatingFamItems').innerHTML = itemHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-700/50">Tidak ada item</span>';

        // --- Set Catatan Khusus Pet / Notes ---
        const notesHtml = (fam.notes || []).map((note, index) => `
            <li class="flex justify-between items-start text-[11px] text-slate-300 border-l-2 border-amber-500/50 pl-2 py-1 group/note bg-slate-800/30 rounded-r mb-1">
                <span class="flex-1 leading-relaxed whitespace-pre-wrap">${note}</span>
                <div class="opacity-0 group-hover/note:opacity-100 flex items-center space-x-1 ml-1.5 transition">
                    <button onclick="app.deleteFamiliarNote('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs px-1" title="Hapus Catatan">&times;</button>
                </div>
            </li>
        `).join('');
        document.getElementById('floatingFamNotes').innerHTML = notesHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada catatan.</li>';

        // --- Render Input Box untuk Catatan Baru ---
        document.getElementById('floatingFamNoteInputContainer').innerHTML = `
            <div class="flex items-center space-x-1.5 pt-1">
                <input type="text" id="newFamNote_${fam.id}" placeholder="Ketik catatan baru..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500 transition" onkeydown="if(event.key === 'Enter') app.addFamiliarNote('${fam.id}')">
                <button onclick="app.addFamiliarNote('${fam.id}')" class="bg-amber-600/80 hover:bg-amber-500 text-white px-2 py-1.5 rounded text-[10px] font-medium transition shadow-sm">+</button>
            </div>
        `;

        // Set Dialogues
        const dialoguesHtml = (fam.dialogues || []).map((dlg, index) => `
            <li class="flex justify-between items-start text-[11px] italic text-slate-300 border-l-2 border-blue-500/50 pl-2 py-1 group/dlg bg-slate-800/30 rounded-r mb-1">
                <span class="flex-1 leading-relaxed">${dlg}</span>
                <button onclick="app.deleteFamiliarDialogue('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/dlg:opacity-100 ml-1.5 transition px-1" title="Hapus baris ini">&times;</button>
            </li>
        `).join('');
        document.getElementById('floatingFamDialogues').innerHTML = dialoguesHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada dialog.</li>';
        
        // Render Input Box for Dialogue
        document.getElementById('floatingFamDlgInputContainer').innerHTML = `
            <div class="flex items-center space-x-1.5 pt-1">
                <input type="text" id="newFamDlg_${fam.id}" placeholder="Ketik kalimat/suara..." class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 transition" onkeydown="if(event.key === 'Enter') app.addFamiliarDialogue('${fam.id}')">
                <button onclick="app.addFamiliarDialogue('${fam.id}')" class="bg-blue-600/80 hover:bg-fuchsia-500 text-white px-2 py-1.5 rounded text-[10px] font-medium transition shadow-sm">+</button>
            </div>
        `;

        // --- Set Catatan Relasi ---
        const relationsHtml = (fam.relations || []).map((rel, index) => `
            <li class="flex justify-between items-start text-[11px] text-slate-300 border-l-2 border-rose-500/50 pl-2 py-1 group/rel bg-slate-800/30 rounded-r mb-1">
                <span class="flex-1 leading-relaxed whitespace-pre-wrap">${rel}</span>
                <button onclick="app.deleteFamiliarRelation('${fam.id}', ${index})" class="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover/rel:opacity-100 ml-1.5 transition px-1" title="Hapus relasi ini">&times;</button>
            </li>
        `).join('');
        
        const relEl = document.getElementById('floatingFamRelations');
        if (relEl) relEl.innerHTML = relationsHtml || '<li class="text-[10px] text-slate-500 italic">Belum ada catatan relasi.</li>';

        const relInputEl = document.getElementById('floatingFamRelInputContainer');
        if (relInputEl) {
            relInputEl.innerHTML = `
                <div class="flex items-start space-x-1.5 pt-1">
                    <textarea id="newFamRel_${fam.id}" placeholder="Ketik relasi pet ini... (Tekan Enter)" rows="1" class="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-rose-500 transition resize-none" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); app.addFamiliarRelation('${fam.id}'); }"></textarea>
                    <button onclick="app.addFamiliarRelation('${fam.id}')" class="bg-rose-600/80 hover:bg-rose-500 text-white px-2 py-1.5 rounded text-[10px] font-medium transition shadow-sm h-[34px] flex items-center">+</button>
                </div>
            `;
        }


        // Tampilkan panel
        document.getElementById('floatingFamDetail').classList.remove('hidden');

        // 2. Pulihkan posisi scroll pengguna
        const updatedScrollContainer = document.getElementById('floatingFamDetail')?.querySelector('.overflow-y-auto');
        if (updatedScrollContainer) {
            if (options.preserveScroll) {
                updatedScrollContainer.scrollTop = currentScrollTop;
            } else if (options.isInitialOpen) {
                updatedScrollContainer.scrollTop = 0; // Scroll ke paling atas saat pertama kali dibuka
            } else {
                updatedScrollContainer.scrollTop = currentScrollTop;
            }
        }

        // 3. Kembalikan fokus ke input yang sedang digunakan (jika ada)
        if (options.focusInputId) {
            const targetInput = document.getElementById(options.focusInputId);
            if (targetInput) targetInput.focus();
        }
    },

    closeFamiliarDetailFloating() {
        document.getElementById('floatingFamDetail').classList.add('hidden');
        this.activeFamId = null;
    },

    // ==========================================
    // --- LOGIKA DRAG & DROP FLOATING PANEL ---
    // ==========================================
    dragStateFam: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    startDragFam(e, elementId) {
        if (e.button !== 0) return; // Abaikan klik kanan
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateFam.isDragging = true;
        this.dragStateFam.el = el;
        this.dragStateFam.startX = e.clientX;
        this.dragStateFam.startY = e.clientY;

        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            el.classList.remove('bottom-6', 'right-6'); 
        }

        el.style.transition = 'none';

        document.onmouseup = () => app.stopDragFam();
        document.onmousemove = (e) => app.dragFam(e);
    },

    dragFam(e) {
        if (!this.dragStateFam.isDragging || !this.dragStateFam.el) return;
        e.preventDefault();

        const el = this.dragStateFam.el;

        const dx = e.clientX - this.dragStateFam.startX;
        const dy = e.clientY - this.dragStateFam.startY;

        this.dragStateFam.startX = e.clientX;
        this.dragStateFam.startY = e.clientY;

        let newLeft = el.offsetLeft + dx;
        let newTop = el.offsetTop + dy;

        if (newLeft < 0) newLeft = 0;
        const maxLeft = window.innerWidth - el.offsetWidth;
        if (newLeft > maxLeft) newLeft = maxLeft;
        
        const topOffset = 0; 
        if (newTop < topOffset) newTop = topOffset;
        const maxTop = window.innerHeight - el.offsetHeight;
        if (newTop > maxTop) newTop = maxTop;

        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
    },

    stopDragFam() {
        if (this.dragStateFam.el) {
            this.dragStateFam.el.style.transition = '';
        }
        this.dragStateFam.isDragging = false;
        this.dragStateFam.el = null;
        
        document.onmouseup = null;
        document.onmousemove = null;
    }
}