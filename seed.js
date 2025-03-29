const { Client } = require('pg');
const fs = require('fs').promises;


// DB_HOST=postgres
// DB_PORT=5432
// DB_USERNAME=admin
// DB_PASSWORD=admin
// DB_NAME=marketmind

async function dumpData() {
  // Set up PostgreSQL connection details (update these values)
  const client = new Client({
    user: 'admin',
    host: 'postgres',
    database: 'marketmind',
    password: 'admin',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Read the JSON file with your transformed data.
    // This file should contain an array of records with keys:
    // id, symbol, name, exchange, sector, industry, website, description, logo
    const data = JSON.parse(await fs.readFile('companies_converted.json', 'utf8'));
    console.log(`Read ${data.length} records from JSON file.`);

    // Optionally, begin a transaction for bulk insertion.
    await client.query('BEGIN');

    // Loop through each record and insert into the "stocks" table.
    for (const record of data) {
      const queryText = `
        INSERT INTO stocks (id, symbol, name, exchange, sector, industry, website, description, logo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (symbol) DO NOTHING;
      `;
      const values = [
        record.id,
        record.symbol,
        record.name,
        record.exchange,
        record.sector,
        record.industry,
        record.website,
        record.description,
        record.logo
      ];

      await client.query(queryText, values);
    }

    // Commit the transaction.
    await client.query('COMMIT');
    console.log('Data inserted successfully!');
  } catch (error) {
    // Roll back the transaction if any error occurs.
    await client.query('ROLLBACK');
    console.error('Error inserting data:', error);
  } finally {
    // Close the database connection.
    await client.end();
    console.log('Disconnected from PostgreSQL');
  }
}

dumpData();
