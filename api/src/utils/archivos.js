// src/utils.js (o src/utils/archivos.js si prefieres más organizado)

/**
 * Limpia y normaliza un nombre de archivo:
 * - Convierte de latin1 a UTF-8
 * - Elimina tildes
 * - Reemplaza espacios y caracteres raros por "_"
 * - Convierte a minúsculas
 */
export function limpiarNombreArchivo(nombreOriginal) {
  const utf8Nombre = Buffer.from(nombreOriginal, "latin1").toString("utf8");

  return utf8Nombre
    .normalize("NFD") // separa tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .replace(/[^a-zA-Z0-9.-]/g, "_") // reemplaza caracteres especiales
    .replace(/_+/g, "_") // reduce múltiples guiones bajos
    .toLowerCase();
}
