// Menggabungkan semua modul item

import { ItemView } from './ItemView.js';
import { ItemForm } from './ItemForm.js';
import { ItemTag } from './ItemTag.js';
import { ItemFloating } from './ItemFloating.js';
import { ItemExport } from './ItemExport.js';

export const ItemModule = {
    // Gabungkan semua method dan state menggunakan Spread Operator (...)
    ...ItemView,
    ...ItemForm,
    ...ItemTag,
    ...ItemFloating,
    ...ItemExport
};