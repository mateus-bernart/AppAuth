import {createContext, useContext, useEffect, useState} from 'react';
import SQLite from 'react-native-sqlite-storage';
import {runMigrations} from '../database/migrations/runMigrations';
import {saveBranchesOffline} from '../database/migrations/005_add_branches_to_branches_table';

SQLite.enablePromise(true);

type DatabaseContextType = {
  db: SQLite.SQliteDatabase;
  branches: any[];
};

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({children}) => {
  const [db, setDb] = useState(null);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabase({
          name: 'myapp.db',
          location: 'default',
        });

        console.log('✅ Banco de dados aberto com sucesso!');
        setDb(database);

        await runMigrations(database);
        console.log('✅ Tabela criada/verificada com sucesso');

        const result = await saveBranchesOffline(database);
        const branches = Array.isArray(result) ? result : result.data || [];
        setBranches(branches);
        console.log('✅ Branches carregadas com sucesso');
      } catch (error) {
        console.log('❌ Erro ao inicializar o banco de dados: ', error);
      }
    };
    initDatabase();
  }, []);

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
