export const createUsersTable = async db => {
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT,
      email TEXT,
      created_at TEXT,
      updated_at TEXT
    );`,
  );
};
