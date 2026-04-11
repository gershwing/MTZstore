// src/utils/httpFlags.js
export const asPlatform = (cfg = {}) => ({ ...cfg, omitTenantHeader: true });
