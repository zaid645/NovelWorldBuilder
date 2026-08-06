
export const CalendarModule = {
    currentDate: new Date(),selectedDateStr: null, // Format YYYY-MM-DDsearchQuery: '',// --- INISIALISASI ---
    initCalendar() {
        if (this.data && !this.data.calendarEvents) {
            this.data.calendarEvents = [];
        }
        this.renderCalendar();
        this.setupEventListeners();
    },

    renderCalendarView() {
        if (this.data && !this.data.calendarEvents) {
            this.data.calendarEvents = [];
        }
        setTimeout(() => this.renderCalendar(), 0);
        return `<div id="calendar-view" class="w-full h-full"></div>`;
    },

    // --- RENDER UTAMA ---
    renderCalendar() {
        const container = document.getElementById('calendar-view');
        if (!container) return;

        if (!this.data) this.data = {};
        if (!this.data.calendarEvents) this.data.calendarEvents = [];

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        container.innerHTML = `
            <div class="p-6 max-w-7xl mx-auto space-y-6">
                <!-- Header Navigasi Kalender -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
                    <div class="flex items-center space-x-2 md:space-x-3">
                        <button id="btnPrevMonth" class="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition" title="Bulan Sebelumnya">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        
                        <!-- Navigasi Bulan & Input Tahun Cepat -->
                        <div class="flex items-center space-x-2">
                            <span class="text-xl font-bold text-white tracking-wide min-w-[100px] text-center">${monthNames[month]}</span>
                            <input type="number" id="calYearInput" value="${year}" min="1" max="9999" 
                                class="w-20 bg-slate-900 border border-slate-700 text-slate-100 font-bold text-center rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-500" 
                                title="Ketik tahun untuk berpindah cepat">
                        </div>

                        <button id="btnNextMonth" class="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition" title="Bulan Berikutnya">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                        
                        <button id="btnToday" class="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition ml-2">
                            Hari Ini
                        </button>
                    </div>

                    <!-- Kolom Pencarian -->
                    <div class="flex items-center">
                        <input type="text" id="calSearchInput" placeholder="Cari catatan..." value="${this.searchQuery}"
                            class="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full md:w-64">
                    </div>
                </div>

                <!-- Layout Utama: Grid Kalender + Sidebar Agenda -->
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Grid Kalender -->
                    <div class="lg:col-span-3 bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700 shadow-lg">
                        <div class="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
                            <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
                        </div>
                        
                        <div id="calendarGrid" class="grid grid-cols-7 gap-1 md:gap-2 auto-rows-fr">
                            ${this.generateDaysGrid(year, month)}
                        </div>
                    </div>

                    <!-- Panel Samping: Agenda Bulan Ini -->
                    <div class="lg:col-span-1 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[550px]">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-700 mb-3">
                            <h3 class="font-semibold text-slate-200 text-sm">Agenda Bulan Ini</h3>
                            <span id="monthlyEventCount" class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                                ${this.getEventsForMonth(year, month).length} Note
                            </span>
                        </div>
                        <div id="monthlyEventList" class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            ${this.renderMonthlyEventList(year, month)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Form Catatan -->
            <div id="calendarModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                <div class="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                    <div class="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-850">
                        <h3 id="modalTitle" class="font-bold text-slate-100">Tambah Catatan Perencanaan</h3>
                        <button id="btnCloseModal" class="text-slate-400 hover:text-white">&times;</button>
                    </div>
                    <form id="calendarForm" class="p-4 space-y-4">
                        <input type="hidden" id="evtId">
                        
                        <div>
                            <label class="block text-xs font-medium text-slate-400 mb-1">Tanggal</label>
                            <input type="date" id="evtDate" required class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-slate-400 mb-1">Judul / Ringkasan Event</label>
                            <input type="text" id="evtTitle" placeholder="misal: Pertempuran Benteng Utara" required class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-slate-400 mb-1">Catatan Detail / Draf</label>
                            <textarea id="evtDescription" rows="4" placeholder="Detail peristiwa, poin utama, atau garis besar adegan..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"></textarea>
                        </div>

                        <div class="flex justify-between items-center pt-3 border-t border-slate-700">
                            <button type="button" id="btnDeleteEvt" class="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs transition hidden">Hapus</button>
                            <div class="flex space-x-2 ml-auto">
                                <button type="button" id="btnCancelModal" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition">Batal</button>
                                <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">Simpan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.attachDynamicListeners();
    },

    // --- LOGIKA MENGENERATE GRID TANGGAL ---
    generateDaysGrid(year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        let startDayIndex = firstDayOfMonth.getDay() - 1;
        if (startDayIndex === -1) startDayIndex = 6;

        const today = new Date();
        const todayStr = this.formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

        let html = '';

        for (let i = 0; i < startDayIndex; i++) {
            html += `<div class="bg-slate-900/40 rounded-lg border border-slate-800/50 min-h-[90px] p-1"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateStr(year, month, day);
            const isToday = dateStr === todayStr;
            const events = this.getEventsForDate(dateStr);

            html += `
                <div data-date="${dateStr}" class="day-cell cursor-pointer bg-slate-900/90 hover:bg-slate-750 transition rounded-lg border ${isToday ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-700/60'} min-h-[90px] p-1.5 flex flex-col justify-between group">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold ${isToday ? 'bg-indigo-600 text-white px-1.5 py-0.5 rounded-full' : 'text-slate-400 group-hover:text-slate-200'}">
                            ${day}
                        </span>
                        ${events.length > 0 ? `<span class="w-2 h-2 rounded-full bg-indigo-400"></span>` : ''}
                    </div>

                    <div class="space-y-1 mt-1 overflow-hidden flex-1">
                        ${events.slice(0, 2).map(evt => `
                            <div class="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-600/80 text-slate-100 font-medium" title="${evt.title}">
                                ${evt.title}
                            </div>
                        `).join('')}
                        ${events.length > 2 ? `<div class="text-[9px] text-slate-400 font-mono text-center">+${events.length - 2} lagi</div>` : ''}
                    </div>
                </div>
            `;
        }

        return html;
    },

    // --- RENDER AGENDA BULANAN DI SIDEBAR ---
    renderMonthlyEventList(year, month) {
        const events = this.getEventsForMonth(year, month);

        if (events.length === 0) {
            return `<div class="text-xs text-slate-500 italic text-center py-8">Belum ada perencanaan di bulan ini. Klik tanggal pada kalender untuk membuat catatan baru.</div>`;
        }

        return events.map(evt => {
            const dateObj = new Date(evt.date);
            const dateDisplay = `${dateObj.getDate()} ${dateObj.toLocaleDateString('id-ID', { month: 'short' })}`;

            return `
                <div data-id="${evt.id}" class="evt-item p-2.5 bg-slate-900 hover:bg-slate-750 rounded-lg border border-slate-700/80 cursor-pointer transition group">
                    <div class="flex justify-between items-center mb-1">
                        <h4 class="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate">${evt.title}</h4>
                        <span class="text-[10px] text-slate-400 font-mono shrink-0 ml-2">${dateDisplay}</span>
                    </div>
                    ${evt.description ? `<p class="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">${evt.description}</p>` : ''}
                </div>
            `;
        }).join('');
    },

    setupEventListeners() {},

    // --- UPDATE HASIL PENCARIAN SECARA LOKAL (TANPA RE-RENDER INPUT PENCARIAN) ---
    updateFilteredView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const gridEl = document.getElementById('calendarGrid');
        if (gridEl) gridEl.innerHTML = this.generateDaysGrid(year, month);

        const listEl = document.getElementById('monthlyEventList');
        if (listEl) listEl.innerHTML = this.renderMonthlyEventList(year, month);

        const countEl = document.getElementById('monthlyEventCount');
        if (countEl) countEl.innerText = `${this.getEventsForMonth(year, month).length} Note`;

        this.attachInteractiveListeners();
    },

    attachDynamicListeners() {
        const container = document.getElementById('calendar-view');
        if (!container) return;

        // Navigasi Bulan
        container.querySelector('#btnPrevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        container.querySelector('#btnNextMonth')?.addEventListener('click', () => this.changeMonth(1));
        container.querySelector('#btnToday')?.addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        // Fast Year Change Listener
        container.querySelector('#calYearInput')?.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1) {
                this.currentDate.setFullYear(val);
                this.renderCalendar();
            }
        });

        // Real-time Search tanpa Re-rendering Header
        container.querySelector('#calSearchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.updateFilteredView();
        });

        // Event listener interaktif grid & list
        this.attachInteractiveListeners();

        // Form Event Modal
        const modal = container.querySelector('#calendarModal');
        container.querySelector('#btnCloseModal')?.addEventListener('click', () => modal.classList.add('hidden'));
        container.querySelector('#btnCancelModal')?.addEventListener('click', () => modal.classList.add('hidden'));

        const form = container.querySelector('#calendarForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEventFromForm();
            modal.classList.add('hidden');
        });

        container.querySelector('#btnDeleteEvt')?.addEventListener('click', () => {
        const id = container.querySelector('#evtId').value;
        if (!id) return;

        this.showCustomModal({
            title: "Hapus Catatan Perencanaan",
            content: `
                <div class="space-y-2 text-left">
                    <p class="text-sm text-slate-300">Apakah Anda yakin ingin menghapus catatan perencanaan ini?</p>
                    <p class="text-xs text-rose-400/80 italic">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
            `,
            confirmText: "Hapus Catatan",
            confirmColor: "bg-rose-600 hover:bg-rose-500 text-white",
            onConfirm: () => {
                this.deleteEvent(id);
                modal.classList.add('hidden');
                return true;
            }
        });
    });
    },

    attachInteractiveListeners() {
        const container = document.getElementById('calendar-view');
        if (!container) return;

        // Klik Sel Tanggal
        container.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const dateStr = cell.getAttribute('data-date');
                this.openModalForAdd(dateStr);
            });
        });

        // Klik Catatan di Sidebar
        container.querySelectorAll('.evt-item').forEach(item => {
            item.addEventListener('click', () => {
                const evtId = item.getAttribute('data-id');
                this.openModalForEdit(evtId);
            });
        });
    },

    // --- AKSI MODAL & CRUD ---
    openModalForAdd(dateStr) {
        const container = document.getElementById('calendar-view');
        const modal = container.querySelector('#calendarModal');
        container.querySelector('#modalTitle').innerText = 'Tambah Catatan Perencanaan';
        container.querySelector('#evtId').value = '';
        container.querySelector('#evtDate').value = dateStr;
        container.querySelector('#evtTitle').value = '';
        container.querySelector('#evtDescription').value = '';
        container.querySelector('#btnDeleteEvt').classList.add('hidden');
        modal.classList.remove('hidden');
    },

    openModalForEdit(evtId) {
        const events = this.data.calendarEvents || [];
        const evt = events.find(e => e.id === evtId);
        if (!evt) return;

        const container = document.getElementById('calendar-view');
        const modal = container.querySelector('#calendarModal');
        container.querySelector('#modalTitle').innerText = 'Edit Catatan Perencanaan';
        container.querySelector('#evtId').value = evt.id;
        container.querySelector('#evtDate').value = evt.date;
        container.querySelector('#evtTitle').value = evt.title;
        container.querySelector('#evtDescription').value = evt.description || '';
        container.querySelector('#btnDeleteEvt').classList.remove('hidden');
        modal.classList.remove('hidden');
    },

    async saveEventFromForm() {
        const container = document.getElementById('calendar-view');
        const id = container.querySelector('#evtId').value;
        const date = container.querySelector('#evtDate').value;
        const title = container.querySelector('#evtTitle').value.trim();
        const description = container.querySelector('#evtDescription').value.trim();

        if (!title || !date) return;

        // Garansi objek data terinisialisasi
        if (!this.data) this.data = {};
        if (!this.data.calendarEvents) this.data.calendarEvents = [];

        if (id) {
            const index = this.data.calendarEvents.findIndex(e => e.id === id);
            if (index !== -1) {
                this.data.calendarEvents[index] = { ...this.data.calendarEvents[index], date, title, description };
            }
        } else {
            const newEvt = {
                id: 'evt_' + Math.random().toString(36).substr(2, 9),
                date,
                title,
                description,
                createdAt: new Date().toISOString()
            };
            this.data.calendarEvents.push(newEvt);
        }

        // Panggil saveData hanya jika fungsinya ada di modul/instance
        if (typeof this.saveData === 'function') {
            await this.saveData(true);
        }

        this.renderCalendar();
    },

    async deleteEvent(id) {
        if (!this.data || !this.data.calendarEvents) return;
        this.data.calendarEvents = this.data.calendarEvents.filter(e => e.id !== id);

        if (typeof this.saveData === 'function') {
            await this.saveData(true);
        }

        this.renderCalendar();
    },

    // --- HELPER METODE ---
    changeMonth(offset) {
        this.currentDate.setMonth(this.currentDate.getMonth() + offset);
        this.renderCalendar();
    },

    formatDateStr(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    },

    getEventsForDate(dateStr) {
        const events = (this.data && this.data.calendarEvents) ? this.data.calendarEvents : [];
        return events.filter(e => {
            const matchDate = e.date === dateStr;
            const matchSearch = !this.searchQuery || 
                (e.title && e.title.toLowerCase().includes(this.searchQuery)) || 
                (e.description && e.description.toLowerCase().includes(this.searchQuery));
            return matchDate && matchSearch;
        });
    },

    getEventsForMonth(year, month) {
        const events = (this.data && this.data.calendarEvents) ? this.data.calendarEvents : [];
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        return events.filter(e => {
            const matchMonth = e.date && e.date.startsWith(prefix);
            const matchSearch = !this.searchQuery || 
                (e.title && e.title.toLowerCase().includes(this.searchQuery)) || 
                (e.description && e.description.toLowerCase().includes(this.searchQuery));
            return matchMonth && matchSearch;
        }).sort((a, b) => a.date.localeCompare(b.date));
    }
};