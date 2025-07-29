import fs from 'fs/promises';

import { Pool } from 'pg';

const db = new Pool({
    user: "audibird_user",
    host: "localhost",
    database: "audibird_db",
    password: "audibird123",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

console.log('Database connection established');
console.log(db.user, db.host, db.database, db.password, db.port, db.max, db.idleTimeoutMillis, db.connectionTimeoutMillis);

async function getSpeciesArrayFromFile(jsonPath) {
    const file = await fs.readFile(jsonPath, 'utf-8');
    const taxonomy = JSON.parse(file);
    const speciesArray = [];

    for (const [key, value] of Object.entries(taxonomy)) {
        if (key.includes('_') && typeof value === 'string' && !value.includes('_')) {
            const [scientific_name, common_name] = key.split('_');
            const species_code = value;
            speciesArray.push({
                species_code,
                scientific_name,
                common_name
            });
        }
    }
    return speciesArray;
}

async function uploadTaxonomyData() {
    const speciesArray = await getSpeciesArrayFromFile('./sql/eBird_taxonomy_codes_2024E.json');
    const sql = `
        INSERT INTO taxonomy (species_code, scientific_name, common_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (species_code) DO NOTHING
    `;

    try {
        await db.query('BEGIN');

        for (const species of speciesArray) {
            const { species_code, scientific_name, common_name } = species;
            await db.query(sql, [species_code, scientific_name, common_name]);
        }

        await db.query('COMMIT');
        console.log('Taxonomy data uploaded successfully');
    } catch (error) {
        console.error('Error uploading taxonomy data:', error);
        await db.query('ROLLBACK');
    } finally {
        await db.end();
    }
}

uploadTaxonomyData().catch(console.error);