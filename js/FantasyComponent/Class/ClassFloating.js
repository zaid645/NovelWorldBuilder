export const ClassFloating = {
    // State untuk drag & drop floating window
    dragStateClass: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    // ==========================================
    // --- FLOATING DETAIL WINDOW LOGIC ---
    // ==========================================

    showClassDetailFloating(id) {
        const classes = this.data?.classes || app.data?.classes || [];
        const cls = classes.find(c => c.id === id);
        if (!cls) return;

        document.getElementById('floatingClassTitle').innerText = `⚔️ ${cls.name}`;
        
        // Render Deskripsi
        let descHtml = cls.description || '<span class="italic text-slate-500">Tidak ada informasi deskripsi.</span>';
        
        // Render Skill yang ditautkan
        let skillsHtml = '';
        if (cls.skillIds && cls.skillIds.length > 0) {
            const allSkills = this.data?.skills || app.data?.skills || [];
            const linkedSkills = cls.skillIds.map(skillId => {
                const s = allSkills.find(sk => sk.id === skillId);
                return s ? `<span class="inline-block bg-yellow-900/50 text-yellow-400 text-[10px] px-2 py-1 rounded border border-yellow-700/50 mr-1 mb-1">${s.name}</span>` : '';
            }).join('');
            
            skillsHtml = `
                <div class="mt-3 pt-3 border-t border-slate-700">
                    <span class="font-semibold text-yellow-500 uppercase tracking-wider text-[10px] block mb-1">Skill & Kemampuan:</span>
                    <div class="flex flex-wrap">${linkedSkills}</div>
                </div>
            `;
        }

        document.getElementById('floatingClassDesc').innerHTML = descHtml + skillsHtml;
        document.getElementById('floatingClassDetail').classList.remove('hidden');
    },

    closeClassDetailFloating() {
        const el = document.getElementById('floatingClassDetail');
        if (el) el.classList.add('hidden');
    },

    // Drag & Drop Floating Window
    startDragClass(e, elementId) {
        if (e.button !== 0) return; // Hanya klik kiri
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateClass.isDragging = true;
        this.dragStateClass.el = el;
        this.dragStateClass.startX = e.clientX;
        this.dragStateClass.startY = e.clientY;

        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            el.classList.remove('bottom-6', 'right-6'); 
        }

        el.style.transition = 'none';

        document.onmouseup = () => app.stopDragClass();
        document.onmousemove = (e) => app.dragClass(e);
    },

    dragClass(e) {
        if (!this.dragStateClass.isDragging || !this.dragStateClass.el) return;
        e.preventDefault();

        const el = this.dragStateClass.el;
        const dx = e.clientX - this.dragStateClass.startX;
        const dy = e.clientY - this.dragStateClass.startY;

        this.dragStateClass.startX = e.clientX;
        this.dragStateClass.startY = e.clientY;

        let newLeft = el.offsetLeft + dx;
        let newTop = el.offsetTop + dy;

        // Viewport Boundaries
        if (newLeft < 0) newLeft = 0;
        const maxLeft = window.innerWidth - el.offsetWidth;
        if (newLeft > maxLeft) newLeft = maxLeft;

        if (newTop < 0) newTop = 0;
        const maxTop = window.innerHeight - el.offsetHeight;
        if (newTop > maxTop) newTop = maxTop;

        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
    },

    stopDragClass() {
        if (this.dragStateClass.el) {
            this.dragStateClass.el.style.transition = '';
        }
        this.dragStateClass.isDragging = false;
        this.dragStateClass.el = null;
        
        document.onmouseup = null;
        document.onmousemove = null;
    }
}