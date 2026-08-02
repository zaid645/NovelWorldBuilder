// Menggabungkan modul arc

import { ArcInfoExport } from "./ArcInfoExport.js"
import { ArcInfoShow } from "./ArcInfoShow.js"
import { ArcInfoFormArc } from "./ArcInfoFormArc.js"
import { ArcInfoFormSub } from "./ArcInfoFormSub.js"
import { ArcInfoFormAi } from "./ArcInfoFormAi.js"

export const ArcInfoModule = {
    ...ArcInfoExport,
    ...ArcInfoShow,
    ...ArcInfoFormArc,
    ...ArcInfoFormSub,
    ...ArcInfoFormAi
}