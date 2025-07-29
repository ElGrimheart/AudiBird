import db from "../config/db-conn.js";

export async function getSpeciesCodeByName(commonName, scientificName) {
    const sql = `
        SELECT species_code
        FROM taxonomy
        WHERE LOWER(common_name) = LOWER($1) OR LOWER(scientific_name) = LOWER($2)
        LIMIT 1
    `;

    const result = await db.query(sql, [commonName, scientificName]);
    return result.rows[0]?.species_code || null;
}