import {StyleSheet, Text, View} from 'react-native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {storageDelete, storageGet, storageSet} from '../services/storage';

type UserType = 'employee' | 'manager' | 'regional_manager';

type Session = {
  userId: number;
  userName: string;
  userImage?: string;
  userType: UserType;
  isLogged: boolean;
};

type AuthContextProps = {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  startSession: (data: Session, token: string) => Promise<void>;
  endSession: () => void;
};

const AuthContext = createContext<AuthContextProps>({
  session: null,
  isLoading: true,
  isAuthenticated: true,
  startSession: () => Promise.resolve(),
  endSession: () => null,
});

const AuthProvider = ({children}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isAuthenticated = !!session;

  const startSession = async (data: Session, token: string): Promise<void> => {
    setIsLoading(true);
    try {
      await storageSet('AcessToken', token);
      await storageSet('UserData', JSON.stringify(data));

      setSession(data);
    } catch (error) {
      console.log(error.respone);
      endSession();
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = () => {
    setSession(null);
    storageDelete('UserData');
    storageDelete('AcessToken');
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await storageGet('AcessToken');
        const user = await storageGet('UserData');

        if (token && user) {
          await startSession(JSON.parse(user), token);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated,
        startSession,
        endSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  return context;
};

export default AuthProvider;
