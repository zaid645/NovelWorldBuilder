// Menggaubungkan semua modul skill

import { SkillExport } from "./SkillExport.js";
import { SkillForm } from "./SkillForm.js";
import { SkillFloating } from "./SkillFloating.js"
import { SkillTag } from "./SkillTag.js";
import { SkillView } from "./SkillView.js";

export const SkillModule = {
    // Gabungkan semua method dan state menggunakan Spread Operator (...)
    ...SkillExport,
    ...SkillForm,
    ...SkillFloating,
    ...SkillTag,
    ...SkillView
}