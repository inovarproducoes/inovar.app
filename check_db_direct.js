const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgress:inovarapp2025@easypanel.inovarapp.com:5433/inovar?sslmode=disable",
});

async function check() {
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tabelas encontradas no banco oficial:", res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error("Erro de conexão com o banco:", err.message);
  } finally {
    await client.end();
  }
}

check();
