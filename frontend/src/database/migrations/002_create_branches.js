export const createBranchesTable = async db => {
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code INTEGER,
        description TEXT
      );`,
  );
};
