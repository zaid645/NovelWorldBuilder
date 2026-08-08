export const TitleFloating = {
    // State untuk drag & drop floating window
    dragStateTitle: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    // ==========================================
    // --- FLOATING DETAIL WINDOW LOGIC ---
    // ==========================================

    showTitleDetailFloating(id) {
        const titles = this.data?.titles || app.data?.titles || [];
        const titleData = titles.find(t => t.id === id);
        if (!titleData) return;

        document.getElementById('floatingTitleHeader').innerText = `🎖️ ${titleData.name}`;
        document.getElementById('floatingTitleDesc').innerHTML = titleData.description || '<span class="italic text-slate-500">Tidak ada informasi deskripsi.</span>';

        document.getElementById('floatingTitleDetail').classList.remove('hidden');
    },

    closeTitleDetailFloating() {
        const el = document.getElementById('floatingTitleDetail');
        if (el) el.classList.add('hidden');
    },

    // Drag & Drop Floating Window
    startDragTitle(e, elementId) {
        if (e.button !== 0) return; // Hanya klik kiri
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateTitle.isDragging = true;
        this.dragStateTitle.el = el;
        this.dragStateTitle.startX = e.clientX;
        this.dragStateTitle.startY = e.clientY;

        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            el.classList.remove('bottom-6', 'right-6'); 
        }

        el.style.transition = 'none';

        document.onmouseup = () => app.stopDragTitle();
        document.onmousemove = (e) => app.dragTitle(e);
    },

    dragTitle(e) {
        if (!this.dragStateTitle.isDragging || !this.dragStateTitle.el) return;
        e.preventDefault();

        const el = this.dragStateTitle.el;
        const dx = e.clientX - this.dragStateTitle.startX;
        const dy = e.clientY - this.dragStateTitle.startY;

        this.dragStateTitle.startX = e.clientX;
        this.dragStateTitle.startY = e.clientY;

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

    stopDragTitle() {
        if (this.dragStateTitle.el) {
            this.dragStateTitle.el.style.transition = '';
        }
        this.dragStateTitle.isDragging = false;
        this.dragStateTitle.el = null;
        
        document.onmouseup = null;
        document.onmousemove = null;
    }
}