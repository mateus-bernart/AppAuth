export const getBranchesOffline = async db => {
  const [results] = await db.executeSql('SELECT * FROM branches');
  const branches = [];

  for (let i = 0; i < results.rows.length; i++) {
    branches.push(results.rows.item(i));
  }

  return branches;
};
