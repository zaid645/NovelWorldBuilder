// ==========================================
// --- IMPORT MODUL KOMPONEN ---
// ==========================================

// Helper
import { CustomModal } from './BackgroundWorker/CustomModal.js';
import { ManagerData } from './BackgroundWorker/ManagerData.js';
import { ManagerExportImportBasic } from './BackgroundWorker/ManagerExportImportBasic.js';
import { ManagerUiBasic } from './BackgroundWorker/ManagerUiBasic.js';
import { MdExportHelper } from './BackgroundWorker/MarkdownExportHelper.js';

// Header
import { NovelBasicInfoModule } from './HeaderMenu/NovelBasicInfo/NovelBasicInfo.js';
import { ArcInfoModule } from './HeaderMenu/ArcInfo/ArcInfo.js';
import { NovelWriterModule } from './HeaderMenu/NovelWriter/NovelWriter.js';
import { DataSharingModule } from './HeaderMenu/DataSharing.js';
import { AIEnchanterModule } from './HeaderMenu/AIEnchanter/AIEnchanter.js';
import { WatakListModule } from './HeaderMenu/WatakList.js';

// Fantasy Element
import { RaceModule } from './FantasyComponent/Race/Race.js';
import { SkillModule } from './FantasyComponent/Skill/Skill.js';
import { ItemModule } from './FantasyComponent/Item/Item.js';
import { PetModule } from './FantasyComponent/Pet/Pet.js';
import { DataCleaner } from './FantasyComponent/DataCleaner.js';

// Universe
import { UniverseBasicModule } from './UniverseComponent/BasicUniverse/BasicUniverse.js';
import { UniverseLoreModule } from './UniverseComponent/UniverseLore.js';
import { UniverseCharacterModule } from './UniverseComponent/UniverseCharacter/UniverseCharacter.js';
import { UniverseMonsterModule } from './UniverseComponent/UniverseMonster/UniverseMonster.js';
import { UniverseLocationModule } from './UniverseComponent/UniverseLocation/UniverseLocation.js';




// ==========================================
// --- CORE APPLICATION LOGIC ---
// ==========================================
const coreApp = {
    // Data utama yang akan diolah
    data: null,
    defaultData: null, // Data default dari DefaultData.json

    // State edit yang sedang aktif (untuk modal atau panel edit)
    editCharId: null,
    editSkillId: null,
    currentRaceFilter: null,
    currentSkillFilter: null,
    editItemId: null,
    currentItemFilter: null,
    editFamiliarId: null,
    currentFamiliarFilter: null,
    editArcId: null,       
    editSubArcId: null,

    async init() {
        // Tahan render sampai default data berhasil diambil
        await this.loadDefaultData();
        
        // Memuat database (Migrasi atau Load reguler)
        await this.loadData();
        
        this.setupAutoSave();
        this.renderSidebar();
        
        // Langsung arahkan tampilan pertama ke Informasi Dasar
        this.switchView('story-info'); 
        
        // Memastikan sidebar terbuka rapi pada resolusi komputer saat awal muat
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth >= 640) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.style.marginLeft = '0px';
        }
        
        // Tombol penutup sidebar khusus mode mobile
        document.getElementById('closeSidebarBtn').addEventListener('click', () => this.toggleSidebar(false));
        
        this.setupShortcuts();
    }
};


// ==========================================
// --- MERGE / PENGGABUNGAN ---
// ==========================================
window.app = Object.assign(
    {}, 
    coreApp,

    // Helper
    CustomModal,
    ManagerData,
    ManagerExportImportBasic,
    ManagerUiBasic,
    MdExportHelper,

    // Header
    NovelBasicInfoModule,
    NovelWriterModule,
    { NovelWriterModule},
    ArcInfoModule,
    AIEnchanterModule,
    WatakListModule,
    DataSharingModule,
    
    // Fantasy Element
    RaceModule,
    SkillModule,
    ItemModule,
    PetModule,
    DataCleaner,

    // Universe
    UniverseBasicModule,
    UniverseLoreModule,
    UniverseCharacterModule,
    UniverseMonsterModule,
    UniverseLocationModule
);

// Event Listeners Global
document.addEventListener('click', (e) => {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.add('hidden');
    }
});

// Initialize App saat DOM siap
window.onload = async () => {
    await window.app.init();
};
