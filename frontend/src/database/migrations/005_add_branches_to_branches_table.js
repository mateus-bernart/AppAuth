import {getBranchesOffline} from '../../helpers/databaseHelpers/getBranchesOffline';
import axiosInstance from '../../services/api';

export const saveBranchesOffline = async db => {
  try {
    const response = await axiosInstance.get('/branches');

    for (const branch of response.data) {
      await db.executeSql(
        `
          INSERT OR REPLACE INTO branches (id, code, description)
          VALUES (?,?,?)
        `,
        [branch.id, branch.code, branch.description],
      );
    }

    return response;
  } catch (error) {
    const offlineBranches = await getBranchesOffline(db);
    console.log(
      '❌ Offline or API error, loading branches from SQLITE...',
      error.response,
    );
    return offlineBranches;
  }
};
