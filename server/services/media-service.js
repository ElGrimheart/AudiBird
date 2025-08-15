import db from "../config/db-conn.js";

// Retrieves the image and audio media links for a given species code
export async function getMediaBySpeciesCode(speciesCode) {
    const sql = `
        SELECT *
        FROM species_media
        WHERE species_code = $1
        LIMIT 1
    `;

    const result = await db.query(sql, [speciesCode]);
    
    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}

// Posts new media links for a species code, or updates existing image and audio URLs if they are empty
export async function postSpeciesMedia(speciesCode, imageUrl, imageRights, audioUrl, audioRights) {
    const sql = `
        INSERT INTO species_media (species_code, image_url, image_rights, audio_url, audio_rights)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (species_code) DO UPDATE
        SET 
            image_url = CASE
                WHEN species_media.image_url IS NULL THEN EXCLUDED.image_url
                ELSE species_media.image_url
            END,
            image_rights = CASE
                WHEN species_media.image_url IS NULL THEN EXCLUDED.image_rights
                ELSE species_media.image_rights
            END,
            audio_url = CASE
                WHEN species_media.audio_url IS NULL THEN EXCLUDED.audio_url
                ELSE species_media.audio_url
            END,
            audio_rights = CASE
                WHEN species_media.audio_url IS NULL THEN EXCLUDED.audio_rights
                ELSE species_media.audio_rights
            END
        RETURNING *
    `;

    const values = [speciesCode, imageUrl, imageRights, audioUrl, audioRights];

    const result = await db.query(sql, values);
    return result.rows[0];
}