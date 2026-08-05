import { NovelWriterAi } from "./NovelWriterAi.js";
import { NovelWriterForm } from "./NovelWriterForm.js";
import { NovelWriterHelper } from "./NovelWriterHelper.js";
import { NovelWriterShow } from "./NovelWriterShow.js";

export const NovelWriterModule = {
    ...NovelWriterAi,
    ...NovelWriterForm,
    ...NovelWriterHelper,
    ...NovelWriterShow,

    initNovelWriter() {
        // 1. Ambil data tersimpan dari database ke state modul
        this.novelWriterLoadState();

        // 2. Tampilkan UI modul
        this.refreshUI();
    }
};


// BINDING KE WINDOW.APP UNTUK MENCEGAH REFERENCE ERROR
if (typeof window !== 'undefined') {
    window.app = window.app || {};
    window.app.NovelWriterModule = NovelWriterModule;
}