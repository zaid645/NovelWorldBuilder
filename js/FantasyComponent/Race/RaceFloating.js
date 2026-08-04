export const RaceFloating = {
    // State untuk drag & drop floating window
    dragStateRace: {
        isDragging: false,
        startX: 0,
        startY: 0,
        el: null
    },

    

    // ==========================================
    // --- FLOATING DETAIL WINDOW LOGIC ---
    // ==========================================

    showRaceDetailFloating(id) {
        const races = this.data?.races || app.data?.races || [];
        const race = races.find(r => r.id === id);
        if (!race) return;

        document.getElementById('floatingRaceTitle').innerText = `🧬 ${race.name}`;
        document.getElementById('floatingRaceDesc').innerHTML = race.description || '<span class="italic text-slate-500">Tidak ada informasi deskripsi.</span>';

        document.getElementById('floatingRaceDetail').classList.remove('hidden');
    },

    closeRaceDetailFloating() {
        const el = document.getElementById('floatingRaceDetail');
        if (el) el.classList.add('hidden');
    },

    // Drag & Drop Floating Window
    startDragRace(e, elementId) {
        if (e.button !== 0) return; // Hanya klik kiri
        
        e.preventDefault();
        const el = document.getElementById(elementId);
        if (!el) return;

        this.dragStateRace.isDragging = true;
        this.dragStateRace.el = el;
        this.dragStateRace.startX = e.clientX;
        this.dragStateRace.startY = e.clientY;

        const rect = el.getBoundingClientRect();
        if (!el.style.left || !el.style.top) {
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            el.classList.remove('bottom-6', 'right-6'); 
        }

        el.style.transition = 'none';

        document.onmouseup = () => app.stopDragRace();
        document.onmousemove = (e) => app.dragRace(e);
    },

    dragRace(e) {
        if (!this.dragStateRace.isDragging || !this.dragStateRace.el) return;
        e.preventDefault();

        const el = this.dragStateRace.el;
        const dx = e.clientX - this.dragStateRace.startX;
        const dy = e.clientY - this.dragStateRace.startY;

        this.dragStateRace.startX = e.clientX;
        this.dragStateRace.startY = e.clientY;

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

    stopDragRace() {
        if (this.dragStateRace.el) {
            this.dragStateRace.el.style.transition = '';
        }
        this.dragStateRace.isDragging = false;
        this.dragStateRace.el = null;
        
        document.onmouseup = null;
        document.onmousemove = null;
    }
}