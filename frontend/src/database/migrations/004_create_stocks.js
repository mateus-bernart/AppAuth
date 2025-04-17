export const createStocksTable = async db => {
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS stock_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      quantity_change INTEGER,
      created_at TEXT,
      synced INTEGER DEFAULT 0
    );`,
  );
};
