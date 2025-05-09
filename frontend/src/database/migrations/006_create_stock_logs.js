export const createStockLogsTable = async db => {
  await db.executeSql(
    `
      CREATE TABLE IF NOT EXISTS stock_logs
      (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      branch_id INTEGER,
      product_id INTEGER,
      old_quantity INTEGER,
      new_quantity INTEGER,
      quantity_change INTEGER,
      action TEXT,
      created_at TEXT,
      updated_at TEXT
      )
    `,
  );
};
