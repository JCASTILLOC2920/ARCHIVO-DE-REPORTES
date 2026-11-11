import { capSchemasDigestivo } from './cap_digestivo.js';
import { capSchemasGynEndocrine } from './cap_gyn_endocrine.js';
import { liverSchemas } from './cap_liver.js';
import { urologySchemas } from './cap_urology.js';

export const MasterCAPSchemas = {
    ...capSchemasDigestivo,
    ...capSchemasGynEndocrine,
    ...liverSchemas,
    ...urologySchemas
};
