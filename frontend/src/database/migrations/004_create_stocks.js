export const createStocksTable = async db => {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      branch_id INTEGER,
      batch INTEGER,
      quantity INTEGER,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      UNIQUE (product_id, branch_id, batch)
    );
  `);
};
