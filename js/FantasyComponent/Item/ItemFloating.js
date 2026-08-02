// Logika Window Floating Detail & Drag-Drop State

export const ItemFloating = {
    // ==========================================
    // --- LOGIKA TAMPILAN FLOATING PANEL ---
    // ==========================================
    showItemDetailFloating(id) {
        const item = this.data.items.find(i => i.id === id);
        if (!item) return;

        // Set judul dan deskripsi
        document.getElementById('floatingItemTitle').innerText = `🎒 ${item.name}`;
        document.getElementById('floatingItemApp').innerHTML = item.appearance || '<span class="italic text-slate-500">Tidak ada informasi penampilan.</span>';
        document.getElementById('floatingItemDesc').innerHTML = item.description || '<span class="italic text-slate-500">Tidak ada deskripsi efek.</span>';

        // Set Tag
        const resolvedTags = (item.tagIds || [])
            .map(id => this.data.itemTags.find(t => t.id === id))
            .filter(tag => tag !== undefined);

        resolvedTags.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        const tagHtml = resolvedTags.map(tag => {
            return `<span class="bg-cyan-900/60 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700/50">${tag.name}</span>`;
        }).join('');
        document.getElementById('floatingItemTags').innerHTML = tagHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded">Tanpa Tag</span>';

        // Set Skill
        const skillHtml = (item.skillIds || []).map(id => {
            const skill = this.data.skills.find(s => s.id === id);
            return skill ? `<span class="bg-yellow-900/60 text-yellow-300 text-[10px] px-2 py-0.5 rounded border border-yellow-700/50">✨ ${skill.name}</span>` : '';
        }).join('');
        document.getElementById('floatingItemSkills').innerHTML = skillHtml || '<span class="text-[10px] text-slate-500 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-700/50">Tidak ada skill tertaut</span>';

        // Tampilkan panel
        document.getElementById('floatingItemDetail').classList.remove('hidden');
    },

    closeItemDetailFloating() {
        document.getElementById('floatingItemDetail').classList.add('hidden');
    },

    // ==========================================
    // --- LOGIKA DRAG & DROP FLOATING PANEL ---
    // ==========================================
    dragStateItem: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    startDragItem(e, elementId) {
        if (e.button !== 0) return; // Abaikan klik kanan
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateItem.isDragging = true;
        this.dragStateItem.el = el;
        this.dragStateItem.startX = e.clientX;
        this.dragStateItem.startY = e.clientY;

        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            el.classList.remove('bottom-6', 'right-6'); 
        }

        el.style.transition = 'none';

        document.onmouseup = () => this.stopDragItem();
        document.onmousemove = (e) => this.dragItem(e);
    },

    dragItem(e) {
        if (!this.dragStateItem.isDragging || !this.dragStateItem.el) return;
        e.preventDefault();

        const el = this.dragStateItem.el;

        const dx = e.clientX - this.dragStateItem.startX;
        const dy = e.clientY - this.dragStateItem.startY;

        this.dragStateItem.startX = e.clientX;
        this.dragStateItem.startY = e.clientY;

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

    stopDragItem() {
        if (this.dragStateItem.el) {
            this.dragStateItem.el.style.transition = '';
        }
        this.dragStateItem.isDragging = false;
        this.dragStateItem.el = null;
        
        document.onmouseup = null;
        document.onmousemove = null;
    }
}