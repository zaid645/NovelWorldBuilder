// Menggabungkan semua modul pet

import { PetFloating } from "./PetFloating.js";
import { PetForm } from "./PetForm.js";
import { PetTag } from "./PetTag.js";
import { PetView } from "./PetView.js";
import { PetExport } from "./PetExport.js";

export const PetModule = {
    // Gabungkan semua method dan state menggunakan Spread Operator (...)
    ...PetFloating,
    ...PetForm,
    ...PetTag,
    ...PetView,
    ...PetExport
}