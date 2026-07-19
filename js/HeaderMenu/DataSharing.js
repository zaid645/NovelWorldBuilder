/**
 * DataSharingModule
 * Mengelola transfer master data P2P melalui PeerJS di jaringan WiFi lokal.
 * Alur: Penerima memunculkan PIN -> Pengirim memasukkan PIN Penerima.
 */

export const DataSharingModule = {
    // Objek PeerJS dan State Internal
    peer: null,
    connection: null,
    receivedDataTemp: null,
    myPin: '------',
    currentMode: null, // 'send' atau 'receive'

    // ==========================================
    // --- RENDER VIEW UTAMA ---
    // ==========================================
    renderSharingView() {
        return `
            <div class="flex flex-col gap-6 relative">
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg p-6">
                    <div class="border-b border-slate-700 pb-4 mb-6 flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-slate-200 text-lg flex items-center gap-2">
                                📡 Berbagi Data Jaringan Lokal (P2P)
                            </h3>
                            <p class="text-xs text-slate-400 mt-1">Kirim data antar perangkat secara instan tanpa melalui server cloud.</p>
                        </div>
                        <!-- Tombol Kembali jika sudah masuk ke salah satu mode -->
                        <button id="btnBackMode" onclick="app.changeMode('back')" class="hidden text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded border border-slate-600 text-slate-200 transition">
                            ⬅️ Ganti Mode
                        </button>
                    </div>

                    <!-- AREA 1: PEMILIHAN MODE AWAL -->
                    <div id="selectionArea" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onclick="app.changeMode('send')" class="bg-slate-900/40 hover:bg-slate-900/80 p-6 rounded-lg border border-slate-700 border-dashed text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group">
                            <span class="text-3xl group-hover:scale-110 transition-transform">📤</span>
                            <h4 class="font-bold text-indigo-400 text-base">Saya Ingin Kirim Data</h4>
                            <p class="text-xs text-slate-400 max-w-xs">Pilih ini jika data di perangkat ini adalah data terbaru yang ingin disalin ke perangkat lain.</p>
                        </div>
                        <div onclick="app.changeMode('receive')" class="bg-slate-900/40 hover:bg-slate-900/80 p-6 rounded-lg border border-slate-700 border-dashed text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group">
                            <span class="text-3xl group-hover:scale-110 transition-transform">📥</span>
                            <h4 class="font-bold text-amber-400 text-base">Saya Ingin Terima Data</h4>
                            <p class="text-xs text-slate-400 max-w-xs">Pilih ini untuk memunculkan PIN koneksi agar perangkat pengirim bisa terhubung.</p>
                        </div>
                    </div>

                    <!-- AREA 2: MODE PENGIRIM (HANYA INPUT PIN TARGET) -->
                    <div class="space-y-6 hidden" id="senderArea">
                        <div class="bg-slate-900/60 p-6 rounded-lg border border-indigo-500/30 max-w-md mx-auto text-center space-y-4">
                            <h4 class="font-bold text-indigo-400 text-base flex justify-center items-center gap-2">📤 Mode Kirim Aktif</h4>
                            
                            <div class="border-t border-slate-700/60 pt-4 space-y-3">
                                <label class="text-xs font-semibold text-slate-300 block">Masukkan 6-Digit PIN Penerima:</label>
                                <input type="text" id="targetReceiverPin" placeholder="000000" maxlength="6" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-center text-2xl text-indigo-400 font-mono tracking-widest focus:outline-none focus:border-indigo-500 font-bold">
                                <button onclick="app.connectAsSender()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-md">
                                    Hubungkan & Kirim Data
                                </button>
                                <p class="text-[10px] text-slate-400 pt-1">Silakan lihat layar perangkat penerima untuk mendapatkan kode PIN mereka.</p>
                            </div>
                        </div>
                    </div>

                    <!-- AREA 3: MODE PENERIMA (HANYA MENAMPILKAN PIN SENDIRI) -->
                    <div class="space-y-6 hidden" id="receiverArea">
                        <div class="bg-slate-900/60 p-6 rounded-lg border border-amber-500/30 max-w-md mx-auto text-center space-y-4">
                            <h4 class="font-bold text-amber-400 text-base flex justify-center items-center gap-2">📥 Mode Terima Aktif</h4>
                            
                            <div class="py-2">
                                <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">PIN Perangkat Anda</label>
                                <h2 id="myReceiverPin" class="text-5xl font-mono font-black text-amber-500 tracking-widest py-3 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">${this.myPin}</h2>
                            </div>

                            <div class="border-t border-slate-700/60 pt-3">
                                <p class="text-xs text-slate-300 flex items-center justify-center gap-2 animate-pulse">
                                    Tunggu beberapa saat bila pin belum muncul
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- WINDOW MODAL EKSKLUSIF: KONFIRMASI TIMPA DATA -->
                <div id="confirmOverwriteArea" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
                    <div class="bg-slate-900 border border-slate-700 max-w-md w-full rounded-xl shadow-2xl overflow-hidden transform transition-all p-6 space-y-5">
                        <div class="flex items-center space-x-3 text-rose-500">
                            <span class="text-3xl">⚠️</span>
                            <h4 class="font-black text-slate-200 text-lg tracking-wide">Konfirmasi Hapus & Timpa Data</h4>
                        </div>
                        
                        <p class="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/80">
                            Data baru dari jaringan lokal berhasil masuk! Menyetujui proses ini akan <strong class="text-rose-400">menimpa dan menghapus seluruh database cerita Anda saat ini</strong> di perangkat ini secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        
                        <div class="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                            <button onclick="document.getElementById('confirmOverwriteArea').classList.add('hidden'); app.receivedDataTemp = null;" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition">
                                Batal
                            </button>
                            <button onclick="app.executeDataOverwrite()" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-rose-900/30">
                                Ya, Timpa Semua Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // --- UI CONTROLLER & FOCUS MANAGEMENT ---
    // ==========================================
    changeMode(mode) {
        const selectionArea = document.getElementById('selectionArea');
        const senderArea = document.getElementById('senderArea');
        const receiverArea = document.getElementById('receiverArea');
        const btnBackMode = document.getElementById('btnBackMode');

        if (!selectionArea || !senderArea || !receiverArea || !btnBackMode) return;

        if (mode === 'back') {
            this.currentMode = null;
            selectionArea.classList.remove('hidden');
            senderArea.classList.add('hidden');
            receiverArea.classList.add('hidden');
            btnBackMode.classList.add('hidden');
            
            // Putuskan peer saat kembali agar resource bersih
            if (this.peer) {
                this.peer.destroy();
                this.peer = null;
            }
            if (this.connection) this.connection.close();
            return;
        }

        this.currentMode = mode;
        selectionArea.classList.add('hidden');
        btnBackMode.classList.remove('hidden');

        if (mode === 'send') {
            senderArea.classList.remove('hidden');
            receiverArea.classList.add('hidden');
            // Pengirim tidak perlu mempublikasikan PIN, PeerJS otomatis membuat ID acak di background
            this.initPeerConnection(false); 
        } else if (mode === 'receive') {
            receiverArea.classList.remove('hidden');
            senderArea.classList.add('hidden');
            // Penerima wajib mempublikasikan 6-digit PIN buatan sendiri
            this.initPeerConnection(true); 
        }
    },

    // ==========================================
    // --- PEERJS LOGIC (ASIMETRIS) ---
    // ==========================================
    initPeerConnection(isReceiver) {
        if (this.peer) return;

        if (isReceiver) {
            // Jika penerima, kita generate 6-digit PIN acak sebagai ID PeerJS kita
            const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
            this.peer = new window.Peer(randomPin);

            this.peer.on('open', (id) => {
                this.myPin = id;
                const elReceiver = document.getElementById('myReceiverPin');
                if (elReceiver) elReceiver.textContent = id;
            });
        } else {
            // Jika pengirim, biarkan PeerJS memberikan ID acak bawaan server (guid) karena tidak akan ditampilkan
            this.peer = new window.Peer();
        }

        // Menangani koneksi masuk (Hanya akan terjadi pada pihak Penerima)
        this.peer.on('connection', (conn) => {
            if (this.connection) {
                conn.close(); // Tolak jika sudah ada koneksi aktif
                return;
            }
            this.connection = conn;
            this.setupConnectionHandlers(conn);
        });

        this.peer.on('error', (err) => {
            console.error("[P2P Error]", err);
            this.showAlert(`Gagal memuat koneksi P2P: ${err.type}`, "error");
        });
    },

    connectAsSender() {
        const targetPin = document.getElementById('targetReceiverPin').value.trim();
        if (targetPin.length !== 6) return alert("Masukkan 6-digit PIN Penerima dengan benar!");

        this.showAlert(`Menghubungkan ke Penerima (${targetPin})...`, "info");
        
        // Menghubungkan ke PIN penerima
        const conn = this.peer.connect(targetPin, { reliable: true });
        this.connection = conn;
        this.setupConnectionHandlers(conn);
    },

    setupConnectionHandlers(conn) {
        conn.on('open', () => {
            this.showAlert("Perangkat Sukses Terhubung!", "success");
            
            // Jika pengirim sukses terhubung ke penerima, langsung otomatis push data master
            if (this.currentMode === 'send') {
                conn.send({
                    type: 'master-data-transfer',
                    payload: this.data // Mengambil data utama aplikasi Anda
                });
                this.showAlert("Data berhasil dikirim ke penerima!", "success");
            }
        });

        conn.on('data', (packet) => {
            // Pihak penerima akan mendeteksi data masuk di sini
            if (packet && packet.type === 'master-data-transfer') {
                const parsedJSON = packet.payload;
                
                if (parsedJSON && parsedJSON.metadata && parsedJSON.metadata.version) {
                    this.receivedDataTemp = parsedJSON;
                    
                    // MEMBUKA WINDOW MODAL EKSKLUSIF (LAYAR PENUH)
                    const confirmArea = document.getElementById('confirmOverwriteArea');
                    if (confirmArea) {
                        confirmArea.classList.remove('hidden');
                    }
                }
            }
        });

        conn.on('close', () => {
            console.log("[P2P] Koneksi terputus.");
            this.connection = null;
        });
    },

    executeDataOverwrite() {
        if (!this.receivedDataTemp) return;

        // Proses timpa data ke memori utama aplikasi
        this.data = this.receivedDataTemp;
        this.ensureStructure(this.data, this.defaultData);
        this.saveData();

        // Bersihkan data temporary & tutup modal eksklusif
        this.receivedDataTemp = null;
        document.getElementById('confirmOverwriteArea').classList.add('hidden');

        // Refresh UI & redirect ke halaman utama/dashboard info
        this.switchView('story-info');
        this.renderSidebar();
        this.showAlert("Sukses! Database cerita diperbarui sepenuhnya dari jaringan.", "success");
        
        // Putus koneksi agar kembali bersih semula
        this.changeMode('back');
    }
};