// Menggabungkan modul NovelBasicInfo

import { NovelBasicInfoExport } from "./NovelBasicInfoExport.js"
import { NovelBasicInfoExportJson } from "./NovelBasicInfoExportJson.js"
import { NovelBasicInfoExportMd } from "./NovelBasicInfoExportMd.js"
import { NovelBasicInfoForm } from "./NovelBasicInfoForm.js"
import { NovelBasicInfoShow } from "./NovelBasicInfoShow.js"

export const NovelBasicInfoModule = {
    ...NovelBasicInfoExport,
    ...NovelBasicInfoExportJson,
    ...NovelBasicInfoExportMd,
    ...NovelBasicInfoForm,
    ...NovelBasicInfoShow
}