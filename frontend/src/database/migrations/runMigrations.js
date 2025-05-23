import {createProductsTable} from './001_create_products';
import {createBranchesTable} from './002_create_branches';
import {createUsersTable} from './003_create_users';
import {createStocksTable} from './004_create_stocks';
import {createStockLogsTable} from './006_create_stock_logs';

export const runMigrations = async db => {
  await createProductsTable(db);
  await createUsersTable(db);
  await createBranchesTable(db);
  await createStocksTable(db);
  await createStockLogsTable(db);
};
