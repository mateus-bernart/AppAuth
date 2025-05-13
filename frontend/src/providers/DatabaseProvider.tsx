import {createContext, useContext, useEffect, useState} from 'react';
import SQLite from 'react-native-sqlite-storage';
import {runMigrations} from '../database/migrations/runMigrations';
import {saveBranchesOffline} from '../database/migrations/005_add_branches_to_branches_table';
import {Branch} from '../screens/Branches';

SQLite.enablePromise(true);

type DatabaseContextType = {
  db: SQLite.SQliteDatabase;
  branches: Branch[];
};

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({children}) => {
  const [db, setDb] = useState(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabase({
          name: 'myapp.db',
          location: 'default',
        });

        console.log('✅ Database opened successfully!');
        setDb(database);

        await runMigrations(database);
        console.log('✅ Tables created successfully');

        //Load Branches, Products... OFFLINE
        const resultBranches = await saveBranchesOffline(database);
        const branches = Array.isArray(resultBranches)
          ? resultBranches
          : resultBranches.data || [];
        setBranches(branches);
        console.log('✅ Branches loaded successfully');
      } catch (error) {
        console.log('❌ Error initializing database: ', error);
      }
    };
    initDatabase();
  }, []);

  const hasUnsyncedProducts = async db => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          `
            SELECT COUNT(*) AS total FROM stocks WHERE synced = 0
          `,
          [],
          (_, {rows}) => {
            const total = rows.item(0).total;
            resolve(total > 0);
          },
        );
      });
    });
  };

  useEffect(() => {
    if (!db) return;
    const syncData = async () => {
      try {
        const shouldSync = await hasUnsyncedProducts(db);
        if (!shouldSync) return;
        // await syncProducts(db);
        console.log('✅ Products syncronized successfully');
      } catch (error) {
        console.log('❌ Error syncronizing the products');
      }
    };
    syncData();
  }, [db]);

  if (!db) return null;

  return (
    <DatabaseContext.Provider value={{db, branches}}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase precisa estar dentro do DatabaseProvider');
  }
  return context;
};
