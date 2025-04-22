export const createProductsTable = async db => {
  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    code INTEGER UNIQUE,
    price REAL,
    created_at TEXT,
    updated_at TEXT,
    synced INTEGER DEFAULT 0
  );
`);
};
