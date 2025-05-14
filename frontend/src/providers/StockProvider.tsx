import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {getUnsyncedStockCount} from '../helpers/databaseHelpers/stockProduct';
import {useDatabase} from './DatabaseProvider';

type StockContextType = {
  unsyncedCount: number;
  refreshStockCount: () => Promise<void>;
};

const StockContext = createContext<StockContextType>({
  unsyncedCount: 0,
  refreshStockCount: async () => {},
});

export const StockProvider = ({children}: {children: ReactNode}) => {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const {db} = useDatabase();

  const refreshStockCount = async () => {
    const count = await getUnsyncedStockCount(db);
    setUnsyncedCount(count);
  };

  useEffect(() => {
    refreshStockCount();
  }, []);

  return (
    <StockContext.Provider value={{unsyncedCount, refreshStockCount}}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
