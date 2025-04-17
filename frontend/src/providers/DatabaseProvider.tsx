import {createContext, useContext, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import {runMigrations} from '../database/migrations/runMigrations';

SQLite.enablePromise(true);

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({children}) => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabase({
          name: 'myapp.db',
          location: 'default',
        });

        console.log('Banco de dados aberto com sucesso!');
        setDb(database);

        await runMigrations(database);

        console.log('Tabela criada/verificada com sucesso');
      } catch (error) {
        console.log('Erro ao inicializar o banco de dados: ', error);
      }
    };
    initDatabase();
  }, []);

  if (!db) return null;

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase precisa estar dentro do DatabaseProvider');
  }
  return context;
};
