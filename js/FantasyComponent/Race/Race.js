/**
 * RaceModule
 * Mengelola master daftar Ras (Species/Race) dalam semesta cerita.
 * Terdiri dari ID unik, Nama, dan Deskripsi Ras.
 */

import { RaceFloating } from "./RaceFloating.js";
import { RaceForm } from "./RaceForm.js";
import { RaceView } from "./RaceView.js";

export const RaceModule = {
    ...RaceFloating,
    ...RaceForm,
    ...RaceView
};