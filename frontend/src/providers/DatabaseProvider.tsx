import {createContext, useContext, useEffect, useState} from 'react';
import SQLite from 'react-native-sqlite-storage';
import {runMigrations} from '../database/migrations/runMigrations';
import {saveBranchesOffline} from '../database/migrations/005_add_branches_to_branches_table';
import {Branch} from '../screens/Branches';
import {useAuth} from './AuthProvider';
import {ActivityIndicator, View} from 'react-native';
import {Text} from 'react-native-gesture-handler';

SQLite.enablePromise(true);

type DatabaseContextType = {
  db: SQLite.SQLiteDatabase;
  branches: Branch[];
};

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({children}) => {
  const [db, setDb] = useState(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const {isLoading} = useAuth();
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      initDatabase();
    }
  }, [isLoading]);

  const hasUnsyncedProducts = async (
    db: SQLite.SQLiteDatabase,
  ): Promise<boolean> => {
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
        console.log('❌ Error syncronizing the products', error);
      }
    };
    syncData();
  }, [db]);

  if (!db) return null;

  return (
    <DatabaseContext.Provider value={{db, branches}}>
      {loading || isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}>
          <ActivityIndicator size="large" color="green" />
          <Text style={{fontFamily: 'Poppins-Bold', fontSize: 16}}>
            Loading data
          </Text>
        </View>
      ) : (
        children
      )}
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
