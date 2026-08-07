import { BasicUniverseShow } from "./BasicUniverseShow.js";
import { BasicUniverseExport } from "./BasicUniverseExport.js";
import { BasicUniverseExportJson } from "./BasicUniverseExportJson.js";
import { BasicUniverseExportMd } from "./BasicUniverseExportMd.js";
import { BasicUniverseExportPdf } from "./BasicUniverseExportPdf.js";

export const UniverseBasicModule = {
    ...BasicUniverseShow,
    ...BasicUniverseExport,
    ...BasicUniverseExportJson,
    ...BasicUniverseExportMd,
    ...BasicUniverseExportPdf
}